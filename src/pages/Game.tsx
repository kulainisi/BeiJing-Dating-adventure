import { useEffect, useReducer, useRef, useState } from 'react'
import {
  CharacterProfile,
  ChoiceDef,
  GameState,
  Line,
  MOODS,
  NodeDef,
  NpcState,
  Script,
  SKILLS,
  TOTAL_DAYS,
} from '@/engine/types'
import {
  advanceSlot,
  buildChatSession,
  buildDateSession,
  doRest,
  doWork,
  isGameOver,
  touchNpc,
  tryInvite,
} from '@/engine/game'
import { applyEffects, fateRoll, isAlive } from '@/engine/relations'
import { checkAllBlocked, settle } from '@/engine/endings'
import { CheckResult, performCheck } from '@/engine/checks'
import { pick, seedRng } from '@/engine/rng'
import { addDeath, addRun, clearRun, saveRun, unlockEnding } from '@/engine/save'
import { findEnding, findEvent, getCharacter, getCharacters, resolveDanmaku } from '@/content'
import { DanmakuLayer, DanmakuItem } from '@/components/Danmaku'
import { DiceRoll } from '@/components/DiceRoll'
import { EndingCard } from '@/components/EndingCard'

interface Session {
  script: Script
  npcId: string | null
  type: 'chat' | 'date' | 'event'
}

type Phase =
  | { t: 'hub' }
  | { t: 'list'; mode: 'chat' | 'date' }
  | { t: 'spot'; npcId: string }
  | { t: 'session'; sess: Session }
  | { t: 'ending'; id: string; npcId?: string; detail?: string }

const SCENE_BG: Record<string, { grad: string; emoji: string }> = {
  bar: { grad: 'linear-gradient(135deg,#4c1d95,#a21caf)', emoji: '🍸' },
  expo: { grad: 'linear-gradient(135deg,#1e3a8a,#0e7490)', emoji: '🎨' },
  dinner: { grad: 'linear-gradient(135deg,#7c2d12,#b45309)', emoji: '🍲' },
  walk: { grad: 'linear-gradient(135deg,#14532d,#0f766e)', emoji: '🏮' },
  sport: { grad: 'linear-gradient(135deg,#166534,#4d7c0f)', emoji: '🏃' },
  shop: { grad: 'linear-gradient(135deg,#831843,#be185d)', emoji: '🛍️' },
}

let danmakuId = 0

