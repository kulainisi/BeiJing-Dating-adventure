import { CharacterProfile, DateSpot, GameState, NodeDef, NpcState, Script, TemplateId } from '@/engine/types'
import { chance, pick } from '@/engine/rng'
import { me, nar, node, npc, scene, sys } from './util'

export type DateTemplate = (
  p: CharacterProfile,
  n: NpcState,
  s: GameState,
  spot: DateSpot,
) => Script

const loves = (p: CharacterProfile, t: string) => p.loves.includes(t)

/** 暧昧支线(SFW):散场后的「上来坐坐」三岔口,按角色 spicy 系数概率出现 */
function afterpartyNodes(p: CharacterProfile): NodeDef[] {
  return [
    node('sp_ask', [
      nar('散场了。走到楼下,TA停住脚步,手指绕着包带转了两圈。'),
      npc('「那个……我家就在前面。我家猫最近有点抑郁,你要不要上来,帮我看看它?」'),
      nar('北京的深夜,猫的心理健康突然变得很重要。'),
    ], {
      choices: [
        {
          text: '上去看猫。毕竟猫的事,是大事',
          effects: { favor: 10, npcFlags: ['stayed', 'tension'] },
          goto: 'sp_up',
        },
        {
          text: '体面告辞:今晚到这刚刚好,美好的东西我想留着慢慢来',
          effects: { favor: p.loves.includes('sincere') || p.loves.includes('trad') ? 8 : 3, npcFlags: ['tension'] },
          goto: 'sp_no',
        },
        {
          text: '慌乱推辞:啊这个我、我明天还要开早会——',
          effects: { favor: -4, awkward: 12 },
          goto: 'sp_awk',
        },
      ],
    }),
    node('sp_up', [
      nar('猫确实在。它用看智者的眼神看了你们三秒,然后跳上窗台背过身去。'),
      nar('灯关了。窗外是北京凌晨两点的车流声。'),
      sys('—— 此处剧情已由猫代为保管 ——'),
      nar('第二天早上,TA的语气和平时不太一样了,像一杯加了奶的咖啡。'),
    ], { end: true }),
    node('sp_no', [
      npc('「……行啊。」'),
      nar('TA低头笑了一下,「慢慢来」这三个字,TA走进楼门前又回味了一遍。'),
      nar('有时候,不上去比上去更进一步。'),
    ], { end: true }),
    node('sp_awk', [
      npc('「哦——早会,重要重要。」'),
      nar('TA的笑容体面,你的借口拙劣。出租车开出五百米你才想起来:明天是周六。'),
    ], { end: true }),
  ]
}

// ============ 🍺 酒局 ============
const bar: DateTemplate = (p, n, s, spot) => {
  const blackoutOutcome = pick(['bo_confess', 'bo_dance', 'bo_cry'])
  const spicyOn = n.favor >= 50 && chance(p.spicy ?? 0.1)
  const afterGoto = spicyOn ? 'sp_ask' : 'wrap'
  const nodes: NodeDef[] = [
    node('a', [
      nar(`${spot.location}。霓虹灯下人声鼎沸,${p.name}已经到了,面前摆着两杯酒。`),
      npc('「来啦?先说好,今晚不谈工作,只谈人生。」'),
      nar('第一杯酒被推到你面前。'),
    ], {
      choices: [
        {
          text: '举杯一口闷,杯底朝天',
          check: { skill: 'liquor', dc: 8, pass: 'r1_ok', fail: 'blackout', crit: 'r1_crit' },
          effects: { drink: 1 },
          danmaku: ['#drink'],
        },
        {
          text: '趁TA不注意,把酒倒进旁边的绿植里',
          check: { skill: 'mind', dc: 12, pass: 'r1_fake', fail: 'r1_caught', fumble: 'r1_caught' },
        },
        { text: '坦白:今晚想清醒地跟你聊天,我喝苏打水', goto: loves(p, 'sincere') || loves(p, 'equal') ? 'r1_honest_ok' : 'r1_honest_meh' },
      ],
    }),
    node('r1_crit', [nar('你一口闷完面不改色,还顺手转了个杯花。'), npc('「?!深藏不露啊你。」'), nar(`${p.name}看你的眼神亮了。`)], { effects: { favor: 12 }, next: 'round2' }),
    node('r1_ok', [nar('酒精滑过喉咙,微辣。你稳稳放下杯子。'), npc('「痛快!我就喜欢跟痛快人喝酒。」')], { effects: { favor: 7 }, next: 'round2' }),
    node('r1_fake', [nar('你行云流水地完成了倒酒动作,绿植微微颤抖。'), npc('「可以啊,好酒量。」'), nar('心眼子检定成功。这盆绿植将替你醉过今晚。')], { effects: { favor: 4 }, next: 'round2' }),
    node('r1_caught', [nar('你的手腕刚一倾斜——'), npc('「??你干嘛呢??那盆是我最喜欢的龟背竹!」'), nar('全桌目光聚焦。绿植滴着酒,像在哭。')], {
      effects: p.id === 'nana' ? { block: '假喝被抓包,在娜娜的主场' } : { favor: -14, awkward: 16 },
      danmaku: ['#cringe'],
      next: p.id === 'nana' ? undefined : 'round2',
      end: p.id === 'nana',
    }),
    node('r1_honest_ok', [npc('「哦?」TA挑了挑眉,「行,我尊重。能在酒桌上说真话的人不多了。」')], { effects: { favor: 6 }, next: 'round2' }),
    node('r1_honest_meh', [npc('「……行吧。」'), nar('TA自己干了那杯,气氛冷了半度。')], { effects: { favor: -4 }, next: 'round2' }),

    node('round2', [
      nar('几杯过后,话题渐深。'),
      npc('「说真的,你在北京这几年,最难的时候是什么样?」'),
    ], {
      choices: [
        { text: '讲了那个你从没跟人讲过的冬天', effects: { favor: 10, tone: 'zhiqiu', npcFlags: ['deep_talk'] }, danmaku: ['#simp'], goto: 'r2_deep' },
        { text: '轻描淡写地岔开:都过去了,喝酒喝酒', effects: { favor: 1 }, goto: 'r2_light' },
        {
          text: '反手举杯:先干为敬,干了我就说',
          check: { skill: 'liquor', dc: 13, pass: 'r2_drink_ok', fail: 'blackout' },
          effects: { drink: 1 },
          danmaku: ['#drink'],
        },
      ],
    }),
    node('r2_deep', [nar('你说完,桌上安静了几秒。'), npc('「……敬那个冬天。」'), nar('TA轻轻碰了你的杯子。有些东西不一样了。')], { next: afterGoto }),
    node('r2_light', [npc('「行,不聊沉重的。」'), nar('气氛依旧热闹,但只是热闹。')], { next: afterGoto }),
    node('r2_drink_ok', [nar('这一杯下去,天灵盖有点发麻,但你稳住了。'), npc('「哈哈哈哈好!你这个朋友我交定了——呸,谁要跟你只做朋友。」')], { effects: { favor: 9 }, next: afterGoto }),

    node('blackout', [
      nar('你只记得那杯酒下肚之后,世界开始旋转。'),
      sys('—— 断片了。操控权已交出 ——'),
    ], { effects: { blackout: true }, next: blackoutOutcome }),
    node('bo_confess', [
      nar('第二天,你从TA发来的60秒语音里得知:你昨晚抱着路灯,当街喊出了对TA的心意,一字不差,情真意切。'),
      npc(n.favor >= 55 ? '「笨蛋。……不过,我听进去了。」' : '「你昨晚,真的很吓人。我们冷静一下吧。」'),
    ], {
      effects: n.favor >= 55 ? { endGame: 'blackout_confess' } : { favor: -12, awkward: 30 },
      danmaku: ['#fate'],
      end: true,
    }),
    node('bo_dance', [
      nar('你断片后在酒吧舞池中央即兴表演了一段「工位健身操」,被三桌人拍下发到了网上。'),
      npc('「……你昨晚的视频,我同事都刷到了。」'),
    ], { effects: { favor: -10, awkward: 40 }, danmaku: ['#cringe'], end: true }),
    node('bo_cry', [
      nar('你断片后拉着TA的手,哭诉了四十分钟你的前任、你的房东和你的绩效。'),
      npc('「你的故事很感人,但我暂时不想成为下一章。」'),
    ], { effects: { favor: -18, awkward: 20 }, end: true }),

    node('wrap', [nar(`夜色渐深,${spot.location}的灯还亮着。${p.name}拿起外套,看了你一眼。`)], { end: true }),
  ]
  if (spicyOn) nodes.push(...afterpartyNodes(p))
  return scene(`date_bar_${p.id}`, '酒局', spot.location, 'bar', nodes)
}

