import { chance, pick, pickN, rand, weighted } from './rng'
import { CharacterProfile, Effects, GameState, MoodId, NpcState } from './types'

// ============ 口味怪癖(每局随机) ============
export const TASTES: Record<string, { name: string; loveLine: string; hateLine: string }> = {
  xiangcai: {
    name: '香菜',
    loveLine: '你居然多要了一份香菜?我们是这个世界上最后的香菜派!',
    hateLine: 'TA盯着香菜沉默了三秒:"……你先吃,我看着。"',
  },
  la: {
    name: '辣',
    loveLine: '"微辣是对辣的侮辱。"TA眼睛亮了,"特辣,走起。"',
    hateLine: 'TA被辣得灌了半壶水,看你的眼神里有了一丝怨气。',
  },
  tian: {
    name: '甜口',
    loveLine: '"甜豆腐脑才是正统!"TA激动地拍了下桌子。',
    hateLine: '"甜的?"TA皱起眉,"我们之间出现了原则性分歧。"',
  },
  neizang: {
    name: '内脏类',
    loveLine: '"懂吃!"TA夹起一筷子爆肚,对你刮目相看。',
    hateLine: 'TA看着那盘卤煮,礼貌又疏离地笑了笑:"你吃,你吃。"',
  },
  shengshi: {
    name: '刺身生食',
    loveLine: '"三文鱼腹!你点到我心趴上了。"',
    hateLine: '"生的……"TA放下筷子,"我突然想起我对「吃生的」这件事过敏。"',
  },
}

// ============ 语言雷点(每局随机1-2个,说中=踩雷,再犯=不理你) ============
export const SAYINGS: Record<string, { name: string; revealLine: string }> = {
  hhh: { name: '只回"哈哈哈"三个字', revealLine: 'TA其实一直觉得,只发三个"哈"约等于已读乱回。' },
  water: { name: '说"多喝热水"', revealLine: '在TA的雷点排行榜上,"多喝热水"常年霸榜第一。' },
  bao: { name: '叫TA"宝"', revealLine: 'TA听到"宝"这个字,脚趾当场抠出一套学区房。' },
  zjz: { name: '说"绝绝子"', revealLine: 'TA的原话:"2026年了还有人说绝绝子,梦回上个版本。"' },
  emmm: { name: '回"emmm"', revealLine: '每一个"emmm"都被TA解读为"我不想理你但装礼貌"。' },
  zaoshui: { name: '说"早点睡"', revealLine: '在TA看来,"早点睡"是聊天界的逐客令。' },
  suibian: { name: '说"随便,都行"', revealLine: 'TA最恨"随便":做决定的活儿全推给别人。' },
  gemen: { name: '开口"我有个朋友"', revealLine: '"我有个朋友"这五个字,在TA心里等于故事会开篇。' },
}

export function genQuirks(): { tastes: Record<string, number>; bans: string[] } {
  const tasteKeys = Object.keys(TASTES)
  const tastes: Record<string, number> = {}
  for (const k of tasteKeys) {
    const r = rand()
    tastes[k] = r < 0.3 ? 1 : r < 0.6 ? -1 : 0
  }
  const bans = pickN(Object.keys(SAYINGS), chance(0.5) ? 2 : 1)
  return { tastes, bans }
}

// ============ NPC 每日情绪 ============
const MOOD_WEIGHTS: [MoodId, number][] = [
  ['normal', 45],
  ['great', 15],
  ['hungover', 12],
  ['slacking', 15],
  ['grumpy', 13],
]

export function rollMood(): MoodId {
  return weighted(MOOD_WEIGHTS, (m) => m[1])![0]
}

// ============ 效果结算 ============
export interface EffectFeedback {
  favorDelta: number
  tasteLine?: string
  banHit?: { first: boolean; name: string }
  blocked?: string
  ended?: string
  confirmed?: boolean
}

const aliveStages = ['chatting', 'dating', 'confirmed']

export function isAlive(n: NpcState) {
  return aliveStages.includes(n.stage)
}

