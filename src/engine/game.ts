import { chance, pick, seedRng, weighted } from './rng'
import { dailyDecay, DecayNews, genQuirks, isAlive, rollMood, updateParallel } from './relations'
import {
  CharacterProfile,
  DateSpot,
  GameState,
  Line,
  NodeDef,
  NpcState,
  OpinionQ,
  Script,
  SkillId,
  TOTAL_DAYS,
  Version,
} from './types'
import { getCharacters, getEvents, getGenericChats, getOpinions, getTemplate } from '@/content'
import { getUnlockedCodes } from './save'

// ============ 开局 ============
export function newGame(version: Version, skills: Record<SkillId, number>, seed?: number): GameState {
  const s0 = seed ?? (Date.now() % 2147483647)
  seedRng(s0)
  const chars = getCharacters(version)
  const npcs: Record<string, NpcState> = {}
  for (const c of chars) {
    const q = genQuirks()
    npcs[c.id] = {
      id: c.id,
      stage: 'chatting',
      favor: 10 + skills.image * 2,
      mood: rollMood(),
      topicIdx: 0,
      usedOpinions: [],
      usedHidden: [],
      dates: 0,
      quirkTastes: q.tastes,
      quirkBans: q.bans,
      banHits: [],
      flags: [],
      lastDay: 1,
      unread: true,
    }
  }
  return {
    version,
    seed: s0,
    day: 1,
    slot: 0,
    skills,
    wallet: 600 + skills.money * 350,
    awkward: 0,
    npcs,
    flags: getUnlockedCodes().map((c) => `code:${c}`),
    opinionLog: {},
    stats: {
      spent: 0,
      blocks: 0,
      blackouts: 0,
      mines: 0,
      maxParallel: 0,
      fateRolls: 0,
      fateHits: 0,
      drinks: 0,
      checksPassed: 0,
      checksFailed: 0,
    },
    eventDone: [],
    luckyDay: false,
  }
}

// ============ 时段推进 ============
export interface SlotAdvance {
  newDay: boolean
  decay: DecayNews[]
  eventId?: string
}

export function advanceSlot(s: GameState): SlotAdvance {
  updateParallel(s)
  if (s.slot === 0) {
    s.slot = 1
    return { newDay: false, decay: [] }
  }
  // 进入新的一天
  s.slot = 0
  s.day += 1
  s.luckyDay = false
  s.awkward = Math.max(0, s.awkward - 10)
  const decay = dailyDecay(s)
  for (const npc of Object.values(s.npcs)) {
    if (isAlive(npc)) {
      npc.mood = rollMood()
      if (chance(0.35)) npc.unread = true
    }
  }
  // 抽随机事件
  let eventId: string | undefined
  if (s.day <= TOTAL_DAYS && chance(0.6)) {
    const pool = getEvents(s.version).filter(
      (e) => e.eligible(s) && !(e.once && s.eventDone.includes(e.id)),
    )
    const ev = weighted(pool, (e) => e.weight(s))
    if (ev) {
      eventId = ev.id
      s.eventDone.push(ev.id)
      s.pendingEvent = ev.id
    }
  }
  return { newDay: true, decay, eventId }
}

// ============ 行动:加班搞钱 / 躺平回血 ============
export function doWork(s: GameState): string {
  const gain = 260 + s.skills.money * 60
  s.wallet += gain
  for (const npc of Object.values(s.npcs)) {
    if (isAlive(npc) && npc.stage !== 'confirmed') npc.favor = Math.max(0, npc.favor - 2)
  }
  return `加了一晚上班,到手 ¥${gain}。所有人的消息都被你已读不回。`
}

export function doRest(s: GameState): string {
  s.awkward = Math.max(0, s.awkward - 45)
  return '你点了外卖,躺在出租屋刷了一晚上短视频。社死值大幅回复,人生毫无进展。'
}

// ============ 聊天会话构建 ============
function cloneScript(sc: Script): Script {
  return JSON.parse(JSON.stringify(sc))
}

function withMoodOpener(sc: Script, profile: CharacterProfile, npc: NpcState): Script {
  const line = profile.moodLines[npc.mood]
  if (!line || npc.mood === 'normal') return sc
  const s2 = cloneScript(sc)
  s2.nodes[s2.start].lines.unshift({ who: 'npc', text: line })
  return s2
}