// ============ 🎨 看展 ============
const expo: DateTemplate = (p, n, s, spot) => {
  const nodes: NodeDef[] = [
    node('a', [
      nar(`${spot.location}。白墙,射灯,人均端着一杯气泡水。你们在一件巨大的装置作品前停下——三千个粉色马桶搋子组成的浪潮。`),
      npc('「……你怎么看这件作品?」'),
    ], {
      choices: [
        {
          text: '沉吟三秒,开始输出你的深度解读',
          check: { skill: 'culture', dc: 13, pass: 'read_ok', fail: 'read_fail', crit: 'read_crit', fumble: 'read_fumble' },
          danmaku: ['#art'],
        },
        { text: '坦白:说实话,我看不懂,但我大受震撼', goto: loves(p, 'sincere') || loves(p, 'indie') ? 'honest_ok' : 'honest_meh' },
        {
          text: '不说话,先拍一张构图完美的照片',
          check: { skill: 'image', dc: 11, pass: 'photo_ok', fail: 'photo_fail' },
        },
      ],
    }),
    node('read_crit', [
      nar('你从消费主义的规训讲到日常物的诗学,旁边一位穿黑色高领的中年人频频点头。'),
      npc('「等等,那位好像就是策展人……他在为你鼓掌。」'),
      nar('全场的目光都汇聚过来。今天的你,是艺术区最亮的崽。'),
    ], { effects: { favor: 16, npcFlags: ['art_soul'] }, danmaku: ['#art'], next: 'beat2' }),
    node('read_ok', [npc('「有点意思……你这个角度我没想过。」'), nar('TA认真看了你几秒,像是重新给你标了个价。')], { effects: { favor: 9, npcFlags: ['art_soul'] }, next: 'beat2' }),
    node('read_fail', [
      nar('你讲到一半,发现自己把「后现代」说成了「后现在」,并且开始循环使用「张力」这个词。'),
      npc('「……嗯,张力,确实。」'),
      nar('TA的嘴角有一丝礼貌的弧度。装懂被识破了。'),
    ], { effects: { favor: -10, awkward: 12 }, danmaku: ['#art'], next: 'beat2' }),
    node('read_fumble', [
      nar('你指着作品说:「这让我想到我们公司的OKR。」'),
      nar('说完你想收回,但声音在安静的展厅里传得很远。一位艺术生看了你一眼,在速写本上记了点什么。'),
      npc('「…………我们去下一个展厅吧。」'),
    ], { effects: { favor: -14, awkward: 22 }, danmaku: ['#cringe'], next: 'beat2' }),
    node('honest_ok', [npc('「哈哈哈哈你是今天整个展厅里最诚实的人。」'), nar('TA笑得很真,「其实我也没看懂,大家都在装。」')], { effects: { favor: 8, npcFlags: ['deep_talk'] }, next: 'beat2' }),
    node('honest_meh', [npc('「……这可是今年最重要的展之一。」'), nar('TA似乎期待一个更有慧根的你。')], { effects: { favor: -5 }, next: 'beat2' }),
    node('photo_ok', [nar('你退后三步,蹲下,45度仰拍。作品、光影、还有TA的侧脸,全都在了。'), npc('「诶,这张可以!发我!」')], { effects: { favor: 8 }, next: 'beat2' }),
    node('photo_fail', [nar('你拍了九张,张张糊得像监控截图。'), npc('「……算了,我自拍吧。」')], {
      effects: p.id === 'cici' ? { block: '给探店博主拍糊了九张照片' } : { favor: -6, awkward: 8 },
      end: p.id === 'cici',
      next: p.id === 'cici' ? undefined : 'beat2',
    }),
    node('beat2', [
      nar('走到出口,纪念品商店亮着温柔的灯。一本展览画册,标价 268。'),
      npc('「这画册装帧真好看……就是有点小贵。」'),
    ], {
      choices: [
        { text: '不动声色地买下,在扉页写了一句话送给TA', effects: { wallet: -268, favor: 12 }, danmaku: ['#rich'], goto: 'gift' },
        { text: '说:拍下来回家看电子版,环保', effects: { favor: loves(p, 'frugal') ? 5 : -6 }, goto: 'nogift' },
        { text: '陪TA翻完整本,把TA看得最久的那页记在心里', effects: { favor: 7, npcFlags: ['attentive'] }, goto: 'nogift' },
      ],
    }),
    node('gift', [npc('「你在扉页写了什么……」'), nar('TA翻开,看完,把画册轻轻抱在了怀里。')], { next: 'wrap' }),
    node('nogift', [nar('你们并肩走出美术馆,798的夕阳把影子拉得很长。')], { next: 'wrap' }),
    node('wrap', [nar(`晚风穿过艺术区的旧厂房。${p.name}回头看你,好像在等什么。`)], { end: true }),
  ]
  return scene(`date_expo_${p.id}`, '看展', spot.location, 'expo', nodes)
}

