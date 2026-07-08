import { CharacterProfile } from '@/engine/types'
import { chat, me, nar, node, npc } from '../util'

export const coco: CharacterProfile = {
  id: 'coco',
  name: '不谈恋爱的Coco',
  emoji: '🥂',
  color: '#f472b6',
  bio: '都市情感玩家 | 只交朋友,不谈恋爱 | 别问我们是什么关系,问就是「有意思的关系」 | 早餐不留',
  archetype: '城市夜晚的常客,把亲密当游戏规则,直到有人让她想留下来吃早餐',
  loves: ['chill', 'equal', 'romantic'],
  hates: ['practical'],
  deathTags: ['trad'],
  decay: 11,
  mainSkill: 'mind',
  spicy: 0.35,
  confirmYes: '「我给自己立过规矩:不留早餐,不问下次,不谈以后。」她看着你,把杯子放下,「恭喜你,三条全给你破了。……说吧,豆浆还是咖啡?」',
  confirmNo: '「别把这个说出口,好吗?」她按住你的手,「说出口,我们就得变成一个『关系』。我还没准备好,把你变成一个名词。」',
  moodLines: {
    great: '「今晚状态绝佳,全世界都在对我抛媚眼~你要是不出现,可就有别人递酒了哦。」',
    hungover: '「昨晚喝大了……在别人的沙发上醒来,是我自己家的沙发。空虚,但省了打车钱。」',
    slacking: '「今天谁都不想见。城市玩家也有电量耗尽的时候,充电方式:失联。」',
    grumpy: '「刚有个前『朋友』跑来兴师问罪,问我们算什么。烦。规则写脸上了还装看不见。」',
  },
  blockLines: [
    '「游戏规则第一条:别谈拥有。你犯规了,出局。」',
    '「你要找的是个老婆,不是我。祝你早日脱单,别在我这浪费时间。」',
  ],
  intro: chat('coco_intro', [
    node('a', [
      npc('「Hi~先看清楚我的简介再聊哦:不谈恋爱。」'),
      npc('「我玩的是另一种游戏:今晚愉快,明天各自上班,谁也不欠谁。能接受吗?」'),
      nar('规则清晰,边界明确。这是位把丑话说在最前面的玩家。'),
    ], {
      choices: [
        { text: '回:能接受。不过我这人有个坏毛病——玩着玩着容易认真,到时候提前跟你打招呼', effects: { favor: 11 }, danmaku: ['#smart'], goto: 'b1' },
        { text: '回:规则收到。那第一局什么时候开?', effects: { favor: 9 }, goto: 'b2' },
        { text: '回:女孩子还是要正经谈恋爱结婚的,玩这些干嘛', effects: { block: '拿着户口本闯进了Coco的游戏厅' }, danmaku: ['#block'] },
      ],
    }),
    node('b1', [npc('「『提前打招呼』?哈,有意思。」'), npc('「行,那说好了:你认真的那天,记得报备。我好提前跑路——或者,提前决定跑不跑。」')], { end: true }),
    node('b2', [npc('「爽快,我喜欢不废话的。」'), npc('「本周五,三里屯,输的人买单。玩什么?到了你就知道了。」')], { end: true }),
  ]),
  topics: [
    chat('coco_t1', [
      node('a', [
        npc('「昨晚的局上,有个男的问我:你玩这么凶,图什么?」'),
        npc('「我反问他:你们上班图什么?他说图钱。我说,对,你图的东西能存进银行,我图的存不了,所以得当场花掉。」'),
        npc('「你觉得我这个回答怎么样?」'),
      ], {
        choices: [
          { text: '回:回答很漂亮。但「存不了所以当场花」——听起来也像不敢存', check: { skill: 'mind', dc: 14, pass: 'b1', fail: 'b2' } },
          { text: '回:通透。及时行乐本来就是种能力', effects: { favor: 8 }, goto: 'b3' },
          { text: '回:强词夺理,玩就是玩,别上价值', effects: { favor: -7, mine: true }, goto: 'b4' },
        ],
      }),
      node('b1', [
        npc('「……」'),
        npc('「『不敢存』。」'),
        npc('「你这句话犯规了。我们玩家之间,不兴看穿的。」'),
        nar('她隔了很久才回复。屏幕那头,有什么东西被说中了。'),
      ], { effects: { favor: 12, npcFlags: ['deep_talk'] }, danmaku: ['#smart'], end: true }),
      node('b2', [me('「回答很漂亮,你这个人也很漂亮。」'), npc('「谢谢,这句我今晚听第四遍了。」'), nar('油腻的赞美在她这里是通货膨胀的,不值钱。')], { effects: { favor: 1 }, end: true }),
      node('b3', [npc('「『能力』,对!」'), npc('「大部分人管这叫堕落,你管它叫能力。你的词典我喜欢。」')], { end: true }),
      node('b4', [npc('「哦,上价值的是你哦。」'), npc('「我描述生活,你打分。这毛病,改改。」')], { end: true }),
    ]),
    chat('coco_t2', [
      node('a', [
        npc('「说个好笑的:我妈托人给我介绍对象,体制内,有房,照片端正得像证件照。」'),
        npc('「我妈说:玩够了吧?该收心了。」'),
        npc('「你说,『收心』这个词是不是很吓人?好像心是个野生动物,得抓回来关笼子里。」'),
      ], {
        choices: [
          { text: '回:心不用收,用安。安是它自己想停,收是被逮捕', effects: { favor: 12 }, danmaku: ['#smart'], goto: 'b1' },
          { text: '回:你妈也是为你好,年纪到了确实该考虑了', effects: { block: '和Coco妈站在了同一战壕' }, danmaku: ['#block'] },
          { text: '回:那就继续野着呗,笼子留给想进的人', effects: { favor: 8 }, goto: 'b2' },
        ],
      }),
      node('b1', [
        npc('「『安是它自己想停,收是被逮捕』。」'),
        npc('「……你等下,我把这句发给我妈。」'),
        npc('「(一分钟后)我妈回了:『这话谁说的?让他来家里吃饭。』完了,你出名了。」'),
      ], { end: true }),
      node('b2', [npc('「哈,你倒是懂规矩。」'), npc('「不过说真的……偶尔也会想,野到什么时候是个头。算了,喝酒的时候不想这个。」')], { end: true }),
    ]),
    chat('coco_t3', [
      node('a', [
        npc('「问你个私人问题。」'),
        npc('「你有没有过那种时刻——热闹散了,人走了,你站在自己家门口,突然不想进去?」'),
        npc('「我经常。门里面太安静了。所以我总是最后一个走的,酒吧关灯我才走。」'),
      ], {
        choices: [
          {
            text: '(需要那晚之后)回:上次在你家,你趁我睡着偷偷煮了粥又倒掉了。下次别倒,我吃',
            showIf: 'stayed',
            effects: { favor: 15, npcFlags: ['coco_stay'] },
            danmaku: ['#win'],
            goto: 'b1',
          },
          { text: '回:那以后关灯后的那段路,我陪你走。走到你想进门为止', effects: { favor: 11, care: true }, danmaku: ['#simp'], goto: 'b2' },
          { text: '回:独处能力要练的,建议养只猫', effects: { favor: -5 }, goto: 'b3' },
        ],
      }),
      node('b1', [
        npc('「?!你怎么知道??」'),
        npc('「……我以为你睡死了。」'),
        npc('「那天我站在厨房想:要是他醒了,我就说是给自己煮的。你没醒,我就把它倒了。连同那点……算了。」'),
        me('「下次煮吧。我这个人,睡得轻,起得早,专门陪人吃早餐。」'),
        nar('你解锁了Coco的违禁品:一锅没送出去的粥,和一个差点破戒的清晨。'),
      ], { end: true }),
      node('b2', [npc('「『走到你想进门为止』……」'), npc('「你这句话,比今晚所有的酒都上头。犯规了啊,又犯规了。」')], { end: true }),
      node('b3', [npc('「猫,好主意。」'), npc('「猫不会在早上问我『我们算什么』。就这么办。谢谢建议,晚安。」'), nar('她用最快的速度采纳了你的建议,以及,结束了这次谈心。')], { end: true }),
    ]),
  ],
  dateSpots: [
    { template: 'bar', location: '三里屯(她的牌桌)', price: 800, label: '酒局(玩家的主场)' },
    { template: 'park', location: '欢乐谷夜场', price: 800, label: '夜场游乐园(她说白天没劲)' },
    { template: 'dinner', location: '深夜居酒屋', price: 500, label: '居酒屋(关灯前的最后一站)' },
    { template: 'citywalk', location: '亮马河夜航道', price: 60, label: '深夜亮马河(散场之后)' },
  ],
  he: {
    title: '游戏结束',
    badge: '让玩家退役的人',
    comment: '你和Coco在一起了。她在牌桌上宣布退役,老玩家们集体震惊。有人问她图什么,她说:「图他家的粥,比全北京的酒都解渴。」',
  },
  trueFlag: 'coco_stay',
  trueHe: {
    title: '早餐,留下了',
    badge: '第一个吃到那锅粥的人',
    comment: '某个清晨,她没有装睡,你也没有假装要走。她煮了粥,卧了两个蛋,推到你面前:「规则更新:早餐留给你,以后都留。」窗外的北京刚醒,谁也没说话,粥的热气把两个人都熏红了眼。',
  },
}
