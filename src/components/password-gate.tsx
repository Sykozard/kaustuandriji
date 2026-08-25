import { useState, useEffect } from 'react'
import { Heart, Lock, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

const GATE_PASSWORD = 'analovesali69'
const STORAGE_KEY = 'anaandali_access'

interface PasswordGateProps {
  children: React.ReactNode
}

export function PasswordGate({ children }: PasswordGateProps) {
  const [unlocked, setUnlocked] = useState(false)
  const [checked, setChecked] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored === 'true') {
      setUnlocked(true)
    }
    setChecked(true)
    setTimeout(() => setMounted(true), 50)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === GATE_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, 'true')
      setUnlocked(true)
    } else {
      setError(true)
      setShake(true)
      setPassword('')
      setTimeout(() => setShake(false), 600)
      setTimeout(() => setError(false), 2500)
    }
  }

  if (!checked) return null
  if (unlocked) return <>{children}</>

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center gradient-romantic">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute text-primary/10 animate-float-heart select-none"
            style={{
              left: `${10 + i * 16}%`,
              bottom: '-20px',
              fontSize: `${18 + (i % 3) * 8}px`,
              animationDelay: `${i * 2.1}s`,
              animationDuration: `${20 + i * 3}s`,
            }}
          >♥</div>
        ))}
      </div>

      <div
        className={cn(
          "relative glass rounded-3xl p-8 md:p-12 max-w-sm w-full mx-4 text-center transition-all duration-500",
          mounted ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-6",
          shake && "animate-shake"
        )}
      >
        <div className="mb-8 space-y-3">
          <div className="w-16 h-16 rounded-full bg-primary/20 glow flex items-center justify-center mx-auto animate-pulse-glow">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-serif text-foreground text-glow">ana & ali</h1>
          <p className="text-sm text-muted-foreground">our private little world</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false) }}
              placeholder="enter the password..."
              className={cn(
                "w-full px-4 py-3 pr-11 rounded-xl bg-input border text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 transition-all duration-200",
                error
                  ? "border-red-500/60 focus:ring-red-500/30"
                  : "border-border focus:ring-primary/40 focus:border-primary/50"
              )}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="h-5">
            {error && (
              <p className="text-red-400 text-sm animate-fade-in">wrong password, try again</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] glow-soft"
          >
            Enter Our World
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-muted-foreground/40">
          <Heart className="w-3 h-3 fill-current" />
          <span className="text-xs">Ana & Ali</span>
          <Heart className="w-3 h-3 fill-current" />
        </div>
      </div>
    </div>
  )
}