// ============ 🍲 饭局 ============
const dinner: DateTemplate = (p, n, s, spot) => {
  const nodes: NodeDef[] = [
    node('a', [
      nar(`${spot.location}。热气腾腾,人声鼎沸。菜单递到了你手里。`),
      npc('「你点吧,我都还好。」'),
      nar('经典的北京Dating考题第一题:点菜权力学。'),
    ], {
      choices: [
        { text: '点一份灵魂香菜牛肉,多加香菜', effects: { taste: 'xiangcai', favor: 2 }, goto: 'order2' },
        { text: '直接上特辣锅底,不辣不欢', effects: { taste: 'la', favor: 2 }, goto: 'order2' },
        { text: '来一份老北京卤煮,内脏爱好者狂喜', effects: { taste: 'neizang', favor: 2 }, goto: 'order2' },
        { text: '把菜单推回去:你点,我都行,随便', effects: { favor: -5, saying: 'suibian' }, danmaku: ['#down'], goto: 'order_push' },
      ],
    }),
    node('order_push', [npc('「……好吧。」'), nar('TA低头点菜,你隐约感觉丢了一分。')], { next: 'talk' }),
    node('order2', [nar('菜上齐了。你观察着TA下筷子的方向,悄悄记录情报。')], { next: 'talk' }),
    node('talk', [
      npc('「对了,问你个事。」TA夹了口菜,「你周末一般……会主动安排生活吗?还是有人约才动?」'),
      nar('这个问题闻起来像一道加密考题。'),
    ], {
      choices: [
        {
          text: '解码TA的潜台词再作答',
          check: { skill: 'mind', dc: 12, pass: 'talk_smart', fail: 'talk_plain' },
        },
        { text: '老实回答:有人约才动,人是社会性动物', effects: { favor: 3 }, goto: 'talk_plain2' },
        { text: '反问:怎么,你是想约我下周末?', effects: { favor: 6, tone: 'liao' }, danmaku: ['#smart'], goto: 'talk_flirt' },
        {
          text: '结构化作答:我周末分三块——运动、输入、留白。留白那块,最近想留给一个人',
          showIf: 'edu:gaozhi',
          effects: { favor: 6, style: 'frame' },
          goto: 'talk_style',
        },
        {
          text: '反手一捧:我周末干嘛不重要,重要的是你开口,我肯定有空',
          showIf: 'edu:shehui',
          effects: { favor: 6, style: 'flatter' },
          goto: 'talk_style',
        },
      ],
    }),
    node('talk_style', [
      npc('「……你这张嘴啊。」'),
      nar('这句话对不对味,全看对面的人吃不吃你这一套。TA低头吃菜的嘴角,给出了答案。'),
    ], { next: 'bill' }),
    node('talk_smart', [
      nar('心眼子检定成功。你听懂了:TA在问「你是无聊了才找我,还是真的想见我」。'),
      me('「主动安排。比如今天,是我这周唯一在乎的安排。」'),
      npc('「……油嘴滑舌。」'),
      nar('但TA的耳朵红了。'),
    ], { effects: { favor: 11 }, danmaku: ['#smart'], next: 'bill' }),
    node('talk_plain', [nar('你没听出题眼,给出了一个百科式回答。'), npc('「哦,这样啊。」'), nar('TA礼貌地点头,话题像汤一样凉下去。')], { effects: { favor: 0 }, next: 'bill' }),
    node('talk_plain2', [npc('「哈哈,诚实。」'), nar('不加分也不扣分,像一道白灼菜。')], { next: 'bill' }),
    node('talk_flirt', [npc('「谁要约你,想得美。」'), nar('TA嘴上这么说,却掏出手机看了眼日历。')], { next: 'bill' }),
    node('bill', [
      nar('账单时刻。服务员把小票扣在桌上,像发下最后一张考卷。'),
      nar('小票上的数字比预期多了一截——都怪后来加的那两个菜。'),
    ], {
      choices: [
        { text: '闪电掏出手机,扫码速度快过5G', effects: { wallet: -88, favor: loves(p, 'flex') || loves(p, 'trad') ? 8 : 4 }, danmaku: ['#rich'], goto: 'bill_me' },
        { text: '提议AA:各付各的,谁也不欠谁', effects: { favor: loves(p, 'equal') ? 7 : -9 }, goto: 'bill_aa' },
        {
          text: '摸了摸口袋,露出「手机好像没带」的表情',
          check: { skill: 'mind', dc: 14, pass: 'bill_dodge_ok', fail: 'bill_dodge_fail', fumble: 'bill_dodge_fail' },
        },
        {
          text: '云淡风轻地买单:「这顿还不到我半小时的计费。」',
          showIf: 'prof:lvshi',
          effects: { wallet: -88, favor: loves(p, 'flex') ? 10 : 5 },
          danmaku: ['#rich'],
          goto: 'bill_pro',
        },
        {
          text: '职业病点评:「这家翻台率不行,菜品毛利倒是控得好。买单。」',
          showIf: 'prof:touhang',
          effects: { wallet: -88, favor: loves(p, 'practical') || loves(p, 'corporate') ? 9 : 4 },
          goto: 'bill_pro',
        },
      ],
    }),
    node('bill_pro', [npc('「……你们这行的人,是不是看什么都带报价?」'), nar('嘴上吐槽,TA还是把「下次我来」说得很自然——下次,又是一个下次。')], { next: 'wrap' }),
    node('bill_me', [npc('「动作这么快?!……下次我来。」'), nar('「下次」。你在心里把这两个字裱了起来。')], { next: 'wrap' }),
    node('bill_aa', [nar(loves(p, 'equal') ? 'TA眼睛一亮:「我就喜欢明算账的,舒服。」' : 'TA顿了半秒,「……好啊。」那半秒里有一部电视剧。')], { next: 'wrap' }),
    node('bill_dodge_ok', [nar('你演技精湛,TA毫无察觉地买了单,还安慰你「下次你来就行」。'), nar('你赢了这一单,但输给了今晚的自己。')], { effects: { favor: -1, npcFlags: [] }, next: 'wrap' }),
    node('bill_dodge_fail', [
      nar('你摸口袋的手法过于浮夸,手机还在这时响了起来——铃声是《好运来》。'),
      npc('「…………你的手机,在响。」'),
      nar('邻桌的大哥笑出了声。'),
    ], { effects: { favor: -13, awkward: 20 }, danmaku: ['#cringe'], next: 'wrap' }),
    node('wrap', [nar(`走出${spot.location},晚风带着炭火味。${p.name}放慢了脚步。`)], { end: true }),
  ]
  return scene(`date_dinner_${p.id}`, '饭局', spot.location, 'dinner', nodes)
}

