import { useRef, useState } from 'react'
import QRCode from 'qrcode'
import { EndingDef, GameState } from '@/engine/types'
import { shareUrl } from '@/config'
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
  const [preview, setPreview] = useState<string | null>(null)
  const [shareMsg, setShareMsg] = useState('')
  const cardRef = useRef<HTMLDivElement>(null)

  const sqm = (state.stats.spent / 80000).toFixed(5)
  // 副称号:根据本局行为追加
  const stayedCount = Object.values(state.npcs).filter((n) => n.flags.includes('stayed')).length
  const subBadges: string[] = []
  if (state.stats.maxParallel >= 4) subBadges.push('🐟 鱼塘承包人')
  if (stayedCount >= 2) subBadges.push('🍔 都市快餐评鉴家')
  if (state.origin === 'rich') subBadges.push('💰 钞能力持有者')
  if (state.origin === 'energetic') subBadges.push('⚡ 高精力宝宝')

  async function drawCanvas(): Promise<HTMLCanvasElement> {
    const c = document.createElement('canvas')
    c.width = 720
    c.height = 1240
    const g = c.getContext('2d')!
    const grad = g.createLinearGradient(0, 0, 720, 1240)
    grad.addColorStop(0, '#231433')
    grad.addColorStop(1, '#0d1420')
    g.fillStyle = grad
    g.fillRect(0, 0, 720, 1240)
    g.fillStyle = 'rgba(255,255,255,.06)'
    for (let i = 0; i < 6; i++) g.fillRect(0, 200 + i * 160, 720, 1)

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
      g.fillText(`暗号:${ending.secretCode}`, 360, 948)
    }

    // 游戏链接二维码(扫码即玩,方便传播)
    const qr = document.createElement('canvas')
    await QRCode.toCanvas(qr, shareUrl(), {
      width: 168,
      margin: 1,
      color: { dark: '#1b1030', light: '#ffffff' },
    })
    const qx = 360 - 92
    const qy = 980
    g.fillStyle = '#ffffff'
    roundRect(g, qx, qy, 184, 184, 16)
    g.fill()
    g.drawImage(qr, qx + 8, qy + 8, 168, 168)
    g.fillStyle = '#e8ecf3'
    g.font = 'bold 26px sans-serif'
    g.fillText('📱 扫码进入游戏,来北京Dating', 360, 1200)
    g.fillStyle = '#5b6b80'
    g.font = '20px sans-serif'
    g.fillText('《北京Dating模拟器》v2 · 一款人均社死的恋爱冒险', 360, 1230)

    return c
  }

  async function openPreview() {
    setShareMsg('')
    setPreview((await drawCanvas()).toDataURL('image/png'))
  }

  /** 手机端:走系统分享面板(可直接「保存图片」到相册);不支持时提示长按 */
  async function shareToAlbum() {
    try {
      const c = await drawCanvas()
      const blob: Blob | null = await new Promise((res) => c.toBlob(res, 'image/png'))
      if (!blob) throw new Error('no blob')
      const file = new File([blob], `北京Dating结局-${ending.title}.png`, { type: 'image/png' })
      const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean }
      if (nav.canShare && nav.canShare({ files: [file] }) && nav.share) {
        await nav.share({ files: [file], title: '北京Dating模拟器' })
        return
      }
      setShareMsg('当前浏览器不支持系统分享,请长按上面的图片保存到相册')
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return // 用户取消分享,不算错
      setShareMsg('分享未成功,请长按上面的图片保存到相册')
    }
  }

  /** 桌面端:下载 PNG 文件 */
  async function downloadFile() {
    const a = document.createElement('a')
    a.download = `北京Dating结局-${ending.title}.png`
    a.href = (await drawCanvas()).toDataURL('image/png')
    a.click()
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
        <div className="ending-badge">
          🏅 获得称号:{ending.badge}
          {subBadges.length > 0 && (
            <div style={{ fontSize: 12, marginTop: 4, color: 'var(--text-dim)', fontWeight: 600 }}>
              副称号:{subBadges.join(' · ')}
            </div>
          )}
        </div>
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
        <button className="btn primary" onClick={openPreview}>
          📸 保存结局卡
        </button>
        <button className="btn" onClick={onRestart}>
          🔄 再来一局
        </button>
        <button className="btn ghost" onClick={onGallery}>
          📖 查看结局图鉴
        </button>
      </div>

      {preview && (
        <div className="img-overlay" onClick={(e) => e.target === e.currentTarget && setPreview(null)}>
          <img src={preview} alt="结局卡" />
          <div className="hint">
            📱 手机:<b>长按图片</b>即可保存到相册
            {shareMsg && (
              <>
                <br />
                {shareMsg}
              </>
            )}
          </div>
          <div className="actions">
            <button className="btn primary" onClick={shareToAlbum}>
              📤 保存到相册 / 分享
            </button>
            <button className="btn" onClick={downloadFile}>
              💾 下载图片文件(电脑用)
            </button>
            <button className="btn ghost" onClick={() => setPreview(null)}>
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function roundRect(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  g.beginPath()
  g.moveTo(x + r, y)
  g.arcTo(x + w, y, x + w, y + h, r)
  g.arcTo(x + w, y + h, x, y + h, r)
  g.arcTo(x, y + h, x, y, r)
  g.arcTo(x, y, x + w, y, r)
  g.closePath()
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
