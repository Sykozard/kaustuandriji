import { useState, useEffect } from 'react'
import { Heart, Lock, BookHeart, Send, Trash2, X } from 'lucide-react'
import { format } from 'date-fns'
import { useIdentity } from '@/hooks/use-identity'
import { PasswordModal } from '@/components/password-modal'
import { VAULT_PASSWORD } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface Letter {
  id: string
  from: 'Kaustu' | 'Riji'
  to: 'Kaustu' | 'Riji'
  content: string
  created_at: string
}

const STORAGE_KEY = 'kaustuandriji_letters'

function getLettersFromStorage(): Letter[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLettersToStorage(letters: Letter[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(letters))
}

export function LoveVault() {
  const { currentUser, partner } = useIdentity()
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [letters, setLetters] = useState<Letter[]>([])
  const [newLetter, setNewLetter] = useState('')
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isUnlocked) {
      setLetters(getLettersFromStorage())
    }
  }, [isUnlocked])

  const handleUnlock = () => {
    setShowPasswordModal(false)
    setIsUnlocked(true)
  }

  const handleSendLetter = () => {
    if (!newLetter.trim() || !currentUser) return

    const letter: Letter = {
      id: Date.now().toString(),
      from: currentUser,
      to: partner,
      content: newLetter.trim(),
      created_at: new Date().toISOString(),
    }

    const updatedLetters = [letter, ...letters]
    setLetters(updatedLetters)
    saveLettersToStorage(updatedLetters)
    setNewLetter('')
  }

  const handleDeleteLetter = (id: string) => {
    const updatedLetters = letters.filter(l => l.id !== id)
    setLetters(updatedLetters)
    saveLettersToStorage(updatedLetters)
    setSelectedLetter(null)
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div
          className={cn(
            "text-center transition-all duration-500",
            mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
          )}
        >
          <div className="w-24 h-24 rounded-full glass mx-auto flex items-center justify-center mb-6 glow animate-pulse-glow">
            <Lock className="w-10 h-10 text-primary" />
          </div>

          <h1 className="text-3xl font-serif text-foreground text-glow mb-2">Love Vault</h1>
          <p className="text-muted-foreground text-sm mb-8">Private letters between us</p>

          <button
            className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium transition-transform hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => setShowPasswordModal(true)}
          >
            Unlock Vault
          </button>

          <PasswordModal
            isOpen={showPasswordModal}
            onClose={() => setShowPasswordModal(false)}
            onSuccess={handleUnlock}
            correctPassword={VAULT_PASSWORD}
            title="Unlock Love Vault"
            description="Enter our special code"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <div
        className={cn(
          "text-center mb-8 transition-all duration-500",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"
        )}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <BookHeart className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-serif text-foreground text-glow">Love Vault</h1>
        </div>
        <p className="text-muted-foreground text-sm">our private love letters</p>
      </div>

      <div
        className={cn(
          "glass rounded-2xl p-6 mb-8 transition-all duration-500 delay-100",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
        )}
      >
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-4 h-4 text-primary fill-primary" />
          <span className="text-sm text-muted-foreground">Write for {partner?.toLowerCase()}...</span>
        </div>

        <textarea
          value={newLetter}
          onChange={(e) => setNewLetter(e.target.value)}
          placeholder={`Dear ${partner}, ...`}
          className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-32 font-serif"
          rows={4}
        />

        <div className="flex justify-end mt-4">
          <button
            onClick={handleSendLetter}
            disabled={!newLetter.trim()}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all duration-200",
              newLetter.trim()
                ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
                : "bg-secondary text-muted-foreground cursor-not-allowed"
            )}
          >
            <Send className="w-4 h-4" />
            <span>Send Letter</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {letters.length === 0 ? (
          <div className="text-center py-12 animate-fade-in">
            <BookHeart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-serif">No letters yet...</p>
            <p className="text-muted-foreground text-sm mt-1">Write your first love letter above</p>
          </div>
        ) : (
          letters.map((letter, index) => (
            <div
              key={letter.id}
              className={cn(
                "glass rounded-2xl p-5 cursor-pointer hover:bg-white/5 transition-all duration-300",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
              )}
              style={{ transitionDelay: `${100 + index * 50}ms` }}
              onClick={() => setSelectedLetter(letter)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{letter.from === 'Kaustu' ? '💜' : '💗'}</span>
                    <span className="text-sm text-foreground">{letter.from}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-sm text-foreground">{letter.to}</span>
                  </div>
                  <p className="text-muted-foreground line-clamp-2 font-serif text-sm">
                    {letter.content}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {format(new Date(letter.created_at), 'MMM d')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedLetter && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setSelectedLetter(null)}
        >
          <div
            className="glass rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedLetter.from === 'Kaustu' ? '💜' : '💗'}</span>
                <div>
                  <p className="text-foreground font-medium">From {selectedLetter.from}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(selectedLetter.created_at), 'MMMM d, yyyy • h:mm a')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteLetter(selectedLetter.id)}
                  className="p-2 rounded-full hover:bg-red-500/20 transition-colors group"
                >
                  <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-red-400" />
                </button>
                <button
                  onClick={() => setSelectedLetter(null)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="glass-light rounded-xl p-4">
              <p className="text-foreground font-serif whitespace-pre-wrap leading-relaxed">
                {selectedLetter.content}
              </p>
            </div>

            <div className="text-center mt-4">
              <Heart className="w-6 h-6 text-primary fill-primary mx-auto animate-heartbeat" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