// ============ 🚶 Citywalk ============
const citywalk: DateTemplate = (p, n, s, spot) => {
  const nodes: NodeDef[] = [
    node('a', [
      nar(`${spot.location}。灰墙灰瓦,鸽哨掠过头顶。你们并肩走着,影子一前一后。`),
      nar('走过第三个路口,话题突然用完了。沉默开始膨胀。'),
    ], {
      choices: [
        {
          text: '启动话题急救:从眼前的老门墩聊到北京城的变迁',
          check: { skill: 'mouth', dc: 12, pass: 'talk_ok', fail: 'talk_fail', crit: 'talk_crit' },
        },
        { text: '什么都不说,就这么安静地走着', goto: loves(p, 'indie') || loves(p, 'sincere') ? 'silent_ok' : 'silent_meh' },
        { text: '提议:买两串糖葫芦,嘴忙起来就不尴尬了', effects: { wallet: -20, favor: 6 }, goto: 'tanghulu' },
      ],
    }),
    node('talk_crit', [nar('你从门墩讲到胡同肌理,再讲到「城市是长出来的,不是盖出来的」。'), npc('「你懂的还挺多……再讲讲?」'), nar('TA不自觉地凑近了半步。')], { effects: { favor: 13, npcFlags: ['deep_talk'] }, next: 'uncle' }),
    node('talk_ok', [npc('「哈哈,你这么一说,这条街都生动起来了。」')], { effects: { favor: 8 }, next: 'uncle' }),
    node('talk_fail', [nar('你张口:「这个门墩……挺老的。」'), npc('「……嗯,挺老的。」'), nar('沉默卷土重来,比刚才更沉。')], { effects: { favor: -5, awkward: 10 }, next: 'uncle' }),
    node('silent_ok', [nar('你们安静地走了两条街。奇怪的是,一点也不尴尬。'), npc('「跟你走路很舒服,不用没话找话。」')], { effects: { favor: 9, npcFlags: ['deep_talk'] }, next: 'uncle' }),
    node('silent_meh', [nar('沉默持续了四百米。TA掏出手机刷了起来。'), nar('你听见了好感度结冰的声音。')], { effects: { favor: -7, awkward: 8 }, next: 'uncle' }),
    node('tanghulu', [nar('冰糖在嘴里咔嚓作响。'), npc('「小时候的味道,」TA眯起眼,「你还挺会的。」')], { next: 'uncle' }),
    node('uncle', [
      nar('后海边,一位大爷抱着吉他,唱着《北京北京》,面前的琴盒里躺着几个钢镚儿。'),
      npc('「诶,他唱得好像还行?」'),
    ], {
      choices: [
        { text: '停下来听完整首,然后放下十块钱', effects: { favor: 7, flags: ['uncle_met'] }, goto: 'uncle_listen' },
        {
          text: '走过去,跟大爷合唱一段',
          check: { skill: 'mouth', dc: 15, pass: 'uncle_sing_ok', fail: 'uncle_sing_meh', crit: 'uncle_sing_ok', fumble: 'uncle_sing_fumble' },
        },
        { text: '拉着TA继续走:天冷,别停', effects: { favor: 2, care: true }, goto: 'wrap' },
      ],
    }),
    node('uncle_listen', [nar('一曲终了,大爷冲你点点头:「小伙子/姑娘,有心。」'), npc('「……这个瞬间好北京啊。」TA轻声说。')], { next: 'wrap' }),
    node('uncle_sing_ok', [
      nar('你和大爷一人一句,副歌处围观群众自发打起了拍子。有人举起手机,闪光灯像小型演唱会。'),
      npc('「你也太敢了吧!!」'),
      nar('TA笑得直不起腰,眼睛里全是光。'),
    ], { effects: { favor: 14 }, danmaku: ['#win'], next: 'wrap' }),
    node('uncle_sing_meh', [nar('你破音了两次,大爷礼貌地接管了所有高音。'), npc('「勇气可嘉,哈哈哈哈。」')], { effects: { favor: 3, awkward: 8 }, next: 'wrap' }),
    node('uncle_sing_fumble', [
      nar('你唱着唱着,和大爷聊起了人生。从下岗聊到北漂,从房价聊到女儿远嫁。'),
      nar('等你回过神,天已经黑透了。你的约会对象呢?三小时前就走了。'),
      nar('大爷拍拍你的肩:「孩子,有些缘分是人,有些缘分是歌。」'),
    ], { effects: { endGame: 'houhai_uncle' }, danmaku: ['#fate'], end: true }),
    node('wrap', [nar(`华灯初上,${spot.location}的水面碎成一片金色。${p.name}停下脚步望着你。`)], { end: true }),
  ]
  return scene(`date_walk_${p.id}`, 'Citywalk', spot.location, 'walk', nodes)
}

// ============ 🏃 运动局 ============
const sport: DateTemplate = (p, n, s, spot) => {
  const nodes: NodeDef[] = [
    node('a', [
      nar(`${spot.location}。空气里都是负氧离子和多巴胺。${p.name}压着腿,状态拉满。`),
      npc('「先来个五公里热热身?」'),
      nar('五公里。热身。你在心里为自己默哀了一秒。'),
    ], {
      choices: [
        {
          text: '咬牙跟上TA的配速,呼吸控制,表情管理',
          check: { skill: 'image', dc: 12, pass: 'run_ok', fail: 'run_fail', crit: 'run_crit' },
        },
        { text: '诚实降速:你先跑,我用我的节奏,终点见', goto: loves(p, 'equal') || loves(p, 'sincere') ? 'pace_ok' : 'pace_meh' },
      ],
    }),
    node('run_crit', [nar('你不仅跟上了,最后一公里还反超了半个身位,冲线时头发都是帅的。'), npc('「??你是不是偷偷训练过?!」')], { effects: { favor: 14 }, next: 'photo' }),
    node('run_ok', [nar('你稳稳跟完,喘而不乱,汗水在阳光下闪闪发光,像运动饮料广告。'), npc('「可以啊,平时有在练?」')], { effects: { favor: 9 }, next: 'photo' }),
    node('run_fail', [
      nar('三公里处,你岔气了。你扶着一棵国槐,表情像被生活重锤。'),
      npc('「你还好吗??要不要叫个车??」'),
      nar('一位晨练大妈递来一瓶藿香正气水,眼神慈祥。'),
    ], { effects: { favor: -6, awkward: 14 }, danmaku: ['#cringe'], next: 'photo' }),
    node('pace_ok', [npc('「哈哈行,各跑各的,终点见!」'), nar('TA跑远了,又回头冲你挥了挥手。不硬撑的人,反而让人放心。')], { effects: { favor: 6 }, next: 'photo' }),
    node('pace_meh', [npc('「啊?哦……行吧。」'), nar('TA的背影很快消失。你独自跑在奥森,像被时代抛下。')], { effects: { favor: -4 }, next: 'photo' }),
    node('photo', [
      nar('跑完,TA把手机塞给你,指了指那片银杏:'),
      npc('「帮我拍几张运动照!要那种不经意的感觉。」'),
    ], {
      choices: [
        {
          text: '蹲低、连拍、抓拍发丝扬起的瞬间',
          check: { skill: 'image', dc: 13, pass: 'photo_ok', fail: 'photo_fail', crit: 'photo_ok' },
        },
        { text: '直接开视频模式录十秒,让TA自己截最美一帧', effects: { favor: 8 }, danmaku: ['#smart'], goto: 'photo_video' },
      ],
    }),
    node('photo_ok', [nar('三十七连拍,张张能当封面。'), npc('「哇……你拍照怎么这么稳?加鸡腿!」')], { effects: { favor: 10 }, next: 'wrap' }),
    node('photo_fail', [nar('你拍出了十几张运动模糊,唯一清楚的一张,TA正好在擦鼻子。'), npc('「……这什么啊哈哈哈哈,删了删了!」')], {
      effects: p.id === 'cici' ? { block: '给博主拍出了擦鼻子特写' } : { favor: -5, awkward: 6 },
      end: p.id === 'cici',
      next: p.id === 'cici' ? undefined : 'wrap',
    }),
    node('photo_video', [nar('十秒视频,TA截出了完美一帧,还顺手把视频也存了。'), npc('「这个方法谁教你的,太聪明了。」')], { next: 'wrap' }),
    node('wrap', [nar(`夕阳把跑道染成蜂蜜色。${p.name}拧开水瓶喝了一口,侧头看你。`)], { end: true }),
  ]
  return scene(`date_sport_${p.id}`, '运动局', spot.location, 'sport', nodes)
}

