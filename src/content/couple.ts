import { CharacterProfile, GameState, NodeDef, NpcState, RandomEventDef, Script } from '@/engine/types'
import { pick } from '@/engine/rng'
import { chat, eventScript, me, nar, node, npc, sys } from './util'

/**
 * 恋爱后内容(确立关系解锁):
 * - COUPLE ping 池:第一次吵架/见死党/纪念日/去TA家/TA妈视频/深夜求抱抱——高光与翻车两头都响
 * - 吃醋保卫战事件:前任回头/同事高调追求——赢=大涨+cp_guard,作=大扣
 * cp_* npcFlags 供恋爱后成就链判定(achievements.ts)。
 */

interface CoupleVariant {
  id: string
  ok: (n: NpcState) => boolean
  build: (p: CharacterProfile) => NodeDef[]
}

const COUPLE_VARIANTS: CoupleVariant[] = [
  // 💢 第一次吵架
  {
    id: 'quarrel',
    ok: () => true,
    build: () => [
      node('a', [
        npc('「我不想说话。」'),
        npc('「你自己想想昨天怎么回事。」'),
        nar('在一起后的第一次低气压。TA生气的点,你大概知道,又不完全确定。'),
      ], {
        choices: [
          { text: '不猜了,直接打电话:「我错了,先抱一个,再听你说」', effects: { favor: 8, care: true, npcFlags: ['cp_makeup'] }, danmaku: ['#win'], goto: 'makeup' },
          {
            text: '认真复盘:把昨天的时间线捋一遍,找到那个让TA不舒服的瞬间',
            check: { skill: 'mind', dc: 12, pass: 'talk_ok', fail: 'talk_fail' },
          },
          { text: '(已读,不回——等TA自己气消)', effects: { hiddenFavor: -12, mood: -3 }, goto: 'cold' },
        ],
      }),
      node('makeup', [
        npc('「……谁要抱。」'),
        nar('电话那头沉默三秒,然后传来一声很轻的笑:「晚上过来,给你做面。算你会认错。」'),
        sys('💞 第一次吵架,和好了。这种事,处理好一次,关系就厚一层。'),
      ], { end: true }),
      node('talk_ok', [
        me('「是不是昨天我一直看手机?那时候在回工作群,但确实冷落你了,是我不对。」'),
        npc('「……你还知道啊。」'),
        nar('说中了。TA的气焰肉眼可见地降下来,末了小声说:「下次再这样,试试。」'),
      ], { effects: { favor: 7, npcFlags: ['cp_makeup'] }, end: true }),
      node('talk_fail', [
        me('「是不是因为我上周说你朋友那件事?」'),
        npc('「??所以你上周就觉得我朋友有问题?」'),
        nar('你精准地引爆了第二颗雷。这场冷战延长了 24 小时。'),
      ], { effects: { favor: -8, awkward: 8 }, end: true }),
      node('cold', [nar('你选择了等。TA也在等。两个人都在等对方先低头,冷战像加了保鲜膜,原样保存。')], { end: true }),
    ],
  },
  // 🍻 见TA死党(考核局)
  {
    id: 'bestie',
    ok: (n) => n.stage === 'confirmed',
    build: () => [
      node('a', [
        npc('「周六空着!我死党说要「审核」你,饭我订好了。」'),
        npc('「提示:TA嘴很毒,但心是好的。别怂。」'),
        nar('恋爱的期中考试来了:死党考核局。'),
      ], {
        choices: [
          {
            text: '全场稳住:接梗、挡酒、把死党的连环拷问一一化解',
            check: { skill: 'mouth', dc: 13, pass: 'pass_ok', fail: 'pass_fail', crit: 'pass_crit' },
          },
          { text: '不表演,真诚牌:把你们在一起的小事讲给死党听', effects: { favor: 7, npcFlags: ['cp_bestie'] }, goto: 'sincere' },
          { text: '(已读,不回——「审核」什么的,好可怕)', effects: { hiddenFavor: -12, mood: -2 }, goto: 'dodge' },
        ],
      }),
      node('pass_crit', [
        nar('散场时,死党搂着TA的肩膀,当着你的面说:「这个可以,比上一个强多了。」'),
        npc('「什么上一个!没有上一个!」TA红着脸捶死党,眼睛却在笑。'),
        sys('🍻 死党认证通过——这比过了丈母娘那关都难。'),
      ], { effects: { favor: 12, npcFlags: ['cp_bestie'] }, danmaku: ['#win'], end: true }),
      node('pass_ok', [nar('三轮拷问,你稳稳接住。死党冲TA使了个眼色,TA假装没看见,嘴角却压不住。')], { effects: { favor: 9, npcFlags: ['cp_bestie'] }, end: true }),
      node('pass_fail', [
        nar('死党问「你们以后怎么打算」,你卡壳了五秒,说了句「顺其自然」。'),
        nar('饭桌安静了一拍。TA低头夹菜,没说话。'),
      ], { effects: { favor: -6, awkward: 8 }, end: true }),
      node('sincere', [
        nar('你没接梗,就讲了那天TA加班,你在楼下等到十一点的事。'),
        nar('死党听完,半天说了句:「行,是个实在人。」实在,是这场考核的最高分。'),
      ], { end: true }),
      node('dodge', [nar('你没接话。周六的饭局,TA一个人去的。死党问起你,TA只能打圆场。那顿饭,TA吃得很没面子。')], { end: true }),
    ],
  },
  // 🎂 纪念日
  {
    id: 'anniversary',
    ok: (n) => n.stage === 'confirmed' && n.dates >= 2,
    build: () => [
      node('a', [
        npc('「问你哦。」'),
        npc('「今天是什么日子?」'),
        nar('危险的问题。答对了是糖,答错了是雷。你快速心算:确立关系那天、第一次约会、TA的生日……'),
      ], {
        choices: [
          { text: '稳稳答上:是我们在一起「满月」的日子。礼物在路上了', effects: { favor: 12, wallet: -180, npcFlags: ['cp_anniv'] }, danmaku: ['#win'], goto: 'right' },
          {
            text: '不确定,但演技先行:「这你都要问?我早就订好位置了」(边说边疯狂查手机)',
            check: { skill: 'mind', dc: 13, pass: 'bluff_ok', fail: 'bluff_fail' },
          },
          { text: '坦白:完了,我真想不起来……你说,我认罚', effects: { favor: -6 }, goto: 'forgot' },
        ],
      }),
      node('right', [npc('「你记得?!」'), nar('TA盯着你看了三秒,忽然把脸埋进你肩膀:「烦死了,谁要你记这种的……但礼物我要。」'), sys('🎂 纪念日,满分通过。')], { end: true }),
      node('bluff_ok', [nar('你一边说一边用0.5秒扫到了手机备忘录:确立纪念日。稳了。'), me('「走,今晚那家你上次说想去的,我订了。」'), npc('「……好啊。看来是真记得。」'), nar('有惊无险。回家路上你默默给所有纪念日设了年度提醒。')], { effects: { favor: 8, wallet: -320, npcFlags: ['cp_anniv'] }, end: true }),
      node('bluff_fail', [nar('「订好位置了?哪家?」TA眼睛眯起来。你报不出店名。'), npc('「呵。」'), nar('一个字,杀伤力拉满。今晚的沙发是你的了。')], { effects: { favor: -9, awkward: 10 }, end: true }),
      node('forgot', [npc('「认罚?行。」'), nar('TA罚你陪TA看了一整晚TA最爱、你最看不懂的综艺,并全程考察你的笑点是否真诚。勉强过关。')], { end: true }),
    ],
  },
  // 🍳 去TA家吃TA做的饭
  {
    id: 'home_meal',
    ok: (n) => n.favor >= 70,
    build: () => [
      node('a', [
        npc('「今晚来我家吧。」'),
        npc('「我做饭。丑话说前面:好不好吃,都得吃完。」'),
        nar('去TA家吃TA亲手做的饭——这是关系里程碑,也是生存挑战。'),
      ], {
        choices: [
          { text: '带上水果和一瓶酒,准点敲门:「主厨,需要帮厨吗?」', effects: { favor: 10, wallet: -128, care: true, npcFlags: ['cp_home'] }, danmaku: ['#win'], goto: 'dinner_warm' },
          {
            text: '吃完那盘灵魂料理后,给出既真诚又不致命的点评',
            check: { skill: 'mouth', dc: 12, pass: 'review_ok', fail: 'review_fail' },
          },
          { text: '(已读,不回——今晚有点怂)', effects: { hiddenFavor: -14, mood: -3 }, goto: 'noshow' },
        ],
      }),
      node('dinner_warm', [
        nar('厨房很小,两个人转身都难。TA切菜,你洗碗,油烟机嗡嗡响,像某种生活的预告片。'),
        npc('「其实我就会这三个菜。」TA把最后一盘端上桌,「以后……慢慢学。」'),
        nar('「以后」这个词,比菜香。'),
      ], { end: true }),
      node('review_ok', [me('「番茄炒蛋盐放多了,但火候是懂行的。综合评价:想天天吃。」'), npc('「说盐多的部分收回,后半句保留。」'), nar('TA嘴上不饶人,却把「天天吃」三个字记进了心里。')], { effects: { favor: 8, npcFlags: ['cp_home'] }, end: true }),
      node('review_fail', [me('「这个……很有创意。」'), npc('「创意?」'), nar('在厨艺点评界,「有创意」约等于「难吃」。TA当场宣布下次改点外卖,你花了一小时才哄回来。')], { effects: { favor: -5, awkward: 8 }, end: true }),
      node('noshow', [nar('那桌菜TA一个人吃的。第二天TA没提这事——没提,才是最重的那种。')], { end: true }),
    ],
  },
  // 📹 TA妈的视频电话
  {
    id: 'mom_video',
    ok: (n) => n.stage === 'confirmed' && n.favor >= 75,
    build: () => [
      node('a', [
        nar('你们窝在沙发上看剧,TA的手机突然响了——视频电话,备注:妈。'),
        npc('「完了我妈!你——」'),
        nar('接还是不接,镜头里有没有你,0.5秒内必须决定。'),
      ], {
        choices: [
          { text: '大大方方坐进镜头:「阿姨好!」', effects: { favor: 9, npcFlags: ['cp_family'] }, danmaku: ['#win'], goto: 'hello' },
          {
            text: '顺势接过手机,三句话让阿姨笑出声',
            check: { skill: 'mouth', dc: 12, pass: 'charm_ok', fail: 'charm_fail' },
          },
          { text: '闪电滚出镜头,躲进厨房', effects: { favor: -4 }, goto: 'hide' },
        ],
      }),
      node('hello', [npc('(TA妈)「哟——这就是你说的那个「朋友」?挺精神啊。」'), npc('「妈!!挂了啊!周末回去说!」'), nar('挂断后,TA把脸埋进抱枕。三分钟后小声说:「我妈说你上镜。」'), sys('📹 已在TA的家庭系统里留下备案。')], { end: true }),
      node('charm_ok', [nar('你三句话把阿姨聊得合不拢嘴,末了阿姨说:「周末带TA回来吃饭,我做拿手菜。」'), npc('「……你比我会聊我妈。」TA的表情一半嫉妒一半庆幸。')], { effects: { favor: 12, npcFlags: ['cp_family'] }, danmaku: ['#win'], end: true }),
      node('charm_fail', [nar('你紧张之下叫了「奶奶好」。'), nar('电话两头同时安静。TA妈的表情管理输给了你的称呼管理。'), npc('「是阿姨!!」')], { effects: { favor: -3, awkward: 15 }, danmaku: ['#cringe'], end: true }),
      node('hide', [npc('(挂了电话)「躲什么呀,又不是见网友。」'), nar('TA嘴上打趣,眼神里有一点点没说出口的失落。')], { end: true }),
    ],
  },
  // 🌙 深夜求抱抱
  {
    id: 'night_emo',
    ok: () => true,
    build: () => [
      node('a', [
        npc('「今天好累。」(23:47)'),
        npc('「什么都不想说,就想见你。」'),
        nar('深夜的这种消息,是恋人之间的红色警报,响一次,必须接。'),
      ], {
        choices: [
          { text: '回:「楼下等我,20分钟。」然后立刻打车', effects: { favor: 11, wallet: -45, care: true, npcFlags: ['cp_night'] }, danmaku: ['#simp'], goto: 'come' },
          { text: '打语音过去,轻声哄TA:今天谁欺负你了,一件件说', effects: { favor: 7, care: true }, goto: 'voice' },
          { text: '(已读,不回——太晚了,明天再说吧)', effects: { hiddenFavor: -14, mood: -3 }, goto: 'ignore' },
        ],
      }),
      node('come', [
        nar('20分钟后,TA裹着外套站在楼下,看到你,眼眶一下就红了。'),
        npc('「……你真来啊。」'),
        nar('那晚你们没说几句话,就在小区里走了三圈。有的时候,出现本身就是全部答案。'),
        sys('🌙 深夜奔赴一次,顶一百句晚安。'),
      ], { end: true }),
      node('voice', [nar('语音里TA的声音闷闷的,讲到一半忽然说:「好了,充上电了。」'), npc('「你这个人,还挺好用的。」')], { end: true }),
      node('ignore', [nar('第二天TA说没事了。但那晚23:47的求救信号没被接住这件事,被存进了TA心里的某个文件夹。')], { end: true }),
    ],
  },
]

