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

- 游戏结构:14天,精力=行动点(聊天1/约会2/上班2,睡觉回满并扣日杂费 DAILY_SUNDRY ¥120);
  **房租不日扣**——newGame 掷 rentDay(第4-12天随机),当天一次性收整月房租,付不起=破产;
  开局三步=**教育背景**(EDU_BGS:高知=框架/普通/社会大学=谄媚,修正文化±1/薪资/存款/酒量)
  →**职业卡**(v4,男女分表各7张、底层→顶层:types.ts getProfessions,决定月薪/房租/文化/
  favorMod 社交光环/工作事件池)→投胎骰只管精力与家底(84%普通/8%钞能力+20万有房/8%高精力);
- 说话风格博弈(v4.1):Effects.style('frame'/'flatter')选项 vs NPC stylePref(v4.ts STYLE_PREFS,
  24人:吃框架9/吃谄媚10/两不吃5)——对上+4,对错-3,被动契合正向+1;风格选项用
  showIf:'edu:gaozhi'/'edu:shehui' 门控(已铺:看法题aa/xingzuo、闲聊g_waimai、饭局talk);
- 金钱观(v4.2):NPC moneyView('love'吃排场/'hate'反感烧钱,v4.ts MONEY_VIEWS 17人)——
  buildDateSession 按 spot.price 开场定调(≥1200:love+6/hate-7;≤100:hate+4/love-5,带旁白);
  超豪华场地 DateSpot.minWallet(置灰门槛,钞能力=固定 ¥99999999 天然全开);
- 投胎骰 6 档(v4.2):普通73/钞能力8(9千9百万+有房)/高精力8/老北京er5(有房+3万+人脉favor+4)/
  海归3(文化+1薪x1.2)/拆迁户3(有房+60万);Origin 可带 cultureMod/salaryMul/favorMod/liquorMod;
- 恋爱后内容(v4.2):确立后 ping 优先走 content/couple.ts 情侣池(吵架和好/见死党/纪念日/家宴/
  TA妈视频/深夜奔赴,cp_* npcFlags 每人每事件一次)+吃醋保卫战事件(ex_return/rival_suitor)
  +6 个 cp_* 驱动的恋爱后成就;
- 快节奏收官(v4.3,北京节奏):确立后与TA互动计数 NpcState.confirmedActs(聊天/约会/情侣事件
  均+1,finishSession 统计),≥4 次且好感≥80 → hub 出现「把日子定下来」按钮(二次确认),
  earlySettle 提前迎来 HE/真爱HE/婚姻骰,不必熬到第14天;暧昧期下放:dating 好感≥60 走情侣
  ping 池(bestie/anniversary/mom_video 仍官宣限定)、好感≥75+约2次可触发同居、
  好感≥65 可触发 ex_return 保卫战;
- ⚠️ SessionView 竞态红线:tap() 里判断「有没有选项」必须用同步 ref 语义(hasVisibleChoices),
  绝不能依赖 state revealed——否则手机连点会误 setFinished 把选项锁死(v4.2 已修+三重自愈);
  上班=doWork 按职业从 content/work.ts 抽加权事件,**有赚有赔**并动 mood;
  精力决定并聊上限1-4人,开局从全部12人自选;**钱归零任何时刻立即败北**
- 属性映射(内容层检定 id 不变,引擎解析):mouth/mind/culture→文化水平;image→排面
  (由资产分档 imageFromWallet 实时决定,无行头);liquor→隐藏酒量(每局随机1-8+职业加成,UI永远显示???)
- 对抗性(v4.4 加深):每 NPC 隐藏挑剔度 pickiness(genQuirks 掷),applyEffects 对正好感暗骰
  降级(45%减半/35%归零/20%差评-2~-4+社死,fb.pickyLine/毒旁白);打中 loves/高好感/锦鲤日
  压低翻车率但**保底 8% 永不归零**——百分百对味也可能吃差评;
- 语气轴(v4.4):Effects.tone('zhiqiu'直球真实/'liao'高情商会撩),人人可选不吃门槛;
  NPC tonePref(v4.ts TONE_PREFS,吃直球11/吃会撩9/两可4)对上+4对错-3;玩家人设带可信度
  加成(直男职业说直球+1,社交职业/社会大学说情话+1);表白两种方式也吃语气偏好
- 主动邀约(v4):sleep 无事件的早上 45% 高好感 NPC 主动来找(content/pings.ts,约2-3天一次),
  强制处理;每个 ping 带「已读不回」选项→hiddenFavor 暗扣(不上浮动数字)
