import { chance } from './rng'
import { confirmedList, isAlive } from './relations'
import { marriageEligible } from './game'
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
    // 极限状态(含同居+财力精力)的结算日补掷婚姻骰(20%)
    if (marriageEligible(s, profile) && chance(0.2)) {
      return { id: 'marriage', npcId: npc.id }
    }
    if (npc.flags.includes(profile.trueFlag)) {
      // 快餐化惩罚:留过宿的关系,真结局门槛提高(Coco 除外,她的真结局钥匙就是这个)
      const stayed = npc.flags.includes('stayed')
      if (!stayed || npc.favor >= 95 || profile.id === 'coco') {
        return { id: `true_${npc.id}`, npcId: npc.id }
      }
    }
    return { id: `he_${npc.id}`, npcId: npc.id }
  }

  const all = Object.values(s.npcs)
  const alive = all.filter(isAlive)
  // 海王/海后:三人以上高好感,无人确立
  if (alive.filter((n) => n.favor >= 70).length >= 3) {
    return { id: 'seaking' }
  }
  if (alive.length === 0) {
    return noOneLeftEnding(s)
  }
  const best = [...alive].sort((a, b) => b.favor - a.favor)[0]
  // dating 成功且一直保持良好联系(高好感+约会过)= 该角色 HE,即使没正式表白
  if (best.favor >= 70 && best.dates >= 1) {
    return { id: `he_${best.id}`, npcId: best.id }
  }
  if (best.favor >= 60) {
    return { id: 'goodcard', npcId: best.id }
  }
  if (best.favor >= 35) {
    return { id: 'ambiguous', npcId: best.id }
  }
  return { id: 'readnoreply' }
}

/** 主动拉黑人数达到「孤寡认证」的门槛(半个池子) */
export const LONELY_BLOCK_THRESHOLD = 6

/**
 * 无人可聊时的结局判定:
 * - 亲手拉黑 ≥6 人(踩雷/对峙失败等主动作死)→ 孤寡认证
 * - 只是冷落流失/被鸽(没主动赶人)→ 已读不回大满贯(温和得多)
 */
export function noOneLeftEnding(s: GameState): EndingResult {
  return s.stats.blocks >= LONELY_BLOCK_THRESHOLD ? { id: 'all_blocked' } : { id: 'readnoreply' }
}

/**
 * 中途全员出局检查:池子抽干且全灭才算真正无人可聊。
 * 仅当玩家主动拉黑够多(达孤寡门槛)时才允许中途直接判「孤寡认证」;
 * 否则(纯靠冷落把人晾走)不提前结束,让玩家撑到结算走温和结局。
 */
export function checkAllBlocked(s: GameState): boolean {
  const noneLeft = Object.values(s.npcs).every((n) => !isAlive(n) && n.stage !== 'locked')
  return noneLeft && s.stats.blocks >= LONELY_BLOCK_THRESHOLD
}
