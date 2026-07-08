import { Script } from '@/engine/types'
import { chat, me, nar, node, npc } from './util'

/** 话题池耗尽后的日常闲聊(小幅好感,带 care 选项供「摆烂中」翻倍) */
export const GENERIC_CHATS: Script[] = [
  chat('g_tongqin', [
    node('a', [npc('今天地铁13号线又限流了,我在西二旗站排了二十分钟,人贴人。')], {
      choices: [
        {
          text: '回:辛苦了,晚上吃点好的犒劳自己,想吃什么我请',
          effects: { favor: 5, care: true },
          goto: 'b',
        },
        { text: '回:建议卷个早高峰错峰通勤攻略,发小蓝书还能涨粉', effects: { favor: 3 }, goto: 'b' },
        { text: '回:哈哈哈', effects: { favor: -2, saying: 'hhh' }, goto: 'c' },
      ],
    }),
    node('b', [npc('你还挺会接话的嘛。行,记下了,你说的。')], { end: true }),
    node('c', [npc('嗯。'), nar('对话结束得像早高峰的地铁门,毫不留情。')], { end: true }),
  ]),
  chat('g_waimai', [
    node('a', [npc('纠结中:麻辣烫还是轻食?你帮我选。')], {
      choices: [
        { text: '回:麻辣烫。快乐是刚需,沙拉是刑罚', effects: { favor: 4 }, goto: 'b' },
        { text: '回:都行,随便,你定就好', effects: { favor: -3, saying: 'suibian' }, goto: 'c' },
        {
          text: '回:今天降温,吃麻辣烫,多加点丸子,注意保暖',
          effects: { favor: 5, care: true },
          goto: 'b',
        },
      ],
    }),
    node('b', [npc('好!就这么定了。有决断力的人真的很难得。')], { end: true }),
    node('c', [npc('……好吧,那我自己纠结。'), nar('你仿佛听到了好感度漏气的声音。')], { end: true }),
  ]),
  chat('g_emo', [
    node('a', [npc('凌晨的北京好安静啊。有时候会突然不知道自己留在这里图什么。')], {
      choices: [
        {
          text: '认真打一大段:图什么不重要,你已经比大多数人勇敢了',
          effects: { favor: 6, care: true },
          danmaku: ['#simp'],
          goto: 'b',
        },
        { text: '回:图工资啊,还能图什么(配狗头)', effects: { favor: 1 }, goto: 'c' },
        { text: '回:早点睡,别想那么多', effects: { favor: -2, saying: 'zaoshui' }, goto: 'c' },
      ],
    }),
    node('b', [npc('……谢谢你。这句话我截图了。'), nar('凌晨的北京,有人因为你的一段话没那么孤独了。')], {
      end: true,
    }),
    node('c', [npc('嗯,也是。晚安吧。')], { end: true }),
  ]),
  chat('g_zhoumo', [
    node('a', [npc('周末你一般干嘛?我感觉我的周末就是躺着刷手机,然后忽然天就黑了。')], {
      choices: [
        { text: '回:一样,躺到愧疚,愧疚到继续躺', effects: { favor: 4 }, goto: 'b' },
        { text: '回:健身、看展、学习。时间不能浪费', effects: { favor: 2 }, goto: 'c' },
        { text: '回:下个周末别躺了,出来,我带你玩点新鲜的', effects: { favor: 5 }, goto: 'd' },
      ],
    }),
    node('b', [npc('哈哈哈哈是同一款废物没错了。莫名安心。')], { end: true }),
    node('c', [npc('好自律……跟你比我像个废人。'), nar('TA的语气里有敬佩,也有一丝距离感。')], { end: true }),
    node('d', [npc('哦?口气不小,那我等着。')], { end: true }),
  ]),
]
