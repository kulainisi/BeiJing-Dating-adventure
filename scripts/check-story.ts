/**
 * 内容校验脚本:npm run check-story
 * 校验所有剧本的节点连通性、goto 指向、结局 id、暗号映射——
 * 持续更新剧情时的回归保障。
 */
import { getCharacters, getEvents, getGenericChats, getOpinions, findEnding, CODES } from '../src/content'
import { buildDateSession, buildOpinionScript, newGame } from '../src/engine/game'
import { Script, Version } from '../src/engine/types'

let errors = 0
let checked = 0

function fail(msg: string) {
  errors++
  console.error(`  ❌ ${msg}`)
}

function validateScript(sc: Script, label: string, collectEndings: Set<string>) {
  checked++
  if (!sc.nodes[sc.start]) {
    fail(`${label}: start 节点 "${sc.start}" 不存在`)
    return
  }
  const ids = new Set(Object.keys(sc.nodes))
  let hasEnd = false
  for (const n of Object.values(sc.nodes)) {
    if (n.end) hasEnd = true
    if (n.next && !ids.has(n.next)) fail(`${label}/${n.id}: next → "${n.next}" 不存在`)
    if (n.effects?.endGame) collectEndings.add(n.effects.endGame)
    for (const c of n.choices ?? []) {
      if (c.goto && !ids.has(c.goto)) fail(`${label}/${n.id}: goto → "${c.goto}" 不存在`)
      if (c.effects?.endGame) collectEndings.add(c.effects.endGame)
      if (c.check) {
        for (const k of ['pass', 'fail', 'crit', 'fumble'] as const) {
          const target = c.check[k]
          if (target && !ids.has(target)) fail(`${label}/${n.id}: check.${k} → "${target}" 不存在`)
        }
      }
      if (!c.goto && !c.check && !c.effects) fail(`${label}/${n.id}: 存在既无 goto 也无效果的选项`)
    }
    if (!n.end && !n.next && (!n.choices || n.choices.length === 0)) {
      // 允许:选项级 block/endGame 会动态终止;但完全无出路的普通节点是错误
      fail(`${label}/${n.id}: 节点既无 next/choices 也未标记 end`)
    }
  }
  // 可达性 BFS
  const seen = new Set<string>([sc.start])
  const queue = [sc.start]
  let reachEnd = false
  while (queue.length) {
    const id = queue.shift()!
    const n = sc.nodes[id]
    if (!n) continue
    if (n.end) reachEnd = true
    const outs: string[] = []
    if (n.next) outs.push(n.next)
    for (const c of n.choices ?? []) {
      if (c.goto) outs.push(c.goto)
      if (c.check) outs.push(c.check.pass, c.check.fail, c.check.crit ?? '', c.check.fumble ?? '')
      if (!c.goto && !c.check) reachEnd = true // 选项直接终止会话
    }
    for (const o of outs) {
      if (o && !seen.has(o)) {
        seen.add(o)
        queue.push(o)
      }
    }
  }
  if (!hasEnd || !reachEnd) fail(`${label}: 不存在可到达的 end 节点`)
}

const usedEndings = new Set<string>()

for (const version of ['male', 'female'] as Version[]) {
  console.log(`\n== 校验 ${version === 'male' ? '男版' : '女版'} ==`)
  const chars = getCharacters(version)
  if (chars.length < 5) fail(`${version}: 角色数量不足 5(当前 ${chars.length})`)

  for (const c of chars) {
    validateScript(c.intro, `${c.name}/intro`, usedEndings)
    c.topics.forEach((t, i) => validateScript(t, `${c.name}/topic${i}`, usedEndings))
    for (const h of c.hiddenTopics ?? []) {
      validateScript(h.script, `${c.name}/hidden`, usedEndings)
      if (!CODES.some((x) => x.id === h.codeId)) fail(`${c.name}: hiddenTopic 引用了不存在的暗号 id "${h.codeId}"`)
    }
    if (c.dateSpots.length < 2) fail(`${c.name}: 约会地点少于 2 个`)
    if (!c.trueFlag) fail(`${c.name}: 缺少 trueFlag`)
    if (c.blockLines.length === 0) fail(`${c.name}: 缺少拉黑台词`)

    // 看法题 × 角色
    for (const q of getOpinions()) {
      validateScript(buildOpinionScript(q, c), `${c.name}/opinion:${q.id}`, usedEndings)
    }

    // 约会模板 × 地点(好感拉满以触发表白注入,校验 cf_ 节点)
    for (let i = 0; i < c.dateSpots.length; i++) {
      const s = newGame(version, { mouth: 4, mind: 4, liquor: 3, culture: 3, image: 3, money: 3 }, 42)
      s.npcs[c.id].favor = 90
      s.npcs[c.id].dates = 1
      const sc = buildDateSession(s, c, c.dateSpots[i])
      validateScript(sc, `${c.name}/date:${c.dateSpots[i].template}`, usedEndings)
    }
  }

  // 随机事件
  const s = newGame(version, { mouth: 4, mind: 4, liquor: 3, culture: 3, image: 3, money: 3 }, 7)
  s.day = 7
  s.stats.mines = 3
  for (const id of Object.keys(s.npcs)) s.npcs[id].favor = 55
  for (const e of getEvents(version)) {
    if (!e.eligible(s)) {
      console.log(`  ⚠️ 事件 ${e.id} 在标准测试态下不可触发(可能条件苛刻,请人工确认)`)
      continue
    }
    const sc = e.build(s)
    if (sc) validateScript(sc, `event:${e.id}`, usedEndings)
  }
}

// 日常闲聊
for (const g of getGenericChats()) validateScript(g, `generic:${g.id}`, usedEndings)

// endGame 引用的结局必须存在
console.log('\n== 校验结局引用 ==')
usedEndings.add('all_blocked')
usedEndings.add('bankrupt')
usedEndings.add('awkward_full')
usedEndings.add('give_up_feast')
usedEndings.add('fate_win')
usedEndings.add('time_manager')
usedEndings.add('goodcard')
usedEndings.add('ambiguous')
usedEndings.add('readnoreply')
for (const id of usedEndings) {
  if (!findEnding(id)) fail(`结局 "${id}" 被引用但未在 endings.ts 中定义`)
}

// 暗号双向校验
for (const code of CODES) {
  const anyHidden = (['male', 'female'] as Version[]).some((v) =>
    getCharacters(v).some((c) => (c.hiddenTopics ?? []).some((h) => h.codeId === code.id)),
  )
  if (!anyHidden) fail(`暗号 "${code.code}" 没有任何隐藏剧情引用它`)
}

console.log(`\n共校验 ${checked} 个剧本。`)
if (errors > 0) {
  console.error(`\n💥 发现 ${errors} 个问题`)
  process.exit(1)
} else {
  console.log('✅ 全部通过')
}
