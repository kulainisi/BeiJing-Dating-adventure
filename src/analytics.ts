import { GameState } from './engine/types'

/**
 * 匿名数据监控:只上报"玩了/出了什么结局",无 cookie、无用户标识、无 PII。
 * 端点是同源的 Cloudflare Pages Functions(/api/track),CSP connect-src 'self' 已覆盖。
 * 失败一律静默——统计永远不能影响游戏本身。
 */
const ENDPOINT = '/api/track'

function send(payload: Record<string, unknown>) {
  try {
    const body = JSON.stringify(payload)
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon(ENDPOINT, body)
    } else if (typeof fetch === 'function') {
      fetch(ENDPOINT, { method: 'POST', body, keepalive: true }).catch(() => {})
    }
  } catch {
    /* 统计失败静默 */
  }
}

/** 开局:记一次 play(仅版本/出身) */
export function trackPlay(s: GameState) {
  send({ t: 'play', v: s.version, o: s.origin })
}

/** 结局:记一次 ending(结局 id / 版本 / 出身 / 天数) */
export function trackEnding(s: GameState, endingId: string) {
  send({ t: 'end', e: endingId, v: s.version, o: s.origin, d: s.day })
}
