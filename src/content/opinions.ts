import { OpinionQ } from '@/engine/types'

/**
 * 看法题库:聊天中被随机抛出的「对事情的看法」。
 * tags 与角色档案的 loves/hates/deathTags 匹配:
 * practical 务实 | romantic 浪漫 | flex 消费/体面 | frugal 性价比 | indie 文艺独立
 * corporate 卷/事业 | chill 躺平松弛 | trad 传统 | equal 平等边界 | zhi 冒犯性直言 | sincere 真诚
 */
export const OPINIONS: OpinionQ[] = [
  {
    id: 'aa',
    ask: '问你个真实的:你觉得约会该不该AA?',
    options: [
      { text: '打字:该请客的时候大方,平时AA也舒服,别让钱变成心事', tags: ['equal', 'practical'] },
      { text: '秒回:跟我出来就没有AA这个选项,我买单', tags: ['flex', 'romantic'] },
      { text: '认真分析:AA是数学上的最优解,感情不能有坏账', tags: ['frugal'] },
      { text: '回:这种事都要拿出来讨论,格局是不是小了?', tags: ['zhi'] },
    ],
  },
  {
    id: 'caili',
    ask: '我朋友最近因为彩礼的事跟对象闹掰了……你怎么看彩礼这事?',
    options: [
      { text: '斟酌着回:尊重两边习俗,量力而行,别让老人为难', tags: ['trad', 'practical'] },
      { text: '直接说:都2026年了还谈彩礼,本质上就是一场交易', tags: ['zhi', 'equal'] },
      { text: '回:该给,这是诚意,一分都不能少', tags: ['trad'] },
      { text: '发了个捂脸表情:这题超纲了,早点睡吧', tags: ['chill'], saying: 'zaoshui' },
    ],
  },
  {
    id: 'jiaban',
    ask: '又是加班到十点的一天……你说,卷到底有没有意义?',
    options: [
      { text: '认真回:卷是我选的,我要在北京站稳,现在苦点没什么', tags: ['corporate'] },
      { text: '回:到点就跑。工作是老板的人生,不是我的', tags: ['chill', 'equal'] },
      { text: '回:看钱。钱给够,卷就是奋斗;钱不够,卷就是慈善', tags: ['practical', 'frugal'] },
      { text: '回:现在的年轻人就是吃不了苦', tags: ['zhi'] },
      { text: '苦笑:我们这行没有卷不卷,只有裁员名单这期有没有你', tags: ['sincere', 'corporate'], showIf: 'prof:chengxuyuan' },
    ],
  },
  {
    id: 'douban',
    ask: '想看那部新片,但豆瓣才5.9……你选电影会看评分吗?',
    options: [
      { text: '回:看!人生苦短,烂片止损', tags: ['practical'] },
      { text: '回:评分是别人嚼过的馍。我只相信自己的眼睛', tags: ['indie'] },
      { text: '回:电影不重要,重要的是跟谁看', tags: ['romantic'] },
      { text: '回:5.9?那种片子看的人都是韭菜', tags: ['zhi'] },
    ],
  },
  {
    id: 'bag',
    ask: '看中一个包,半个月工资……你说买不买?(TA发来一张截图)',
    options: [
      { text: '回:买!快乐是当下的,钱是身外的', tags: ['flex'] },
      { text: '回:找个平替吧,一样的版型三百块', tags: ['frugal'] },
      { text: '回:这钱买指数基金,十年后能买三个', tags: ['practical'] },
      { text: '回:包就是智商税,背出去也没人看', tags: ['zhi'] },
    ],
  },
  {
    id: 'laojia',
    ask: '昨天我妈又打电话让我回老家考编……你想过离开北京吗?',
    options: [
      { text: '认真回:想过,但还想再赌几年。北京再难,机会是真的', tags: ['corporate'] },
      { text: '回:老家有编制有饭局有爸妈,其实真香', tags: ['trad', 'practical'] },
      { text: '回:在哪不是活着,躺得舒服比什么都强', tags: ['chill'] },
      { text: '发语音:走什么走,留下来,北京的深夜比老家的白天精彩', tags: ['romantic', 'indie'] },
    ],
  },
  {
    id: 'xingzuo',
    ask: '说真的,你信星座和MBTI吗?我最近痴迷这个。',
    options: [
      { text: '回:信!i人e人真的很准,你一看就是脆皮i人', tags: ['romantic'] },
      { text: '回:统计学都不算,巴纳姆效应罢了', tags: ['practical', 'zhi'] },
      { text: '回:你信我就信,今天我的上升星座是你', tags: ['romantic', 'flex'] },
      { text: '回:比起星座,我更信八字,要不要合一下?', tags: ['trad'] },
    ],
  },
  {
    id: 'coffee',
    ask: '朋友说我疯了,39块钱一杯手冲咖啡……你觉得值吗?',
    options: [
      { text: '回:值。你买的不是咖啡,是那个下午和那个空间', tags: ['indie', 'flex'] },
      { text: '回:瑞幸9块9,它不香吗?', tags: ['frugal'] },
      { text: '回:咖啡的本质是咖啡因摄入效率,39块是溢价', tags: ['practical', 'zhi'] },
      { text: '回:下次我带你去喝79的,39算入门', tags: ['flex'] },
    ],
  },
  {
    id: 'yidi',
    ask: '有个问题:回龙观和亦庄谈恋爱,算异地恋吗?',
    options: [
      { text: '回:算!跨越四环的爱情都该被写进史诗', tags: ['romantic'] },
      { text: '回:算,通勤两小时是爱情第一杀手,建议搬家', tags: ['practical'] },
      { text: '回:谁先提搬家谁就输了', tags: ['zhi'] },
      { text: '回:爱能克服环线。克服不了的说明爱得不够', tags: ['romantic', 'indie'] },
    ],
  },
  {
    id: 'fangzi',
    ask: '「没房不结婚」……你觉得这个想法现实吗?',
    options: [
      { text: '回:现实。房子不是浪漫,是安全感的实体化', tags: ['practical', 'trad'] },
      { text: '回:房子是枷锁。租房怎么了,自由无价', tags: ['indie', 'chill'] },
      { text: '回:一起奋斗一起买,两个人的首付比一个人快', tags: ['romantic', 'corporate'] },
      { text: '回:提房就是物质,谈感情的时候别谈钱', tags: ['zhi'] },
    ],
  },
  {
    id: 'qianren',
    ask: '你觉得……分手之后还能做朋友吗?',
    options: [
      { text: '回:能啊,成年人的世界,好聚好散,边界清楚就行', tags: ['equal', 'chill'] },
      { text: '回:不能。前任就该是查无此人', tags: ['trad'] },
      { text: '回:看分手的原因吧,有些遗憾值得体面', tags: ['sincere'] },
      { text: '回:能做朋友说明当初就没爱过', tags: ['zhi', 'romantic'] },
    ],
  },
  {
    id: 'gongzi',
    ask: '刷到个帖子说「月薪两万在北京过得像乞丐」,你觉得夸张吗?',
    options: [
      { text: '回:不夸张,房租一交、咖啡一喝,月底确实要吃土', tags: ['flex'] },
      { text: '回:夸张。会过日子的话很够了,不会过多少都不够', tags: ['practical', 'frugal'] },
      { text: '回:钱是活着的工具,不是活着的意义', tags: ['indie'] },
      { text: '回:两万都过不下去,那是能力问题', tags: ['zhi'] },
      { text: '认真回:两万是我一单一单跑出来仨月的钱。日子不是过给帖子看的', tags: ['sincere', 'practical'], showIf: 'prof:waimai' },
    ],
  },
  {
    id: 'sanTian',
    ask: '我发现你朋友圈三天可见……为什么呀?',
    options: [
      { text: '坦白:过去的自己太羞耻了,得埋起来', tags: ['sincere'] },
      { text: '回:朋友圈是我的地盘,可见范围是我的边界', tags: ['equal'] },
      { text: '回:为了让你好奇啊,现在你不就来问了', tags: ['romantic', 'flex'] },
      { text: '回:就是懒,别多想', tags: ['chill'], saying: 'emmm' },
    ],
  },
  {
    id: 'yangmao',
    ask: '纠结:养猫还是养狗?我租的房子其实都不让养,哈哈。',
    options: [
      { text: '回:猫。北漂的命也是命,猫至少不用遛', tags: ['practical'] },
      { text: '回:狗!爱是需要出门的', tags: ['romantic'] },
      { text: '回:先养活自己吧,咱俩这种的,绿植都算宠物', tags: ['chill', 'sincere'] },
      { text: '回:随便,都行,你开心就好', tags: ['chill'], saying: 'suibian' },
    ],
  },
  {
    id: 'duanju',
    ask: '昨晚刷短剧到三点,「霸总在民国爱上我」……你会看这种吗?',
    options: [
      { text: '承认:看!下饭神器,大脑放假谁不爱', tags: ['chill', 'sincere'] },
      { text: '回:不看,我只看长片和文学改编', tags: ['indie'] },
      { text: '回:看什么不重要,能让你三点睡的东西都值得敬畏', tags: ['romantic'] },
      { text: '回:那玩意儿是精神鸦片,建议戒了', tags: ['zhi'] },
    ],
  },
  {
    id: 'jiehun',
    ask: '有点严肃的问题……你觉得,人为什么要结婚?',
    options: [
      { text: '认真回:找个见证人,见证你这一生。不然太孤独了', tags: ['romantic', 'sincere'] },
      { text: '回:经济共同体,抗风险联盟,北京生存的最优配置', tags: ['practical'] },
      { text: '回:到岁数了,爸妈催了,大家都结了', tags: ['trad'] },
      { text: '回:不知道。不结也挺好,一个人也能过', tags: ['chill', 'equal'] },
    ],
  },
  {
    id: 'jiudian',
    ask: '同事聚餐非要灌我酒,烦死了……你怎么看酒桌文化?',
    options: [
      { text: '回:糟粕。感情不在酒里,在心里', tags: ['equal', 'sincere'] },
      { text: '回:存在即合理,该喝就喝,这是社会的润滑剂', tags: ['trad', 'corporate'] },
      { text: '回:我的原则是:能喝,但只跟喜欢的人喝', tags: ['romantic'] },
      { text: '回:不能喝就别出来混', tags: ['zhi'] },
      { text: '回:工地上敬酒不看职位看手艺。下次谁灌你,你说你对象是包工头', tags: ['sincere', 'chill'], showIf: 'prof:zhuangxiu' },
    ],
  },
  {
    id: 'AI',
    ask: '你说以后AI会不会把我工作干没了?最近好焦虑。',
    options: [
      { text: '安慰:AI替代不了你。焦虑就对了,说明你在长脑子。多喝热水,早点休息', tags: ['sincere'], saying: 'water' },
      { text: '回:会。所以趁现在多搞钱,建立护城河', tags: ['practical', 'corporate'] },
      { text: '回:干没了正好,此处不留爷,回家躺平', tags: ['chill'] },
      { text: '回:你这工作本来就该被替代', tags: ['zhi'] },
    ],
  },
]
