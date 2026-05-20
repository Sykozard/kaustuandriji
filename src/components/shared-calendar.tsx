import { useState, useEffect } from 'react'
import { Calendar, Plus, Trash2, Clock, Heart, Star, Plane, Gift, X } from 'lucide-react'
import { format, differenceInDays, isPast, isFuture, parseISO, addYears } from 'date-fns'
import { useIdentity } from '@/hooks/use-identity'
import { cn } from '@/lib/utils'

interface CalEvent {
  id: string
  title: string
  date: string
  category: 'anniversary' | 'visit' | 'milestone' | 'birthday' | 'special'
  addedBy: 'Kaustu' | 'Riji'
  repeatsYearly: boolean
  notes?: string
}

const STORAGE_KEY = 'kaustuandriji_calendar'

const CATS = [
  { id: 'anniversary', label: 'Anniversary', icon: Heart, color: 'text-primary' },
  { id: 'visit', label: 'Visit', icon: Plane, color: 'text-blue-400' },
  { id: 'milestone', label: 'Milestone', icon: Star, color: 'text-amber-400' },
  { id: 'birthday', label: 'Birthday', icon: Gift, color: 'text-violet-400' },
  { id: 'special', label: 'Special', icon: Clock, color: 'text-rose-400' },
] as const

const DEFAULT_EVENTS: CalEvent[] = [
  { id: 'anniversary', title: 'Our Anniversary 💗', date: '2026-05-10', category: 'anniversary', addedBy: 'Kaustu', repeatsYearly: true },
]

function getEvents(): CalEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_EVENTS
  } catch { return DEFAULT_EVENTS }
}
function saveEvents(events: CalEvent[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
}

function getNextDate(dateStr: string, repeatsYearly: boolean): Date {
  const d = parseISO(dateStr)
  if (!repeatsYearly || isFuture(d)) return d
  let next = addYears(d, Math.ceil(differenceInDays(new Date(), d) / 365))
  while (isPast(next)) next = addYears(next, 1)
  return next
}

function DaysChip({ date, repeatsYearly }: { date: string; repeatsYearly: boolean }) {
  const next = getNextDate(date, repeatsYearly)
  const diff = differenceInDays(next, new Date())
  if (diff === 0) return <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">Today! 🎉</span>
  if (diff < 0 && !repeatsYearly) return <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">Passed</span>
  return (
    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", diff <= 30 ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground")}>
      {diff} days
    </span>
  )
}

