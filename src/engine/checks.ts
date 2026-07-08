import { rollD20 } from './rng'
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
  const skillVal = s.skills[def.skill]
  let dc = def.dc
  if (npc) dc += MOODS[npc.mood].dcMod
  if (s.luckyDay) dc -= 2
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

  return { roll, skillVal, dc, total, outcome, goto }
}
