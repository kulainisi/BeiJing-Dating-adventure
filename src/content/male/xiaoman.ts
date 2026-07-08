import { CharacterProfile } from '@/engine/types'
import { chat, me, nar, node, npc } from '../util'

export const xiaoman: CharacterProfile = {
  id: 'xiaoman',
  name: '鼓楼小满',
  emoji: '🎸',
  color: '#8b9ff0',
  bio: '自由撰稿 | 黑胶收藏级选手 | 一年看40场演出 | 请勿携带班味入场',
  archetype: '鼓楼文艺女,把生活过成散文诗,对庸俗零容忍',
  loves: ['indie', 'sincere', 'romantic'],
  hates: ['flex', 'corporate', 'practical'],
  deathTags: ['zhi'],
  decay: 6,
  mainSkill: 'culture',
  confirmYes: '「……我这周写的所有东西里,都有你。本来想憋到你先说的。」她耳朵红了,踢了一下脚边的石子。',
  confirmNo: '「你很好。但我现在的状态,像一首没写完的歌……对不起,再给我点时间好吗?」',
  moodLines: {
    great: '「今天抢到了落日飞车的票!!内场!!你听,我心跳的BPM!」',
    hungover: '「昨晚livehouse散场跟乐队喝到三点……我现在的灵魂还在寄存处没取。」',
    slacking: '「稿子被毙了第三次。我今天不想当人,只想当鼓楼上晒太阳的猫。」',
    grumpy: '「刚在咖啡店听到俩人大声聊融资,聊了俩小时。我耳朵需要漂白。」',
  },
  blockLines: [
    '「我们频率不同,不用互相迁就了。祝你在你的世界里开心。」',
    '「有些话说出口,就回不去了。再见。」',
  ],
  intro: chat('xm_intro', [
    node('a', [
      npc('「你好呀。看你资料里写了会来鼓楼这边,那考你一题:鼓楼东大街,你最喜欢哪家店?」'),
      nar('第一题就是主观题,这很鼓楼。'),
    ], {
      choices: [
        {
          text: '认真说出一家藏在胡同深处的旧书店和它的猫',
          check: { skill: 'culture', dc: 12, pass: 'b_ok', fail: 'b_fail', crit: 'b_crit' },
        },
        { text: '坦白:其实我不常来,但我愿意被你带着认识它', effects: { favor: 8 }, goto: 'b_honest' },
        { text: '回:那必须是星巴克,大杯冰美式yyds', effects: { favor: -8, awkward: 5 }, goto: 'b_star' },
      ],
    }),
    node('b_crit', [
      me('「宝钞胡同往里,那家旧书店。老板养了只三花,睡在《百年孤独》上,谁买那本它跟谁急。」'),
      npc('「?!你说的是豆豆!!」'),
      npc('「完了,你居然知道豆豆。这个开场白满分,我先记下了。」'),
    ], { effects: { favor: 14, npcFlags: ['art_soul'] }, end: true }),
    node('b_ok', [npc('「哦?你还真能说出一家……不是连锁店,加分。」')], { effects: { favor: 8 }, end: true }),
    node('b_fail', [me('「就……那家挺有名的咖啡店?门口排队那个?」'), npc('「排队那家啊,」她轻轻叹气,「网红店猎人。」')], { effects: { favor: -4 }, end: true }),
    node('b_honest', [npc('「诚实,不装。」'), npc('「行,那我给你留个考察名额。表现好的话,带你去看鼓楼的落日。」')], { end: true }),
    node('b_star', [npc('「……yyds。」'), npc('「2026年了,还有人说yyds。」'), nar('她没拉黑你,但你能感觉到,你的文化值在她心里已经破产重组。')], { end: true }),
  ]),
  topics: [
    chat('xm_t1', [
      node('a', [
        npc('「昨晚在School看了一场演出,主唱唱到一半哭了,全场安静得像下雪。」'),
        npc('「你呢,最近有没有为什么东西起过鸡皮疙瘩?艺术上的那种。」'),
      ], {
        choices: [
          { text: '讲那个真的让你起过鸡皮疙瘩的瞬间,哪怕它很小', effects: { favor: 10, npcFlags: ['deep_talk'] }, goto: 'b1' },
          {
            text: '聊起你听过的现场,顺便点评了一下地下乐队生态',
            check: { skill: 'culture', dc: 14, pass: 'b2', fail: 'b3' },
          },
          { text: '回:说起来,郭敬明的电影画面其实还挺美的,被骂过头了', effects: { block: '在小满面前替郭敬明说话' }, danmaku: ['#block'] },
        ],
      }),
      node('b1', [npc('「……你讲这个的时候,文字都在发光。」'), npc('「我收回对直男/理工科的部分偏见。部分。」')], { end: true }),
      node('b2', [npc('「等等,你也觉得那支贝斯被低估了??」'), npc('「今晚聊到这,再聊下去我要请你喝酒了,危险。」')], { effects: { favor: 12, npcFlags: ['art_soul'] }, end: true }),
      node('b3', [nar('你把「后朋克」说成了「朋克之后的那种」,她沉默了一小会儿。'), npc('「嗯……你听歌,可能更适合随机播放。」')], { effects: { favor: -6, awkward: 8 }, end: true }),
    ]),
    chat('xm_t2', [
      node('a', [
        npc('「问个奇怪的问题:你觉得稳定是好东西吗?」'),
        npc('「我妈今天第八百次劝我考编。她说我这种自由职业,在她们小区等于无业。」'),
      ], {
        choices: [
          { text: '回:稳定是好东西,但不是唯一的好东西。你写的字比编制难得', effects: { favor: 11, care: true }, danmaku: ['#smart'], goto: 'b1' },
          { text: '回:你妈说得对,先上岸再谈理想,面包比诗歌抗饿', effects: { favor: -8, mine: true }, goto: 'b2' },
          { text: '回:无业挺好,我养你啊(狗头)', effects: { favor: -4 }, goto: 'b3' },
        ],
      }),
      node('b1', [npc('「『你写的字比编制难得』……」'), npc('「这句话我要抄在本子上。今天的丧气值被你清零了。」')], { end: true }),
      node('b2', [npc('「哦,你也这么觉得啊。」'), npc('「没事,你和我妈,还有这个时代,你们是多数派。」'), nar('她的语气礼貌得像关上的门。')], { end: true }),
      node('b3', [npc('「养我?」'), npc('「狗头也救不了这句话。我自己养得起自己,谢谢。」')], { end: true }),
    ]),
    chat('xm_t3', [
      node('a', [
        npc('「跟你说个没跟别人说过的事。」'),
        npc('「其实我大学组过乐队,主音吉他。后来家里出了点事,琴卖了,人回来了,就再也没碰过。」'),
        npc('「上周路过乐器行,看到一把一模一样的,站了十分钟,没敢进去。」'),
      ], {
        choices: [
          {
            text: '回:下次路过,我陪你进去。不买,就摸摸它,跟它问个好',
            effects: { favor: 13, npcFlags: ['xm_real'], care: true },
            danmaku: ['#simp'],
            goto: 'b1',
          },
          { text: '回:现在分期很方便,想要就买,快乐重要', effects: { favor: 2 }, goto: 'b2' },
          { text: '回:都过去了,别想那么多,早点睡吧', effects: { favor: -6, saying: 'zaoshui' }, goto: 'b3' },
        ],
      }),
      node('b1', [
        npc('「…………」'),
        npc('「『跟它问个好』。」'),
        npc('「你知道吗,这是这三年来,第一句让我想哭的话。」'),
        nar('你解锁了小满的隐藏音轨:那个没说再见的吉他手,一直住在她身体里。'),
      ], { end: true }),
      node('b2', [npc('「嗯,分期,很方便。」'), npc('「可有些东西不是钱的事。算了,你不懂。」')], { end: true }),
      node('b3', [npc('「好,早点睡。」'), nar('她把刚打开的心事,又原样叠了回去。')], { end: true }),
    ]),
  ],
  hiddenTopics: [
    {
      codeId: 'cat',
      script: chat('xm_hidden', [
        node('a', [
          npc('「今天路过五道营,看到我前任的咖啡店还开着。」'),
          npc('「他叫陈屿,『主理人』。分手的时候他说我『活得太用力』。」'),
          npc('「笑死,一个把39块美式讲出人生哲学的人,说我用力。」'),
          nar('【罗生门视角】在另一个版本的故事里,有个主理人说过:他前女友嫌他把日子过成了表演。'),
        ], {
          choices: [
            { text: '回:也许你们只是两种用力,谁也照不亮谁', effects: { favor: 10, npcFlags: ['deep_talk'] }, goto: 'b' },
            { text: '回:前任的意义就是衬托下一任,比如我', effects: { favor: 6 }, goto: 'b' },
          ],
        }),
        node('b', [npc('「……行了行了,这页翻篇。」'), npc('「今天这段对话属于医疗废物,请帮我妥善处理。」')], { end: true }),
      ]),
    },
  ],
  dateSpots: [
    { template: 'expo', location: '798·UCCA', price: 180, label: '798看展(她的主场)' },
    { template: 'citywalk', location: '鼓楼—后海', price: 60, label: '鼓楼Citywalk' },
    { template: 'bar', location: 'Live House散场酒馆', price: 220, label: '散场后喝一杯' },
  ],
  he: {
    title: '合拍',
    badge: '鼓楼文艺圈编外人员',
    comment: '你和小满在一起了。她给你做了一张手写歌单,B面最后一首,歌名是你的名字。',
    secretCode: '亮马河的鸭子',
  },
  trueFlag: 'xm_real',
  trueHe: {
    title: '重组乐队',
    badge: '让吉他手归位的人',
    comment: '你陪她走进了那家乐器行。三个月后,她在School的开放麦弹了一首没发表的歌,唱完指着台下说:「这首歌的制作人在那儿。」',
  },
}
