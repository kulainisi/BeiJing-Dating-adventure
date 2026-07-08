# 北京Dating模拟器 💘

一款人均社死的图形化文字冒险游戏。14 天,5 个约会对象,一张随时会塌的关系网。

- **男版 / 女版**双线,共享同一个"北京宇宙":一个版本里的约会对象,是另一个版本里的前任/闺蜜/酒友
- **开局技能点**(嘴力/心眼子/酒量/文化值/形象管理/钞能力)决定终身,关键选择走 **d20 明骰检定**
- **多线并聊**:可以同时聊 5 个人,但冷落谁谁就删你,并聊越多「亮马河目击事件」概率越高
- **观点雷区**:AA 制、彩礼、加班文化……同一个答案,让 Linda 心动,让小满拉黑
- **人的不确定性**:NPC 每天随机情绪(宿醉/摆烂/暴躁),每局随机口味与语言雷点,以及约 1.5% 概率**无理由消失**、约 1% 概率**直接一见钟情**的天命骰
- **30+ 结局**:称号、辣评、数据面板、可保存的结局分享卡;结局暗号可跨版本解锁「罗生门视角」隐藏剧情

## 开发

```bash
npm install
npm run dev          # 本地开发 http://localhost:5173
npm run build        # 生产构建(输出 dist/,纯静态,可部署到任何静态托管)
npm run check-story  # ★ 内容校验:节点连通性、goto 指向、结局引用、暗号映射
```

## 部署(Cloudflare Pages,免费)

纯静态站,无后端依赖(存档在玩家浏览器 localStorage)。

1. 推代码到 GitHub 仓库(私有仓库也可以)
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → 连接该仓库
3. 构建设置:Build command `npm run build`,Output directory `dist`
4. 完成。以后每次 `git push` 自动重新部署

安全说明:`public/_headers` 已配置 CSP、防点击劫持等安全响应头,构建时自动生效;
DDoS 防护由 Cloudflare 免费层承担。请务必给 GitHub 与 Cloudflare 账号开启两步验证(2FA),
并定期跑 `npm audit` / 开启仓库的 Dependabot。

## 架构:引擎与内容分离

```
src/
├── engine/     # 引擎层,一般不用动
│   ├── types.ts      # 全量 schema(角色/节点/选项/检定/结局/事件)
│   ├── engine → game.ts  # 回合循环、会话构建、约会与表白注入
│   ├── checks.ts     # d20 检定(情绪修正、锦鲤日、大成功/大失败)
│   ├── relations.ts  # 好感衰减、拉黑、每日情绪、每局怪癖、天命骰
│   ├── endings.ts    # 结算矩阵
│   └── save.ts       # localStorage 存档 / 图鉴 / 暗号
├── content/    # ★ 内容层,持续更新只改这里
│   ├── male/*.ts female/*.ts   # 角色档案(人设+聊天剧本+雷点+HE)
│   ├── scenes.ts     # 六大约会模板:酒局/看展/饭局/citywalk/运动/购物
│   ├── events.ts     # 随机事件牌堆
│   ├── opinions.ts   # 看法题库
│   ├── comments.ts   # 弹幕辣评库(更新梗只改这个文件)
│   ├── endings.ts    # 全局结局定义
│   └── shared.ts     # 跨版本暗号表
└── components/ pages/  # UI(手机壳、聊天流、骰子、弹幕、结局卡、图鉴)
```

## 内容更新指南

**加一个梗(最简单)**:往 `content/comments.ts` 的对应池子里加一句话。

**加一道看法题**:在 `content/opinions.ts` 加一个条目,options 的 `tags` 从这套标签里选:
`practical / romantic / flex / frugal / indie / corporate / chill / trad / equal / zhi(冒犯性发言) / sincere`。
角色的 `loves / hates / deathTags` 会自动匹配出加分/扣分/拉黑反应,无需改角色文件。

**加一个随机事件**:在 `content/events.ts` 的 `EVENTS` 数组加一项,实现 `eligible / weight / build`。
`build` 返回一个 Script,`sc.npcId` 指定效果作用对象;`effects.endGame` 可直接判定胜负。

**加一个角色**:复制 `content/male/linda.ts` 改写,在 `content/male/index.ts` 注册。
必填:`intro` + 3 个 `topics` + `dateSpots`(2-3 个)+ `moodLines` + `blockLines` + `he/trueHe` + `trueFlag`
(在某个 topic 的选项里通过 `npcFlags: ['你的flag']` 发放,结算时决定普通 HE 还是真爱 HE)。

**改完必跑** `npm run check-story` —— 它会抓出断头节点、悬空 goto、未定义的结局 id。

## 剧本 DSL 速查

```ts
node('id', [npc('TA说的话'), me('我说的话'), nar('旁白'), sys('系统提示')], {
  choices: [{
    text: '选项必须是"我的动作"',
    check: { skill: 'mouth', dc: 13, pass: 'ok', fail: 'bad', crit: 'wow', fumble: 'oops' },
    effects: { favor: 8, awkward: -5, wallet: -100, flags: [...], npcFlags: [...],
               taste: 'xiangcai',   // 撞每局随机口味表
               saying: 'hhh',       // 撞每局随机语言雷点(二连=拉黑)
               care: true,          // 「摆烂中」情绪下好感翻倍
               block: '拉黑理由', endGame: '结局id' },
    danmaku: ['#smart'],            // 触发辣评弹幕(#引用池子,或写字面文案)
    showIf: 'some_flag', goto: 'next_node',
  }],
  next: 'xx', end: true,
})
```
