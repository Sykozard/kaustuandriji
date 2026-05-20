import { useMemo } from 'react'

interface FloatingHeart {
  id: number
  left: number
  delay: number
  duration: number
  size: number
  opacity: number
}

export function FloatingHearts() {
  const hearts = useMemo<FloatingHeart[]>(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: 10 + (i * 12),
      delay: i * 1.5,
      duration: 18 + (i % 3) * 4,
      size: 10 + (i % 3) * 4,
      opacity: 0.15 + (i % 3) * 0.05,
    })), []
  )

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute text-primary animate-float-heart"
          style={{
            left: `${heart.left}%`,
            bottom: '-20px',
            fontSize: `${heart.size}px`,
            opacity: heart.opacity,
            animationDelay: `${heart.delay}s`,
            animationDuration: `${heart.duration}s`,
          }}
        >
          &#x2665;
        </div>
      ))}
    </div>
  )
}
