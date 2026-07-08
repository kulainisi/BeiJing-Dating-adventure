import { CharacterProfile, OpinionQ, RandomEventDef, Script, TemplateId, Version } from '@/engine/types'
import { MALE_CHARS } from './male'
import { FEMALE_CHARS } from './female'
import { OPINIONS } from './opinions'
import { GENERIC_CHATS, INTERLUDES, SPICY_CHATS } from './generic'
import { TEMPLATES, DateTemplate } from './scenes'
import { getEventsFor, findEvent } from './events'

export { CODES } from './shared'
export { getEndings, getAllEndings, findEnding } from './endings'
export { DANMAKU, resolveDanmaku } from './comments'
export { findEvent }

export function getCharacters(v: Version): CharacterProfile[] {
  return v === 'male' ? MALE_CHARS : FEMALE_CHARS
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
