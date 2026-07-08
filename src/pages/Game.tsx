import { useEffect, useReducer, useRef, useState } from 'react'
import {
  CharacterProfile,
  ChoiceDef,
  ENERGY_COST,
  GameState,
  Line,
  MOODS,
  NodeDef,
  NpcState,
  ORIGINS,
  Script,
  SKILL_DISPLAY,
  TOTAL_DAYS,
} from '@/engine/types'
import {
  buildChatSession,
  buildConfrontation,
  buildDateSession,
  cohabitPartner,
  doWork,
  liquorHint,
  marriageRoll,
  sleep,
  touchNpc,
  tryInvite,
} from '@/engine/game'
import { chance } from '@/engine/rng'
import { applyEffects, fateRoll, isAlive, refillPool, relationTier } from '@/engine/relations'
import { bumpMood, moodAura, moodDepressed, moodExtremeRoll, moodHint } from '@/engine/mood'
import { checkAllBlocked, settle } from '@/engine/endings'
import { performCheck } from '@/engine/checks'
import { pick, seedRng } from '@/engine/rng'
import { addDeath, addRun, clearRun, saveRun, unlockEnding } from '@/engine/save'
import { findEnding, findEvent, getCharacter, getCharacters, resolveDanmaku } from '@/content'
import { trackEnding, trackPlay } from '@/analytics'
import { DanmakuLayer, DanmakuItem } from '@/components/Danmaku'
import { Celebration } from '@/components/Celebration'
import { EndingCard } from '@/components/EndingCard'

