import { chance, pick, rand, seedRng, weighted } from './rng'
import { chargeWallet, dailyDecay, DecayNews, genQuirks, isAlive, rollMood, updateParallel } from './relations'
import { bumpMood, moodDrift } from './mood'
import {
  CharacterProfile,
  DateSpot,
  DAILY_FOOD,
  EDU_TIERS,
  EduId,
  ENERGY_COST,
  GameState,
  Line,
  NodeDef,
  NpcState,
  OpinionQ,
  ORIGINS,
  OUTFITS,
  PAIMIAN_BASE,
  parallelCap,
  Script,
  TOTAL_DAYS,
  Version,
} from './types'
import {
  getCharacters,
  getEvents,
  getGenericChats,
  getInterludes,
  getOpinions,
  getSpicyChats,
  getTemplate,
} from '@/content'
import { getUnlockedCodes } from './save'

// ============ 开局:文化三档 + 投胎骰 ============
export function newGame(version: Version, edu: EduId, seed?: number): GameState {
  const s0 = seed ?? (Date.now() % 2147483647)
  seedRng(s0)
  const eduT = EDU_TIERS.find((e) => e.id === edu) ?? EDU_TIERS[1]
  const origin = weighted(ORIGINS, (o) => o.weight)!

  const wallet = Math.max(1000, origin.wallet + eduT.walletMod)
  const salary = Math.round(origin.salary * eduT.salaryMul)
  const hiddenLiquor = Math.min(10, 1 + Math.floor(rand() * 8) + eduT.liquorMod)

  const chars = getCharacters(version)
  const npcs: Record<string, NpcState> = {}
  for (const c of chars) {
    const q = genQuirks()
    npcs[c.id] = {
      id: c.id,
      stage: 'locked',
      favor: 12,
      mood: rollMood(),
      topicIdx: 0,
      usedOpinions: [],
      usedHidden: [],
      usedGeneric: [],
      dates: 0,
      quirkTastes: q.tastes,
      quirkBans: q.bans,
      banHits: [],
      flags: [],
      lastDay: 1,
      unread: false,
    }
  }
  // 按并聊上限随机解锁开局对象
  const cap = parallelCap(origin.energy)
  const ids = Object.keys(npcs)
  for (let i = 0; i < cap && ids.length > 0; i++) {
    const id = ids.splice(Math.floor(rand() * ids.length), 1)[0]
    npcs[id].stage = 'chatting'
    npcs[id].unread = true
  }

  return {
    version,
    seed: s0,
    day: 1,
    energy: origin.energy,
    maxEnergy: origin.energy,
    mood: 60,
    origin: origin.id,
    edu,
    hiddenLiquor,
    outfit: 0,
    rent: origin.rent,
    salary,
    skills: {
      mouth: eduT.culture,
      mind: eduT.culture,
      culture: eduT.culture,
      liquor: hiddenLiquor,
      image: PAIMIAN_BASE,
      money: origin.id === 'rich' ? 8 : 3,
    },
    wallet,
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

// ============ 精力 ============
export function spendEnergy(s: GameState, n: number) {
  s.energy = Math.max(0, s.energy - n)
}

export function canAfford(s: GameState, action: keyof typeof ENERGY_COST): boolean {
  return s.energy >= ENERGY_COST[action]
}

// ============ 睡觉 = 结束一天 ============
export interface SleepResult {
  cost: number
  bankrupt: boolean
  decay: DecayNews[]
  eventId?: string
  gameOver: boolean
}

export function sleep(s: GameState): SleepResult {
  const eduT = EDU_TIERS.find((e) => e.id === s.edu)!
  const cost = Math.round(s.rent / 30) + DAILY_FOOD
  const bankrupt = chargeWallet(s, cost)

  updateParallel(s)
  s.day += 1
  s.energy = s.maxEnergy
  s.luckyDay = false
  s.awkward = Math.max(0, s.awkward - 25 - eduT.sleepAwkBonus)
  moodDrift(s)

  if (bankrupt || s.day > TOTAL_DAYS) {
    return { cost, bankrupt, decay: [], gameOver: s.day > TOTAL_DAYS }
  }

  const decay = dailyDecay(s)
  for (const npc of Object.values(s.npcs)) {
    if (isAlive(npc)) {
      npc.mood = rollMood()
      if (chance(0.35)) npc.unread = true
    }
  }
  // 抽随机事件
  let eventId: string | undefined
  if (chance(0.6)) {
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
  return { cost, bankrupt: false, decay, eventId, gameOver: false }
}

// ============ 行动:加班搬钱 ============
export function doWork(s: GameState): string {
  const gain = Math.round((s.salary / 22) * 1.5)
  s.wallet += gain
  spendEnergy(s, ENERGY_COST.work)
  bumpMood(s, -6) // 搞钱不是零成本:加班太多会内耗心情(喂给「气场」雪球的另一面)
  for (const npc of Object.values(s.npcs)) {
    if (isAlive(npc) && npc.stage !== 'confirmed') npc.favor = Math.max(0, npc.favor - 2)
  }
  return `加了一晚上班,加班费到手 ¥${gain}。所有人的消息都被你已读不回。`
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
  spendEnergy(s, ENERGY_COST.chat)

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

  // 3. 擦边池(SFW):按角色 spicy 系数概率插入
  const spicyPool = getSpicyChats().filter((c) => !npc.usedGeneric.includes(c.id))
  if (spicyPool.length > 0 && npc.favor >= 40 && chance(profile.spicy ?? 0.1)) {
    const sc = pick(spicyPool)
    npc.usedGeneric.push(sc.id)
    return withMoodOpener(cloneScript(sc), profile, npc)
  }

  // 4. 专属话题与看法题交替
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

  // 5. 话题池耗尽:公用闲聊(避免重复)
  const gPool = getGenericChats().filter((c) => !npc.usedGeneric.includes(c.id))
  const g = gPool.length > 0 ? pick(gPool) : pick(getGenericChats())
  npc.usedGeneric.push(g.id)
  return withMoodOpener(cloneScript(g), profile, npc)
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

/** 构建约会剧本:扣钱+行头结算+场景模板+表白注入。outfitIdx 对应 OUTFITS 下标 */
export function buildDateSession(
  s: GameState,
  profile: CharacterProfile,
  spot: DateSpot,
  outfitIdx: number,
): Script {
  const npc = s.npcs[profile.id]
  const outfit = OUTFITS[outfitIdx] ?? OUTFITS[0]
  if (npc.stage === 'chatting') npc.stage = 'dating'
  npc.dates++
  spendEnergy(s, ENERGY_COST.date)
  chargeWallet(s, spot.price + outfit.cost) // UI 侧已保证不会当场归零;真归零走 bankrupt

  // 行头:临时排面 + 初见加成
  s.outfit = outfit.bonus
  s.skills.image = PAIMIAN_BASE + outfit.bonus
  if (outfit.bonus > 0) npc.favor = Math.min(100, npc.favor + outfit.bonus)

  const sc = getTemplate(spot.template)(profile, npc, s, spot)

  // 随机注入一条公用约会小插曲(约40%)
  if (chance(0.4)) {
    const il = cloneScript(pick(getInterludes()))
    for (const nd of Object.values(il.nodes)) {
      if (nd.next === '@start') nd.next = sc.start
    }
    Object.assign(sc.nodes, il.nodes)
    sc.start = il.start
  }

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

/** 约会结束后复位行头 */
export function resetOutfit(s: GameState) {
  s.outfit = 0
  s.skills.image = PAIMIAN_BASE
}

/** 当前同居对象(仅在还活跃时返回) */
export function cohabitPartner(s: GameState): NpcState | null {
  if (!s.flags.includes('cohabiting')) return null
  const p = Object.values(s.npcs).find((n) => n.flags.includes('cohabit'))
  if (!p) return null
  const alive = ['chatting', 'dating', 'confirmed'].includes(p.stage)
  return alive ? p : null
}

/**
 * 结婚资格:同居 + 好感/真心/约会次数拉满 + 财力精力达标
 * (钞能力出身可豁免精力要求——有钱能把婚礼全包出去)
 */
export function marriageEligible(s: GameState, profile: CharacterProfile): boolean {
  const npc = s.npcs[profile.id]
  if (npc.stage !== 'confirmed') return false
  if (!npc.flags.includes('cohabit')) return false
  if (npc.favor < 98 || npc.dates < 5 || !npc.flags.includes(profile.trueFlag)) return false
  if (s.wallet < 20000) return false
  if (s.maxEnergy < 4 && s.origin !== 'rich') return false
  return true
}

/** 婚姻骰:极限状态下,约会结束暗掷 */
export function marriageRoll(s: GameState, profile: CharacterProfile): boolean {
  return marriageEligible(s, profile) && chance(0.08)
}

/** 同居对峙:被发现和别人暧昧,文化水平够高可以圆过去,否则拉黑分手 */
export function buildConfrontation(
  s: GameState,
  partner: CharacterProfile,
  otherName: string,
): Script {
  const nodes: NodeDef[] = [
    {
      id: 'a',
      lines: [
        {
          who: 'nar',
          text: `同居的家,是没有暗格的。你刚把手机扣在沙发上,${partner.name}端着水走过来,顺手把它翻了个面——屏幕还亮着,和${otherName}的对话框,停在最新一条。`,
        },
        { who: 'npc', text: '「聊得挺开心?」' },
        { who: 'nar', text: '水杯放在桌上的声音很轻。轻得像审讯室的灯。' },
      ],
      danmaku: ['#seen'],
      choices: [
        {
          text: '稳住呼吸,把这段聊天解释成一场无害的社交',
          check: { skill: 'culture', dc: 14, pass: 'ok', fail: 'busted', crit: 'crit', fumble: 'fumble' },
        },
        {
          text: '坦白:确实聊了。对不起,我把界限弄丢了',
          effects: { favor: -18, awkward: 10 },
          goto: 'honest',
        },
        {
          text: '反问:你翻我手机?你不信任我?',
          effects: { block: '同居后被抓包,还倒打一耙' },
          danmaku: ['#block'],
        },
      ],
    },
    {
      id: 'crit',
      lines: [
        { who: 'me', text: `「${otherName}?TA最近在帮我挑你的生日礼物。本来想瞒到下个月的——行吧,惊喜提前报废。」` },
        { who: 'nar', text: '你语气笃定,细节丰满,连叹气的时机都恰到好处。' },
        { who: 'npc', text: '「……真的?」' },
        { who: 'nar', text: 'TA信了,还有点愧疚。你圆过去了,圆得漂亮,漂亮得让你自己心里发虚。' },
      ],
      effects: { favor: 2 },
      end: true,
    },
    {
      id: 'ok',
      lines: [
        { who: 'me', text: '「就是普通朋友聊两句,你看时间,都是白天,内容你随便翻。」' },
        { who: 'npc', text: '「……行,信你一次。」' },
        { who: 'nar', text: 'TA把水杯拿走了,门关得比平时响一点。这一页翻过去了,但书上留了折角。' },
      ],
      effects: { favor: -8 },
      end: true,
    },
    {
      id: 'busted',
      lines: [
        { who: 'nar', text: '你解释到第三句,时间线自己打了自己。' },
        { who: 'npc', text: partner.blockLines[0] },
        { who: 'nar', text: '那把钥匙被TA从你钥匙串上摘了下来,放在桌上,和水杯并排。' },
        { who: 'sys', text: '💔 同居后还和别人暧昧,被当场抓包。分手,拉黑,搬家,一晚上办完。' },
      ],
      effects: { block: '同居后和别人暧昧,被当场抓包' },
      danmaku: ['#block'],
      end: true,
    },
    {
      id: 'fumble',
      lines: [
        { who: 'nar', text: '慌乱中,你竟然说出了「你先冷静,TA只是个备胎」这种话。' },
        { who: 'nar', text: '空气死了。你也是。' },
        { who: 'npc', text: partner.blockLines[0] },
        { who: 'sys', text: '💔 这句「备胎」,当晚被写进了小蓝书,没指名道姓,但小区都知道了。' },
      ],
      effects: { block: '同居劈腿被抓,嘴里还蹦出了「备胎」二字', awkward: 25 },
      danmaku: ['#block', '#cringe'],
      end: true,
    },
    {
      id: 'honest',
      lines: [
        { who: 'npc', text: '「……至少你没编。」' },
        { who: 'nar', text: 'TA在阳台站了很久。那晚你们背对背睡,中间隔着一条看不见的三八线。' },
        { who: 'nar', text: '坦白保住了同居,但有些东西碎了,胶水是时间,工期未知。' },
      ],
      end: true,
    },
  ]
  return {
    id: 'confront',
    kind: 'event',
    title: '同居对峙',
    bg: 'dinner',
    npcId: partner.id,
    nodes: Object.fromEntries(nodes.map((n) => [n.id, n])),
    start: 'a',
  }
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

/** 首次喝酒后的隐藏酒量模糊评语 */
export function liquorHint(s: GameState): string | null {
  if (s.flags.includes('liquor_hinted')) return null
  s.flags.push('liquor_hinted')
  if (s.hiddenLiquor >= 7) return '几杯下肚,你意外地稳。看来你的肝是个深藏不露的狠角色。'
  if (s.hiddenLiquor >= 4) return '你有点上头,但还撑得住。你的酒量大概就是「普通人」三个字。'
  return '两杯下去你就开始看什么都重影。今晚,你的肝在写辞职信。'
}
