import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'

interface LoadingScreenProps {
  onComplete: () => void
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [phase, setPhase] = useState(0)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase(1), 800)
    const timer2 = setTimeout(() => setPhase(2), 1800)
    const timer3 = setTimeout(() => setExiting(true), 2800)
    const timer4 = setTimeout(() => onComplete(), 3300)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [onComplete])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center gradient-romantic transition-opacity duration-500 ${
        exiting ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="relative flex flex-col items-center gap-8">
        <div className="relative animate-heartbeat">
          <Heart className="w-20 h-20 text-primary fill-primary glow" />
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s' }}>
            <Heart className="absolute -top-4 left-1/2 -translate-x-1/2 w-3 h-3 text-accent fill-accent" />
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s', animationDelay: '-1.3s' }}>
            <Heart className="absolute -top-4 left-1/2 -translate-x-1/2 w-3 h-3 text-accent fill-accent" />
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s', animationDelay: '-2.6s' }}>
            <Heart className="absolute -top-4 left-1/2 -translate-x-1/2 w-3 h-3 text-accent fill-accent" />
          </div>
        </div>

        <div className="text-center space-y-3">
          <h1
            className={`text-2xl md:text-3xl font-serif text-foreground text-glow transition-all duration-500 ${
              phase >= 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            connecting Kaustu to Riji...
          </h1>
          <p
            className={`text-muted-foreground text-sm tracking-widest uppercase transition-opacity duration-500 ${
              phase >= 1 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            love is loading
          </p>
        </div>

        <div className="w-48 h-1 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all ease-out"
            style={{
              width: `${phase === 0 ? 0 : phase === 1 ? 50 : 100}%`,
              transitionDuration: phase === 0 ? '0ms' : '1000ms'
            }}
          />
        </div>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-glow rounded-full blur-3xl opacity-30 pointer-events-none" />
    </div>
  )
}
