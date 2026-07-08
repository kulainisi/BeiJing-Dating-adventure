import { CharacterProfile } from '@/engine/types'
import { chat, me, nar, node, npc } from '../util'

export const nana: CharacterProfile = {
  id: 'nana',
  name: '娜娜',
  emoji: '🍸',
  color: '#c084fc',
  bio: '三里屯常驻 | 千杯不醉(醉了不算) | 白天勿扰 | 人生苦短,先干为敬',
  archetype: '三里屯夜之女王,酒桌上的社交悍匪,白天是另一个人',
  loves: ['chill', 'romantic'],
  hates: ['corporate', 'trad'],
  deathTags: ['zhi', 'trad'],
  decay: 10,
  mainSkill: 'liquor',
  confirmYes: '「行啊。」她晃了晃杯子,冰块叮当响,「不过我提前说,跟我在一起,你的肝要有心理准备。」',
  confirmNo: '「别啊,咱俩现在这样多好。一确定关系,酒都变得有责任了。」',
  moodLines: {
    great: '「今晚店里来了个调酒师新人,被我喝服了,尊我一声『娜姐』!哈哈哈哈!」',
    hungover: '「昨晚超载了……别问,问就是最后一杯是敌人倒的。今天只喝水。」',
    slacking: '「今天连酒都不想喝。你敢信?我,不想,喝酒。世界末日了。」',
    grumpy: '「刚有个油腻老板在店里让我『给个面子』。面子给他了,拳头差点也给他了。」',
  },
  blockLines: [
    '「行,你的酒品就是人品,再见。」',
    '「这桌买单了,人也送客了。」',
  ],
  intro: chat('nn_intro', [
    node('a', [
      npc('「哟,新人。」'),
      npc('「我先把丑话说前面:我泡吧,我喝酒,我凌晨三点睡。你要是接受不了,现在退出还来得及,我不送。」'),
      nar('开局先立规矩,这很三里屯。'),
    ], {
      choices: [
        { text: '回:巧了,我也觉得人生不该有宵禁', effects: { favor: 9 }, goto: 'b1' },
        { text: '回:接受。但我有个条件:最后一杯,得跟我喝', check: { skill: 'mouth', dc: 13, pass: 'b2', fail: 'b3' } },
        { text: '回:女孩子还是少去那种场所吧,对身体不好', effects: { block: '第一句话就教娜娜做人' }, danmaku: ['#block'] },
      ],
    }),
    node('b1', [npc('「哈!『人生不该有宵禁』,这句词儿归我了,下次挂嘴边。」'), npc('「行,你过了海关。」')], { end: true }),
    node('b2', [npc('「……哟?」'), npc('「敢跟我预定最后一杯的,你是第一个。」'), npc('「胆子不小。我喜欢胆子大的。」')], { effects: { favor: 12 }, danmaku: ['#drink'], end: true }),
    node('b3', [me('「接受!但是那个……最后一杯能不能是酸奶。」'), npc('「酸奶????」'), npc('「哈哈哈哈哈哈行,你这个怂法还挺清新的。」')], { effects: { favor: 4, awkward: 5 }, end: true }),
  ]),
  topics: [
    chat('nn_t1', [
      node('a', [
        npc('「问你个题:一个女的,天天泡吧,喝酒比男的猛——你第一反应是什么?」'),
        npc('「说真话。我就喜欢听真话,假话我在店里听得够多了。」'),
      ], {
        choices: [
          { text: '真话:第一反应是「能处」,第二反应是「我练练酒量」', effects: { favor: 10 }, goto: 'b1' },
          { text: '真话:会好奇,她在躲什么,还是在找什么', effects: { favor: 12, npcFlags: ['deep_talk'] }, danmaku: ['#smart'], goto: 'b2' },
          { text: '真话:不像过日子的人', effects: { block: '给娜娜贴「不像过日子」标签' }, danmaku: ['#block'] },
        ],
      }),
      node('b1', [npc('「哈哈哈『我练练酒量』,有备而来啊。」'), npc('「行,你这个答案及格偏上。」')], { end: true }),
      node('b2', [npc('「……」'), npc('「你这个答案不及格。」'), npc('「因为太准了,超纲了。」'), nar('她隔了很久才回这句。')], { end: true }),
    ]),
    chat('nn_t2', [
      node('a', [
        npc('「昨晚店里有意思了,一男的非说他千杯不倒,三杯下去开始给全场背《出师表》。」'),
        npc('「所以说,酒桌是最好的照妖镜。你呢,你喝多了是什么画风?」'),
      ], {
        choices: [
          { text: '坦白:话变多,给朋友发小作文,第二天靠撤回功能续命', effects: { favor: 8 }, goto: 'b1' },
          { text: '回:我不知道,因为我从没让自己喝到那个程度', effects: { favor: 6 }, goto: 'b2' },
          { text: '吹牛:我?千杯不倒', check: { skill: 'liquor', dc: 14, pass: 'b3', fail: 'b4' } },
        ],
      }),
      node('b1', [npc('「小作文选手!哈哈哈哈我最爱看你们这种的翻车现场。」'), npc('「下次喝多了,小作文可以发我,我不嘲笑你。我截图。」')], { end: true }),
      node('b2', [npc('「控制型选手。」'), npc('「不错,但也无趣。人这一辈子,总得有几次刹车失灵。」')], { end: true }),
      node('b3', [npc('「哦??千杯不倒?」'), npc('「行,这话我记档案里了。下回当面验货,跑了算你输。」'), nar('你成功立住了人设,以及一个迟早要还的flag。')], { effects: { favor: 7, npcFlags: ['boast_drink'] }, danmaku: ['#drink'], end: true }),
      node('b4', [npc('「就你?」'), npc('「你打这行字的时候心虚不心虚?你头像都在冒冷汗。」'), nar('吹牛失败。她的酒精雷达一眼识破了你。')], { effects: { favor: -4, awkward: 6 }, end: true }),
    ]),
    chat('nn_t3', [
      node('a', [
        npc('「今天白班,累瘫……」'),
        npc('「哦对,你还不知道吧。我白天在宠物医院上班,兽医助理。」'),
        npc('「昨天送走了一只十六岁的金毛,主人哭到蹲在地上。我陪着办完手续,晚上就特别想喝一杯。现在你知道我为什么泡吧了。」'),
      ], {
        choices: [
          {
            text: '回:原来夜之女王的白天,在替别人接住眼泪。那你的眼泪谁接?',
            effects: { favor: 13, npcFlags: ['nana_day'], care: true },
            danmaku: ['#simp'],
            goto: 'b1',
          },
          { text: '回:兽医助理和夜店女王,反差感拉满,你可真酷', effects: { favor: 5 }, goto: 'b2' },
          { text: '回:那还是早点转行吧,又累钱又少', effects: { favor: -8, mine: true }, goto: 'b3' },
        ],
      }),
      node('b1', [
        npc('「……你干嘛。」'),
        npc('「大半夜的,问这种问题。」'),
        npc('「(过了五分钟)酒接。以前是。」'),
        nar('你解锁了娜娜的白天模式:凌晨三点的千杯不醉,是为了消化白天摸过的每一身皮毛。'),
      ], { end: true }),
      node('b2', [npc('「酷吧?我也觉得。」'), npc('「行了,煽情时间结束,明天还有一台绝育手术等着我。」')], { end: true }),
      node('b3', [npc('「转行?」'), npc('「你知道那只金毛走的时候,是在我怀里吗。」'), npc('「算了,跟你说这个干嘛。」'), nar('她收回了刚递出来的真心,像收回一杯没人碰的酒。')], { end: true }),
    ]),
  ],
  dateSpots: [
    { template: 'bar', location: '三里屯·她的主场', price: 400, label: '主场酒局(高危高收益)' },
    { template: 'dinner', location: '簋街小龙虾', price: 280, label: '簋街宵夜局' },
    { template: 'sport', location: '拳击体验课', price: 150, label: '拳击课(她教你)' },
  ],
  he: {
    title: '最后一杯',
    badge: '三里屯钦定陪酒(终身制)',
    comment: '你和娜娜在一起了。她在吧台宣布:「以后我的最后一杯,都归这位。」全场起哄,调酒师送了你们一杯「Free Love」。',
  },
  trueFlag: 'nana_day',
  trueHe: {
    title: '白天见',
    badge: '接住眼泪的人',
    comment: '她第一次约你在白天见面,在宠物医院门口,穿着工作服,怀里抱着一只刚脱险的橘猫。「今天不喝酒,」她说,「今天的开心是清醒的。」',
  },
}