- v4 内容集中扩展在 content/v4.ts(EXTRA_SPOTS/EXTRA_TOPICS/OPINION_REACTS),由 content/index.ts
  getCharacters 合并,**不改各角色文件**;职业专属选项用 showIf:'prof:<id>'(newGame 写入 flags)
- **随机不可见**:一切检定/天命骰/婚姻骰/玩家隐藏心情(mood,极端3%触发上头/删号回老家)均为暗骰,
  无骰子动画,选项不带🎲标记,结果只走剧情分支
- 擦边内容红线:SFW,暧昧张力到「关灯黑屏」为止,零露骨;角色 spicy 系数 0.03-0.35
- 选项文案必须是"玩家的动作";约会价格=两人消费,参照北京真实物价(¥60-2600)
- 观点标签体系(角色 loves/hates/deathTags 与看法题 options.tags 匹配):
  practical/romantic/flex/frugal/indie/corporate/chill/trad/equal/zhi(冒犯发言)/sincere
- 每角色必有:intro + ≥3 topics + dateSpots(3-5个) + moodLines + blockLines + confirmYes/No
  + spicy + he/trueHe + trueFlag(在某个topic选项里用 npcFlags 发放,决定结算走普通HE还是真爱HE)
- 同居系统:确立关系+好感≥80+约会≥3后低概率触发同居事件(cohabit事件,npcFlag 'cohabit'+
  全局flag 'cohabiting',房租减半);同居后和别人聊天35%/约会60%被发现→同居对峙
  (buildConfrontation:文化水平dc14圆谎,失败=拉黑分手)
- 特殊结算:闪婚 marriage 前置=同居+好感≥98+trueFlag+约会≥5+存款≥2万+精力≥4(钞能力出身豁免精力),
  约会后8%/结算日20%;seaking(≥3人好感≥70且无人确立);留宿 stayed flag 会提高真结局门槛
  (Coco 除外,她的真结局反而需要它)
- 跨版本暗号在 shared.ts 的 CODES,对应角色的 hiddenTopics.codeId;结局暗号印在 he.secretCode
- 剧本 DSL 与新增角色/事件/看法题的详细步骤见 README.md「内容更新指南」
- 中文文案用直角引号「」,不要在单引号字符串里嵌套中文单引号(会破坏TS语法)
- 版权红线:平台名一律戏仿(微聊/小蓝书/心动Beijing),不用真实logo,美术只用 SVG/CSS/emoji
- 正反馈/手感层(v3 首批):关系里程碑全屏庆祝(Celebration.tsx,好感越 30/50、确立、真心、同居,
  applyEffects 返回 fb.milestone,ms:* flag 去重)+ 关系阶梯 chip(relationTier)+ 默契连击(SessionView 内
  combo,答对累积、踩雷归零)+ 心情两极外显(moodAura,≥78「气场全开」给检定 DC-2,≤22「状态低迷」);
  加班扣心情、极端负面暗骰概率下调。原则:胜负两端都响,不砍社死负反馈。开局并聊上限提到 3(parallelCap)。

## 部署与安全

- **发布闸门(重要)**:push 到 main = 直接公网上线。因此**严禁在用户明确确认"发布/推送"之前执行 `git push`**。
  正确流程:改动 → check-story → build 验证 → 本地 commit → 向用户汇报改了什么 → 等用户确认后才推送。
  (`.claude/settings.json` 已配置 `git push` 强制弹出确认,属双保险,勿删)
- `public/_headers` 是 CSP 等安全响应头,勿删
- 匿名数据监控:`functions/api/track.ts`(POST 计数)+ `functions/api/stats.ts`(GET 看板,?key= 令牌)
  = Cloudflare Pages Functions,同源无跨域;`src/analytics.ts` 在开局/结局 sendBeacon 上报,失败静默。
  只累加聚合计数(KV namespace `STATS`),无 cookie/无 PII。**部署前需绑定 KV**(见 wrangler.toml 注释)。
  本地 `npm run dev` 下 /api/* 返回 404 属正常(Vite 无 Functions),需 `wrangler pages dev` 或线上才生效。
- 除上面的匿名计数外无后端、无用户数据;如未来加排行榜/账号,用 Cloudflare Workers/Pages Functions + D1,不要自建服务器
- 本机 git 代理已设为 http://127.0.0.1:10809(v2rayN);GitHub 访问失败先查代理是否在跑
