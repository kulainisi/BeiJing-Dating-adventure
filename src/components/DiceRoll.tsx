import { useEffect, useState } from 'react'
import { CheckResult } from '@/engine/checks'

const OUTCOME_TEXT: Record<CheckResult['outcome'], string> = {
  crit: '🎆 大成功!!',
  pass: '✅ 检定成功',
  fail: '❌ 检定失败',
  fumble: '💀 大失败……',
}

/** 明骰 d20 检定动画:先滚动,后揭晓,点击继续 */
export function DiceRoll({ result, onDone }: { result: CheckResult; onDone: () => void }) {
  const [phase, setPhase] = useState<'rolling' | 'reveal'>('rolling')
  const [face, setFace] = useState(1)

  useEffect(() => {
    const iv = setInterval(() => setFace(1 + Math.floor(Math.random() * 20)), 70)
    const t = setTimeout(() => {
      clearInterval(iv)
      setFace(result.roll)
      setPhase('reveal')
    }, 950)
    return () => {
      clearInterval(iv)
      clearTimeout(t)
    }
  }, [result])

  return (
    <div className="dice-overlay" onClick={phase === 'reveal' ? onDone : undefined}>
      <div className="dice-label">命运检定 · D20</div>
      <div className={`d20 ${phase === 'rolling' ? 'rolling' : ''}`}>{face}</div>
      {phase === 'reveal' && (
        <>
          <div className={`dice-result ${result.outcome}`}>{OUTCOME_TEXT[result.outcome]}</div>
          <div className="dice-math">
            🎲{result.roll} + 技能{result.skillVal} = {result.total} vs 难度{result.dc}
          </div>
          <div className="tap-hint">点击继续</div>
        </>
      )}
    </div>
  )
}
