import { EndingDef, Version } from '@/engine/types'
import { MALE_CHARS } from './male'
import { FEMALE_CHARS } from './female'

/** 全局结局(部分徽章按版本性别化) */
function genGlobal(version: Version): EndingDef[] {
  const sea = version === 'male' ? '海王' : '海后'
  return [
  {
    id: 'time_manager',
    rank: 'win',
    title: '时间管理大师',
    stars: 3,
    badge: `时间管理大师·${sea}(已实名认证)`,
    comment:
      '你同时确立了多段关系,且直到结算日都没被发现。这是胜利,也是一份迟早会爆的雷。网友辣评:建议直接保送《甄嬛传》选角。',
    hint: '同时和两人以上确立关系并活到最后一天',
  },
  {
    id: 'seaking',
    rank: 'draw',
    title: '持证上岗',
    stars: 3,
    badge: `京圈${sea}(持证)`,
    comment:
      `十四天,你同时吊着三条以上的高好感线,却谁也没有确立。雨露均沾,颗粒无收。鱼塘水质优良,可惜塘主今晚也是一个人回家。恭喜获得${sea}执业资格,证书自动续期。`,
    hint: '同时保持三人以上高好感,但谁都不确立',
  },
  {
    id: 'marriage',
    rank: 'win',
    title: '闪婚:北京爱情故事(实体版)',
    stars: 5,
    badge: '民政局速通纪录保持者',
    comment:
      '所有指标拉到极限的那天,TA忽然说:「后天民政局人少,我查过了。」于是北京多了一对领了证才想起来没求婚的人。朝阳区民政局在你们身后默默亮起了「办结」二字。',
    hint: '同居之后,把好感、真心、存款和精力全部推到极限,然后交给命运',
  },
  {
    id: 'euphoria',
    rank: 'egg',
    title: '上头了',
    stars: 2,
    badge: '恋爱脑晚期(已确诊)',
    comment:
      '连日的甜让你的多巴胺严重超标。你在工位上放声大笑,当众官宣「我恋爱了」,给全组订了奶茶,并顺手回绝了老板的周末加班——用一首诗。人事找你谈话那天,你还在笑。恋爱使人勇敢,勇敢使人失业。',
    hint: '心情好到飘起来的时候,小心乐极生悲',
  },
  {
    id: 'emo_quit',
    rank: 'lose',
    title: '删号回老家',
    stars: 1,
    badge: '北漂毕业生',
    comment:
      '连续的失望攒够了额度。某个凌晨,你安静地卸载了「心动Beijing」,退了房,买了张回老家的高铁票。北京不欠你,但你也不欠北京。车过山海关的时候,你睡着了,这些天第一次睡得那么沉。',
    hint: '心情跌到谷底的时候,人是会突然想通的',
  },
  {
    id: 'depression',
    rank: 'lose',
    title: '把自己熬没了',
    stars: 0,
    badge: '内耗届劳模',
    comment:
      '加班、搬钱、透支,你把自己当成一台永动机,直到某天早上,你怎么也没法从床上坐起来。医生说这叫「中度抑郁」,建议先停下来。恋爱可以等,KPI可以等,但你的人,等不了。这一局,你输给了自己。',
    hint: '心情长期被榨干(加班太多),身体会替你按下停止键',
  },
  {
    id: 'goodcard',
    rank: 'draw',
    title: '北京市好人卡收藏家',
    stars: 2,
    badge: '顶级饭搭子',
    comment:
      '十四天,你和TA吃了很多顿饭,聊了很多次天,最终停在了「你真的是个很好的人」。北京土话管这叫:黄了,但体面。',
    hint: '结算时有人好感很高,但你们谁都没把话说破',
  },
  {
    id: 'ambiguous',
    rank: 'draw',
    title: '全员暧昧,无人上岸',
    stars: 2,
    badge: '朝阳区中央空调',
    comment:
      '你在多条战线维持着不咸不淡的火苗,像同时炖着五锅汤,最后一锅都没开。你温暖了整个朝阳区,唯独把自己晾在了冬天里。制冷制热俱佳,就是没人领回家。',
    hint: '结算时所有关系都停留在暧昧区间',
  },
  {
    id: 'readnoreply',
    rank: 'lose',
    title: '已读不回大满贯',
    stars: 1,
    badge: '北漂恋爱体验卡(已过期)',
    comment:
      '十四天过去,你的聊天列表安静得像凌晨四点的西二旗。没有人拉黑你,他们只是都没再回你。这是北京最常见的告别方式。',
    hint: '结算时所有关系都凉透了',
  },
  {
    id: 'all_blocked',
    rank: 'lose',
    title: '北京市孤寡认证',
    stars: 0,
    badge: '全员再见战神',
    comment:
      '恭喜达成全员拉黑成就。青蛙都不敢接你这单。民政局朝阳分局向你敬礼:您为降低结婚率做出了突出贡献。',
    hint: '让所有人都再也不理你',
  },
  {
    id: 'bankrupt',
    rank: 'lose',
    title: '消费降级',
    stars: 0,
    badge: '回龙观菜市场VIP',
    comment:
      '你的余额归零了。在北京,钱包见底的那一刻,一切浪漫立即停摆:约会、房租、甚至下一顿饭。爱情诚可贵,余额价更高——钱归零,就寄。',
    hint: '任何时刻钱归零,当场败北',
  },
  {
    id: 'awkward_full',
    rank: 'lose',
    title: '原地社死过载',
    stars: 0,
    badge: '社死界的活化石',
    comment:
      '你的社死值突破了人类承受上限。你连夜注销了所有社交账号,搬家,换手机号,并考虑整容。北京很大,但你的尴尬更大。',
    hint: '社死值拉满',
  },
  {
    id: 'xhs_posted',
    rank: 'lose',
    title: '被挂上小蓝书',
    stars: 0,
    badge: '同城热榜第一(耻辱位)',
    comment:
      '你的约会行为被写成帖子挂上了小蓝书同城热榜,3427条评论正在逐帧分析你的行为。你成为了梗,而梗是没有隐私的。',
    hint: '在某些高危操作上大失败',
    xhsPost: true,
  },
  {
    id: 'blackout_confess',
    rank: 'egg',
    title: '断片乱表白·大成功',
    stars: 4,
    badge: '酒神的私生子',
    comment:
      '你断片后抱着路灯喊出的真心话,比你清醒时所有的话术都好使。TA答应了。医学上无法解释,爱情里偶尔发生。',
    hint: '在好感足够高时喝断片',
  },
  {
    id: 'houhai_uncle',
    rank: 'egg',
    title: '后海大爷的忘年交',
    stars: 3,
    badge: '胡同编外孙子/孙女',
    comment:
      '你在约会中途和后海唱歌大爷聊了三个小时人生,约会对象走了,大爷留下了。他教你的道理值十次约会。下周他请你吃卤煮。',
    hint: '在Citywalk里唱歌唱出意外',
  },
  {
    id: 'give_up_feast',
    rank: 'egg',
    title: '单身快乐',
    stars: 4,
    badge: '人间清醒',
    comment:
      '你退出了所有暧昧,一个人去吃了顿好的:烤鸭一整只,不用分人,不用找话题,不用看眼色。买单时你笑了。这也是一种上岸。',
    hint: '在后半程主动放弃一切,善待自己',
  },
  {
    id: 'fate_win',
    rank: 'egg',
    title: '一见钟情·概率学奇迹',
    stars: 5,
    badge: '雍和宫认证锦鲤',
    comment:
      'TA突然说:「我就是觉得,是你了。」没有原因,没有铺垫,概率约等于西二旗地铁有座。你的一切都不是自己挣的,但幸福是真的。',
    hint: '天命骰的另一面(约1%)',
  },
  ]
}