// ============ 🛍️ 购物局 ============
const shopping: DateTemplate = (p, n, s, spot) => {
  const nodes: NodeDef[] = [
    node('a', [
      nar(`${spot.location}。大理石地面亮得能照出你的余额。${p.name}轻车熟路地走进一家店。`),
      nar('十分钟后,TA拿着一件衣服从试衣间出来,转了半圈。'),
      npc('「怎么样?好看吗?」'),
      nar('死亡问答,来了。'),
    ], {
      choices: [
        {
          text: '快速扫描版型与TA的气质,给出真诚且专业的评价',
          check: { skill: 'mind', dc: 13, pass: 'judge_ok', fail: 'judge_fail', crit: 'judge_crit' },
        },
        { text: '不假思索:「好看!都好看!」', effects: { favor: -6 }, danmaku: ['#down'], goto: 'judge_lazy' },
        { text: '不说话,直接走向收银台', effects: { wallet: -880, favor: 12 }, danmaku: ['#rich'], goto: 'judge_buy' },
      ],
    }),
    node('judge_crit', [
      me('「这件的肩线有点吃你的比例。刚才进门右手第二排那件,你穿会封神。」'),
      nar('TA换上那件,镜子前愣了三秒。'),
      npc('「……你是有什么审美外挂吗?」'),
    ], { effects: { favor: 15, npcFlags: ['attentive'] }, danmaku: ['#smart'], next: 'lux' }),
    node('judge_ok', [me('「好看,但我觉得你上周穿的那种颜色更衬你。」'), npc('「你居然记得我上周穿什么?!」'), nar('加分。大加分。')], { effects: { favor: 10, npcFlags: ['attentive'] }, next: 'lux' }),
    node('judge_fail', [me('「呃……挺……显瘦的?」'), npc('「显瘦??」TA眯起眼,「所以你觉得我需要显瘦?」'), nar('你听见了冰面碎裂的声音。')], { effects: { favor: -10, awkward: 15 }, danmaku: ['#cringe'], next: 'lux' }),
    node('judge_lazy', [npc('「你根本没看吧。」'), nar('TA把衣服放了回去。「都好看」约等于「都没看」,这是Dating基本法。')], { next: 'lux' }),
    node('judge_buy', [npc('「诶你干嘛??……讨厌,谁让你买了。」'), nar('嘴上这么说,袋子TA可提得很稳。')], { next: 'lux' }),
    node('lux', [
      nar('路过奢侈品区,橱窗里一只包在射灯下闪闪发光。'),
      npc('「这只我关注很久了……你觉得,这种包值吗?」'),
    ], {
      choices: [
        { text: '回:值。它对你来说不是包,是铠甲', effects: { favor: loves(p, 'flex') ? 12 : 4 }, danmaku: ['#rich'], goto: 'lux_yes' },
        { text: '认真讲性价比:同样的钱可以配置更优的资产组合', effects: { favor: loves(p, 'frugal') || loves(p, 'practical') ? 7 : -8 }, goto: 'lux_fin' },
        {
          text: '脱口而出:包就是智商税',
          effects: p.id === 'linda' ? { block: '在SKP说出「包是智商税」' } : { favor: -12, awkward: 10 },
          danmaku: ['#block'],
          goto: p.id === 'linda' ? undefined : 'lux_tax',
        },
      ],
    }),
    node('lux_yes', [npc('「铠甲……」TA看着橱窗,轻声重复了一遍,「你这个说法,我喜欢。」')], { next: 'wrap' }),
    node('lux_fin', [nar(loves(p, 'practical') ? 'TA若有所思:「有道理。你这人……意外地清醒。」' : 'TA礼貌微笑:「嗯,有道理。」但眼神已经飘回了橱窗。')], { next: 'wrap' }),
    node('lux_tax', [npc('「智商税?」'), nar('空气凝固。柜姐同情地看了你一眼。')], { next: 'wrap' }),
    node('wrap', [nar(`走出${spot.location},夜晚的国贸桥车流如河。${p.name}提着袋子,脚步轻快。`)], { end: true }),
  ]
  return scene(`date_shop_${p.id}`, '购物局', spot.location, 'shop', nodes)
}

// ============ 🎤 KTV ============
const ktv: DateTemplate = (p, n, s, spot) => {
  const nodes: NodeDef[] = [
    node('a', [
      nar(`${spot.location}。包间里灯球旋转,点歌屏亮着。${p.name}把麦克风递给你:`),
      npc('「规矩:第一首歌定基调。你先来。」'),
    ], {
      choices: [
        {
          text: '点一首高难度的,赌上今晚的麦霸尊严',
          check: { skill: 'mouth', dc: 13, pass: 'sing_ok', fail: 'sing_fail', crit: 'sing_crit', fumble: 'sing_fumble' },
        },
        { text: '点一首适合合唱的:「这首得两个人唱才好听」', effects: { favor: 9, npcFlags: ['tension'] }, goto: 'duet' },
        { text: '把麦克风递回去:你先,我负责喝彩和切歌防御', effects: { favor: 5, care: true }, goto: 'listen' },
      ],
    }),
    node('sing_crit', [
      nar('前奏一起,你开口的瞬间,TA拿零食的手停在了半空。'),
      nar('副歌你稳稳顶了上去,尾音收得干干净净。包间门口路过的服务员都探头看了一眼。'),
      npc('「等会儿,你是不是偷偷练过?!再唱一首!点歌权全给你!」'),
    ], { effects: { favor: 14 }, next: 'beat2' }),
    node('sing_ok', [nar('你发挥稳定,该上的上,该收的收。'), npc('「可以啊,麦霸认证通过。」')], { effects: { favor: 8 }, next: 'beat2' }),
    node('sing_fail', [
      nar('副歌那个高音,你上去了——用生命上去的。声音劈成了两半,一半留在原调,一半上了天。'),
      npc('「噗——咳咳,没事没事,继续!勇气可嘉!」'),
    ], { effects: { favor: -4, awkward: 12 }, danmaku: ['#cringe'], next: 'beat2' }),
    node('sing_fumble', [
      nar('你点了首粤语歌,并用你自创的「谐音粤语」完成了整首演唱。'),
      nar(`${p.name}笑到滑到沙发底下,举着手机说要发到家族群。`),
      npc('「哈哈哈哈哈这是什么语言!!快拦住我,我真的要发了!」'),
    ], { effects: { favor: 3, awkward: 20 }, danmaku: ['#cringe'], next: 'beat2' }),
    node('duet', [
      nar('前奏响起,两支麦克风,一首老情歌。'),
      nar('唱到第二段主歌,你们的视线在旋转的灯球下撞了一下,又各自弹开。'),
      npc('「……唱歌就唱歌,你看我干嘛。」(TA自己也在看)'),
    ], { next: 'beat2' }),
    node('listen', [nar('TA唱歌真不错。你在副歌处准时递水、点了波「气氛灯」,并成功拦截了隔壁想切歌的手。'), npc('「你这个捧场技术,专业级的。下次唱K还叫你。」')], { effects: { favor: 6 }, next: 'beat2' }),
    node('beat2', [
      nar('唱累了,TA翻着点歌屏突然说:'),
      npc('「点一首能代表你现在心情的歌。别耍滑,我会听歌词的。」'),
    ], {
      choices: [
        { text: '点了一首歌词露骨的情歌,直球', effects: { favor: 8, npcFlags: ['tension'] }, goto: 'w1' },
        { text: '点了一首《好运来》,打死不表态', effects: { favor: 3 }, goto: 'w2' },
        {
          text: '点一首冷门但恰到好处的歌,歌词句句在点上',
          require: { skill: 'culture', min: 6, gray: '文化水平不足:你的歌单只有抖音热歌TOP50' },
          effects: { favor: 12, npcFlags: ['deep_talk'] },
          danmaku: ['#smart'],
          goto: 'w3',
        },
      ],
    }),
    node('w1', [npc('「……你这歌,选得可真敢。」'), nar('TA没切歌,还跟着轻轻哼了两句。')], { next: 'wrap' }),
    node('w2', [npc('「好运来?!」'), npc('「行,滑不留手。这题你逃过去了,下次可没这么容易。」')], { next: 'wrap' }),
    node('w3', [nar('歌放到一半,TA忽然安静下来,认真听完了整首。'), npc('「这首歌……你怎么找到的。感觉被说中了。」')], { next: 'wrap' }),
    node('wrap', [nar(`走出${spot.location},耳朵里还有回声。${p.name}嗓子微哑,看你的眼神却很亮。`)], { end: true }),
  ]
  return scene(`date_ktv_${p.id}`, 'KTV', spot.location, 'ktv', nodes)
}

