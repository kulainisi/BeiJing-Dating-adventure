import { DateSpot, Script, StyleId } from '@/engine/types'
import { chat, nar, node, npc } from './util'

/**
 * v4 内容扩展(集中注册,不改各角色文件;content/index.ts 的 getCharacters 负责合并):
 * - EXTRA_SPOTS   :每角色新增 1 个贴人设的约会地点(密室/Livehouse/温泉)
 * - OPINION_REACTS:看法题的角色定制反应(good/bad;不配的落回通用台词)
 * - EXTRA_TOPICS  :专属话题扩充(分批补,当前为第一批)
 */

// ============ 新约会地点(贴人设) ============
export const EXTRA_SPOTS: Record<string, DateSpot[]> = {
  // —— 男版(她们)——
  linda: [{ template: 'wenquan', location: '颐堤港高端汤泉', price: 680, label: '汤泉SPA(项目暂停键)' }],
  xiaoman: [{ template: 'livehouse', location: '鼓楼东大街小场地', price: 180, label: 'Live现场(诗与失真音墙)' }],
  yutong: [{ template: 'livehouse', location: '五棵松Livehouse', price: 240, label: 'Live现场(她的摇滚灵魂)' }],
  cici: [{ template: 'livehouse', location: 'MAO Livehouse', price: 220, label: 'Live现场(出片圣地Plus)' }],
  nana: [{ template: 'wenquan', location: '小汤山温泉', price: 400, label: '温泉局(卸妆后的娜娜)' }],
  luna: [{ template: 'livehouse', location: '糖果Livehouse', price: 260, label: '现场(她青春的BGM)' }],
  jingjing: [{ template: 'mishi', location: '南锣鼓巷惊悚密室', price: 160, label: '密室逃脱(大妞胆大)' }],
  linyi: [{ template: 'wenquan', location: '延庆温泉度假村', price: 520, label: '温泉(她难得的休假)' }],
  vv: [{ template: 'livehouse', location: '通利福尼亚地下现场', price: 150, label: '地下现场(她的主场)' }],
  beibei: [{ template: 'wenquan', location: '古北水镇温泉', price: 800, label: '温泉度假(仪式感拉满)' }],
  coco: [{ template: 'mishi', location: '三里屯恐怖密室', price: 200, label: '恐怖密室(黑暗里的规则)' }],
  xiaolu: [{ template: 'mishi', location: '中关村机械密室', price: 180, label: '硬核密室(主播级操作)' }],
  // —— 女版(他们)——
  ligong: [{ template: 'mishi', location: '中关村硬核解谜密室', price: 140, label: '解谜密室(工程师的浪漫)' }],
  kevin: [{ template: 'wenquan', location: '健身房顶层汤池', price: 300, label: '汤泉放松(教练的恢复日)' }],
  chenyu: [{ template: 'livehouse', location: '胡同小院弹唱夜', price: 120, label: '弹唱夜(主理人串场)' }],
  alex: [{ template: 'wenquan', location: '金融街酒店SPA', price: 700, label: '高端SPA(卸下西装)' }],
  zhouzheng: [{ template: 'mishi', location: '谍战主题密室', price: 130, label: '谍战密室(体制内的快乐)' }],
  erhuange: [{ template: 'wenquan', location: '小汤山老牌温泉', price: 350, label: '温泉(收租人的养生局)' }],
  laopao: [{ template: 'livehouse', location: '他乐队的专场', price: 100, label: 'TA的专场(第一排留给你)' }],
  henry: [{ template: 'livehouse', location: '三里屯爵士现场', price: 380, label: '爵士现场(海归的乡愁)' }],
  dayong: [{ template: 'mishi', location: '烈火主题密室', price: 150, label: '密室(他全程职业本能)' }],
  abao: [{ template: 'livehouse', location: '阿豹打碟的Club', price: 180, label: 'TA的场子(打碟之夜)' }],
  laomo: [{ template: 'mishi', location: '影视基地沉浸密室', price: 260, label: '沉浸密室(老莫点评运镜)' }],
  guyi: [{ template: 'mishi', location: '民国戏中戏密室', price: 170, label: '戏中戏密室(他飙演技)' }],
}

