import { GameState, NpcState, RandomEventDef, Script, Version } from '@/engine/types'
import { isAlive } from '@/engine/relations'
import { pick } from '@/engine/rng'
import { MALE_CHARS } from './male'
import { FEMALE_CHARS } from './female'
import { eventScript, me, nar, node, npc, sys } from './util'

function chars(v: Version) {
  return v === 'male' ? MALE_CHARS : FEMALE_CHARS
}
function nameOf(s: GameState, id: string) {
  return chars(s.version).find((c) => c.id === id)?.name ?? id
}
function aliveNpcs(s: GameState, minFavor = 0): NpcState[] {
  return Object.values(s.npcs).filter((n) => isAlive(n) && n.favor >= minFavor)
}

const EVENTS: RandomEventDef[] = [
  // 👀 亮马河目击事件:并聊人数越多,概率越高,可当场判负
  {
    id: 'seen',
    eligible: (s) => aliveNpcs(s, 30).length >= 2 && s.day >= 4,
    weight: (s) => (aliveNpcs(s, 30).length - 1) * 22,
    build: (s) => {
      const pool = aliveNpcs(s, 30)
      const a = pick(pool)
      const b = pick(pool.filter((x) => x.id !== a.id))
      const an = nameOf(s, a.id)
      const bn = nameOf(s, b.id)
      const sc = eventScript('ev_seen', '目击事件', 'walk', [
        node('a', [
          nar(`一觉醒来,${bn}发来一张照片:昨天傍晚的亮马河,你和${an}并肩走着,构图清晰,光线充足。`),
          npc(`「解释一下?我朋友随手拍河景,拍到了你俩。」`),
          sys('大型修罗场已加载完毕。'),
        ], {
          danmaku: ['#seen'],
          choices: [
            {
              text: '深呼吸,启动你这辈子最重要的一次现场找补',
              check: { skill: 'mind', dc: 14, pass: 'ok', fail: 'fail', crit: 'crit', fumble: 'fumble' },
            },
            {
              text: '坦白从宽:我们确实在接触阶段,我没想瞒你',
              goto: 'honest',
            },
          ],
        }),
        node('crit', [
          me(`「那是我表亲!来北京找工作,我带着转转。你要不要一起吃个饭?我介绍你们认识。」`),
          nar('你语气稳到连你自己都信了。对方将信将疑地收了刀。'),
          npc('「……哦,这样啊。那改天一起呗。」'),
          nar('危机解除,但你的心跳半小时后才恢复正常。'),
        ], { effects: { favor: 2 }, end: true }),
        node('ok', [
          me('「朋友聚会碰上的,一群人,镜头只框了俩。」'),
          npc('「……行吧,信你一次。」'),
          nar(`${bn}收起了照片,但没收起怀疑。你在悬崖边捡回一条命。`),
        ], { effects: { favor: -6 }, end: true }),
        node('fail', [
          nar('你支支吾吾,版本改了三次,时间线自相矛盾。'),
          npc('「够了。不用编了。」'),
          nar(`当晚,${an}也收到了同一张照片——${bn}转发的,附言:「姐妹/兄弟,避雷。」`),
          sys('两人同时把你拉黑了。'),
        ], {
          effects: {
            block: '亮马河目击现场,找补失败',
            blockNpcIds: [],
          },
          danmaku: ['#block'],
          end: true,
        }),
        node('fumble', [
          nar('你慌乱中把两个人的名字叫反了。'),
          nar('三小时后,一篇《北京Dating奇葩实录:我和姐妹/兄弟约了同一个人》冲上小蓝书同城热榜,配图是亮马河,主角是你。'),
        ], { effects: { endGame: 'xhs_posted' }, end: true }),
        node('honest', [
          me('「我们确实都在接触阶段,还没到承诺什么的时候。抱歉让你不舒服了。」'),
          npc('「……行,至少你没骗我。」'),
          nar(`${bn}沉默了很久:「那你想清楚了再来找我。」`),
        ], { effects: { favor: -14 }, end: true }),
      ])
      // fail 节点需要把另一个人也拉黑,这里补上具体 id
      const failNode = sc.nodes['fail']
      failNode.effects = {
        block: '亮马河目击现场,找补失败',
        blockNpcIds: [{ id: a.id, reason: `从${bn}那里收到了那张照片` }],
      }
      sc.npcId = b.id
      return sc
    },
  },
  // 📱 开盒事件:你的历史发言被比对
  {
    id: 'boxed',
    once: true,
    eligible: (s) => s.stats.mines >= 2 && aliveNpcs(s, 25).length >= 1,
    weight: () => 14,
    build: (s) => {
      const target = pick(aliveNpcs(s, 25))
      const tn = nameOf(s, target.id)
      const sc = eventScript('ev_boxed', '开盒事件', 'shop', [
        node('a', [
          nar(`${tn}的闺蜜/发小是资深互联网侦探。今天,你的社交账号被完整开盒:三年内的每一条发言,都被做成了截图合集。`),
          npc('「我朋友给我看了点东西。你之前说的话,和你跟我说的,好像不太一样?」'),
        ], {
          choices: [
            {
              text: '承认成长:三年前的我和现在的我,确实不是一个人',
              check: { skill: 'mouth', dc: 13, pass: 'ok', fail: 'fail' },
            },
            { text: '恼羞成怒:开盒是侵犯隐私,你朋友有病吧', goto: 'angry' },
          ],
        }),
        node('ok', [
          me('「人是会变的。三年前我还觉得奶茶三分糖算自律呢。你要看的是现在的我。」'),
          npc('「……嗯,这个回答还行。不过我朋友说会持续关注你,你自求多福。」'),
        ], { effects: { favor: -3 }, end: true }),
        node('fail', [
          nar('你的解释和截图第七张直接冲突。对话陷入冰河期。'),
          npc('「行了,我大概了解你是什么样的人了。」'),
        ], { effects: { favor: -16, awkward: 10 }, end: true }),
        node('angry', [
          npc('「有病的是谁还不一定呢。」'),
          nar('对方把「恼羞成怒」四个字截图发进了姐妹/兄弟群。你在那个群的代号从「新人」变成了「危」。'),
        ], { effects: { favor: -12, awkward: 8 }, end: true }),
      ])
      sc.npcId = target.id
      return sc
    },
  },
  // 🧧 前任复活
  {
    id: 'ex_back',
    once: true,
    eligible: (s) => s.day >= 3,
    weight: () => 5,
    build: (s) => {
      return eventScript('ev_ex', '前任复活', 'bar', [
        node('a', [
          nar('凌晨00:47,一个熟悉又陌生的头像跳了出来。'),
          npc('「在吗?」'),
          nar('你的前任。分手八个月,朋友圈互相潜水,今晚突然诈尸。'),
        ], {
          choices: [
            { text: '不回,截图发给死党,然后继续睡觉', effects: { awkward: -10 }, goto: 'ignore' },
            { text: '回一个字:「嗯?」看看对方想干什么', goto: 'reply' },
            { text: '直接拉黑,一次到位', effects: { flags: ['ex_blocked'] }, goto: 'block' },
          ],
        }),
        node('ignore', [nar('死党回复:「干得漂亮。已归档:前任迷惑行为大赏第41期。」'), nar('你睡了个好觉。向前看的人,运气不会太差。')], { end: true }),
        node('reply', [
          npc('「没什么,就是路过以前一起吃饭那家店,想起你了。」'),
          nar('你盯着这句话看了十秒,想起了对方的好,又想起了分手的原因。'),
          nar('「早点睡。」你回完这三个字,关掉了对话框。有些店,路过就好,不用进去。'),
        ], { effects: { awkward: 5 }, end: true }),
        node('block', [nar('拉黑,删除,一气呵成。'), nar('北京的深夜少了一个打扰你的人。你给自己点了个赞。')], { end: true }),
      ])
    },
  },
  // 🏢 周末突袭加班
  {
    id: 'overtime',
    eligible: (s) => s.day >= 2,
    weight: () => 4,
    build: (s) => {
      for (const n of aliveNpcs(s)) {
        if (n.stage !== 'confirmed') n.favor = Math.max(0, n.favor - 3)
      }
      s.energy = 0 // 被迫休息:这一天被工作吃掉了
      return eventScript('ev_ot', '突袭加班', 'sport', [
        node('a', [
          nar('早上九点,工作群@全体成员:「今天临时对齐一下,大家都进会议室。」'),
          nar('这场「对齐」从上午开到天黑。你今天的所有暧昧计划被干碎,精力被榨干,消息全部晚回。'),
          sys('全体在聊对象好感 -3;今日精力清零(被迫休息)'),
        ], {
          choices: [
            { text: '会议间隙疯狂摸鱼回消息,手速拉满', effects: { awkward: 5 }, goto: 'b1' },
            { text: '安心开会,搞钱要紧,晚上统一回复', effects: { wallet: 800 }, goto: 'b2' },
          ],
        }),
        node('b1', [nar('你在摄像头死角完成了五线操作,险些把「收到」发给约会对象,把「想你」发给领导。')], { end: true }),
        node('b2', [nar('会开完了,加班费到账了。爱情会迟到,但工资不会。……工资偶尔也会。')], { end: true }),
      ])
    },
  },
  // 🐟 反向海王揭露
  {
    id: 'rev_seaking',
    once: true,
    eligible: (s) => aliveNpcs(s, 40).length >= 1 && s.day >= 5,
    weight: () => 11,
    build: (s) => {
      const target = pick(aliveNpcs(s, 40))
      const tn = nameOf(s, target.id)
      const sc = eventScript('ev_rsk', '塘主揭秘', 'dinner', [
        node('a', [
          nar(`你刷同城视频,划到一条探店vlog。背景里,${tn}正和另一个人相谈甚欢,亲密程度和跟你约会时一模一样。`),
          nar('原来不止你在多线操作。北京的鱼塘,家家都有承包权。'),
        ], {
          choices: [
            {
              text: '放大、逐帧、查定位,启动侦探模式',
              check: { skill: 'mind', dc: 12, pass: 'found', fail: 'wrong' },
            },
            { text: '平常心:大家都在双向筛选,我也没停啊', effects: { awkward: -5 }, goto: 'chill' },
            { text: '直接质问:视频里那位是谁?', goto: 'ask' },
          ],
        }),
        node('found', [
          nar(`侦探模式收获颇丰:定位、时间、对方账号全被你扒出。证据已归档,主动权在你手里。`),
          nar('你决定先不摊牌,留着这张牌,关键时刻用。'),
        ], { effects: { npcFlags: ['they_multi'] }, end: true }),
        node('wrong', [
          nar('你放大到像素糊成马赛克,越看越像,又越看越不像。折腾到凌晨一点,啥也没确认,黑眼圈确认了。'),
        ], { effects: { awkward: 5 }, end: true }),
        node('chill', [nar('你关掉视频,给自己倒了杯水。成年人的Dating,上岸之前,谁都在游泳。心态赢麻了。')], { end: true }),
        node('ask', [
          npc('「?那是我同学/客户啊。你怎么跟查岗似的。」'),
          nar('对方语气冷了两度。查岗这个行为本身,比查到的东西更减分。'),
        ], { effects: { favor: -10 }, end: true }),
      ])
      sc.npcId = target.id
      return sc
    },
  },
  // 🎰 雍和宫锦鲤日
  {
    id: 'lucky',
    eligible: () => true,
    weight: () => 4,
    build: (s) => {
      s.luckyDay = true
      return eventScript('ev_lucky', '雍和宫锦鲤日', 'expo', [
        node('a', [
          nar('上班路上,你鬼使神差地绕到雍和宫,排了四十分钟队,上了一炷香。'),
          nar('出门时,一只猫蹭了蹭你的裤脚;地铁居然有座;咖啡店说你是第1000位顾客,免单。'),
          sys('🎰 玄学加持:今天所有检定难度 -2'),
        ], { danmaku: ['#fate'], end: true }),
      ])
    },
  },
  // ❄️ 降温关怀局
  {
    id: 'cold_care',
    eligible: (s) => aliveNpcs(s, 15).length >= 1,
    weight: () => 12,
    build: (s) => {
      const target = pick(aliveNpcs(s, 15))
      const tn = nameOf(s, target.id)
      const sc = eventScript('ev_cold', '倒春寒', 'walk', [
        node('a', [
          nar(`北京毫无征兆地降温十度,风里带着沙。${tn}发来消息:`),
          npc('「完了,穿少了,现在冷得像个笑话,还有点想发烧。」'),
        ], {
          choices: [
            { text: '直接点一份热粥+感冒药外卖,写上「按时吃,遵医嘱」', effects: { wallet: -60, favor: 12, care: true }, danmaku: ['#simp'], goto: 'soup' },
            { text: '回:多喝热水,早点休息', effects: { favor: -2, saying: 'water' }, goto: 'water' },
            { text: '回:北京的风就是这样,习惯就好了', effects: { favor: -4 }, goto: 'wind' },
          ],
        }),
        node('soup', [npc('「?!外卖到了,你什么时候点的??」'), npc('「……行,你这招有点犯规。药我吃了,粥很烫,心也是。」')], { end: true }),
        node('water', [npc('「好的。」'), nar('「多喝热水」四个字,在Dating界的杀伤力约等于「在吗」。')], { end: true }),
        node('wind', [npc('「嗯,习惯了。」'), nar('你成功地把一次关心的机会,过成了天气预报。')], { end: true }),
      ])
      sc.npcId = target.id
      return sc
    },
  },
  // 😊 你的日常小火了
  {
    id: 'mini_viral',
    once: true,
    eligible: (s) => s.day >= 4,
    weight: () => 4,
    build: (s) => {
      for (const n of aliveNpcs(s)) n.favor = Math.min(100, n.favor + 3)
      return eventScript('ev_viral', '意外小火', 'expo', [
        node('a', [
          nar('你随手发的一条北京日落照片配文「下班时的天空免费」,一夜之间被点了两万个赞。'),
          nar('在聊的几位不约而同地来评论区报到。人类对小有名气的暧昧对象,总会高看一眼。'),
          sys('全体在聊对象好感 +3,社死值 -15'),
        ], { effects: { awkward: -15 }, end: true }),
      ])
    },
  },
  // 💸 账单刺客
  {
    id: 'bill_assassin',
    eligible: (s) => s.wallet > 2000,
    weight: () => 3,
    build: (s) => {
      return eventScript('ev_bill', '账单刺客', 'shop', [
        node('a', [
          nar('月中,三件事同时找上门:视频网站年费续订、上月冲动购买的健身卡分期、还有一笔你已经想不起来的自动续费。'),
          sys('钱包 -580。北京生活的背景音,是扣款短信的提示声。'),
        ], { effects: { wallet: -580 }, end: true }),
      ])
    },
  },
  // 📞 妈妈来电
  {
    id: 'mom_call',
    eligible: (s) => s.day >= 3,
    weight: () => 4,
    build: (s) => {
      return eventScript('ev_mom', '妈妈来电', 'dinner', [
        node('a', [
          nar('晚上八点,妈妈的视频电话准时打来。三句问候之后,图穷匕见:'),
          npc('「隔壁你王阿姨的孩子,二胎都会打酱油了。你呢?有没有在处?」'),
        ], {
          choices: [
            { text: '如实汇报:在接触几个,还没定,您别催', effects: { awkward: 5 }, goto: 'honest' },
            { text: '战略模糊:快了快了,有消息第一时间汇报', goto: 'vague' },
            { text: '反向输出:妈,您当年是怎么看上我爸的?', effects: { awkward: -8 }, goto: 'counter' },
          ],
        }),
        node('honest', [npc('「几个??你脚踏几条船?!」'), me('「不是,妈,这叫多线程筛选……」'), npc('「什么乱七八糟的!挑一个踏实的!」'), nar('通话结束。你妈的担心+1,你的压力+1。')], { end: true }),
        node('vague', [npc('「你上个月也这么说。」'), nar('妈妈精准地调取了历史记录。但她没再追问,只说降温了记得穿秋裤。'), nar('挂了电话,你盯着天花板看了一会儿。')], { end: true }),
        node('counter', [
          npc('「你爸啊……当年他骑车带我,上坡从来不让我下来,自己蹬得满头汗还说不沉。」'),
          nar('妈妈的声音软了下来,催婚大会变成了回忆专场。'),
          nar('挂电话前她说:「找个上坡不让你下车的。」你把这句话记下了。'),
        ], { end: true }),
      ])
    },
  },
  // 🚇 地铁偶遇
  {
    id: 'subway_meet',
    eligible: (s) => aliveNpcs(s, 20).length >= 1,
    weight: () => 10,
    build: (s) => {
      const target = pick(aliveNpcs(s, 20))
      const tn = nameOf(s, target.id)
      const sc = eventScript('ev_subway', '地铁偶遇', 'walk', [
        node('a', [
          nar(`晚高峰的10号线,你被人流压缩成一张贴纸。抬头的瞬间,你和${tn}四目相对——对方也在这节车厢。`),
          nar('此刻的你:没洗头,工牌还挂在脖子上,手里拎着降价处理的临期面包。'),
        ], {
          choices: [
            {
              text: '0.5秒内完成形象抢救:摘工牌、藏面包、整理刘海',
              check: { skill: 'image', dc: 12, pass: 'ok', fail: 'fail' },
            },
            { text: '大方挥手:是我!没洗头版本的我!', effects: { favor: 7 }, danmaku: ['#smart'], goto: 'open' },
          ],
        }),
        node('ok', [nar('你的抢救行云流水,等TA挤过来时,你已经是「刚好也下班」的清爽路人。'), npc('「这么巧!你住这条线啊?」'), nar('偶遇变加分项,城市那么大,遇见算缘分。')], { effects: { favor: 8 }, end: true }),
        node('fail', [nar('你藏面包的动作太大,面包袋「哗啦」一声掉在地上,临期标签朝上,黄色的,很醒目。'), npc('「……那个,掉了。」'), nar('TA帮你捡了起来。你们在拥挤的车厢里进行了一场大型沉默。')], { effects: { favor: -5, awkward: 12 }, danmaku: ['#cringe'], end: true }),
        node('open', [npc('「哈哈哈哈没洗头版本也挺好的,真实。」'), nar('TA挤过来跟你分享了耳机。晚高峰的10号线,第一次有了BGM。')], { end: true }),
      ])
      sc.npcId = target.id
      return sc
    },
  },
  // 🍜 深夜食堂
  {
    id: 'midnight_food',
    eligible: (s) => aliveNpcs(s, 35).length >= 1,
    weight: () => 9,
    build: (s) => {
      const target = pick(aliveNpcs(s, 35))
      const tn = nameOf(s, target.id)
      const sc = eventScript('ev_food', '深夜投喂', 'dinner', [
        node('a', [
          nar(`23:58,${tn}突然发来一张照片:一碗热气腾腾的面。`),
          npc('「加班到现在,楼下面馆最后一单被我抢到了。就是突然想跟人分享一下,你睡了吗?」'),
        ], {
          choices: [
            { text: '回:没睡,替我吃口,我看着你吃就算吃了', effects: { favor: 9, care: true }, goto: 'warm' },
            { text: '拍下你桌上的泡面回敬:巧了,深夜干饭人联盟', effects: { favor: 11 }, danmaku: ['#win'], goto: 'ally' },
            { text: '回:这么晚吃碳水,你完了', effects: { favor: -5 }, goto: 'judge' },
          ],
        }),
        node('warm', [npc('「哈哈什么歪理。行,这口替你吃的,变胖算你的。」')], { end: true }),
        node('ally', [npc('「??你也没睡!」'), npc('「深夜干饭人联盟正式成立。下次线下会餐,我请。」'), nar('凌晨零点,两碗面隔空碰了个杯。')], { end: true }),
        node('judge', [npc('「……本来挺开心的。」'), nar('深夜分享欲是易碎品,你刚才手滑捏碎了一个。')], { end: true }),
      ])
      sc.npcId = target.id
      return sc
    },
  },
  // 🌪️ 沙尘暴
  {
    id: 'sandstorm',
    eligible: () => true,
    weight: () => 3,
    build: (s) => {
      return eventScript('ev_sand', '沙尘暴预警', 'sport', [
        node('a', [
          nar('北京刮起了沙尘暴,天空黄得像加了复古滤镜。全城的约会计划一夜作废。'),
          nar('朋友圈分成两派:拍沙尘暴的,和转发「沙尘暴文学」的。你选择宅家,给自己煮了一锅热汤。'),
          sys('强制宅家一天:社死值 -20。北京的天气,偶尔也会替你按下暂停键。'),
        ], { effects: { awkward: -20 }, end: true }),
      ])
    },
  },
  // 🎫 livehouse 门票
  {
    id: 'ticket',
    once: true,
    eligible: (s) => aliveNpcs(s, 30).length >= 1 && s.wallet >= 200,
    weight: () => 8,
    build: (s) => {
      const target = pick(aliveNpcs(s, 30))
      const tn = nameOf(s, target.id)
      const sc = eventScript('ev_ticket', '抢到票了', 'bar', [
        node('a', [
          nar('朋友转让两张周末的livehouse门票,原价出,手慢无。'),
        ], {
          choices: [
            { text: `拿下,发给${tn}:「周末,有个现场,缺个同伴」`, effects: { wallet: -200, favor: 13 }, danmaku: ['#win'], goto: 'yes' },
            { text: '算了,这个月钱包已经在ICU了', goto: 'no' },
          ],
        }),
        node('yes', [npc('「?!这场不是售罄了吗!你怎么抢到的!」'), npc('「好好好,周末见。这周剩下的日子,我就靠这个盼头活着了。」')], { end: true }),
        node('no', [nar('你退出了对话框。票十分钟后被别人拿走了。省钱和心动,今天你选了前者。')], { end: true }),
      ])
      sc.npcId = target.id
      return sc
    },
  },
  // 🧋 秋天第一杯奶茶
  {
    id: 'milktea',
    eligible: (s) => aliveNpcs(s, 10).length >= 1,
    weight: () => 8,
    build: (s) => {
      const target = pick(aliveNpcs(s, 10))
      const tn = nameOf(s, target.id)
      const sc = eventScript('ev_tea', '奶茶社交学', 'shop', [
        node('a', [
          nar(`朋友圈开始刷屏「秋天的第一杯奶茶」。${tn}转发了一条,配文:「蹲。」`),
        ], {
          choices: [
            { text: '二话不说点一杯送过去,备注:三分糖,去冰,懂的都懂', effects: { wallet: -25, favor: 8, care: true }, goto: 'send' },
            { text: '评论:成年人的秋天,第一杯是枸杞', effects: { favor: 3 }, goto: 'joke' },
            { text: '视而不见,这种流量密码不能惯着', effects: { favor: -3 }, goto: 'ignore' },
          ],
        }),
        node('send', [npc('「你怎么知道我喝三分糖去冰?!」'), me('「上次约会你点单,我记下了。」'), npc('「……好可怕,又好感动。」')], { end: true }),
        node('joke', [npc('「哈哈哈哈枸杞!笑死,你这个人怎么这样。」'), nar('没花钱,还赚了一个「哈哈哈哈」。性价比之王。')], { end: true }),
        node('ignore', [nar('那条朋友圈半小时后有人送了奶茶,不是你。你看到了那条「谢谢好心人」的更新。')], { end: true }),
      ])
      sc.npcId = target.id
      return sc
    },
  },
]