/** 情侣/准情侣专属 ping(官宣后全量解锁;暧昧到位也能提前触发一部分——北京节奏) */
export function buildCouplePing(n: NpcState, profile: CharacterProfile): Script {
  const pool = COUPLE_VARIANTS.filter((v) => v.ok(n) && !n.flags.includes(`cp_done_${v.id}`))
  const v = pool.length > 0 ? pick(pool) : pick(COUPLE_VARIANTS.filter((x) => x.ok(n)).length ? COUPLE_VARIANTS.filter((x) => x.ok(n)) : COUPLE_VARIANTS)
  n.flags.push(`cp_done_${v.id}`) // 每个情侣事件每人只出一次,保持新鲜
  const nodes = v.build(profile)
  nodes[0].lines.unshift(
    nar(
      n.stage === 'confirmed'
        ? `❤️ ${profile.name}(你的官方对象)发来消息。`
        : `💗 ${profile.name}发来消息——你们还没官宣,但这条消息的口气,已经不太「朋友」了。`,
    ),
  )
  const sc = chat(`cping_${v.id}_${profile.id}`, nodes)
  sc.npcId = profile.id
  return sc
}

// ============ 吃醋保卫战(随机事件;前任回头在暧昧期就可能上演——北京节奏) ============
function confirmedPartner(s: GameState): NpcState | undefined {
  return Object.values(s.npcs).find((n) => n.stage === 'confirmed')
}

