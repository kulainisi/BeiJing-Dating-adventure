/**
 * 跨版本暗号表:通关一个版本的特定结局,结局卡上会印一个暗号;
 * 在另一个版本的「图鉴→暗号」里输入,解锁对应角色的「罗生门视角」隐藏剧情。
 */
export interface SecretCode {
  id: string
  code: string
  from: string
  unlocks: string
}

export const CODES: SecretCode[] = [
  {
    id: 'duck',
    code: '亮马河的鸭子',
    from: '男版 · 鼓楼小满的结局卡',
    unlocks: '女版 · 陈屿的罗生门剧情(前任的另一面)',
  },
  {
    id: 'sunset',
    code: '国贸的落日',
    from: '男版 · 国贸Linda的结局卡',
    unlocks: '女版 · Kevin的罗生门剧情(海王的来历)',
  },
  {
    id: 'cat',
    code: '胡同里的猫',
    from: '女版 · 主理人陈屿的结局卡',
    unlocks: '男版 · 小满的罗生门剧情(她的前任是谁)',
  },
  {
    id: 'paddle',
    code: '亮马河的桨板',
    from: '女版 · 私教Kevin的结局卡',
    unlocks: '男版 · Linda的罗生门剧情(她的前男友)',
  },
  {
    id: 'disc',
    code: '凌晨四点的打口碟',
    from: '女版 · 地下DJ阿豹的结局卡',
    unlocks: '男版 · Vv的罗生门剧情(她的DJ前任)',
  },
  {
    id: 'sticker',
    code: '天台上的荧光贴纸',
    from: '男版 · 亚逼女孩Vv的结局卡',
    unlocks: '女版 · 阿豹的罗生门剧情(他的画画前任)',
  },
]
