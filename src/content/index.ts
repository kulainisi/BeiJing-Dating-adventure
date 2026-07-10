import { CharacterProfile, OpinionQ, RandomEventDef, Script, TemplateId, Version } from '@/engine/types'
import { MALE_CHARS } from './male'
import { FEMALE_CHARS } from './female'
import { OPINIONS } from './opinions'
import { GENERIC_CHATS, INTERLUDES, SPICY_CHATS } from './generic'
import { TEMPLATES, DateTemplate } from './scenes'
import { getEventsFor, findEvent } from './events'

export { CODES } from './shared'
export { getWorkEvents } from './work'
export { buildPing } from './pings'
import { EXTRA_SPOTS, EXTRA_TOPICS, OPINION_REACTS, STYLE_PREFS } from './v4'
export { getEndings, getAllEndings, findEnding } from './endings'
export { DANMAKU, resolveDanmaku } from './comments'
export { findEvent }

/** v4 扩展合并:新约会地点/新话题/看法题定制反应 集中注册,不改角色文件(缓存,避免重复构造) */
const mergedCache: Partial<Record<Version, CharacterProfile[]>> = {}

function withV4(chars: CharacterProfile[]): CharacterProfile[] {
  return chars.map((c) => ({
    ...c,
    dateSpots: [...c.dateSpots, ...(EXTRA_SPOTS[c.id] ?? [])],
    topics: [...c.topics, ...(EXTRA_TOPICS[c.id] ?? [])],
    opinionReacts: OPINION_REACTS[c.id] ?? c.opinionReacts,
    stylePref: STYLE_PREFS[c.id] ?? c.stylePref,
  }))
}

export function getCharacters(v: Version): CharacterProfile[] {
  mergedCache[v] ??= withV4(v === 'male' ? MALE_CHARS : FEMALE_CHARS)
  return mergedCache[v]!
}

export function getCharacter(v: Version, id: string): CharacterProfile {
  const c = getCharacters(v).find((x) => x.id === id)
  if (!c) throw new Error(`未知角色: ${id}`)
  return c
}

export function getOpinions(): OpinionQ[] {
  return OPINIONS
}

export function getGenericChats(): Script[] {
  return GENERIC_CHATS
}

export function getSpicyChats(): Script[] {
  return SPICY_CHATS
}

export function getInterludes(): Script[] {
  return INTERLUDES
}

export function getTemplate(t: TemplateId): DateTemplate {
  return TEMPLATES[t]
}

export function getEvents(v: Version): RandomEventDef[] {
  return getEventsFor(v)
}
