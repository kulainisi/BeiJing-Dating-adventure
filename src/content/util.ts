import { Line, NodeDef, Script } from '@/engine/types'

export const npc = (text: string): Line => ({ who: 'npc', text })
export const me = (text: string): Line => ({ who: 'me', text })
export const nar = (text: string): Line => ({ who: 'nar', text })
export const sys = (text: string): Line => ({ who: 'sys', text })

export const node = (id: string, lines: Line[], rest?: Partial<NodeDef>): NodeDef => ({
  id,
  lines,
  ...rest,
})

export function chat(id: string, nodes: NodeDef[], start = nodes[0].id): Script {
  return { id, kind: 'chat', nodes: Object.fromEntries(nodes.map((n) => [n.id, n])), start }
}

export function scene(
  id: string,
  title: string,
  location: string,
  bg: string,
  nodes: NodeDef[],
  start = nodes[0].id,
): Script {
  return {
    id,
    kind: 'scene',
    title,
    location,
    bg,
    nodes: Object.fromEntries(nodes.map((n) => [n.id, n])),
    start,
  }
}

export function eventScript(id: string, title: string, bg: string, nodes: NodeDef[]): Script {
  return {
    id,
    kind: 'event',
    title,
    bg,
    nodes: Object.fromEntries(nodes.map((n) => [n.id, n])),
    start: nodes[0].id,
  }
}
