import { useState, useEffect, useRef } from 'react'
import { Plus, X, RefreshCw, Heart } from 'lucide-react'
import { useIdentity } from '@/hooks/use-identity'
import { cn } from '@/lib/utils'

interface JarMessage {
  id: string
  from: 'Kaustu' | 'Riji'
  content: string
  createdAt: string
  revealed: boolean
}

const STORAGE_KEY = 'kaustuandriji_jar'

function getMessages(): JarMessage[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function saveMessages(msgs: JarMessage[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs))
}

export function MessageJar() {
  const { currentUser, partner } = useIdentity()
  const [messages, setMessages] = useState<JarMessage[]>([])
  const [revealed, setRevealed] = useState<JarMessage | null>(null)
  const [newMsg, setNewMsg] = useState('')
  const [showWrite, setShowWrite] = useState(false)
  const [shaking, setShaking] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showEmpty, setShowEmpty] = useState(false)
  const jarRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setMessages(getMessages())
    setTimeout(() => setMounted(true), 50)
  }, [])

  const shake = () => {
    const unrevealed = messages.filter(m => !m.revealed)
    if (unrevealed.length === 0) {
      setShowEmpty(true)
      setTimeout(() => setShowEmpty(false), 2000)
      return
    }
    setShaking(true)
    setTimeout(() => {
      setShaking(false)
      const pick = unrevealed[Math.floor(Math.random() * unrevealed.length)]
      const updated = messages.map(m => m.id === pick.id ? { ...m, revealed: true } : m)
      setMessages(updated)
      saveMessages(updated)
      setRevealed(pick)
    }, 600)
  }

  const addMessage = () => {
    if (!newMsg.trim() || !currentUser) return
    const msg: JarMessage = {
      id: Date.now().toString(),
      from: currentUser,
      content: newMsg.trim(),
      createdAt: new Date().toISOString(),
      revealed: false,
    }
    const updated = [msg, ...messages]
    setMessages(updated)
    saveMessages(updated)
    setNewMsg('')
    setShowWrite(false)
  }

  const resetAll = () => {
    const updated = messages.map(m => ({ ...m, revealed: false }))
    setMessages(updated)
    saveMessages(updated)
    setRevealed(null)
  }

  const unrevealed = messages.filter(m => !m.revealed).length
  const total = messages.length

  return (
    <div className="min-h-[calc(100vh-7rem)] flex flex-col items-center justify-start p-4 md:p-8 max-w-2xl mx-auto">
      <div className={cn("text-center mb-8 w-full transition-all duration-500", mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4")}>
        <h1 className="text-3xl md:text-4xl font-serif text-foreground text-glow mb-1">Message Jar</h1>
        <p className="text-muted-foreground text-sm">shake the jar to reveal a love note 🫙</p>
        {total > 0 && (
          <p className="text-xs text-primary mt-2">{unrevealed} unread · {total} total</p>
        )}
      </div>

      {/* The Jar */}
      <div className="relative flex flex-col items-center mb-8">
        {/* Floating note count rings */}
        <div className="absolute -inset-8 rounded-full border border-primary/10 pointer-events-none" />
        <div className="absolute -inset-16 rounded-full border border-primary/5 pointer-events-none" />

        <button
          ref={jarRef}
          onClick={shake}
          className={cn(
            "relative w-40 h-52 flex flex-col items-center justify-center cursor-pointer select-none",
            "transition-all duration-150 active:scale-95 hover:scale-105",
            shaking && "animate-shake"
          )}
        >
          {/* Jar SVG illustration */}
          <div className="relative">
            {/* Lid */}
            <div className="w-28 h-5 bg-gradient-to-b from-primary/60 to-primary/40 rounded-t-sm mx-auto border-x border-t border-primary/60" />
            {/* Body */}
            <div className="w-32 h-40 glass border border-primary/30 rounded-b-3xl rounded-t-sm relative overflow-hidden flex items-end justify-center pb-4">
              {/* Fill based on message count */}
              <div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/20 to-transparent transition-all duration-500"
                style={{ height: `${Math.min(90, total * 12)}%` }}
              />
              {/* Floating notes inside */}
              {[...Array(Math.min(unrevealed, 5))].map((_, i) => (
                <div
                  key={i}
                  className="absolute text-base animate-float-heart"
                  style={{
                    left: `${20 + (i * 15)}%`,
                    bottom: `${20 + (i % 3) * 20}%`,
                    animationDelay: `${i * 0.4}s`,
                    animationDuration: `${3 + i * 0.5}s`,
                    fontSize: '18px',
                    opacity: 0.7,
                  }}
                >
                  💌
                </div>
              ))}
              <span className="relative z-10 text-3xl font-serif text-primary/80 text-glow">
                {unrevealed > 0 ? unrevealed : '✨'}
              </span>
            </div>
            {/* Label */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[9px] text-primary/60 tracking-widest uppercase whitespace-nowrap">
              love notes
            </div>
          </div>
        </button>

        <p className="mt-4 text-sm text-muted-foreground">
          {shaking ? 'shaking...' : showEmpty ? 'no more notes! add some 💌' : 'tap to shake ✨'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-8 w-full max-w-xs">
        <button
          onClick={() => setShowWrite(v => !v)}
          className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Drop a Note
        </button>
        {messages.some(m => m.revealed) && (
          <button
            onClick={resetAll}
            className="px-4 py-2.5 rounded-xl glass-light text-muted-foreground hover:text-foreground transition-all flex items-center gap-1.5"
            title="Put all notes back"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Write form */}
      {showWrite && (
        <div className="glass rounded-2xl p-5 mb-6 w-full animate-scale-in">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">
              from <span className="text-foreground">{currentUser}</span> to <span className="text-foreground">{partner}</span>
            </p>
            <button onClick={() => setShowWrite(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <textarea
            value={newMsg}
            onChange={e => setNewMsg(e.target.value)}
            placeholder={`write a little love note for ${partner?.toLowerCase()}...`}
            className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 font-serif"
            rows={3}
            autoFocus
          />
          <button
            onClick={addMessage}
            disabled={!newMsg.trim()}
            className={cn(
              "mt-3 w-full py-2.5 rounded-xl font-medium transition-all duration-200",
              newMsg.trim()
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-secondary text-muted-foreground cursor-not-allowed"
            )}
          >
            Drop into Jar 🫙
          </button>
        </div>
      )}

      {/* Revealed message */}
      {revealed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setRevealed(null)}>
          <div className="glass rounded-3xl p-8 max-w-sm w-full text-center relative animate-scale-in" onClick={e => e.stopPropagation()}>
            <button onClick={() => setRevealed(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
            <div className="text-5xl mb-4">💌</div>
            <p className="text-lg font-serif text-foreground leading-relaxed">"{revealed.content}"</p>
            <div className="mt-5 flex items-center justify-center gap-2">
              <Heart className="w-4 h-4 text-primary fill-primary animate-heartbeat" />
              <span className="text-sm text-muted-foreground">from {revealed.from}</span>
              <Heart className="w-4 h-4 text-primary fill-primary animate-heartbeat" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