export function SharedCalendar() {
  const { currentUser } = useIdentity()
  const [events, setEvents] = useState<CalEvent[]>([])
  const [mounted, setMounted] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [category, setCategory] = useState<CalEvent['category']>('special')
  const [repeatsYearly, setRepeatsYearly] = useState(false)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    setEvents(getEvents())
    setTimeout(() => setMounted(true), 50)
  }, [])

  const addEvent = () => {
    if (!title.trim() || !date || !currentUser) return
    const ev: CalEvent = {
      id: Date.now().toString(),
      title: title.trim(),
      date,
      category,
      addedBy: currentUser,
      repeatsYearly,
      notes: notes.trim() || undefined,
    }
    const updated = [...events, ev]
    setEvents(updated)
    saveEvents(updated)
    setTitle(''); setDate(''); setNotes('')
    setRepeatsYearly(false); setShowForm(false)
  }

  const deleteEvent = (id: string) => {
    if (id === 'anniversary') return
    const updated = events.filter(e => e.id !== id)
    setEvents(updated)
    saveEvents(updated)
  }

  const sorted = [...events].sort((a, b) => {
    const da = getNextDate(a.date, a.repeatsYearly)
    const db = getNextDate(b.date, b.repeatsYearly)
    if (isPast(da) && !a.repeatsYearly) return 1
    if (isPast(db) && !b.repeatsYearly) return -1
    return da.getTime() - db.getTime()
  })

  const nextEvent = sorted.find(e => isFuture(getNextDate(e.date, e.repeatsYearly)) || differenceInDays(getNextDate(e.date, e.repeatsYearly), new Date()) === 0)

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <div className={cn("text-center mb-8 transition-all duration-500", mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4")}>
        <div className="flex items-center justify-center gap-2 mb-1">
          <Calendar className="w-6 h-6 text-primary" />
          <h1 className="text-3xl md:text-4xl font-serif text-foreground text-glow">Our Calendar</h1>
        </div>
        <p className="text-muted-foreground text-sm">special dates we never want to forget 📅</p>
      </div>

      {/* Next up card */}
      {nextEvent && (
        <div className={cn("glass rounded-2xl p-5 mb-6 border border-primary/20 transition-all duration-500 delay-100", mounted ? "opacity-100" : "opacity-0")}>
          <p className="text-xs text-primary font-medium uppercase tracking-wider mb-2">Coming up next</p>
          <p className="text-xl font-serif text-foreground">{nextEvent.title}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm text-muted-foreground">
              {format(getNextDate(nextEvent.date, nextEvent.repeatsYearly), 'MMMM d, yyyy')}
            </span>
            <DaysChip date={nextEvent.date} repeatsYearly={nextEvent.repeatsYearly} />
          </div>
        </div>
      )}

      {/* Add button */}
      <button
        onClick={() => setShowForm(v => !v)}
        className="w-full py-3 mb-6 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-all hover:scale-[1.01] active:scale-[0.99]"
      >
        <Plus className="w-4 h-4" />
        Add Special Date
      </button>

      {/* Form */}
      {showForm && (
        <div className="glass rounded-2xl p-5 mb-6 animate-scale-in">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm font-medium text-foreground">New Date</p>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-muted-foreground hover:text-foreground" /></button>
          </div>
          <div className="space-y-3">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="what's the occasion?"
              className="w-full px-4 py-2.5 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="notes (optional)"
              className="w-full px-4 py-2.5 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm" />
            <div className="flex gap-2 flex-wrap">
              {CATS.map(cat => (
                <button key={cat.id} onClick={() => setCategory(cat.id)}
                  className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all",
                    category === cat.id ? "bg-primary/20 border border-primary/40 text-primary" : "glass-light text-muted-foreground hover:text-foreground")}>
                  <cat.icon className="w-3 h-3" /> {cat.label}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setRepeatsYearly(v => !v)}
                className={cn("w-10 h-5 rounded-full transition-all duration-200 relative flex-shrink-0",
                  repeatsYearly ? "bg-primary" : "bg-secondary")}
              >
                <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200",
                  repeatsYearly ? "left-5" : "left-0.5")} />
              </div>
              <span className="text-sm text-muted-foreground">Repeats every year</span>
            </label>
            <button onClick={addEvent} disabled={!title.trim() || !date}
              className={cn("w-full py-2.5 rounded-xl font-medium transition-all duration-200",
                title.trim() && date ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-secondary text-muted-foreground cursor-not-allowed")}>
              Add to Calendar
            </button>
          </div>
        </div>
      )}

      {/* Events list */}
      <div className="space-y-3">
        {sorted.map((ev, i) => {
          const cat = CATS.find(c => c.id === ev.category)!
          const nextDate = getNextDate(ev.date, ev.repeatsYearly)
          const passed = isPast(nextDate) && differenceInDays(nextDate, new Date()) !== 0
          return (
            <div key={ev.id} className={cn("glass rounded-xl p-4 flex items-start gap-3 group transition-all duration-300",
              passed && "opacity-50", mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3")}
              style={{ transitionDelay: `${200 + i * 50}ms` }}>
              <div className={cn("p-2 rounded-xl bg-primary/10 flex-shrink-0", cat.color)}>
                <cat.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground font-medium">{ev.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {format(nextDate, 'MMMM d, yyyy')}
                  {ev.repeatsYearly && <span className="ml-1 text-primary/60">· yearly</span>}
                </p>
                {ev.notes && <p className="text-xs text-muted-foreground/70 mt-1">{ev.notes}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <DaysChip date={ev.date} repeatsYearly={ev.repeatsYearly} />
                {ev.id !== 'anniversary' && (
                  <button onClick={() => deleteEvent(ev.id)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 transition-all">
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
