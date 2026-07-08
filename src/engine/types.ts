// ============ 基础枚举 ============
export type Version = 'male' | 'female'
/** 内容层剧本沿用的检定属性 id(引擎映射:mouth/mind/culture→文化水平,image→排面,liquor→隐藏酒量) */
export type SkillId = 'mouth' | 'mind' | 'liquor' | 'culture' | 'image' | 'money'
export type MoodId = 'normal' | 'great' | 'hungover' | 'slacking' | 'grumpy'
export type Stage = 'locked' | 'chatting' | 'dating' | 'confirmed' | 'blocked' | 'ghosted' | 'faded'
export type TemplateId =
  | 'bar'
  | 'expo'
  | 'dinner'
  | 'citywalk'
  | 'sport'
  | 'shopping'
  | 'ktv'
  | 'jubensha'
  | 'park'
export type OriginId = 'normal' | 'rich' | 'energetic'
export type EduId = 'gaozhi' | 'putong' | 'tiyu' | 'mingyuan'

/** 检定属性的展示名(暗骰原则下仅用于置灰理由等文案) */
export const SKILL_DISPLAY: Record<SkillId, { name: string; emoji: string }> = {
  mouth: { name: '文化水平', emoji: '🎓' },
  mind: { name: '文化水平', emoji: '🎓' },
  culture: { name: '文化水平', emoji: '🎓' },
  image: { name: '排面', emoji: '😎' },
  liquor: { name: '酒量', emoji: '🍺' },
  money: { name: '钞能力', emoji: '💰' },
}

// ============ 开局:文化三档(第三档按版本:男版体育生 / 女版名媛) ============
export interface EduTier {
  id: EduId
  name: string
  emoji: string
  culture: number
  desc: string
  salaryMul: number
  walletMod: number
  liquorMod: number
  sleepAwkBonus: number
  /** 开局对所有 NPC 初始好感的加成(名媛的社交光环) */
  favorMod?: number
}

const GAOZHI: EduTier = {
  id: 'gaozhi',
  name: '高知',
  emoji: '🎓',
  culture: 7,
  desc: '文化水平 7 · 月薪x1.3(名校溢价) · 存款 -2000(读书读的)',
  salaryMul: 1.3,
  walletMod: -2000,
  liquorMod: 0,
  sleepAwkBonus: 0,
}
const PUTONG: EduTier = {
  id: 'putong',
  name: '普通青年',
  emoji: '📖',
  culture: 5,
  desc: '文化水平 5 · 无修正,主打一个平凡',
  salaryMul: 1,
  walletMod: 0,
  liquorMod: 0,
  sleepAwkBonus: 0,
}
const TIYU: EduTier = {
  id: 'tiyu',
  name: '体育生',
  emoji: '🏀',
  culture: 3,
  desc: '文化水平 3 · 存款 +1000 · 酒量天赋异禀 · 睡一觉啥尴尬都忘了',
  salaryMul: 1,
  walletMod: 1000,
  liquorMod: 2,
  sleepAwkBonus: 10,
}
const MINGYUAN: EduTier = {
  id: 'mingyuan',
  name: '名媛',
  emoji: '👑',
  culture: 5,
  desc: '文化水平 5 · 会来事,开局自带社交好感;排面看家底',
  salaryMul: 1,
  walletMod: 0,
  liquorMod: 0,
  sleepAwkBonus: 0,
  favorMod: 8,
}

/** 文化三档按版本给:男版第三档体育生 / 女版第三档名媛 */
export function getEduTiers(version: Version): EduTier[] {
  return [GAOZHI, PUTONG, version === 'female' ? MINGYUAN : TIYU]
}

/** 按 id 查档(跨版本,供引擎结算/存档回读) */
export function findEduTier(id: EduId): EduTier {
  return [GAOZHI, PUTONG, TIYU, MINGYUAN].find((t) => t.id === id) ?? PUTONG
}

// ============ 开局:投胎骰(隐藏预设,抽中才揭晓) ============
export interface Origin {
  id: OriginId
  name: string
  emoji: string
  weight: number
  energy: number
  wallet: number
  rent: number
  salary: number
  reveal: string
}

export const ORIGINS: Origin[] = [
  {
    id: 'normal',
    name: '普通北漂',
    emoji: '🧑‍💻',
    weight: 84,
    energy: 4,
    wallet: 12000,
    rent: 5000,
    salary: 18000,
    reveal:
      '你睁开眼:合租次卧,月租五千,室友在客厅打游戏。存款一万二,月薪一万八。北京欢迎你——用它自己的方式。',
  },
  {
    id: 'rich',
    name: '钞能力',
    emoji: '💰',
    weight: 8,
    energy: 3,
    wallet: 999999,
    rent: 0,
    salary: 80000,
    reveal:
      '你睁开眼:三环内的房,房本上有你的名字,家里给的。在家族企业挂了个职,月薪八万。钱对你来说只是数字——但精力不是,应酬太多,你总觉得累。',
  },
  {
    id: 'energetic',
    name: '高精力宝宝',
    emoji: '⚡',
    weight: 8,
    energy: 8,
    wallet: 6000,
    rent: 3500,
    salary: 12000,
    reveal:
      '你睁开眼:青年公寓开间,月租三千五,存款六千,月薪一万二。穷,但你拥有这座城市最稀缺的资源——用不完的精力。别人下班瘫着,你还能再赴两个局。',
  },
]

// ============ 经济常量 ============
/** 每日吃喝通勤基础开销 */
export const DAILY_FOOD = 80

/** 行动精力消耗 */
export const ENERGY_COST = { chat: 1, date: 2, work: 2 }

/** 排面基础值(月光族下限;实际排面由资产分档 imageFromWallet 决定) */
export const PAIMIAN_BASE = 2

