import { CharacterProfile, NodeDef, NpcState, Script } from '@/engine/types'
import { pick } from '@/engine/rng'
import { chat, nar, node, npc } from './util'

/**
 * 主动邀约/发消息(强制处理):某天早上,一个在聊的人主动来找你。
 * 每个变体都带一个「已读不回」选项——冷暴力不炸雷,但隐藏好感(hiddenFavor)悄悄扣,
 * 不显示浮动数字、不弹任何提示,只有 TA 之后的态度会告诉你答案。
 */

const IGNORED_LINES = [
  '对话框安静下来。有些冷落不会立刻爆炸,它只是被记下了。',
  '你把手机扣在桌上。那条消息的「已读」两个字,在TA那头亮了一整晚。',
  '没有回复也是一种回复。TA大概也是这么理解的。',
]

/** 已读不回节点(共用) */
function ignoredNode(): NodeDef {
  return node('ignored', [nar(pick(IGNORED_LINES))], { end: true })
}

/** 已读不回选项(共用;隐藏扣好感,心情也小降——冷暴力这种事,做的人也不好受) */
function ignoreChoice(hidden: number) {
  return {
    text: '(已读,不回——手指在输入框上停了停,又划走了)',
    effects: { hiddenFavor: hidden, mood: -2 },
    goto: 'ignored',
  }
}

interface PingVariant {
  id: string
  /** 触发条件 */
  ok: (n: NpcState) => boolean
  build: (p: CharacterProfile) => NodeDef[]
}

