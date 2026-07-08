import { useRef, useState } from 'react'
import QRCode from 'qrcode'
import { EndingDef, GameState } from '@/engine/types'
import { evaluatePlayer } from '@/engine/relations'
import { Achievement } from '@/engine/achievements'
import { shareUrl } from '@/config'
import { XhsPost } from './XhsPost'

const RANK_STYLE: Record<EndingDef['rank'], { label: string; bg: string; chip: string }> = {
  win: { label: 'WIN · 上岸', bg: 'linear-gradient(160deg,#3b1d3a,#1b2433)', chip: 'rgba(255,93,143,.2)' },
  draw: { label: 'DRAW · 平局', bg: 'linear-gradient(160deg,#1d2c3e,#1b2433)', chip: 'rgba(94,173,247,.2)' },
  lose: { label: 'LOSE · 寄了', bg: 'linear-gradient(160deg,#332020,#1b2433)', chip: 'rgba(248,113,113,.2)' },
  egg: { label: 'EGG · 彩蛋', bg: 'linear-gradient(160deg,#2c2140,#1b2433)', chip: 'rgba(192,132,252,.2)' },
}

/** 稀有度文案:按星级映射(无真实遥测,按稀有度伪造,足够激发攀比晒图) */
const RARITY: Record<number, string> = {
  5: '仅约 3% 玩家达成',
  4: '约 9% 玩家达成',
  3: '约 16% 玩家达成',
  2: '约 28% 玩家达成',
  1: '约 42% 玩家达成',
  0: '约 22% 玩家达成',
}

function stars(n: number) {
  return '★'.repeat(n) + '☆'.repeat(5 - n)
}

interface Props {
  ending: EndingDef
  state: GameState
  npcName?: string
  detail?: string
  newAchievements?: Achievement[]
  onRestart: () => void
  onGallery: () => void
}

