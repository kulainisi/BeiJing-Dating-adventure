import { chance, pick, pickN, rand, weighted } from './rng'
import { bumpMood } from './mood'
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
  /** 名额释放后随机补位进来的新角色 id */
  newMatch?: string
  /** 触发的关系里程碑(好感越线/确立/真心/同居),供 UI 放全屏庆祝;每种每人只发一次 */
  milestone?: string
}

const aliveStages = ['chatting', 'dating', 'confirmed']

export function isAlive(n: NpcState) {
  return aliveStages.includes(n.stage)
}

/**
 * 排面(image)由资产分档决定,取代原来"行头临时买排面":
 * 月光族撑不起场面,钞能力天然满排面。检定时实时按当前钱包读取。
 */
export function imageFromWallet(wallet: number): number {
  if (wallet >= 500000) return 6
  if (wallet >= 100000) return 5
  if (wallet >= 20000) return 4
  if (wallet >= 5000) return 3
  return 2
}

/** 关系阶梯(把好感/阶段翻成"看得见在往上爬"的等级名) */
export function relationTier(n: NpcState): { name: string; emoji: string } {
  if (n.stage === 'confirmed') {
    return n.flags.includes('cohabit')
      ? { name: '同居', emoji: '🏠' }
      : { name: '在一起', emoji: '❤️' }
  }
  if (n.favor >= 65) return { name: '心动', emoji: '💓' }
  if (n.favor >= 45) return { name: '暧昧', emoji: '💗' }
  if (n.favor >= 25) return { name: '有点意思', emoji: '🙂' }
  return { name: '陌生人', emoji: '👤' }
}

/** 钱包统一扣款口:任何时刻钱归零就寄 */
export function chargeWallet(s: GameState, amount: number): boolean {
  s.wallet -= amount
  if (amount > 0) s.stats.spent += amount
  return s.wallet <= 0
}

/** 名额释放后从锁定池随机抽一位新人解锁 */
export function refillPool(s: GameState): string | null {
  const locked = Object.values(s.npcs).filter((n) => n.stage === 'locked')
  if (locked.length === 0) return null
  const next = pick(locked)
  next.stage = 'chatting'
  next.favor = 12
  next.unread = true
  next.lastDay = s.day
  next.mood = rollMood()
  return next.id
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
  // 玩家气场全开(高心情):正好感再 +1,制造"越顺越顺"的滚雪球
  if (s.mood >= 78 && favor > 0) favor += 1

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
    const prevFavor = npc.favor
    npc.favor = Math.max(0, Math.min(100, npc.favor + favor))
    fb.favorDelta = favor
    if (favor >= 8) bumpMood(s, 5)
    if (fx.npcFlags) for (const f of fx.npcFlags) if (!npc.flags.includes(f)) npc.flags.push(f)
    // 里程碑:好感首次越线 / 触碰真心(用 ms:* flag 去重,每种每人只发一次)
    const crossed = (line: number, key: string) =>
      prevFavor < line && npc.favor >= line && !npc.flags.includes(`ms:${key}`)
    if (profile && fx.npcFlags?.includes(profile.trueFlag) && !npc.flags.includes('ms:true')) {
      npc.flags.push('ms:true')
      fb.milestone = 'true'
    } else if (crossed(50, 'favor50')) {
      npc.flags.push('ms:favor50')
      fb.milestone = 'favor50'
    } else if (crossed(30, 'favor30')) {
      npc.flags.push('ms:favor30')
      fb.milestone = 'favor30'
    }
  }

  if (fx.mine) {
    s.stats.mines++
    bumpMood(s, -4)
  }
  if (fx.blackout) s.stats.blackouts++
  if (fx.care) s.stats.careCount++
  if (fx.opinion) {
    const log = s.opinionLog[fx.opinion.id] ?? []
    s.opinionLog[fx.opinion.id] = [...log, ...fx.opinion.tags]
  }
  if (fx.wallet) {
    if (fx.wallet < 0) {
      if (chargeWallet(s, -fx.wallet) && !fb.ended) fb.ended = 'bankrupt'
    } else {
      s.wallet += fx.wallet
    }
  }
  if (fx.awkward) s.awkward = Math.max(0, s.awkward + fx.awkward)
  if (fx.drink) s.stats.drinks += fx.drink
  if (fx.flags) for (const f of fx.flags) if (!s.flags.includes(f)) s.flags.push(f)
  if (fx.flags?.includes('cohabiting')) fb.milestone = 'cohabit' // 同居里程碑(覆盖好感越线)

  if (npc && fx.block && !fb.blocked) {
    fb.newMatch = blockNpc(s, npc, profile, fx.block) ?? undefined
    fb.blocked = fx.block
  }

  if (fx.blockNpcIds) {
    for (const b of fx.blockNpcIds) {
      const other = s.npcs[b.id]
      if (other && isAlive(other)) {
        const nm = blockNpc(s, other, null, b.reason)
        if (nm && !fb.newMatch) fb.newMatch = nm
      }
    }
  }

  if (npc && fx.confirm) {
    npc.stage = 'confirmed'
    fb.confirmed = true
    bumpMood(s, 15)
    fb.milestone = 'confirmed' // 确立里程碑(优先级最高,覆盖前面的好感/真心)
  }

  if (fx.endGame) fb.ended = fx.endGame

  // 全局社死过载
  if (s.awkward >= 100 && !fb.ended) fb.ended = 'awkward_full'
  // 钱归零就寄
  if (s.wallet <= 0 && !fb.ended) fb.ended = 'bankrupt'

  return fb
}

