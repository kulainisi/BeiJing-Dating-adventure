import { CharacterProfile } from '@/engine/types'
import { chat, me, nar, node, npc } from '../util'

export const laopao: CharacterProfile = {
  id: 'laopao',
  name: '鼓楼主唱老炮',
  emoji: '🎸',
  color: '#fbbf24',
  bio: '乐队主唱 | 白天骑手,晚上歌手 | 演出费不够修音箱 | 我们乐队差一个听懂的人,不差观众',
  archetype: '地下乐队主唱,白天送外卖养晚上的摇滚,唱的都是没处说的话',
  loves: ['indie', 'sincere', 'chill'],
  hates: ['corporate', 'practical'],
  deathTags: ['zhi'],
  decay: 8,
  mainSkill: 'culture',
  spicy: 0.15,
  confirmYes: '「我写了首新歌,还没名字。」他把耳机分你一只,「副歌那句你听听……听出来了吗?那句写的是你。歌名你来定,人也归你。」',
  confirmNo: '「跟我这样的人处,得陪我穷,陪我熬。」他摇摇头,「你值得坐在台下第一排,不是后台的破沙发。再想想。」',
  moodLines: {
    great: '「昨晚演出返场了!!三首!!台下有人举着灯牌喊我们乐队名字——虽然写错了一个字,但老子还是想哭。」',
    hungover: '「散场后跟贝斯手喝到天亮……他要退队了,回老家考编。喝一杯少一杯了。」',
    slacking: '「今天没接单也没排练。躺在排练室地板上听了一天黑胶。房东又来催租了,让他等等,歌比租金急。」',
    grumpy: '「今儿送单被投诉了,就因为我在电梯里哼歌。哼歌怎么了?!这单我白送,歌不能白哼。」',
  },
  blockLines: [
    '「你听不见我唱什么,咱俩频道不同。别调了,再见。」',
    '「回你的格子间去吧,那儿的空调比我们排练室体面。」',
  ],
  intro: chat('lp_intro', [
    node('a', [
      npc('「你好。先自我介绍:白天我是骑手,五星好评那种;晚上我是主唱,台下二十个人那种。」'),
      npc('「大部分人听到这儿会问:那你到底是干嘛的?你也想问这个?」'),
    ], {
      choices: [
        { text: '回:不问。骑手是你的活法,主唱是你的命。这不冲突', effects: { favor: 12 }, danmaku: ['#smart'], goto: 'b1' },
        { text: '问:下次演出什么时候?我想去当第二十一个', effects: { favor: 10 }, goto: 'b2' },
        { text: '问:那你这样……收入稳定吗?要不要考虑找个正经工作?', effects: { block: '对主唱说出了「正经工作」四个字' }, danmaku: ['#block'] },
      ],
    }),
    node('b1', [npc('「『活法』和『命』。」'), npc('「哥们儿……啊不是,姑娘。你这两个词,把我五年没解释清楚的事,一句话说明白了。」')], { end: true }),
    node('b2', [npc('「周五,School,门票八十,不包酒水。」'), npc('「丑话说前面:我们的歌不好听,但是真的。你要来,我给你留个能看见我的位置。」')], { end: true }),
  ]),
  topics: [
    chat('lp_t1', [
      node('a', [
        npc('「今天送单,到了一栋写字楼,电梯里全是工牌。有个哥们看了我一眼,眼神特复杂。」'),
        npc('「后来我想起来了:他以前是我们乐队的鼓手。现在他叫『王总监』。」'),
        npc('「你说,是他背叛了摇滚,还是摇滚养不起他?」'),
      ], {
        choices: [
          {
            text: '给出你的答案,这题没有标准答案,但有走心的答案',
            check: { skill: 'culture', dc: 13, pass: 'b1', fail: 'b2', crit: 'b1c' },
          },
          { text: '回:都不是。他只是先下车了,车还在开,你还在车上', effects: { favor: 11 }, goto: 'b3' },
        ],
      }),
      node('b1c', [
        me('「谁也没背叛谁。鼓点还在他心里,只是现在敲的是键盘。你替他把鼓敲下去,他替你把日子过明白——你们是同一首歌的两个声部。」'),
        npc('「…………」'),
        npc('「操。这句我要写进歌里。署你的名,版税分你——如果有的话。」'),
      ], { effects: { favor: 14, npcFlags: ['deep_talk'] }, danmaku: ['#art'], end: true }),
      node('b1', [me('「摇滚养不起他,但也没背叛——他鼓槌还留着呢吧?」'), npc('「……留着。上礼拜还问我排练室地址。你怎么知道?」')], { effects: { favor: 9 }, end: true }),
      node('b2', [me('「背叛了吧,搞钱去了还谈什么摇滚。」'), npc('「话别说这么硬。」'), npc('「他妈住院那年,是他的『背叛』付的手术费。摇滚很大,大不过命。」'), nar('你踩在了一个你不了解的故事上。')], { effects: { favor: -5 }, end: true }),
      node('b3', [npc('「『先下车了』……」'), npc('「行,这个说法,体面。回头我给他发个演出海报,告诉他车还在开。」')], { end: true }),
    ]),
    chat('lp_t2', [
      node('a', [
        npc('「问你个事:我们下个月演出,主办方说,翻唱几首口水歌,能多来一倍人,门票分成也多。」'),
        npc('「贝斯手走了,音箱坏了俩,我们确实缺钱。队里吵翻了。你说,唱不唱?」'),
      ], {
        choices: [
          { text: '回:唱。先活下来,才轮得到谈理想。但加一条:唱完口水歌,返场必须唱自己的', effects: { favor: 12, npcFlags: ['deep_talk'] }, danmaku: ['#smart'], goto: 'b1' },
          { text: '回:不唱。妥协一次就有第二次,你们的歌才是你们', effects: { favor: 8 }, goto: 'b2' },
          { text: '回:这还用想?当然唱啊,搞钱要紧', effects: { favor: -6, mine: true }, goto: 'b3' },
        ],
      }),
      node('b1', [npc('「『返场唱自己的』!」'), npc('「这就是解法啊!给面包一个位置,也给尊严留一首歌。你比我们全队都清醒。」')], { end: true }),
      node('b2', [npc('「……谢谢你这么说。」'), npc('「但你知道最难的是什么吗?是我心里也想选这个答案,可音箱不答应。」')], { end: true }),
      node('b3', [npc('「搞钱要紧,嗯。」'), npc('「要是搞钱要紧,我五年前就去当王总监了。」')], { end: true }),
    ]),
    chat('lp_t3', [
      node('a', [
        npc('「给你听个东西。(他发来一段手机录的demo,音质很糙,只有木吉他和他的声音)」'),
        npc('「这首歌写了三年,没在任何演出唱过。写给我妈的。她到现在都以为我在北京『做音乐方面的白领』。」'),
        npc('「她要知道她儿子白天送外卖,得哭。所以这首歌,一直不敢唱。」'),
      ], {
        choices: [
          {
            text: '认真听完,回:这首必须唱。就在下次演出——你妈不在台下,但全场每个北漂,都是她的孩子',
            effects: { favor: 15, npcFlags: ['lp_song'], care: true },
            danmaku: ['#simp'],
            goto: 'b1',
          },
          { text: '回:录音棚版本什么时候出?我第一个买', effects: { favor: 7 }, goto: 'b2' },
          { text: '回:要不……跟你妈坦白吧,瞒着也不是办法', effects: { favor: 2 }, goto: 'b3' },
        ],
      }),
      node('b1', [
        npc('「『全场每个北漂,都是她的孩子』。」'),
        npc('「…………你等会儿,我缓缓。」'),
        npc('「好。下次演出,压轴唱它。你必须来——这首歌第一次见观众,得有个证人。」'),
        nar('你解锁了老炮的B面:那个不敢让妈妈听见自己唱歌的儿子。'),
      ], { end: true }),
      node('b2', [npc('「录音棚,哈。」'), npc('「一小时六百。这首歌再等等吧,它习惯等了。」')], { end: true }),
      node('b3', [npc('「坦白……」'), npc('「你说得对,但我还没攒够坦白的底气。等我们发第一张专辑吧,到时候我把实体碟寄回家。」')], { end: true }),
    ]),
  ],
  dateSpots: [
    { template: 'bar', location: 'School Live Bar', price: 500, label: '演出现场(他的主场)' },
    { template: 'citywalk', location: '鼓楼东大街', price: 60, label: '鼓楼扫街(乐器行巡礼)' },
    { template: 'ktv', location: '平价量贩KTV', price: 350, label: 'K歌(主唱开小灶)' },
    { template: 'dinner', location: '簋街大排档', price: 350, label: '大排档(演出散场标配)' },
  ],
  he: {
    title: '第一排',
    badge: '乐队编外第六人',
    comment: '你和老炮在一起了。下次演出,他在台上说:「这首歌送给第一排那位——对,就是你,别躲。」台下二十个人集体回头,你社死又心动。',
  },
  trueFlag: 'lp_song',
  trueHe: {
    title: '压轴那首',
    badge: '那首歌的第一个证人',
    comment: '他真的在演出压轴唱了那首歌。唱到一半,台下有个阿姨举起了手机——是他妈妈,被你偷偷接来北京的。母子俩隔着人群哭成一片,那晚的门票钱,全场吵着要再付一遍。',
  },
}
