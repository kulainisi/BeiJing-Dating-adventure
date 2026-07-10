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
  | 'mishi'
  | 'livehouse'
  | 'wenquan'
export type OriginId = 'normal' | 'rich' | 'energetic' | 'laobj' | 'haigui' | 'chaiqian'
export type EduId = 'gaozhi' | 'putong' | 'shehui'
/** 说话风格:框架感(高教育)/ 谄媚会来事(社会大学);NPC 各有偏好 */
export type StyleId = 'frame' | 'flatter'
export type ProfId =
  | 'waimai'
  | 'zhuangxiu'
  | 'siji'
  | 'jiaolian'
  | 'chengxuyuan'
  | 'guoqi'
  | 'touhang'
  | 'naicha'
  | 'meijia'
  | 'youshi'
  | 'hushi'
  | 'kongjie'
  | 'xinmeiti'
  | 'lvshi'

/** 检定属性的展示名(暗骰原则下仅用于置灰理由等文案) */
export const SKILL_DISPLAY: Record<SkillId, { name: string; emoji: string }> = {
  mouth: { name: '文化水平', emoji: '🎓' },
  mind: { name: '文化水平', emoji: '🎓' },
  culture: { name: '文化水平', emoji: '🎓' },
  image: { name: '排面', emoji: '😎' },
  liquor: { name: '酒量', emoji: '🍺' },
  money: { name: '钞能力', emoji: '💰' },
}

// ============ 开局第一步:教育背景(决定说话风格:框架 vs 谄媚) ============
export interface EduBg {
  id: EduId
  name: string
  emoji: string
  desc: string
  /** 叠加在职业文化水平上 */
  cultureMod: number
  salaryMul: number
  walletMod: number
  liquorMod: number
  /** 说话风格:对上 NPC 偏好的选项大加分,对错减分 */
  style?: StyleId
}

export const EDU_BGS: EduBg[] = [
  {
    id: 'gaozhi',
    name: '高知',
    emoji: '🎓',
    desc: '名校出身,说话自带框架 · 文化+1 · 月薪x1.15 · 存款-2000(读书读的) · 吃逻辑的人爱这口',
    cultureMod: 1,
    salaryMul: 1.15,
    walletMod: -2000,
    liquorMod: 0,
    style: 'frame',
  },
  {
    id: 'putong',
    name: '普通青年',
    emoji: '📖',
    desc: '普通本科,说话不出错也不出彩 · 无修正,主打一个平凡',
    cultureMod: 0,
    salaryMul: 1,
    walletMod: 0,
    liquorMod: 0,
  },
  {
    id: 'shehui',
    name: '社会大学',
    emoji: '🤝',
    desc: '早早进社会,嘴甜会来事 · 文化-1 · 存款+1000 · 酒量+1 · 吃捧的人爱这口',
    cultureMod: -1,
    salaryMul: 1,
    walletMod: 1000,
    liquorMod: 1,
    style: 'flatter',
  },
]

export function findEdu(id: string | undefined): EduBg {
  return EDU_BGS.find((e) => e.id === id) ?? EDU_BGS[1]
}

// ============ 开局第二步:职业卡(男女分表,底层→顶层;职业决定薪资/房租/文化/工作事件) ============
export interface Profession {
  id: ProfId
  name: string
  emoji: string
  tier: '底层' | '中层' | '顶层'
  culture: number
  /** 月薪(工作事件收入按此比例浮动) */
  salary: number
  /** 月租(随机房租日一次性收取) */
  rent: number
  /** 初始存款 */
  wallet: number
  desc: string
  /** 开局对所有 NPC 初始好感的加成(社交型职业的光环) */
  favorMod?: number
  liquorMod?: number
  sleepAwkBonus?: number
}

