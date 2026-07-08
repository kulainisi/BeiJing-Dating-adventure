import { CharacterProfile } from '@/engine/types'
import { chat, me, nar, node, npc } from '../util'

export const alex: CharacterProfile = {
  id: 'alex',
  name: '金融男Alex',
  emoji: '🥃',
  color: '#fbbf24',
  bio: '券商 | 国贸出没 | 应酬之王 | 周中属于客户,周末属于健身房,例外情况正在寻找',
  archetype: '国贸金融男,酒局应酬之王,西装下面全是疲惫',
  loves: ['flex', 'corporate', 'practical'],
  hates: ['chill', 'frugal'],
  deathTags: ['zhi'],
  decay: 9,
  mainSkill: 'liquor',
  spicy: 0.12,
  confirmYes: '「我谈过最大的单子是九位数,签字的时候手都没抖。」他看着你,「刚才想说这句话的时候,抖了。在一起吧。」',
  confirmNo: '「你是我见过最值得投资的人……但我这支股票现在质押率太高了,别把你套进来。」',
  moodLines: {
    great: '「今天签了个大单!佣金够我请你吃一年日料!就是打个比方……也不是不行?」',
    hungover: '「昨晚三场应酬连轴,茅台混威士忌……我现在的胃在写辞职信。」',
    slacking: '「今天盯了一天盘,绿得像个植物园。不想说话,想变成一只不用开会的柴犬。」',
    grumpy: '「客户凌晨一点让我改方案,改完说『还是用第一版吧』。我现在的情绪不适合出现在任何行情里。」',
  },
  blockLines: [
    '「行情不对,平仓吧。祝你找到更好的标的。」',
    '「这单不谈了。天台风大,我先撤了。」',
  ],
  intro: chat('ax_intro', [
    node('a', [
      npc('「你好,Alex,做券商的。先说重点:我一周有四天在应酬,两天在健身,剩下一天在补觉。」'),
      npc('「所以如果我回消息慢,不是不礼貌,是我可能正举着杯子,或者举着铁。」'),
      nar('自我介绍像一份风险披露书。'),
    ], {
      choices: [
        { text: '回:披露充分,我签了。不过我要求增加条款:补觉那天,分我两小时', effects: { favor: 11 }, danmaku: ['#smart'], goto: 'b1' },
        { text: '回:一周四天应酬?你的肝是不是该上市了,流动性这么好', check: { skill: 'mouth', dc: 12, pass: 'b2', fail: 'b3' } },
        { text: '回:这么忙,那你谈什么恋爱呢', effects: { favor: -4 }, goto: 'b4' },
      ],
    }),
    node('b1', [npc('「『分我两小时』……」'), npc('「成交。这是我今年谈过的,条款最不平等但最想签的合同。」')], { end: true }),
    node('b2', [npc('「哈哈哈哈我的肝要是能上市,市盈率肯定爆表,全是透支的估值。」'), npc('「你挺会聊啊,金融梗都接得住。」')], { effects: { favor: 9 }, end: true }),
    node('b3', [me('「你的肝……还好吗?」'), npc('「还行,谢谢关心。」'), nar('一句没接住,对话像开盘就跌停。')], { effects: { favor: 1 }, end: true }),
    node('b4', [npc('「问得好。所以我在这个App上,不就是在找答案吗。」'), nar('他回得滴水不漏,但你感觉他今天已经回答过三次这个问题了。')], { end: true }),
  ]),
  topics: [
    chat('ax_t1', [
      node('a', [
        npc('「刚结束一场应酬,在停车场坐着缓一缓。」'),
        npc('「今晚喝了多少我都数不清了。客户高兴,领导高兴,单子有戏。就是我不知道我高不高兴。」'),
      ], {
        choices: [
          { text: '回:别在停车场坐太久,开窗透气,到家发个「安全」给我', effects: { favor: 11, care: true }, danmaku: ['#simp'], goto: 'b1' },
          { text: '回:高不高兴不重要,单子有戏就行,搞钱要紧', effects: { favor: 4 }, goto: 'b2' },
          { text: '回:喝成这样图什么呢,这种工作趁早换了吧', effects: { favor: -7, mine: true }, goto: 'b3' },
        ],
      }),
      node('b1', [npc('「……好。」'), npc('(四十分钟后)「安全。」'), npc('「说出来你别笑,这是今晚唯一一条,我想回的消息。」')], { end: true }),
      node('b2', [npc('「对,搞钱要紧。」'), npc('「你这个回答很国贸。我们很配,配得像两个KPI。」'), nar('他笑了,但笑得像季报里的注释,小字,没人细看。')], { end: true }),
      node('b3', [npc('「换了?」'), npc('「房贷三万二,车贷八千,我爸的降压药,我妹的学费。你说换成什么?」'), npc('「算了,当我没说。」')], { end: true }),
    ]),
    chat('ax_t2', [
      node('a', [
        npc('「问你个专业问题:你觉得感情里要不要做尽调?」'),
        npc('「我同事,结婚前把对象的征信、社保、户口本查了个遍。他说这叫风控。他老婆到现在不知道。」'),
      ], {
        choices: [
          { text: '回:风控可以有,但偷偷查就是内幕交易。感情的尽调,应该当面做', effects: { favor: 12, npcFlags: ['deep_talk'] }, danmaku: ['#smart'], goto: 'b1' },
          { text: '回:查得对啊,婚姻是最大的投资,不查才是裸奔', effects: { favor: 5 }, goto: 'b2' },
          { text: '回:你们金融人谈恋爱都这么可怕吗', effects: { favor: -5 }, goto: 'b3' },
        ],
      }),
      node('b1', [npc('「『当面做尽调』……哈,说得好。」'), npc('「那我先披露:有房贷,脾气看行情,酒量是刚需不是爱好。你呢,你也披露一个?」'), nar('对话进入了坦白局。这在金融男的世界里,约等于交出印章。')], { end: true }),
      node('b2', [npc('「英雄所见略同。」'), npc('「不过后来我同事跟我说,他有时候看着老婆,会心虚。你看,风控住了风险,没风控住良心。」')], { end: true }),
      node('b3', [npc('「可怕吗?可能吧。」'), npc('「见过太多因为钱散伙的,就不太敢相信因为爱聚齐的。职业病,见谅。」')], { end: true }),
    ]),
    chat('ax_t3', [
      node('a', [
        npc('「跟你说个不能让任何人知道的事。」'),
        npc('「我,Alex,应酬之王,国贸酒桌传说——其实讨厌喝酒。生理性讨厌。每次喝完回家都要吐很久,然后含着胃药睡。」'),
        npc('「所有人都以为我千杯不倒。其实我是不敢倒。倒了,单子就飞了。」'),
      ], {
        choices: [
          {
            text: '回:那以后跟我吃饭,你的杯子里永远是大麦茶。干杯我替你演',
            effects: { favor: 14, npcFlags: ['alex_tired'], care: true },
            danmaku: ['#simp'],
            goto: 'b1',
          },
          { text: '回:原来是演的?那你演技可以拿奖了', effects: { favor: 3 }, goto: 'b2' },
          { text: '回:不能喝就别硬喝啊,身体是自己的', effects: { favor: 2, saying: 'water' }, goto: 'b3' },
        ],
      }),
      node('b1', [
        npc('「………………」'),
        npc('「『干杯我替你演』。」'),
        npc('「我在酒桌上听过一万句『我干了你随意』,没有一句像这句一样,让我想放下杯子。」'),
        nar('你解锁了Alex的隐藏持仓:西装口袋里的胃药,和一个演了八年的醉拳高手。'),
      ], { end: true }),
      node('b2', [npc('「拿奖?哈,这个奖的奖品是胃溃疡。」'), npc('「算了,就当我今晚喝多了说胡话。你忘了吧。」')], { end: true }),
      node('b3', [npc('「嗯,道理都懂。」'), npc('「但北京的酒桌不听道理,听度数。晚安。」')], { end: true }),
    ]),
  ],
  dateSpots: [
    { template: 'bar', location: '国贸顶层酒廊', price: 1200, label: '云端酒局(他的战场)' },
    { template: 'dinner', location: '日料Omakase', price: 2600, label: 'Omakase(不看价格的那种)' },
    { template: 'shopping', location: 'SKP', price: 1000, label: 'SKP购物(他的舒适区)' },
    { template: 'ktv', location: '国贸K歌之王', price: 600, label: 'K歌(应酬之王的副本)' },
    { template: 'sport', location: '首钢滑雪大跳台', price: 800, label: '滑雪(他唯一的放空方式)' },
  ],
  he: {
    title: '重仓',
    badge: '唯一的非卖品',
    comment: '你和Alex在一起了。他把你设成了「特别关注」——他手机里唯一的一个,比大盘指数的优先级还高。',
  },
  trueFlag: 'alex_tired',
  trueHe: {
    title: '空杯',
    badge: '替他挡酒的人',
    comment: '那年年会,他第一次当众说「我不喝了,对象管得严」。全场起哄,他笑得像刚下市的新股。回家路上他说:这是我用过最好的挡箭牌,想用一辈子。',
  },
}
