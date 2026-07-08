import { useState } from 'react'
import { CODES, getAllEndings } from '@/content'
import { getGallery, tryUnlockCode } from '@/engine/save'
import { EndingDef } from '@/engine/types'

const RANK_EMOJI: Record<EndingDef['rank'], string> = {
  win: '🏆',
  draw: '🤝',
  lose: '💀',
  egg: '🥚',
}

export function Gallery({ onBack }: { onBack: () => void }) {
  const [g, setG] = useState(getGallery())
  const [input, setInput] = useState('')
  const [msg, setMsg] = useState('')
  const all = getAllEndings()

  function submitCode() {
    const hit = tryUnlockCode(input, CODES)
    if (hit) {
      const c = CODES.find((x) => x.id === hit)!
      setMsg(`✅ 暗号正确!已解锁:${c.unlocks}`)
      setG(getGallery())
      setInput('')
    } else {
      setMsg('❌ 暗号不对。去另一个版本通关拿结局卡吧。')
    }
  }

  const total = all.reduce((a, v) => a + v.list.length, 0)

  return (
    <div className="scroll fade-in" style={{ padding: '14px 14px 30px' }}>
      <button className="btn ghost" style={{ width: 'auto', padding: '4px 0', fontSize: 14 }} onClick={onBack}>
        ← 返回
      </button>
      <h2 style={{ fontSize: 22, fontWeight: 900, margin: '6px 0 2px' }}>结局图鉴</h2>
      <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>
        已解锁 {g.unlocked.length} / {total} · 累计 {g.runs} 局
      </div>

      <div className="section-title">🔐 跨版本暗号</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入另一版本结局卡上的暗号"
          style={{
            flex: 1,
            background: 'var(--card)',
            border: '1px solid var(--line)',
            borderRadius: 12,
            padding: '10px 12px',
            color: 'var(--text)',
            fontSize: 14,
          }}
        />
        <button className="btn" style={{ width: 'auto', padding: '10px 16px' }} onClick={submitCode}>
          解锁
        </button>
      </div>
      {msg && <div style={{ fontSize: 12.5, marginTop: 8, color: 'var(--text-dim)' }}>{msg}</div>}
      {g.codes.length > 0 && (
        <div style={{ fontSize: 12.5, marginTop: 8, color: 'var(--purple)' }}>
          已解锁暗号:{g.codes.map((id) => CODES.find((c) => c.id === id)?.code).join(' · ')}
        </div>
      )}

      {all.map((group) => (
        <div key={group.version}>
          <div className="section-title">
            {group.version === 'male' ? '🕹️ 男版结局' : '🕹️ 女版结局'}(
            {group.list.filter((e) => g.unlocked.includes(e.id)).length}/{group.list.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {group.list.map((e) => {
              const un = g.unlocked.includes(e.id)
              return (
                <div className={`gallery-item ${un ? '' : 'locked'}`} key={`${group.version}_${e.id}`}>
                  <div className="g-rank">{un ? RANK_EMOJI[e.rank] : '🔒'}</div>
                  <div>
                    <div className="g-title">{un ? e.title : '???'}</div>
                    <div className="g-hint">{un ? `称号:${e.badge}` : `解锁提示:${e.hint}`}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {g.deaths.length > 0 && (
        <>
          <div className="section-title">🪦 死因墙(你被拉黑的一万种方式)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {g.deaths.map((d, i) => (
              <div className="death-item" key={i}>
                卒于:{d}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
