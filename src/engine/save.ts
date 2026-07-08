import { GameState } from './types'

const RUN_KEY = 'bjdating.run.v2'
const GALLERY_KEY = 'bjdating.gallery.v1'

interface Gallery {
  unlocked: string[]
  deaths: string[]
  codes: string[]
  runs: number
}

function loadGallery(): Gallery {
  try {
    const raw = localStorage.getItem(GALLERY_KEY)
    if (raw) return { unlocked: [], deaths: [], codes: [], runs: 0, ...JSON.parse(raw) }
  } catch {
    /* 隐私模式等场景下 localStorage 不可用,静默降级 */
  }
  return { unlocked: [], deaths: [], codes: [], runs: 0 }
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
    const s = JSON.parse(raw) as GameState
    if (!s.version || !s.npcs) return null
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