export function buildChatSession(s: GameState, profile: CharacterProfile): Script {
  const npc = s.npcs[profile.id]

  // 1. 初次聊天
  if (!npc.flags.includes('intro_done')) {
    npc.flags.push('intro_done')
    return cloneScript(profile.intro)
  }

  // 2. 暗号解锁的隐藏剧情
  for (const h of profile.hiddenTopics ?? []) {
    if (s.flags.includes(`code:${h.codeId}`) && !npc.usedHidden.includes(h.script.id)) {
      npc.usedHidden.push(h.script.id)
      return withMoodOpener(cloneScript(h.script), profile, npc)
    }
  }

  // 3. 专属话题与看法题交替
  const wantTopic = npc.topicIdx <= npc.usedOpinions.length
  if (wantTopic && npc.topicIdx < profile.topics.length) {
    const sc = profile.topics[npc.topicIdx]
    npc.topicIdx++
    return withMoodOpener(cloneScript(sc), profile, npc)
  }
  const qPool = getOpinions().filter((q) => !npc.usedOpinions.includes(q.id))
  if (qPool.length > 0) {
    const q = pick(qPool)
    npc.usedOpinions.push(q.id)
    return withMoodOpener(buildOpinionScript(q, profile), profile, npc)
  }
  if (npc.topicIdx < profile.topics.length) {
    const sc = profile.topics[npc.topicIdx]
    npc.topicIdx++
    return withMoodOpener(cloneScript(sc), profile, npc)
  }

  // 4. 话题池耗尽:日常闲聊
  return withMoodOpener(cloneScript(pick(getGenericChats())), profile, npc)
}

// ============ 看法题 → 聊天剧本 ============
const shortText = (t: string) => (t.length > 18 ? t.slice(0, 18) + '…' : t)

export function buildOpinionScript(q: OpinionQ, profile: CharacterProfile): Script {
  const nodes: Record<string, NodeDef> = {}
  const choices = q.options.map((o, i) => {
    const isDeath = o.tags.some((t) => profile.deathTags.includes(t))
    const isLove = o.tags.some((t) => profile.loves.includes(t))
    const isHate = o.tags.some((t) => profile.hates.includes(t))
    const gotoId = isDeath ? `death_${i}` : isLove ? 'good' : isHate ? 'bad' : 'meh'
    if (isDeath) {
      nodes[`death_${i}`] = {
        id: `death_${i}`,
        lines: [
          { who: 'npc', text: pick(profile.blockLines) },
          { who: 'sys', text: '对方已开启朋友验证。你还不是TA朋友。' },
        ],
        effects: { block: `卒于观点:「${shortText(o.text)}」` },
        end: true,
      }
    }
    return {
      text: o.text,
      effects: {
        favor: isDeath ? 0 : isLove ? 9 : isHate ? -9 : 2,
        awkward: isHate ? 8 : 0,
        mine: isHate,
        saying: o.saying,
        opinion: { id: q.id, tags: o.tags },
      },
      danmaku: isLove ? ['#smart'] : isHate ? ['#down'] : undefined,
      goto: gotoId,
    }
  })

  nodes.ask = {
    id: 'ask',
    lines: [{ who: 'npc', text: q.ask }],
    choices,
  }
  nodes.good = {
    id: 'good',
    lines: [
      { who: 'npc', text: pick(['我也是这么想的!你这个人有点东西。', '啊,终于有人跟我想的一样了。', '就是说!!(TA一连发来三个感叹号)']) },
      { who: 'nar', text: 'TA回消息的速度明显变快了。' },
    ],
    end: true,
  }
  nodes.bad = {
    id: 'bad',
    lines: [
      { who: 'npc', text: pick(['……这样啊。', '嗯,每个人想法不一样吧。', '哈哈。(就俩字,还带句号)']) },
      { who: 'nar', text: '空气突然安静。你盯着输入框,不知道怎么接。' },
    ],
    end: true,
  }
  nodes.meh = {
    id: 'meh',
    lines: [{ who: 'npc', text: pick(['有道理。', '嗯嗯,懂你意思。', '也是哈。']) }],
    end: true,
  }

  return { id: `op_${q.id}`, kind: 'chat', nodes, start: 'ask' }
}

// ============ 约会 ============
export interface InviteResult {
  accepted: boolean
  line: string
}

