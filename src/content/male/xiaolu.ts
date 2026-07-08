import { CharacterProfile } from '@/engine/types'
import { chat, me, nar, node, npc } from '../util'

export const xiaolu: CharacterProfile = {
  id: 'xiaolu',
  name: '电竞主播小鹿',
  emoji: '🎮',
  color: '#a5b4fc',
  bio: '游戏主播 | 峡谷登顶(过) | 昼夜颠倒作息选手 | 直播间三万人,下播一个人',
  archetype: '电竞主播,播感拉满的开朗和下播后的安静,判若两人',
  loves: ['chill', 'romantic', 'sincere'],
  hates: ['corporate'],
  deathTags: ['zhi'],
  decay: 10,
  mainSkill: 'mind',
  spicy: 0.18,
  confirmYes: '「我直播间三万人看我笑。」她顿了顿,声音比平时小,「但我想哭的时候,只想让你一个人看到。这算表白成功吗?」',
  confirmNo: '「哥,你是个好人……啊不是,串词了。我是说,再让我播两个赛季,行吗?」',
  moodLines: {
    great: '「今天上分了!五连胜!状态爆炸!你要现在跟我表白,成功率提升200%(不是)」',
    hungover: '「昨晚陪水友通宵上分……现在看什么都是双份的。你也是双份的,还挺好看。」',
    slacking: '「今天不想播。挂了个『主播休息中』的牌子,躺着看天花板。别问为什么,电量没了。」',
    grumpy: '「刚被喷子问候全家,平台还判我『情绪引导』警告。我现在的血条,一点就炸。」',
  },
  blockLines: [
    '「已拉黑。理由:低质量互动,不予回复。」',
    '「你被移出直播间了,永久那种。」',
  ],
  intro: chat('xl_intro', [
    node('a', [
      npc('「哈喽!语音打字都行,我打字快,职业习惯~」'),
      npc('「自报家门:小鹿,打游戏的,靠直播吃饭。先把丑话说前面:很多人管我这行叫『网红』,你怎么看?」'),
      nar('送分题还是送命题,取决于你的用词。'),
    ], {
      choices: [
        { text: '回:你是主播,是打职业的。「网红」这词配不上你的操作', effects: { favor: 11 }, danmaku: ['#smart'], goto: 'b1' },
        { text: '回:管别人怎么叫呢,你自己知道自己是干嘛的就行', effects: { favor: 8 }, goto: 'b2' },
        { text: '回:网红咋了,网红挺好的呀,能恰饭', effects: { favor: -8, mine: true }, goto: 'b3' },
      ],
    }),
    node('b1', [npc('「哦?!你居然懂这个区别!」'), npc('「行,你这波开局,S级评价。加好友位置给你留了。」')], { end: true }),
    node('b2', [npc('「……有道理。」'), npc('「你这个心态比我稳,我练了三年才学会不在乎弹幕。」')], { end: true }),
    node('b3', [npc('「哈,恰饭。」'), npc('「没事,习惯了。反正在你们眼里,我这行就是『玩玩游戏就把钱挣了』。」'), nar('她没生气,但她把你归进了「不懂的人」那一档。')], { end: true }),
  ]),
  topics: [
    chat('xl_t1', [
      node('a', [
        npc('「凌晨四点下播,点了个粥,坐在出租屋地毯上喝。」'),
        npc('「三万人刚刚还在跟我说晚安,现在屋里安静得能听见冰箱声。你说好笑不好笑。」'),
      ], {
        choices: [
          { text: '回:那把第三万零一个人的晚安留给我吧,我这个是真人售后', effects: { favor: 12, care: true }, danmaku: ['#simp'], goto: 'b1' },
          { text: '回:职业病吧,热闹是工作,安静才是生活', effects: { favor: 7 }, goto: 'b2' },
          { text: '回:三万人!那你收入很可以啊', effects: { favor: -6, mine: true }, goto: 'b3' },
        ],
      }),
      node('b1', [npc('「真人售后,哈哈哈什么鬼。」'), npc('「……那,晚安。这句不播出去,就给你了。」')], { end: true }),
      node('b2', [npc('「你这话像我心理咨询师说的,不过便宜多了。」')], { end: true }),
      node('b3', [npc('「嗯,还行。」'), nar('她给你发了个官方笑脸。你成功把一次深夜的破防,聊成了一次商务洽谈。')], { end: true }),
    ]),
    chat('xl_t2', [
      node('a', [
        npc('「带你双排啊!你什么段位?别虚报,我一看操作就知道。」'),
        nar('来了,电竞主播的终极考验。'),
      ], {
        choices: [
          {
            text: '如实报段位,并放话:操作不够,意识来凑',
            check: { skill: 'mind', dc: 12, pass: 'b1', fail: 'b2', crit: 'b1c' },
          },
          { text: '坦白:菜到暖房,但我可以当你的专属氛围组', effects: { favor: 8 }, goto: 'b3' },
          { text: '吹牛:我巅峰王者,让让你没问题', effects: { favor: -2, npcFlags: ['boast_game'] }, goto: 'b4' },
        ],
      }),
      node('b1c', [
        nar('那局你的走位极其风骚,关键团一个绕后改写战局。'),
        npc('「等一下!回放这波!你这意识,你跟我说你是黄金??」'),
        npc('「瞒段位是吧!行啊,以后我的双排位置,你承包了。」'),
      ], { effects: { favor: 13 }, danmaku: ['#win'], end: true }),
      node('b1', [nar('你发挥中规中矩,但每次她被抓你都第一时间支援。'), npc('「操作一般,但你护我护得挺坚决啊。行,这个双排搭子我收了。」')], { effects: { favor: 9 }, end: true }),
      node('b3', [npc('「氛围组?哈哈哈行啊。」'), nar('那局你全程语音喝彩,精准捧场。她赢了两把,笑声比平时直播还真。'), npc('「你还真别说,有专属观众的感觉,爽过五连胜。」')], { effects: { favor: 8 }, end: true }),
      node('b2', [nar('你0-7开局,还抢了她两个人头。'), npc('「……哥,你玩的是俄罗斯方块吗?没事,菜不是罪,抢人头是。」')], { effects: { favor: -4, awkward: 8 }, end: true }),
      node('b4', [npc('「巅峰王者?」'), npc('「行,记下了。改天当面验货——我直播间验,三万人作证。」'), nar('你立了一个全网公证的flag。')], { end: true }),
    ]),
    chat('xl_t3', [
      node('a', [
        npc('(凌晨一点,她发来一张照片:素颜,关了补光灯的房间,只有屏幕的光)'),
        npc('「刚下播。今天有个水友刷了大礼物,说『小鹿你永远开心』。」'),
        npc('「我对着镜头笑得特别标准。然后下播,坐在这,突然就——你说,一个靠开心吃饭的人,不开心的时候算不算工伤?」'),
      ], {
        choices: [
          {
            text: '回:算。所以下播之后的不开心,归我管。这里不用营业,也不用标准',
            effects: { favor: 14, npcFlags: ['xl_offline'], care: true },
            danmaku: ['#simp'],
            goto: 'b1',
          },
          { text: '回:干哪行不都这样,忍忍就过去了', effects: { favor: -6, mine: true }, goto: 'b2' },
          { text: '发一个「摸头」的表情包,不说话', effects: { favor: 7, care: true }, goto: 'b3' },
        ],
      }),
      node('b1', [
        npc('「『这里不用营业』……」'),
        npc('「你知道吗,我刚才对着这句话,把今天没笑出来的份,一次性哭完了。」'),
        npc('「这条别截图。这是三万人都没见过的版本。」'),
        nar('你解锁了小鹿的下播模式:补光灯外面,那个电量会耗尽的普通女孩。'),
      ], { end: true }),
      node('b2', [npc('「嗯,忍忍。」'), npc('「你说得对,大家都这样。晚安,我去充电了——手机和人都是。」')], { end: true }),
      node('b3', [npc('「……」'), npc('「这个表情包,今晚比一万句加油好使。」')], { end: true }),
    ]),
  ],
  dateSpots: [
    { template: 'ktv', location: '工体量贩KTV', price: 450, label: 'K歌(主播的嗓子是专业的)' },
    { template: 'jubensha', location: '朝阳大悦城推理馆', price: 500, label: '剧本杀(她演技惊人)' },
    { template: 'dinner', location: '海底捞(凌晨场)', price: 400, label: '深夜海底捞(下播后的主餐)' },
    { template: 'bar', location: '电竞主题酒吧', price: 600, label: '电竞酒吧(她的粉丝浓度预警)' },
  ],
  he: {
    title: '固定队友',
    badge: '峡谷唯一指定辅助',
    comment: '你和小鹿在一起了。她的直播间简介多了一行:「本主播已有固定辅助,勿扰。」弹幕哀嚎了一整晚,礼物刷得比过年还多。',
  },
  trueFlag: 'xl_offline',
  trueHe: {
    title: '下播之后',
    badge: '关灯后也在的人',
    comment: '她第一次在你面前完整地「下播」:素颜、瘫着、打游戏输了就骂骂咧咧。她说这是她的「真人内测版本」,全网限量一份,终身授权给你。',
  },
}
