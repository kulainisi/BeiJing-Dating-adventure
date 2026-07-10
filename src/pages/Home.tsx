import { useMemo, useState } from 'react'
import {
  EDU_BGS,
  EduId,
  findEdu,
  findProfession,
  GameState,
  getProfessions,
  ORIGINS,
  parallelCap,
  ProfId,
  Version,
} from '@/engine/types'
import { newGame } from '@/engine/game'
import { getCharacters } from '@/content'
import { getRerollTokens, loadRun, useRerollToken } from '@/engine/save'

export function Home({
  onStart,
  onGallery,
}: {
  onStart: (s: GameState) => void
  onGallery: () => void
}) {
  const [version, setVersion] = useState<Version | null>(null)
  const [edu, setEdu] = useState<EduId | null>(null)
  const [eduDone, setEduDone] = useState(false)
  const [prof, setProf] = useState<ProfId | null>(null)
  const [pending, setPending] = useState<GameState | null>(null)
  const [picking, setPicking] = useState(false)
  const [picks, setPicks] = useState<string[]>([])
  const saved = useMemo(() => loadRun(), [])

  // ============ 开局选人页(从全部 12 人里自选,≤并聊上限) ============
  if (picking && pending) {
    const chars = getCharacters(pending.version)
    const cap = parallelCap(pending.maxEnergy)
    const toggle = (id: string) =>
      setPicks((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length < cap ? [...p, id] : p))
    const confirm = () => {
      for (const id of picks) {
        pending.npcs[id].stage = 'chatting'
        pending.npcs[id].unread = true
      }
      onStart(pending)
    }
    return (
      <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px 4px', flexShrink: 0 }}>
          <button className="btn ghost" style={{ width: 'auto', padding: '2px 0', fontSize: 14 }} onClick={() => setPicking(false)}>
            ← 返回
          </button>
          <h2 style={{ fontSize: 19, fontWeight: 900, marginTop: 2 }}>
            先聊谁?(已选 {picks.length}/{cap})
          </h2>
          <p style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 4, lineHeight: 1.7 }}>
            这一池人都在。精力只够同时聊 {cap} 个,先挑最想聊的。其余人日后腾出名额可再解锁。
          </p>
        </div>
        <div className="scroll" style={{ padding: '8px 16px', minHeight: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {chars.map((c) => {
              const on = picks.includes(c.id)
              const full = !on && picks.length >= cap
              return (
                <button
                  key={c.id}
                  className="npc-card"
                  disabled={full}
                  style={{
                    borderColor: on ? c.color : undefined,
                    background: on ? `${c.color}18` : undefined,
                    opacity: full ? 0.4 : 1,
                  }}
                  onClick={() => toggle(c.id)}
                >
                  <div className="big-avatar" style={{ background: `${c.color}33`, border: `1.5px solid ${c.color}66` }}>
                    {c.emoji}
                  </div>
                  <div className="info">
                    <div className="name">{c.name}</div>
                    <div className="sub" style={{ whiteSpace: 'normal' }}>
                      {c.bio}
                    </div>
                  </div>
                  {on && <span style={{ color: c.color, fontWeight: 800 }}>✓</span>}
                </button>
              )
            })}
          </div>
        </div>
        <div style={{ padding: '8px 16px calc(12px + var(--safe-bottom))', flexShrink: 0, borderTop: '1px solid var(--line)' }}>
          <button
            className="btn primary"
            disabled={picks.length === 0}
            style={picks.length === 0 ? { opacity: 0.5 } : undefined}
            onClick={confirm}
          >
            {picks.length === 0 ? '至少选一个人开聊' : `就聊这 ${picks.length} 个,开始 →`}
          </button>
        </div>
      </div>
    )
  }

  // ============ 投胎揭晓页 ============
  if (pending) {
    const origin = ORIGINS.find((o) => o.id === pending.origin)!
    const profT = findProfession(pending.prof)
    const eduT = findEdu(pending.edu)
    return (
      <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="scroll" style={{ padding: '10vh 22px 16px' }}>
          <div style={{ textAlign: 'center', fontSize: 46 }}>{origin.emoji}</div>
          <h2 style={{ textAlign: 'center', fontSize: 24, fontWeight: 900, margin: '10px 0 4px' }}>
            {profT.name} · {origin.name}
          </h2>
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-faint)', marginBottom: 16 }}>
            —— 投胎结果,不可重投。北京不接受退货。——
          </p>
          <p style={{ fontSize: 14.5, color: 'var(--text-dim)', lineHeight: 1.9 }}>{origin.reveal}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 18, justifyContent: 'center' }}>
            <span className="slot-tag">
              {eduT.emoji} {eduT.name}
              {eduT.style === 'frame' ? '(说话有框架)' : eduT.style === 'flatter' ? '(嘴甜会来事)' : ''}
            </span>
            <span className="slot-tag">
              {profT.emoji} {profT.name}({profT.tier})
            </span>
            <span className="slot-tag">💰 存款 ¥{pending.wallet}</span>
            <span className="slot-tag">🏠 {pending.rent > 0 ? `房租 ¥${pending.rent}/月(哪天收?看房东心情)` : '有房(家里给的)'}</span>
            <span className="slot-tag">💼 月薪 ¥{pending.salary}</span>
            <span className="slot-tag">⚡ 精力 {pending.maxEnergy}(并聊上限 {parallelCap(pending.maxEnergy)} 人)</span>
            <span className="slot-tag">🎓 文化水平 {pending.skills.culture}</span>
            <span className="slot-tag">🍺 酒量 ???(喝了才知道)</span>
          </div>
        </div>
        <div style={{ padding: '8px 16px calc(12px + var(--safe-bottom))', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {getRerollTokens() > 0 && (
            <button
              className="btn"
              style={{ borderColor: 'rgba(192,132,252,.4)' }}
              onClick={() => {
                useRerollToken()
                setPicks([])
                setPending(newGame(pending.version, pending.edu, pending.prof))
              }}
            >
              🎲 不服这命?重投一次(剩 {getRerollTokens()} 次 · 靠成就攒的)
            </button>
          )}
          <button className="btn primary" onClick={() => setPicking(true)}>
            🚀 就这命了,去挑人开聊
          </button>
        </div>
      </div>
    )
  }

  // ============ 标题页 ============
  if (!version) {
    return (
      <div className="scroll fade-in" style={{ padding: '0 22px' }}>
        <div style={{ textAlign: 'center', paddingTop: '13vh' }}>
          <div style={{ fontSize: 58 }}>💘</div>
          <h1 style={{ fontSize: 30, fontWeight: 900, marginTop: 8, letterSpacing: 1 }}>
            北京<span style={{ color: 'var(--accent)' }}>Dating</span>模拟器
            <sup style={{ fontSize: 13, color: 'var(--accent2)', marginLeft: 4 }}>v3</sup>
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: 13.5, marginTop: 8, lineHeight: 1.8 }}>
            14天 · 一整池北京男女 · 一张随时会塌的关系网
            <br />
            一款人均社死的恋爱冒险游戏
          </p>
          <div style={{ color: 'var(--text-faint)', fontSize: 11, marginTop: 6, letterSpacing: 1 }}>
            v3 · 260709
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 40 }}>
          {saved && (
            <button className="btn primary" onClick={() => onStart(saved)}>
              ▶️ 继续上一局(第{saved.day}天 · {saved.version === 'male' ? '男版' : '女版'})
            </button>
          )}
          <button
            className="btn"
            onClick={() => {
              setEdu(null)
              setEduDone(false)
              setProf(null)
              setVersion('male')
            }}
          >
            🕹️ 男版开局 <span style={{ color: 'var(--text-faint)', fontSize: 12 }}>攻略她们</span>
          </button>
          <button
            className="btn"
            onClick={() => {
              setEdu(null)
              setEduDone(false)
              setProf(null)
              setVersion('female')
            }}
          >
            🕹️ 女版开局 <span style={{ color: 'var(--text-faint)', fontSize: 12 }}>攻略他们</span>
          </button>
          <button className="btn ghost" onClick={onGallery}>
            📖 结局图鉴 & 暗号
          </button>
        </div>
        <p style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--text-faint)', marginTop: 26, lineHeight: 1.8 }}>
          两个版本共享同一个北京,通关可获得跨版本暗号
          <br />
          本游戏纯属虚构,如有雷同,那没事了,北京就这样
        </p>
      </div>
    )
  }

  // ============ 第一步:教育背景(说话风格) ============
  if (!eduDone) {
    return (
      <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px 4px', flexShrink: 0 }}>
          <button className="btn ghost" style={{ width: 'auto', padding: '2px 0', fontSize: 14 }} onClick={() => setVersion(null)}>
            ← 返回
          </button>
          <h2 style={{ fontSize: 19, fontWeight: 900, marginTop: 2 }}>第一步:你是怎么长大的?</h2>
          <p style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 4, lineHeight: 1.7 }}>
            教育背景决定你的说话方式——<b>框架</b>还是<b>会来事</b>。有人吃逻辑,有人吃彩虹屁,聊错频道全白搭。
          </p>
        </div>
        <div className="scroll" style={{ padding: '10px 16px', minHeight: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {EDU_BGS.map((t) => (
              <button
                key={t.id}
                className="npc-card"
                style={{
                  borderColor: edu === t.id ? 'var(--accent)' : undefined,
                  background: edu === t.id ? 'rgba(255,93,143,.08)' : undefined,
                }}
                onClick={() => setEdu(t.id)}
              >
                <div className="big-avatar" style={{ background: 'var(--panel2)' }}>
                  {t.emoji}
                </div>
                <div className="info">
                  <div className="name">{t.name}</div>
                  <div className="sub" style={{ whiteSpace: 'normal' }}>
                    {t.desc}
                  </div>
                </div>
                {edu === t.id && <span style={{ color: 'var(--accent)', fontWeight: 800 }}>✓</span>}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: 12, borderRadius: 12, background: 'var(--card)', border: '1px dashed var(--line)', fontSize: 12.5, color: 'var(--text-dim)', lineHeight: 1.8 }}>
            💬 <b>风格须知</b>:对话里会出现「框架感」或「谄媚系」的专属选项——说给吃这套的人,大加分;
            说给不吃的人,反被扣。谁吃哪套,自己聊着摸。
          </div>
        </div>
        <div style={{ padding: '8px 16px calc(12px + var(--safe-bottom))', flexShrink: 0, borderTop: '1px solid var(--line)' }}>
          <button
            className="btn primary"
            disabled={!edu}
            style={!edu ? { opacity: 0.5 } : undefined}
            onClick={() => edu && setEduDone(true)}
          >
            {edu ? '下一步:选职业 →' : '先选一个出身'}
          </button>
        </div>
      </div>
    )
  }

  // ============ 第二步:职业卡 + 投胎 ============
  const profs = getProfessions(version)
  const tiers: ('底层' | '中层' | '顶层')[] = ['底层', '中层', '顶层']
  return (
    <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px 4px', flexShrink: 0 }}>
        <button className="btn ghost" style={{ width: 'auto', padding: '2px 0', fontSize: 14 }} onClick={() => setEduDone(false)}>
          ← 返回
        </button>
        <h2 style={{ fontSize: 19, fontWeight: 900, marginTop: 2 }}>第二步:你在北京,靠什么吃饭?</h2>
        <p style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 4, lineHeight: 1.7 }}>
          职业决定月薪、房租、文化水平和你在班上会遇到什么事。精力和家底?那要看投胎。
        </p>
      </div>

      <div className="scroll" style={{ padding: '10px 16px', minHeight: 0 }}>
        {tiers.map((tier) => (
          <div key={tier}>
            <div style={{ fontSize: 12, color: 'var(--text-faint)', fontWeight: 700, letterSpacing: 2, margin: '10px 0 7px' }}>
              — {tier} —
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {profs
                .filter((t) => t.tier === tier)
                .map((t) => (
                  <button
                    key={t.id}
                    className="npc-card"
                    style={{
                      borderColor: prof === t.id ? 'var(--accent)' : undefined,
                      background: prof === t.id ? 'rgba(255,93,143,.08)' : undefined,
                    }}
                    onClick={() => setProf(t.id)}
                  >
                    <div className="big-avatar" style={{ background: 'var(--panel2)' }}>
                      {t.emoji}
                    </div>
                    <div className="info">
                      <div className="name">
                        {t.name}
                        <span style={{ fontSize: 11, color: 'var(--accent2)', fontWeight: 600, marginLeft: 6 }}>
                          月薪¥{t.salary} · 房租¥{t.rent} · 文化{t.culture}
                        </span>
                      </div>
                      <div className="sub" style={{ whiteSpace: 'normal' }}>
                        {t.desc}
                      </div>
                    </div>
                    {prof === t.id && <span style={{ color: 'var(--accent)', fontWeight: 800 }}>✓</span>}
                  </button>
                ))}
            </div>
          </div>
        ))}

        <div style={{ marginTop: 16, padding: 12, borderRadius: 12, background: 'var(--card)', border: '1px dashed var(--line)', fontSize: 12.5, color: 'var(--text-dim)', lineHeight: 1.8 }}>
          🎲 <b>投胎须知</b>:精力与家底由投胎骰决定,大概率是普通北漂;极小概率抽中传说出身
          (💰钞能力 / ⚡高精力宝宝),抽中才揭晓,<b>不可重投</b>。
          <br />
          🏠 房租不再天天扣——房东会在<b>某个随机日子</b>一次性收走整月房租,请留好余粮。
          <br />
          🍺 酒量每局随机,任何面板都不显示——喝了才知道。
        </div>
      </div>

      <div style={{ padding: '8px 16px calc(12px + var(--safe-bottom))', flexShrink: 0, borderTop: '1px solid var(--line)' }}>
        <button
          className="btn primary"
          disabled={!prof}
          style={!prof ? { opacity: 0.5 } : undefined}
          onClick={() => {
            if (!prof || !edu) return
            setPicks([])
            setPicking(false)
            setPending(newGame(version, edu, prof))
          }}
        >
          {prof ? `🎲 掷投胎骰(${version === 'male' ? '男版' : '女版'})` : '先选一个吃饭的家伙'}
        </button>
      </div>
    </div>
  )
}
