import { useState, useEffect, useCallback } from 'react'
import { Heart } from 'lucide-react'
import { SecretPopup } from '@/components/secret-popup'
import { MISS_ME_MESSAGES } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function MissMe() {
  const [tapCount, setTapCount] = useState(0)
  const [showMessage, setShowMessage] = useState(false)
  const [currentMessage, setCurrentMessage] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handlePress = useCallback(() => {
    const message = MISS_ME_MESSAGES[Math.floor(Math.random() * MISS_ME_MESSAGES.length)]
    setCurrentMessage(message)
    setShowMessage(true)
    setTimeout(() => setShowMessage(false), 2000)

    const newCount = tapCount + 1
    setTapCount(newCount)
    if (newCount >= 5) {
      setShowSecret(true)
      setTapCount(0)
    }
  }, [tapCount])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <div
          className={cn(
            "mb-12 transition-all duration-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"
          )}
        >
          <h1 className="text-3xl md:text-4xl font-serif text-foreground text-glow mb-2">
            Miss Me?
          </h1>
          <p className="text-muted-foreground text-sm">tap when you miss me</p>
        </div>

        <div className="relative inline-block">
          <button
            onClick={handlePress}
            className="relative w-48 h-48 md:w-56 md:h-56 rounded-full bg-gradient-to-br from-primary to-accent glow text-primary-foreground text-2xl font-serif transition-transform duration-150 hover:scale-105 active:scale-95 animate-pulse-glow"
          >
            <span className="relative z-10">PRESS ME</span>
            <div className="absolute inset-4 rounded-full bg-white/10" />
          </button>
        </div>

        <div className="h-20 mt-8">
          <div
            className={cn(
              "glass rounded-2xl px-6 py-4 inline-block transition-all duration-300",
              showMessage ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"
            )}
          >
            <p className="text-lg font-serif text-foreground">{currentMessage}</p>
          </div>
        </div>

        <p
          className={cn(
            "text-xs text-muted-foreground/50 mt-4 transition-opacity duration-500",
            mounted ? "opacity-100" : "opacity-0"
          )}
        >
          {tapCount > 0 && tapCount < 5 ? `${5 - tapCount} more for a secret...` : 'keep pressing...'}
        </p>
      </div>

      <SecretPopup isOpen={showSecret} onClose={() => setShowSecret(false)} />
    </div>
  )
}
