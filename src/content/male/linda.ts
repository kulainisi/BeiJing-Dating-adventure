import { CharacterProfile } from '@/engine/types'
import { chat, me, nar, node, npc } from '../util'

export const linda: CharacterProfile = {
  id: 'linda',
  name: '国贸Linda',
  emoji: '💼',
  color: '#e879a0',
  bio: '外企金融 | 咖啡因驱动 | work hard, brunch harder | 拒绝低效社交',
  archetype: '外企金融精英,中英文混合输出,把恋爱当项目管理',
  loves: ['flex', 'corporate', 'practical'],
  hates: ['chill', 'indie'],
  deathTags: ['frugal'],
  decay: 8,
  mainSkill: 'money',
  confirmYes: '「你的proposal……我approve了。不过丑话说前面,我脾气不好,加班很多,你要想清楚。」说完她自己先笑了。',
  confirmNo: '「你是个好人,但我现在的bandwidth真的不够……sorry,我们再看看好吗?」',
  moodLines: {
    great: '「今天mid-year review拿了个superb!晚上想庆祝一下,你说去哪?」',
    hungover: '「昨晚跟客户喝到两点……头好痛,说话小声一点。」',
    slacking: '「不想上班,不想开会,不想align任何东西。人为什么要工作。」',
    grumpy: '「刚开完一个毫无意义的会。现在我的耐心余额为零。」',
  },
  blockLines: [
    '「我们的value观alignment失败了,祝好。」',
    '「Sorry,我的schedule里没有这种对话的slot了。」',
    '「这段relationship的ROI是负的,及时止损吧。」',
  ],
  intro: chat('linda_intro', [
    node('a', [
      npc('「Hi,看到你了。先说好,我用这个App纯属我闺蜜逼的,别期待我有多热情。」'),
      npc('「自我介绍一下:Linda,金融,国贸。平时比较忙,回消息看缘分。」'),
    ], {
      choices: [
        {
          text: '回:那我三句话之内让你觉得下载这个App值了',
          check: { skill: 'mouth', dc: 12, pass: 'b_ok', fail: 'b_fail', crit: 'b_crit' },
        },
        { text: '回:忙点好,忙说明值钱。我也一样,咱们高效匹配', effects: { favor: 7 }, goto: 'b_biz' },
        { text: '发一个「打工人握手」表情包', effects: { favor: 2 }, goto: 'b_meme' },
      ],
    }),
    node('b_crit', [
      me('「第一句:你闺蜜眼光很好。第二句:我不需要你热情,我热情就够了。第三句:国贸下班见?」'),
      npc('「……」'),
      npc('「行,你这个opening有点东西。姑且不拉黑。」'),
      nar('高开。她的输入框显示了很久的「对方正在输入」。'),
    ], { effects: { favor: 14 } , end: true }),
    node('b_ok', [me('「值不值不是说出来的。你哪天有空,我用一顿brunch证明。」'), npc('「哈,口气不小。看你后续表现。」')], { effects: { favor: 8 }, end: true }),
    node('b_fail', [me('「呃……那个……你好,我觉得你头像很好看。」'), npc('「谢谢。」'), nar('一个句号,干净利落,像被HR挂断的电话。')], { effects: { favor: -3, awkward: 6 }, end: true }),
    node('b_biz', [npc('「哦?也是搞钱人。行,搞钱人跟搞钱人之间有基本的尊重。」')], { end: true }),
    node('b_meme', [npc('「哈哈,行吧,至少你不装。」'), nar('反应平平,但没有扣分。稳健开局。')], { end: true }),
  ]),
  topics: [
    chat('linda_t1', [
      node('a', [
        npc('「问你个事,你们公司年终奖发几个月?哦sorry,职业病,上来就BB benchmark。」'),
        npc('「其实我想问的是——你觉得,在北京,搞钱和生活能平衡吗?」'),
      ], {
        choices: [
          { text: '回:平衡不了。我选搞钱,生活是搞完钱的赠品', effects: { favor: 9 }, goto: 'b1' },
          { text: '回:我在努力平衡,比如现在,工作日晚上十点,在陪你聊天', effects: { favor: 11 }, danmaku: ['#smart'], goto: 'b2' },
          { text: '回:躺平不就平衡了,要那么多钱干嘛', effects: { favor: -9, awkward: 6 }, goto: 'b3' },
        ],
      }),
      node('b1', [npc('「哈,同类。」'), npc('「不过赠品这个说法有点惨,咱俩谁也别笑话谁。」')], { end: true }),
      node('b2', [npc('「……油嘴滑舌。」'), npc('「但我承认,这句我截图了。」'), nar('国贸Linda,截图了。')], { end: true }),
      node('b3', [npc('「躺平?」'), npc('「我见过凌晨四点的国贸,不是为了听这两个字的。」'), nar('气温骤降。')], { end: true }),
    ]),
    chat('linda_t2', [
      node('a', [
        npc('「今天面了个候选人,简历写着『精通Excel』,结果VLOOKUP都不会。」'),
        npc('「所以我现在对所有自称『精通』的人都保持怀疑。包括相亲市场上的。你呢,你精通什么?」'),
      ], {
        choices: [
          {
            text: '认真报出你真实的技能树,不掺水分',
            effects: { favor: 8, npcFlags: ['honest_cv'] },
            goto: 'b1',
          },
          { text: '回:精通把「在吗」聊成「在一起吗」', check: { skill: 'mouth', dc: 13, pass: 'b2', fail: 'b3' } },
          { text: '回:精通省钱。我这人最大的优点就是花得少', effects: { favor: -8, mine: true }, goto: 'b4' },
        ],
      }),
      node('b1', [npc('「难得,没吹。」'), npc('「说真的,这年头能对自己有清醒认知的人,比会VLOOKUP的还稀缺。」')], { end: true }),
      node('b2', [npc('「?」'), npc('「……好油,但是好笑。这句你练了多久?」'), nar('她拆穿了你,但语气是笑着的。')], { effects: { favor: 9 }, end: true }),
      node('b3', [npc('「哦。」'), nar('冷场。你的土味情话像一封被拒收的offer。')], { effects: { favor: -5, awkward: 8 }, end: true }),
      node('b4', [npc('「省钱……」'), npc('「不是说节俭不好,但把它当成最大的优点,格局是不是小了点。」'), nar('危险的气息。她的雷区边缘,你刚刚踩了一脚。')], { end: true }),
    ]),
    chat('linda_t3', [
      node('a', [
        npc('「跟你说个事,你别跟别人讲。」'),
        npc('「今天开会的时候我突然走神,想到我来北京第七年了,PPT做了几千页,可我妈连我具体做什么工作都讲不清楚。」'),
        npc('「有时候觉得,Linda这个人设好累啊。我本名叫翠花你信吗?开玩笑的。」'),
        nar('凌晨十一点半,国贸Linda的铠甲裂开了一条缝。'),
      ], {
        choices: [
          {
            text: '认真回:那让我认识一下人设后面那个人吧,从她的真名开始',
            effects: { favor: 13, npcFlags: ['linda_real'], care: true },
            danmaku: ['#simp'],
            goto: 'b1',
          },
          { text: '回:累就对了,说明你在向上走。撑住,你可是国贸Linda', effects: { favor: 4 }, goto: 'b2' },
          { text: '回:哈哈哈', effects: { favor: -6, saying: 'hhh' }, goto: 'b3' },
        ],
      }),
      node('b1', [
        npc('「………………」'),
        npc('「王秀丽。字面意义上的秀外慧中的秀,美丽的丽。土吧?」'),
        npc('「这个名字,国贸没人知道。现在多一个你。」'),
        nar('你解锁了Linda的隐藏档案:王秀丽,山东人,第一代北漂,家里最骄傲的孩子。'),
      ], { end: true }),
      node('b2', [npc('「……嗯,你说得对。」'), npc('「继续搬砖了。晚安。」'), nar('她收起了那条缝。你安慰得很标准,标准得像群发。')], { end: true }),
      node('b3', [npc('「哈哈哈。」'), npc('「对,挺好笑的。晚安。」'), nar('有些瞬间只出现一次。刚才那个,你用三个哈送走了。')], { end: true }),
    ]),
  ],
  hiddenTopics: [
    {
      codeId: 'paddle',
      script: chat('linda_hidden', [
        node('a', [
          npc('「跟你说个陈年八卦,我前任,健身教练,叫Kevin。」'),
          npc('「分手那天他跟我说:『Linda,你爱的是KPI,不是我。』」'),
          npc('「笑死,后来我刷到他朋友圈,一周三个不同的女学员合影。到底谁不真诚?」'),
          nar('【罗生门视角】你想起另一个版本的故事里,那个叫Kevin的教练,也说过他被一个金融女伤过心。'),
        ], {
          choices: [
            { text: '回:也许你们说的都是真的,只是爱的版本不兼容', effects: { favor: 10, npcFlags: ['deep_talk'] }, goto: 'b' },
            { text: '回:海王的眼泪也是眼泪,但不多', effects: { favor: 6 }, goto: 'b' },
          ],
        }),
        node('b', [npc('「……你这个人,聊天有点深度的。」'), npc('「这段黑历史就当我没说过。忘了啊。」')], { end: true }),
      ]),
    },
  ],
  dateSpots: [
    { template: 'shopping', location: 'SKP', price: 350, label: 'SKP逛街(危险与机遇并存)' },
    { template: 'bar', location: '三里屯某隐秘酒吧', price: 380, label: '三里屯小酌' },
    { template: 'dinner', location: '国贸新荣记', price: 520, label: '国贸吃顿好的' },
  ],
  he: {
    title: '并购成功',
    badge: '国贸合伙人',
    comment: '你和Linda确立了关系。她把你的备注从「App-38号」改成了你的名字,这是她给过男人的最高权限。',
    secretCode: '国贸的落日',
  },
  trueFlag: 'linda_real',
  trueHe: {
    title: '王秀丽的周末',
    badge: '透过铠甲看见人的人',
    comment: '周六早上,她素颜穿着拖鞋跟你去菜市场,用山东话砍价。国贸Linda休息了,王秀丽在笑。这是全北京限量发行的幸福。',
  },
}
