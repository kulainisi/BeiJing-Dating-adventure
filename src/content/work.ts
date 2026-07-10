import { ProfId, WorkOutcome } from '@/engine/types'

/**
 * 工作事件池:按职业分池,加班时加权抽一条。
 * 收入有赚有赔(金额与该职业日薪水平挂钩),mood 默认 -5(搞钱不是零成本)。
 * 文案里的金额与 wallet 字段保持一致。
 */
export const WORK_EVENTS: Record<ProfId, WorkOutcome[]> = {
  // ============ 男版 ============
  waimai: [
    { text: '跑了一晚高峰单,准时率100%,平台奖励到手 ¥420。', wallet: 420, weight: 30 },
    { text: '暴雨天三倍补贴!你湿透了,但账户进了 ¥680。值,都值。', wallet: 680, mood: -8, weight: 18 },
    { text: '辛苦一晚,被一个「汤洒了(其实没洒)」的差评扣掉半天钱,到手只剩 ¥150。', wallet: 150, mood: -10, weight: 18 },
    { text: '拐弯避让老太太,电动车滑了,三份餐全洒。照价赔 ¥260,膝盖也蹭破了。', wallet: -260, mood: -12, awkward: 5, weight: 14 },
    { text: '老顾客认出了你,塞给你一瓶水,还在平台打赏了。今晚 ¥520,心是热的。', wallet: 520, mood: 4, weight: 18 },
  ],
  zhuangxiu: [
    { text: '贴完一面墙的砖,活漂亮,业主现结 ¥650。', wallet: 650, weight: 30 },
    { text: '业主要赶工期,连夜双倍。腰快断了,但 ¥1200 到手。', wallet: 1200, mood: -10, weight: 15 },
    { text: '切瓷砖崩了个角,那是块进口砖……赔材料 ¥400。', wallet: -400, mood: -8, weight: 15 },
    { text: '给老客户介绍了个大活,拿了 ¥900 介绍费。手艺人靠口碑吃饭。', wallet: 900, mood: 3, weight: 18 },
    { text: '干完活,工头说「钱下周一起结」。一晚上白忙,先记账上。', wallet: 0, mood: -12, weight: 12 },
  ],
  siji: [
    { text: '晚高峰跑了六个小时,流水 ¥520。方向盘都热了。', wallet: 520, weight: 30 },
    { text: '接到机场大单,返程还拼了个客,¥880!今晚运气在你这边。', wallet: 880, mood: -6, weight: 18 },
    { text: '乘客喝多了吐在后座。洗车费搭进去 ¥300,还得通风一晚上。', wallet: -300, mood: -12, awkward: 5, weight: 14 },
    { text: '被投诉「绕路」(导航让走的),平台封号俩小时。就挣了 ¥220。', wallet: 220, mood: -10, weight: 16 },
    { text: '拉到个健谈的老板,聊了一路创业史,下车时人家扫码多给了 ¥700。', wallet: 700, mood: 4, weight: 14 },
  ],
  jiaolian: [
    { text: '连上三节私教课,课时费 ¥700。嗓子和肱二头肌都在冒烟。', wallet: 700, weight: 30 },
    { text: '会员续了张年卡大单!提成 ¥1500 到账,店长看你的眼神都变了。', wallet: 1500, mood: 5, weight: 14 },
    { text: '约好的体验课客户集体放鸽子。你对着空气讲了一晚上动作要领。', wallet: 0, mood: -12, weight: 14 },
    { text: '帮会员抢卧推杠铃,手腕别了一下。膏药 ¥150,教训无价。', wallet: -150, mood: -8, weight: 12 },
    { text: '月度销售红榜第一,老板当场打赏 ¥200:「就这么卖!」', wallet: 200, mood: 3, weight: 18 },
  ],
  chengxuyuan: [
    { text: '加班改需求到十一点,加班费 ¥1200。需求文档今天改了四版。', wallet: 1200, weight: 30 },
    { text: '上线出 bug,通宵回滚。加班费 ¥800,黑眼圈免费。', wallet: 800, mood: -15, awkward: 5, weight: 16 },
    { text: '季度奖金到账 ¥3000!你短暂地爱了一下这份工作。', wallet: 3000, mood: 5, weight: 12 },
    { text: '接的外包私活结了尾款 ¥2000。副业才是主业,懂的都懂。', wallet: 2000, mood: -5, weight: 14 },
    { text: '楼里传闻要「毕业」一批人。你加班到最晚,用工位的灯证明存在感。¥1000。', wallet: 1000, mood: -12, weight: 14 },
  ],
  guoqi: [
    { text: '写材料写到十点,「再改最后一稿」。加班费 ¥400。', wallet: 400, weight: 30 },
    { text: '帮领导救了个急,加班费 ¥600,还记下一个人情。体制内,人情比钱值钱。', wallet: 600, mood: 2, weight: 18 },
    { text: '单位发过节福利:米面油购物卡,折算 ¥300。拎回家的路上格外踏实。', wallet: 300, mood: 4, weight: 16 },
    { text: '陪领导应酬,白的啤的混着来。补贴 ¥350,胃疼一晚。', wallet: 350, mood: -12, weight: 14 },
    { text: '年中评优发了奖金 ¥800。妈妈发朋友圈:我儿子在国企好好干呢。', wallet: 800, mood: 4, weight: 10 },
  ],
  touhang: [
    { text: '通宵改 deck,第 47 页的字体又被打回来了。补贴 ¥2300。', wallet: 2300, mood: -10, weight: 30 },
    { text: '项目 close!奖金 ¥6000 到账,组里开了瓶香槟,喝完继续干活。', wallet: 6000, mood: 5, weight: 10 },
    { text: '被 MD 当众训话四十分钟。加班费 ¥1800,自尊心工伤。', wallet: 1800, mood: -15, weight: 18 },
    { text: '当天往返出差,凌晨两点落地首都机场。差补 ¥2600,人已经不是人了。', wallet: 2600, mood: -12, weight: 16 },
    { text: '市场暴跌,客户的仓在绿,你自己的仓更绿。浮亏 ¥2000。', wallet: -2000, mood: -12, weight: 10 },
  ],
  // ============ 女版 ============
  naicha: [
    { text: '站了一整晚,摇了两百杯。时薪加提成 ¥300。', wallet: 300, weight: 30 },
    { text: '高峰期爆单,店长现场发加班红包。今晚 ¥450,手腕已废。', wallet: 450, mood: -6, weight: 18 },
    { text: '端托盘手一滑,四杯全翻。照价赔 ¥120,地也是你拖的。', wallet: -120, mood: -8, awkward: 5, weight: 14 },
    { text: '客人投诉「珍珠比隔壁少三颗」。被扣绩效,到手 ¥180。', wallet: 180, mood: -10, weight: 14 },
    { text: '熟客说你调的是全北京最好喝的,还反手给你点了杯咖啡外卖。¥320+心情值。', wallet: 320, mood: 5, weight: 18 },
  ],
  meijia: [
    { text: '做了两单新款,手稳话甜,¥450 落袋。', wallet: 450, weight: 30 },
    { text: '大客户包场做全套,临走小费给足。今晚 ¥900,嘴皮子没白练。', wallet: 900, mood: 4, weight: 14 },
    { text: '客人做完说「跟图不一样」,返工到闭店。就挣了 ¥150。', wallet: 150, mood: -12, weight: 14 },
    { text: '进的新款甲片试贴失败,一盒材料打了水漂,-¥100。', wallet: -100, mood: -6, weight: 12 },
    { text: '你这个月业绩第一,老板现场打赏 ¥200,还让你带带新人。', wallet: 200, mood: 3, weight: 16 },
  ],
  youshi: [
    { text: '带完延时班,把最后一个娃交到家长手上。加班费 ¥350。', wallet: 350, weight: 30 },
    { text: '家长感谢你把挑食的娃喂胖了两斤,硬塞了张购物卡,¥500。', wallet: 500, mood: 4, weight: 16 },
    { text: '俩娃抢玩具打起来了,双方家长都在群里@你。调解到九点,¥200。', wallet: 200, mood: -14, awkward: 8, weight: 14 },
    { text: '公开课评了区级优质课,奖金 ¥600!园长笑成一朵花。', wallet: 600, mood: 4, weight: 12 },
    { text: '排练六一节目到天黑,小朋友的动作还是像一群小螃蟹。¥300。', wallet: 300, mood: -8, weight: 18 },
  ],
  hushi: [
    { text: '上了个大夜班,巡了一夜病房。夜班费 ¥600。', wallet: 600, weight: 30 },
    { text: '节假日三倍工资!¥1100,代价是朋友圈里别人的烟花。', wallet: 1100, mood: -10, weight: 14 },
    { text: '被家属无理投诉「打针疼」。写说明写到下班,¥400。', wallet: 400, mood: -14, awkward: 5, weight: 16 },
    { text: '上周抢救的病人出院了,家属送来锦旗和水果。¥500,这职业值了。', wallet: 500, mood: 6, weight: 12 },
    { text: '连轴转十二小时,腿肿得按下去一个坑。¥700。', wallet: 700, mood: -12, weight: 16 },
  ],
  kongjie: [
    { text: '飞了个京沪往返,平稳落地。飞行小时费 ¥800。', wallet: 800, weight: 30 },
    { text: '国际线长航班,时差没倒过来,但补贴 ¥1600 很提神。', wallet: 1600, mood: -10, weight: 16 },
    { text: '航班延误四小时,你微笑着挨了四小时骂。委屈补贴 ¥500。', wallet: 500, mood: -14, weight: 14 },
    { text: '头等舱旅客专门写了表扬信,公司通报表扬+奖金 ¥700。', wallet: 700, mood: 5, weight: 14 },
    { text: '同事病了,你被临时拉去顶班。行李箱都没来得及放下。¥900。', wallet: 900, mood: -10, weight: 16 },
  ],
  xinmeiti: [
    { text: '改了八版文案,甲方选了第一版。加班费 ¥600。', wallet: 600, weight: 30 },
    { text: '你写的那条爆了!十万加!老板当场发红包 ¥1000。', wallet: 1000, mood: 5, weight: 14 },
    { text: '数据扑街,被拉去复盘到半夜。「用户为什么不爱我们?」¥400。', wallet: 400, mood: -12, weight: 18 },
    { text: '谈好的甲方跳单了,这个月提成泡汤。白忙,记为经验。', wallet: 0, mood: -12, weight: 12 },
    { text: '接了个私单软文,写得违心但值钱。¥900 进账。', wallet: 900, mood: -5, weight: 16 },
  ],
  lvshi: [
    { text: '写诉状到深夜,计时收费的好处是——每一分钟都在变现。¥1900。', wallet: 1900, weight: 30 },
    { text: '大案子结案!律师费分成 ¥5000 到账。你在朋友圈发了张天平照片。', wallet: 5000, mood: 5, weight: 10 },
    { text: '开庭被对方律师突然袭击,连夜检索判例反击。¥1500,肾上腺素免费。', wallet: 1500, mood: -12, weight: 18 },
    { text: '客户凌晨两点夺命连环 call:「律师你睡了吗」。你没睡,你在计费。¥1600。', wallet: 1600, mood: -10, weight: 16 },
    { text: '所里摊派的公益法律援助日。没有钱,但被咨询的大爷大妈塞了一兜苹果。', wallet: 0, mood: 2, weight: 10 },
  ],
}

/** 按职业取工作事件池(未知职业兜底为国企池,兼容老存档) */
export function getWorkEvents(prof: string): WorkOutcome[] {
  return WORK_EVENTS[prof as ProfId] ?? WORK_EVENTS.guoqi
}
