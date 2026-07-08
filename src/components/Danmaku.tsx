export interface DanmakuItem {
  id: number
  text: string
  top: number
  dur: number
}

export function DanmakuLayer({ items }: { items: DanmakuItem[] }) {
  if (items.length === 0) return null
  return (
    <div className="danmaku-layer">
      {items.map((it) => (
        <span
          key={it.id}
          className="danmaku-item"
          style={{ top: `${it.top}%`, animationDuration: `${it.dur}s` }}
        >
          {it.text}
        </span>
      ))}
    </div>
  )
}
