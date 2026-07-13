import { useEffect, useState, useRef } from 'react'

export default function AnimatedCounter({ value, duration = 1200, className = '' }) {
  const [display, setDisplay] = useState(0)
  const prevValue = useRef(0)
  const rafRef = useRef(null)

  useEffect(() => {
    const startVal = prevValue.current
    const endVal = typeof value === 'number' ? value : 0
    const startTime = performance.now()

    function tick(now) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(startVal + (endVal - startVal) * eased))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        prevValue.current = endVal
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [value, duration])

  return <span className={`tabular ${className}`}>{display}</span>
}
