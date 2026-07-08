import { useMemo, useState } from 'react'
import { EDU_TIERS, EduId, GameState, ORIGINS, parallelCap, Version } from '@/engine/types'
import { newGame } from '@/engine/game'
import { loadRun } from '@/engine/save'

export function Home({
  onStart,
  onGallery,
}: {
  onStart: (s: GameState) => void
  onGallery: () => void
}) {
  const [version, setVersion] = useState<Version | null>(null)
  const [edu, setEdu] = useState<EduId>('putong')
  const [pending, setPending] = useState<GameState | null>(null)
  const saved = useMemo(() => loadRun(), [])

  // ============ 投胎揭晓页 ============
  if (pending) {
    const origin = ORIGINS.find((o) => o.id === pending.origin)!
    const eduT = EDU_TIERS.find((e) => e.id === pending.edu)!
    return (
      <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="scroll" style={{ padding: '10vh 22px 16px' }}>
          <div style={{ textAlign: 'center', fontSize: 46 }}>{origin.emoji}</div>
          <h2 style={{ textAlign: 'center', fontSize: 24, fontWeight: 900, margin: '10px 0 4px' }}>
            {origin.name}
          </h2>
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-faint)', marginBottom: 16 }}>
            —— 投胎结果,不可重投。北京不接受退货。——
          </p>
          <p style={{ fontSize: 14.5, color: 'var(--text-dim)', lineHeight: 1.9 }}>{origin.reveal}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 18, justifyContent: 'center' }}>
            <span className="slot-tag">💰 存款 ¥{pending.wallet}</span>
            <span className="slot-tag">🏠 {pending.rent > 0 ? `房租 ¥${pending.rent}/月` : '有房(家里给的)'}</span>
            <span className="slot-tag">💼 月薪 ¥{pending.salary}</span>
            <span className="slot-tag">⚡ 精力 {pending.maxEnergy}(并聊上限 {parallelCap(pending.maxEnergy)} 人)</span>
            <span className="slot-tag">
              {eduT.emoji} 文化水平 {pending.skills.culture}
            </span>
            <span className="slot-tag">🍺 酒量 ???(喝了才知道)</span>
          </div>
        </div>
        <div style={{ padding: '8px 16px calc(12px + var(--safe-bottom))', flexShrink: 0 }}>
          <button className="btn primary" onClick={() => onStart(pending)}>
            🚀 就这命了,开始这14天
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
            <sup style={{ fontSize: 13, color: 'var(--accent2)', marginLeft: 4 }}>v2</sup>
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: 13.5, marginTop: 8, lineHeight: 1.8 }}>
            14天 · 一整池北京男女 · 一张随时会塌的关系网
            <br />
            一款人均社死的恋爱冒险游戏
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 40 }}>
          {saved && (
            <button className="btn primary" onClick={() => onStart(saved)}>
              ▶️ 继续上一局(第{saved.day}天 · {saved.version === 'male' ? '男版' : '女版'})
            </button>
          )}
          <button className="btn" onClick={() => setVersion('male')}>
            🕹️ 男版开局 <span style={{ color: 'var(--text-faint)', fontSize: 12 }}>攻略她们</span>
          </button>
          <button className="btn" onClick={() => setVersion('female')}>
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

  // ============ 文化三档 + 投胎 ============
  return (
    <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px 4px', flexShrink: 0 }}>
        <button className="btn ghost" style={{ width: 'auto', padding: '2px 0', fontSize: 14 }} onClick={() => setVersion(null)}>
          ← 返回
        </button>
        <h2 style={{ fontSize: 19, fontWeight: 900, marginTop: 2 }}>你把青春点给了什么?</h2>
        <p style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 4, lineHeight: 1.7 }}>
          唯一由你决定的,是文化背景。精力和钱?那要看投胎。
        </p>
      </div>

      <div className="scroll" style={{ padding: '10px 16px', minHeight: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {EDU_TIERS.map((t) => (
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
          🎲 <b>投胎须知</b>:精力与家底由投胎骰决定,大概率是普通北漂;极小概率抽中传说出身
          (💰钞能力 / ⚡高精力宝宝),抽中才揭晓,<b>不可重投</b>。
          <br />
          🍺 酒量每局随机,任何面板都不显示——喝了才知道。
        </div>
      </div>

      <div style={{ padding: '8px 16px calc(12px + var(--safe-bottom))', flexShrink: 0, borderTop: '1px solid var(--line)' }}>
        <button className="btn primary" onClick={() => setPending(newGame(version, edu))}>
          🎲 掷投胎骰({version === 'male' ? '男版' : '女版'})
        </button>
      </div>
    </div>
  )
}
