import { useState, useEffect } from 'react'
import { Coffee, Heart, Zap, Plane, Sun, Sparkles, CloudSun } from 'lucide-react'
import { FUTURE_PLANS } from '@/lib/constants'
import { cn } from '@/lib/utils'

const iconMap: Record<string, React.ElementType> = {
  coffee: Coffee,
  heart: Heart,
  zap: Zap,
  plane: Plane,
  sun: Sun,
}

export function Future() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div
        className={cn(
          "text-center mb-12 transition-all duration-500",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"
        )}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <CloudSun className="w-6 h-6 text-accent" />
          <h1 className="text-3xl md:text-4xl font-serif text-foreground text-glow">
            Our Future
          </h1>
          <Sparkles className="w-6 h-6 text-accent" />
        </div>
        <p className="text-muted-foreground text-sm">dreams we&apos;ll make real together</p>
      </div>

      <div className="relative">
        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-accent to-primary opacity-30" />

        <div className="space-y-8">
          {FUTURE_PLANS.map((plan, index) => {
            const Icon = iconMap[plan.icon] || Heart
            const isEven = index % 2 === 0

            return (
              <div
                key={plan.title}
                className={cn(
                  "relative flex items-start gap-4 transition-all duration-500",
                  isEven ? 'md:flex-row' : 'md:flex-row-reverse',
                  mounted ? "opacity-100 translate-x-0" : isEven ? "opacity-0 -translate-x-8" : "opacity-0 translate-x-8"
                )}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="absolute left-6 md:left-1/2 w-3 h-3 -translate-x-1/2 mt-6">
                  <div className="w-full h-full rounded-full bg-primary glow-soft animate-pulse" />
                </div>

                <div className={`flex-1 pl-12 md:pl-0 ${isEven ? 'md:pr-8 md:text-right' : 'md:pl-8'}`}>
                  <div className="glass rounded-2xl p-6 hover:bg-white/5 transition-all duration-300 hover:-translate-y-1">
                    <div className={`flex items-center gap-3 mb-3 ${isEven ? 'md:flex-row-reverse' : ''}`}>
                      <div className="p-2 rounded-xl bg-primary/20 flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="text-xl font-serif text-foreground">{plan.title}</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{plan.description}</p>
                  </div>
                </div>

                <div className="hidden md:block flex-1" />
              </div>
            )
          })}
        </div>
      </div>

      <div
        className={cn(
          "text-center mt-16 transition-all duration-500 delay-700",
          mounted ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="glass rounded-2xl p-6 inline-block">
          <Heart className="w-8 h-8 text-primary fill-primary mx-auto mb-3 animate-heartbeat" />
          <p className="text-foreground font-serif text-lg">
            Every future is beautiful with you
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            - us, forever
          </p>
        </div>
      </div>
    </div>
  )
}
