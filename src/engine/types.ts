// ============ 基础枚举 ============
export type Version = 'male' | 'female'
export type SkillId = 'mouth' | 'mind' | 'liquor' | 'culture' | 'image' | 'money'
export type MoodId = 'normal' | 'great' | 'hungover' | 'slacking' | 'grumpy'
export type Stage = 'chatting' | 'dating' | 'confirmed' | 'blocked' | 'ghosted' | 'faded'
export type TemplateId = 'bar' | 'expo' | 'dinner' | 'citywalk' | 'sport' | 'shopping'

export const SKILLS: { id: SkillId; name: string; emoji: string; desc: string }[] = [
  { id: 'mouth', name: '嘴力', emoji: '💬', desc: '话术检定、化解尴尬、圆谎' },
  { id: 'mind', name: '心眼子', emoji: '🧠', desc: '识破海王、读潜台词、看穿情绪' },
  { id: 'liquor', name: '酒量', emoji: '🍺', desc: '酒局血条,北京应酬硬通货' },
  { id: 'culture', name: '文化值', emoji: '🎨', desc: '看展聊乐队,装懂会被识破' },
  { id: 'image', name: '形象管理', emoji: '😎', desc: '初见好感基数、出片率' },
  { id: 'money', name: '钞能力', emoji: '💰', desc: '决定开局资金,北京物价真实还原' },
]

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
  slot: 0 | 1
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
export const SKILL_POINTS = 20
export const SKILL_MIN = 1
export const SKILL_MAX = 8
