import { confirmedList, isAlive } from './relations'
import { EndingResult, GameState } from './types'
import { getCharacters } from '@/content'

/** 第 14 天结束后的结算矩阵(即时结局在 applyEffects / 事件里直接触发,不走这里) */
export function settle(s: GameState): EndingResult {
  const chars = getCharacters(s.version)
  const confirmed = confirmedList(s)

  if (confirmed.length >= 2) {
    return { id: 'time_manager', detail: `同时确立了 ${confirmed.length} 段关系` }
  }
  if (confirmed.length === 1) {
    const npc = confirmed[0]
    const profile = chars.find((c) => c.id === npc.id)!
    if (npc.flags.includes(profile.trueFlag)) {
      return { id: `true_${npc.id}`, npcId: npc.id }
    }
    return { id: `he_${npc.id}`, npcId: npc.id }
  }

  const all = Object.values(s.npcs)
  const alive = all.filter(isAlive)
  if (alive.length === 0) {
    return { id: 'all_blocked' }
  }
  const best = [...alive].sort((a, b) => b.favor - a.favor)[0]
  if (best.favor >= 60) {
    return { id: 'goodcard', npcId: best.id }
  }
  if (best.favor >= 35) {
    return { id: 'ambiguous', npcId: best.id }
  }
  return { id: 'readnoreply' }
}

/** 中途全员出局检查 */
export function checkAllBlocked(s: GameState): boolean {
  return Object.values(s.npcs).every((n) => !isAlive(n))
}
