import { useState, useEffect } from 'react'
import { Gift, Plus, Check, Trash2, Heart, Sparkles, MapPin, Coffee, Star } from 'lucide-react'
import { useIdentity } from '@/hooks/use-identity'
import { cn } from '@/lib/utils'

interface WishItem {
  id: string
  title: string
  category: 'gift' | 'activity' | 'place' | 'food' | 'other'
  addedBy: 'Kaustu' | 'Riji'
  done: boolean
  createdAt: string
  notes?: string
}

const STORAGE_KEY = 'kaustuandriji_wishlist'

const CATEGORIES = [
  { id: 'gift', label: 'Gift', icon: Gift, color: 'text-pink-400' },
  { id: 'activity', label: 'Activity', icon: Sparkles, color: 'text-violet-400' },
  { id: 'place', label: 'Place', icon: MapPin, color: 'text-blue-400' },
  { id: 'food', label: 'Food', icon: Coffee, color: 'text-amber-400' },
  { id: 'other', label: 'Other', icon: Star, color: 'text-rose-400' },
] as const

function getItems(): WishItem[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function saveItems(items: WishItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function Wishlist() {
  const { currentUser } = useIdentity()
  const [items, setItems] = useState<WishItem[]>([])
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [category, setCategory] = useState<WishItem['category']>('activity')
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setItems(getItems())
    setTimeout(() => setMounted(true), 50)
  }, [])

  const addItem = () => {
    if (!title.trim() || !currentUser) return
    const item: WishItem = {
      id: Date.now().toString(),
      title: title.trim(),
      category,
      addedBy: currentUser,
      done: false,
      createdAt: new Date().toISOString(),
      notes: notes.trim() || undefined,
    }
    const updated = [item, ...items]
    setItems(updated)
    saveItems(updated)
    setTitle('')
    setNotes('')
  }

  const toggleDone = (id: string) => {
    const updated = items.map(i => i.id === id ? { ...i, done: !i.done } : i)
    setItems(updated)
    saveItems(updated)
  }

  const deleteItem = (id: string) => {
    const updated = items.filter(i => i.id !== id)
    setItems(updated)
    saveItems(updated)
  }

  const filtered = items.filter(i =>
    filter === 'all' ? true : filter === 'done' ? i.done : !i.done
  )

  const doneCount = items.filter(i => i.done).length

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <div className={cn("text-center mb-8 transition-all duration-500", mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4")}>
        <div className="flex items-center justify-center gap-2 mb-1">
          <Gift className="w-6 h-6 text-primary" />
          <h1 className="text-3xl md:text-4xl font-serif text-foreground text-glow">Our Wishlist</h1>
        </div>
        <p className="text-muted-foreground text-sm">things we want to do & give each other 💗</p>
        {items.length > 0 && (
          <p className="text-xs text-primary mt-2">{doneCount} of {items.length} done ✓</p>
        )}
      </div>

      {/* Add form */}
      <div className={cn("glass rounded-2xl p-5 mb-6 transition-all duration-500 delay-100", mounted ? "opacity-100" : "opacity-0")}>
        <div className="space-y-3">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            placeholder="add a wish..."
            className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <input
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="notes (optional)..."
            className="w-full px-4 py-2.5 rounded-xl bg-input border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                  category === cat.id
                    ? "bg-primary/20 border border-primary/40 text-primary"
                    : "glass-light text-muted-foreground hover:text-foreground"
                )}
              >
                <cat.icon className={cn("w-3 h-3", category === cat.id ? "text-primary" : cat.color)} />
                {cat.label}
              </button>
            ))}
          </div>
          <button
            onClick={addItem}
            disabled={!title.trim()}
            className={cn(
              "w-full py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-200",
              title.trim()
                ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.99]"
                : "bg-secondary text-muted-foreground cursor-not-allowed"
            )}
          >
            <Plus className="w-4 h-4" />
            Add to Wishlist
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-5">
        {(['all', 'pending', 'done'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm transition-all duration-200 capitalize",
              filter === f ? "bg-primary/20 text-primary border border-primary/30" : "glass-light text-muted-foreground hover:text-foreground"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-serif">
              {filter === 'done' ? 'nothing done yet...' : 'no wishes yet, add some above ✨'}
            </p>
          </div>
        )}
        {filtered.map((item, i) => {
          const cat = CATEGORIES.find(c => c.id === item.category)!
          return (
            <div
              key={item.id}
              className={cn(
                "glass rounded-xl p-4 flex items-start gap-3 group transition-all duration-300",
                item.done && "opacity-60",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              )}
              style={{ transitionDelay: `${150 + i * 40}ms` }}
            >
              <button
                onClick={() => toggleDone(item.id)}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200 border",
                  item.done
                    ? "bg-primary/20 border-primary/40 text-primary"
                    : "border-border/60 text-transparent hover:border-primary/40"
                )}
              >
                {item.done ? <Heart className="w-4 h-4 fill-current" /> : <Check className="w-4 h-4 text-muted-foreground/40" />}
              </button>

              <div className="flex-1 min-w-0">
                <p className={cn("text-foreground font-medium", item.done && "line-through text-muted-foreground")}>{item.title}</p>
                {item.notes && <p className="text-xs text-muted-foreground mt-0.5">{item.notes}</p>}
                <div className="flex items-center gap-2 mt-1.5">
                  <div className={cn("flex items-center gap-1 text-xs", cat.color)}>
                    <cat.icon className="w-3 h-3" />
                    {cat.label}
                  </div>
                  <span className="text-muted-foreground/40 text-xs">·</span>
                  <span className="text-xs text-muted-foreground">{item.addedBy}</span>
                </div>
              </div>

              <button
                onClick={() => deleteItem(item.id)}
                className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 transition-all duration-200"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
