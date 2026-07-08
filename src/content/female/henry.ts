import { CharacterProfile } from '@/engine/types'
import { chat, me, nar, node, npc } from '../util'

export const henry: CharacterProfile = {
  id: 'henry',
  name: '海归Henry',
  emoji: '🎩',
  color: '#93c5fd',
  bio: 'Ivy League回国 | 咨询行业 | Work globally, date locally | 中文有点rusty,见谅',
  archetype: '常春藤海归精英,中英夹杂的体面下,藏着一段不体面的回国真相',
  loves: ['flex', 'corporate'],
  hates: ['frugal', 'chill'],
  deathTags: ['zhi'],
  decay: 9,
  mainSkill: 'mouth',
  spicy: 0.12,
  confirmYes: '「我准备了三个版本的表白,英文的、中文的、还有一个PPT。」他深吸一口气,「但现在只想说人话:跟我在一起吧。这句没有翻译腔,是我的母语。」',
  confirmNo: '「You deserve better……不是,我是说,我现在的状态给不了承诺。等我把生活debug完,可以吗?」',
  moodLines: {
    great: '「今天的proposal被客户当场approve了!Partner夸我nailed it!晚上庆祝,你来,我请!」',
    hungover: '「昨晚alumni聚会,老同学都在比谁混得好……我喝多了。比较是快乐的小偷,古人诚不欺我。」',
    slacking: '「今天啥也不想干,只想躺着看《甄嬛传》。对,海归也看甄嬛传,还看了八遍。别告诉别人。」',
    grumpy: '「刚被客户challenge了两个小时,对方一句英文不会还嫌我『太多英文』。我现在情绪很international,就是国际化地烦。」',
  },
  blockLines: [
    '「Fine. 道不同不相为谋——这句我就不翻译了。」',
    '「Good luck with everything. 我们就到这里。」',
  ],
  intro: chat('hy_intro', [
    node('a', [
      npc('「Hi~ Henry,刚回国两年,在做consulting。抱歉我说话可能中英夹杂,在国外呆久了,switch不过来。」'),
      npc('「先问个ice-breaker:你对海归,是什么stereotype?」'),
      nar('三句话,四个英文单词。这浓度,建议佩戴护目镜。'),
    ], {
      choices: [
        { text: '回:没有刻板印象,只有一个疑问——你说梦话是中文还是英文?', effects: { favor: 11 }, danmaku: ['#smart'], goto: 'b1' },
        { text: '配合他:I mean,海归也分很多种,你看起来是professional的那种', effects: { favor: 7 }, goto: 'b2' },
        { text: '直接开炮:说人话。再夹英文我就当你中文不及格', check: { skill: 'mouth', dc: 13, pass: 'b3', fail: 'b4' } },
      ],
    }),
    node('b1', [npc('「梦话?哈哈哈这个问题好刁钻。」'), npc('「……据前室友反馈,是中文,而且是山东口音的中文。完了,人设第一天就崩给你看了。」')], { end: true }),
    node('b2', [npc('「Exactly!你也说英文呀,那咱们频道一致。」'), nar('他很受用。你陪他把这层皮又镀了一遍。')], { end: true }),
    node('b3', [me('「说人话。你再夹英文,我就当你中文不及格,给你报个新东方。」'), npc('「?!」'), npc('「哈哈哈哈哈行!痛快!你知道吗,回国两年,你是第一个敢当面拆我台的。就冲这个,coffee——咖啡,我请。」')], { effects: { favor: 12 }, danmaku: ['#smart'], end: true }),
    node('b4', [me('「你能不能说人话……」'), npc('「Sorry sorry,职业习惯。」'), nar('他道了歉,但接下来的对话里英文浓度丝毫未减。你的攻击没有击穿他的语言护甲。')], { effects: { favor: 2 }, end: true }),
  ]),
  topics: [
    chat('hy_t1', [
      node('a', [
        npc('「今天面了个candidate,简历写『精通英语』,我用英文问了句周末干嘛,他愣了十秒。」'),
        npc('「说起来,你的英语怎么样?我们用英文聊两句?Just for fun~」'),
        nar('警报:他在用自己的主场规则考你。'),
      ], {
        choices: [
          {
            text: '接招,用英文回他,末了再补一句地道的',
            check: { skill: 'culture', dc: 13, pass: 'b1', fail: 'b2', crit: 'b1c' },
          },
          { text: '反将一军:不聊英文。你敢用纯中文讲清楚你的工作吗,一个英文词都不带?', effects: { favor: 11 }, danmaku: ['#smart'], goto: 'b3' },
        ],
      }),
      node('b1c', [
        nar('你不仅接住了,还顺手用了个他没听过的俚语,并纠正了他一个介词。'),
        npc('「Wait——你这发音,你这用词……你也在国外呆过?」'),
        me('「没有,美剧看得多。」'),
        npc('「……我需要重新评估这段对话的power dynamic。」'),
      ], { effects: { favor: 13 }, danmaku: ['#smart'], end: true }),
      node('b1', [nar('你用工整的英文完成了对话,语法正确,礼貌得体。'), npc('「Nice!交流无障碍,舒服。」')], { effects: { favor: 8 }, end: true }),
      node('b2', [me('「Fine, thank you, and you?」'), npc('「……哈哈,哈哈哈。经典,很经典。」'), nar('他笑得很礼貌,礼貌得像在给你的英语默哀。')], { effects: { favor: -3, awkward: 6 }, end: true }),
      node('b3', [npc('「纯中文讲咨询?这有什么难——呃,就是帮客户做,那个,strategy……」'), me('「喝,第一句就犯规。」'), npc('「……好吧我输了。原来不是我英文好,是我中文退化了。这题你赢,赢得我有点心虚。」')], { end: true }),
    ]),
    chat('hy_t2', [
      node('a', [
        npc('「周末去了趟三里屯,碰见几个留学时的朋友。他们聊起谁留在了纽约,谁进了硅谷。」'),
        npc('「轮到我,我说我回北京了。桌上安静了一秒——就一秒,但我听见了。」'),
        npc('「你说,回国的人,是不是在那套叙事里,就低人一等?」'),
      ], {
        choices: [
          { text: '回:那一秒的安静是他们的局限,不是你的失败。在哪不重要,活成什么样才重要', effects: { favor: 11, care: true }, goto: 'b1' },
          { text: '回:比什么呀,他们在纽约挤地铁,你在北京也挤,全球统一,谁也别装', effects: { favor: 9 }, goto: 'b2' },
          { text: '回:确实,能留下的谁回来啊', effects: { favor: -9, mine: true }, goto: 'b3' },
        ],
      }),
      node('b1', [npc('「『他们的局限』……」'), npc('「谢谢。这一秒的安静,我消化了半年。你一句话给我翻篇了。」')], { end: true }),
      node('b2', [npc('「哈哈哈『全球统一挤地铁』!」'), npc('「有道理啊。曼哈顿的地铁比13号线破多了,还有老鼠。突然平衡了。」')], { end: true }),
      node('b3', [npc('「……」'), npc('「你这句话,和那一秒的安静,是同一个意思。只是你说出声了。」'), nar('他的语气冷静得可怕,像盖上了一份终审报告。')], { end: true }),
    ]),
    chat('hy_t3', [
      node('a', [
        npc('「今晚说点真的。你想不想听我回国的real story?不是酒桌上那个版本。」'),
        npc('「酒桌版本是:看好国内机会,主动回来的。」'),
        npc('「真实版本是:毕业那年没抽中工签,投了两百份简历,最后一个月房租都交不起,在朋友家沙发上睡了六周。回国的机票,是我妈买的。」'),
        npc('「『海归精英Henry』,是落地北京之后,我给自己缝的一件衣服。」'),
      ], {
        choices: [
          {
            text: '回:两百份简历、六周沙发、还敢重新开始——这比任何版本都精英。那件衣服,该换成勋章了',
            effects: { favor: 15, npcFlags: ['hy_true'], care: true },
            danmaku: ['#simp'],
            goto: 'b1',
          },
          { text: '回:原来是这样……那你现在总跟人夹英文,是不是也是那件「衣服」的一部分?', effects: { favor: 9 }, goto: 'b2' },
          { text: '回:啊?所以你是混不下去才回来的?', effects: { favor: -8, mine: true }, goto: 'b3' },
        ],
      }),
      node('b1', [
        npc('「『该换成勋章了』。」'),
        npc('「……我练习过一百种被拆穿之后的应对。唯独没练过,被拆穿之后,被抱住。」'),
        npc('「今晚这段,是off the record……不,说人话:今晚这段,只有你知道。」'),
        nar('你解锁了Henry的原始简历:一个摔过跟头、但没躺下的普通人。'),
      ], { end: true }),
      node('b2', [npc('「……是。」'), npc('「英文是我在那边活下来的证据。老夹着它,就好像那六周沙发,不算白睡。」'), npc('「你看得真准,准得我有点疼。」')], { effects: { favor: 6 }, end: true }),
      node('b3', [npc('「对,混不下去。」'), npc('「谢谢你的总结,精准,像我前老板的裁员邮件。」'), nar('他把刚脱下的那件衣服,又一颗扣子一颗扣子地穿了回去。')], { end: true }),
    ]),
  ],
  dateSpots: [
    { template: 'bar', location: '国贸顶层酒廊', price: 1200, label: '酒廊(他的社交货币)' },
    { template: 'dinner', location: '三里屯Brunch', price: 420, label: 'Brunch(海归乡愁套餐)' },
    { template: 'shopping', location: '三里屯太古里', price: 800, label: '太古里(他的置装课)' },
    { template: 'expo', location: '798·UCCA', price: 240, label: '看展(他用双语讲解)' },
  ],
  he: {
    title: 'Localized',
    badge: '让他说人话的人',
    comment: '你和Henry在一起了。他的朋友圈签名从「Work hard, play harder」改成了「胡同里也有咖啡,豆汁儿就免了」。中英夹杂率下降了60%,剩下40%他说是纪念品。',
  },
  trueFlag: 'hy_true',
  trueHe: {
    title: '简历之外',
    badge: '看过原始版本的人',
    comment: '他把那段「六周沙发」的经历,第一次讲给了别人——在一场留学分享会上,台下全是准备出国的孩子。讲完他说:「摔倒不丢人,丢人的是编一个没摔过的故事。」你在台下带头鼓掌,他冲你眨了眨眼。',
  },
}
