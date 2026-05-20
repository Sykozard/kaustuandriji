import { useState, useEffect, useCallback } from 'react'
import { Sparkles } from 'lucide-react'
import { SecretPopup } from '@/components/secret-popup'
import { cn } from '@/lib/utils'

export function VirtualKiss() {
  const [tapCount, setTapCount] = useState(0)
  const [showSecret, setShowSecret] = useState(false)
  const [showKissMessage, setShowKissMessage] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleKiss = useCallback(() => {
    setShowKissMessage(true)
    setTimeout(() => setShowKissMessage(false), 1500)

    const newCount = tapCount + 1
    setTapCount(newCount)
    if (newCount >= 5) {
      setShowSecret(true)
      setTapCount(0)
    }
  }, [tapCount])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <div className="text-center">
        <div
          className={cn(
            "mb-12 transition-all duration-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"
          )}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <h1 className="text-3xl md:text-4xl font-serif text-foreground text-glow">
              Virtual Kiss Station
            </h1>
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <p className="text-muted-foreground text-sm">send your love across the distance</p>
        </div>

        <div className="relative inline-block">
          <button
            onClick={handleKiss}
            className="relative w-48 h-48 md:w-56 md:h-56 rounded-full glass glow text-4xl font-serif overflow-hidden transition-transform duration-150 hover:scale-105 active:scale-90"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/50 to-accent/50" />
            <span className="relative z-10 text-foreground">MWAH</span>
          </button>
        </div>

        <div className="h-16 mt-8">
          <div
            className={cn(
              "text-3xl transition-all duration-300",
              showKissMessage ? "opacity-100 scale-100" : "opacity-0 scale-50"
            )}
          >
            💋✨
          </div>
        </div>

        <p
          className={cn(
            "text-xs text-muted-foreground/50 transition-opacity duration-500",
            mounted ? "opacity-100" : "opacity-0"
          )}
        >
          {tapCount > 0 && tapCount < 5 ? `${5 - tapCount} more kisses for a secret...` : 'send as many as you want...'}
        </p>
      </div>

      <SecretPopup isOpen={showSecret} onClose={() => setShowSecret(false)} />
    </div>
  )
}