// ============ 说话风格偏好(frame=吃框架逻辑 / flatter=吃谄媚彩虹屁 / 不配=两不吃) ============
export const STYLE_PREFS: Record<string, StyleId> = {
  // —— 男版 ——
  linda: 'frame', // 外企精英,吃结构化表达
  yutong: 'frame', // 体制内,欣赏有条理的靠谱
  linyi: 'frame', // 医生,逻辑控
  coco: 'frame', // 只对聪明人有兴趣
  cici: 'flatter', // 博主,彩虹屁是刚需
  nana: 'flatter', // 酒桌女王,会来事的吃香
  luna: 'flatter', // 追星女,夸就完了
  beibei: 'flatter', // SKP猎人,吃捧
  xiaolu: 'flatter', // 主播,礼物和彩虹屁一个性质
  // xiaoman/jingjing/vv:文艺/直爽/亚逼,框架嫌你官腔,谄媚嫌你油——两不吃
  // —— 女版 ——
  ligong: 'frame', // 程序员,逻辑闭环
  alex: 'frame', // 金融,尽调式表达
  zhouzheng: 'frame', // 体制内,讲话要有条理
  chenyu: 'frame', // 主理人,吃有见地的表达
  kevin: 'flatter', // 销售出身,同行认同式吹捧
  erhuange: 'flatter', // 爷就爱听舒坦话
  henry: 'flatter', // 精英的虚荣心,吃捧
  laomo: 'flatter', // 制片人,商业互吹是母语
  guyi: 'flatter', // 小演员,被夸信念感会当真
  // laopao/dayong/abao:老炮/憨直/地下,两不吃
}

