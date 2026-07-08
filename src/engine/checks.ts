import { rollD20 } from './rng'
import { bumpMood } from './mood'
import { imageFromWallet } from './relations'
import { CheckDef, GameState, MOODS, NpcState } from './types'

export interface CheckResult {
  roll: number
  skillVal: number
  dc: number
  total: number
  outcome: 'crit' | 'pass' | 'fail' | 'fumble'
  goto: string
}

/** d20 + 技能 vs 难度;骰 20 大成功、骰 1 大失败;NPC 情绪与锦鲤日修正 DC */
export function performCheck(s: GameState, npc: NpcState | null, def: CheckDef): CheckResult {
  const roll = rollD20()
  // 排面(image)实时按资产读取,取代行头;其余属性照常
  const skillVal = def.skill === 'image' ? imageFromWallet(s.wallet) : s.skills[def.skill]
  let dc = def.dc
  if (npc) dc += MOODS[npc.mood].dcMod
  if (s.luckyDay) dc -= 2
  if (s.mood >= 78) dc -= 2 // 气场全开:玩家高心情,检定更易过
  const total = roll + skillVal
  let outcome: CheckResult['outcome']
  if (roll === 20) outcome = 'crit'
  else if (roll === 1) outcome = 'fumble'
  else outcome = total >= dc ? 'pass' : 'fail'

  const goto =
    outcome === 'crit'
      ? (def.crit ?? def.pass)
      : outcome === 'fumble'
        ? (def.fumble ?? def.fail)
        : outcome === 'pass'
          ? def.pass
          : def.fail

  if (outcome === 'crit' || outcome === 'pass') s.stats.checksPassed++
  else s.stats.checksFailed++
  if (outcome === 'fumble') bumpMood(s, -6)
  if (outcome === 'crit') bumpMood(s, 4)

  return { roll, skillVal, dc, total, outcome, goto }
}
