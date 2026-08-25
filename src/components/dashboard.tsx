import { useState, useEffect, memo } from 'react'
import { Heart, Calendar, MapPin, Clock, Quote } from 'lucide-react'
import { RELATIONSHIP_START } from '@/lib/constants'

const QUOTES = [
  { text: "I carry your heart with me, I carry it in my heart.", author: "E.E. Cummings" },
  { text: "Distance means so little when someone means so much.", author: "unknown" },
  { text: "I would rather spend one lifetime with you, than face all the ages of this world alone.", author: "Tolkien" },
  { text: "You are my today and all of my tomorrows.", author: "Leo Christopher" },
  { text: "In a sea of people, my eyes will always search for you.", author: "unknown" },
  { text: "Whatever our souls are made of, his and mine are the same.", author: "Brontë" },
  { text: "You are the finest, loveliest, tenderest, and most beautiful person I have ever known.", author: "F. Scott Fitzgerald" },
]

function getRelationshipTime(start: Date) {
  const now = new Date()
  let years = now.getFullYear() - start.getFullYear()
  let months = now.getMonth() - start.getMonth()
  let days = now.getDate() - start.getDate()

  if (days < 0) {
    months--
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    days += prevMonth.getDate()
  }
  if (months < 0) { years--; months += 12 }

  const hours = now.getHours()
  const minutes = now.getMinutes()
  const seconds = now.getSeconds()

  return { years, months, days, hours, minutes, seconds }
}

function getNextAnniversary() {
  const now = new Date()
  let ann = new Date(now.getFullYear(), 3, 13) // April 13
  if (now >= ann) ann = new Date(now.getFullYear() + 1, 3, 13)
  return ann
}

function getCountdown(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now())
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return { days, hours, minutes, seconds }
}

function DashboardCard({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])
  return (
    <div
      className={`glass rounded-2xl p-5 transition-all duration-500 ${className} ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      }`}
    >
      {children}
    </div>
  )
}

const LiveTimer = memo(function LiveTimer() {
  const [time, setTime] = useState(() => getRelationshipTime(RELATIONSHIP_START))

  useEffect(() => {
    const interval = setInterval(() => setTime(getRelationshipTime(RELATIONSHIP_START)), 1000)
    return () => clearInterval(interval)
  }, [])

  const units = [
    { value: time.years, label: 'Years' },
    { value: time.months, label: 'Months' },
    { value: time.days, label: 'Days' },
    { value: time.hours, label: 'Hours' },
    { value: time.minutes, label: 'Mins' },
    { value: time.seconds, label: 'Secs' },
  ]

  return (
    <DashboardCard className="col-span-full" delay={80}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-primary/20">
          <Heart className="w-5 h-5 text-primary fill-primary" />
        </div>
        <span className="text-sm text-muted-foreground">Together for</span>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {units.map((u) => (
          <div key={u.label} className="glass-light rounded-xl p-3 text-center">
            <span className="block text-2xl md:text-3xl font-serif text-foreground tabular-nums leading-none">
              {u.value.toString().padStart(2, '0')}
            </span>
            <span className="text-[10px] text-muted-foreground mt-1 block">{u.label}</span>
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground mt-3">since 13 April 2025</p>
    </DashboardCard>
  )
})

const AnniversaryCountdown = memo(function AnniversaryCountdown() {
  const [cd, setCd] = useState(() => getCountdown(getNextAnniversary()))

  useEffect(() => {
    const interval = setInterval(() => setCd(getCountdown(getNextAnniversary())), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <DashboardCard delay={160}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-accent/20">
          <Calendar className="w-5 h-5 text-accent" />
        </div>
        <span className="text-sm text-muted-foreground">Until Anniversary</span>
      </div>
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { value: cd.days, label: 'Days' },
          { value: cd.hours, label: 'Hrs' },
          { value: cd.minutes, label: 'Min' },
          { value: cd.seconds, label: 'Sec' },
        ].map((item) => (
          <div key={item.label} className="glass-light rounded-xl p-2">
            <span className="text-xl md:text-2xl font-serif text-foreground block tabular-nums">
              {item.value.toString().padStart(2, '0')}
            </span>
            <span className="text-[10px] text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground mt-3">13 April every year</p>
    </DashboardCard>
  )
})

const DistanceTracker = memo(function DistanceTracker() {
  return (
    <DashboardCard delay={240}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-pink-soft/20">
          <MapPin className="w-5 h-5 text-pink-soft" />
        </div>
        <span className="text-sm text-muted-foreground">Distance Apart</span>
      </div>
      <div className="text-center">
        <div className="text-4xl font-serif text-foreground tabular-nums">10,372</div>
        <div className="text-muted-foreground text-sm mt-1">kilometres</div>
        <div className="flex items-center justify-center gap-3 mt-3 text-xs text-muted-foreground">
          <span>🇮🇳 India</span>
          <Heart className="w-3 h-3 text-primary fill-primary" />
          <span>🇦🇺 Melbourne</span>
        </div>
      </div>
    </DashboardCard>
  )
})

const LiveTimeZones = memo(function LiveTimeZones() {
  const [times, setTimes] = useState({ ana: '', ali: '', anaDate: '', aliDate: '' })

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const fmt = (tz: string) =>
        new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).format(now)
      const fmtDate = (tz: string) =>
        new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', month: 'short', day: 'numeric' }).format(now)
      setTimes({
        ana: fmt('Asia/Kolkata'),
        ali: fmt('Australia/Melbourne'),
        anaDate: fmtDate('Asia/Kolkata'),
        aliDate: fmtDate('Australia/Melbourne'),
      })
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <DashboardCard delay={320} className="col-span-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-primary/20">
          <Clock className="w-5 h-5 text-primary" />
        </div>
        <span className="text-sm text-muted-foreground">Our Time Zones</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { name: 'Ana', emoji: '💜', time: times.ana, date: times.anaDate, location: 'India (IST)' },
          { name: 'Ali', emoji: '💗', time: times.ali, date: times.aliDate, location: 'Melbourne (AEDT)' },
        ].map((u) => (
          <div key={u.name} className="glass-light rounded-xl p-4 text-center">
            <span className="text-2xl">{u.emoji}</span>
            <p className="text-sm text-muted-foreground mt-1">{u.name}</p>
            <p className="text-lg font-mono text-foreground mt-2 tabular-nums">{u.time || '--:--:--'}</p>
            <p className="text-xs text-muted-foreground mt-1">{u.date || '---'}</p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">{u.location}</p>
          </div>
        ))}
      </div>
    </DashboardCard>
  )
})

const QuoteCard = memo(function QuoteCard() {
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)])

  return (
    <DashboardCard className="col-span-full" delay={400}>
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-xl bg-accent/20 flex-shrink-0 mt-0.5">
          <Quote className="w-5 h-5 text-accent" />
        </div>
        <div>
          <p className="text-foreground font-serif italic leading-relaxed">"{quote.text}"</p>
          <p className="text-muted-foreground text-xs mt-2">— {quote.author}</p>
        </div>
      </div>
    </DashboardCard>
  )
})

export function Dashboard() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setTimeout(() => setMounted(true), 10) }, [])

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div
        className={`text-center mb-8 transition-all duration-500 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        <h1 className="text-3xl md:text-4xl font-serif text-foreground text-glow mb-1">
          ana & ali
        </h1>
        <p className="text-muted-foreground text-sm">our love, our story, our forever 💗</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LiveTimer />
        <AnniversaryCountdown />
        <DistanceTracker />
        <LiveTimeZones />
        <QuoteCard />
      </div>
    </div>
  )
}