export function EndingCard({ ending, state, npcName, detail, newAchievements, onRestart, onGallery }: Props) {
  const rs = RANK_STYLE[ending.rank]
  const v = evaluatePlayer(state)
  const rarity = RARITY[ending.stars] ?? ''
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
    c.height = 1360
    const g = c.getContext('2d')!
    const grad = g.createLinearGradient(0, 0, 720, 1360)
    grad.addColorStop(0, '#231433')
    grad.addColorStop(1, '#0d1420')
    g.fillStyle = grad
    g.fillRect(0, 0, 720, 1360)
    g.fillStyle = 'rgba(255,255,255,.05)'
    for (let i = 0; i < 6; i++) g.fillRect(0, 220 + i * 150, 720, 1)

    g.textAlign = 'center'
    let y = 108

    // ===== 头版:北京人物鉴定报告 =====
    g.fillStyle = '#ffb84d'
    g.font = 'bold 28px sans-serif'
    g.fillText('🧬 北京人物鉴定报告', 360, y)
    y += 68
    g.fillStyle = '#fff'
    g.font = 'bold 50px sans-serif'
    y = wrapText(g, v.title, 360, y, 630, 60) + 46
    // 标签
    g.fillStyle = '#c084fc'
    g.font = 'bold 27px sans-serif'
    y = wrapText(g, v.tags.join('  '), 360, y, 620, 38) + 30
    // 稀有度
    g.fillStyle = '#ffd166'
    g.font = '30px sans-serif'
    g.fillText(`${stars(ending.stars)}  ·  ${rarity}`, 360, y)
    y += 54
    // 鉴定评语
    g.fillStyle = '#aab7c9'
    g.font = '26px sans-serif'
    y = wrapText(g, v.verdict, 360, y, 600, 40) + 40

    // ===== 分隔 + 本局感情线(次要) =====
    g.strokeStyle = 'rgba(255,255,255,.14)'
    g.beginPath()
    g.moveTo(80, y)
    g.lineTo(640, y)
    g.stroke()
    y += 44
    g.fillStyle = '#5b6b80'
    g.font = '22px sans-serif'
    g.fillText(`— 本局感情线 · ${rs.label} —`, 360, y)
    y += 46
    g.fillStyle = '#e8ecf3'
    g.font = 'bold 32px sans-serif'
    y = wrapText(g, ending.title, 360, y, 600, 40) + 12
    g.fillStyle = '#c084fc'
    g.font = '25px sans-serif'
    g.fillText(`🏅 ${ending.badge}`, 360, y)
    y += 52

    // ===== 数据墙 =====
    g.fillStyle = '#93a1b5'
    g.font = '23px sans-serif'
    g.fillText(`累计消费 ¥${state.stats.spent} ≈ ${sqm}㎡北京房价`, 360, y)
    y += 38
    g.fillText(
      `拉黑${state.stats.blocks} · 踩雷${state.stats.mines} · 暖心${state.stats.careCount ?? 0} · 加班${state.stats.workCount ?? 0}`,
      360,
      y,
    )
    if (ending.secretCode) {
      y += 44
      g.fillStyle = '#c084fc'
      g.font = 'bold 28px sans-serif'
      g.fillText(`暗号:${ending.secretCode}`, 360, y)
    }

    // ===== 二维码(扫码即玩) =====
    const qr = document.createElement('canvas')
    await QRCode.toCanvas(qr, shareUrl(), {
      width: 168,
      margin: 1,
      color: { dark: '#1b1030', light: '#ffffff' },
    })
    const qx = 360 - 92
    const qy = 1120
    g.fillStyle = '#ffffff'
    roundRect(g, qx, qy, 184, 184, 16)
    g.fill()
    g.drawImage(qr, qx + 8, qy + 8, 168, 168)
    g.fillStyle = '#e8ecf3'
    g.font = 'bold 25px sans-serif'
    g.fillText('📱 扫码进入游戏,来北京Dating', 360, 1336)

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
      const file = new File([blob], `北京Dating人物鉴定-${v.title}.png`, { type: 'image/png' })
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
    a.download = `北京Dating人物鉴定-${v.title}.png`
    a.href = (await drawCanvas()).toDataURL('image/png')
    a.click()
  }

  return (
    <div className="scroll fade-in" style={{ paddingBottom: 20 }}>
      <div className="ending-card" ref={cardRef} style={{ background: rs.bg }}>
        {/* ===== 头版:北京人物鉴定报告(C 位) ===== */}
        <div className="verdict-head">
          <span className="rank-tag" style={{ background: rs.chip }}>
            🧬 北京人物鉴定报告
          </span>
          <h1>{v.title}</h1>
          <div className="verdict-tags">
            {v.tags.map((t) => (
              <span key={t} className="vtag">
                {t}
              </span>
            ))}
          </div>
          <div className="verdict-rarity">
            <span style={{ color: '#ffd166' }}>{stars(ending.stars)}</span> · {rarity}
          </div>
        </div>
        <div className="verdict-body">{v.verdict}</div>

        {newAchievements && newAchievements.length > 0 && (
          <div className="ach-earned">
            <div className="ach-earned-h">🏅 本局新成就 · 获得 {newAchievements.length} 次重投投胎骰</div>
            <div className="ach-earned-list">
              {newAchievements.map((a) => (
                <span key={a.id} className="ach-chip">
                  {a.emoji} {a.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ===== 本局感情线(次要背景) ===== */}
        <div className="love-line">
          <div className="ll-label">— 本局感情线 · {rs.label} —</div>
          <div className="ll-title">{ending.title}</div>
          <div className="ll-stars">{stars(ending.stars)}</div>
          <div className="ll-badge">🏅 {ending.badge}</div>
          {subBadges.length > 0 && <div className="ll-sub">副称号:{subBadges.join(' · ')}</div>}
          <div className="ll-comment">
            {npcName && <span style={{ color: '#e8ecf3' }}>对象:{npcName}　</span>}
            {detail && <span style={{ color: '#e8ecf3' }}>{detail}　</span>}
            {ending.comment}
          </div>
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
            <div className="k">暖心 / 加班</div>
            <div className="v">
              {state.stats.careCount ?? 0} / {state.stats.workCount ?? 0}
            </div>
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
          📸 保存人物鉴定卡
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
          <img src={preview} alt="人物鉴定卡" />
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

/** 居中折行绘制,返回最后一行的 y(供上层继续往下排版) */
function wrapText(
  g: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lineH: number,
): number {
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
  return yy
}
