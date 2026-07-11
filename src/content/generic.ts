import { Script } from '@/engine/types'
import { chat, me, nar, node, npc, sys } from './util'

/**
 * 公用剧情池:中性文案,同版本任何角色可复用。
 * - GENERIC_CHATS:话题池耗尽后的日常闲聊(小幅好感,care 选项供「摆烂中」翻倍)
 * - SPICY_CHATS:擦边池(SFW,暧昧张力,不涉黄),按角色 spicy 系数概率插入
 * - INTERLUDES:约会小插曲,随机注入约会模板开头
 */
export const GENERIC_CHATS: Script[] = [
  chat('g_tongqin', [
    node('a', [npc('今天地铁13号线又限流了,我在西二旗站排了二十分钟,人贴人。')], {
      choices: [
        { text: '回:辛苦了,晚上吃点好的犒劳自己,想吃什么我请', effects: { favor: 5, care: true }, goto: 'b' },
        { text: '回:建议卷个早高峰错峰通勤攻略,发小蓝书还能涨粉', effects: { favor: 3 }, goto: 'b' },
        { text: '回:哈哈哈', effects: { favor: -2, saying: 'hhh' }, goto: 'c' },
      ],
    }),
    node('b', [npc('你还挺会接话的嘛。行,记下了,你说的。')], { end: true }),
    node('c', [npc('嗯。'), nar('对话结束得像早高峰的地铁门,毫不留情。')], { end: true }),
  ]),
  chat('g_waimai', [
    node('a', [npc('纠结中:麻辣烫还是轻食?你帮我选。')], {
      choices: [
        { text: '回:麻辣烫。快乐是刚需,沙拉是刑罚', effects: { favor: 4 }, goto: 'b' },
        { text: '回:都行,随便,你定就好', effects: { favor: -3, saying: 'suibian' }, goto: 'c' },
        { text: '回:今天降温,吃麻辣烫,多加点丸子,注意保暖', effects: { favor: 5, care: true }, goto: 'b' },
        {
          text: '回:决策树帮你画好了:预算、热量、幸福感三个维度,麻辣烫两票胜出',
          effects: { favor: 4, style: 'frame' },
          showIf: 'edu:gaozhi',
          goto: 'b',
        },
        {
          text: '回:你这身材吃啥都不怕,想吃麻辣烫就吃,人生苦短,你值得',
          effects: { favor: 4, style: 'flatter' },
          showIf: 'edu:shehui',
          goto: 'b',
        },
      ],
    }),
    node('b', [npc('好!就这么定了。有决断力的人真的很难得。')], { end: true }),
    node('c', [npc('……好吧,那我自己纠结。'), nar('你仿佛听到了好感度漏气的声音。')], { end: true }),
  ]),
  chat('g_emo', [
    node('a', [npc('凌晨的北京好安静啊。有时候会突然不知道自己留在这里图什么。')], {
      choices: [
        { text: '认真打一大段:图什么不重要,你已经比大多数人勇敢了', effects: { favor: 6, care: true, tone: 'zhiqiu' }, danmaku: ['#simp'], goto: 'b' },
        { text: '回:图工资啊,还能图什么(配狗头)', effects: { favor: 1 }, goto: 'c' },
        { text: '回:早点睡,别想那么多', effects: { favor: -2, saying: 'zaoshui' }, goto: 'c' },
      ],
    }),
    node('b', [npc('……谢谢你。这句话我截图了。'), nar('凌晨的北京,有人因为你的一段话没那么孤独了。')], { end: true }),
    node('c', [npc('嗯,也是。晚安吧。')], { end: true }),
  ]),
  chat('g_zhoumo', [
    node('a', [npc('周末你一般干嘛?我感觉我的周末就是躺着刷手机,然后忽然天就黑了。')], {
      choices: [
        { text: '回:一样,躺到愧疚,愧疚到继续躺', effects: { favor: 4 }, goto: 'b' },
        { text: '回:健身、看展、学习。时间不能浪费', effects: { favor: 2 }, goto: 'c' },
        { text: '回:下个周末别躺了,出来,我带你玩点新鲜的', effects: { favor: 5, tone: 'liao' }, goto: 'd' },
        { text: '回:说实话,我周末挺无聊的。你要不要出来?我想见你', effects: { favor: 5, tone: 'zhiqiu' }, goto: 'e' },
      ],
    }),
    node('b', [npc('哈哈哈哈是同一款废物没错了。莫名安心。')], { end: true }),
    node('c', [npc('好自律……跟你比我像个废人。'), nar('TA的语气里有敬佩,也有一丝距离感。')], { end: true }),
    node('d', [npc('哦?口气不小,那我等着。')], { end: true }),
    node('e', [npc('……这么直接的吗。'), nar('「对方正在输入」持续了很久,最后只回来一个字:「好。」')], { end: true }),
  ]),
  chat('g_jiafang', [
    node('a', [npc('甲方第八次改需求了,原话:「要五彩斑斓的黑,但要低调」。我现在血压180。')], {
      choices: [
        { text: '回:把这句话裱起来,以后开设计博物馆用得上', effects: { favor: 6 }, goto: 'b' },
        { text: '回:深呼吸,骂归骂,钱照收。你是专业的', effects: { favor: 5, care: true }, goto: 'b' },
        { text: '回:甲方也不容易,互相理解一下', effects: { favor: -4 }, goto: 'c' },
        { text: '同行会心一击:我上周的需求是「要年轻化但不能幼稚」。交换一下甲方黑名单?', effects: { favor: 8 }, showIf: 'prof:xinmeiti', danmaku: ['#smart'], goto: 'd' },
      ],
    }),
    node('b', [npc('哈哈哈哈好,聊完这几句血压降了20。你是我的电子降压药。')], { end: true }),
    node('c', [npc('……你是甲方派来的吧。'), nar('你成功地站在了统一战线的对面。')], { end: true }),
    node('d', [npc('?!你也是干这行的?!'), npc('来,拉个「甲方受害者互助群」,就咱俩,群名我都想好了:《血压支撑联盟》。')], { end: true }),
  ]),
  chat('g_pinhaofan', [
    node('a', [npc('坦白:我刚才点了个拼好饭,和陌生人拼的,便宜八块。你会瞧不起我吗,哈哈。')], {
      choices: [
        { text: '回:瞧不起?我拼好饭都是拼两份,一份当宵夜', effects: { favor: 6 }, goto: 'b' },
        { text: '回:省下的八块钱是你对抗北京的方式,很酷', effects: { favor: 5 }, goto: 'b' },
        { text: '回:啊?这也太抠了吧', effects: { favor: -5, mine: true }, goto: 'c' },
      ],
    }),
    node('b', [npc('哈哈哈哈懂的都懂!下次拼单捎你一份?')], { end: true }),
    node('c', [npc('……行吧,可能我们的消费观不太一样。')], { end: true }),
  ]),
  chat('g_zufang', [
    node('a', [npc('我房东刚通知我,下季度涨租500。理由是「小区门口新开了家山姆」。')], {
      choices: [
        { text: '回:离谱,山姆又不是他开的。需要我帮你查查周边房源吗', effects: { favor: 6, care: true }, goto: 'b' },
        { text: '回:建议反问他:那我坐地铁去山姆,是不是该地铁给我发工资', effects: { favor: 7 }, danmaku: ['#smart'], goto: 'b' },
        { text: '回:正常,北京租房就这样,习惯就好', effects: { favor: -3 }, goto: 'c' },
      ],
    }),
    node('b', [npc('哈哈哈哈笑死,好,这句我原封不动发给他。')], { end: true }),
    node('c', [npc('嗯。习惯就好。'), nar('这五个字像一盆温吞水,浇灭了吐槽的兴致。')], { end: true }),
  ]),
  chat('g_nianhui', [
    node('a', [npc('公司年会抽奖,特等奖是「和CEO共进午餐」。全场如丧考妣,中奖那哥们当场表演了一个笑容消失。')], {
      choices: [
        { text: '回:建议他把奖转卖闲鱼,标价「无价之宝,亏本出」', effects: { favor: 7 }, goto: 'b' },
        { text: '回:哈哈哈哈哈', effects: { favor: -2, saying: 'hhh' }, goto: 'c' },
        { text: '回:那你们年会有真奖品吗?我抽中过一箱抽纸', effects: { favor: 4 }, goto: 'b' },
      ],
    }),
    node('b', [npc('哈哈哈你怎么这么损,我喜欢。')], { end: true }),
    node('c', [npc('……就这?'), nar('五个哈,被判定为已读乱回。')], { end: true }),
  ]),
  chat('g_jianshenka', [
    node('a', [npc('我的健身卡到期了。全年去了四次,平均一次1200块。教练今天还给我发「想你了」。')], {
      choices: [
        { text: '回:他想的不是你,是你的续卡提成,清醒一点', effects: { favor: 6 }, goto: 'b' },
        { text: '回:四次不少了!有的人办卡之后连门都没进过,比如我', effects: { favor: 5 }, goto: 'b' },
        { text: '回:身体是革命的本钱,建议续卡并坚持', effects: { favor: -3 }, goto: 'c' },
      ],
    }),
    node('b', [npc('哈哈哈哈你这么一说我就不焦虑了。摆烂使人快乐。')], { end: true }),
    node('c', [npc('……你和我教练是一伙的吧。')], { end: true }),
  ]),
  chat('g_guahao', [
    node('a', [npc('挂个协和的号,拼手速拼到凌晨,恍惚间以为自己在抢周杰伦演唱会。')], {
      choices: [
        { text: '回:抢到了吗?没抢到我帮你一起蹲,四只手总比两只快', effects: { favor: 7, care: true }, goto: 'b' },
        { text: '回:身体要紧,是哪里不舒服?', effects: { favor: 5, care: true }, goto: 'c' },
        { text: '回:多喝热水,可能就好了', effects: { favor: -3, saying: 'water' }, goto: 'd' },
        { text: '亮明身份:我就是干这行的。挂号有窍门,放号时间我发你,别熬夜硬抢', effects: { favor: 9, care: true }, showIf: 'prof:hushi', danmaku: ['#smart'], goto: 'e' },
      ],
    }),
    node('b', [npc('抢到了!但你这句话我记下了。关键时刻愿意出手速的,都是真朋友。')], { end: true }),
    node('c', [npc('没大事,老毛病。就是……你是第一个问「哪里不舒服」而不是「挂哪个科」的人。')], { end: true }),
    node('d', [npc('好的,热水。'), nar('对话像病历本一样被合上了。')], { end: true }),
    node('e', [npc('?!行业内部人士!'), npc('这条人脉我先存了。以后我的健康,承包给你了哈。'), nar('「承包」这个词,TA用得毫不见外。')], { end: true }),
  ]),
  chat('g_yunyang', [
    node('a', [npc('我在云养一只流浪猫,楼下车棚的,叫煤球。今天它带了个朋友来吃饭,我粮预算超支了。')], {
      choices: [
        { text: '回:恭喜煤球喜提编制,新来的算试用期。猫粮我赞助一包', effects: { favor: 8, care: true }, goto: 'b' },
        { text: '回:小心,猫是会口口相传的,下个月你会拥有一个车棚猫协会', effects: { favor: 6 }, goto: 'b' },
        { text: '回:流浪猫别乱喂,有病菌', effects: { favor: -4 }, goto: 'c' },
      ],
    }),
    node('b', [npc('哈哈哈哈「喜提编制」!行,以后你就是煤球的干爹/干妈了,有探视权。')], { end: true }),
    node('c', [npc('……哦,好吧。'), nar('煤球在你看不见的地方,记了你一笔。')], { end: true }),
  ]),
  chat('g_ditie', [
    node('a', [npc('刚在地铁上给一个大爷让座,大爷说「谢谢,不过我下一站就下」,然后我们尴尬地对视了四站。')], {
      choices: [
        { text: '回:这是北京地铁经典剧目《让与不让》,你演得很好', effects: { favor: 6 }, goto: 'b' },
        { text: '回:下次让座后立刻闭眼假睡,专业的', effects: { favor: 5 }, goto: 'b' },
        { text: '回:emmm', effects: { favor: -3, saying: 'emmm' }, goto: 'c' },
      ],
    }),
    node('b', [npc('哈哈哈哈哈你怎么什么都能接住,跟你聊天好解压。')], { end: true }),
    node('c', [npc('……好吧,可能不好笑。'), nar('分享欲被一个「emmm」轻轻掐灭了。')], { end: true }),
  ]),
  chat('g_kuaidi', [
    node('a', [npc('我的快递显示「已签收」,签收人写的是「门口消防栓」。北京的消防栓可真是干大事的。')], {
      choices: [
        { text: '回:建议给消防栓发个年度优秀员工,毕竟它从不下班', effects: { favor: 6 }, goto: 'b' },
        { text: '回:去看看还在不在?不在我陪你打客服电话,我吵架很强的', effects: { favor: 7, care: true }, goto: 'b' },
        { text: '回:正常操作,见怪不怪', effects: { favor: -2 }, goto: 'c' },
      ],
    }),
    node('b', [npc('在的在的,消防栓很敬业。不过「我吵架很强的」这句,我先存着,以后有用。')], { end: true }),
    node('c', [npc('嗯,也是。')], { end: true }),
  ]),
  chat('g_tuofa', [
    node('a', [npc('洗头的时候掉了一把头发。我算了下,按这个速度,我的发际线撑不到房贷还完。')], {
      choices: [
        { text: '回:没事,等你还完房贷,就有钱植发了,闭环了', effects: { favor: 6 }, goto: 'b' },
        { text: '回:掉发说明脑子在高速运转,你是用头发换智慧', effects: { favor: 5 }, goto: 'b' },
        { text: '回:建议早点睡,少熬夜', effects: { favor: -2, saying: 'zaoshui' }, goto: 'c' },
      ],
    }),
    node('b', [npc('哈哈哈哈「闭环了」,你真的很适合来我们公司写周报。')], { end: true }),
    node('c', [npc('好的,谢谢建议。'), nar('你成功把一场吐槽,聊成了一次体检报告解读。')], { end: true }),
  ]),
  chat('g_xiaoyuan', [
    node('a', [npc('路过一所大学,看见新生军训。突然意识到我大一居然是十年前的事了,恐怖故事。')], {
      choices: [
        { text: '回:更恐怖的是,他们眼里我们就是「叔叔阿姨」', effects: { favor: 5 }, goto: 'b' },
        { text: '回:十年前的你在干嘛?讲讲,我想听', effects: { favor: 7, care: true }, goto: 'c' },
        { text: '回:所以要抓紧时间,三十岁前完成人生大事', effects: { favor: -3 }, goto: 'd' },
      ],
    }),
    node('b', [npc('住嘴!!我还是个宝宝!!(一个衰老的宝宝)')], { end: true }),
    node('c', [npc('十年前啊……在校门口吃三块五的煎饼,觉得日子会一直那样。'), npc('好久没人问过我这种问题了。谢谢你想听。')], { end: true }),
    node('d', [npc('……你和我妈可真聊得来。'), nar('话题像被KPI追赶,失去了原本的月光。')], { end: true }),
  ]),
  chat('g_yeman', [
    node('a', [npc('加完班,写字楼电梯里只有我一个人。镜子里那张脸憔悴得我都想给它转五十块钱。')], {
      choices: [
        { text: '回:转一百吧,里面那位还欠着房租呢', effects: { favor: 6 }, goto: 'b' },
        { text: '回:发我看看?我帮你确认一下,顺便看看你', effects: { favor: 7, tone: 'liao' }, danmaku: ['#smart'], goto: 'c' },
        { text: '回:注意休息,身体是自己的', effects: { favor: -1, saying: 'water' }, goto: 'd' },
      ],
    }),
    node('b', [npc('哈哈哈哈行,这五十块钱她收下了,记在你账上。')], { end: true }),
    node('c', [npc('想得美,不发。'), nar('嘴上说不发,头像却在三秒后换成了今天的自拍。')], { effects: { favor: 2 }, end: true }),
    node('d', [npc('好。'), nar('一个字,一个句号的省略版。')], { end: true }),
  ]),
]

