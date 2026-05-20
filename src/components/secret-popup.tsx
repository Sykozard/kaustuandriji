import { useState, useEffect } from 'react'
import { Heart, X } from 'lucide-react'
import { SECRET_MESSAGES } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface SecretPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function SecretPopup({ isOpen, onClose }: SecretPopupProps) {
  const [message, setMessage] = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const randomMessage = SECRET_MESSAGES[Math.floor(Math.random() * SECRET_MESSAGES.length)]
      setMessage(randomMessage)
      setVisible(true)
    } else {
      const timer = setTimeout(() => setVisible(false), 200)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!visible) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 transition-opacity duration-200",
        isOpen ? "opacity-100" : "opacity-0"
      )}
      onClick={onClose}
    >
      <div
        className={cn(
          "glass rounded-2xl p-8 max-w-sm w-full text-center relative overflow-hidden transition-all duration-300",
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-90"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <Heart className="w-16 h-16 text-primary fill-primary mx-auto mb-4 animate-heartbeat" />

        <p className="text-xl font-serif text-foreground text-glow">
          {message}
        </p>

        <div className="mt-6">
          <span className="text-xs text-muted-foreground tracking-widest uppercase">
            secret message
          </span>
        </div>

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute text-primary/20 animate-float-heart"
              style={{
                left: `${20 + i * 30}%`,
                bottom: '0',
                fontSize: '14px',
                animationDelay: `${i * 0.5}s`,
                animationDuration: '4s',
              }}
            >
              &#x2665;
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
