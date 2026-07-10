import { GameState } from './types'

const RUN_KEY = 'bjdating.run.v2'
const GALLERY_KEY = 'bjdating.gallery.v1'

interface Gallery {
  unlocked: string[]
  deaths: string[]
  codes: string[]
  runs: number
  achievements: string[]
  rerollTokens: number
}

const GALLERY_DEFAULT: Gallery = {
  unlocked: [],
  deaths: [],
  codes: [],
  runs: 0,
  achievements: [],
  rerollTokens: 0,
}

function loadGallery(): Gallery {
  try {
    const raw = localStorage.getItem(GALLERY_KEY)
    if (raw) return { ...GALLERY_DEFAULT, ...JSON.parse(raw) }
  } catch {
    /* 隐私模式等场景下 localStorage 不可用,静默降级 */
  }
  return { ...GALLERY_DEFAULT }
}

function saveGallery(g: Gallery) {
  try {
    localStorage.setItem(GALLERY_KEY, JSON.stringify(g))
  } catch {
    /* ignore */
  }
}

export function getGallery(): Gallery {
  return loadGallery()
}

export function unlockEnding(id: string) {
  const g = loadGallery()
  if (!g.unlocked.includes(id)) {
    g.unlocked.push(id)
    saveGallery(g)
  }
}

export function addDeath(reason: string) {
  const g = loadGallery()
  if (!g.deaths.includes(reason)) {
    g.deaths.push(reason)
    if (g.deaths.length > 60) g.deaths.shift()
    saveGallery(g)
  }
}

export function addRun() {
  const g = loadGallery()
  g.runs++
  saveGallery(g)
}

export function getUnlockedCodes(): string[] {
  return loadGallery().codes
}

// ============ 元进度:成就 + 重投投胎骰 token ============
/** 解锁成就:返回本次「新」解锁的 id;每个新成就奖励 +1 重投投胎骰 token */
export function unlockAchievements(ids: string[]): string[] {
  const g = loadGallery()
  const fresh = ids.filter((id) => !g.achievements.includes(id))
  if (fresh.length) {
    g.achievements.push(...fresh)
    g.rerollTokens += fresh.length
    saveGallery(g)
  }
  return fresh
}

export function getRerollTokens(): number {
  return loadGallery().rerollTokens
}

/** 消费一个重投 token;成功返回 true */
export function useRerollToken(): boolean {
  const g = loadGallery()
  if (g.rerollTokens <= 0) return false
  g.rerollTokens--
  saveGallery(g)
  return true
}

export function tryUnlockCode(input: string, validCodes: { code: string; id: string }[]): string | null {
  const hit = validCodes.find((c) => c.code === input.trim())
  if (!hit) return null
  const g = loadGallery()
  if (!g.codes.includes(hit.id)) {
    g.codes.push(hit.id)
    saveGallery(g)
  }
  return hit.id
}

// ============ 局内存档 ============
export function saveRun(s: GameState) {
  try {
    localStorage.setItem(RUN_KEY, JSON.stringify(s))
  } catch {
    /* ignore */
  }
}

export function loadRun(): GameState | null {
  try {
    const raw = localStorage.getItem(RUN_KEY)
    if (!raw) return null
    const s = JSON.parse(raw) as GameState & { edu?: string }
    if (!s.version || !s.npcs) return null
    // v4 迁移:老存档只有文化档(edu),映射到一个气质相近的职业;房租已按旧规则日扣过,不再补收
    if (!s.prof) {
      const male = s.version === 'male'
      const eduMap: Record<string, GameState['prof']> = {
        gaozhi: male ? 'chengxuyuan' : 'lvshi',
        tiyu: 'jiaolian',
        mingyuan: 'kongjie',
        putong: male ? 'guoqi' : 'xinmeiti',
      }
      s.prof = eduMap[s.edu ?? ''] ?? (male ? 'guoqi' : 'xinmeiti')
      s.rentDay = 0
      if (!s.flags.includes(`prof:${s.prof}`)) s.flags.push(`prof:${s.prof}`)
    }
    // v4.1:教育背景回归(高知/普通/社会大学);旧值(体育生/名媛)与缺失都归一化为普通,gaozhi 原样保留
    if (!s.edu || !['gaozhi', 'putong', 'shehui'].includes(s.edu)) {
      s.edu = 'putong'
    }
    if (!s.flags.includes(`edu:${s.edu}`)) s.flags.push(`edu:${s.edu}`)
    return s
  } catch {
    return null
  }
}

export function clearRun() {
  try {
    localStorage.removeItem(RUN_KEY)
  } catch {
    /* ignore */
  }
}
