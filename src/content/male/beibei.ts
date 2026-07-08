import { CharacterProfile } from '@/engine/types'
import { chat, me, nar, node, npc } from '../util'

export const beibei: CharacterProfile = {
  id: 'beibei',
  name: 'SKP猎人贝贝',
  emoji: '💎',
  color: '#fda4af',
  bio: '生活在SKP-S | 包治百病信徒 | 高消费,高标准,高跟鞋 | 舍不得孩子套不着狼,舍不得钱包约不到我',
  archetype: '拜金女表皮,穷怕了的里子——她测试的不是钱包,是安全感',
  loves: ['flex', 'romantic'],
  hates: ['practical', 'chill'],
  deathTags: ['frugal'],
  decay: 12,
  mainSkill: 'money',
  spicy: 0.15,
  confirmYes: '「我算过你为我花的每一笔钱。」她忽然说,「但让我点头的不是账单,是上周你陪我在急诊坐到天亮——那个免费。」',
  confirmNo: '「你的预算和真心都不错,但我这个人,贵得连自己都养不起。别在我身上investment了,会亏的。」',
  moodLines: {
    great: '「今天专柜的姐姐给我留了限量色号!全北京就三支!运气来了挡都挡不住~」',
    hungover: '「昨晚一个局,全程香槟……头疼。别跟我说话,先给我点一杯燕麦拿铁,谢谢。」',
    slacking: '「今天不想美了。素颜瘫着,购物车都懒得清。你说人这么努力地精致,给谁看呢。」',
    grumpy: '「刚有个男的第一次约会带我吃兰州拉面,还让我AA。我没生气,我只是拉黑了。」',
  },
  blockLines: [
    '「Sorry,你的消费力和你的野心不匹配。再见。」',
    '「穷不可怕,可怕的是抠还理直气壮。慢走。」',
  ],
  intro: chat('bb_intro', [
    node('a', [
      npc('「Hi~先自我介绍:贝贝,坐标国贸,爱好是让自己开心,而让我开心通常比较贵。」'),
      npc('「灵魂第一问:第一次约会,你的预算是多少?别虚报,我看男人的预算比看包的真假还准。」'),
      nar('开局直接报价环节。这是一道送命题,也是一道人性题。'),
    ], {
      choices: [
        { text: '报个大数,眼都不眨:预算没有上限,看你想去哪', effects: { favor: 10 }, danmaku: ['#rich'], goto: 'b1' },
        { text: '反问:预算取决于对象。值得的人,穷游也奢侈;不值得的,米其林也白瞎', check: { skill: 'mouth', dc: 13, pass: 'b2', fail: 'b3' } },
        { text: '认真回:人均150左右,性价比高的店我有个收藏夹', effects: { block: '把性价比收藏夹递到了贝贝面前' }, danmaku: ['#block'] },
      ],
    }),
    node('b1', [npc('「『没有上限』~喜欢这四个字的发音。」'), npc('「不过嘴上没上限的人我见多了,行动才算数。期待你的表现哦。」')], { end: true }),
    node('b2', [npc('「……哟。」'), npc('「用话术对付话术是吧?行,你这句我给82分,剩下18分等你用行动补。」'), nar('她笑了。围猎者遇到了不按剧本走的猎物,反而来了兴致。')], { effects: { favor: 11 }, end: true }),
    node('b3', [me('「预算嘛……看情况,主要看感觉,感觉对了什么都好说……」'), npc('「感觉不能刷卡哦亲。」'), nar('你的支支吾吾被她精准计价:约等于零。')], { effects: { favor: -4 }, end: true }),
  ]),
  topics: [
    chat('bb_t1', [
      node('a', [
        npc('「今天在SKP看中一双鞋,专柜姐姐说我穿着像画报。我照了十分钟镜子,没买。」'),
        npc('「猜猜为什么?猜对有奖。」'),
      ], {
        choices: [
          {
            text: '认真读她:不是钱的问题,是那双鞋配不上今天的心情',
            check: { skill: 'mind', dc: 13, pass: 'b1', fail: 'b2' },
          },
          { text: '回:发我链接,我买给你,别猜了', effects: { favor: 8, wallet: -2000 }, danmaku: ['#rich'], goto: 'b3' },
          { text: '回:开始理性消费了?好事啊,省钱要紧', effects: { favor: -7, mine: true }, goto: 'b4' },
        ],
      }),
      node('b1', [
        me('「因为画报是给人看的。今天没有想让谁看的心情,所以鞋可以等。」'),
        npc('「……你居然猜对了。」'),
        npc('「所有人都以为我买东西是上瘾。其实我买的从来不是东西,是『今天值得』。今天不值得,就不买。」'),
      ], { effects: { favor: 12, npcFlags: ['deep_talk'] }, danmaku: ['#smart'], end: true }),
      node('b2', [me('「是不是尺码不对?」'), npc('「亲,SKP是可以调货的。」'), nar('你在物流层面思考,她在哲学层面消费。次元壁没打通。')], { effects: { favor: -2 }, end: true }),
      node('b3', [npc('「哇,行动派!」'), npc('「鞋我收了。不过跟你说个秘密:直接买单的男人及格,猜中我为什么不买的男人满分。你现在及格了~」')], { end: true }),
      node('b4', [npc('「省钱。」'), npc('「这两个字从你嘴里说出来,像米其林餐厅里端上了一盘拍黄瓜。」')], { end: true }),
    ]),
    chat('bb_t2', [
      node('a', [
        npc('「有人在小蓝书上挂我,说我是『国贸捞女图鉴』第一名。评论区可热闹了。」'),
        npc('「你也看到了吧?说说,你信几成?」'),
      ], {
        choices: [
          { text: '回:我不看图鉴,我看人。到目前为止,你花我的每一笔,都提前问过我愿不愿意', effects: { favor: 12 }, danmaku: ['#smart'], goto: 'b1' },
          { text: '回:无风不起浪吧,不过我不在乎', effects: { favor: -6, mine: true }, goto: 'b2' },
          { text: '回:捞女怎么了,各取所需,愿打愿挨,我尊重', effects: { favor: 2 }, goto: 'b3' },
        ],
      }),
      node('b1', [npc('「……你注意到了啊。」'), npc('「对,我每次都问。愿意的是心意,不愿意的是负担,我分得清。」'), npc('「那帖子里三千条评论,没一条注意到这个。」')], { end: true }),
      node('b2', [npc('「『不过我不在乎』——前半句你信了,后半句是施舍。」'), npc('「谢谢,这份大度我消受不起。」')], { end: true }),
      node('b3', [npc('「尊重,呵。」'), npc('「你这个尊重像商场里的『随便看看』,礼貌,但没打算买。」')], { end: true }),
    ]),
    chat('bb_t3', [
      node('a', [
        npc('「今天路过一个工地围挡,闻到里面食堂的味道,突然站住了。」'),
        npc('「跟你说个没跟别人说过的事:我初中住校,一周生活费五十块。周五回家,我妈在菜市场收摊,给我留一碗面,卧两个蛋——那是我一周里最奢侈的一顿。」'),
        npc('「后来我发誓,再也不要闻到『将就』的味道。你现在知道我为什么这样了?」'),
      ], {
        choices: [
          {
            text: '回:知道了。你不是拜金,你是怕回到那碗面之前的日子。周末带你去个地方,不贵,但绝不将就',
            effects: { favor: 14, npcFlags: ['bb_poor'], care: true },
            danmaku: ['#simp'],
            goto: 'b1',
          },
          { text: '回:所以现在的高消费,是在补偿那个小女孩', effects: { favor: 8 }, goto: 'b2' },
          { text: '回:五十块也能过,现在的你有点过度补偿了', effects: { favor: -9, mine: true }, goto: 'b3' },
        ],
      }),
      node('b1', [
        npc('「『那碗面之前的日子』……」'),
        npc('「你怎么敢的,一句话把我十几年的壳敲开。」'),
        npc('「好,我去。但说好了——不许将就,也不许太贵。太贵的话,就又变成表演了。」'),
        nar('你解锁了贝贝的底价:她标了一身高价,是怕别人发现,她曾经连五十块都要省。'),
      ], { end: true }),
      node('b2', [npc('「补偿,对,我心理咨询师也这么说。」'), npc('「道理我都懂。可道理不管饱,包管。开玩笑的……也不全是玩笑。」')], { end: true }),
      node('b3', [npc('「过度补偿。」'), npc('「你没饿过,你不懂。这句话我不想解释第二遍。」'), nar('她的语气冷下来,像专柜打烊时拉下的卷帘。')], { end: true }),
    ]),
  ],
  dateSpots: [
    { template: 'shopping', location: 'SKP', price: 1000, label: 'SKP(她的主场,你的考场)' },
    { template: 'dinner', location: '日料Omakase', price: 2600, label: 'Omakase(不值得的人不带)' },
    { template: 'bar', location: '三里屯高奢酒吧', price: 1200, label: '香槟局(排面即正义)' },
    { template: 'expo', location: '高定艺术展', price: 360, label: '艺术展(拍照,和被拍)' },
  ],
  he: {
    title: '非卖品',
    badge: '唯一免单的人',
    comment: '你和贝贝在一起了。她的小蓝书发了张路边摊合照,配文:「本图鉴第一名,已被一碗炒河粉买断。评论区闭嘴。」',
  },
  trueFlag: 'bb_poor',
  trueHe: {
    title: '那碗面之后',
    badge: '让她敢将就的人',
    comment: '周年纪念日,她带你回了老家的菜市场,在她妈妈当年的摊位旁吃了碗面,卧两个蛋。她说:「以前我用贵的东西证明我值得。现在不用了——你知道我值得。」这顿人均十二块,是她这辈子最贵的一餐。',
  },
}