/** 保卫战对象:官方对象优先;没有官宣但暧昧到位(dating 好感≥65)的也算 */
function guardTarget(s: GameState): NpcState | undefined {
  return (
    confirmedPartner(s) ??
    Object.values(s.npcs).find((n) => n.stage === 'dating' && n.favor >= 65)
  )
}

export const GUARD_EVENTS: RandomEventDef[] = [
  // 👻 前任回头
  {
    id: 'ex_return',
    once: true,
    eligible: (s) => !!guardTarget(s) && s.day >= 6,
    weight: () => 13,
    build: (s) => {
      const partner = guardTarget(s)
      if (!partner) return null
      const sc = eventScript('ev_exreturn', '前任回头', 'bar', [
        node('a', [
          npc('「给你看个东西。」'),
          nar('TA把手机递过来:TA的前任,深夜发来长文,大意是「分开之后才知道你的好,能不能再试试」。'),
          npc('「我还没回。先给你看。」'),
          nar('TA在看你。这是一道关于你们关系的考题,考的是你。'),
        ], {
          danmaku: ['#seen'],
          choices: [
            {
              text: '平静而笃定:「替我谢谢TA,帮我确认了我现在的位置。」',
              check: { skill: 'mouth', dc: 13, pass: 'win', fail: 'meh', crit: 'crit' },
            },
            { text: '把选择权还给TA:「你想怎么回就怎么回,我信你。」', effects: { favor: 9, npcFlags: ['cp_guard'] }, goto: 'trust' },
            { text: '阴阳怪气:「哟,旧情复燃了?要不你们聊聊?」', effects: { favor: -12, awkward: 10 }, goto: 'sour' },
          ],
        }),
        node('crit', [
          nar('你说完,顺手把TA的手机倒扣在桌上,又把TA的手握进手里。'),
          npc('「……就这?不吃醋?」'),
          me('「吃。所以今晚你哪都别去,陪我。」'),
          nar('TA当着你的面回了三个字:「不必了。」然后拉黑。'),
          sys('🛡️ 关系保卫战:完胜。'),
        ], { effects: { favor: 14, npcFlags: ['cp_guard'] }, danmaku: ['#win'], end: true }),
        node('win', [
          npc('「这个回答,可以。」'),
          nar('TA在你面前把那条长文删了,连同那个对话框。有些门,当着你的面关上,才算真的关上。'),
          sys('🛡️ 关系保卫战:胜利。'),
        ], { effects: { favor: 11, npcFlags: ['cp_guard'] }, danmaku: ['#win'], end: true }),
        node('meh', [
          nar('你想说得体面,出口却带了一点酸:「……随便你呗。」'),
          npc('「随便?」'),
          nar('TA把手机收回去,那条消息最后怎么回的,TA没再给你看。'),
        ], { effects: { favor: -6 }, end: true }),
        node('trust', [
          npc('「我想怎么回?」'),
          nar('TA当着你的面打字:「我现在过得很好,别再联系了。」发送,拉黑,放下手机。'),
          npc('「看到没,这就是我想的。」'),
          sys('🛡️ 信任本身,就是最好的宣示。'),
        ], { danmaku: ['#win'], end: true }),
        node('sour', [
          npc('「我给你看,是因为不想瞒你。你阴阳我?」'),
          nar('一场本可以加深信任的考题,被你答成了导火索。那晚你们不欢而散。'),
        ], { end: true }),
      ])
      sc.npcId = partner.id
      return sc
    },
  },
  // 💐 高调追求者
  {
    id: 'rival_suitor',
    once: true,
    eligible: (s) => !!confirmedPartner(s) && s.day >= 5,
    weight: () => 13,
    build: (s) => {
      const partner = confirmedPartner(s)
      if (!partner) return null
      const sc = eventScript('ev_rival', '高调追求者', 'shop', [
        node('a', [
          npc('「有点烦。」'),
          npc('「公司新来的那位,连续一周往我工位送咖啡,今天直接升级成花了。全组都在看热闹。」'),
          nar('TA跟你说这事,语气是烦,但也是在等你的反应。'),
        ], {
          choices: [
            {
              text: '下班时间,出现在TA公司楼下:接TA下班,当众自然牵手',
              check: { skill: 'image', dc: 12, pass: 'show_ok', fail: 'show_meh' },
            },
            { text: '不搞大动作,把日常升级:早安晚安、午餐投喂、下雨备伞', effects: { favor: 8, care: true, npcFlags: ['cp_guard'] }, goto: 'steady' },
            { text: '质问TA:「你是不是也没拒绝得很干脆?」', effects: { favor: -10, awkward: 8 }, goto: 'blame' },
          ],
        }),
        node('show_ok', [
          nar('你倚在TA公司楼下,风衣被晚风吹得恰到好处。TA走出来愣了一下,然后快步走向你。'),
          nar('你自然地接过TA的包,牵手,转身。全组的八卦群,当晚更新了终章。'),
          npc('「明天开始,应该没人送咖啡了。」TA晃着你的手,「不过你今天,有点帅过头了。」'),
          sys('🛡️ 关系保卫战:一次亮相,天下太平。'),
        ], { effects: { favor: 12, npcFlags: ['cp_guard'] }, danmaku: ['#win'], end: true }),
        node('show_meh', [
          nar('你计划了一场偶像剧式亮相,结果在公司门口被保安拦下登记了十分钟。'),
          npc('「哈哈哈哈你怎么在访客登记处?!」'),
          nar('亮相变成了喜剧,但TA笑得很开心,顺手牵起了你的手——效果,意外达成了。'),
        ], { effects: { favor: 6, awkward: 8, npcFlags: ['cp_guard'] }, end: true }),
        node('steady', [
          nar('你没去争一时的场面,而是把每一天都过得更细。一周后,TA把那束花转送给了前台。'),
          npc('「跟你说,今天那位找我摊牌,我说:我对象把我照顾得很好,谢谢关心。」'),
          npc('「「很好」这两个字,是你挣的。」'),
        ], { danmaku: ['#win'], end: true }),
        node('blame', [
          npc('「我跟你说这事,是想让你安心,不是让你审我。」'),
          nar('TA的失望比生气更明显。这道题你答反了方向。'),
        ], { end: true }),
      ])
      sc.npcId = partner.id
      return sc
    },
  },
]
