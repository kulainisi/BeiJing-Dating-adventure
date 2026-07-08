import { CharacterProfile } from '@/engine/types'
import { chat, me, nar, node, npc } from '../util'

export const vv: CharacterProfile = {
  id: 'vv',
  name: '亚逼女孩Vv',
  emoji: '⛓️',
  color: '#e879f9',
  bio: '地下场景常驻 | y2k+战损妆 | 小众到没有同类 | 别问我为什么这么穿,问就是你不懂',
  archetype: '亚文化女孩,战损妆下面是美院落榜生,用叛逆包扎理想',
  loves: ['indie', 'romantic'],
  hates: ['corporate', 'practical'],
  deathTags: ['trad'],
  decay: 9,
  mainSkill: 'culture',
  spicy: 0.25,
  confirmYes: '「主流恋爱那套我不会啊,纪念日、情侣头像什么的。」她踢着地上的石子,「但如果是你的话……我可以学。这句够直了吧。」',
  confirmNo: '「你是好人,但你身上有种『正常生活』的味道。我怕我把你带沟里,也怕你把我拽上岸。」',
  moodLines: {
    great: '「今晚地下有演出!阵容炸裂!我已经把最凶的那条裤子熨好了——对,战服也要熨,叛逆也要体面。」',
    hungover: '「昨晚蹦到四点……现在耳朵里还有底鼓在响。咚、咚、咚。」',
    slacking: '「今天丧,妆都不想画。素颜的我战斗力为零,只想缩在被子里当一只普通虫子。」',
    grumpy: '「刚在地铁被大妈拉着劝『好好穿衣服』。我谢谢她关心,但我现在浑身是刺,勿近。」',
  },
  blockLines: [
    '「你和地铁上那个大妈,握个手吧。拜拜。」',
    '「回你的正常世界去吧,那里红绿灯都为你亮。」',
  ],
  intro: chat('vv_intro', [
    node('a', [
      npc('「哟。看到你资料照片了,穿得挺……工整。」'),
      npc('「先过滤一下:我这种穿法,你第一眼什么感受?说真话,我能分辨场面话,这是天赋。」'),
      nar('她的头像:烟熏妆,铆钉choker,眼神像一场没开始就结束的演出。'),
    ], {
      choices: [
        { text: '回:第一眼觉得凶,第二眼觉得——这一身是花了心思的,像作品', effects: { favor: 12 }, danmaku: ['#smart'], goto: 'b1' },
        { text: '诚实:看不太懂,但尊重。愿意听你讲讲这身怎么搭的', effects: { favor: 9 }, goto: 'b2' },
        { text: '回:说实话有点怪,正常点穿不好吗', effects: { block: '对Vv说出了地铁大妈的台词' }, danmaku: ['#block'] },
      ],
    }),
    node('b1', [npc('「『像作品』。」'), npc('「……行,你过了。你知道吗,大部分人第一句是『万圣节提前了?』。」')], { end: true }),
    node('b2', [npc('「『看不懂但尊重』,及格线上的答案。」'), npc('「不过你说想听我讲——这个加分。没人问过我『怎么搭的』,他们只问『为什么』。」')], { end: true }),
  ]),
  topics: [
    chat('vv_t1', [
      node('a', [
        npc('「昨晚的演出,台下就三十个人。乐队主唱唱到最后,直接躺进人群里。」'),
        npc('「三十个人稳稳接住了他。你说,三万人的体育场,和三十个人的地下室,哪个更摇滚?」'),
      ], {
        choices: [
          {
            text: '给出你的答案,并且要能让她眼睛亮起来',
            check: { skill: 'culture', dc: 13, pass: 'b1', fail: 'b2', crit: 'b1c' },
          },
          { text: '回:接住他的那三十个人最摇滚', effects: { favor: 10 }, goto: 'b3' },
        ],
      }),
      node('b1c', [
        me('「体育场卖的是门票,地下室交换的是体温。三十个人不是观众,是共犯。」'),
        npc('「『共犯』!!」'),
        npc('「你这个词让我起鸡皮疙瘩了。你确定你是穿工整衣服的人类?」'),
      ], { effects: { favor: 14, npcFlags: ['deep_talk'] }, danmaku: ['#art'], end: true }),
      node('b1', [me('「人少的那个。因为没人是顺路来的。」'), npc('「……嗯,没人是顺路来的。这话说到点上了。」')], { effects: { favor: 9 }, end: true }),
      node('b2', [me('「三万人吧,毕竟场面大,音响也好。」'), npc('「音响,哈。」'), npc('「你的耳朵很诚实,但你没听懂题。」')], { effects: { favor: -4 }, end: true }),
      node('b3', [npc('「答对了。」'), npc('「那三十双手才是演出本体。你居然看到了手,不错。」')], { end: true }),
    ]),
    chat('vv_t2', [
      node('a', [
        npc('「问你个费解的:我们组的人,白天是会计、程序员、卖保险的。晚上才是『我们』。」'),
        npc('「你说,哪个是真的?白天的,还是晚上的?」'),
      ], {
        choices: [
          { text: '回:都是真的。白天交房租,晚上交灵魂,两笔账都得付', effects: { favor: 11, npcFlags: ['deep_talk'] }, goto: 'b1' },
          { text: '回:晚上的。人只有在自己选的衣服里才是自己', effects: { favor: 9 }, goto: 'b2' },
          { text: '回:白天的。晚上那是玩,当不了真', effects: { favor: -8, mine: true }, goto: 'b3' },
        ],
      }),
      node('b1', [npc('「『两笔账都得付』……」'), npc('「操,你怎么随口一句比我们主唱写的词还狠。」'), nar('亚逼女孩被一个「工整的人」说服了,这让她有点恼火,又有点上头。')], { end: true }),
      node('b2', [npc('「『自己选的衣服』,对,就是这个意思!」'), npc('「地铁大妈们永远不懂:我们不是穿给别人看的,是穿给自己认的。」')], { end: true }),
      node('b3', [npc('「玩。」'), npc('「行吧。对你们来说,不能写进简历的,都叫玩。」'), nar('她的语气降到了冰点,像散场后被拔掉电源的音箱。')], { end: true }),
    ]),
    chat('vv_t3', [
      node('a', [
        npc('(凌晨两点,她突然发来一张画:铅笔素描,一双握着话筒的手,笔触干净得不像话)'),
        npc('「发错了。算了,你都看到了。」'),
        npc('「我考过美院。三次。最后一次差九分。我爸说,画画的女孩养不活自己,滚去上班。」'),
        npc('「现在我白天做电商美工,给九块九包邮的袜子修图。晚上穿成这样去蹦迪。你猜哪个是叛逆?」'),
      ], {
        choices: [
          {
            text: '回:都不是。这张素描才是。九块九和战损妆都杀不死它——它还活着,你看,凌晨两点它自己跑出来了',
            effects: { favor: 15, npcFlags: ['vv_art'], care: true },
            danmaku: ['#simp'],
            goto: 'b1',
          },
          { text: '回:画得真好!要不要再试一次美院?', effects: { favor: 5 }, goto: 'b2' },
          { text: '回:你爸说得也有道理,爱好和吃饭确实得分开', effects: { favor: -8, mine: true }, goto: 'b3' },
        ],
      }),
      node('b1', [
        npc('「…………」'),
        npc('「『它自己跑出来了』。」'),
        npc('「你知道吗,这九年,我用铆钉、烟熏妆、二手皮衣把那个差九分的女孩包得严严实实。今晚被你一句话拆开了。」'),
        npc('「负责。你得负责。」'),
        nar('你解锁了Vv的原稿层:战损妆是绷带,里面包着一个从没放下画笔的人。'),
      ], { end: true }),
      node('b2', [npc('「再试一次?我二十八了。」'), npc('「美院不收大龄叛逆分子。不过……谢谢你说它好。」')], { end: true }),
      node('b3', [npc('「你和我爸,还有袜子店老板,你们仨挺合的。」'), nar('她收回了那张画,像收回一次不该发生的心软。')], { end: true }),
    ]),
  ],
  hiddenTopics: [
    {
      codeId: 'disc',
      script: chat('vv_hidden', [
        node('a', [
          npc('「今天整理柜子,翻出一张打口碟。前任送的。」'),
          npc('「他是个DJ,叫阿豹。我们在一起两年,分手那天他说:『你的愤怒是画出来的,我的是活出来的。』」'),
          npc('「呵。一个在夜店打碟给醉鬼听的人,跟我谈『活』。」'),
          nar('【罗生门视角】另一个版本的故事里,有个DJ说过:她把叛逆当作品集,我把叛逆当日子过——你们听到的,是同一次分手的两个版本。'),
        ], {
          choices: [
            { text: '回:也许你们都对。愤怒不分出身,画的和活的,疼是一样的', effects: { favor: 10, npcFlags: ['deep_talk'] }, goto: 'b' },
            { text: '回:那张碟,你留着,说明有些东西你没打算真扔', effects: { favor: 9 }, goto: 'b' },
          ],
        }),
        node('b', [npc('「……行了,考古结束。」'), npc('「这张碟我明天就挂闲鱼。(她没挂。)」')], { end: true }),
      ]),
    },
  ],
  dateSpots: [
    { template: 'bar', location: '地下Livehouse', price: 500, label: '地下演出(她的教堂)' },
    { template: 'expo', location: '798·先锋影像展', price: 240, label: '先锋展(她全程输出观点)' },
    { template: 'ktv', location: '摇滚主题KTV', price: 450, label: 'K歌(她只唱地下乐队)' },
    { template: 'citywalk', location: '鼓楼—深夜的钟楼湾', price: 60, label: '凌晨citywalk(她的地图)' },
  ],
  he: {
    title: '同谋',
    badge: '地下场景荣誉共犯',
    comment: '你和Vv在一起了。她把你的名字用马克笔写在了她的皮衣内衬上——她说外面是给世界的,里面是给自己的。',
    secretCode: '天台上的荧光贴纸',
  },
  trueFlag: 'vv_art',
  trueHe: {
    title: '第四次报名表',
    badge: '把画笔还给她的人',
    comment: '你陪她报了美院的成人进修班。开课第一天,她画到凌晨,战损妆哭花了也没停笔。结课展上她的作品标签写着:「《差九分》——献给终于敢看这幅画的自己,和那个说它还活着的人。」',
  },
}