// 🏠 同居邀请(共有事件):确立关系+高好感后,低概率触发
const cohabitEvent: RandomEventDef = {
  id: 'cohabit',
  once: true,
  eligible: (s) =>
    !s.flags.includes('cohabiting') &&
    s.day >= 6 &&
    Object.values(s.npcs).some((n) => n.stage === 'confirmed' && n.favor >= 80 && n.dates >= 3),
  weight: () => 7,
  build: (s) => {
    const partner = Object.values(s.npcs).find(
      (n) => n.stage === 'confirmed' && n.favor >= 80 && n.dates >= 3,
    )
    if (!partner) return null
    const pn = nameOf(s, partner.id)
    const sc = eventScript('ev_cohabit', '一把钥匙', 'walk', [
      node('a', [
        nar(`晚上,${pn}忽然发来一张照片:一把崭新的钥匙,拴着一个小小的钥匙扣。`),
        npc('「我房子下季度到期,你那边合租也闹心……我算了笔账,两个人一起住,房租省一半。」'),
        npc('「当然,账是借口。」'),
        npc('「钥匙是真的。搬过来吗?」'),
        nar('同居邀请。在北京,这不是一步,这是一大步——省下的是房租,交出去的是自由。'),
      ], {
        danmaku: ['#win'],
        choices: [
          {
            text: '收下钥匙:好,我搬。周末就搬',
            effects: { favor: 12, npcFlags: ['cohabit'], flags: ['cohabiting'] },
            danmaku: ['#win'],
            goto: 'yes',
          },
          {
            text: '婉拒:我很想,但想再给彼此一点空间,别急',
            effects: { favor: -8 },
            goto: 'no',
          },
        ],
      }),
      node('yes', [
        nar('搬家那天,北京难得的好天气。你的行李没几箱,TA却腾出了一半的衣柜。'),
        npc('「丑话说前面:我的地盘,我的规矩——牙刷放左边,袜子不许乱丢,还有……」'),
        npc('「手机,不设防。我们这种关系,经不起暗格。」'),
        nar('从今晚起,你们共用一盏灯、一个冰箱、一份房租。也共用一份「被看见」的风险。'),
        sys('🏠 已同居:每日房租减半;但在同一个屋檐下,和别人的暧昧将无处可藏。'),
      ], { end: true }),
      node('no', [
        npc('「……哦,好。空间,嗯,我懂。」'),
        nar(`TA收回了那张照片。钥匙扣在照片边缘晃了一下,像一句没说完的话。`),
        nar('那晚TA没再发消息。有些邀请,拒绝一次,就不会有第二次了。'),
      ], { end: true }),
    ])
    sc.npcId = partner.id
    return sc
  },
}