/** 擦边池(SFW):暧昧张力,零露骨,好感≥40才可能触发 */
export const SPICY_CHATS: Script[] = [
  chat('sp_shuibuzhao', [
    node('a', [
      npc('睡不着。'),
      npc('你说,凌晨一点还在聊天的两个人,算什么关系?'),
      nar('屏幕的光落在你脸上。这个问题像一杯温过的酒。'),
    ], {
      choices: [
        { text: '回:算「都不舍得先说晚安」的关系', effects: { favor: 10, tone: 'liao', npcFlags: ['tension'] }, danmaku: ['#win'], goto: 'b' },
        { text: '回:算失眠互助小组,组长是你', effects: { favor: 5 }, goto: 'c' },
        { text: '回:算该睡觉的关系。晚安,早点睡', effects: { favor: -2, saying: 'zaoshui' }, goto: 'd' },
      ],
    }),
    node('b', [npc('……'), npc('那今晚谁先说?'), me('「都别说。」'), nar('那晚你们聊到三点。谁都没说晚安,谁都没输。')], { end: true }),
    node('c', [npc('哈哈,行,组长命令你:陪聊到两点。')], { end: true }),
    node('d', [npc('好。晚安。'), nar('有些窗户递到你面前,你亲手把它关上了。')], { end: true }),
  ]),
  chat('sp_yuyin', [
    node('a', [
      npc('(TA发来一条语音,点开,三秒的安静之后)'),
      npc('「没什么事。就是……想听听你声音。好了,听到了,挂了。」'),
      nar('语音结束了。你的心率没有。'),
    ], {
      choices: [
        { text: '直接拨语音电话过去,响一声就接通了', effects: { favor: 11, npcFlags: ['tension'] }, goto: 'b' },
        { text: '回一条同样三秒安静的语音', effects: { favor: 8 }, goto: 'c' },
        { text: '回文字:你喝多了吧,哈哈', effects: { favor: -4, saying: 'hhh' }, goto: 'd' },
      ],
    }),
    node('b', [npc('「喂?」'), me('「想听声音,不用偷偷的。」'), nar('电话那头安静了一下,然后传来了一声很轻的笑。那通电话打了四十分钟,内容全忘了,笑声都记得。')], { end: true }),
    node('c', [npc('「……你学我?」'), npc('「幼稚。」(但TA又听了三遍)')], { end: true }),
    node('d', [npc('「对,喝多了。」'), nar('TA把没说完的半句话,咽回了酒里。')], { end: true }),
  ]),
  chat('sp_chuanda', [
    node('a', [
      npc('今天买了件新衣服,有点不确定。'),
      npc('(发来一张照片:只拍到锁骨以下、袖口以上,构图刁钻,明显精心裁剪过)'),
      npc('「就问衣服,别多想。」'),
    ], {
      choices: [
        { text: '回:衣服好看。但「别多想」这三个字,让我多想了', effects: { favor: 10, tone: 'liao', npcFlags: ['tension'] }, danmaku: ['#smart'], goto: 'b' },
        { text: '认真评价衣服的版型和颜色,专业得像个买手', effects: { favor: 6 }, goto: 'c' },
        { text: '回:就这?看不清,建议拍全身', effects: { favor: -5 }, goto: 'd' },
      ],
    }),
    node('b', [npc('「……嘴挺会说啊。」'), npc('「下次见面穿给你看。就当,给你一个不用多想的机会。」')], { end: true }),
    node('c', [npc('「分析得很专业,可是……」'), npc('「算了,没什么。衣服确实不错,谢谢。」'), nar('你答对了题目,错过了题眼。')], { end: true }),
    node('d', [npc('「想得美。」'), nar('对话框安静了。有些照片是渔网,你这条鱼太莽了。')], { end: true }),
  ]),
  chat('sp_jiewen', [
    node('a', [
      npc('朋友问我,你是我什么人。'),
      npc('我说「一个朋友」。说完自己愣了一下,觉得这三个字有点亏。'),
    ], {
      choices: [
        { text: '回:那下次改口成「我的人」,试试亏不亏', effects: { favor: 11, tone: 'liao', npcFlags: ['tension'] }, danmaku: ['#win'], goto: 'b' },
        { text: '回:那你觉得,叫什么不亏?', effects: { favor: 8 }, goto: 'c' },
        { text: '回:朋友挺好的呀,朋友最长久了', effects: { favor: -6 }, goto: 'd' },
      ],
    }),
    node('b', [npc('「?!」'), npc('「……谁要当你的人,想得美。」'), nar('嘴上说不要,标点符号很诚实——那是TA今晚第一次用感叹号。')], { end: true }),
    node('c', [npc('「我要是知道,还用得着愣吗。」'), npc('「这题先欠着。你也想想。」')], { end: true }),
    node('d', [npc('「对,长久。」'), nar('「朋友」这个词,像一枚安全别针,把刚要展开的东西又别了回去。')], { end: true }),
  ]),
]

