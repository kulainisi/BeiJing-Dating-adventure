import { chance } from './rng'
import { GameState } from './types'

/** 玩家隐藏心情:0-100,任何界面不显示 */
export function bumpMood(s: GameState, delta: number) {
  s.mood = Math.max(0, Math.min(100, s.mood + delta))
}

/** 睡觉后心情向中值回归 */
export function moodDrift(s: GameState) {
  if (s.mood > 60) s.mood = Math.max(60, s.mood - 5)
  else if (s.mood < 60) s.mood = Math.min(60, s.mood + 5)
}

/** 极端心情结局暗骰:每次互动结束后调用(负面概率已下调,给正反馈让路) */
export function moodExtremeRoll(s: GameState): 'euphoria' | 'emo_quit' | null {
  if (s.mood >= 92 && chance(0.03)) return 'euphoria'
  if (s.mood <= 8 && chance(0.015)) return 'emo_quit'
  return null
}

/** 确定性抑郁判负:心情跌破硬地板(比随机 emo_quit 更低),直接判负,平衡无脑加班搬钱 */
export function moodDepressed(s: GameState): boolean {
  return s.mood <= 3
}

/** HUD 心情氛围:仅在两极外显(暗骰原则,中间隐藏) */
export function moodAura(s: GameState): { emoji: string; label: string; good: boolean } | null {
  if (s.mood >= 78) return { emoji: '⚡', label: '气场全开', good: true }
  if (s.mood <= 22) return { emoji: '🌧️', label: '状态低迷', good: false }
  return null
}

/** 极端心情的模糊独白(玩家唯一的侧面感知渠道) */
export function moodHint(s: GameState): string | null {
  if (s.mood >= 92) return '你最近走路都在哼歌,同事说你脸上明晃晃写着俩字:上头。'
  if (s.mood <= 8) return '你昨晚盯着天花板到凌晨三点。这座城市的冬天,好像格外长。'
  if (s.mood <= 22) return '这阵子干什么都提不起劲,像手机电量卡在 15%,一直红着。该给自己充个电了。'
  return null
}