// ============ 🕵️ 剧本杀 ============
const jubensha: DateTemplate = (p, n, s, spot) => {
  const nodes: NodeDef[] = [
    node('a', [
      nar(`${spot.location}。DM发下剧本,你翻开一看,命运的安排:你和${p.name}抽到了「剧中夫妻」。`),
      npc('「哈?我们是两口子?」TA挑了挑眉,「行啊,那这局你得护着我。」'),
    ], {
      choices: [
        {
          text: '瞬间入戏:执起TA的手背轻拍,「夫人,委屈你了」',
          check: { skill: 'mouth', dc: 12, pass: 'act_ok', fail: 'act_fail', crit: 'act_crit' },
        },
        { text: '认真研读剧本,先摸清任务和时间线再说', effects: { favor: 4 }, goto: 'beat2' },
      ],
    }),
    node('act_crit', [
      nar('你从口音到眼神完全化身剧中人,一句「夫人,家里的事,有我」说得全桌起哄。'),
      npc('「……你别入戏太深啊。」'),
      nar('TA嘴上嫌弃,耳朵红了,并在接下来的三小时里叫了你十七次「相公/娘子」。'),
    ], { effects: { favor: 13, npcFlags: ['tension'] }, danmaku: ['#win'], next: 'beat2' }),
    node('act_ok', [npc('「哟,还挺会演。」'), nar('TA顺势挽住你的手臂:「走吧,咱们对口供去。」戏里戏外的边界,开始变得模糊。')], { effects: { favor: 9, npcFlags: ['tension'] }, next: 'beat2' }),
    node('act_fail', [
      nar('你一句「夫人」出口,自己先绷不住笑场了,像大型尬演现场。'),
      npc('「哈哈哈哈你不行,你这演技横店门口发传单都不要。」'),
    ], { effects: { favor: 0, awkward: 8 }, next: 'beat2' }),
    node('beat2', [
      nar('第二幕搜证结束,DM宣布:本局凶手,就在你们「夫妻」之中。'),
      nar('你翻开自己的底牌——**你就是凶手**。而剧本里,你的动机是为了保护「妻子/丈夫」。'),
    ], {
      choices: [
        {
          text: '面不改色,把全场怀疑引向别人,连TA也骗',
          check: { skill: 'mind', dc: 14, pass: 'lie_ok', fail: 'lie_fail', crit: 'lie_crit' },
        },
        { text: '私下把底牌亮给TA:「我是凶手。但动机你看看。」', effects: { favor: 10, npcFlags: ['deep_talk'] }, goto: 'honest' },
      ],
    }),
    node('lie_crit', [
      nar('复盘环节,DM揭晓凶手,全桌哗然。TA瞪圆了眼睛看你。'),
      npc('「不是——你从头骗到尾?!连我都骗?!」'),
      npc('「……好可怕。好可怕,但是,好帅。」'),
    ], { effects: { favor: 15 }, danmaku: ['#win'], next: 'wrap' }),
    node('lie_ok', [nar('你成功把票导向了法医。揭晓时TA捶了你一下:「行啊你,深藏不露!」')], { effects: { favor: 9 }, next: 'wrap' }),
    node('lie_fail', [
      nar('你撒谎时的眼神飘了0.5秒,被TA当场锁定:「就是你!TA眼神虚了!」'),
      nar('全桌跟票,你一轮出局。'),
      npc('「嘿嘿,你这点道行,在我面前不够看。」'),
    ], { effects: { favor: 4, awkward: 6 }, next: 'wrap' }),
    node('honest', [
      nar('TA看完你的动机页,沉默了几秒。'),
      npc('「剧本里你为了我杀人,现实里你为了我弃赛。」'),
      npc('「这局咱们输了,但你这个人,赢了点什么。」'),
    ], { next: 'wrap' }),
    node('wrap', [nar(`散场,${spot.location}门口的风一吹,戏散了,人还有点没出戏。${p.name}看了你一眼,像在看剧本外的什么。`)], { end: true }),
  ]
  return scene(`date_jbs_${p.id}`, '剧本杀', spot.location, 'jubensha', nodes)
}

// ============ 🎢 游乐园 ============
const park: DateTemplate = (p, n, s, spot) => {
  const spicyOn = n.favor >= 45 && chance(Math.min(0.5, (p.spicy ?? 0.1) + 0.15))
  const nodes: NodeDef[] = [
    node('a', [
      nar(`${spot.location}。热门项目排队提示:120分钟。两小时,考验一段关系的黄金时长。`),
      npc('「两小时……你可别让我尬站着。」'),
    ], {
      choices: [
        {
          text: '启动话题永动机:从「猜前面情侣谈了多久」聊到人类学',
          check: { skill: 'mouth', dc: 12, pass: 'queue_ok', fail: 'queue_fail', crit: 'queue_crit' },
        },
        { text: '掏出提前买的快速通行票:排什么队,咱们走VIP通道', effects: { wallet: -240, favor: 10 }, danmaku: ['#rich'], goto: 'queue_vip' },
        { text: '提议玩「谁先笑谁输」,输的请喝奶茶', effects: { favor: 7 }, goto: 'queue_game' },
      ],
    }),
    node('queue_crit', [nar('两小时像二十分钟。你们从路人职业猜到宇宙起源,笑到前面的情侣频频回头。'), npc('「完了,跟你聊天有点上瘾。」')], { effects: { favor: 13, npcFlags: ['deep_talk'] }, next: 'coaster' }),
    node('queue_ok', [nar('你的话题库存撑住了两小时,中间只冷场了两次,都被你用零食救回来了。')], { effects: { favor: 7 }, next: 'coaster' }),
    node('queue_fail', [nar('第四十分钟,话题耗尽。你们并排刷了八十分钟手机,像一对结婚二十年的夫妻。'), npc('「……下次还是买快速票吧。」')], { effects: { favor: -6, awkward: 10 }, next: 'coaster' }),
    node('queue_vip', [npc('「你居然连这个都备好了?!」'), nar('从两小时的队伍旁边走过时,TA的排面值和你的一起飙升。')], { next: 'coaster' }),
    node('queue_game', [nar('第三回合,你用一个眼神杀获胜。TA笑到扶栏杆,输掉了一杯奶茶和一点点心防。')], { next: 'coaster' }),
    node('coaster', [
      nar('过山车。爬升到最高点前的静止,是人类表情管理的终极考场。'),
      npc('「诶,一会儿出片的抓拍点,就在第一个俯冲!」'),
    ], {
      choices: [
        {
          text: '全程绷住表情,对着抓拍镜头比了个从容的耶',
          check: { skill: 'image', dc: 13, pass: 'photo_ok', fail: 'photo_fail', crit: 'photo_ok' },
        },
        { text: '不管形象,和TA一起放声尖叫,叫得比谁都野', effects: { favor: 8 }, goto: 'scream' },
      ],
    }),
    node('photo_ok', [nar('出片处,大屏上你的表情从容得像在等电梯,旁边的TA面目全非。'), npc('「不行,这张必须买!裱起来!你是人吗!」')], { effects: { favor: 10, wallet: -50 }, next: spicyOn ? 'ghost' : 'wrap' }),
    node('photo_fail', [
      nar('出片处,大屏上你的脸被重力拉扯成了一张行为艺术,舌头不知为何是出来的。'),
      npc('「哈哈哈哈哈哈这张我买了!!当表情包!!」'),
      nar('你的形象死了,但气氛活了。'),
    ], { effects: { favor: 4, awkward: 14 }, danmaku: ['#cringe'], next: spicyOn ? 'ghost' : 'wrap' }),
    node('scream', [nar('你们的尖叫在俯冲段完美和声。下车后相视一眼,同时笑出声。'), npc('「你叫得比我还大声!哈哈哈哈嗓子都劈了!」')], { effects: { favor: 7 }, next: spicyOn ? 'ghost' : 'wrap' }),
    node('ghost', [
      nar('天黑了,最后一个项目:鬼屋。'),
      nar('进门三十秒,一只「贞子」从侧面爬出。黑暗里,TA一把攥住了你的胳膊,整个人贴了过来。'),
    ], {
      choices: [
        { text: '稳住,把TA护在身侧:「别怕,看脚下,跟我走」', effects: { favor: 12, npcFlags: ['tension'] }, danmaku: ['#win'], goto: 'g1' },
        { text: '你叫得比TA还大声,反手抓住了TA', effects: { favor: 2, awkward: 12 }, goto: 'g2' },
      ],
    }),
    node('g1', [
      nar('出口的光亮起来时,TA才发现自己一直没松手。'),
      npc('「……刚才,就是本能反应啊。」'),
      nar('TA说这话时没看你,手却是慢慢松开的,一根手指一根手指的那种慢。'),
    ], { next: 'wrap' }),
    node('g2', [npc('「你到底谁怕鬼?!哈哈哈哈哈笑死我了!」'), nar('从鬼屋出来,TA扶着墙笑了三分钟。你社死了,但奇怪的是,距离近了。')], { next: 'wrap' }),
    node('wrap', [nar(`夜场的烟花在${spot.location}上空炸开。${p.name}仰着头,侧脸被烟花照亮又暗下去。`)], { end: true }),
  ]
  return scene(`date_park_${p.id}`, '游乐园', spot.location, 'park', nodes)
}