/** 并聊上限 = 精力换算(普通北漂精力4→3人;高精力宝宝精力8→4人封顶;钞能力精力3→2人) */
export function parallelCap(maxEnergy: number): number {
  return Math.max(1, Math.min(4, Math.floor(maxEnergy / 2) + 1))
}

export const MOODS: Record<MoodId, { name: string; emoji: string; hint: string; dcMod: number }> = {
  normal: { name: '正常', emoji: '💼', hint: '看起来一切如常', dcMod: 0 },
  great: { name: '心情爆好', emoji: '😊', hint: '回复飞快,还主动发了表情包', dcMod: -3 },
  hungover: { name: '宿醉中', emoji: '🍺', hint: '回复很慢,还有错别字……昨晚喝多了?', dcMod: 2 },
  slacking: { name: '摆烂中', emoji: '🛋️', hint: '语气蔫蔫的,像被生活抽干了', dcMod: 0 },
  grumpy: { name: '加班暴躁', emoji: '😡', hint: '回复全是句号。今天最好别惹', dcMod: 4 },
}

// ============ 剧本节点 ============
export interface Line {
  who: 'npc' | 'me' | 'nar' | 'sys'
  text: string
}

export interface CheckDef {
  skill: SkillId
  dc: number
  pass: string
  fail: string
  crit?: string
  fumble?: string
}

export interface Effects {
  favor?: number
  awkward?: number
  wallet?: number
  drink?: number
  flags?: string[]
  npcFlags?: string[]
  taste?: string
  saying?: string
  care?: boolean
  mine?: boolean
  blackout?: boolean
  opinion?: { id: string; tags: string[] }
  block?: string
  blockNpcIds?: { id: string; reason: string }[]
  endGame?: string
  confirm?: boolean
}

export interface ChoiceDef {
  text: string
  require?: { skill: SkillId; min: number; gray: string }
  check?: CheckDef
  effects?: Effects
  danmaku?: string[]
  goto?: string
  showIf?: string
  hideIf?: string
}

export interface NodeDef {
  id: string
  lines: Line[]
  effects?: Effects
  danmaku?: string[]
  choices?: ChoiceDef[]
  next?: string
  end?: boolean
}

export interface Script {
  id: string
  kind: 'chat' | 'scene' | 'event'
  title?: string
  location?: string
  bg?: string
  npcId?: string
  nodes: Record<string, NodeDef>
  start: string
}

// ============ 看法题 ============
export interface OpinionOption {
  text: string
  tags: string[]
  saying?: string
}

export interface OpinionQ {
  id: string
  ask: string
  options: OpinionOption[]
}

// ============ 角色 ============
export interface DateSpot {
  template: TemplateId
  location: string
  price: number
  label: string
}

export interface CharacterProfile {
  id: string
  name: string
  emoji: string
  color: string
  bio: string
  archetype: string
  loves: string[]
  hates: string[]
  deathTags: string[]
  decay: number
  mainSkill: SkillId
  /** 擦边剧情概率系数 0-1(SFW,默认 0.1) */
  spicy?: number
  intro: Script
  topics: Script[]
  hiddenTopics?: { codeId: string; script: Script }[]
  dateSpots: DateSpot[]
  moodLines: Partial<Record<MoodId, string>>
  confirmYes: string
  confirmNo: string
  he: { title: string; badge: string; comment: string; secretCode?: string }
  trueFlag: string
  trueHe: { title: string; badge: string; comment: string; secretCode?: string }
  blockLines: string[]
}

// ============ 运行时状态 ============
export interface NpcState {
  id: string
  stage: Stage
  favor: number
  mood: MoodId
  topicIdx: number
  usedOpinions: string[]
  usedHidden: string[]
  usedGeneric: string[]
  dates: number
  quirkTastes: Record<string, number>
  quirkBans: string[]
  banHits: string[]
  flags: string[]
  blockReason?: string
  lastDay: number
  unread: boolean
}

export interface RunStats {
  spent: number
  blocks: number
  blackouts: number
  mines: number
  maxParallel: number
  fateRolls: number
  fateHits: number
  drinks: number
  checksPassed: number
  checksFailed: number
  /** 加班次数(卷王指数) */
  workCount: number
  /** 暖心选择次数(嘘寒问暖) */
  careCount: number
  /** 心情跌到低区的天数(内耗指数) */
  lowMoodDays: number
}

export interface EndingResult {
  id: string
  npcId?: string
  detail?: string
}

export interface GameState {
  version: Version
  seed: number
  day: number
  /** 当日剩余精力(行动点) */
  energy: number
  maxEnergy: number
  /** 玩家隐藏心情 0-100,不展示 */
  mood: number
  origin: OriginId
  edu: EduId
  /** 隐藏酒量 1-10,不展示 */
  hiddenLiquor: number
  rent: number
  salary: number
  skills: Record<SkillId, number>
  wallet: number
  awkward: number
  npcs: Record<string, NpcState>
  flags: string[]
  opinionLog: Record<string, string[]>
  stats: RunStats
  ending?: EndingResult
  eventDone: string[]
  luckyDay: boolean
  pendingEvent?: string
  /** 共有池(generic/spicy/interlude)整局全局已用脚本 id,保证每条只出现一次 */
  usedShared: string[]
}

// ============ 结局 ============
export interface EndingDef {
  id: string
  rank: 'win' | 'draw' | 'lose' | 'egg'
  title: string
  stars: number
  badge: string
  comment: string
  hint: string
  secretCode?: string
  xhsPost?: boolean
}

// ============ 随机事件 ============
export interface RandomEventDef {
  id: string
  once?: boolean
  eligible: (s: GameState) => boolean
  weight: (s: GameState) => number
  build: (s: GameState) => Script | null
}

export const TOTAL_DAYS = 14
