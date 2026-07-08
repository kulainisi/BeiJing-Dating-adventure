// 可播种随机数:同一 seed 的一局,怪癖表可复现(check-story 与调试用)
let state = Date.now() >>> 0

export function seedRng(seed: number) {
  state = seed >>> 0
  if (state === 0) state = 0x9e3779b9
}

export function rand(): number {
  // mulberry32
  state |= 0
  state = (state + 0x6d2b79f5) | 0
  let t = Math.imul(state ^ (state >>> 15), 1 | state)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

export function rollD20(): number {
  return 1 + Math.floor(rand() * 20)
}

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)]
}

export function pickN<T>(arr: T[], n: number): T[] {
  const copy = [...arr]
  const out: T[] = []
  while (out.length < n && copy.length > 0) {
    out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0])
  }
  return out
}

export function chance(p: number): boolean {
  return rand() < p
}

export function weighted<T>(items: T[], weightOf: (t: T) => number): T | null {
  const ws = items.map(weightOf)
  const total = ws.reduce((a, b) => a + b, 0)
  if (total <= 0) return null
  let r = rand() * total
  for (let i = 0; i < items.length; i++) {
    r -= ws[i]
    if (r <= 0) return items[i]
  }
  return items[items.length - 1]
}
