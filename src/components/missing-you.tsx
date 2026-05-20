import { useState, useEffect, useCallback } from 'react'
import { Heart } from 'lucide-react'
import { SecretPopup } from '@/components/secret-popup'
import { MISS_ME_MESSAGES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useIdentity } from '@/hooks/use-identity'

export function MissingYou() {
  const { currentUser, partner } = useIdentity()

  const [showMessage, setShowMessage] = useState(false)
  const [currentMessage, setCurrentMessage] = useState('')
  const [tapCount, setTapCount] = useState(0)
  const [showSecret, setShowSecret] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [burst, setBurst] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(t)
  }, [])

  const handlePress = useCallback(() => {
    if (!currentUser || !partner) {
      alert('Pick your identity first 😭')
      return
    }

    const message = MISS_ME_MESSAGES[Math.floor(Math.random() * MISS_ME_MESSAGES.length)]
    setCurrentMessage(message)
    setShowMessage(true)
    setBurst(true)

    setTimeout(() => {
      setShowMessage(false)
      setBurst(false)
    }, 2200)

    fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Key dymspbtveuc3v3or3ylqql7hj",
      },
      body: JSON.stringify({
        app_id: "e46f14ac-f050-4201-a38f-1a2a861f5881",
        include_aliases: {
          external_id: [partner]
        },
        target_channel: "push",
        headings: { en: "💌 Missing You" },
        contents: { en: `${currentUser} misses you right now 🥹❤️` },
      }),
    })

    setTapCount((prev) => {
      const next = prev + 1
      if (next >= 5) {
        setTimeout(() => setShowSecret(true), 300)
        return 0
      }
      return next
    })
  }, [currentUser, partner])

  return (
    <div className="min-h-[calc(100vh-7rem)] flex flex-col items-center justify-center p-6">
      <div
        className={cn(
          "text-center mb-10 transition-all duration-700",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6"
        )}
      >
        <h1 className="text-3xl md:text-4xl font-serif text-foreground text-glow mb-2">
          Missing You
        </h1>
        <p className="text-muted-foreground text-sm">press whenever you miss me 💗</p>
      </div>

      <div className="relative flex items-center justify-center mb-10">
        {burst && (
          <>
            <div
              className="absolute w-56 h-56 rounded-full border-2 border-primary/40 animate-ping pointer-events-none"
              style={{ animationDuration: '0.6s' }}
            />
            <div
              className="absolute w-72 h-72 rounded-full border border-primary/20 animate-ping pointer-events-none"
              style={{ animationDuration: '0.9s' }}
            />
          </>
        )}

        <button
          onClick={handlePress}
          className={cn(
            "relative w-44 h-44 md:w-52 md:h-52 rounded-full flex items-center justify-center",
            "bg-gradient-to-br from-primary/80 via-primary to-accent/80",
            "glow transition-transform duration-150 active:scale-90 hover:scale-105",
            "select-none"
          )}
        >
          <div className="absolute inset-3 rounded-full bg-white/10 backdrop-blur-sm" />
          <div className="relative z-10 text-center">
            <Heart className="w-10 h-10 text-white fill-white mx-auto mb-1 animate-heartbeat" />
            <span className="text-white font-serif text-lg">PRESS ME</span>
          </div>
        </button>
      </div>

      <div className="h-16 flex items-center justify-center">
        <div
          className={cn(
            "glass rounded-2xl px-6 py-3 max-w-xs text-center transition-all duration-300",
            showMessage
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-3 pointer-events-none"
          )}
        >
          <p className="text-foreground font-serif">{currentMessage}</p>
        </div>
      </div>

      <p
        className={cn(
          "mt-4 text-xs text-muted-foreground/50 transition-all duration-700 delay-300",
          mounted ? "opacity-100" : "opacity-0"
        )}
      >
        {tapCount > 0 ? `${5 - tapCount} more for a secret... 🤫` : 'keep pressing...'}
      </p>

      <SecretPopup isOpen={showSecret} onClose={() => setShowSecret(false)} />
    </div>
  )
}