// ============ 🔐 密室逃脱 ============
const mishi: DateTemplate = (p, n, s, spot) => {
  const nodes: NodeDef[] = [
    node('a', [
      nar(`${spot.location}。NPC递上道具服,灯一灭,门在身后锁死。60分钟,一间暗房,两个人。`),
      npc('「先说好,一会儿有恐怖桥段,你可别扔下我跑。」'),
      nar('话音刚落,走廊尽头传来一声不知道是音效还是真人的哭腔。'),
    ], {
      choices: [
        {
          text: '冷静分析机关结构:先找光源,再找线索,跟我走',
          check: { skill: 'mind', dc: 12, pass: 'lead_ok', fail: 'lead_fail', crit: 'lead_crit' },
        },
        { text: '把外套披给TA:抓紧我袖子,咱们慢慢来', effects: { favor: 8, care: true }, goto: 'protect' },
        { text: '嘴硬三秒后,被音效吓得先叫出了声', effects: { favor: 2, awkward: 10 }, goto: 'scream' },
      ],
    }),
    node('lead_crit', [
      nar('你十分钟连解三个机关,NPC在监控室里发消息问店长:「这单是不是来了个同行?」'),
      npc('「你也太稳了吧?!好,这局我就跟着你了。」'),
      nar('黑暗里,TA的手很自然地搭上了你的肩,再没拿下来。'),
    ], { effects: { favor: 13, npcFlags: ['tension'] }, danmaku: ['#smart'], next: 'beat2' }),
    node('lead_ok', [nar('你有条不紊地推着进度,TA跟在你身后半步的位置。'), npc('「不错啊,关键时刻有个能靠的人。」')], { effects: { favor: 8 }, next: 'beat2' }),
    node('lead_fail', [
      nar('你自信满满地拉开一扇柜门——里面的「尸体」和你四目相对。'),
      nar('你和它同时尖叫。TA在旁边笑到蹲下。'),
      npc('「哈哈哈哈哈你刚才的音调比我还高!」'),
    ], { effects: { favor: 3, awkward: 12 }, danmaku: ['#cringe'], next: 'beat2' }),
    node('protect', [
      nar('TA攥着你的袖口走完了整个暗廊。出机关房的时候,攥的已经不是袖口,是手腕。'),
      npc('「……刚才,是本能。你别多想。」(TA先说的)'),
    ], { effects: { npcFlags: ['tension'] }, next: 'beat2' }),
    node('scream', [npc('「说好的保护我呢?!哈哈哈哈行,那我保护你吧。」'), nar('TA把你拽到身后。这个约会的攻防关系,当场倒转。')], { next: 'beat2' }),
    node('beat2', [
      nar('最后一关是双人协作:一人背密码,一人穿过红外线去输入。TA看了你一眼:'),
      npc('「你记性好还是身手好?选一个。」'),
    ], {
      choices: [
        {
          text: '背密码:十六位乱码,过目不忘给TA看',
          check: { skill: 'culture', dc: 12, pass: 'final_ok', fail: 'final_fail' },
        },
        {
          text: '穿红外线:压低重心,给TA表演一个人体极限',
          check: { skill: 'image', dc: 12, pass: 'final_ok', fail: 'final_flop' },
        },
      ],
    }),
    node('final_ok', [
      nar('通关灯亮起的瞬间,店员进来说你们打破了本月纪录。'),
      npc('「击个掌!」TA的手心很烫,「我们还挺合拍的,你发现没?」'),
    ], { effects: { favor: 10, npcFlags: ['deep_talk'] }, danmaku: ['#win'], next: 'wrap' }),
    node('final_fail', [nar('你背错了第九位,警报响起,全屋红光。'), npc('「哈哈哈哈没事,输了一起输,这才叫团建。」')], { effects: { favor: 4, awkward: 6 }, next: 'wrap' }),
    node('final_flop', [nar('你在红外线阵里卡成了一个大字,NPC进来把你「救」了出去。'), npc('「刚才那个姿势,我拍下来了。删不删,看你今晚表现。」')], { effects: { favor: 5, awkward: 12 }, danmaku: ['#cringe'], next: 'wrap' }),
    node('wrap', [nar(`走出${spot.location},重见天光,像共享了一场小小的生死。${p.name}揉着眼睛看你,笑意还没散。`)], { end: true }),
  ]
  return scene(`date_mishi_${p.id}`, '密室逃脱', spot.location, 'mishi', nodes)
}

