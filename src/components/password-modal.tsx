import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  correctPassword: string
  title?: string
  description?: string
}

export function PasswordModal({
  isOpen,
  onClose,
  onSuccess,
  correctPassword,
  title = "Enter Password",
  description = "This content is password protected"
}: PasswordModalProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setVisible(true)
    } else {
      const timer = setTimeout(() => setVisible(false), 200)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === correctPassword) {
      setPassword('')
      setError(false)
      onSuccess()
    } else {
      setError(true)
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  const handleClose = () => {
    setPassword('')
    setError(false)
    onClose()
  }

  if (!visible) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 transition-opacity duration-200",
        isOpen ? "opacity-100" : "opacity-0"
      )}
      onClick={handleClose}
    >
      <div
        className={cn(
          "glass rounded-2xl p-6 md:p-8 max-w-sm w-full relative transition-all duration-200",
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95",
          shake && "animate-shake"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <h3 className="text-xl font-serif text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(false)
              }}
              placeholder="Enter password..."
              className={cn(
                "w-full px-4 py-3 rounded-xl bg-input border text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
                "transition-all duration-200",
                error ? "border-red-500 focus:ring-red-500/50" : "border-border"
              )}
              autoFocus
            />
            {error && (
              <p className="text-red-400 text-sm animate-fade-in">
                Wrong password, try again
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  )
}
