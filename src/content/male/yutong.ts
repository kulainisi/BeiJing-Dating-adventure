import { CharacterProfile } from '@/engine/types'
import { chat, me, nar, node, npc } from '../util'

export const yutong: CharacterProfile = {
  id: 'yutong',
  name: '王雨桐',
  emoji: '🏛️',
  color: '#7fc8a9',
  bio: '体制内 | 朝九晚五 | 父母认证账号 | 本资料由中山公园相亲角代为运营',
  archetype: '体制内乖乖女,相亲流水线上的疲惫选手,藏着一个摇滚灵魂',
  loves: ['practical', 'trad', 'sincere'],
  hates: ['flex', 'chill'],
  deathTags: ['zhi'],
  decay: 5,
  mainSkill: 'mind',
  confirmYes: '「我爸妈问了你八回了,我一直说『再看看』……其实我早就看好了。」她说完自己先脸红了。',
  confirmNo: '「你人很好,真的。但我现在分不清是我喜欢你,还是我爸妈喜欢你……再等等好吗?」',
  moodLines: {
    great: '「今天单位发了福利!两袋米一桶油!哈哈哈你别笑,这是编制内的浪漫。」',
    hungover: '「昨天同事结婚,被灌了好多……体制内的酒局,一个都躲不掉。」',
    slacking: '「今天写了一天材料,『的』字用了两百多个。我现在看什么都像病句。」',
    grumpy: '「我妈刚又给我发了三个相亲对象资料,还@了全家群。我现在心情非常复杂。」',
  },
  blockLines: [
    '「不好意思,我觉得我们不太合适。介绍人那边我会说清楚的。」',
    '「就到这里吧。祝你早日找到合适的人。」',
  ],
  intro: chat('yt_intro', [
    node('a', [
      npc('「你好,我是王雨桐。咱们这个……是我姑妈跟你那边的介绍人对接的,你应该知道流程哈。」'),
      npc('「按惯例我得先问三个问题:户口、房子、工作性质。」'),
      npc('「……你别紧张,这是我妈拟的题库,不是我。」'),
      nar('相亲面试,正式开始。她的语气里有一丝疲惫的幽默感。'),
    ], {
      choices: [
        { text: '如实作答,并在结尾附上一句:题库答完了,现在能认识一下出题人的女儿吗', check: { skill: 'mouth', dc: 12, pass: 'b_ok', fail: 'b_mid', crit: 'b_crit' } },
        { text: '认真如实作答,不多一个字,像在填表', effects: { favor: 6 }, goto: 'b_form' },
        { text: '回:都什么年代了还查户口,你们体制内就是形式主义', effects: { block: '相亲第一题就开炮' }, danmaku: ['#block'] },
      ],
    }),
    node('b_crit', [
      npc('「噗——」'),
      npc('「不好意思,我笑出声了,在办公室。」'),
      npc('「你是这个月第七个,但是是第一个把我当人、不当岗位聊的。加微信吧,那个题库你已经通过了。」'),
    ], { effects: { favor: 14 }, end: true }),
    node('b_ok', [npc('「哈哈,『出题人的女儿』,这个说法有意思。」'), npc('「行,题库先放一边。你平时周末都干嘛呀?」')], { effects: { favor: 9 }, end: true }),
    node('b_mid', [me('「呃,户口是……房子在……工作是……所以,能认识下你吗?」'), npc('「嗯,条件都挺好的。」'), nar('「条件都挺好的」——相亲市场上最客气的「没感觉」。')], { effects: { favor: 2 }, end: true }),
    node('b_form', [npc('「收到,信息很全,谢谢配合。」'), npc('「……怎么感觉咱俩像在办政务窗口业务。」'), nar('准确,高效,零心动。')], { end: true }),
  ]),
  topics: [
    chat('yt_t1', [
      node('a', [
        npc('「说真的,你是自愿来相亲的,还是被家里安排的?」'),
        npc('「我先坦白,我是被安排的。我妈说我再不结婚,她在广场舞队都抬不起头。」'),
      ], {
        choices: [
          { text: '坦白:我也是被安排的。要不咱俩合伙应付双方家长,细水长流', effects: { favor: 11, npcFlags: ['ally'] }, danmaku: ['#smart'], goto: 'b1' },
          { text: '回:我是自愿的。到年纪了,结婚就是人生的下一个里程碑', effects: { favor: 5 }, goto: 'b2' },
          { text: '回:阿姨说得对,女生年纪大了确实不好找', effects: { block: '对相亲对象说「女生年纪大了不好找」' }, danmaku: ['#block'] },
        ],
      }),
      node('b1', [npc('「合伙???」'), npc('「哈哈哈哈你这个思路清奇。行啊,那咱们先成立『反催婚统一战线』,业务再慢慢谈。」'), nar('从相亲对象到战友,关系发生了奇妙的化学变化。')], { end: true }),
      node('b2', [npc('「里程碑……你这个说法很体制内,我熟。」'), npc('「务实挺好的。就是听起来,像在聊工程验收。」')], { end: true }),
    ]),
    chat('yt_t2', [
      node('a', [
        npc('「紧急情况!!我妈突然要跟我视频,肯定是想顺便看你!你现在在干嘛?!」'),
        nar('三秒后,视频邀请弹了出来。屏幕那头,一位烫着卷发的阿姨扶了扶眼镜。'),
        npc('(阿姨)「小伙子,吃了吗?听说你在互联网上班?那个……稳定吗?」'),
      ], {
        choices: [
          {
            text: '沉着应答:把大厂工作翻译成阿姨能安心的语言',
            check: { skill: 'mind', dc: 13, pass: 'b1', fail: 'b2', crit: 'b1c' },
          },
          { text: '如实回答:不稳定,但工资高,裁员了赔偿也多', effects: { favor: 6 }, goto: 'b3' },
        ],
      }),
      node('b1c', [
        me('「阿姨,互联网就是新时代的供销社,老百姓买东西都从我们这走。我负责的那块,就相当于柜台组长。」'),
        npc('(阿姨)「哎哟,组长!小王你看人家,是个干部!」'),
        npc('(挂断后)「……你刚才那段太强了,我妈已经在家族群宣布你是干部了。怎么办。」'),
      ], { effects: { favor: 14 }, danmaku: ['#smart'], end: true }),
      node('b1', [me('「阿姨,工作稳定,五险一金都是顶格交的。」'), npc('(阿姨)「顶格!好孩子,懂事!」'), npc('(挂断后)「你及格了,我妈的原话是『比上一个强多了』。」')], { effects: { favor: 9 }, end: true }),
      node('b2', [
        me('「阿姨好,我们公司主要做的是基于LBS的本地生活服务闭环……」'),
        npc('(阿姨)「……小王,他说的是中文吗?」'),
        npc('(挂断后)「我妈说她没听懂,但感觉不稳定。对不起,她就这样。」'),
      ], { effects: { favor: -4, awkward: 10 }, end: true }),
      node('b3', [npc('(阿姨)「裁员?!赔偿?!」'), npc('(挂断后)「你的诚实很宝贵,但『裁员』这两个字在我妈那里属于恐怖片。她现在在给我姑妈打电话。」')], { effects: { awkward: 6 }, end: true }),
    ]),
    chat('yt_t3', [
      node('a', [
        npc('「问你个事,你可别跟介绍人说。」'),
        npc('「你听说过『痛仰』吗?或者『万能青年旅店』?」'),
        nar('她发这条消息的时间是23:47。一个体制内乖乖女的深夜,露出了一角黑色T恤。'),
      ], {
        choices: [
          {
            text: '压住惊讶,回:「杀死那个石家庄人」前奏一响,谁的DNA不动',
            check: { skill: 'culture', dc: 12, pass: 'b1', fail: 'b2' },
          },
          { text: '回:听过名字!不过你一个公务员听摇滚,反差有点大啊', effects: { favor: 4 }, goto: 'b3' },
          { text: '回:没听过,我只听抖音热歌榜', effects: { favor: -3 }, goto: 'b4' },
        ],
      }),
      node('b1', [
        npc('「!!!!」'),
        npc('「我大学在迷笛现场淋过三小时暴雨!!工作后这件事被我封存了,单位没人知道!」'),
        npc('「你知道吗,每次写完材料,我都戴上耳机听一首,假装自己还在人群最前排。」'),
        nar('你解锁了王雨桐的隐藏曲目:西装下面,是没干透的迷笛泥浆。'),
      ], { effects: { favor: 13, npcFlags: ['yt_rock'] }, danmaku: ['#win'], end: true }),
      node('b2', [me('「万能青年旅店!知道,是个连锁酒店吧,青旅那种?」'), npc('「…………」'), npc('「当我没问。晚安。」'), nar('她轻轻关上了那扇刚推开的门。')], { effects: { favor: -5, awkward: 6 }, end: true }),
      node('b3', [npc('「反差大吗?哈哈,也是。」'), npc('「算了,就是随口一提。你就当体制内也需要精神股东吧。」')], { end: true }),
      node('b4', [npc('「热歌榜也挺好的,下饭。」'), nar('她回得很客气,像在回复群众来信。')], { end: true }),
    ]),
  ],
  dateSpots: [
    { template: 'dinner', location: '西单老字号涮肉', price: 260, label: '涮肉局(接地气考察)' },
    { template: 'citywalk', location: '中山公园', price: 30, label: '中山公园散步(相亲角圣地)' },
    { template: 'expo', location: '国家博物馆', price: 80, label: '国博看展(正经约会)' },
  ],
  he: {
    title: '双方家长已阅',
    badge: '编制外的自己人',
    comment: '你和雨桐在一起了。她妈妈在广场舞队宣布了这个消息,当晚舞队加跳了一支《最炫民族风》以示庆祝。',
  },
  trueFlag: 'yt_rock',
  trueHe: {
    title: '迷笛的雨又下起来了',
    badge: '把耳机分你一只的人',
    comment: '五一,你们请了年假,站在音乐节人群的最前排。她穿着压箱底的乐队T恤,喊到失声。回程高铁上她睡着了,手里还攥着你们的荧光棒。',
  },
}
