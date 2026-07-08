import { CharacterProfile } from '@/engine/types'
import { chat, me, nar, node, npc } from '../util'

export const erhuange: CharacterProfile = {
  id: 'erhuange',
  name: '二环哥',
  emoji: '🐦',
  color: '#d4a373',
  bio: '二环里长大的 | 家有俩院儿 | 提笼遛鸟,收租喝茶 | 您别催,我这人干什么都不着急',
  archetype: '土著收租男,佛系皮囊下藏着一个没跟人说过的正经理想',
  loves: ['chill', 'sincere', 'trad'],
  hates: ['corporate'],
  deathTags: ['zhi'],
  decay: 4,
  mainSkill: 'mouth',
  spicy: 0.08,
  confirmYes: '「我这人,鸟不着急遛,茶不着急喝,三十年就没着急过。」他挠挠头,「头回想跟时间赛跑,是怕你被别人截了胡。处吧?」',
  confirmNo: '「你挺好,真挺好。就是我这日子过得跟温吞水似的,怕耽误你这样的急脾气。再处处看?」',
  moodLines: {
    great: '「今儿个我那画眉开口了!叫得那叫一个脆生!走,请你喝豆汁儿庆祝——不爱喝?那炒肝也行。」',
    hungover: '「昨儿跟胡同里几个发小喝了顿,二锅头就花生米……岁数到了,扛不住喽。」',
    slacking: '「今儿嘛也不想干。搬个马扎往院里一坐,看云彩。你说古人管这叫闲情,现在管这叫躺平,亏不亏。」',
    grumpy: '「今儿有个租户跟我掰扯水电费,掰扯仨小时。我这人不爱急,但架不住有人上赶着让我急。」',
  },
  blockLines: [
    '「得,话不投机半句多。您忙您的去吧。」',
    '「我这院子小,装不下您这么大的见识。回见。」',
  ],
  intro: chat('eh_intro', [
    node('a', [
      npc('「你好啊。先自报家门:我,二环里头长大的,家里有俩院儿出租,平时遛遛鸟喝喝茶。」'),
      npc('「按惯例,听到这儿,一半人眼睛亮了,另一半人心里嘀咕『啃老的』。你是哪半?」'),
      nar('他把最容易被误解的部分,自己先端上了桌。'),
    ], {
      choices: [
        { text: '回:我是第三种——好奇你遛的什么鸟,画眉还是绣眼?', effects: { favor: 12 }, danmaku: ['#smart'], goto: 'b1' },
        { text: '实诚:确实嘀咕了一下。不过人不能光看简历,处处看', effects: { favor: 9 }, goto: 'b2' },
        { text: '回:说白了不就是啃老吗,收租能算职业?', effects: { block: '第一句话就给二环哥定了性' }, danmaku: ['#block'] },
      ],
    }),
    node('b1', [npc('「嘿!!你问鸟?!」'), npc('「画眉!今年三岁,叫『大爷』——因为它比我还横。姑娘,你这题答的,直接进决赛。」')], { end: true }),
    node('b2', [npc('「嘀咕了还敢承认,实在人。」'), npc('「行,不怕你嘀咕,就怕你不问。处处看呗,反正我有的是工夫。」')], { end: true }),
  ]),
  topics: [
    chat('eh_t1', [
      node('a', [
        npc('「今儿收租,有个小年轻跟我说:哥,你这辈子赢在起跑线了,躺着就把钱挣了。」'),
        npc('「我给他续了半年房租没涨价。你猜我为嘛?」'),
      ], {
        choices: [
          { text: '猜:因为他说的是实话,而你对说实话的人心软', effects: { favor: 11, npcFlags: ['deep_talk'] }, goto: 'b1' },
          { text: '猜:因为他让你想起了什么人,或者什么事', effects: { favor: 9 }, goto: 'b2' },
          { text: '回:大方!不愧是有俩院儿的人', effects: { favor: -5, mine: true }, goto: 'b3' },
        ],
      }),
      node('b1', [npc('「……嘿,让你猜着一半。」'), npc('「他说得对,我是赢在起跑线了。可赢在起跑线的人,总得干点什么,才对得起这条线,你说是不是?」'), nar('佛系的皮下面,好像有什么东西动了一下。')], { end: true }),
      node('b2', [npc('「想起我爸。他以前老说:咱家这院子是祖上传的,到你手里别光会收钱。」'), npc('「这话我记着呢,就是……还没想好怎么『别光会收钱』。」')], { end: true }),
      node('b3', [npc('「大方,呵呵。」'), npc('「姑娘,你眼里是不是就看见『俩院儿』仨字了?」')], { end: true }),
    ]),
    chat('eh_t2', [
      node('a', [
        npc('「带你认认我的地界儿:后海这条遛鸟路线,我走了二十年。哪棵树底下凉快,哪个大爷棋臭还爱悔棋,门儿清。」'),
        npc('「考考你:老北京提笼架鸟,笼子上盖块布,为嘛?」'),
      ], {
        choices: [
          {
            text: '认真想想,给出答案',
            check: { skill: 'culture', dc: 12, pass: 'b1', fail: 'b2', crit: 'b1c' },
          },
          { text: '直接认输:不知道,但想听你讲——你讲这些的时候眼睛在发光', effects: { favor: 10, care: true }, goto: 'b3' },
        ],
      }),
      node('b1c', [
        me('「压性子。鸟性子躁,盖上布安静,揭开布见了亮,叫得才欢——欲扬先抑,跟做人一个理儿。」'),
        npc('「好家伙!!」'),
        npc('「『跟做人一个理儿』——我爷爷当年原话!姑娘你什么来路?!」'),
      ], { effects: { favor: 14 }, danmaku: ['#smart'], end: true }),
      node('b1', [me('「让鸟安静,养性子?」'), npc('「答对一半,是这么个意思。剩下一半,回头遛弯儿的时候给你细讲。」')], { effects: { favor: 8 }, end: true }),
      node('b2', [me('「防晒?鸟也怕紫外线吧。」'), npc('「哈哈哈哈防晒!鸟要能听懂,得气得撞笼子。」'), nar('答案离谱,但他笑得直不起腰,反倒近乎了。')], { effects: { favor: 4 }, end: true }),
      node('b3', [npc('「眼睛发光?有吗。」'), npc('「……可能有吧。这条路上的事,没人愿意听第二遍,你是头一个说想听的。」')], { end: true }),
    ]),
    chat('eh_t3', [
      node('a', [
        npc('「跟你说个事儿,我发小都不知道。」'),
        npc('「我报了个班——故宫的文物修复志愿者培训。每礼拜二四,骑车去上课,风雨无阻,比收租积极多了。」'),
        npc('「别笑啊。一个收租的去学修文物,胡同里传出去,得让人笑掉大牙。」'),
      ], {
        choices: [
          {
            text: '回:笑什么?守着老院子的人去修老东西,这是全北京最对口的志愿者',
            effects: { favor: 14, npcFlags: ['eh_dream'], care: true },
            danmaku: ['#simp'],
            goto: 'b1',
          },
          { text: '回:挺好的,反正你闲着也是闲着', effects: { favor: -6, mine: true }, goto: 'b2' },
          { text: '回:哪天带我去看看你修的东西呗', effects: { favor: 9 }, goto: 'b3' },
        ],
      }),
      node('b1', [
        npc('「『最对口的志愿者』……」'),
        npc('「我爸走的时候说,别光会收钱。我琢磨了十年,琢磨出这么个道儿。你是头一个说『对口』的,连我们老师都只说『难得』。」'),
        nar('你解锁了二环哥的房本背面:上面写着一个想亲手把老北京修好的人。'),
      ], { end: true }),
      node('b2', [npc('「闲着也是闲着。」'), npc('「……得,您这话跟胡同口大妈说得一样。就当我没提。」')], { end: true }),
      node('b3', [npc('「成啊!」'), npc('「不过丑话说前面:现在就让我修个青花瓷还不够格,我目前的最高成就是——给一个清代笔筒除尘。别嫌寒碜。」')], { end: true }),
    ]),
  ],
  dateSpots: [
    { template: 'citywalk', location: '后海遛鸟路线', price: 60, label: '遛弯儿(他的二十年路线)' },
    { template: 'dinner', location: '门框胡同卤煮', price: 200, label: '卤煮(他从小吃到大的店)' },
    { template: 'expo', location: '恭王府', price: 140, label: '恭王府(他当野生讲解)' },
    { template: 'ktv', location: '地安门老歌房', price: 300, label: 'K歌(他只会唱老歌)' },
  ],
  he: {
    title: '院里添了把椅子',
    badge: '四合院常驻嘉宾',
    comment: '你和二环哥在一起了。院里那棵枣树下多了把藤椅,他的画眉「大爷」对你叫了一声——他说这是它三年来第一次给外人开口。',
  },
  trueFlag: 'eh_dream',
  trueHe: {
    title: '别光会收钱',
    badge: '看见他手艺的人',
    comment: '他结业那天,捧回一个亲手修复的民国座钟,摆在院里,指针走得咔哒响。他说:「我爸要是能听见这声儿就好了。」你说:「他听得见。」那天的枣树落了一地枣,谁也没去捡。',
  },
}
