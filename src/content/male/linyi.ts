import { CharacterProfile } from '@/engine/types'
import { chat, me, nar, node, npc } from '../util'

export const linyi: CharacterProfile = {
  id: 'linyi',
  name: '规培林医生',
  emoji: '🩺',
  color: '#6ee7b7',
  bio: '三甲规培中 | 值班表比命硬 | 回消息延迟高峰期约36小时 | 谈恋爱?先挂个号吧',
  archetype: '规培医生,忙到没有生活,温柔藏在专业后面',
  loves: ['practical', 'sincere', 'equal'],
  hates: ['flex', 'chill'],
  deathTags: ['zhi'],
  decay: 3,
  mainSkill: 'mind',
  spicy: 0.05,
  confirmYes: '「我核对过了。」她认真地说,「过去三十天,我所有不值班的碎片时间,都想见你。这个数据,有统计学意义。在一起吧。」',
  confirmNo: '「对不起,我的规培还有两年……我不想让你等,也不敢让你等。你值得一个随叫随到的人。」',
  moodLines: {
    great: '「今天科里收的那个小朋友出院了!蹦蹦跳跳走的!学医这么多年,就为这种时刻。」',
    hungover: '「昨晚科室聚餐,主任敬酒……规培生的酒杯,是没有拒绝权的。」',
    slacking: '「连值三十六小时,刚下班。我现在的智力水平只够回复『嗯』和『哦』,见谅。」',
    grumpy: '「今天被家属指着鼻子骂了半小时,因为床位满了。我忍住了。现在需要安静。」',
  },
  blockLines: [
    '「抱歉,我的时间很有限,不想再浪费在这段对话上了。」',
    '「就到这吧。祝身体健康,真心的。」',
  ],
  intro: chat('ly_intro', [
    node('a', [
      npc('「你好,林医生……啊抱歉,职业习惯。叫我林一就行。」'),
      npc('「先坦白:我是规培医生,值班表反人类,约会可能被呼叫器打断,消息可能隔天才回。」'),
      npc('「上一个聊的人说我这是『假性单身』。你还聊吗?」'),
    ], {
      choices: [
        { text: '回:聊。你救人的时候我不打扰,你下班的时候我在,这不冲突', effects: { favor: 11 }, danmaku: ['#smart'], goto: 'b1' },
        { text: '回:36小时回消息……那我们用书信的心态聊,也挺浪漫', effects: { favor: 9 }, goto: 'b2' },
        { text: '回:医生好啊,铁饭碗,而且你们收入不是挺高的吗', effects: { block: '第一句话就数医生的钱包' }, danmaku: ['#block'] },
      ],
    }),
    node('b1', [npc('「……你是第一个没被值班表吓跑的。」'), npc('「行。那我先告诉你一个行业机密:医生的『马上』和北京人的『改天』一样,都是修辞。」')], { end: true }),
    node('b2', [npc('「书信的心态,哈哈,这个说法我喜欢。」'), npc('「那从今天起,见字如面。」')], { end: true }),
  ]),
  topics: [
    chat('ly_t1', [
      node('a', [
        npc('「问你个专业外的问题:凌晨三点的北京,你见过几次?」'),
        npc('「我这个月见了十一次。都是在抢救室的窗户里。」'),
      ], {
        choices: [
          { text: '回:那以后我陪你见几次凌晨三点——下班的那种,吃热干面的那种', effects: { favor: 11, care: true }, goto: 'b1' },
          { text: '认真答:加班见过几次。不过和你的比,我那都不算事', effects: { favor: 8 }, goto: 'b2' },
          { text: '回:何必这么拼,身体要紧,该躺就躺', effects: { favor: -6, mine: true }, goto: 'b3' },
        ],
      }),
      node('b1', [npc('「热干面……」'), npc('「成交。不过丑话说前面,我下夜班的样子,发型堪比梵高自画像。」')], { end: true }),
      node('b2', [npc('「不用比惨,累都是真的。」'), npc('「谢谢你没说『医生不都这样吗』。这句话我今年听吐了。」')], { end: true }),
      node('b3', [npc('「躺?」'), npc('「病人不躺我就不能躺。这不是拼,是这行的地心引力。」'), nar('她解释得很平静,但你能听出来,「该躺就躺」四个字有多隔靴搔痒。')], { end: true }),
    ]),
    chat('ly_t2', [
      node('a', [
        npc('「今天带教老师夸我缝合漂亮,开心一秒;转头查房被主任问住,当众卡壳,社死一小时。」'),
        npc('「考你个题,换你被当众问住,你怎么办?」'),
      ], {
        choices: [
          {
            text: '给出你的社死自救方案,要具体,要好笑',
            check: { skill: 'mouth', dc: 12, pass: 'b1', fail: 'b2', crit: 'b1c' },
          },
          { text: '回:大方承认不会,回去查文献,下次答上', effects: { favor: 9 }, goto: 'b3' },
        ],
      }),
      node('b1c', [
        me('「站直,推眼镜,缓缓说:『这个问题问得好,问到了本领域的争议点。』——然后祈祷主任自己开始输出。」'),
        npc('「哈哈哈哈哈这招太损了!!」'),
        npc('「不行,我记笔记了。下次查房实测,有效的话请你吃饭。」'),
      ], { effects: { favor: 13 }, danmaku: ['#smart'], end: true }),
      node('b1', [me('「深呼吸,报菜名式复述题干,争取思考时间。」'), npc('「专业!你这是有实战经验啊,哈哈。」')], { effects: { favor: 8 }, end: true }),
      node('b2', [me('「呃……原地装晕?你们那不是医院吗,晕了正好。」'), npc('「?在医院装晕,你会被最专业的手段五秒识破,并获得一次免费直肠指检。」'), nar('她用医学知识精准反杀,你竟无言以对。')], { effects: { favor: 3, awkward: 6 }, end: true }),
      node('b3', [npc('「标准答案。」'), npc('「不过说真的,能大方说『我不会』的人,比装会的人可靠多了。行医如此,做人也是。」')], { effects: { favor: 4 }, end: true }),
    ]),
    chat('ly_t3', [
      node('a', [
        npc('「今天科里出了点事,想跟你说说。」'),
        npc('「有个家属情绪失控,抡起拳头冲我带教老师去了。我没多想,就……站过去了。拳头蹭到我肩膀,保安来了,没大事。」'),
        npc('「我妈知道了,哭着让我辞职。可是……我要是怕这个,当年就不学医了。」'),
      ], {
        choices: [
          {
            text: '回:先看肩膀!冰敷了吗?——然后我要说:你站过去的样子,是我见过最帅的',
            effects: { favor: 14, npcFlags: ['ly_guard'], care: true },
            danmaku: ['#simp'],
            goto: 'b1',
          },
          { text: '回:太危险了,你妈说得对,要不考虑转行政岗?', effects: { favor: -4 }, goto: 'b2' },
          { text: '回:现在医闹确实多,你们医院安保得加强', effects: { favor: 2 }, goto: 'b3' },
        ],
      }),
      node('b1', [
        npc('「冰敷了,没事,就青了一块。」'),
        npc('「……你知道吗,所有人都在说『危险』『辞职』『何必』。只有你,先问了我的肩膀,然后说我帅。」'),
        npc('「林医生今天,心律不齐了一下。非病理性的。」'),
        nar('你解锁了林医生的诊断书:白大褂下面,是个需要有人心疼的、会疼的人。'),
      ], { end: true }),
      node('b2', [npc('「转行政……」'), npc('「你和我妈可以建个群了。算了,你们也是为我好。就是这份好,有点不认识我。」')], { end: true }),
      node('b3', [npc('「嗯,是要加强。」'), nar('你给出了一个新闻评论区水平的回复。她礼貌地结束了这个本可以走心的话题。')], { end: true }),
    ]),
  ],
  dateSpots: [
    { template: 'dinner', location: '医院旁的深夜小馆', price: 200, label: '下夜班的一顿热乎的' },
    { template: 'citywalk', location: '玉渊潭公园', price: 60, label: '玉渊潭散步(她的减压路线)' },
    { template: 'expo', location: '国家自然博物馆', price: 100, label: '自然博物馆(她讲人体展区)' },
    { template: 'sport', location: '奥森夜跑', price: 60, label: '夜跑(她唯一的运动时间)' },
  ],
  he: {
    title: '首诊负责制',
    badge: '林医生的私人陪诊',
    comment: '你和林医生在一起了。她把你的名字写进了值班表备注栏:「下班后,归他管。」科室群疯传了三天。',
  },
  trueFlag: 'ly_guard',
  trueHe: {
    title: '互相值班',
    badge: '替医生疼的人',
    comment: '她规培结业那天,把胸牌摘下来别在了你衣领上:「这几年,病人归我,我归你。现在正式移交:以后我们互相值班,谁也不许先下班。」',
  },
}
