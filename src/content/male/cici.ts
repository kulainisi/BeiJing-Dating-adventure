import { CharacterProfile } from '@/engine/types'
import { chat, me, nar, node, npc } from '../util'

export const cici: CharacterProfile = {
  id: 'cici',
  name: '探店博主Cici',
  emoji: '📸',
  color: '#f2a65a',
  bio: '小蓝书 10w+ | 出片率就是生命力 | 今天也在寻找北京最好拍的角落 | 商务合作请走后台',
  archetype: '探店博主,活在滤镜与流量里,镜头后面比谁都清醒',
  loves: ['flex', 'romantic', 'indie'],
  hates: ['frugal'],
  deathTags: ['zhi'],
  decay: 9,
  mainSkill: 'image',
  confirmYes: '「这条我不发。」她把手机扣在桌上,镜头朝下,「从现在起,有些画面只留给我自己看。」',
  confirmNo: '「你很好,可我连感情都想调个滤镜再发……让我先学会素颜面对生活,好吗?」',
  moodLines: {
    great: '「昨天那条笔记爆了!十万赞!平台还给我打了标!今天看谁都眉清目秀!」',
    hungover: '「昨晚参加品牌晚宴,香槟一杯接一杯……我今天的脸,拒绝出镜。」',
    slacking: '「数据掉得妈都不认识。我今天不想营业,想当一个无人问津的普通女孩。」',
    grumpy: '「刚有个甲方让我改第八版脚本,还要『五彩斑斓的黑』。我现在很烦,慎聊。」',
  },
  blockLines: [
    '「你已被移出我的镜头。」',
    '「这段相处的数据表现不好,下架了哈。」',
  ],
  intro: chat('cc_intro', [
    node('a', [
      npc('「Hi~你的头像是实拍吗?光打得不错哦。」'),
      npc('「先自我介绍:Cici,探店博主,全网十万粉。不是网红,是『内容创作者』,谢谢。」'),
      npc('「灵魂第一问:约会的时候,你介意对方拍照拍很久吗?」'),
    ], {
      choices: [
        { text: '回:不介意,我还能帮你举反光板,兼职人形三脚架', effects: { favor: 10 }, danmaku: ['#smart'], goto: 'b1' },
        { text: '回:介意,饭都凉了。但如果是你拍,我可以等', check: { skill: 'mouth', dc: 13, pass: 'b2', fail: 'b3' } },
        { text: '回:说实话挺介意的,吃饭就好好吃饭', effects: { favor: -2 }, goto: 'b4' },
      ],
    }),
    node('b1', [npc('「人形三脚架!!哈哈哈哈这个岗位太稀缺了。」'), npc('「行,你已进入我的『可约名单』,权重很高的那种。」')], { end: true }),
    node('b2', [npc('「哇,先抑后扬,高级。」'), npc('「你这句话的完播率很高,我看完了三遍。」')], { effects: { favor: 11 }, end: true }),
    node('b3', [npc('「嗯?什么意思,别人拍就不行?」'), me('「不是,我是说……那个……」'), npc('「逗你的。不过你慌乱的样子确实不太上镜,哈哈。」')], { effects: { favor: 3, awkward: 5 }, end: true }),
    node('b4', [npc('「诚实。虽然不加分,但也不扣分。」'), npc('「毕竟我全网都是滤镜,偶尔见个原图人类,还挺新鲜。」')], { effects: { favor: 3 }, end: true }),
  ]),
  topics: [
    chat('cc_t1', [
      node('a', [
        npc('「气死!今天有个店,图上美若仙境,到了一看,20平米,拍照要排队一小时。」'),
        npc('「问你哦,你觉得『照骗』算欺骗吗?我认真的,这是我的职业道德拷问时刻。」'),
      ], {
        choices: [
          { text: '回:美化是创作,虚构才是欺骗。你调的是光,不是事实', effects: { favor: 11, npcFlags: ['deep_talk'] }, danmaku: ['#smart'], goto: 'b1' },
          { text: '回:算啊,你们博主就是靠滤镜恰饭的', effects: { favor: -9, mine: true }, goto: 'b2' },
          { text: '回:重要的是,你觉得算吗?你比谁都清楚边界在哪', effects: { favor: 8, care: true }, goto: 'b3' },
        ],
      }),
      node('b1', [npc('「『你调的是光,不是事实』……」'), npc('「不行,这句我要拿去当笔记标题,版权费我请你喝东西。」')], { end: true }),
      node('b2', [npc('「恰饭怎么了,谁不吃饭?」'), npc('「你知道我一条『恰饭』背后要拍多少张吗?三百张。你上班摸鱼的时候我在修图。」'), nar('她维护的不是滤镜,是她的三百张废片。')], { end: true }),
      node('b3', [npc('「……你这个反问有点狡猾,又有点温柔。」'), npc('「我觉得算过界的我都没发。好啦,职业道德保住了。」')], { end: true }),
    ]),
    chat('cc_t2', [
      node('a', [
        npc('「今天涨了3000粉,可我一点都不开心。」'),
        npc('「因为爆的那条,是我崩溃大哭的vlog。我最狼狈的一天,是我数据最好的一天。你说讽刺不讽刺。」'),
      ], {
        choices: [
          { text: '回:那3000个人不是来看你哭的,是终于看到一个真的人', effects: { favor: 12, care: true }, danmaku: ['#simp'], goto: 'b1' },
          { text: '回:流量密码就是真实,建议趁热再更一条', effects: { favor: -8 }, goto: 'b2' },
          { text: '回:抱抱。今天不聊数据,聊聊你为什么哭好吗', effects: { favor: 9, care: true }, goto: 'b3' },
        ],
      }),
      node('b1', [npc('「……」'), npc('「你知道吗,评论区一万条安慰,没有一条说到这个点上。」')], { end: true }),
      node('b2', [npc('「趁热。」'), npc('「你管我的眼泪叫『热点』。行,我知道你是哪边的了。」'), nar('她发了一个微笑表情。博主的微笑表情,和体制内的「收到」一样危险。')], { end: true }),
      node('b3', [npc('「……是因为我妈说,『你那个工作,说出去人家以为你是无业游民』。」'), npc('「谢谢你问的是『为什么哭』,不是『掉不掉粉』。」')], { end: true }),
    ]),
    chat('cc_t3', [
      node('a', [
        npc('(她发来一张照片:素颜,眼下乌青,头发乱糟糟,背景是凌晨的剪辑软件界面)'),
        npc('「手滑发错人了!!!快删!!!……算了,你都看到了。」'),
        npc('「这就是十万粉博主的真面目,幻灭吗?」'),
      ], {
        choices: [
          {
            text: '认真回:这张比你主页所有精修图都好看,因为镜头后面这个人在认真活着',
            effects: { favor: 13, npcFlags: ['cici_real'] },
            danmaku: ['#simp'],
            goto: 'b1',
          },
          { text: '回:哈哈哈哈这也太惨了,建议发全网,绝对爆', effects: { favor: -7, saying: 'hhh' }, goto: 'b2' },
          { text: '假装没看见:什么照片?我刚才网卡了没加载出来', check: { skill: 'mind', dc: 13, pass: 'b3', fail: 'b4' } },
        ],
      }),
      node('b1', [
        npc('「…………你等一下,我需要平复一下。」'),
        npc('「所有人都爱Cici的滤镜。你是第一个,给原图点赞的人。」'),
        nar('你解锁了Cici的原图权限——这比她的商务报价单值钱多了。'),
      ], { end: true }),
      node('b2', [npc('「哈哈哈哈?」'), npc('「我的崩溃在你这是段子素材是吧。行,那你去看段子吧,别看我了。」')], { end: true }),
      node('b3', [npc('「网卡了啊,那算了~」'), npc('「(其实她知道你看见了。她记下了这份体面,在心里给你调高了一档权重。)」')], { effects: { favor: 8 }, end: true }),
      node('b4', [me('「网卡了,啥也没看见,就看见一个头发乱乱的小疯婆子。」'), npc('「……所以你到底是看见了还是没看见!!」'), nar('圆谎失败,场面一度十分滑稽。')], { effects: { favor: 1, awkward: 8 }, end: true }),
    ]),
  ],
  dateSpots: [
    { template: 'expo', location: '798·当红艺术展', price: 200, label: '网红大展(出片刚需)' },
    { template: 'shopping', location: '三里屯太古里', price: 400, label: '太古里街拍' },
    { template: 'dinner', location: '安福路风Brunch店', price: 300, label: 'Brunch局(先拍后吃)' },
  ],
  he: {
    title: '关闭美颜',
    badge: '原图直出的爱人',
    comment: '你和Cici在一起了。她的置顶笔记换成了一张你拍的、有点糊的背影,文案:「这张没修,他拍的,我最喜欢。」评论区一片哀嚎。',
  },
  trueFlag: 'cici_real',
  trueHe: {
    title: '未发布的草稿',
    badge: '十万粉都不知道的人',
    comment: '她的草稿箱里有一条永远不会发布的vlog,记录了你们所有普通的瞬间。她说:「数据是别人的,这条是我的。」',
  },
}
