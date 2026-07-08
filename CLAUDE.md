# 北京Dating模拟器

移动端优先的图形化文字冒险游戏(React 18 + TypeScript + Vite,纯静态无后端)。
线上地址:https://beijing-dating-adventure.pages.dev (Cloudflare Pages,push 到 main 自动部署)
仓库:https://github.com/kulainisi/BeiJing-Dating-adventure

## 常用命令

```bash
npm run dev          # 开发服务器(端口 5173,已配 host 供局域网手机访问)
npm run build        # 生产构建(tsc -b + vite build)
npm run check-story  # ★ 内容校验:任何剧情改动后必跑,抓断头节点/悬空goto/未定义结局
```

## 架构(改代码前必读)

- `src/engine/` — 引擎层,轻易不动:回合循环(game.ts)、d20检定(checks.ts)、
  好感/拉黑/情绪/怪癖/天命骰(relations.ts)、结算矩阵(endings.ts)、localStorage存档(save.ts)
- `src/content/` — **内容层,日常更新只改这里**:
  - `male/*.ts` `female/*.ts` 各5个角色(人设+聊天剧本+雷点+HE),在各自 index.ts 注册
  - `scenes.ts` 6个约会模板 | `events.ts` 随机事件牌堆 | `opinions.ts` 看法题库
  - `comments.ts` 弹幕辣评库(加梗只改这个) | `endings.ts` 全局结局 | `shared.ts` 跨版本暗号
- `src/components/` `src/pages/` — UI层(手机壳容器、聊天流、骰子动画、弹幕、结局卡、图鉴)

## 核心规则与约定

- 游戏结构:14天,精力=行动点(聊天1/约会2/加班2,睡觉回满并扣每日房租+生活费);
  开局=文化三档(高知7/普通5/体育生3)+投胎骰(84%普通北漂/8%钞能力/8%高精力宝宝);
  精力决定并聊上限1-4人,拉黑/离开北京后从锁定池随机补位;**钱归零任何时刻立即败北**
- 属性映射(内容层检定 id 不变,引擎解析):mouth/mind/culture→文化水平;image→排面
  (基础2+行头0/2/4,钱临时买);liquor→隐藏酒量(每局随机1-8+体育生加成,UI永远显示???)
- **随机不可见**:一切检定/天命骰/婚姻骰/玩家隐藏心情(mood,极端3%触发上头/删号回老家)均为暗骰,
  无骰子动画,选项不带🎲标记,结果只走剧情分支
- 擦边内容红线:SFW,暧昧张力到「关灯黑屏」为止,零露骨;角色 spicy 系数 0.03-0.35
- 选项文案必须是"玩家的动作";约会价格=两人消费,参照北京真实物价(¥60-2600)
- 观点标签体系(角色 loves/hates/deathTags 与看法题 options.tags 匹配):
  practical/romantic/flex/frugal/indie/corporate/chill/trad/equal/zhi(冒犯发言)/sincere
- 每角色必有:intro + ≥3 topics + dateSpots(3-5个) + moodLines + blockLines + confirmYes/No
  + spicy + he/trueHe + trueFlag(在某个topic选项里用 npcFlags 发放,决定结算走普通HE还是真爱HE)
- 特殊结算:闪婚 marriage(好感≥98+trueFlag+约会≥5,约会后8%/结算日20%);seaking(≥3人好感≥70
  且无人确立);留宿 stayed flag 会提高真结局门槛(Coco 除外,她的真结局反而需要它)
- 跨版本暗号在 shared.ts 的 CODES,对应角色的 hiddenTopics.codeId;结局暗号印在 he.secretCode
- 剧本 DSL 与新增角色/事件/看法题的详细步骤见 README.md「内容更新指南」
- 中文文案用直角引号「」,不要在单引号字符串里嵌套中文单引号(会破坏TS语法)
- 版权红线:平台名一律戏仿(微聊/小蓝书/心动Beijing),不用真实logo,美术只用 SVG/CSS/emoji

## 部署与安全

- **发布闸门(重要)**:push 到 main = 直接公网上线。因此**严禁在用户明确确认"发布/推送"之前执行 `git push`**。
  正确流程:改动 → check-story → build 验证 → 本地 commit → 向用户汇报改了什么 → 等用户确认后才推送。
  (`.claude/settings.json` 已配置 `git push` 强制弹出确认,属双保险,勿删)
- `public/_headers` 是 CSP 等安全响应头,勿删
- 无后端、无用户数据;如未来加排行榜/账号,用 Cloudflare Workers + D1,不要自建服务器
- 本机 git 代理已设为 http://127.0.0.1:10809(v2rayN);GitHub 访问失败先查代理是否在跑
