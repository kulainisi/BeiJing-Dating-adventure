import { CharacterProfile } from '@/engine/types'
import { chat, me, nar, node, npc } from '../util'

export const jingjing: CharacterProfile = {
  id: 'jingjing',
  name: '北京大妞京京',
  emoji: '🏮',
  color: '#fb923c',
  bio: '二环土著 | 家里有房但你别惦记 | 说话直,心眼儿正 | 处得来处,处不来您呐',
  archetype: '胡同房东千金,直爽大妞,最烦装,更烦图她房的',
  loves: ['sincere', 'chill', 'equal'],
  hates: ['corporate'],
  deathTags: ['flex'],
  decay: 6,
  mainSkill: 'mouth',
  spicy: 0.1,
  confirmYes: '「行,处着吧。」她说得干脆,然后别过头去,「我跟你说,我们家大妞要是认了人,那是真认。你可别让我看走眼。」',
  confirmNo: '「你人不赖,可我还没瞧准。别急,是你的跑不了,不是你的——那也没辙。」',
  moodLines: {
    great: '「今儿个高兴!我们家鸽子下崽了!晚上来吃炸酱面啊,我爸抻的面,一绝!」',
    hungover: '「昨儿陪我爸喝二锅头,喝大了……老爷子念叨我婚事,我一杯一杯全干了。」',
    slacking: '「今儿哪也不想去,就想在房顶上晒太阳。你说人这一辈子,折腾个啥劲呢。」',
    grumpy: '「刚有个租客跟我这儿装大尾巴狼,气得我够呛。今儿个谁装我跟谁急。」',
  },
  blockLines: [
    '「得,您呐,慢走不送。」',
    '「我们家大门朝南,不迎您这路人。回见您呐。」',
  ],
  intro: chat('jj_intro', [
    node('a', [
      npc('「哟,你好。先说好啊,我这人说话直,你要是玻璃心咱就别互相耽误。」'),
      npc('「第一个问题:你是不是听说我们家二环有房,才划到我的?」'),
      nar('好家伙,开局直接掀底牌。'),
    ], {
      choices: [
        { text: '同样直球:划你是因为照片笑得敞亮。房的事,刚才才知道,跟我没关系', effects: { favor: 11 }, danmaku: ['#smart'], goto: 'b1' },
        { text: '打个哈哈:哈哈哪能啊,缘分缘分', effects: { favor: -3 }, goto: 'b2' },
        { text: '顺杆爬:二环有房?那必须好好处啊,阿姨我来了', effects: { block: '开局就惦记上人家房了' }, danmaku: ['#block'] },
      ],
    }),
    node('b1', [npc('「哈!痛快!」'), npc('「行,就冲你这句『跟我没关系』,咱能聊。我最烦那些个七拐八绕的。」')], { end: true }),
    node('b2', [npc('「缘分?」'), npc('「得,又一个打太极的。行吧,慢慢看。」'), nar('大妞对「哈哈」的容忍度,显然有限。')], { end: true }),
  ]),
  topics: [
    chat('jj_t1', [
      node('a', [
        npc('「问你个事儿,你们外地来的,是不是都觉得我们土著日子特滋润?收租、遛鸟、喝豆汁儿?」'),
        npc('「我跟你说实话,我表哥就那样,我瞧不上。我自个儿在国贸上班,一分租金没拿过家里的。」'),
      ], {
        choices: [
          { text: '回:分得清家里的房和自己的路,这比二环的房本值钱', effects: { favor: 11, npcFlags: ['deep_talk'] }, goto: 'b1' },
          { text: '实诚:确实羡慕过。不过现在更羡慕你活得这么明白', effects: { favor: 9 }, goto: 'b2' },
          { text: '回:那你图啥啊,躺着收租不香吗', effects: { favor: -7, mine: true }, goto: 'b3' },
        ],
      }),
      node('b1', [npc('「……嘿,你这话说得敞亮。」'), npc('「我们家胡同口的大爷都没你看得明白。加分!」')], { end: true }),
      node('b2', [npc('「羡慕啥呀,拆迁款是爷爷奶奶一辈子换的,我花着烫手。」'), npc('「不过『活得明白』这话我爱听,哈哈。」')], { end: true }),
      node('b3', [npc('「香,可那是我爸妈的香,不是我的。」'), npc('「你要觉得躺着才叫赢,那咱俩对『赢』的理解不太一样。」')], { end: true }),
    ]),
    chat('jj_t2', [
      node('a', [
        npc('「周末我去给我奶奶买点心,稻香村排了仨小时。你说这帮黄牛,连自来红都倒卖!」'),
        npc('「哎对了,考考你:京八件,你能说出几件?」'),
      ], {
        choices: [
          {
            text: '搜刮记忆,认真报菜名',
            check: { skill: 'culture', dc: 12, pass: 'b1', fail: 'b2', crit: 'b1c' },
          },
          { text: '坦白:一件都说不出,但我可以陪你排下回的仨小时', effects: { favor: 9, care: true }, goto: 'b3' },
        ],
      }),
      node('b1c', [
        me('「福字饼、太师饼、翻毛月饼、椒盐饼……最后再来个自来红自来白凑一对。」'),
        npc('「嚯!!比我奶奶数得还全!」'),
        npc('「不行,这你得跟我回家一趟,我奶奶见着你能高兴一礼拜。」'),
      ], { effects: { favor: 14 }, danmaku: ['#smart'], end: true }),
      node('b1', [me('「自来红、自来白……萨其马算吗?」'), npc('「萨其马不算!但你能说出自来红,及格了,比大部分人强。」')], { effects: { favor: 8 }, end: true }),
      node('b2', [me('「京八件……八件套?床上四件套那种?」'), npc('「哈哈哈哈哈你可真是个人才!」'), nar('答案离谱,但她笑得很真,扣分和加分互相抵消了。')], { effects: { favor: 2, awkward: 5 }, end: true }),
      node('b3', [npc('「仨小时你也肯排?」'), npc('「行啊,下回带你去,顺便让你尝尝我奶奶的糊塌子。」')], { end: true }),
    ]),
    chat('jj_t3', [
      node('a', [
        npc('「跟你说个掏心窝子的事儿。」'),
        npc('「我处过一个对象,处了半年,挺好的。后来有回他喝多了,跟哥们儿打电话,说『拿下她,房子就稳了』。」'),
        npc('「我当时就站他背后。你知道我什么感觉吗?我们家那房,从那天起,像块砖头压我身上。」'),
      ], {
        choices: [
          {
            text: '回:那不是房的错,是人的错。你不是「有房的姑娘」,你是京京',
            effects: { favor: 14, npcFlags: ['jj_real'], care: true },
            danmaku: ['#simp'],
            goto: 'b1',
          },
          { text: '回:所以后来你们分了?那房子现在……', effects: { block: '在人家伤口上打听房产' }, danmaku: ['#block'] },
          { text: '回:渣男哪都有,别往心里去,早点睡', effects: { favor: -3, saying: 'zaoshui' }, goto: 'b2' },
        ],
      }),
      node('b1', [
        npc('「……『你是京京』。」'),
        npc('「就这仨字,我等人说了好些年了。」'),
        npc('「行了行了,不煽情了,再煽情我该给你抻面去了。」'),
        nar('你解锁了京京的心里话:她要的从来不多,就是有人看见房子后头那个人。'),
      ], { end: true }),
      node('b2', [npc('「嗯,睡了。」'), nar('大妞收起了掏出来的心窝子,像收摊的煎饼车,利落,不回头。')], { end: true }),
    ]),
  ],
  dateSpots: [
    { template: 'dinner', location: '牛街炙子烤肉', price: 280, label: '炙子烤肉(她的地界儿)' },
    { template: 'citywalk', location: '什刹海—烟袋斜街', price: 60, label: '什刹海遛弯儿' },
    { template: 'park', location: '欢乐谷', price: 800, label: '欢乐谷(大妞想玩跳楼机)' },
    { template: 'expo', location: '首都博物馆', price: 80, label: '首博(她当半个讲解员)' },
  ],
  he: {
    title: '这人我认了',
    badge: '胡同编内家属',
    comment: '你和京京在一起了。她奶奶往你手里塞了俩自来红,她爸给你抻了碗面,她在旁边说:「吃你的吧,我们家认人就这规矩。」',
  },
  trueFlag: 'jj_real',
  trueHe: {
    title: '房本后头的人',
    badge: '看见京京的人',
    comment: '领证那天她跟你说,婚前财产公证她主动办了,「不是防你,是想踏实知道——你要的是我」。那天她哭了,你也哭了,她爸假装看鸽子,也抹了把脸。',
  },
}