/** 每个角色的普通HE与真爱HE,由角色档案生成 */
function charEndings(version: Version): EndingDef[] {
  const chars = version === 'male' ? MALE_CHARS : FEMALE_CHARS
  const out: EndingDef[] = []
  for (const c of chars) {
    out.push({
      id: `he_${c.id}`,
      rank: 'win',
      title: `${c.name}·${c.he.title}`,
      stars: 4,
      badge: c.he.badge,
      comment: c.he.comment,
      hint: `和${c.name}确立关系`,
      secretCode: c.he.secretCode,
    })
    out.push({
      id: `true_${c.id}`,
      rank: 'win',
      title: `${c.name}·${c.trueHe.title}`,
      stars: 5,
      badge: c.trueHe.badge,
      comment: c.trueHe.comment,
      hint: `解锁${c.name}的隐藏一面后,再确立关系`,
      secretCode: c.trueHe.secretCode ?? c.he.secretCode,
    })
  }
  return out
}

export function getEndings(version: Version): EndingDef[] {
  return [...genGlobal(version), ...charEndings(version)]
}

export function getAllEndings(): { version: Version; list: EndingDef[] }[] {
  return [
    { version: 'male', list: getEndings('male') },
    { version: 'female', list: getEndings('female') },
  ]
}

export function findEnding(id: string, version: Version = 'male'): EndingDef | undefined {
  return [...genGlobal(version), ...charEndings('male'), ...charEndings('female')].find(
    (e) => e.id === id,
  )
}
