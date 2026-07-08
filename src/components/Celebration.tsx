import { useMemo } from 'react'

/**
 * 全屏里程碑庆祝 / 成就 / 翻车时刻。纯表现层,pointer-events 关闭,不拦交互。
 * 由 Game.tsx 用 setTimeout 控制显隐(~2.2s 自动消失)。
 * - good   :好感越线/确立/真心/同居/上岸 → 爱心迸发 + 称号横幅
 * - achieve:局中解锁成就 → 金色奖章迸发
 * - bad    :拉黑/社死/寄了 → 红闪碎裂 + 丧气弹幕感
 */
export function Celebration({
  kind,
  title,
  sub,
}: {
  kind: 'good' | 'bad' | 'achieve'
  title: string
  sub: string
}) {
  const parts = useMemo(() => {
    const set =
      kind === 'achieve'
        ? ['🏅', '⭐', '✨', '🎖️', '🌟', '👑']
        : kind === 'good'
          ? ['💗', '💖', '✨', '🎉', '💘', '⭐', '🌸']
          : ['💔', '🥀', '😭', '⚡', '🖤']
    return Array.from({ length: 18 }, (_, i) => ({
      e: set[i % set.length],
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      dur: 1.5 + Math.random() * 1.3,
      size: 18 + Math.random() * 26,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={`celebrate ${kind}`}>
      <div className="celebrate-parts">
        {parts.map((p, i) => (
          <span
            key={i}
            style={{
              left: `${p.left}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.dur}s`,
              fontSize: p.size,
            }}
          >
            {p.e}
          </span>
        ))}
      </div>
      <div className="celebrate-banner">
        <div className="cb-title">{title}</div>
        <div className="cb-sub">{sub}</div>
      </div>
    </div>
  )
}
