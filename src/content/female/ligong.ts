import { CharacterProfile } from '@/engine/types'
import { chat, me, nar, node, npc } from '../util'

export const ligong: CharacterProfile = {
  id: 'ligong',
  name: '西二旗李工',
  emoji: '⌨️',
  color: '#60a5fa',
  bio: '大厂后端 | 格子衫是工服不是品味 | 有期权(纸面) | 谈恋爱像提需求,请提',
  archetype: '西二旗程序员,理性直男天花板,真诚得像开源代码',
  loves: ['practical', 'frugal', 'sincere', 'corporate'],
  hates: ['flex'],
  deathTags: ['zhi'],
  decay: 4,
  mainSkill: 'mind',
  confirmYes: '「我评估过了,这段关系的单元测试全部通过。」他推了推眼镜,耳根通红,「……说人话就是,我可能很早就喜欢你了。」',
  confirmNo: '「这个需求……我需要再排期评估一下。抱歉,不是你的问题,是我这边资源没到位。」',
  moodLines: {
    great: '「我的方案今天上线了,零故障!组里都说是奇迹。今天心情好,你说什么都对。」',
    hungover: '「昨晚团建被灌了……程序员团建为什么也要喝酒,这不合理,这是个bug。」',
    slacking: '「今天代码评审被驳回三次。我现在只想躺着,当一段没人调用的废弃代码。」',
    grumpy: '「凌晨三点被on-call电话叫起来修故障,修完发现是别组的锅。勿cue,会炸。」',
  },
  blockLines: [
    '「好的,收到。祝好。」(他把你移出了所有列表,像下线一个服务)',
    '「经过评估,我们的兼容性存在根本性问题。就到这里吧。」',
  ],
  intro: chat('lg_intro', [
    node('a', [
      npc('「你好。李工,西二旗,后端开发。」'),
      npc('「先同步一下背景:我不太会聊天,朋友说我发消息像写周报。如果冒犯,请理解为兼容性问题,不是恶意。」'),
      nar('三句话,自带免责声明。这很后端。'),
    ], {
      choices: [
        { text: '回:没事,我读周报能力很强。这周OKR:认识你', effects: { favor: 10 }, danmaku: ['#smart'], goto: 'b1' },
        { text: '回:那我们定个通信协议吧,你说话直,我不多心', effects: { favor: 11, npcFlags: ['protocol'] }, goto: 'b2' },
        { text: '回:程序员是吧,帮我看看电脑呗,最近老卡', effects: { favor: -3 }, goto: 'b3' },
      ],
    }),
    node('b1', [npc('「……你把OKR用在这里,属于创造性滥用。」'), npc('「但是,批准了。」')], { end: true }),
    node('b2', [npc('「通信协议。」'), npc('「这是我在这个App上收到过的最工程化、也最温柔的提议。协议已生效。」')], { end: true }),
    node('b3', [npc('「好的。内存多大?系统版本?最近装过什么软件?」'), nar('他认真回复了一整页排查步骤。你意识到,他没听出这是敷衍,他真的在修。'), npc('「按上面的做,应该能解决。」')], { effects: { favor: 2 }, end: true }),
  ]),
  topics: [
    chat('lg_t1', [
      node('a', [
        npc('「有个东西发你,你别有压力。」'),
        npc('(他发来一份Excel:《关于我与你继续接触的可行性分析V1.3》,含SWOT分析、风险矩阵和甘特图)'),
        nar('表格做得极其认真。「机会」一栏写着:她笑起来的时候,我的心率不符合静息标准。'),
      ], {
        choices: [
          {
            text: '仔细看完,发现藏在表格角落里的那句话',
            check: { skill: 'mind', dc: 12, pass: 'b1', fail: 'b2', crit: 'b1c' },
          },
          { text: '回:哈哈哈哈什么鬼,谈恋爱谁做表啊', effects: { favor: -7, saying: 'hhh' }, goto: 'b3' },
          { text: '回:V1.3?说明你已经改了三版了。改给我看的?', effects: { favor: 10 }, danmaku: ['#smart'], goto: 'b4' },
        ],
      }),
      node('b1c', [
        me('「第38行,备注列,字号调成了6号:『其实这份表是借口,我只是想让你知道我很认真。』——我看到了。」'),
        npc('「…………」'),
        npc('「那行字我写完就后悔了,又舍不得删,就把字号调到最小。」'),
        npc('「你是第一个看到的人。测试通过。」'),
      ], { effects: { favor: 15, npcFlags: ['deep_talk'] }, danmaku: ['#win'], end: true }),
      node('b1', [me('「风险矩阵里写『可能配不上她』,概率你标了60%……这个数据我要求修正。」'), npc('「修正为多少?」'), me('「0%。」'), npc('「……收到。已修正。」')], { effects: { favor: 12 }, danmaku: ['#simp'], end: true }),
      node('b2', [nar('你大概扫了一眼,回了个「做得好细啊」。'), npc('「谢谢。花了三个晚上。」'), nar('你隐约觉得错过了什么,但表格太长了,谁会逐行看呢。')], { effects: { favor: 3 }, end: true }),
      node('b3', [npc('「哦,好的。打扰了。」'), npc('「表我撤回了。就当是个玩笑。」'), nar('他撤回了表格。有些认真,被笑声劝退了。')], { effects: { awkward: 5 }, end: true }),
      node('b4', [npc('「……被发现了。」'), npc('「V1.0太像述职了,V1.1数据太冷,V1.2我妈看了说像判决书。」'), npc('「V1.3,是我能做到的,最像情书的样子。」')], { end: true }),
    ]),
    chat('lg_t2', [
      node('a', [
        npc('「问个直接的问题:你介意我穿格子衫吗?」'),
        npc('「上一个约会对象说,跟我走在一起像带着运维。我后来想了想,那天我确实背了双肩包,里面确实有网线。」'),
      ], {
        choices: [
          { text: '回:不介意。格子衫是你的皮肤,网线是你的尾巴,都挺好', effects: { favor: 10 }, goto: 'b1' },
          { text: '回:介意。但我可以陪你买衣服,改造这个项目我接了', effects: { favor: 8, npcFlags: ['makeover'] }, goto: 'b2' },
          { text: '回:确实像运维,哈哈,你们程序员真是一个模子的', effects: { favor: -10, mine: true }, goto: 'b3' },
        ],
      }),
      node('b1', [npc('「『网线是尾巴』……我笑了,真的,物理意义上的。」'), npc('「你是第一个没有想改造我的人。」')], { end: true }),
      node('b2', [npc('「立项了?好,预算我出,审美你出,我只有一个需求:别让我穿豆豆鞋。」'), nar('他认真地把「买衣服」写进了日历,提醒设了三个。')], { end: true }),
      node('b3', [npc('「一个模子。」'), npc('「好的。」'), nar('两个字,一个句号。你感觉他把这句话存进了某个名为「记仇」的数据库,持久化存储,永不过期。')], { effects: { awkward: 4 }, end: true }),
    ]),
    chat('lg_t3', [
      node('a', [
        npc('「凌晨两点,刚修完线上故障。睡不着,跟你说点代码以外的事。」'),
        npc('「我大学不是学计算机的,是学音乐的,古典吉他。转行是因为我爸病了,需要钱,代码来钱快。」'),
        npc('「琴还在出租屋角落放着。八年了,弦都锈了,一直没换。」'),
      ], {
        choices: [
          {
            text: '回:换弦吧。这周末我陪你去,顺便听你弹一首,弹错也算数',
            effects: { favor: 14, npcFlags: ['lg_guitar'], care: true },
            danmaku: ['#simp'],
            goto: 'b1',
          },
          { text: '回:学音乐的转码,你这个人生比你的表格精彩多了', effects: { favor: 6 }, goto: 'b2' },
          { text: '回:代码确实来钱快,转得对,音乐当爱好就行', effects: { favor: -2 }, goto: 'b3' },
        ],
      }),
      node('b1', [
        npc('「………………」'),
        npc('「弦一套也就几十块钱,我不是买不起。我是怕换了弦,就没有借口不弹了。」'),
        npc('「『弹错也算数』……好。这周末。一言为定。」'),
        nar('你解锁了李工的隐藏分支:那个在琴房练到手指流血的少年,一直在等一个观众。'),
      ], { end: true }),
      node('b2', [npc('「精彩谈不上,都是被生活推着走的。」'), npc('「不过谢谢你听完了,没有说『多喝热水早点睡』。」')], { end: true }),
      node('b3', [npc('「嗯,你说得对,很理性。」'), npc('「晚安。」'), nar('他难得说了一次「你说得对」,听起来却像一次静默失败。')], { end: true }),
    ]),
  ],
  dateSpots: [
    { template: 'sport', location: '奥森公园', price: 40, label: '奥森跑步(他的碳水补给日)' },
    { template: 'dinner', location: '海底捞', price: 230, label: '海底捞(服务使他安心)' },
    { template: 'citywalk', location: '亮马河', price: 50, label: '亮马河遛弯' },
  ],
  he: {
    title: '需求上线',
    badge: '通过单元测试的爱情',
    comment: '你和李工在一起了。他把你的生日、纪念日、经期写成了定时任务,备注:「P0级,不可延期。」',
    secretCode: '西二旗的晚风',
  },
  trueFlag: 'lg_guitar',
  trueHe: {
    title: '换弦',
    badge: '八年后的第一个观众',
    comment: '周末,他换好了弦,坐在出租屋的床边给你弹了《爱的罗曼史》,弹错了四次,重来了四次。你鼓了四次掌。他说这是他这八年写得最好的代码。',
  },
}
