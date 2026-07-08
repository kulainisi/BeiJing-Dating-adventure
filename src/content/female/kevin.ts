import { CharacterProfile } from '@/engine/types'
import { chat, me, nar, node, npc } from '../util'

export const kevin: CharacterProfile = {
  id: 'kevin',
  name: '私教Kevin',
  emoji: '💪',
  color: '#f87171',
  bio: '国家认证私教 | 体脂9% | 你的身材我负责 | 首次体验课特惠中',
  archetype: '三里屯健身房顶流私教,话术满分的疑似海王,反杀线高危高收益',
  loves: ['practical', 'romantic', 'flex', 'frugal', 'indie', 'corporate', 'chill', 'trad', 'equal', 'sincere'],
  hates: [],
  deathTags: [],
  decay: 12,
  mainSkill: 'mind',
  spicy: 0.3,
  confirmYes: '「说真的,我带过三百个学员,说过很多漂亮话。」他挠了挠头,「但这句是新学的:我只想教你一个人了。」',
  confirmNo: '「宝……啊不是,我是说,咱们再处处看?最近课排得满,我怕委屈你。」',
  moodLines: {
    great: '「今天续课率100%!老板要给我发锦旗!晚上有空吗,想请你吃点好的~」',
    hungover: '「昨晚会员答谢宴,喝大了……私教喝酒属于职业事故,你可别举报我。」',
    slacking: '「今天一节课都不想上。举了十年铁,突然不知道在举什么。」',
    grumpy: '「刚有个会员上课迟到四十分钟还要求补时……我笑着说好的,心里已经加练了他两百个波比跳。」',
  },
  blockLines: [
    '「不好意思,我的课表满了,以后都满。」',
    '「你这样的会员,我带不了,退卡吧。」',
  ],
  intro: chat('kv_intro', [
    node('a', [
      npc('「Hi~看到你了,眼缘这个东西很奇妙,对吧?」'),
      npc('「自我介绍:Kevin,私教。别怕,我不推销课,我只推销快乐。」'),
      npc('「你笑起来一定很好看,因为你打字都好看。」'),
      nar('话术丝滑,零帧起手。此人段位不低。'),
    ], {
      choices: [
        {
          text: '眯起眼,分析这段开场白的工业化程度',
          check: { skill: 'mind', dc: 13, pass: 'b1', fail: 'b2' },
        },
        { text: '大方接招:那你要不要验证一下?视频还是见面?', effects: { favor: 9 }, goto: 'b3' },
        { text: '害羞:哪有……你嘴好甜', effects: { favor: 5 }, goto: 'b4' },
      ],
    }),
    node('b1', [
      nar('心眼子检定成功。这段话没有一个字是为你写的——它是模板,你甚至能看出复制粘贴时没对齐的标点。'),
      me('「这段开场白,今天发给几个人了?说实话,我就当你诚实加分。」'),
      npc('「……噗。」'),
      npc('「被抓包了。三个。但你是唯一一个看出来的,这算不算一种特别?」'),
      nar('他收起了模板。有点意思,他切换到了手动挡。'),
    ], { effects: { favor: 10, npcFlags: ['kv_probe1'] }, danmaku: ['#smart'], end: true }),
    node('b2', [nar('你觉得这段话……还挺甜的。好感度上升的同时,某个看不见的名单上,你的编号是今天第四个。')], { effects: { favor: 6 }, end: true }),
    node('b3', [npc('「行动派!我喜欢。」'), npc('「那必须见面,视频里的我只有七成功力。」')], { end: true }),
    node('b4', [npc('「甜吗?那是因为遇到你之前,我练的都是苦功。」'), nar('他的情话像预制菜,加热即食,顿顿都有。')], { end: true }),
  ]),
  topics: [
    chat('kv_t1', [
      node('a', [
        npc('「今天带课的时候突然想到你,就是那种,很突然的想到。」'),
        npc('「宝,明晚老地方见?我把靠窗那个位置留……」'),
        npc('(对方撤回了一条消息)'),
        npc('「不好意思!发错了哈哈,那是我们会员群的通知模板!」'),
        nar('会员群的通知模板,会叫「宝」?'),
      ], {
        choices: [
          { text: '装没看见:好呀,你继续忙~(截图留档)', effects: { favor: 4, npcFlags: ['kv_probe2'] }, danmaku: ['#smart'], goto: 'b1' },
          {
            text: '阴阳一下:你们健身房的通知模板挺亲切啊,人均是宝',
            check: { skill: 'mouth', dc: 13, pass: 'b2', fail: 'b3' },
          },
          { text: '直接开问:那条消息是发给谁的?', effects: { favor: -3 }, goto: 'b4' },
        ],
      }),
      node('b1', [nar('你云淡风轻地翻篇了。截图安静地躺在你的相册里,像一枚待引爆的证据。'), npc('「你人真好,不像别人瞎多心~」'), nar('他放松了警惕。钓鱼执法,进行中。')], { end: true }),
      node('b2', [npc('「哈哈哈哈……被你这么一说,我们经理确实该改改文案了。」'), nar('他接住了,但眼神(隔着屏幕你都能感觉到)飘了0.5秒。'), nar('你在心里的小本本上记下一笔。')], { effects: { favor: 3, npcFlags: ['kv_probe2'] }, end: true }),
      node('b3', [me('「你们健身房模板挺贵吧,人均一个宝。」'), npc('「?你这话什么意思呀~多心了宝。」'), nar('他反手一个「宝」把你也编进了模板。这波交锋,你没占到便宜。')], { effects: { awkward: 5 }, end: true }),
      node('b4', [npc('「哎呀就是会员啦,五十多岁阿姨,减脂营的!」'), npc('「你这样我很有压力的,信任是感情的地基呀。」'), nar('他倒打一耙的速度,比他的深蹲还标准。')], { end: true }),
    ]),
    chat('kv_t2', [
      node('a', [
        npc('「跟你说,我这行看人特别准。谁真练谁摆拍,谁真心谁玩玩,一眼一个。」'),
        npc('「比如你,你就是那种——嘴上说随便,其实心里有杆秤的人。我说得对吧?」'),
        nar('冷读术。星座话术的健身房版本。'),
      ], {
        choices: [
          { text: '反手冷读回去:你是那种,怕安静下来的人。我说得对吧?', check: { skill: 'mind', dc: 14, pass: 'b1', fail: 'b2', crit: 'b1c' } },
          { text: '配合捧场:哇,你怎么知道!好准!', effects: { favor: 5 }, goto: 'b3' },
        ],
      }),
      node('b1c', [
        npc('「……」'),
        npc('「你这句话有点犯规了。」'),
        npc('「我带三百个学员,每天说八小时话。就是因为一停下来,屋子里太安静了。」'),
        nar('冷读术大师被一句话读穿。他第一次在对话里,沉默了这么久。'),
      ], { effects: { favor: 13, npcFlags: ['kv_probe2'] }, danmaku: ['#smart'], end: true }),
      node('b1', [npc('「嚯,反将一军?」'), npc('「……有一点点准,不多。下一题。」'), nar('他跳过得太快了。快得像被踩到了什么。')], { effects: { favor: 8, npcFlags: ['kv_probe2'] }, end: true }),
      node('b2', [me('「你是那种……喜欢健身的人!」'), npc('「哈哈哈哈对!你也好准哦!」'), nar('你们互相夸了对方的算命水平,谁也没算出什么。')], { effects: { favor: 2 }, end: true }),
      node('b3', [npc('「我就说吧~在我面前你不用装,做自己就好。」'), nar('他熟练地把你安放进「被读懂」的舒适区。这是他的健身房,也是他的鱼塘。')], { effects: { favor: 4 }, end: true }),
    ]),
    chat('kv_t3', [
      node('a', [
        nar('摊牌时刻。你整理了手里的证据:模板开场白、撤回的「宝」、他朋友圈里排列组合的女学员合影。'),
        npc('「在吗?明天的体验课,给你留了黄金时段哦~」'),
      ], {
        choices: [
          {
            text: '把三张截图排成一排发过去,附言:Kevin教练,聊聊?',
            showIf: 'kv_probe2',
            check: { skill: 'mind', dc: 14, pass: 'b1', fail: 'b2', fumble: 'b3' },
            danmaku: ['#seen'],
          },
          { text: '再钓一钓:黄金时段?只给我一个人留的吗?', effects: { favor: 4 }, goto: 'b4' },
          { text: '算了,睁一只眼闭一只眼,他上课是真的好看', effects: { favor: 2 }, goto: 'b5' },
        ],
      }),
      node('b1', [
        npc('「…………」'),
        npc('「你从第一天就看出来了,对吧。」'),
        npc('「行,我摊牌。名单、话术、鱼塘,都是真的。但有一条也是真的:只有你,我每次回消息前都会想很久。这条,不在话术库里。」'),
        nar('海王卸甲。你解锁了Kevin的真实档案:一个用三百个学员的喧闹,治疗安静恐惧症的人。'),
      ], { effects: { favor: 12, npcFlags: ['kv_exposed'] }, danmaku: ['#win'], end: true }),
      node('b2', [
        npc('「宝,你误会大了。」'),
        npc('「模板是行业惯例,合影是工作需要,撤回是发错群。你要这么想,我也没办法。」'),
        nar('他一套丝滑连招,滴水不漏。你的证据在他嘴里变成了三场误会。'),
      ], { effects: { favor: -6, awkward: 8 }, end: true }),
      node('b3', [
        nar('你手一抖,截图发到了他的会员大群里。'),
        nar('十秒后,群里炸了。三位「宝」当场对上了暗号。'),
        npc('「你疯了?!」'),
        nar('当晚,一篇《避雷三里屯某K姓私教,姐妹们来对暗号》的帖子冲上了小蓝书同城热榜第一。你被挂在了评论区——作为「手滑侠」,毁誉参半。'),
      ], { effects: { endGame: 'xhs_posted' }, end: true }),
      node('b4', [npc('「当然,你的时段永远是黄金的~」'), nar('鱼塘里,你和他心照不宣地互相投喂。谁是鱼,还不好说。')], { end: true }),
      node('b5', [nar('你选择了带薪看帅哥的人生态度。清醒,堕落,清醒地堕落。')], { end: true }),
    ]),
  ],
  hiddenTopics: [
    {
      codeId: 'sunset',
      script: chat('kv_hidden', [
        node('a', [
          npc('「今天路过国贸,想起个人。」'),
          npc('「我前女友,做金融的,叫Linda。分手那天她说我『不思进取』,说我的人生『没有复利』。」'),
          npc('「后来我朋友圈发什么都想着:她会不会看到。三百个学员的合影,一半是发给她看的。幼稚吧。」'),
          nar('【罗生门视角】另一个版本的故事里,那位国贸Linda说:到底谁不真诚?——现在你听到了问题的另一半。'),
        ], {
          choices: [
            { text: '回:原来海王的鱼塘,是一个人挖给一个人看的', effects: { favor: 10, npcFlags: ['deep_talk'] }, goto: 'b' },
            { text: '回:那你现在发朋友圈,还想着她看吗?', effects: { favor: 8 }, goto: 'b' },
          ],
        }),
        node('b', [npc('「……今天这段,过期删除。」'), npc('「明天的我还是Kevin教练,阳光,专业,情话八级。」')], { end: true }),
      ]),
    },
  ],
  dateSpots: [
    { template: 'sport', location: '三里屯健身房', price: 300, label: '体验课(他的主场)' },
    { template: 'bar', location: '三里屯', price: 800, label: '三里屯酒局' },
    { template: 'citywalk', location: '亮马河', price: 60, label: '亮马河遛弯(高危目击区)' },
    { template: 'park', location: '欢乐谷', price: 800, label: '欢乐谷(教练的游乐场)' },
  ],
  he: {
    title: '独家课表',
    badge: '鱼塘承包人',
    comment: '你和Kevin在一起了。他的朋友圈三天可见变成了仅你可见,签名从「你的身材我负责」改成了「名花有主,课表已满」。',
    secretCode: '亮马河的桨板',
  },
  trueFlag: 'kv_exposed',
  trueHe: {
    title: '海王上岸',
    badge: '让教练删库重练的人',
    comment: '他当着你的面,把话术备忘录一页页删了,删到最后一页停下来:「这页留着。」那页只有一句话:遇到看穿我的人,就退役。',
  },
}