export function Game({ initial, onExit }: { initial: GameState; onExit: () => void }) {
  const stRef = useRef<GameState>(initial)
  const s = stRef.current
  const [, force] = useReducer((c) => c + 1, 0)
  const [phase, setPhase] = useState<Phase>(() =>
    s.ending
      ? { t: 'ending', id: s.ending.id, npcId: s.ending.npcId, detail: s.ending.detail }
      : { t: 'hub' },
  )
  const [danmaku, setDanmaku] = useState<DanmakuItem[]>([])
  const [toast, setToast] = useState('')
  const [favorFloat, setFavorFloat] = useState<{ id: number; text: string; good: boolean } | null>(null)
  const [armFeast, setArmFeast] = useState(false)
  const pendingEnding = useRef<{ id: string; npcId?: string; detail?: string } | null>(null)
  const toastTimer = useRef<number>(0)

  useEffect(() => {
    seedRng(((s.seed + s.day * 131 + Date.now()) % 2147483647) >>> 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function showToast(t: string) {
    setToast(t)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 3200)
  }

  function pushDanmaku(text: string) {
    const item: DanmakuItem = {
      id: ++danmakuId,
      text,
      top: 6 + Math.random() * 50,
      dur: 4.5 + Math.random() * 3,
    }
    setDanmaku((d) => [...d.slice(-10), item])
    window.setTimeout(() => setDanmaku((d) => d.filter((x) => x.id !== item.id)), item.dur * 1000 + 200)
  }

  function fireDanmaku(keys?: string[]) {
    const texts = resolveDanmaku(keys, pick)
    texts.forEach((t, i) => window.setTimeout(() => pushDanmaku(t), i * 500))
  }

  function showFavor(delta: number) {
    if (!delta) return
    setFavorFloat({ id: Date.now(), text: `${delta > 0 ? '+' : ''}${delta} 💗`, good: delta > 0 })
    window.setTimeout(() => setFavorFloat(null), 1400)
  }

  function endGame(id: string, npcId?: string, detail?: string) {
    s.ending = { id, npcId, detail }
    unlockEnding(id)
    addRun()
    clearRun()
    setPhase({ t: 'ending', id, npcId, detail })
  }

  function advance() {
    const adv = advanceSlot(s)
    const faded = adv.decay.filter((d) => d.kind === 'faded')
    for (const f of faded) {
      const reason = s.npcs[f.npcId].blockReason
      if (reason) addDeath(reason)
    }
    if (faded.length > 0) showToast('🕊️ 有人因为被你晾太久,悄悄删掉了你。')

    if (checkAllBlocked(s)) return endGame('all_blocked')
    if (isGameOver(s)) {
      const r = settle(s)
      return endGame(r.id, r.npcId, r.detail)
    }
    if (adv.eventId) {
      const ev = findEvent(adv.eventId)
      s.pendingEvent = undefined
      const sc = ev?.build(s)
      if (sc) {
        saveRun(s)
        setPhase({ t: 'session', sess: { script: sc, npcId: sc.npcId ?? null, type: 'event' } })
        force()
        return
      }
    }
    saveRun(s)
    setPhase({ t: 'hub' })
    force()
  }

  function finishSession(sess: Session) {
    let ended = pendingEnding.current
    pendingEnding.current = null

    if (sess.npcId && sess.type !== 'event') {
      touchNpc(s, sess.npcId)
      const npcSt = s.npcs[sess.npcId]
      if (!ended && isAlive(npcSt) && npcSt.stage !== 'confirmed') {
        const fate = fateRoll(s, npcSt)
        if (fate === 'win') {
          ended = { id: 'fate_win', npcId: sess.npcId }
        } else if (fate === 'ghost') {
          addDeath(npcSt.blockReason!)
          const name = getCharacter(s.version, sess.npcId).name
          showToast(`💨 ${name}的头像忽然灰了。没有争吵,没有理由。北京的风把TA吹走了。`)
          fireDanmaku(['#fate'])
        }
      }
    }

    if (ended) return endGame(ended.id, ended.npcId, ended.detail)
    if (checkAllBlocked(s)) return endGame('all_blocked')
    advance()
  }

  function startChat(profile: CharacterProfile) {
    const sc = buildChatSession(s, profile)
    setPhase({ t: 'session', sess: { script: sc, npcId: profile.id, type: 'chat' } })
  }

  function startDate(profile: CharacterProfile, spotIdx: number) {
    const spot = profile.dateSpots[spotIdx]
    const inv = tryInvite(s, profile, spot)
    if (!inv.accepted) {
      showToast(inv.line)
      setPhase({ t: 'hub' })
      force()
      return
    }
    showToast(inv.line)
    const sc = buildDateSession(s, profile, spot)
    saveRun(s)
    setPhase({ t: 'session', sess: { script: sc, npcId: profile.id, type: 'date' } })
    force()
  }

  // ============ 渲染 ============
  const chars = getCharacters(s.version)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      {phase.t !== 'ending' && (
        <div className="hud">
          <span className="day">第{Math.min(s.day, TOTAL_DAYS)}天</span>
          <span className="slot-tag">{s.slot === 0 ? '🌤 白天' : '🌙 晚上'}</span>
          <span className="slot-tag">{s.version === 'male' ? '男版' : '女版'}</span>
          <span className="spacer" />
          <span className="awk">
            😅
            <span className="awk-bar">
              <i style={{ width: `${Math.min(100, s.awkward)}%` }} />
            </span>
          </span>
          <span className="money">¥{s.wallet}</span>
        </div>
      )}

      {favorFloat && (
        <div className="favor-float" style={{ color: favorFloat.good ? '#4ade80' : '#f87171' }}>
          {favorFloat.text}
        </div>
      )}

      {phase.t === 'hub' && (
        <Hub
          s={s}
          chars={chars}
          armFeast={armFeast}
          onChat={() => setPhase({ t: 'list', mode: 'chat' })}
          onDate={() => setPhase({ t: 'list', mode: 'date' })}
          onWork={() => {
            showToast(doWork(s))
            advance()
          }}
          onRest={() => {
            showToast(doRest(s))
            advance()
          }}
          onFeast={() => {
            if (!armFeast) {
              setArmFeast(true)
              showToast('确定吗?退出所有暧昧,一个人去吃顿好的。再点一次确认。')
              window.setTimeout(() => setArmFeast(false), 4000)
            } else {
              endGame('give_up_feast')
            }
          }}
          onExit={onExit}
        />
      )}

      {phase.t === 'list' && (
        <NpcList
          s={s}
          chars={chars}
          mode={phase.mode}
          onBack={() => setPhase({ t: 'hub' })}
          onPick={(c) => {
            if (phase.mode === 'chat') startChat(c)
            else setPhase({ t: 'spot', npcId: c.id })
          }}
        />
      )}

      {phase.t === 'spot' && (
        <SpotPick
          s={s}
          profile={getCharacter(s.version, phase.npcId)}
          onBack={() => setPhase({ t: 'list', mode: 'date' })}
          onPick={(idx) => startDate(getCharacter(s.version, phase.npcId), idx)}
        />
      )}

      {phase.t === 'session' && (
        <SessionView
          key={phase.sess.script.id + s.day + s.slot}
          s={s}
          sess={phase.sess}
          onFavor={showFavor}
          onDanmaku={fireDanmaku}
          onPendingEnding={(e) => (pendingEnding.current = e)}
          onFinish={() => finishSession(phase.sess)}
          force={force}
        />
      )}

      {phase.t === 'ending' && (
        <EndingScreen s={s} id={phase.id} npcId={phase.npcId} detail={phase.detail} onExit={onExit} />
      )}

      <DanmakuLayer items={danmaku} />
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

// ============ 行动中心 ============
function Hub({
  s,
  chars,
  armFeast,
  onChat,
  onDate,
  onWork,
  onRest,
  onFeast,
  onExit,
}: {
  s: GameState
  chars: CharacterProfile[]
  armFeast: boolean
  onChat: () => void
  onDate: () => void
  onWork: () => void
  onRest: () => void
  onFeast: () => void
  onExit: () => void
}) {
  const alive = chars.filter((c) => isAlive(s.npcs[c.id]))
  const unread = chars.filter((c) => isAlive(s.npcs[c.id]) && s.npcs[c.id].unread).length
  return (
    <div className="scroll fade-in" style={{ padding: '16px 14px 24px' }}>
      <div style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.7, marginBottom: 14 }}>
        「心动Beijing」在聊:{alive.length} 人
        {unread > 0 && <span style={{ color: 'var(--accent)' }}> · {unread} 条未读</span>}
        <br />
        {s.day <= 3 && '前期多聊聊,摸清每个人的雷区。'}
        {s.day > 3 && s.day <= 9 && '约会才能大幅拉好感,但钱包和风险都要管理。'}
        {s.day > 9 && `倒计时 ${TOTAL_DAYS - s.day + 1} 天,该把话说开了。`}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn" onClick={onChat}>
          💬 回消息 <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>推进一个人的聊天</span>
        </button>
        <button className="btn" onClick={onDate}>
          📍 约会 <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>花钱,涨好感,有戏剧</span>
        </button>
        <button className="btn" onClick={onWork}>
          🧑‍💻 加班搞钱 <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>+钱,但全员好感小跌</span>
        </button>
        <button className="btn" onClick={onRest}>
          🛋️ 躺平回血 <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>大幅清空社死值</span>
        </button>
        {s.day >= 8 && (
          <button className="btn" style={{ borderColor: 'rgba(255,184,77,.4)' }} onClick={onFeast}>
            🍽️ {armFeast ? '再点一次:确认退出所有暧昧' : '不玩了,自己去吃顿好的'}
          </button>
        )}
      </div>

      <div className="section-title">技能面板</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {SKILLS.map((sk) => (
          <span key={sk.id} className="slot-tag" style={{ fontSize: 12 }}>
            {sk.emoji}
            {sk.name} {s.skills[sk.id]}
          </span>
        ))}
      </div>

      <button className="btn ghost" style={{ marginTop: 22, fontSize: 13, color: 'var(--text-faint)' }} onClick={onExit}>
        ← 回主菜单(进度已自动保存)
      </button>
    </div>
  )
}

// ============ 聊天列表 ============
function NpcList({
  s,
  chars,
  mode,
  onBack,
  onPick,
}: {
  s: GameState
  chars: CharacterProfile[]
  mode: 'chat' | 'date'
  onBack: () => void
  onPick: (c: CharacterProfile) => void
}) {
  return (
    <div className="scroll fade-in" style={{ padding: '12px 14px 24px' }}>
      <button className="btn ghost" style={{ width: 'auto', padding: '4px 0', fontSize: 14 }} onClick={onBack}>
        ← 返回
      </button>
      <h3 style={{ fontSize: 17, fontWeight: 800, margin: '4px 0 12px' }}>
        {mode === 'chat' ? '💬 找谁聊?' : '📍 约谁出来?'}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {chars.map((c) => {
          const n = s.npcs[c.id]
          const dead = !isAlive(n)
          const canMind = s.skills.mind >= 6
          const hiddenReady = (c.hiddenTopics ?? []).some(
            (h) => s.flags.includes(`code:${h.codeId}`) && !n.usedHidden.includes(h.script.id),
          )
          return (
            <button
              key={c.id}
              className={`npc-card ${dead ? 'dead' : ''}`}
              disabled={dead}
              onClick={() => onPick(c)}
            >
              <div className="big-avatar" style={{ background: `${c.color}33`, border: `1.5px solid ${c.color}66` }}>
                {c.emoji}
                {n.unread && !dead && <span className="unread-dot" />}
              </div>
              <div className="info">
                <div className="name">
                  {c.name}
                  {n.stage === 'confirmed' && <span style={{ fontSize: 11, color: 'var(--accent)' }}>❤️ 已确立</span>}
                  {hiddenReady && <span style={{ fontSize: 12 }}>✨</span>}
                  {!dead && n.mood !== 'normal' && canMind && (
                    <span className="mood-chip">
                      {MOODS[n.mood].emoji}
                      {MOODS[n.mood].name}
                    </span>
                  )}
                </div>
                <div className="sub">
                  {dead ? `💔 ${n.blockReason ?? '已失联'}` : !canMind && n.mood !== 'normal' ? MOODS[n.mood].hint : c.bio}
                </div>
                {!dead && (
                  <div className="favor-bar">
                    <i style={{ width: `${n.favor}%` }} />
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
      {mode === 'date' && (
        <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 12, lineHeight: 1.7 }}>
          提示:好感太低会被已读乱回;同时和多人暧昧,小心「亮马河目击事件」。
        </p>
      )}
    </div>
  )
}

// ============ 约会地点选择 ============
function SpotPick({
  s,
  profile,
  onBack,
  onPick,
}: {
  s: GameState
  profile: CharacterProfile
  onBack: () => void
  onPick: (idx: number) => void
}) {
  return (
    <div className="scroll fade-in" style={{ padding: '12px 14px 24px' }}>
      <button className="btn ghost" style={{ width: 'auto', padding: '4px 0', fontSize: 14 }} onClick={onBack}>
        ← 返回
      </button>
      <h3 style={{ fontSize: 17, fontWeight: 800, margin: '4px 0 4px' }}>
        约 {profile.name} 去哪?
      </h3>
      <p style={{ fontSize: 12.5, color: 'var(--text-dim)', marginBottom: 12 }}>钱包余额:¥{s.wallet}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {profile.dateSpots.map((spot, i) => {
          const bg = SCENE_BG[spot.template === 'citywalk' ? 'walk' : spot.template === 'shopping' ? 'shop' : spot.template]
          const cant = s.wallet < spot.price
          return (
            <button key={i} className="npc-card" disabled={cant} onClick={() => onPick(i)} style={{ opacity: cant ? 0.45 : 1 }}>
              <div className="big-avatar" style={{ background: bg.grad }}>
                {bg.emoji}
              </div>
              <div className="info">
                <div className="name">{spot.label}</div>
                <div className="sub">📍 {spot.location}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: cant ? 'var(--red)' : 'var(--accent2)' }}>
                ¥{spot.price}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ============ 剧本执行器 ============
interface SessionViewProps {
  s: GameState
  sess: Session
  onFavor: (d: number) => void
  onDanmaku: (keys?: string[]) => void
  onPendingEnding: (e: { id: string; npcId?: string; detail?: string }) => void
  onFinish: () => void
  force: () => void
}

interface LogLine {
  key: number
  line: Line
}

let logKey = 0

function SessionView({ s, sess, onFavor, onDanmaku, onPendingEnding, onFinish, force }: SessionViewProps) {
  const { script } = sess
  const npc: NpcState | null = sess.npcId ? s.npcs[sess.npcId] : null
  const profile: CharacterProfile | null = sess.npcId ? getCharacter(s.version, sess.npcId) : null

  const [nodeId, setNodeId] = useState(script.start)
  const [log, setLog] = useState<LogLine[]>([])
  const [revealed, setRevealed] = useState(0)
  const revealRef = useRef(0)
  const [typing, setTyping] = useState(false)
  const typingRef = useRef(false)
  const [dice, setDice] = useState<{ result: CheckResult } | null>(null)
  const [finished, setFinished] = useState(false)
  const appliedNodes = useRef<Set<string>>(new Set())
  const syntheticEnd = useRef(false)
  const areaRef = useRef<HTMLDivElement>(null)

  const node: NodeDef | undefined = script.nodes[nodeId]

  // 进入节点:应用节点效果 + 弹幕
  useEffect(() => {
    if (!node || appliedNodes.current.has(node.id)) return
    appliedNodes.current.add(node.id)
    if (node.effects) {
      const fb = applyEffects(s, npc, profile, node.effects)
      onFavor(fb.favorDelta)
      if (fb.blocked) addDeath(fb.blocked)
      if (fb.ended) onPendingEnding({ id: fb.ended, npcId: sess.npcId ?? undefined })
      force()
    }
    if (node.danmaku) onDanmaku(node.danmaku)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeId])

  // 自动展示第一行
  useEffect(() => {
    const t = window.setTimeout(() => tap(), 350)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeId])

  useEffect(() => {
    areaRef.current?.scrollTo({ top: areaRef.current.scrollHeight, behavior: 'smooth' })
  }, [log, typing, revealed, finished])

  function appendLine(line: Line) {
    setLog((l) => [...l, { key: ++logKey, line }])
  }

  function tap() {
    if (dice || typing || typingRef.current || finished || !node) return
    if (revealRef.current < node.lines.length) {
      const line = node.lines[revealRef.current]
      revealRef.current++
      if (line.who === 'npc' && script.kind === 'chat') {
        typingRef.current = true
        setTyping(true)
        window.setTimeout(() => {
          typingRef.current = false
          setTyping(false)
          appendLine(line)
          setRevealed(revealRef.current)
        }, 420 + Math.min(line.text.length * 12, 500))
      } else {
        appendLine(line)
        setRevealed(revealRef.current)
      }
      return
    }
    // 所有行已展示
    const visibleChoices = getVisibleChoices()
    if (visibleChoices.length > 0) return
    if (syntheticEnd.current || node.end) {
      setFinished(true)
      return
    }
    if (node.next) {
      enterNode(node.next)
    } else {
      setFinished(true)
    }
  }

  function enterNode(id: string) {
    if (!script.nodes[id]) {
      setFinished(true)
      return
    }
    revealRef.current = 0
    setNodeId(id)
    setRevealed(0)
  }

  function getVisibleChoices(): ChoiceDef[] {
    if (!node?.choices || revealed < node.lines.length || syntheticEnd.current) return []
    return node.choices.filter((c) => {
      const has = (f: string) => s.flags.includes(f) || (npc?.flags.includes(f) ?? false)
      if (c.showIf && !has(c.showIf)) return false
      if (c.hideIf && has(c.hideIf)) return false
      return true
    })
  }

  function pickChoice(c: ChoiceDef) {
    if (dice || finished) return
    if (c.require && s.skills[c.require.skill] < c.require.min) return

    appendLine({ who: 'me', text: c.text })
    if (c.danmaku) onDanmaku(c.danmaku)

    let blocked: string | undefined
    if (c.effects) {
      const fb = applyEffects(s, npc, profile, c.effects)
      onFavor(fb.favorDelta)
      if (fb.tasteLine) appendLine({ who: 'nar', text: fb.tasteLine })
      if (fb.banHit && fb.banHit.first) appendLine({ who: 'nar', text: '……不知道为什么,TA的回复突然变得敷衍了。' })
      if (fb.ended) onPendingEnding({ id: fb.ended, npcId: sess.npcId ?? undefined })
      if (fb.blocked) {
        blocked = fb.blocked
        addDeath(fb.blocked)
      }
      force()
    }

    // 选项级拉黑(观点死穴、语言雷点二连等):插入告别台词并终止
    if (blocked) {
      showBlockAndEnd(blocked)
      return
    }

    if (c.check) {
      const result = performCheck(s, npc, c.check)
      setDice({ result })
      return
    }
    if (c.goto) {
      // 清空当前节点选项状态,前进
      markChoicesConsumed()
      enterNode(c.goto)
    } else {
      setFinished(true)
    }
  }

  function markChoicesConsumed() {
    if (node) node.choices = undefined
  }

  function showBlockAndEnd(reason: string) {
    markChoicesConsumed()
    if (profile) appendLine({ who: 'npc', text: profile.blockLines[0] })
    appendLine({ who: 'sys', text: `💔 ${reason} —— 对方把你拉黑了。` })
    onDanmaku(['#block'])
    syntheticEnd.current = true
    setFinished(true)
  }

  function onDiceDone() {
    if (!dice) return
    const goto = dice.result.goto
    setDice(null)
    markChoicesConsumed()
    enterNode(goto)
  }

  const visibleChoices = getVisibleChoices()
  const bg = script.bg ? SCENE_BG[script.bg] : null

  return (
    <>
      {script.kind !== 'chat' && bg && (
        <div className="scene-head" style={{ background: bg.grad }}>
          <div className="loc">📍 {script.location ?? '北京'}</div>
          <div className="title">{script.title}</div>
          <div className="deco">{bg.emoji}</div>
        </div>
      )}
      {script.kind === 'chat' && profile && npc && (
        <div className="hud" style={{ borderTop: 'none' }}>
          <div className="avatar" style={{ background: `${profile.color}33` }}>
            {profile.emoji}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{profile.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>
              💗 {npc.favor}/100
              {s.skills.mind >= 6 && npc.mood !== 'normal' ? ` · ${MOODS[npc.mood].emoji}${MOODS[npc.mood].name}` : ''}
            </div>
          </div>
        </div>
      )}

      <div className="chat-area" ref={areaRef} onClick={tap}>
        {log.map(({ key, line }) => (
          <LineView key={key} line={line} profile={profile} />
        ))}
        {typing && (
          <div className="bubble-row">
            <div className="avatar" style={{ background: profile ? `${profile.color}33` : undefined }}>
              {profile?.emoji ?? '💬'}
            </div>
            <div className="typing">
              <i />
              <i />
              <i />
            </div>
          </div>
        )}
        {!typing && !finished && visibleChoices.length === 0 && !dice && (
          <div className="tap-hint">点击继续 ▸</div>
        )}
        {finished && (
          <button className="btn primary" style={{ marginTop: 8 }} onClick={onFinish}>
            {sess.type === 'event' ? '继续 →' : '结束本次互动 →'}
          </button>
        )}
      </div>

      {visibleChoices.length > 0 && !dice && (
        <div className="choices">
          {visibleChoices.map((c, i) => {
            const locked = c.require && s.skills[c.require.skill] < c.require.min
            const skillName = c.check ? SKILLS.find((x) => x.id === c.check!.skill) : null
            return (
              <button
                key={i}
                className={`choice-btn ${locked ? 'locked' : ''}`}
                style={{ animationDelay: `${i * 0.07}s` }}
                onClick={() => !locked && pickChoice(c)}
              >
                {skillName && (
                  <span className="check-tag">
                    🎲{skillName.emoji}
                    {skillName.name}
                  </span>
                )}
                {c.text}
                {locked && <span className="lock-reason">🔒 {c.require!.gray}</span>}
              </button>
            )
          })}
        </div>
      )}

      {dice && <DiceRoll result={dice.result} onDone={onDiceDone} />}
    </>
  )
}

function LineView({ line, profile }: { line: Line; profile: CharacterProfile | null }) {
  if (line.who === 'nar') return <div className="line-nar">{line.text}</div>
  if (line.who === 'sys') return <div className="line-sys">{line.text}</div>
  const isMe = line.who === 'me'
  return (
    <div className={`bubble-row ${isMe ? 'me' : ''}`}>
      <div className="avatar" style={{ background: isMe ? 'rgba(94,173,247,.25)' : profile ? `${profile.color}33` : undefined }}>
        {isMe ? '🙂' : (profile?.emoji ?? '💬')}
      </div>
      <div className={`bubble ${isMe ? 'me' : 'npc'}`}>{line.text}</div>
    </div>
  )
}

// ============ 结局页 ============
function EndingScreen({
  s,
  id,
  npcId,
  detail,
  onExit,
}: {
  s: GameState
  id: string
  npcId?: string
  detail?: string
  onExit: () => void
}) {
  const def = findEnding(id)
  if (!def) {
    return (
      <div style={{ padding: 30 }}>
        结局数据缺失({id})
        <button className="btn" onClick={onExit}>
          返回
        </button>
      </div>
    )
  }
  const npcName = npcId ? getCharacter(s.version, npcId).name : undefined
  return <EndingCard ending={def} state={s} npcName={npcName} detail={detail} onRestart={onExit} onGallery={onExit} />
}
