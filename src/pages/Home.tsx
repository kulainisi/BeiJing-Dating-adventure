import { useMemo, useState } from 'react'
import { GameState, SKILL_MAX, SKILL_MIN, SKILL_POINTS, SKILLS, SkillId, Version } from '@/engine/types'
import { newGame } from '@/engine/game'
import { loadRun } from '@/engine/save'

const PRESETS: { name: string; skills: Record<SkillId, number> }[] = [
  { name: '⚖️ 六边形废物', skills: { mouth: 3, mind: 3, liquor: 3, culture: 3, image: 4, money: 4 } },
  { name: '💬 嘴强王者', skills: { mouth: 8, mind: 5, liquor: 1, culture: 2, image: 2, money: 2 } },
  { name: '💰 钞能力选手', skills: { mouth: 2, mind: 2, liquor: 2, culture: 1, image: 5, money: 8 } },
  { name: '🎨 落魄文青', skills: { mouth: 3, mind: 3, liquor: 3, culture: 8, image: 2, money: 1 } },
  { name: '🧠 人间清醒', skills: { mouth: 3, mind: 8, liquor: 3, culture: 2, image: 2, money: 2 } },
]

export function Home({
  onStart,
  onGallery,
}: {
  onStart: (s: GameState) => void
  onGallery: () => void
}) {
  const [version, setVersion] = useState<Version | null>(null)
  const [skills, setSkills] = useState<Record<SkillId, number>>(PRESETS[0].skills)
  const saved = useMemo(() => loadRun(), [])

  const used = SKILLS.reduce((a, s) => a + skills[s.id], 0)
  const left = SKILL_POINTS - used

  function adjust(id: SkillId, d: number) {
    const v = skills[id] + d
    if (v < SKILL_MIN || v > SKILL_MAX) return
    if (d > 0 && left <= 0) return
    setSkills({ ...skills, [id]: v })
  }

  if (!version) {
    return (
      <div className="scroll fade-in" style={{ padding: '0 22px' }}>
        <div style={{ textAlign: 'center', paddingTop: '13vh' }}>
          <div style={{ fontSize: 58 }}>💘</div>
          <h1 style={{ fontSize: 30, fontWeight: 900, marginTop: 8, letterSpacing: 1 }}>
            北京<span style={{ color: 'var(--accent)' }}>Dating</span>模拟器
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: 13.5, marginTop: 8, lineHeight: 1.8 }}>
            14天 · 5个人 · 一张随时会塌的关系网
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

  return (
    <div className="scroll fade-in" style={{ padding: '18px 16px 24px' }}>
      <button className="btn ghost" style={{ width: 'auto', padding: '4px 0', fontSize: 14 }} onClick={() => setVersion(null)}>
        ← 返回
      </button>
      <h2 style={{ fontSize: 21, fontWeight: 900, marginTop: 6 }}>出生点数分配</h2>
      <p style={{ fontSize: 12.5, color: 'var(--text-dim)', margin: '6px 0 14px', lineHeight: 1.7 }}>
        把 {SKILL_POINTS} 点天赋分给六维。北京不相信眼泪,但相信面板。
        <br />
        剩余点数:<b style={{ color: left > 0 ? 'var(--accent2)' : 'var(--green)', fontSize: 15 }}>{left}</b>
      </p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {PRESETS.map((p) => (
          <button
            key={p.name}
            className="btn"
            style={{ width: 'auto', padding: '6px 12px', fontSize: 12.5, borderRadius: 999 }}
            onClick={() => setSkills(p.skills)}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {SKILLS.map((s) => (
          <div className="skill-row" key={s.id}>
            <div className="s-emoji">{s.emoji}</div>
            <div className="s-info">
              <div className="s-name">{s.name}</div>
              <div className="s-desc">{s.desc}</div>
              <div className="pips">
                {Array.from({ length: SKILL_MAX }, (_, i) => (
                  <i key={i} className={i < skills[s.id] ? 'on' : ''} />
                ))}
              </div>
            </div>
            <button className="pt-btn" disabled={skills[s.id] <= SKILL_MIN} onClick={() => adjust(s.id, -1)}>
              −
            </button>
            <div className="s-val">{skills[s.id]}</div>
            <button
              className="pt-btn"
              disabled={skills[s.id] >= SKILL_MAX || left <= 0}
              onClick={() => adjust(s.id, 1)}
            >
              +
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-faint)' }}>
        💰 钞能力 {skills.money} → 开局资金 ¥{600 + skills.money * 350}
      </div>

      <button
        className="btn primary"
        style={{ marginTop: 16 }}
        disabled={left !== 0}
        onClick={() => onStart(newGame(version, skills))}
      >
        {left === 0 ? `🚀 开始这14天(${version === 'male' ? '男版' : '女版'})` : `还剩 ${left} 点没分完`}
      </button>
    </div>
  )
}