const MALE_PROFS: Profession[] = [
  {
    id: 'waimai',
    name: '外卖骑手',
    emoji: '🛵',
    tier: '底层',
    culture: 3,
    salary: 8000,
    rent: 2600,
    wallet: 4000,
    desc: '风里来雨里去,准时率就是尊严。跑得多挣得多,摔一跤全赔进去',
    liquorMod: 1,
    sleepAwkBonus: 5,
  },
  {
    id: 'zhuangxiu',
    name: '装修师傅',
    emoji: '🔨',
    tier: '底层',
    culture: 3,
    salary: 13000,
    rent: 3000,
    wallet: 9000,
    desc: '手艺人,挣的都是辛苦钱但真不少。工地练出来的酒量和心态',
    liquorMod: 2,
    sleepAwkBonus: 10,
  },
  {
    id: 'siji',
    name: '网约车司机',
    emoji: '🚕',
    tier: '中层',
    culture: 4,
    salary: 11000,
    rent: 3200,
    wallet: 7000,
    desc: '方向盘一握,全北京的故事都听过。流水看着行,平台抽成看着心凉',
  },
  {
    id: 'jiaolian',
    name: '健身教练',
    emoji: '💪',
    tier: '中层',
    culture: 4,
    salary: 14000,
    rent: 4200,
    wallet: 8000,
    desc: '卖课为生,嘴甜是职业技能。开局自带社交好感',
    favorMod: 6,
    liquorMod: 1,
  },
  {
    id: 'chengxuyuan',
    name: '程序员',
    emoji: '🧑‍💻',
    tier: '中层',
    culture: 6,
    salary: 26000,
    rent: 5500,
    wallet: 16000,
    desc: '大厂P6,工资高,头发少。年终奖能救命,毕业裁员能要命',
  },
  {
    id: 'guoqi',
    name: '国企职员',
    emoji: '🏢',
    tier: '中层',
    culture: 6,
    salary: 11000,
    rent: 4000,
    wallet: 12000,
    desc: '钱不多但稳,相亲市场硬通货。开局自带体面光环',
    favorMod: 3,
    sleepAwkBonus: 5,
  },
  {
    id: 'touhang',
    name: '投行精英',
    emoji: '💼',
    tier: '顶层',
    culture: 7,
    salary: 50000,
    rent: 9500,
    wallet: 35000,
    desc: '国贸写字楼顶层,年薪百万。代价是没有下班这个概念',
  },
]

const FEMALE_PROFS: Profession[] = [
  {
    id: 'naicha',
    name: '奶茶店员',
    emoji: '🧋',
    tier: '底层',
    culture: 3,
    salary: 6500,
    rent: 2400,
    wallet: 3500,
    desc: '站一天摇一天,微笑服务刻进DNA。钱少,但认识全商圈的人',
    favorMod: 2,
  },
  {
    id: 'meijia',
    name: '美甲师',
    emoji: '💅',
    tier: '底层',
    culture: 3,
    salary: 9500,
    rent: 2800,
    wallet: 5000,
    desc: '一单一小时,唠嗑技能满级。开局自带社交好感',
    favorMod: 6,
  },
  {
    id: 'youshi',
    name: '幼儿园老师',
    emoji: '🧒',
    tier: '中层',
    culture: 5,
    salary: 8000,
    rent: 3300,
    wallet: 6000,
    desc: '温柔耐心,哄娃十级。工资对不起职业素养,但相亲市场评价极高',
    favorMod: 4,
    sleepAwkBonus: 5,
  },
  {
    id: 'hushi',
    name: '护士',
    emoji: '👩‍⚕️',
    tier: '中层',
    culture: 5,
    salary: 12000,
    rent: 3800,
    wallet: 8000,
    desc: '三班倒,夜班熬人。见过生死,一般的事吓不到你',
  },
  {
    id: 'kongjie',
    name: '空乘',
    emoji: '✈️',
    tier: '中层',
    culture: 5,
    salary: 16000,
    rent: 5000,
    wallet: 11000,
    desc: '飞国际线,职业光环拉满。开局自带高社交好感',
    favorMod: 8,
  },
  {
    id: 'xinmeiti',
    name: '新媒体运营',
    emoji: '📱',
    tier: '中层',
    culture: 6,
    salary: 13000,
    rent: 4300,
    wallet: 8000,
    desc: '追热点改文案,数据焦虑症晚期。梗浓度全场最高',
  },
  {
    id: 'lvshi',
    name: '律师',
    emoji: '⚖️',
    tier: '顶层',
    culture: 7,
    salary: 42000,
    rent: 9000,
    wallet: 30000,
    desc: '红圈所,时薪计费。逻辑锋利,战袍加身,没空谈恋爱才是最大问题',
  },
]

/** 职业卡按版本给(男版偏体力/蓝领,女版偏服务业;底层→顶层均匀铺开) */
export function getProfessions(version: Version): Profession[] {
  return version === 'female' ? FEMALE_PROFS : MALE_PROFS
}

/** 按 id 查职业(跨版本;未知 id 兜底为国企职员,兼容老存档) */
export function findProfession(id: string | undefined): Profession {
  return [...MALE_PROFS, ...FEMALE_PROFS].find((p) => p.id === id) ?? MALE_PROFS[5]
}

// ============ 开局:投胎骰(叠加在职业之上:管精力与家底运气,少数档还有额外体质) ============
export interface Origin {
  id: OriginId
  name: string
  emoji: string
  weight: number
  energy: number
  /** 家底加成(叠加在职业初始存款上) */
  walletBonus: number
  /** 家里有房:房租归零 */
  rentFree?: boolean
  /** 叠加在(职业+教育)文化水平上 */
  cultureMod?: number
  salaryMul?: number
  /** 开局全员初始好感加成(与职业 favorMod 叠加) */
  favorMod?: number
  liquorMod?: number
  reveal: string
}

