import { CharacterProfile } from '@/engine/types'
import { chat, me, nar, node, npc } from '../util'

export const luna: CharacterProfile = {
  id: 'luna',
  name: '望京Luna',
  emoji: '🎤',
  color: '#f9a8d4',
  bio: '韩企市场部 | 站姐(退休) | 演唱会全勤奖 | 我的爱豆不塌房,因为已经解散了',
  archetype: '韩企追星女,把青春献给了打投和机场,追的其实是十九岁的自己',
  loves: ['romantic', 'indie', 'sincere'],
  hates: ['practical'],
  deathTags: ['zhi'],
  decay: 8,
  mainSkill: 'culture',
  spicy: 0.1,
  confirmYes: '「我追过那么多场演唱会,内场、看台、山顶位都坐过。」她看着你,「但第一次有人,让我觉得台下比台上好看。」',
  confirmNo: '「你很好……但我还没学会,怎么喜欢一个每天都能见到的人。给我点时间好吗?」',
  moodLines: {
    great: '「啊啊啊啊我抢到签售了!!人生圆满!今天你说什么我都说好!」',
    hungover: '「昨晚和站子姐妹聚会,喝多了,集体哭着看当年的直拍……别问,问就是青春。」',
    slacking: '「今天公司开了一天会,韩国总部那边又改方案。我现在只想躺着听歌,谁也别理我。」',
    grumpy: '「刚看到网上有人骂我们哥哥……不是,骂前哥哥。总之我现在战斗值很高,慎聊。」',
  },
  blockLines: [
    '「你跟那些嘲笑别人热爱的人,没有区别。拜拜。」',
    '「道不同。祝你永远不懂什么叫为一件事发疯。」',
  ],
  intro: chat('luna_intro', [
    node('a', [
      npc('「你好呀~先做个背调:你对追星女孩,有什么看法?」'),
      npc('「说实话哦,我看过太多男的嘴上说尊重,眼里全是『幼稚』俩字。」'),
      nar('第一题就是雷区排查,她显然被伤过。'),
    ], {
      choices: [
        { text: '回:热爱就是热爱,追星和追梦想、追女孩一样,都挺勇的', effects: { favor: 10 }, goto: 'b1' },
        {
          text: '认真讲出你也曾为something疯狂过的经历',
          effects: { favor: 11, npcFlags: ['deep_talk'] },
          goto: 'b2',
        },
        { text: '回:都多大人了还追星,有那钱理财不好吗', effects: { block: '开局就踩了追星女孩的底线' }, danmaku: ['#block'] },
      ],
    }),
    node('b1', [npc('「『都挺勇的』……这个说法我第一次听。」'), npc('「行,背调通过。你比机场那些代拍有礼貌多了。」')], { end: true }),
    node('b2', [npc('「原来你也有过啊。」'), npc('「那你懂的——不是追那个人,是追那个愿意为一件事熬夜排队的自己。」'), nar('第一次聊天,她就把最核心的话说了。你隐约觉得,她等这句话很久了。')], { end: true }),
  ]),
  topics: [
    chat('luna_t1', [
      node('a', [
        npc('「今天部门来了个新实习生,00后,追的团我一个都不认识。」'),
        npc('「她问我:姐,你现在还追吗?我说退休了。她说:那你现在追什么?」'),
        npc('「我居然,答不上来。」'),
      ], {
        choices: [
          { text: '回:那就把这题留给周末——出来,我陪你找找现在能追的东西', effects: { favor: 10, care: true }, goto: 'b1' },
          { text: '回:成年人不需要追什么,稳住就很好了', effects: { favor: -6, mine: true }, goto: 'b2' },
          { text: '回:追我啊(狗头)', effects: { favor: 6 }, goto: 'b3' },
        ],
      }),
      node('b1', [npc('「……好啊。」'), npc('「不过丑话说前面,我体力很好的,当年跟机场追车的人是我。」')], { end: true }),
      node('b2', [npc('「稳住,嗯。」'), npc('「你知道吗,这就是我最怕变成的样子。」'), nar('她礼貌地结束了话题,像合上一本没读完的杂志。')], { end: true }),
      node('b3', [npc('「哈?」'), npc('「……狗头救不了你,但这句话我没删聊天记录。」')], { end: true }),
    ]),
    chat('luna_t2', [
      node('a', [
        npc('「分享一个秘密基地:公司楼下有家咖啡店,放的歌单全是二代团。」'),
        npc('「考你一下,听好了——(她发来一段哼唱的语音,跑调但深情)——这首是什么?」'),
      ], {
        choices: [
          {
            text: '仔细听旋律,从你贫瘠的K-pop知识库里检索答案',
            check: { skill: 'culture', dc: 13, pass: 'b1', fail: 'b2', crit: 'b1c' },
          },
          { text: '坦白:听不出来,但你唱歌……挺可爱的', effects: { favor: 8 }, goto: 'b3' },
        ],
      }),
      node('b1c', [
        me('「这不是《Sorry Sorry》吗,虽然被你唱出了《大悲咒》的沧桑。」'),
        npc('「?!你居然听出来了!!还敢损我?!」'),
        npc('「完了,又懂梗又敢说,你这个人有点危险。」'),
      ], { effects: { favor: 13 }, danmaku: ['#smart'], end: true }),
      node('b1', [me('「Super Junior?年代感对上了。」'), npc('「答对了!加分!果然文化人。」')], { effects: { favor: 9 }, end: true }),
      node('b2', [me('「……《爱情买卖》?」'), npc('「?????」'), npc('「你完了,你把我唱的韩流神曲听成《爱情买卖》。我需要静静。」')], { effects: { favor: -4, awkward: 8 }, end: true }),
      node('b3', [npc('「跑调也可爱?」'), npc('「哼,嘴甜。看在你诚实的份上,原谅你的乐盲。」')], { end: true }),
    ]),
    chat('luna_t3', [
      node('a', [
        npc('「跟你说个没跟别人说过的事。」'),
        npc('「我追的那个团,前年解散了。成员各自发展,有人结婚了,有人糊了。」'),
        npc('「站子关站那天,我把八年的图包上传到网盘,设了个密码——是我第一次看他们演唱会的日期。」'),
        npc('「其实我早就知道,我追的不是他们。是十九岁那个,攥着门票在场馆外面哭的自己。」'),
      ], {
        choices: [
          {
            text: '回:十九岁的她要是知道,后来的你把日子过得这么用力,一定特别骄傲',
            effects: { favor: 14, npcFlags: ['luna_19'], care: true },
            danmaku: ['#simp'],
            goto: 'b1',
          },
          { text: '回:解散好啊,终于能省钱了', effects: { favor: -7, mine: true }, goto: 'b2' },
          { text: '回:密码方便透露一下吗,我想看看十九岁的你', effects: { favor: 8 }, goto: 'b3' },
        ],
      }),
      node('b1', [
        npc('「………………」'),
        npc('「你等下,我哭一下。真的,等我两分钟。」'),
        npc('「(两分钟后)八年了,所有人都说『该长大了』,只有你替十九岁的我说了句话。」'),
        nar('你解锁了Luna的隐藏图包:里面不是爱豆,全是这些年每一场演唱会散场后,她自拍的笑脸。'),
      ], { end: true }),
      node('b2', [npc('「省钱,对。」'), npc('「我的青春结束了,你关心的是我的钱包。懂了。」')], { end: true }),
      node('b3', [npc('「想得美,密码是要用故事换的。」'), npc('「等你哪天把你的十九岁讲给我听,我就告诉你。」')], { end: true }),
    ]),
  ],
  dateSpots: [
    { template: 'ktv', location: '麦乐迪(她的打歌房)', price: 400, label: 'K歌(全是她的应援曲)' },
    { template: 'expo', location: '798·偶像文化展', price: 240, label: '看展(她的青春陈列馆)' },
    { template: 'shopping', location: '三里屯太古里', price: 800, label: '太古里(周边店巡礼)' },
    { template: 'park', location: '环球影城', price: 1500, label: '环球影城(她说要拍够100张)' },
  ],
  he: {
    title: '本命',
    badge: '唯一站子站长',
    comment: '你和Luna在一起了。她建了人生最后一个站子,数据只有一个粉丝——她自己。站名是你的名字加个「bar」。',
  },
  trueFlag: 'luna_19',
  trueHe: {
    title: '十九岁的回信',
    badge: '替她保管青春的人',
    comment: '她把网盘密码给了你。生日那天,你把她八年的演唱会自拍洗成了一本相册,扉页写着:「致十九岁:她后来被人好好爱着。」她抱着相册哭到妆花,又笑着说这是她收过最好的应援。',
  },
}
