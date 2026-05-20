import { useState, useEffect, useCallback } from 'react'
import { Heart, Sparkles } from 'lucide-react'
import { SecretPopup } from '@/components/secret-popup'
import { cn } from '@/lib/utils'

interface KissParticle {
  id: number
  x: number
  y: number
  emoji: string
  size: number
  angle: number
}

export function KissesForYou() {
  const [tapCount, setTapCount] = useState(0)
  const [showSecret, setShowSecret] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [particles, setParticles] = useState<KissParticle[]>([])
  const [isPressed, setIsPressed] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(t)
  }, [])

  const spawnParticles = useCallback(() => {
    const emojis = ['💋', '❤️', '✨', '💗', '💕', '🌸']
    const newParticles: KissParticle[] = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: 50 + (Math.random() - 0.5) * 40,
      y: 50 + (Math.random() - 0.5) * 40,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      size: 18 + Math.floor(Math.random() * 20),
      angle: (Math.random() - 0.5) * 60,
    }))
    setParticles((prev) => [...prev, ...newParticles])
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((n) => n.id === p.id)))
    }, 900)
  }, [])

  const handleKiss = useCallback(() => {
    setIsPressed(true)
    setTimeout(() => setIsPressed(false), 150)
    spawnParticles()

    setTapCount((prev) => {
      const next = prev + 1
      if (next >= 5) {
        setTimeout(() => setShowSecret(true), 400)
        return 0
      }
      return next
    })
  }, [spawnParticles])

  return (
    <div className="min-h-[calc(100vh-7rem)] flex flex-col items-center justify-center p-6 overflow-hidden">
      <div
        className={cn(
          "text-center mb-10 transition-all duration-700",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6"
        )}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-accent" />
          <h1 className="text-3xl md:text-4xl font-serif text-foreground text-glow">
            Kisses for You
          </h1>
          <Sparkles className="w-5 h-5 text-accent" />
        </div>
        <p className="text-muted-foreground text-sm">send a kiss across the distance 💋</p>
      </div>

      {/* Kiss button with particles */}
      <div className="relative flex items-center justify-center mb-10">
        {/* Floating particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute pointer-events-none z-10 animate-kiss-particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              fontSize: `${p.size}px`,
              transform: `rotate(${p.angle}deg)`,
              '--angle': `${p.angle}deg`,
            } as React.CSSProperties}
          >
            {p.emoji}
          </div>
        ))}

        <button
          onClick={handleKiss}
          className={cn(
            "relative w-44 h-44 md:w-52 md:h-52 rounded-full",
            "glass border-2 border-primary/40 glow",
            "transition-all duration-150 select-none",
            isPressed ? "scale-90" : "scale-100 hover:scale-105"
          )}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-accent/20" />
          <div className="relative z-10 text-center flex flex-col items-center justify-center h-full">
            <span className="text-5xl mb-1">💋</span>
            <span className="text-foreground font-serif text-lg">MWAH</span>
          </div>
        </button>
      </div>

      {/* Kiss count */}
      <div
        className={cn(
          "glass rounded-2xl px-6 py-3 text-center transition-all duration-700 delay-200",
          mounted ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Heart className="w-4 h-4 text-primary fill-primary" />
          <span className="font-serif">kisses sent across the distance</span>
          <Heart className="w-4 h-4 text-primary fill-primary" />
        </div>
      </div>

      <p
        className={cn(
          "mt-4 text-xs text-muted-foreground/50 transition-all duration-700 delay-300",
          mounted ? "opacity-100" : "opacity-0"
        )}
      >
        {tapCount > 0 ? `${5 - tapCount} more for a surprise... 🤫` : 'send as many as you want ✨'}
      </p>

      <SecretPopup isOpen={showSecret} onClose={() => setShowSecret(false)} />
    </div>
  )
}