/** 结算一个选择/节点的效果。返回给 UI 的反馈信息。 */
export function applyEffects(
  s: GameState,
  npc: NpcState | null,
  profile: CharacterProfile | null,
  fx: Effects,
): EffectFeedback {
  const fb: EffectFeedback = { favorDelta: 0 }
  let favor = fx.favor ?? 0

  // 摆烂中:嘘寒问暖翻倍;催正事扣分在内容侧用负 favor 表达
  if (npc && fx.care && npc.mood === 'slacking' && favor > 0) favor *= 2
  // 心情爆好:好感收益 +2
  if (npc && npc.mood === 'great' && favor > 0) favor += 2

  // 口味怪癖
  if (npc && fx.taste) {
    const t = npc.quirkTastes[fx.taste] ?? 0
    if (t > 0) {
      favor += 10
      fb.tasteLine = TASTES[fx.taste].loveLine
    } else if (t < 0) {
      favor -= 8
      s.awkward += 8
      fb.tasteLine = TASTES[fx.taste].hateLine
    }
  }

  // 语言雷点
  if (npc && fx.saying && npc.quirkBans.includes(fx.saying)) {
    if (npc.banHits.includes(fx.saying)) {
      // 二次踩雷:直接不理你
      blockNpc(s, npc, profile, `你又${SAYINGS[fx.saying].name},TA忍无可忍`)
      fb.blocked = npc.blockReason
    } else {
      npc.banHits.push(fx.saying)
      favor -= 6
      s.stats.mines++
    }
  }

  if (npc) {
    npc.favor = Math.max(0, Math.min(100, npc.favor + favor))
    fb.favorDelta = favor
    if (fx.npcFlags) for (const f of fx.npcFlags) if (!npc.flags.includes(f)) npc.flags.push(f)
  }

  if (fx.mine) s.stats.mines++
  if (fx.blackout) s.stats.blackouts++
  if (fx.opinion) {
    const log = s.opinionLog[fx.opinion.id] ?? []
    s.opinionLog[fx.opinion.id] = [...log, ...fx.opinion.tags]
  }
  if (fx.wallet) {
    s.wallet += fx.wallet
    if (fx.wallet < 0) s.stats.spent += -fx.wallet
  }
  if (fx.awkward) s.awkward = Math.max(0, s.awkward + fx.awkward)
  if (fx.drink) s.stats.drinks += fx.drink
  if (fx.flags) for (const f of fx.flags) if (!s.flags.includes(f)) s.flags.push(f)

  if (npc && fx.block && !fb.blocked) {
    blockNpc(s, npc, profile, fx.block)
    fb.blocked = fx.block
  }

  if (fx.blockNpcIds) {
    for (const b of fx.blockNpcIds) {
      const other = s.npcs[b.id]
      if (other && isAlive(other)) blockNpc(s, other, null, b.reason)
    }
  }

  if (npc && fx.confirm) {
    npc.stage = 'confirmed'
    fb.confirmed = true
  }

  if (fx.endGame) fb.ended = fx.endGame

  // 全局社死过载
  if (s.awkward >= 100 && !fb.ended) fb.ended = 'awkward_full'
  // 破产
  if (s.wallet < 0 && !fb.ended) fb.ended = 'bankrupt'

  return fb
}

export function blockNpc(
  s: GameState,
  npc: NpcState,
  profile: CharacterProfile | null,
  reason: string,
) {
  if (npc.stage === 'blocked') return
  npc.stage = 'blocked'
  npc.blockReason = reason
  s.stats.blocks++
}

// ============ 冷落衰减(每日结算) ============
export interface DecayNews {
  npcId: string
  kind: 'decay' | 'faded'
}

export function dailyDecay(s: GameState): DecayNews[] {
  const news: DecayNews[] = []
  for (const npc of Object.values(s.npcs)) {
    if (!isAlive(npc) || npc.stage === 'confirmed') continue
    const idle = s.day - npc.lastDay
    if (idle >= 2) {
      npc.favor -= idle >= 4 ? 12 : 6
      news.push({ npcId: npc.id, kind: 'decay' })
      if (npc.favor <= 0) {
        npc.favor = 0
        npc.stage = 'faded'
        npc.blockReason = '被你晾了太久,TA安静地删掉了你'
        news.push({ npcId: npc.id, kind: 'faded' })
      }
    }
  }
  return news
}

// ============ 天命骰(极小概率直接定胜负) ============
export type FateResult = 'ghost' | 'win' | null

export function fateRoll(s: GameState, npc: NpcState): FateResult {
  if (!isAlive(npc) || npc.stage === 'confirmed') return null
  s.stats.fateRolls++
  const r = rand()
  if (r < 0.015) {
    s.stats.fateHits++
    npc.stage = 'ghosted'
    npc.blockReason = '北京的风把TA吹走了'
    return 'ghost'
  }
  if (r < 0.025 && npc.favor >= 20) {
    s.stats.fateHits++
    return 'win'
  }
  return null
}

// ============ 并聊统计 ============
export function updateParallel(s: GameState) {
  const n = Object.values(s.npcs).filter((x) => isAlive(x) && x.favor >= 25).length
  if (n > s.stats.maxParallel) s.stats.maxParallel = n
}

export function aliveCount(s: GameState) {
  return Object.values(s.npcs).filter(isAlive).length
}

export function confirmedList(s: GameState) {
  return Object.values(s.npcs).filter((n) => n.stage === 'confirmed')
}

export function moodOpener(profile: CharacterProfile, mood: MoodId): string | null {
  return profile.moodLines[mood] ?? null
}
