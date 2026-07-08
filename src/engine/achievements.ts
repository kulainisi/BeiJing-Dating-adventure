import { GameState, NpcState, TOTAL_DAYS } from './types'
import { getGallery } from './save'
import { findEnding } from '@/content'

export interface Achievement {
  id: string
  emoji: string
  name: string
  desc: string
  /** 可在局中即时解锁(不依赖结局),会弹成就动效 */
  mid?: boolean
  test: (s: GameState, endingId?: string) => boolean
}

const someNpc = (s: GameState, f: (n: NpcState) => boolean) => Object.values(s.npcs).some(f)

/** 成就清单:mid=局中即时解锁;其余结算时解锁。每解锁一个新成就 +1 重投投胎骰 token */
export const ACHIEVEMENTS: Achievement[] = [
  // ===== 局中即时解锁(带金色动效)=====
  { id: 'first_date', emoji: '🌹', name: '初次约会', desc: '约会任意一次', mid: true, test: (s) => someNpc(s, (n) => n.dates >= 1) },
  { id: 'confirmed_one', emoji: '❤️', name: '正式在一起', desc: '和某人确立关系', mid: true, test: (s) => someNpc(s, (n) => n.stage === 'confirmed') },
  { id: 'true_heart', emoji: '💞', name: '触碰真心', desc: '解锁某人藏起来的一面', mid: true, test: (s) => someNpc(s, (n) => n.flags.includes('ms:true')) },
  { id: 'cohabit', emoji: '🏠', name: '拿到钥匙', desc: '和某人同居', mid: true, test: (s) => s.flags.includes('cohabiting') },
  { id: 'heartbreaker', emoji: '🐟', name: '京圈海王', desc: '同时并聊到 3 人', mid: true, test: (s) => s.stats.maxParallel >= 3 },
  { id: 'tension', emoji: '💗', name: '氛围大师', desc: '把某人聊出暧昧张力', mid: true, test: (s) => someNpc(s, (n) => n.flags.includes('tension')) },
  { id: 'workaholic', emoji: '🧑‍💻', name: '卷王本王', desc: '加班 3 次', mid: true, test: (s) => (s.stats.workCount ?? 0) >= 3 },
  { id: 'warm_soul', emoji: '🧣', name: '电子暖宝', desc: '暖心选择 4 次', mid: true, test: (s) => (s.stats.careCount ?? 0) >= 4 },
  { id: 'iron_liver', emoji: '🍺', name: '千杯不醉', desc: '喝下 4 杯', mid: true, test: (s) => s.stats.drinks >= 4 },
  { id: 'demolisher', emoji: '✂️', name: '拉黑狂魔', desc: '拉黑 3 人', mid: true, test: (s) => s.stats.blocks >= 3 },
  { id: 'mine_stepper', emoji: '💣', name: '直球踩雷王', desc: '踩雷 3 次', mid: true, test: (s) => s.stats.mines >= 3 },
  { id: 'blackout', emoji: '🥴', name: '断片选手', desc: '喝到断片一次', mid: true, test: (s) => s.stats.blackouts >= 1 },
  { id: 'big_spender', emoji: '💸', name: '散财童子', desc: '累计消费破 6000', mid: true, test: (s) => s.stats.spent >= 6000 },
  { id: 'rich_born', emoji: '💰', name: '含金汤匙', desc: '投胎抽中钞能力', mid: true, test: (s) => s.origin === 'rich' },
  { id: 'energetic_born', emoji: '⚡', name: '电量永动机', desc: '投胎抽中高精力宝宝', mid: true, test: (s) => s.origin === 'energetic' },
  // ===== 结算时解锁 =====
  { id: 'first_win', emoji: '🏆', name: '初次上岸', desc: '拿下任意 WIN 结局', test: (s, e) => findEnding(e || '', s.version)?.rank === 'win' },
  { id: 'true_love', emoji: '💖', name: '真爱降临', desc: '达成某人的真爱 HE', test: (_s, e) => !!e && e.startsWith('true_') },
  { id: 'married', emoji: '💍', name: '民政局速通', desc: '达成闪婚', test: (_s, e) => e === 'marriage' },
  { id: 'singleton', emoji: '🍜', name: '单身快乐', desc: '后半程主动退出,善待自己', test: (_s, e) => e === 'give_up_feast' },
  { id: 'fate', emoji: '🍀', name: '概率学奇迹', desc: '触发一见钟情天命骰', test: (_s, e) => e === 'fate_win' },
  { id: 'burnout', emoji: '🌧️', name: '把自己熬没了', desc: '加班内耗到抑郁(别真这样)', test: (_s, e) => e === 'depression' },
  { id: 'cringe_lord', emoji: '😳', name: '社死之王', desc: '社死过载或被挂小蓝书', test: (_s, e) => e === 'awkward_full' || e === 'xhs_posted' },
  { id: 'survivor', emoji: '🗓️', name: '熬过一整月', desc: '撑到结算日', test: (s) => s.day > TOTAL_DAYS },
  { id: 'collector', emoji: '📖', name: '图鉴收藏家', desc: '累计解锁 8 个结局', test: () => getGallery().unlocked.length >= 8 },
]

/** 结算时全量评定(mid + end 都算),供 endGame 调用 */
export function evalAchievements(s: GameState, endingId: string): string[] {
  return ACHIEVEMENTS.filter((a) => {
    try {
      return a.test(s, endingId)
    } catch {
      return false
    }
  }).map((a) => a.id)
}

/** 局中即时评定:只看 mid 成就,达成即可当场解锁+弹动效 */
export function evalMidRun(s: GameState): string[] {
  return ACHIEVEMENTS.filter((a) => a.mid && a.test(s)).map((a) => a.id)
}