// ============ 🎸 Livehouse ============
const livehouse: DateTemplate = (p, n, s, spot) => {
  const indie = loves(p, 'indie')
  const nodes: NodeDef[] = [
    node('a', [
      nar(`${spot.location}。检票,寄存,耳膜开始适应音墙。台上调音,台下人头攒动。`),
      npc('「跟你说,这支乐队我听了五年,主唱开口你就懂了。」'),
      nar('灯光暗下来,第一个音炸开。人潮往前涌,把你们挤得肩贴肩。'),
    ], {
      choices: [
        { text: '侧身替TA挡住人潮,让TA站在最好的位置', effects: { favor: 9, care: true }, danmaku: ['#simp'], goto: 'guard' },
        {
          text: '跟着音乐点头,在副歌处准确唱出了歌词',
          check: { skill: 'culture', dc: indie ? 11 : 13, pass: 'sing_ok', fail: 'sing_fail' },
        },
        { text: '掏出手机开始录像,一录录了三首歌', effects: { favor: -6 }, goto: 'phone' },
      ],
    }),
    node('guard', [
      nar('整场演出,你是TA身后一堵会呼吸的墙。'),
      npc('(TA回头,凑到你耳边喊)「你不用一直护着我!……不过,谢谢。」'),
      nar('音乐太吵,有些话必须凑得很近才能说。这是Livehouse的物理学浪漫。'),
    ], { effects: { npcFlags: ['tension'] }, next: 'encore' }),
    node('sing_ok', [
      npc('「??你也听他们?!」'),
      nar('TA眼睛瞪圆了,像在人海里捡到了同类。接下来的每一首,你们都合唱。'),
    ], { effects: { favor: 12, npcFlags: ['deep_talk'] }, danmaku: ['#win'], next: 'encore' }),
    node('sing_fail', [
      nar('你张嘴的时机不对,把第二段主歌唱成了第一段,还唱得很大声。'),
      npc('「……你刚才唱的是哪个平行宇宙的版本?」'),
    ], { effects: { favor: 0, awkward: 8 }, next: 'encore' }),
    node('phone', [
      npc('「诶,你能不能……先别录了?」'),
      nar('TA指了指台上:「现场是用来活在里面的,不是用来存进相册的。」你默默收起了手机。'),
    ], { next: 'encore' }),
    node('encore', [
      nar('安可环节。主唱说:「最后一首,送给今天带着重要的人来的朋友。」'),
      nar('前奏响起,是一首慢歌。周围的人开始亮起手机灯,像一片星海。'),
    ], {
      choices: [
        { text: '也打开手机灯,轻轻靠近TA的肩膀', effects: { favor: 10, npcFlags: ['tension'] }, danmaku: ['#win'], goto: 'slow' },
        { text: '大声跟唱,把这首慢歌唱成你的告白预演', effects: { favor: indie ? 9 : 5 }, goto: 'loud' },
        { text: '趁气氛正好,问TA:这首歌,你第一次听是什么时候?', effects: { favor: 8, npcFlags: ['deep_talk'], care: true }, goto: 'story' },
      ],
    }),
    node('slow', [
      nar('两盏手机灯挨在一起晃。TA的肩膀碰到你的,谁都没有让开。'),
      npc('(散场后)「刚才那首歌……算了,没什么。走吧。」'),
      nar('有些话被音乐替她说完了。'),
    ], { next: 'wrap' }),
    node('loud', [npc('「你嗓子还挺敢的!」'), nar('TA笑着跟你一起吼完了最后一个长音,嗓子哑了,眼睛亮了。')], { next: 'wrap' }),
    node('story', [
      npc('「第一次听是大四,在学校后门的小店,单曲循环了一个冬天。」'),
      nar('TA讲了那个冬天的故事。散场的人流从你们身边绕过去,像水绕过石头。'),
    ], { next: 'wrap' }),
    node('wrap', [nar(`散场。耳鸣像一层温柔的膜。${p.name}的嗓音哑哑的:「下次巡演,还一起?」`)], { end: true }),
  ]
  return scene(`date_lh_${p.id}`, 'Livehouse', spot.location, 'livehouse', nodes)
}

// ============ ♨️ 温泉汤泉 ============
const wenquan: DateTemplate = (p, n, s, spot) => {
  const nodes: NodeDef[] = [
    node('a', [
      nar(`${spot.location}。换好泡汤服,水汽氤氲。露天池上方,北京难得的星星探出头来。`),
      npc('「啊——」TA把自己沉到肩膀,长出一口气,「这才叫活着。」'),
      nar('热水把人泡软,也把话匣子泡开。'),
    ], {
      choices: [
        { text: '聊点泡汤才敢聊的:「说一件你从没跟人说过的小事吧」', effects: { favor: 9, npcFlags: ['deep_talk'] }, goto: 'deep' },
        { text: '安静地泡着,偶尔搭一句,让热水替你们聊', goto: loves(p, 'chill') || loves(p, 'indie') ? 'quiet_ok' : 'quiet_meh' },
        {
          text: '给TA科普泡汤养生学,从水温讲到微量元素',
          check: { skill: 'culture', dc: 13, pass: 'nerd_ok', fail: 'nerd_fail' },
        },
      ],
    }),
    node('deep', [
      npc('「从没说过的……」TA看着水面想了很久。'),
      npc('「小时候我偷偷改过一次成绩单。改完愧疚到自己又改了回去。」'),
      nar('你们在热水里交换了几件谁都没说过的小事。有些秘密不重,但交出来的动作很重。'),
    ], { effects: { favor: 6 }, next: 'beat2' }),
    node('quiet_ok', [npc('「你知道吗,能一起安静待着不尴尬的人,很少。」'), nar('水声,风声,远处的笑声。你们什么都没说,又好像说了很多。')], { effects: { favor: 9 }, next: 'beat2' }),
    node('quiet_meh', [nar('TA等了半天,发现你真的一句话都不打算说。'), npc('「……你不会泡睡着了吧?」')], { effects: { favor: -2 }, next: 'beat2' }),
    node('nerd_ok', [npc('「偏硅酸?你连这个都懂?」'), nar('TA听得认真,末了说:「跟你出来总能学点东西,还挺上瘾的。」')], { effects: { favor: 8 }, next: 'beat2' }),
    node('nerd_fail', [nar('你把「氡泉」念成了「dōng泉」,还编了一段功效。'), npc('「……你刚才那个字,念rán吧?」也不对。你们查了字典,一起社死。')], { effects: { favor: 1, awkward: 10 }, next: 'beat2' }),
    node('beat2', [
      nar('泡完出来,休息区。自动贩卖机的灯光下,TA的头发湿漉漉的,脸被泡得微红。'),
      npc('「泡完汤必须吃点什么,这是规矩。」'),
    ], {
      choices: [
        { text: '变出两根盐水冰棍:泡汤配冰棍,人间小满足', effects: { wallet: -12, favor: 9, care: true }, goto: 'ice' },
        { text: '点两碗温泉蛋乌冬面,认真吃一顿宵夜', effects: { wallet: -96, favor: 7 }, goto: 'noodle' },
        { text: '提议再战按摩椅:二十分钟,把这周的班全按掉', effects: { wallet: -40, favor: 6 }, goto: 'massage' },
      ],
    }),
    node('ice', [npc('「你怎么知道我泡完就想吃这个!」'), nar('两根冰棍,一台贩卖机的白光。TA咬了一口,眯起眼睛,像只被顺毛的猫。')], { next: 'wrap' }),
    node('noodle', [nar('热汤下肚,TA满足地叹气:「泡汤+乌冬,这个组合谁发明的,应该发诺贝尔奖。」')], { next: 'wrap' }),
    node('massage', [nar('两台按摩椅并排嗡嗡作响。你们被揉得东倒西歪,笑作一团,像两条搁浅的鱼。'), npc('「哈哈哈哈别说话,说话咬舌头——」')], { next: 'wrap' }),
    node('wrap', [nar(`夜风把水汽吹散。${p.name}的头发还没全干,整个人都是软的:「今天……好像把这个月的疲惫都还掉了。」`)], { end: true }),
  ]
  return scene(`date_wq_${p.id}`, '温泉汤泉', spot.location, 'wenquan', nodes)
}

export const TEMPLATES: Record<TemplateId, DateTemplate> = {
  bar,
  expo,
  dinner,
  citywalk,
  sport,
  shopping,
  ktv,
  jubensha,
  park,
  mishi,
  livehouse,
  wenquan,
}