/** 里程碑 → 全屏庆祝文案 */
const MILESTONES: Record<string, { title: string; sub: string }> = {
  favor30: { title: '有点意思了', sub: '好感突破 30 · 关系开始升温' },
  favor50: { title: '暧昧拉满', sub: '好感突破 50 · 就差捅破那层窗户纸' },
  confirmed: { title: '在一起了!', sub: '关系确立 · 北京又凑成了一对' },
  true: { title: '触碰到TA的真心', sub: '你解锁了TA藏得最深的一面' },
  cohabit: { title: '同居生活开始', sub: '一把钥匙 · 房租减半,风险加倍' },
}

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
  ktv: { grad: 'linear-gradient(135deg,#6d28d9,#db2777)', emoji: '🎤' },
  jubensha: { grad: 'linear-gradient(135deg,#1e293b,#7c3aed)', emoji: '🕵️' },
  park: { grad: 'linear-gradient(135deg,#0e7490,#f59e0b)', emoji: '🎢' },
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
  const [celebration, setCelebration] = useState<{ kind: 'good' | 'bad'; title: string; sub: string } | null>(null)
  const pendingEnding = useRef<{ id: string; npcId?: string; detail?: string } | null>(null)
  const toastTimer = useRef<number>(0)
  const celebTimer = useRef<number>(0)

  useEffect(() => {
    seedRng(((s.seed + s.day * 131 + Date.now()) % 2147483647) >>> 0)
    if (s.day === 1 && !s.ending) trackPlay(s) // 开局匿名计数
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

  /** 全屏庆祝/翻车:把游戏已产生的高光/低谷时刻兑现成多巴胺 + 震动 */
  function fireCelebration(kind: 'good' | 'bad', title: string, sub: string) {
    setCelebration({ kind, title, sub })
    try {
      navigator.vibrate?.(kind === 'good' ? [0, 40, 55, 40] : [0, 120, 50, 120])
    } catch {
      /* 不支持震动就算了 */
    }
    window.clearTimeout(celebTimer.current)
    celebTimer.current = window.setTimeout(() => setCelebration(null), 2200)
  }

  function onMilestone(key: string) {
    const m = MILESTONES[key]
    if (!m) return
    fireCelebration('good', m.title, m.sub)
    fireDanmaku(['#win'])
  }

  function endGame(id: string, npcId?: string, detail?: string) {
    s.ending = { id, npcId, detail }
    trackEnding(s, id) // 结局匿名计数
    unlockEnding(id)
    addRun()
    clearRun()
    // 胜负两端都响:上岸给庆祝,寄了给翻车(社死传播内核不削弱)
    const def = findEnding(id, s.version)
    if (def?.rank === 'win') fireCelebration('good', def.title, '🎉 上岸!')
    else if (def?.rank === 'lose') fireCelebration('bad', def.title, '💔 这局,寄了')
    setPhase({ t: 'ending', id, npcId, detail })
  }

  function announceMatch(npcId: string | null | undefined, delay = 1600) {
    if (!npcId) return
    const name = getCharacter(s.version, npcId).name
    window.setTimeout(() => showToast(`💘 「心动Beijing」为你推了一位新朋友:${name}`), delay)
  }

  /** 睡觉 = 结束一天:扣固定开销、回精力、每日结算、抽事件 */
  function doSleep() {
    const r = sleep(s)
    if (r.bankrupt) return endGame('bankrupt')
    if (r.gameOver) {
      const res = settle(s)
      return endGame(res.id, res.npcId, res.detail)
    }
    const faded = r.decay.filter((d) => d.kind === 'faded')
    for (const f of faded) {
      const reason = s.npcs[f.npcId].blockReason
      if (reason) addDeath(reason)
    }
    if (faded.length > 0) showToast('💔 有人被你晾太久,默默把你删了好友。')
    announceMatch(r.decay.find((d) => d.kind === 'match')?.npcId, faded.length > 0 ? 2400 : 400)
    if (checkAllBlocked(s)) return endGame('all_blocked')
    if (faded.length === 0) showToast(`😴 新的一天。房租和生活费扣了 ¥${r.cost}。`)

    if (r.eventId) {
      const ev = findEvent(r.eventId)
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

  /** 回到行动中心;精力耗尽则自动入夜 */
  function backToHub() {
    if (moodDepressed(s)) return endGame('depression') // 加班内耗到底:确定性抑郁判负
    if (checkAllBlocked(s)) return endGame('all_blocked')
    if (s.wallet <= 0) return endGame('bankrupt')
    if (s.energy <= 0) {
      showToast('⚡ 精力耗尽,今天到此为止。')
      doSleep()
      return
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
      const profile = getCharacter(s.version, sess.npcId)

      // 婚姻骰:极限关系的约会结束后暗掷
      if (!ended && sess.type === 'date' && marriageRoll(s, profile)) {
        ended = { id: 'marriage', npcId: sess.npcId }
      }
      if (!ended && isAlive(npcSt) && npcSt.stage !== 'confirmed') {
        const fate = fateRoll(s, npcSt)
        if (fate === 'win') {
          ended = { id: 'fate_win', npcId: sess.npcId }
        } else if (fate === 'ghost') {
          addDeath(npcSt.blockReason!)
          showToast(`💨 ${profile.name}的头像忽然灰了。没有争吵,没有理由。北京的风把TA吹走了。`)
          fireDanmaku(['#fate'])
          announceMatch(refillPool(s), 2600)
        }
      }
      // 酒局后的隐藏酒量模糊评语(只提示一次)
      if (sess.type === 'date' && sess.script.bg === 'bar' && s.stats.drinks > 0) {
        const h = liquorHint(s)
        if (h && !ended) window.setTimeout(() => showToast(`🍺 ${h}`), 1200)
      }
      if (sess.type === 'date' && !ended) bumpMood(s, 6)
    }

    // 玩家心情极端时的暗骰
    if (!ended) {
      const m = moodExtremeRoll(s)
      if (m) ended = { id: m }
    }

    if (ended) return endGame(ended.id, ended.npcId, ended.detail)

    // 同居生效:房租分摊(只执行一次)
    if (s.flags.includes('cohabiting') && !s.flags.includes('rent_split')) {
      s.flags.push('rent_split')
      if (s.rent > 0) {
        s.rent = Math.round(s.rent / 2)
        window.setTimeout(() => showToast(`🏠 同居生效:房租分摊,月租降至 ¥${s.rent}。`), 1400)
      }
    }

    // 同居后和别人暧昧:有概率被同居对象发现(约会更容易露馅)
    const partner = cohabitPartner(s)
    if (
      partner &&
      sess.npcId &&
      sess.npcId !== partner.id &&
      sess.type !== 'event' &&
      chance(sess.type === 'date' ? 0.6 : 0.35)
    ) {
      const partnerProfile = getCharacter(s.version, partner.id)
      const otherName = getCharacter(s.version, sess.npcId).name
      const sc = buildConfrontation(s, partnerProfile, otherName)
      saveRun(s)
      setPhase({ t: 'session', sess: { script: sc, npcId: partner.id, type: 'event' } })
      force()
      return
    }

    backToHub()
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
    if (s.wallet <= 0) return endGame('bankrupt')
    saveRun(s)
    setPhase({ t: 'session', sess: { script: sc, npcId: profile.id, type: 'date' } })
    force()
  }

  // ============ 渲染 ============
  const chars = getCharacters(s.version)
  const aura = moodAura(s)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      {phase.t !== 'ending' && (
        <div className="hud">
          <span className="day">第{Math.min(s.day, TOTAL_DAYS)}天</span>
          <span className="slot-tag">
            ⚡{s.energy}/{s.maxEnergy}
          </span>
          <span className="slot-tag">{s.version === 'male' ? '男版' : '女版'}</span>
          {aura && (
            <span className={`aura-chip ${aura.good ? 'good' : 'bad'}`}>
              {aura.emoji}
              {aura.label}
            </span>
          )}
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
            backToHub()
          }}
          onSleep={doSleep}
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
          key={phase.sess.script.id + s.day + s.energy}
          s={s}
          sess={phase.sess}
          onFavor={showFavor}
          onDanmaku={fireDanmaku}
          onNewMatch={(id) => announceMatch(id, 2200)}
          onPendingEnding={(e) => (pendingEnding.current = e)}
          onMilestone={onMilestone}
          onSting={(title, sub) => fireCelebration('bad', title, sub)}
          onPraise={pushDanmaku}
          onFinish={() => finishSession(phase.sess)}
          force={force}
        />
      )}

      {phase.t === 'ending' && (
        <EndingScreen s={s} id={phase.id} npcId={phase.npcId} detail={phase.detail} onExit={onExit} />
      )}

      <DanmakuLayer items={danmaku} />
      {toast && <div className="toast">{toast}</div>}
      {celebration && (
        <Celebration kind={celebration.kind} title={celebration.title} sub={celebration.sub} />
      )}
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
  onSleep,
  onFeast,
  onExit,
}: {
  s: GameState
  chars: CharacterProfile[]
  armFeast: boolean
  onChat: () => void
  onDate: () => void
  onWork: () => void
  onSleep: () => void
  onFeast: () => void
  onExit: () => void
}) {
  const alive = chars.filter((c) => isAlive(s.npcs[c.id]))
  const unread = chars.filter((c) => isAlive(s.npcs[c.id]) && s.npcs[c.id].unread).length
  const origin = ORIGINS.find((o) => o.id === s.origin)!
  const hint = moodHint(s)
  const actions: { emoji: string; title: string; desc: string; cost: number; onClick: () => void }[] = [
    { emoji: '💬', title: '回消息', desc: '推进一个人的聊天', cost: ENERGY_COST.chat, onClick: onChat },
    { emoji: '📍', title: '约会', desc: '花钱,涨好感,有戏剧', cost: ENERGY_COST.date, onClick: onDate },
    { emoji: '🧑‍💻', title: '加班搬钱', desc: '加班费到手,全员好感小跌', cost: ENERGY_COST.work, onClick: onWork },
    { emoji: '😴', title: '睡觉', desc: '结束今天:回精力,清社死,扣房租', cost: 0, onClick: onSleep },
  ]
  return (
    <div className="hub-wrap fade-in">
      <div className="hub-top">
        <div style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.7, marginBottom: 10 }}>
          「心动Beijing」在聊:{alive.length} 人
          {unread > 0 && <span style={{ color: 'var(--accent)' }}> · {unread} 条未读</span>}
          <br />
          {s.day <= 3 && '前期多聊聊,摸清每个人的雷区。'}
          {s.day > 3 && s.day <= 9 && '约会才能大幅拉好感,但钱包和风险都要管理。'}
          {s.day > 9 && `倒计时 ${TOTAL_DAYS - s.day + 1} 天,该把话说开了。`}
        </div>
        {hint && (
          <div style={{ fontSize: 12.5, color: 'var(--purple)', fontStyle: 'italic', lineHeight: 1.6, marginBottom: 10 }}>
            {hint}
          </div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <span className="slot-tag" style={{ fontSize: 11.5 }}>
            {origin.emoji}
            {origin.name}
          </span>
          <span className="slot-tag" style={{ fontSize: 11.5 }}>
            🎓文化水平 {s.skills.culture}
          </span>
          <span className="slot-tag" style={{ fontSize: 11.5 }}>
            🍺酒量 ???
          </span>
          <span className="slot-tag" style={{ fontSize: 11.5 }}>
            月薪 ¥{s.salary}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, flexShrink: 0 }}>
        <div className="action-grid">
          {actions.map((a) => {
            const disabled = a.cost > 0 && s.energy < a.cost
            return (
              <button key={a.title} className="action-card" disabled={disabled} style={disabled ? { opacity: 0.4 } : undefined} onClick={a.onClick}>
                <div className="a-title">
                  {a.emoji} {a.title}
                  {a.cost > 0 && (
                    <span style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 600 }}> ⚡{a.cost}</span>
                  )}
                </div>
                <div className="a-desc">{a.desc}</div>
              </button>
            )
          })}
        </div>
        {s.day >= 8 && (
          <button className="btn" style={{ borderColor: 'rgba(255,184,77,.4)', padding: '10px 14px' }} onClick={onFeast}>
            🍽️ {armFeast ? '再点一次:确认退出所有暧昧' : '不玩了,自己去吃顿好的'}
          </button>
        )}
        <button
          className="btn ghost"
          style={{ fontSize: 12.5, color: 'var(--text-faint)', padding: '6px 14px' }}
          onClick={onExit}
        >
          ← 回主菜单(进度已自动保存)
        </button>
      </div>
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
        {[...chars]
          .sort((a, b) => {
            // 在聊的人置顶,其次锁定(待解锁),最后已失联
            const rk = (id: string) => {
              const n = s.npcs[id]
              return isAlive(n) ? 0 : n.stage === 'locked' ? 1 : 2
            }
            return rk(a.id) - rk(b.id)
          })
          .map((c) => {
          const n = s.npcs[c.id]
          if (n.stage === 'locked') {
            return (
              <div key={c.id} className="npc-card dead" style={{ opacity: 0.35 }}>
                <div className="big-avatar" style={{ background: 'var(--panel2)' }}>
                  ❓
                </div>
                <div className="info">
                  <div className="name">???</div>
                  <div className="sub">「心动Beijing」正在为你物色……有人离开后会自动推荐新朋友</div>
                </div>
              </div>
            )
          }
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
                  {!dead && (
                    <span className="tier-chip">
                      {relationTier(n).emoji}
                      {relationTier(n).name}
                    </span>
                  )}
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
          const cant = s.wallet - spot.price <= 0
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
      <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 12 }}>
        价格为两人消费。约完钱包会变成 0 的地方,系统替你划掉了——钱归零就寄。
      </p>
    </div>
  )
}

