/**
 * GET /api/stats?key=XXX — 作者看板:读回聚合计数(多少人玩 / 各结局多少次)。
 * 用一个简单令牌(env.STATS_KEY)挡一下公开访问;匿名聚合,无隐私数据。
 */
type KV = {
  get(key: string): Promise<string | null>
  list(opts?: { prefix?: string }): Promise<{ keys: { name: string }[] }>
}
interface Env {
  STATS?: KV
  STATS_KEY?: string
}

export const onRequestGet = async (context: { request: Request; env: Env }): Promise<Response> => {
  const url = new URL(context.request.url)
  const key = url.searchParams.get('key')
  if (key !== (context.env.STATS_KEY || 'change-me-please')) {
    return new Response('unauthorized', { status: 401 })
  }
  const kv = context.env.STATS
  if (!kv) return Response.json({ error: '尚未绑定 KV namespace(STATS)' })

  const list = await kv.list({ prefix: 'count:' })
  const out: Record<string, number> = {}
  for (const k of list.keys) {
    out[k.name] = parseInt((await kv.get(k.name)) || '0', 10) || 0
  }
  return Response.json(out, { headers: { 'cache-control': 'no-store' } })
}