export function tryInvite(s: GameState, profile: CharacterProfile, spot: DateSpot): InviteResult {
  const npc = s.npcs[profile.id]
  if (s.wallet < spot.price) {
    return { accepted: false, line: `你看了眼余额(¥${s.wallet}),默默退出了对话框。这顿约不起。` }
  }
  if (npc.mood === 'great') {
    return { accepted: true, line: '「好呀好呀!我正想出门!」秒回。' }
  }
  if (npc.favor < 20) {
    return { accepted: false, line: '「最近有点忙,改天哈~」——你懂的,北京人说改天,就是没有那天。' }
  }
  if ((npc.mood === 'grumpy' || npc.mood === 'hungover') && chance(0.45)) {
    return {
      accepted: false,
      line:
        npc.mood === 'grumpy'
          ? '「今天要加班,下次吧。」(配了一个官方微笑表情)'
          : '「今天有点不舒服……改天好不好?」(TA昨晚好像喝多了)',
    }
  }
  return { accepted: true, line: '「行啊,那到时候见。」' }
}

/** 构建约会剧本:场景模板 + 好感达标时在结尾注入「表白」支线 */
export function buildDateSession(s: GameState, profile: CharacterProfile, spot: DateSpot): Script {
  const npc = s.npcs[profile.id]
  if (npc.stage === 'chatting') npc.stage = 'dating'
  npc.dates++
  s.wallet -= spot.price
  s.stats.spent += spot.price
  const sc = getTemplate(spot.template)(profile, npc, s, spot)

  const wrap = Object.values(sc.nodes).find((n) => n.end && n.id === 'wrap')
  if (wrap && npc.stage !== 'confirmed' && npc.favor >= 65 && npc.dates >= 2) {
    wrap.end = false
    wrap.choices = [
      { text: '趁今晚气氛正好,把那句话说出来', goto: 'cf_start' },
      { text: '把话咽回去,来日方长', goto: 'cf_pass' },
    ]
    Object.assign(sc.nodes, confirmNodes(profile))
  }
  return sc
}

/** 通用表白剧本(嵌入约会结尾),台词由角色档案提供 */
function confirmNodes(profile: CharacterProfile): Record<string, NodeDef> {
  const nodes: NodeDef[] = [
    {
      id: 'cf_start',
      lines: [
        { who: 'nar', text: '你深吸一口气。北京的晚风正好路过,替你壮了个胆。' },
        { who: 'me', text: '「其实……我挺喜欢你的。要不要,试着在一起?」' },
      ],
      choices: [
        {
          text: '直视TA的眼睛,等一个答案',
          check: { skill: 'mouth', dc: 12, pass: 'cf_yes', fail: 'cf_no', crit: 'cf_yes', fumble: 'cf_oops' },
        },
        {
          text: '掏出手机,翻出你备忘录里没敢发的那段话给TA看',
          check: { skill: 'mind', dc: 10, pass: 'cf_yes', fail: 'cf_no', fumble: 'cf_oops' },
          danmaku: ['#simp'],
        },
      ],
    },
    {
      id: 'cf_yes',
      lines: [
        { who: 'npc', text: profile.confirmYes },
        { who: 'sys', text: '🎉 关系确立!' },
      ],
      effects: { confirm: true, favor: 10 },
      danmaku: ['#win'],
      end: true,
    },
    {
      id: 'cf_no',
      lines: [
        { who: 'npc', text: profile.confirmNo },
        { who: 'nar', text: '话说出口的瞬间你就后悔了时机。晚风还在吹,只是有点冷。' },
      ],
      effects: { favor: -8, awkward: 12 },
      danmaku: ['#cringe'],
      end: true,
    },
    {
      id: 'cf_oops',
      lines: [
        { who: 'nar', text: '你太紧张,说成了「我们试着在一起,要不要喜欢你」。' },
        { who: 'npc', text: '「???」' },
        { who: 'nar', text: '旁边遛弯的大爷都替你尴尬,摇着头走远了。' },
      ],
      effects: { favor: -12, awkward: 25 },
      danmaku: ['#cringe'],
      end: true,
    },
    {
      id: 'cf_pass',
      lines: [{ who: 'nar', text: '你把话咽了回去。有些话,北京的风替你保管着,下次记得来取。' }],
      end: true,
    },
  ]
  return Object.fromEntries(nodes.map((n) => [n.id, n]))
}

// ============ 交互后标记 ============
export function touchNpc(s: GameState, npcId: string) {
  const npc = s.npcs[npcId]
  npc.lastDay = s.day
  npc.unread = false
}

export function isGameOver(s: GameState): boolean {
  return s.day > TOTAL_DAYS
}

export function makeSysScript(id: string, lines: Line[]): Script {
  return { id, kind: 'event', nodes: { n: { id: 'n', lines, end: true } }, start: 'n' }
}