/** 拉黑一名角色;若因此释放名额,返回补位新人的 id */
export function blockNpc(
  s: GameState,
  npc: NpcState,
  profile: CharacterProfile | null,
  reason: string,
): string | null {
  if (npc.stage === 'blocked') return null
  npc.stage = 'blocked'
  npc.blockReason = reason
  s.stats.blocks++
  bumpMood(s, -12)
  return refillPool(s)
}

// ============ 冷落衰减(每日结算) ============
export interface DecayNews {
  npcId: string
  kind: 'decay' | 'faded' | 'match'
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
        npc.blockReason = '你太久没回消息,TA默默把你删了好友。在北京,已读不回久了,就成了删除键'
        bumpMood(s, -8)
        news.push({ npcId: npc.id, kind: 'faded' })
        const nm = refillPool(s)
        if (nm) news.push({ npcId: nm, kind: 'match' })
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
    bumpMood(s, -10)
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

// ============ 玩家人物评价体系(结局卡头版:北京对你这个人的鉴定书) ============
export interface PlayerVerdict {
  /** 人格标题 */
  title: string
  /** 性格标签(3-4 个) */
  tags: string[]
  /** 一段鉴定评语 */
  verdict: string
}

/**
 * 从本局行为数据(拉黑/踩雷/暖心/加班/海王/心情/检定…)给玩家一份人物鉴定。
 * 游戏本质是对玩家的评价体系:感情结果只是背景,这才是结局卡的 C 位。
 */
export function evaluatePlayer(s: GameState): PlayerVerdict {
  const st = s.stats
  const care = st.careCount ?? 0
  const work = st.workCount ?? 0
  const low = st.lowMoodDays ?? 0
  const { blocks, mines, maxParallel: par, drinks, checksPassed: passed, checksFailed: failed, spent } = st
  const confirmed = Object.values(s.npcs).filter((n) => n.stage === 'confirmed').length
  const cohabiting = s.flags.includes('cohabiting')

  // 性格标签:独立打分,收集全部命中,取前 4 个
  const tagPool: [boolean, string][] = [
    [par >= 4, '#雨露均沾'],
    [par >= 3 && confirmed === 0, '#海王体质'],
    [blocks >= 3, '#绝情'],
    [care >= 4, '#电子暖宝'],
    [mines >= 3, '#嘴比脑快'],
    [work >= 4, '#搞钱要紧'],
    [drinks >= 5, '#酒局选手'],
    [passed >= 4 && passed >= failed * 2, '#人间清醒'],
    [failed >= 4 && failed >= passed, '#社死体质'],
    [low >= 2, '#精神内耗'],
    [s.mood >= 78, '#情绪松弛'],
    [spent >= 5000, '#该花花该省省'],
    [cohabiting, '#同居过'],
    [confirmed >= 1, '#上过岸'],
    [s.origin === 'rich', '#含金汤匙'],
    [s.origin === 'energetic', '#电量永动机'],
  ]
  const tags = tagPool.filter(([c]) => c).map(([, t]) => t)

  // 人格标题:按优先级取第一个命中的极端人设
  const titleRules: [boolean, string][] = [
    [par >= 4, '朝阳区中央空调 · 持证上岗'],
    [work >= 5, '为搞钱燃尽自己的卷王'],
    [blocks >= 4, '拉黑如呼吸的绝情战神'],
    [mines >= 4, '嘴比脑子快半拍的社交莽夫'],
    [failed >= 5 && failed > passed, '社死界的活化石'],
    [care >= 5 && blocks <= 1, '行走的电子暖宝宝'],
    [drinks >= 6, '北京酒局头号幸存者'],
    [low >= 3 || s.mood <= 15, '精神内耗永动机'],
    [passed >= 6 && passed >= failed * 2, '一张嘴走遍朝阳区'],
    [spent >= 8000 && confirmed >= 1, '把钱包和真心一起梭哈的恋爱脑'],
    [confirmed >= 1 && blocks === 0 && mines <= 1, '稳稳上岸的松弛人'],
  ]
  const title = titleRules.find(([c]) => c)?.[1] ?? '北漂 dating 众生相之一'

  // 鉴定评语:主线索 + 数据点拼装
  const bits: string[] = []
  bits.push(
    par >= 3
      ? '你在多条战线上同时发力,鱼塘水质优良。'
      : confirmed >= 1
        ? '你把心思压在了一个人身上,难得。'
        : '你在暧昧的边缘反复横跳,谁也没真正抓住。',
  )
  if (care >= 3) bits.push('嘘寒问暖是你的主武器,')
  if (blocks >= 3) bits.push(`亲手拉黑了 ${blocks} 个人,`)
  if (mines >= 3) bits.push(`嘴上踩了 ${mines} 次雷,`)
  if (work >= 4) bits.push('加班搬钱一刻没停,')
  if (low >= 2) bits.push('好几个深夜没睡好,')
  bits.push(
    s.mood >= 78
      ? '但整体状态在线,气场没垮。'
      : s.mood <= 22
        ? '这座城市这个月把你熬得有点狠。'
        : '不好不坏,和大多数北漂一样,凑合着往前走。',
  )

  return { title, tags: tags.slice(0, 4), verdict: bits.join('') }
}