// ============ 剧本执行器 ============
interface SessionViewProps {
  s: GameState
  sess: Session
  onFavor: (d: number) => void
  onDanmaku: (keys?: string[]) => void
  onNewMatch: (id: string) => void
  onPendingEnding: (e: { id: string; npcId?: string; detail?: string }) => void
  onMilestone: (key: string) => void
  onSting: (title: string, sub: string) => void
  onPraise: (text: string) => void
  onFinish: () => void
  force: () => void
}

interface LogLine {
  key: number
  line: Line
}

let logKey = 0

function SessionView({
  s,
  sess,
  onFavor,
  onDanmaku,
  onNewMatch,
  onPendingEnding,
  onMilestone,
  onSting,
  onPraise,
  onFinish,
  force,
}: SessionViewProps) {
  const { script } = sess
  const npc: NpcState | null = sess.npcId ? s.npcs[sess.npcId] : null
  const profile: CharacterProfile | null = sess.npcId ? getCharacter(s.version, sess.npcId) : null

  const [nodeId, setNodeId] = useState(script.start)
  const [log, setLog] = useState<LogLine[]>([])
  const [revealed, setRevealed] = useState(0)
  const [combo, setCombo] = useState(0)
  const revealRef = useRef(0)
  const [typing, setTyping] = useState(false)
  const typingRef = useRef(false)
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
      if (fb.milestone) onMilestone(fb.milestone)
      if (fb.blocked) {
        addDeath(fb.blocked)
        onSting('被拉黑了', fb.blocked)
      }
      if (fb.newMatch) onNewMatch(fb.newMatch)
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
    if (typing || typingRef.current || finished || !node) return
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
    if (finished) return
    if (c.require && s.skills[c.require.skill] < c.require.min) return

    appendLine({ who: 'me', text: c.text })
    if (c.danmaku) onDanmaku(c.danmaku)

    let blocked: string | undefined
    if (c.effects) {
      const fb = applyEffects(s, npc, profile, c.effects)
      onFavor(fb.favorDelta)
      if (fb.tasteLine) appendLine({ who: 'nar', text: fb.tasteLine })
      if (fb.banHit && fb.banHit.first) appendLine({ who: 'nar', text: '……不知道为什么,TA的回复突然变得敷衍了。' })
      if (fb.milestone) onMilestone(fb.milestone)
      if (fb.ended) onPendingEnding({ id: fb.ended, npcId: sess.npcId ?? undefined })
      if (fb.newMatch) onNewMatch(fb.newMatch)
      if (fb.blocked) {
        blocked = fb.blocked
        addDeath(fb.blocked)
      }
      // 默契连击:答对累积,踩雷/负分归零;连击≥2 给递进夸奖 + 封顶额外好感
      if (fb.banHit || c.effects.mine || fb.favorDelta < 0) {
        setCombo(0)
      } else if (fb.favorDelta > 0) {
        const nc = combo + 1
        setCombo(nc)
        if (nc >= 2) {
          onPraise(`🔥x${nc} ${nc >= 4 ? '灵魂共振!' : nc >= 3 ? '默契 +1' : '懂你'}`)
          if (npc) {
            const bonus = Math.min(nc - 1, 3)
            npc.favor = Math.min(100, npc.favor + bonus)
            onFavor(bonus)
          }
        }
      }
      force()
    }

    // 选项级拉黑(观点死穴、语言雷点二连等):插入告别台词并终止
    if (blocked) {
      onSting('被拉黑了', blocked)
      showBlockAndEnd(blocked)
      return
    }

    if (c.check) {
      // 暗骰:检定静默进行,结果只通过剧情走向体现
      const result = performCheck(s, npc, c.check)
      markChoicesConsumed()
      enterNode(result.goto)
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

  const visibleChoices = getVisibleChoices()
  const bg = script.bg ? SCENE_BG[script.bg] : null

  return (
    <>
      {combo >= 2 && (
        <div className="combo-chip" key={combo}>
          🔥 连击 x{combo}
        </div>
      )}
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
            <div style={{ fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              {profile.name}
              <span className="tier-chip">
                {relationTier(npc).emoji}
                {relationTier(npc).name}
              </span>
            </div>
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
        {!typing && !finished && visibleChoices.length === 0 && (
          <div className="tap-hint">点击继续 ▸</div>
        )}
      </div>

      {finished && (
        <div className="choices">
          <button className="btn primary" onClick={onFinish}>
            {sess.type === 'event' ? '继续 →' : '结束本次互动 →'}
          </button>
        </div>
      )}

      {visibleChoices.length > 0 && (
        <div className="choices">
          {visibleChoices.map((c, i) => {
            const locked = c.require && s.skills[c.require.skill] < c.require.min
            return (
              <button
                key={i}
                className={`choice-btn ${locked ? 'locked' : ''}`}
                style={{ animationDelay: `${i * 0.07}s` }}
                onClick={() => !locked && pickChoice(c)}
              >
                {c.text}
                {locked && <span className="lock-reason">🔒 {c.require!.gray}</span>}
              </button>
            )
          })}
        </div>
      )}
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
  const def = findEnding(id, s.version)
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