// ============ 看法题角色定制反应 ============
export const OPINION_REACTS: Record<string, { good?: string[]; bad?: string[] }> = {
  // —— 男版 ——
  linda: {
    good: ['「Exactly!这个 point 我们 align 了。」她难得没夹英文地补了句:说得真好。', '「你这个思路,过会儿我要写进我的 memo 里。」'],
    bad: ['「Interesting……」她端起咖啡,这个词在外企的意思是「不敢苟同」。', '「我们可能不在一个 page 上。」'],
  },
  xiaoman: {
    good: ['「你这句话,像一行没写坏的诗。」', '「难得,有人不用大词也能说清楚一件事。」'],
    bad: ['「……好功利的说法。」她把杯子转了半圈,「这个话题到此为止吧。」', '她没接话,拍了拍不存在的灰。'],
  },
  yutong: {
    good: ['「相亲相了三十多场,第一次有人这么说。」她认真看了你一眼。', '「这个答案,我妈不会满意,但我很满意。」'],
    bad: ['「嗯,你和我相亲对象们说得一样。」这不是夸奖。', '「……好的,收到。」体制内味儿的句号。'],
  },
  cici: {
    good: ['「等等,这句我要记进备忘录,下条笔记的标题有了!」', '「你的观点比我评论区高赞还清醒。」'],
    bad: ['「这个说法,数据不会好的。」她职业性地摇头。', '「嗯……你这条,我不会点赞。」'],
  },
  nana: {
    good: ['「哟,清醒人。」她举杯轻碰了一下你的杯沿,「这句话值一杯。」', '「行啊,你这话说得比我喝过的酒都顺。」'],
    bad: ['「无聊。」她打了个哈欠,毫不掩饰。', '「这话你留着酒桌上说吧,那儿的人爱听。」'],
  },
  luna: {
    good: ['「啊啊啊你懂!你真的懂!」她激动得连发三个表情包。', '「这段发言,值得打投。」'],
    bad: ['「……你这话跟黑子说得一样。」气氛冷了半度。', '「哦。」一个字,礼貌又疏远,像对待路人粉。'],
  },
  jingjing: {
    good: ['「痛快!我就爱听实在话!」她一拍大腿。', '「成,这话敞亮,我认。」',],
    bad: ['「你这话怎么拐着弯儿的,累不累?」', '「得,又一个装的。」她撇撇嘴。'],
  },
  linyi: {
    good: ['「这个观点……很健康。」她笑了,「职业习惯,别介意。」', '「你这么想挺好的,比我们科室的人通透。」'],
    bad: ['「从循证的角度,我持保留意见。」', '「嗯。」她看了眼手机,像在等一个会诊电话。'],
  },
  vv: {
    good: ['「哇哦。」她挑了挑眉,「难得,一个不无聊的大人。」', '「这句话很朋克,我收了。」'],
    bad: ['「好主流的发言。」她转着唇钉,兴致缺缺。', '「你这话,美术馆门口的大爷都说腻了。」'],
  },
  beibei: {
    good: ['「你这个人,说话还挺有质感的。」她重新打量了你一下。', '「这句话,比昨天有人送我的花有诚意。」'],
    bad: ['「……穷酸味有点重了哈。」她笑得礼貌。', '「这话在SKP说出来,是要被保安请出去的。」'],
  },
  coco: {
    good: ['「有意思。」她眯起眼,「你比看起来危险。」', '「这个答案,及格了。今晚的游戏继续。」'],
    bad: ['「无趣是原罪。」她看向别处。', '「下一题。」她懒得纠缠。'],
  },
  xiaolu: {
    good: ['「666,这波观点输出我给满分!」下一秒她小声说:是真的好。', '「弹幕要是听到这句,得刷爆。」'],
    bad: ['「啊这……」她播了这么多年,第一次卡壳。', '「这发言,搁我直播间要被节奏了。」'],
  },
  // —— 女版 ——
  ligong: {
    good: ['「逻辑闭环了。」他点点头,「你这个想法可以直接进技术评审。」', '「有道理,我更新一下我的世界观参数。」'],
    bad: ['「这个说法有个 bug。」他推了推眼镜,开始沉默地debug你。', '「嗯……需求不明确,暂不排期。」'],
  },
  kevin: {
    good: ['「哇,这个认知水平,练什么都快。」他笑得牙很白。', '「说得好!今天这句话免费,不算课时。」'],
    bad: ['「呃……我们换组动作,啊不,换个话题。」', '「这个观念有点伤腰,啊不,伤感情。」'],
  },
  chenyu: {
    good: ['「就是这个味儿。」他给你续了杯手冲,「这句话配得上今天的豆子。」', '「你这个说法,很有生活方式。」'],
    bad: ['「唔……」他擦着杯子,「每种活法都值得尊重吧。」翻译:不认同。', '「这话有点连锁店。」这是主理人最重的批评。'],
  },
  alex: {
    good: ['「Sharp。」他难得从疲惫里抬起眼,「你这话像一份干净的尽调报告。」', '「说得好,这轮我买单——今天第一次心甘情愿。」'],
    bad: ['「Well……」他转着袖扣,「市场不会同意你的看法。」', '「这个观点,风控过不了。」'],
  },
  zhouzheng: {
    good: ['「这个认识很端正。」他郑重地点头,像在给你的档案盖章。', '「不错,家里人听了也会满意的。」'],
    bad: ['「这个说法,不太妥当吧。」他眉头的褶子加深了一档。', '「年轻人,思想要稳。」'],
  },
  erhuange: {
    good: ['「哎哟,有点东西。」他掀开茶杯盖吹了吹,「这话跟我想一块儿去了。」', '「成,这话我给你记功德簿上。」'],
    bad: ['「至于么。」他慢悠悠靠回椅背,「累不累啊你们这些卷的。」', '「喝茶喝茶。」他岔开了话题。'],
  },
  laopao: {
    good: ['「这句词儿好,别浪费——」他真的掏出手机记进了歌词备忘录。', '「你这话,比我们贝斯手一年说的都真。」'],
    bad: ['「这话太商业了。」他拨了个闷和弦。', '「下一题吧,这题我怕我说脏话。」'],
  },
  henry: {
    good: ['「Fair point。」他难得没有反驳,「你的思路很 refreshing。」', '「这句话,哥大的教授听了也会点头。」'],
    bad: ['「Hmm, interesting take……」他笑容标准,眼神已经飘向了酒单。', '「国内的语境,确实不一样。」'],
  },
  dayong: {
    good: ['「对!就是这个理儿!」他一激动嗓门大了,又不好意思地压低,「说得真好。」', '「你这话,比我们指导员讲得明白。」'],
    bad: ['「啊……这样啊。」他挠了挠头,不会接了。', '「俺觉得吧……算了,你说得也有道理。」他明显不同意但不吵架。'],
  },
  abao: {
    good: ['「这句话的BPM对了。」他难得摘下一只耳机,「继续说。」', '「哟,人间清醒混进来了。」'],
    bad: ['「太吵了,你这个观点。」说这话时他正站在音响旁边。', '他没说话,把耳机又戴上了半只。'],
  },
  laomo: {
    good: ['「好!这个洞察,值一个署名!」他兴奋地比了个取景框,「你进过组吧?」', '「这句话我要写进下个本子的台词里,版权费回头谈。」'],
    bad: ['「嗯……这个想法,过不了审。」', '「咱们这个项目,啊不,这个话题,先搁置。」'],
  },
  guyi: {
    good: ['「你这句话,比我背过的所有台词都像真话。」', '「说得好。这段要是拍下来,能过审能爆。」'],
    bad: ['「……嗯,导演也常这么说。」他笑得有点勉强。', '「这话我接不住,NG了,重来吧。」'],
  },
}

