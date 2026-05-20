import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { useIdentity } from '@/hooks/use-identity'
import { cn } from '@/lib/utils'

export function IdentitySelector() {
  const { setCurrentUser } = useIdentity()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm transition-opacity duration-500",
        mounted ? "opacity-100" : "opacity-0"
      )}
    >
      <div
        className={cn(
          "glass rounded-2xl p-8 md:p-12 max-w-md mx-4 text-center space-y-8 transition-all duration-500",
          mounted ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
        )}
      >
        <div className="space-y-3">
          <div className={cn(
            "transition-all duration-500 delay-200",
            mounted ? "opacity-100 scale-100" : "opacity-0 scale-0"
          )}>
            <Heart className="w-12 h-12 text-primary fill-primary mx-auto glow-soft" />
          </div>
          <h2 className="text-2xl md:text-3xl font-serif text-foreground">Who are you?</h2>
          <p className="text-muted-foreground text-sm">Select your identity to enter our space</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {(['Kaustu', 'Riji'] as const).map((name, i) => (
            <button
              key={name}
              onClick={() => setCurrentUser(name)}
              className={cn(
                "relative p-6 rounded-xl transition-all duration-300",
                "glass-light hover:bg-primary/20 hover:border-primary/50",
                "group overflow-hidden hover:scale-[1.02] active:scale-[0.98]",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
              style={{ transitionDelay: mounted ? `${300 + i * 100}ms` : '0ms' }}
            >
              <div className="relative z-10">
                <span className="block text-3xl mb-2">{name === 'Kaustu' ? '💜' : '💗'}</span>
                <span className="text-lg font-medium text-foreground">{name}</span>
              </div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
              </div>
            </button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          You can switch anytime from the menu
        </p>
      </div>
    </div>
  )
}