const VARIANTS: PingVariant[] = [
  // 🐱 分享型:突然的分享欲(低门槛)
  {
    id: 'share_cat',
    ok: (n) => n.favor >= 25,
    build: () => [
      node('a', [
        npc('(TA突然发来一张照片:写字楼下的流浪猫,正襟危坐,像在开晨会)'),
        npc('「快看!它是不是在等它的甲方?」'),
        nar('大清早的分享欲,是一种小心翼翼的靠近。'),
      ], {
        choices: [
          { text: '回:它在等你。顺便等你手里的火腿肠', effects: { favor: 7, tone: 'liao' }, goto: 'warm' },
          { text: '回:哈哈', effects: { favor: 1, saying: 'hhh' }, goto: 'meh' },
          ignoreChoice(-10),
        ],
      }),
      node('warm', [npc('「你怎么知道我包里真有火腿肠!!」'), nar('TA发来一段猫吃火腿肠的视频,配文:替你喂的。')], { end: true }),
      node('meh', [npc('「就哈哈?」'), npc('「行吧,打工人笑点确实要省着用。」')], { end: true }),
      ignoredNode(),
    ],
  },
  // 🍜 深夜便利店型
  {
    id: 'midnight_store',
    ok: (n) => n.favor >= 30,
    build: () => [
      node('a', [
        npc('「刚加完班。全世界只剩便利店还亮着灯。」'),
        npc('(TA发来一张关东煮的照片,热气糊了镜头一角)'),
      ], {
        choices: [
          { text: '回:替我吃一串萝卜,算我陪你加过这个班', effects: { favor: 8, care: true }, goto: 'warm' },
          { text: '拍下自己桌上的泡面回敬:深夜干饭人,在线结盟', effects: { favor: 8 }, goto: 'ally' },
          ignoreChoice(-10),
        ],
      }),
      node('warm', [npc('「萝卜确实好吃。」'), npc('「……好了,吃完这串就有力气回家了。晚安。」'), nar('TA的「晚安」后面,难得地没有句号。')], { end: true }),
      node('ally', [npc('「??你也没睡!」'), npc('「深夜干饭人联盟+1。改天线下会餐,谁不来谁请客。」')], { end: true }),
      ignoredNode(),
    ],
  },
  // 😞 情绪低谷型
  {
    id: 'emo_down',
    ok: (n) => n.favor >= 40,
    build: () => [
      node('a', [
        npc('「今天被领导当着全组的面批了……」'),
        npc('「其实他说得对,可能我真的不太行。」'),
        nar('这种消息,发出来之前一定删删改改了很多遍。'),
      ], {
        choices: [
          { text: '直接拨语音电话过去——这种时候,声音比文字暖', effects: { favor: 10, care: true }, danmaku: ['#simp'], goto: 'call' },
          { text: '回:别想太多,早点睡吧', effects: { favor: -2, saying: 'zaoshui' }, goto: 'cold' },
          ignoreChoice(-13),
        ],
      }),
      node('call', [
        nar('电话响了一声就被接起来了,像TA一直握着手机在等。'),
        npc('「……喂。你怎么打电话来了。」'),
        nar('那通电话打了四十分钟。TA后来说的每一句丧气话,音量都比上一句小,最后变成了笑。'),
      ], { end: true }),
      node('cold', [npc('「嗯,好。」'), nar('有些求救信号只发一次。你回了个天气预报。')], { end: true }),
      ignoredNode(),
    ],
  },
  // 🍝 主动邀约型(高好感)
  {
    id: 'invite_dinner',
    ok: (n) => n.favor >= 55 && n.stage !== 'confirmed',
    build: () => [
      node('a', [
        npc('「今晚有空吗?」'),
        npc('「发现一家开在胡同里的小馆子,就八张桌子。不知道为什么,第一个想到你。」'),
        nar('「第一个想到你」——这六个字TA打了又删,最后还是发了。'),
      ], {
        choices: [
          { text: '回:有空。几点?地址发我,我先去排队', effects: { favor: 9, tone: 'zhiqiu', npcFlags: ['tension'] }, danmaku: ['#win'], goto: 'yes' },
          { text: '坦白:今天真的累瘫了……但这顿我记下了,周末补上,我请', effects: { favor: 3 }, goto: 'later' },
          ignoreChoice(-12),
        ],
      }),
      node('yes', [npc('「?!你这么痛快,我反而慌了。」'), npc('「六点半。别迟到,迟到罚你多吃一碗。」')], { end: true }),
      node('later', [npc('「行——那可说好了,周末。」'), npc('「你欠我一顿,利息按天算。」'), nar('话虽这么说,TA还是把那家店的定位发给了你。')], { end: true }),
      ignoredNode(),
    ],
  },
  // 🔍 查岗型(已确立限定)
  {
    id: 'checkup',
    ok: (n) => n.stage === 'confirmed',
    build: () => [
      node('a', [
        npc('「昨晚十一点半,你头像还亮着。」'),
        npc('「在忙什么呀?(微笑)」'),
        nar('这个微笑,和你领导发的那种,是同一个微笑。'),
      ], {
        choices: [
          { text: '如实交代行程,末了加一句「想你了,今晚见?」', effects: { favor: 6, care: true }, goto: 'sweet' },
          {
            text: '开玩笑顶回去:「查岗呢?查得这么勤,工资给结一下?」',
            check: { skill: 'mouth', dc: 12, pass: 'joke_ok', fail: 'joke_fail' },
          },
          ignoreChoice(-14),
        ],
      }),
      node('sweet', [npc('「哼,算你会说话。」'), npc('「今晚我下班早,买菜回家做饭。你负责洗碗。」')], { end: true }),
      node('joke_ok', [npc('「工资?你的工资就是我。」'), nar('对话在一片彩虹屁里安全落地,还赚了点甜。')], { effects: { favor: 7 }, end: true }),
      node('joke_fail', [npc('「我认真问你话呢。」'), nar('玩笑没接住,变成了火上浇油。你花了半小时才把这页翻过去。')], { effects: { favor: -8, awkward: 8 }, end: true }),
      ignoredNode(),
    ],
  },
  // 🎫 突然的票根型
  {
    id: 'sudden_ticket',
    ok: (n) => n.favor >= 45,
    build: () => [
      node('a', [
        npc('「我抽中了两张周五的电影点映!」'),
        npc('「就是那部……算了,你肯定没听过。总之影评人吵翻了的那部。」'),
        npc('「去吗?」'),
      ], {
        choices: [
          { text: '回:去。吵翻了的电影,得亲自去站个队', effects: { favor: 8, npcFlags: ['tension'] }, goto: 'yes' },
          { text: '认真问:哪部?我先去补个前作功课', effects: { favor: 6 }, goto: 'nerd' },
          ignoreChoice(-11),
        ],
      }),
      node('yes', [npc('「好!爆米花我买,你负责散场后陪我吵观后感。」')], { end: true }),
      node('nerd', [npc('「还做功课?!」'), npc('「行,是个懂尊重的观众。周五见。」')], { end: true }),
      ignoredNode(),
    ],
  },
]

/** 构建一次主动邀约会话:按 TA 的阶段/好感挑一个合适的变体 */
export function buildPing(n: NpcState, profile: CharacterProfile): Script {
  const pool = VARIANTS.filter((v) => v.ok(n))
  const v = pool.length > 0 ? pick(pool) : VARIANTS[0]
  const nodes = v.build(profile)
  // 开头加一行"TA 主动来找你"的系统感提示
  nodes[0].lines.unshift(nar(`一早,${profile.name}的消息主动跳了出来。`))
  const sc = chat(`ping_${v.id}_${profile.id}`, nodes)
  sc.npcId = profile.id
  return sc
}
