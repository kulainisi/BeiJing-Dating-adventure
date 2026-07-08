import { CharacterProfile } from '@/engine/types'
import { chat, me, nar, node, npc } from '../util'

export const chenyu: CharacterProfile = {
  id: 'chenyu',
  name: '主理人陈屿',
  emoji: '☕',
  color: '#a3956b',
  bio: '五道营胡同咖啡店主理人 | 在地文化研究者 | 慢生活实践中 | 本店不提供瑞幸平替',
  archetype: '胡同咖啡店主理人,满口生活方式,账本比咖啡苦',
  loves: ['indie', 'chill', 'romantic'],
  hates: ['corporate', 'practical'],
  deathTags: ['frugal'],
  decay: 5,
  mainSkill: 'culture',
  spicy: 0.1,
  confirmYes: '「我店里那面留言墙,你注意过吗?最高那张一直空着。」他递给你一支笔,「留给店主最重要的人。写吧。」',
  confirmNo: '「你像一杯很好的耶加雪菲……但我现在的状态,只配得上速溶。抱歉。」',
  moodLines: {
    great: '「今天店里来了个客人,喝完我的手冲,坐了很久,走的时候说『这杯咖啡救了我今天』。开店三年,值了。」',
    hungover: '「昨晚跟隔壁酒吧主理人『交流业态』到三点……主理人之间的交流,主要靠精酿。」',
    slacking: '「今天一个客人都没有。我盯着门口的猫看了一下午,它也盯着我。我们都没有营业额。」',
    grumpy: '「刚有个客人进来问『有没有瑞幸那种9块9』,还坐着蹭了一下午空调。我修养很好,我没赶他。」',
  },
  blockLines: [
    '「道不同。本店恕不接待了。」',
    '「你的消费观和我的价值观,不在一个胡同里。再见。」',
  ],
  intro: chat('cy_intro', [
    node('a', [
      npc('「你好。陈屿,在五道营开了家小店,卖咖啡,也卖一种生活的可能性。」'),
      npc('「不好意思,职业病,说话容易像文案。」'),
      npc('「第一个问题:你平时喝咖啡,是为了醒,还是为了坐一会儿?」'),
    ], {
      choices: [
        { text: '回:为了坐一会儿。醒着的方式有很多,坐着发呆的地方很少', effects: { favor: 11 }, danmaku: ['#art'], goto: 'b1' },
        { text: '诚实:为了醒。不然下午的会能睡过去', effects: { favor: 3 }, goto: 'b2' },
        { text: '回:都不是,为了发朋友圈', check: { skill: 'mouth', dc: 12, pass: 'b3', fail: 'b4' } },
      ],
    }),
    node('b1', [npc('「『坐着发呆的地方很少』——你这句话,可以贴我店门口。」'), npc('「欢迎来坐。第一杯,我请。」')], { end: true }),
    node('b2', [npc('「为了醒,嗯,大多数北京人的答案。」'), npc('「哪天你不赶时间了,来店里试试『为了坐一会儿』的版本。」')], { end: true }),
    node('b3', [me('「为了发朋友圈。毕竟咖啡三分靠豆子,七分靠氛围感,十分靠滤镜。」'), npc('「哈哈哈哈,坦率得可爱。」'), npc('「行,那我的店欢迎你来拍,但我有信心,你最后会为了咖啡再来。」')], { effects: { favor: 8 }, end: true }),
    node('b4', [me('「为了发朋友圈,哈哈。」'), npc('「哦,这样。」'), nar('干巴巴的一句话飘在空中。他大概把你归进了「打卡型客人」文件夹。')], { effects: { favor: -2 }, end: true }),
  ]),
  topics: [
    chat('cy_t1', [
      node('a', [
        npc('「今天有个客人,喝了一口我的招牌手冲,问我:『39,凭什么?』」'),
        npc('「我给他讲了豆子的庄园、烘焙曲线、水粉比。他听完说:『瑞幸9块9。』」'),
        npc('「你说,我是不是真的疯了,在胡同里坚持这个?」'),
      ], {
        choices: [
          { text: '回:39买的不是咖啡,是你这三年没垮掉的坚持。我下次去喝', effects: { favor: 12, care: true }, danmaku: ['#simp'], goto: 'b1' },
          { text: '回:说真的,他没错,瑞幸确实9块9,你这就是溢价', effects: { block: '在陈屿伤口上贴了瑞幸优惠券' }, danmaku: ['#block'] },
          { text: '回:定价没问题,但也许你需要一杯15的入门款,先把人留住', effects: { favor: 6, npcFlags: ['biz_advice'] }, goto: 'b2' },
        ],
      }),
      node('b1', [npc('「……你知道吗,那个客人走了之后,我把这句话在心里骂了自己八百遍。」'), npc('「谢谢你,替我把它接住了。」')], { end: true }),
      node('b2', [npc('「入门款……」'), npc('「有道理,虽然听起来很『商业』,但确实有道理。让我消化一下。」'), nar('他嘴上抗拒商业,手上默默记了笔记。')], { end: true }),
    ]),
    chat('cy_t2', [
      node('a', [
        npc('「周末店里办了个胡同摄影展,来了很多人。」'),
        npc('「有个女孩看了很久,问我:『这些照片里,怎么没有人?』」'),
        npc('「我说胡同的主角是光和砖。她说:『可我觉得,是住在里面的人。』你怎么看?」'),
      ], {
        choices: [
          {
            text: '给出你的看法:光和砖是胡同的身体,人是胡同的呼吸',
            check: { skill: 'culture', dc: 13, pass: 'b1', fail: 'b2', crit: 'b1c' },
          },
          { text: '回:她说得对。没有人的胡同,只是一条旧走廊', effects: { favor: 8 }, goto: 'b3' },
          { text: '回:你俩都想多了,胡同就是胡同,拆不拆看规划', effects: { favor: -8, mine: true }, goto: 'b4' },
        ],
      }),
      node('b1c', [
        me('「光和砖是胡同的身体,人是胡同的呼吸。你拍的是身体,她看的是呼吸。你们都对,合起来才是活的胡同。」'),
        npc('「…………」'),
        npc('「我要把这句话裱起来,挂在展的入口。署你的名。」'),
        nar('文化值大成功。主理人看你的眼神,像看到了一杯完美萃取的手冲。'),
      ], { effects: { favor: 15, npcFlags: ['art_soul'] }, danmaku: ['#art'], end: true }),
      node('b1', [npc('「『胡同的呼吸』……这个说法好。」'), npc('「下次办展,请你来当一句话策展人。」')], { effects: { favor: 9, npcFlags: ['art_soul'] }, end: true }),
      node('b2', [me('「我觉得吧……光影这个东西,很有张力,砖也很有张力。」'), npc('「张力,嗯。」'), nar('你又开始用「张力」这个万能词了。他礼貌地没有拆穿。')], { effects: { favor: 0 }, end: true }),
      node('b3', [npc('「是,她说得对。所以那天之后,我开始拍人了。」'), npc('「或许哪天,也拍拍你?」')], { end: true }),
      node('b4', [npc('「看规划。」'), npc('「……你这个人,务实得让人无话可说。」'), nar('对主理人来说,「务实」不是夸奖,是判决。')], { end: true }),
    ]),
    chat('cy_t3', [
      node('a', [
        npc('「今天盘账。跟你说个秘密,你别告诉胡同里任何人。」'),
        npc('「店,亏了三年了。撑到现在,靠的是我之前在广告公司攒的钱,和我妈以为我『生意不错』的信任。」'),
        npc('「白天我是主理人,晚上我是一个不敢看余额的中年前青年。」'),
      ], {
        choices: [
          {
            text: '回:主理人这三个字,主理的从来不是店,是不认输。缺帮手吗,周末那种',
            effects: { favor: 14, npcFlags: ['cy_real'], care: true },
            danmaku: ['#simp'],
            goto: 'b1',
          },
          { text: '回:要不做外卖平台吧,或者引进联名,先活下来', effects: { favor: 5 }, goto: 'b2' },
          { text: '回:亏三年还开?及时止损吧,拿这钱干嘛不好', effects: { favor: -9, mine: true }, goto: 'b3' },
        ],
      }),
      node('b1', [
        npc('「……周末帮手,时薪是一杯手冲,加胡同落日一份,你干吗?」'),
        npc('「刚才打这段话的时候,我在店里哭了一下。就一下。猫看见了,它不会说出去。」'),
        nar('你解锁了陈屿的隐藏账本:所谓生活方式,是他借钱也要护住的、最后一块自留地。'),
      ], { end: true }),
      node('b2', [npc('「外卖……我抗拒了三年的词。」'), npc('「但今晚听你说出来,居然没那么刺耳。让我再想想。」')], { end: true }),
      node('b3', [npc('「及时止损。」'), npc('「你说得对,数学上完全正确。」'), npc('「可有些店开着,不是为了赢,是为了不散。算了,你不懂。」')], { end: true }),
    ]),
  ],
  hiddenTopics: [
    {
      codeId: 'duck',
      script: chat('cy_hidden', [
        node('a', [
          npc('「店里今天放了一张老唱片,放到一半我给关了。」'),
          npc('「是我前女友留下的。她叫小满,写字的,鼓楼那边的人。」'),
          npc('「分手时我说她『活得太用力』。其实我是嫉妒——她敢为了热爱穷着,我只敢为了体面装着。」'),
          nar('【罗生门视角】另一个版本的故事里,鼓楼有个女孩说:一个把39块美式讲出人生哲学的人,凭什么说我用力。——现在你听到了那句话疼在哪里。'),
        ], {
          choices: [
            { text: '回:你们不是不合适,是太像了。两面镜子照不出彼此', effects: { favor: 10, npcFlags: ['deep_talk'] }, goto: 'b' },
            { text: '回:那张唱片,下次放完吧。放完才算过去', effects: { favor: 9, care: true }, goto: 'b' },
          ],
        }),
        node('b', [npc('「……嗯。」'), npc('「今天这杯,算店里请的。就当……封存费。」')], { end: true }),
      ]),
    },
  ],
  dateSpots: [
    { template: 'expo', location: '798·UCCA', price: 240, label: '798看展(主理人补课日)' },
    { template: 'citywalk', location: '五道营胡同', price: 100, label: '胡同Citywalk(他的地盘)' },
    { template: 'dinner', location: '胡同私房菜', price: 600, label: '私房菜(主理人带路)' },
    { template: 'citywalk', location: '天坛', price: 60, label: '天坛走走(在地文化课)' },
  ],
  he: {
    title: '常客',
    badge: '留言墙最高处的人',
    comment: '你和陈屿在一起了。店里多了一个「她的专座」,谁坐他跟谁急。菜单最后一行加了一项:「她的那杯——非卖品」。',
    secretCode: '胡同里的猫',
  },
  trueFlag: 'cy_real',
  trueHe: {
    title: '合伙人',
    badge: '一起不认输的人',
    comment: '你成了周末店员,时薪一杯手冲。三个月后店里第一次月度回本,他把那张账单裱了起来,挂在留言墙你的名字旁边。',
  },
}