EVENTS.push(cohabitEvent)

// 🎬 剧组修罗场(女版限定):制片人老莫 × 小演员顾一
const crewDrama: RandomEventDef = {
  id: 'crew_drama',
  once: true,
  eligible: (s) => {
    if (s.version !== 'female') return false
    const lm = s.npcs['laomo']
    const gy = s.npcs['guyi']
    return !!lm && !!gy && isAlive(lm) && isAlive(gy) && lm.favor >= 25 && gy.favor >= 25 && s.day >= 5
  },
  weight: () => 16,
  build: (s) => {
    const sc = eventScript('ev_crew', '剧组修罗场', 'dinner', [
      node('a', [
        nar('顾一发来消息:「今天有个组的饭局,制片人在挑人,你陪我去壮胆呗!」'),
        nar('你到了才发现——桌子主位坐着的制片人,是老莫。'),
        nar('老莫看到你,举着的酒杯停在了半空。顾一还在旁边小声跟你说:「就是他,圈里人称莫总。」'),
        sys('大型剧组修罗场,开机。'),
      ], {
        danmaku: ['#seen'],
        choices: [
          {
            text: '面不改色,以「顾一的朋友」身份完成全场社交',
            check: { skill: 'mind', dc: 14, pass: 'ok', fail: 'fail', crit: 'crit' },
          },
          { text: '主动挑明:莫总,巧了,我们也认识', goto: 'honest' },
        ],
      }),
      node('crit', [
        nar('你全程滴水不漏,还顺势把顾一的十年经历讲成了一个好故事。'),
        npc('「(老莫看着顾一,又看看你)这小伙子,脸上有生活。留个联系方式,下个本子有个角色像他。」'),
        nar('饭局散了,两个人都觉得今晚的你发着光。只有你知道自己刚才走了多细的钢丝。'),
      ], { effects: { favor: 8 }, end: true }),
      node('ok', [
        nar('你稳住了。除了老莫敬酒时意味深长的那句「朋友的朋友,也是朋友」,一切平安落地。'),
        nar('回去的路上,你后背的汗把外套洇湿了一小块。'),
      ], { effects: { favor: -2 }, end: true }),
      node('fail', [
        nar('饭局过半,老莫忽然说:「你俩认识多久了?」你和顾一同时开口,报出了两个不同的版本。'),
        nar('桌上安静了三秒。圈里人精得很,谁都没说破,谁都懂了。'),
        npc('「(顾一散场后在楼下等你)那个……莫总那边,你们,嗯,我没有别的意思,就是……」'),
        nar('他没问完,你也没答完。两条线的好感,同时降温。'),
      ], { effects: { favor: -14, blockNpcIds: [] }, end: true }),
      node('honest', [
        nar('你把话挑明了。桌上愣了两秒,老莫先笑了:「行啊,北京真小。」'),
        nar('饭局照常进行,只是老莫敬你的那杯酒,你品出了点复杂的余味。散场后顾一和老莫各自给你发了条消息,内容不同,试探相同。'),
      ], { effects: { favor: -8 }, end: true }),
    ])
    // fail 分支:另一位也降温
    const failNode = sc.nodes['fail']
    failNode.effects = { favor: -14 }
    sc.npcId = 'guyi'
    const lm = s.npcs['laomo']
    if (lm && isAlive(lm)) lm.favor = Math.max(0, lm.favor - 6)
    return sc
  },
}

EVENTS.push(crewDrama)

export function getEventsFor(version: Version): RandomEventDef[] {
  return EVENTS
}

export function findEvent(id: string): RandomEventDef | undefined {
  return EVENTS.find((e) => e.id === id)
}
