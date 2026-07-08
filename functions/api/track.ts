/**
 * POST /api/track — 匿名计数端点(Cloudflare Pages Functions,与站点同源同部署)。
 * 需在 Pages 项目里绑定 KV namespace,变量名 STATS。未绑定时静默 no-op,绝不报错。
 * 只累加聚合计数,无 cookie / 无用户标识 / 无 PII。
 */

// 依赖无关的最小 KV 类型(避免引入 @cloudflare/workers-types,不进主构建)
type KV = {
  get(key: string): Promise<string | null>
  put(key: string, value: string): Promise<void>
}
interface Env {
  STATS?: KV
}

const KNOWN_GLOBAL = new Set([
  'time_manager', 'seaking', 'marriage', 'euphoria', 'emo_quit', 'goodcard', 'ambiguous',
  'readnoreply', 'all_blocked', 'bankrupt', 'awkward_full', 'xhs_posted', 'blackout_confess',
  'houhai_uncle', 'give_up_feast', 'fate_win', 'depression',
])

/** 校验结局 id:全局白名单,或 he_/true_ 前缀的角色结局 */
function validEnding(e: unknown): e is string {
  if (typeof e !== 'string' || e.length > 40 || !/^[a-z_]+$/.test(e)) return false
  if (KNOWN_GLOBAL.has(e)) return true
  return e.startsWith('he_') || e.startsWith('true_')
}

async function inc(kv: KV, key: string) {
  const cur = parseInt((await kv.get(key)) || '0', 10) || 0
  await kv.put(key, String(cur + 1))
}

export const onRequestPost = async (context: { request: Request; env: Env }): Promise<Response> => {
  try {
    const kv = context.env.STATS
    if (!kv) return new Response('ok') // 未绑定 KV:静默
    const data = (await context.request.json()) as Record<string, unknown>
    const v = data.v === 'female' ? 'female' : 'male'
    if (data.t === 'play') {
      await inc(kv, 'count:plays')
      await inc(kv, `count:play:${v}`)
    } else if (data.t === 'end' && validEnding(data.e)) {
      await inc(kv, 'count:endings_total')
      await inc(kv, `count:ending:${v}:${data.e}`)
    }
    return new Response('ok')
  } catch {
    return new Response('ok')
  }
}