export const ORIGINS: Origin[] = [
  {
    id: 'normal',
    name: '普通北漂',
    emoji: '🧑‍💻',
    weight: 73,
    energy: 4,
    walletBonus: 0,
    reveal:
      '你睁开眼:普普通通的北京早晨。没有天降的钱,也没有用不完的电——你有的,只有手上这份工作,和北京给每个人的同一套规则。',
  },
  {
    id: 'rich',
    name: '钞能力',
    emoji: '💰',
    weight: 8,
    energy: 3,
    walletBonus: 99999999, // 实际钱包在 newGame 固定为 99999999
    rentFree: true,
    reveal:
      '你睁开眼:三环内的房,房本上有你的名字,家里给的。银行 App 上的余额是一串你数不过来的 9。工作对你来说是体验生活——只是应酬太多,精力总差点意思。',
  },
  {
    id: 'energetic',
    name: '高精力宝宝',
    emoji: '⚡',
    weight: 8,
    energy: 8,
    walletBonus: 0,
    reveal:
      '你睁开眼:钱还是那点钱,班还是那个班。但你拥有这座城市最稀缺的资源——用不完的精力。别人下班瘫着,你还能再赴两个局。',
  },
  {
    id: 'laobj',
    name: '老北京er',
    emoji: '🏮',
    weight: 5,
    energy: 4,
    walletBonus: 30000,
    rentFree: true,
    favorMod: 4,
    liquorMod: 1,
    reveal:
      '你睁开眼:胡同里自家的房,推窗就是槐树,楼下是你大爷的棋摊。您在这城里有的不只是房——是三代人攒下的人脉和一口地道的京腔。聊什么,您都能搭上话。',
  },
  {
    id: 'haigui',
    name: '海归',
    emoji: '🛫',
    weight: 3,
    energy: 4,
    walletBonus: -3000,
    cultureMod: 1,
    salaryMul: 1.2,
    reveal:
      '你睁开眼:一箱行李,两个学位,时差还没倒过来。留学把家里的钱花得差不多了,但带回来的学历让 HR 愿意多给你两成——现在,该把学费挣回来了。',
  },
  {
    id: 'chaiqian',
    name: '拆迁户',
    emoji: '🧧',
    weight: 3,
    energy: 4,
    walletBonus: 600000,
    rentFree: true,
    reveal:
      '你睁开眼:回迁房的新床垫还带着塑料膜的味道。签字那天,你家从「住户」变成了「资产」——卡里躺着六十万,楼下车库还有两个车位。班还是要上的,但腰杆硬了。',
  },
]

// ============ 经济常量 ============
/** 每日日杂费(水电吃饭通勤等生活必需;房租另算,在随机房租日一次性收) */
export const DAILY_SUNDRY = 120

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
  /** 说话风格标记(框架/谄媚):引擎按 NPC 的 stylePref 加减分(对上+4/对错-3) */
  style?: StyleId
  /** 隐藏好感变动:不显示浮动数字、不触发里程碑(已读不回等冷暴力用) */
  hiddenFavor?: number
  /** 玩家心情变动(暗值) */
  mood?: number
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
  /** 需要持有某 flag 才可见(如 prof:hushi 职业专属回答) */
  showIf?: string
  /** 说话风格标记(框架/谄媚),引擎按 NPC 偏好加减分 */
  style?: StyleId
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
  /** 存款门槛:钱包低于此值时置灰(超豪华场地,钞能力/攒够钱才解锁) */
  minWallet?: number
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
  /** 看法题的角色定制反应(不配则用通用台词) */
  opinionReacts?: { good?: string[]; bad?: string[]; meh?: string[] }
  /** 说话风格偏好:frame=吃框架逻辑,flatter=吃谄媚彩虹屁;不配=两不吃 */
  stylePref?: StyleId
  /** 金钱观:love=吃排场(贵局加分/便宜局扣),hate=反感烧钱(贵局扣/便宜局加);不配=中立 */
  moneyView?: 'love' | 'hate'
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
  /** 隐藏挑剔度 0-1:对「说对了的话」也可能不买账(对抗性暗骰),不展示 */
  pickiness: number
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
  /** 教育背景(决定说话风格:框架/谄媚) */
  edu: EduId
  /** 职业(决定薪资/房租/文化/工作事件池) */
  prof: ProfId
  /** 隐藏酒量 1-10,不展示 */
  hiddenLiquor: number
  rent: number
  /** 随机房租日(第 4-12 天),当天一次性收整月房租 */
  rentDay: number
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
  /** 最近抽到的事件 id(最多 3 个),用于防止随机事件连刷同一个 */
  recentEvents: string[]
  /** 上次角色主动邀约/发消息的日子(控制频率:约 2-3 天一次) */
  lastPingDay?: number
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

// ============ 工作事件(按职业分池,加权抽取,有赚有赔) ============
export interface WorkOutcome {
  /** 事件文案(toast 展示,金额写死在文案里) */
  text: string
  /** 钱包变动(可为负:赔钱/被罚) */
  wallet: number
  /** 心情变动(默认 -5:搞钱不是零成本) */
  mood?: number
  awkward?: number
  weight: number
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
