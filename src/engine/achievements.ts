import { GameState, TOTAL_DAYS } from './types'
import { getGallery } from './save'
import { findEnding } from '@/content'

export interface Achievement {
  id: string
  emoji: string
  name: string
  desc: string
}

/** 成就清单:每解锁一个新成就 = +1 重投投胎骰 token(跨局特权) */
export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_win', emoji: '🏆', name: '初次上岸', desc: '拿下任意一个 WIN 结局' },
  { id: 'true_love', emoji: '💞', name: '触碰真心', desc: '解锁任意角色的真爱 HE' },
  { id: 'married', emoji: '💍', name: '民政局速通', desc: '达成闪婚结局' },
  { id: 'heartbreaker', emoji: '🐟', name: '京圈海王', desc: '同时并聊拉满(4 人)' },
  { id: 'workaholic', emoji: '🧑‍💻', name: '卷王本王', desc: '一局加班 ≥6 次' },
  { id: 'warm_soul', emoji: '🧣', name: '电子暖宝', desc: '一局暖心选择 ≥8 次' },
  { id: 'iron_liver', emoji: '🍺', name: '千杯不醉', desc: '一局喝下 ≥8 杯' },
  { id: 'demolisher', emoji: '✂️', name: '拉黑狂魔', desc: '一局拉黑 ≥5 人' },
  { id: 'burnout', emoji: '🌧️', name: '把自己熬没了', desc: '触发抑郁结局(别真这样)' },
  { id: 'cringe_lord', emoji: '😳', name: '社死之王', desc: '社死过载或被挂小蓝书' },
  { id: 'survivor', emoji: '🗓️', name: '熬过一整月', desc: '撑到结算日' },
  { id: 'collector', emoji: '📖', name: '图鉴收藏家', desc: '累计解锁 ≥15 个结局' },
]

/**
 * 本局达成的成就 id(unlockAchievements 负责去重与发 token)。
 * 在 endGame 里、unlockEnding 之后调用,collector 能算上当前这个结局。
 */
export function evalAchievements(s: GameState, endingId: string): string[] {
  const out: string[] = []
  const rank = findEnding(endingId, s.version)?.rank
  const st = s.stats
  const add = (cond: boolean, id: string) => {
    if (cond) out.push(id)
  }

  add(rank === 'win', 'first_win')
  add(endingId.startsWith('true_'), 'true_love')
  add(endingId === 'marriage', 'married')
  add(st.maxParallel >= 4 || endingId === 'seaking' || endingId === 'time_manager', 'heartbreaker')
  add((st.workCount ?? 0) >= 6, 'workaholic')
  add((st.careCount ?? 0) >= 8, 'warm_soul')
  add(st.drinks >= 8, 'iron_liver')
  add(st.blocks >= 5, 'demolisher')
  add(endingId === 'depression', 'burnout')
  add(endingId === 'awkward_full' || endingId === 'xhs_posted', 'cringe_lord')
  add(s.day > TOTAL_DAYS, 'survivor')
  add(getGallery().unlocked.length >= 15, 'collector')

  return out
}