/** 约会小插曲:注入约会模板开头。终点节点 next 写 '@start',引擎替换为原剧本起点 */
export const INTERLUDES: Script[] = [
  {
    id: 'il_paidui',
    kind: 'scene',
    start: 'il_a',
    nodes: {
      il_a: {
        id: 'il_a',
        lines: [
          { who: 'nar', text: '到了地方,门口排着二十米的队。取号机吐出一张纸:前方 48 桌。' },
          { who: 'npc', text: '「48桌……要不,换一家?」' },
        ],
        choices: [
          { text: '掏出手机:我早订好位了,跟我来', effects: { favor: 9 }, danmaku: ['#smart'], goto: 'il_b' },
          { text: '提议:排着吧,正好聊天,排队也是约会的一部分', effects: { favor: 5 }, goto: 'il_c' },
        ],
      },
      il_b: { id: 'il_b', lines: [{ who: 'npc', text: '「你连这个都提前想到了?!」' }, { who: 'nar', text: '越过长队走进店里的那一刻,你的排面值肉眼可见地上涨。' }], next: '@start' },
      il_c: { id: 'il_c', lines: [{ who: 'nar', text: '你们在队伍里聊了四十分钟。后来你们都承认,那四十分钟比正餐好吃。' }], next: '@start' },
    },
  },
  {
    id: 'il_chuandan',
    kind: 'scene',
    start: 'il_a',
    nodes: {
      il_a: {
        id: 'il_a',
        lines: [
          { who: 'nar', text: '路口,一个发传单的大姐精准拦住你们:「健身游泳了解一下?情侣卡特价!」' },
          { who: 'npc', text: '「诶,她说情侣卡。」TA意味深长地看了你一眼。' },
        ],
        choices: [
          { text: '面不改色接过传单:谢谢,回头研究下「情侣」这个资格怎么申请', effects: { favor: 8 }, danmaku: ['#smart'], goto: 'il_b' },
          { text: '慌忙摆手:不不不我们不是……还没……那个……', effects: { favor: -4, awkward: 8 }, goto: 'il_c' },
        ],
      },
      il_b: { id: 'il_b', lines: [{ who: 'npc', text: '「……接得挺顺啊。」' }, { who: 'nar', text: 'TA没再说话,但把那张传单叠好放进了包里。' }], next: '@start' },
      il_c: { id: 'il_c', lines: [{ who: 'nar', text: '大姐看了看你俩,露出了阅人无数的微笑:「早晚的事。」' }, { who: 'npc', text: '「哈哈哈哈她说早晚的事。」' }], next: '@start' },
    },
  },
  {
    id: 'il_saoma',
    kind: 'scene',
    start: 'il_a',
    nodes: {
      il_a: {
        id: 'il_a',
        lines: [
          { who: 'nar', text: '坐下扫码点单,小程序要求:关注公众号、授权手机号、注册会员、领取生日礼、观看15秒广告。' },
          { who: 'npc', text: '「我就想点杯水。」' },
        ],
        choices: [
          { text: '直接喊服务员:「您好,来个纸质菜单」,一步到位', effects: { favor: 7 }, goto: 'il_b' },
          { text: '默默完成全部授权流程,并顺手领了张优惠券', effects: { favor: 4, wallet: 10 }, goto: 'il_c' },
        ],
      },
      il_b: { id: 'il_b', lines: [{ who: 'npc', text: '「爽快!我最烦扫码填一堆的了。」' }, { who: 'nar', text: '拒绝数字化压迫,是这个时代小小的英雄主义。' }], next: '@start' },
      il_c: { id: 'il_c', lines: [{ who: 'npc', text: '「……你居然真的看完了那15秒广告。」' }, { who: 'nar', text: '省下十块钱,代价是TA看你的眼神复杂了0.5秒。' }], next: '@start' },
    },
  },
  {
    id: 'il_ouyu',
    kind: 'scene',
    start: 'il_a',
    nodes: {
      il_a: {
        id: 'il_a',
        lines: [
          { who: 'nar', text: '走着走着,迎面来了个TA的熟人:「哟!这位是……?」' },
          { who: 'npc', text: 'TA顿了半秒,看向你,眼神里是一道现场考题。' },
        ],
        choices: [
          { text: '大方伸手:您好,我是TA朋友,久仰', effects: { favor: 7 }, goto: 'il_b' },
          { text: '抢答:我们在处着呢,您多关照', check: { skill: 'mouth', dc: 13, pass: 'il_c', fail: 'il_d' } },
        ],
      },
      il_b: { id: 'il_b', lines: [{ who: 'nar', text: '熟人走后,TA轻轻说:「刚才,谢谢。分寸感这个东西,很难得。」' }], next: '@start' },
      il_c: { id: 'il_c', lines: [{ who: 'npc', text: '「?!」' }, { who: 'nar', text: '熟人笑着走了。TA捶了你一下:「谁跟你处着呢!」但没有否认第二遍。' }, { who: 'sys', text: '好感悄悄+8' }], effects: { favor: 8 }, next: '@start' },
      il_d: { id: 'il_d', lines: [{ who: 'npc', text: '「他说笑呢!」TA飞快地否认,场面一度安静。' }, { who: 'nar', text: '熟人走后,你们沉默地走了半条街。' }], effects: { favor: -6, awkward: 10 }, next: '@start' },
    },
  },
  {
    id: 'il_tingche',
    kind: 'scene',
    start: 'il_a',
    nodes: {
      il_a: {
        id: 'il_a',
        lines: [
          { who: 'nar', text: '出发前你看了眼停车费:15元/小时。今天预计四小时。你默默做了个算术。' },
          { who: 'npc', text: '「怎么了?站在这看手机。」' },
        ],
        choices: [
          { text: '收起手机:没事,走,今天时间管够', effects: { wallet: -60, favor: 5 }, goto: 'il_b' },
          { text: '坦白:在算停车费。要不……我们坐地铁?环保', effects: { favor: 2 }, goto: 'il_c' },
        ],
      },
      il_b: { id: 'il_b', lines: [{ who: 'nar', text: '有些成本,成年人选择微笑着内部消化。' }], next: '@start' },
      il_c: { id: 'il_c', lines: [{ who: 'npc', text: '「哈哈哈哈你好实诚。行啊,地铁就地铁,我还省得晕车了。」' }, { who: 'nar', text: '省下的六十块,买到了一个「不装」的印象分。' }], next: '@start' },
    },
  },
  {
    id: 'il_xiayu',
    kind: 'scene',
    start: 'il_a',
    nodes: {
      il_a: {
        id: 'il_a',
        lines: [
          { who: 'nar', text: '刚碰面,天空毫无预兆地掉下雨点。北京的雨,从不打招呼。' },
          { who: 'npc', text: '「啊,下雨了!」' },
        ],
        choices: [
          { text: '从包里抽出一把伞——你出门前看过天气预报', effects: { favor: 9, care: true }, danmaku: ['#smart'], goto: 'il_b' },
          { text: '脱下外套举到TA头顶:先跑到那边屋檐下!', effects: { favor: 8 }, goto: 'il_c' },
        ],
      },
      il_b: { id: 'il_b', lines: [{ who: 'npc', text: '「你居然带伞了?!」' }, { who: 'nar', text: '一把伞下,两个人的肩膀不得不靠得很近。这是天气预报没预报的部分。' }], next: '@start' },
      il_c: { id: 'il_c', lines: [{ who: 'nar', text: '跑到屋檐下,TA看着你被淋湿的肩膀,没说话,把外套还你的时候动作很轻。' }], next: '@start' },
    },
  },
]
