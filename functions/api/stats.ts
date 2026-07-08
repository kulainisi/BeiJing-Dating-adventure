/**
 * GET /api/stats?key=XXX — 作者看板:读回聚合计数(多少人玩 / 各结局多少次)。
 * 默认返回一个好看的 HTML 小看板;加 ?format=json 返回裸 JSON。
 * 用一个简单令牌(env.STATS_KEY / stats_key)挡一下公开访问;匿名聚合,无隐私数据。
 */
type KV = {
  get(key: string): Promise<string | null>
  list(opts?: { prefix?: string }): Promise<{ keys: { name: string }[] }>
}
interface Env {
  STATS?: KV
  stats?: KV
  STATS_KEY?: string
  stats_key?: string
}

const page = (title: string, body: string) =>
  `<!doctype html><html lang="zh"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title><style>
:root{color-scheme:dark}
*{box-sizing:border-box;margin:0}
body{background:#0d0d15;color:#e8ecf3;font-family:-apple-system,'PingFang SC','Microsoft YaHei',sans-serif;padding:20px;max-width:720px;margin:0 auto;line-height:1.5}
h1{font-size:20px;margin-bottom:2px}
.sub{color:#5b6b80;font-size:13px;margin-bottom:18px}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:22px}
.card{background:#1b2433;border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:12px}
.card .k{font-size:12px;color:#93a1b5}
.card .v{font-size:24px;font-weight:800;margin-top:2px}
.card .v small{font-size:12px;color:#5b6b80;font-weight:600}
h2{font-size:14px;color:#93a1b5;margin:18px 0 10px;letter-spacing:1px}
.row{display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.05)}
.lbl{width:210px;flex-shrink:0;font-size:13px;font-variant-numeric:tabular-nums;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bar{flex:1;height:8px;background:#1f2937;border-radius:999px;overflow:hidden}
.bar i{display:block;height:100%;background:linear-gradient(90deg,#ff5d8f,#ff8f5d)}
.num{width:96px;text-align:right;font-size:12px;color:#aab7c9;flex-shrink:0;font-variant-numeric:tabular-nums}
.empty{color:#5b6b80;padding:20px 0}
a{color:#5eadf7}
</style></head><body>${body}</body></html>`

export const onRequestGet = async (context: { request: Request; env: Env }): Promise<Response> => {
  const url = new URL(context.request.url)
  const key = url.searchParams.get('key')
  const expected = context.env.STATS_KEY ?? context.env.stats_key ?? 'change-me-please'
  if (key !== expected) {
    return new Response('unauthorized', { status: 401 })
  }
  const kv = context.env.STATS ?? context.env.stats // 绑定名大小写都认
  if (!kv) {
    return new Response(page('监控', '<h1>尚未绑定 KV</h1><p class="sub">请在 Pages 项目 Settings → Bindings 添加 KV,变量名 STATS,再重新部署。</p>'), {
      headers: { 'content-type': 'text/html; charset=utf-8' },
    })
  }

  const list = await kv.list({ prefix: 'count:' })
  const counts: Record<string, number> = {}
  for (const k of list.keys) counts[k.name] = parseInt((await kv.get(k.name)) || '0', 10) || 0

  if (url.searchParams.get('format') === 'json') {
    return Response.json(counts, { headers: { 'cache-control': 'no-store' } })
  }

  const plays = counts['count:plays'] || 0
  const pm = counts['count:play:male'] || 0
  const pf = counts['count:play:female'] || 0
  const endTotal = counts['count:endings_total'] || 0

  const endings = Object.entries(counts)
    .filter(([k]) => k.startsWith('count:ending:'))
    .map(([k, v]) => ({ label: k.slice('count:ending:'.length), v }))
    .sort((a, b) => b.v - a.v)

  const rows = endings.length
    ? endings
        .map((e) => {
          const pct = endTotal ? Math.round((e.v / endTotal) * 100) : 0
          return `<div class="row"><span class="lbl">${e.label}</span><span class="bar"><i style="width:${pct}%"></i></span><span class="num">${e.v} · ${pct}%</span></div>`
        })
        .join('')
    : '<div class="empty">还没有结局数据——去玩一局走到结局吧。</div>'

  const body = `
    <h1>💘 北京Dating · 监控看板</h1>
    <div class="sub">匿名聚合 · 无 cookie / 无用户数据 · <a href="?key=${encodeURIComponent(key ?? '')}&format=json">JSON</a></div>
    <div class="cards">
      <div class="card"><div class="k">总开局</div><div class="v">${plays}</div></div>
      <div class="card"><div class="k">男版 / 女版</div><div class="v">${pm} <small>/ ${pf}</small></div></div>
      <div class="card"><div class="k">走到结局</div><div class="v">${endTotal}</div></div>
    </div>
    <h2>各结局分布(占结局总数)</h2>
    ${rows}`

  return new Response(page('北京Dating · 监控', body), {
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  })
}
