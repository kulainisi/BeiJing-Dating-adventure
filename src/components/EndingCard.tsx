import { useRef, useState } from 'react'
import { EndingDef, GameState } from '@/engine/types'
import { XhsPost } from './XhsPost'

const RANK_STYLE: Record<EndingDef['rank'], { label: string; bg: string; chip: string }> = {
  win: { label: 'WIN · 上岸', bg: 'linear-gradient(160deg,#3b1d3a,#1b2433)', chip: 'rgba(255,93,143,.2)' },
  draw: { label: 'DRAW · 平局', bg: 'linear-gradient(160deg,#1d2c3e,#1b2433)', chip: 'rgba(94,173,247,.2)' },
  lose: { label: 'LOSE · 寄了', bg: 'linear-gradient(160deg,#332020,#1b2433)', chip: 'rgba(248,113,113,.2)' },
  egg: { label: 'EGG · 彩蛋', bg: 'linear-gradient(160deg,#2c2140,#1b2433)', chip: 'rgba(192,132,252,.2)' },
}

function stars(n: number) {
  return '★'.repeat(n) + '☆'.repeat(5 - n)
}

interface Props {
  ending: EndingDef
  state: GameState
  npcName?: string
  detail?: string
  onRestart: () => void
  onGallery: () => void
}

export function EndingCard({ ending, state, npcName, detail, onRestart, onGallery }: Props) {
  const rs = RANK_STYLE[ending.rank]
  const [saved, setSaved] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const sqm = (state.stats.spent / 80000).toFixed(5)

  function exportCard() {
    try {
      const c = document.createElement('canvas')
      c.width = 720
      c.height = 1080
      const g = c.getContext('2d')!
      const grad = g.createLinearGradient(0, 0, 720, 1080)
      grad.addColorStop(0, '#231433')
      grad.addColorStop(1, '#0d1420')
      g.fillStyle = grad
      g.fillRect(0, 0, 720, 1080)
      g.fillStyle = 'rgba(255,255,255,.06)'
      for (let i = 0; i < 5; i++) g.fillRect(0, 200 + i * 160, 720, 1)

      g.textAlign = 'center'
      g.fillStyle = '#ffb84d'
      g.font = '28px sans-serif'
      g.fillText(`—— ${rs.label} ——`, 360, 130)
      g.fillStyle = '#fff'
      g.font = 'bold 52px sans-serif'
      wrapText(g, ending.title, 360, 220, 620, 64)
      g.fillStyle = '#ffd166'
      g.font = '36px sans-serif'
      g.fillText(stars(ending.stars), 360, 330)
      g.fillStyle = '#c084fc'
      g.font = 'bold 34px sans-serif'
      g.fillText(`获得称号:${ending.badge}`, 360, 410)
      g.fillStyle = '#aab7c9'
      g.font = '26px sans-serif'
      wrapText(g, ending.comment, 360, 480, 600, 42)
      g.fillStyle = '#93a1b5'
      g.font = '24px sans-serif'
      g.fillText(`累计消费 ¥${state.stats.spent} ≈ ${sqm}㎡北京房价`, 360, 840)
      g.fillText(
        `拉黑${state.stats.blocks}次 · 踩雷${state.stats.mines}次 · 断片${state.stats.blackouts}次`,
        360,
        885,
      )
      if (ending.secretCode) {
        g.fillStyle = '#c084fc'
        g.font = 'bold 30px sans-serif'
        g.fillText(`暗号:${ending.secretCode}`, 360, 950)
      }
      g.fillStyle = '#5b6b80'
      g.font = '22px sans-serif'
      g.fillText('《北京Dating模拟器》· 一款人均社死的恋爱冒险', 360, 1020)

      const a = document.createElement('a')
      a.download = `北京Dating结局-${ending.title}.png`
      a.href = c.toDataURL('image/png')
      a.click()
      setSaved(true)
    } catch {
      setSaved(true)
    }
  }

  return (
    <div className="scroll fade-in" style={{ paddingBottom: 20 }}>
      <div className="ending-card" ref={cardRef} style={{ background: rs.bg }}>
        <div className="ending-head">
          <span className="rank-tag" style={{ background: rs.chip }}>
            {rs.label}
          </span>
          <h1>{ending.title}</h1>
          <div className="stars" style={{ color: '#ffd166' }}>
            {stars(ending.stars)}
          </div>
        </div>
        <div className="ending-badge">🏅 获得称号:{ending.badge}</div>
        <div className="ending-comment">
          {npcName && <div style={{ marginBottom: 8, color: '#e8ecf3' }}>对象:{npcName}</div>}
          {detail && <div style={{ marginBottom: 8, color: '#e8ecf3' }}>{detail}</div>}
          {ending.comment}
        </div>
        <div className="ending-stats">
          <div className="stat-cell">
            <div className="k">本局消费</div>
            <div className="v">¥{state.stats.spent}</div>
          </div>
          <div className="stat-cell">
            <div className="k">≈ 北京房价</div>
            <div className="v">{sqm}㎡</div>
          </div>
          <div className="stat-cell">
            <div className="k">被拉黑 / 观点踩雷</div>
            <div className="v">
              {state.stats.blocks} / {state.stats.mines}
            </div>
          </div>
          <div className="stat-cell">
            <div className="k">断片次数</div>
            <div className="v">{state.stats.blackouts}</div>
          </div>
          <div className="stat-cell">
            <div className="k">最高同时并聊</div>
            <div className="v">{state.stats.maxParallel} 人</div>
          </div>
          <div className="stat-cell">
            <div className="k">检定 成/败</div>
            <div className="v">
              {state.stats.checksPassed} / {state.stats.checksFailed}
            </div>
          </div>
        </div>
        <div style={{ padding: '0 20px 8px', fontSize: 12, color: '#5b6b80', textAlign: 'center' }}>
          {state.stats.fateHits > 0
            ? `本局天命骰触发 ${state.stats.fateHits} 次——有些事,真的不怪你。`
            : '本局天命骰触发 0 次,你的一切都是自己挣的(或作的)。'}
        </div>
        {ending.secretCode && (
          <div className="secret-code">
            🔐 结局暗号(在另一版本的图鉴中输入可解锁隐藏剧情)
            <b>{ending.secretCode}</b>
          </div>
        )}
      </div>

      {ending.xhsPost && <XhsPost version={state.version} />}

      <div style={{ padding: '4px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn primary" onClick={exportCard}>
          📸 保存结局卡{saved ? '(保存失败可直接截图)' : ''}
        </button>
        <button className="btn" onClick={onRestart}>
          🔄 再来一局
        </button>
        <button className="btn ghost" onClick={onGallery}>
          📖 查看结局图鉴
        </button>
      </div>
    </div>
  )
}

function wrapText(
  g: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lineH: number,
) {
  let line = ''
  let yy = y
  for (const ch of text) {
    if (g.measureText(line + ch).width > maxW) {
      g.fillText(line, x, yy)
      line = ch
      yy += lineH
    } else {
      line += ch
    }
  }
  if (line) g.fillText(line, x, yy)
}