// ============ 专属话题扩充(第一批) ============
export const EXTRA_TOPICS: Record<string, Script[]> = {
  cici: [
    chat('cc_t4', [
      node('a', [
        npc('「气炸了。有个同行,像素级抄我的排版、文案、连滤镜参数都扒。」'),
        npc('「粉丝还比我多。你说,我该挂她吗?」'),
      ], {
        choices: [
          { text: '回:别挂。你去做她抄不了的东西——你的审美在前面,她永远在你身后', effects: { favor: 12, npcFlags: ['deep_talk'] }, danmaku: ['#smart'], goto: 'b1' },
          { text: '回:挂!舆论战我帮你打,小号我都注册好了', effects: { favor: 6 }, goto: 'b2' },
          { text: '回:说明你有商业价值了,被抄是行业认证', effects: { favor: -6 }, goto: 'b3' },
        ],
      }),
      node('b1', [npc('「她永远在我身后……」'), npc('「行,这条挂人小作文我删了。你这句话比赢了更解气。」')], { end: true }),
      node('b2', [npc('「哈哈哈哈你怎么比我还上头!」'), npc('「算了算了,看你这么护着我,气消一半了。」')], { end: true }),
      node('b3', [npc('「行业认证?」'), npc('「我的心血成了她的认证。你们说风凉话都不打草稿的。」')], { end: true }),
    ]),
  ],
  linda: [
    chat('ld_t4', [
      node('a', [
        npc('「刚开完晋升答辩。评委问我:你的长期规划是什么。」'),
        npc('「我说了五年路线图,说得滴水不漏。走出会议室才想起来,里面没有一件是我想做的事。」'),
      ], {
        choices: [
          { text: '问:那有没有哪怕一件,是你想做的?现在说给我听', effects: { favor: 12, npcFlags: ['deep_talk'], care: true }, goto: 'b1' },
          { text: '回:成年人的规划本来就是给评委看的,你已经赢了', effects: { favor: 4 }, goto: 'b2' },
          { text: '回:凡尔赛了,先恭喜晋升', effects: { favor: -5 }, goto: 'b3' },
        ],
      }),
      node('b1', [npc('「我想做……」她停顿了很久。「开一家很小的书店,不赚钱的那种。」'), npc('「这话我从没跟人说过,说出来好像也没那么可笑。」')], { end: true }),
      node('b2', [npc('「赢。」她重复了一遍这个字,「对,按 KPI,我赢了。」'), nar('她没再说下去。')], { end: true }),
      node('b3', [npc('「谢谢。」'), nar('她收起了刚才那一点点裂缝,又变回了国贸Linda。')], { end: true }),
    ]),
  ],
  yutong: [
    chat('yt_t4', [
      node('a', [
        npc('「我妈今天又给我排了两场相亲,周六上午一场下午一场。」'),
        npc('「她说效率高。我感觉自己像个待办事项。」'),
      ], {
        choices: [
          { text: '回:那周六晚上归我——不谈条件,不看简历,就吃点好的', effects: { favor: 11, npcFlags: ['tension'] }, danmaku: ['#win'], goto: 'b1' },
          { text: '回:去呗,就当收集素材,回头讲给我听', effects: { favor: 5 }, goto: 'b2' },
          { text: '回:你妈也是为你好,理解一下', effects: { favor: -6 }, goto: 'b3' },
        ],
      }),
      node('b1', [npc('「……不看简历?」'), npc('「好啊。那你可别迟到,我周六晚上,只有这一场是想去的。」')], { end: true }),
      node('b2', [npc('「哈哈,行,那我给你带一手相亲市场情报。」'), npc('「不过你就不怕,哪场我看对眼了?」')], { end: true }),
      node('b3', [npc('「嗯,都为我好。」'), nar('她回得很快,快得像在相亲桌上背标准答案。')], { end: true }),
    ]),
  ],
  xiaoman: [
    chat('xm_t4', [
      node('a', [
        npc('「今天整理旧物,翻出一沓大学时的手写信。那时候我们宿舍流行写信,写完走两层楼递过去。」'),
        npc('「现在谁还写信啊。你最后一次手写东西,是什么时候?」'),
      ], {
        choices: [
          { text: '认真想了想,回:体检表上的签名。……听起来好惨,要不你教我写信?', effects: { favor: 10, npcFlags: ['deep_talk'] }, goto: 'b1' },
          { text: '回:写信太低效了,语音它不香吗', effects: { favor: -7 }, goto: 'b2' },
          { text: '回:等着。(三天后,她真的收到了你的一封手写信)', effects: { favor: 13, wallet: -10 }, danmaku: ['#simp'], goto: 'b3' },
        ],
      }),
      node('b1', [npc('「哈哈哈体检签名!」'), npc('「好啊,第一课:字丑不要紧,要紧的是,写的时候只想着一个人。」')], { end: true }),
      node('b2', [npc('「效率。」'), nar('她把这两个字放在嘴里,像尝到了一粒沙子。')], { end: true }),
      node('b3', [npc('「你疯了吧,真写啊?!」'), nar('她的语气是嫌弃的,但那封信后来被她夹进了最喜欢的那本诗集里。'), npc('「字是真丑。信,我收下了。」')], { end: true }),
    ]),
  ],
  kevin: [
    chat('kv_t4', [
      node('a', [
        npc('「问你个事,你实话实说。」'),
        npc('「外面都传我是海王,课卖得好全靠撩。你……也这么觉得?」'),
        nar('他很少用这种语气说话,像卸了杠铃片。'),
      ], {
        choices: [
          { text: '实话实说:我观察过——你对谁都热,但没对谁都真。真不真,我自己会判断', effects: { favor: 12, npcFlags: ['deep_talk'] }, danmaku: ['#smart'], goto: 'b1' },
          { text: '打趣:海王怕什么,我水性好', effects: { favor: 6 }, goto: 'b2' },
          { text: '回:无风不起浪吧', effects: { favor: -8, mine: true }, goto: 'b3' },
        ],
      }),
      node('b1', [npc('「……你是第一个说要自己判断的。」'), npc('「别人都是听传闻下结论。行,那你慢慢判断,我等得起。」')], { end: true }),
      node('b2', [npc('「哈哈哈哈水性好!」'), npc('「行,那你可得游快点,别被别的鱼截胡。」'), nar('玩笑归玩笑,他眼里那点认真,一闪而过。')], { end: true }),
      node('b3', [npc('「嗯,无风不起浪。」'), npc('「那你还坐在这儿跟浪聊天呢?」他笑着,笑意没到眼睛。')], { end: true }),
    ]),
  ],
  guyi: [
    chat('gy_t4', [
      node('a', [
        npc('「今天试镜又被刷了。导演说我「没有记忆点」。」'),
        npc('「跑了十年龙套,我演过尸体、路人甲、反派小弟B……你说,人是不是真有天赋这回事?」'),
      ], {
        choices: [
          { text: '回:十年还在跑,这件事本身就是记忆点。天赋会迟到,但你没退场', effects: { favor: 12, npcFlags: ['deep_talk'], care: true }, danmaku: ['#simp'], goto: 'b1' },
          { text: '回:要不……考虑转行?十年也算给过机会了', effects: { favor: -7 }, goto: 'b2' },
          { text: '回:发我一段你觉得演得最好的,我当第一个观众', effects: { favor: 10, care: true }, goto: 'b3' },
        ],
      }),
      node('b1', [npc('「没退场……」'), npc('「哈,你这句比我背过的任何台词都燃。行,明天继续跑组。」')], { end: true }),
      node('b2', [npc('「转行。」他笑了笑,「你知道吗,这两个字我听了十年,每次都像杀青。」'), nar('他没生气,但也没再说话。')], { end: true }),
      node('b3', [npc('「真的假的?!等着!」'), nar('他发来一段37秒的视频:某部剧里,他演一个战死的士兵,只有一个镜头。你看了三遍。'), npc('「导演说这条过了的时候,我在片场哭了。别笑我。」')], { end: true }),
    ]),
  ],
  dayong: [
    chat('dy_t4', [
      node('a', [
        npc('「刚出完警回来。一只猫困在配电箱里,后来没事了。」'),
        npc('「就是猫主人非要给我塞锦旗……为一只猫做锦旗,哈哈,俺们队长都乐了。」'),
      ], {
        choices: [
          { text: '回:该做!救猫和救人用的是同一份勇敢。锦旗拍给我看看?', effects: { favor: 11, care: true }, goto: 'b1' },
          { text: '回:下次出警注意安全,平安回来比什么都强', effects: { favor: 9, care: true }, goto: 'b2' },
          { text: '回:一只猫也要出警?这也太浪费警力了', effects: { favor: -8, mine: true }, goto: 'b3' },
        ],
      }),
      node('b1', [npc('(他发来锦旗照片:「火速救喵 恩重如山」)'), npc('「哈哈哈哈你看这八个字,俺们中队笑了一天。」'), nar('照片角落里,他笑得一脸憨。')], { end: true }),
      node('b2', [npc('「……哎。」'), npc('「你是第一个先说「平安回来」的。俺记下了。」'), nar('笨嘴拙舌的人,把感动全存在心里。')], { end: true }),
      node('b3', [npc('「困住的时候,它也很害怕啊。」'), npc('「再小的求救,俺们也得接。这是规矩。」'), nar('他说得很认真,认真到你有点惭愧。')], { end: true }),
    ]),
  ],
  alex: [
    chat('ax_t4', [
      node('a', [
        npc('「昨晚应酬,我在洗手间吐完,漱了口,回包间继续举杯。」'),
        npc('「敬酒词说得比谁都漂亮。你说,我这算敬业,还是算完了?」'),
      ], {
        choices: [
          { text: '回:算求救。这条消息就是证据——下次撑不住,提前发给我,我打电话捞你', effects: { favor: 12, npcFlags: ['deep_talk'], care: true }, danmaku: ['#simp'], goto: 'b1' },
          { text: '回:干这行都这样,习惯就好', effects: { favor: -6 }, goto: 'b2' },
          { text: '回:教你个技巧,茶水换酒,我帮你挡', effects: { favor: 8 }, goto: 'b3' },
        ],
      }),
      node('b1', [npc('「……捞我?」'), npc('「成交。下次饭局你就是我的『重要客户来电』。这个 deal,我签了。」')], { end: true }),
      node('b2', [npc('「对,都这样。」'), npc('「所以这行的人,胃和心,总有一个先坏。」他笑了笑,没再说。')], { end: true }),
      node('b3', [npc('「挡酒?你舍得?」'), npc('「哈,那下次带你见识见识什么叫金融圈酒局。丑话说前面,阵亡不管埋。」')], { end: true }),
    ]),
  ],
}
