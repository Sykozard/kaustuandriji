import { Link, useLocation } from 'wouter'
import { Home, Image, BookHeart, Music, Heart, Sparkles, CloudSun, RefreshCw, Gift, MessageCircleHeart, Calendar, Paintbrush } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useIdentity } from '@/hooks/use-identity'
import { memo } from 'react'

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/scrapbook', icon: Image, label: 'Our Space' },
  { href: '/vault', icon: BookHeart, label: 'Love Vault' },
  { href: '/music', icon: Music, label: 'Music' },
  { href: '/missing-you', icon: Heart, label: 'Missing You' },
  { href: '/kisses', icon: Sparkles, label: 'Kisses' },
  { href: '/future', icon: CloudSun, label: 'Future' },
  { href: '/wishlist', icon: Gift, label: 'Wishlist' },
  { href: '/jar', icon: MessageCircleHeart, label: 'Msg Jar' },
  { href: '/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/draw', icon: Paintbrush, label: 'Draw' },
]

const NavItem = memo(function NavItem({
  item,
  isActive,
  isMobile,
}: {
  item: (typeof navItems)[0]
  isActive: boolean
  isMobile?: boolean
}) {
  if (isMobile) {
    return (
      <Link
        href={item.href}
        className="relative flex flex-col items-center justify-center flex-shrink-0 w-14 py-2"
      >
        <div
          className={cn(
            "absolute inset-x-0.5 inset-y-0.5 rounded-xl transition-all duration-200",
            isActive ? "bg-primary/20" : "bg-transparent"
          )}
        />
        <item.icon
          className={cn(
            "w-5 h-5 relative z-10 transition-colors",
            isActive ? "text-primary" : "text-muted-foreground"
          )}
        />
        <span
          className={cn(
            "text-[9px] mt-0.5 relative z-10 transition-colors leading-tight whitespace-nowrap",
            isActive ? "text-primary" : "text-muted-foreground"
          )}
        >
          {item.label}
        </span>
      </Link>
    )
  }

  return (
    <Link
      href={item.href}
      className="relative w-14 h-12 flex items-center justify-center rounded-xl group"
    >
      <div
        className={cn(
          "absolute inset-0 rounded-xl transition-all duration-200",
          isActive ? "bg-primary/20" : "bg-transparent group-hover:bg-primary/10"
        )}
      />
      <item.icon
        className={cn(
          "w-5 h-5 relative z-10 transition-colors",
          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        )}
      />
      <div className="absolute left-full ml-2 px-2 py-1 bg-secondary rounded-md text-xs text-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        {item.label}
      </div>
    </Link>
  )
})

export const Navigation = memo(function Navigation() {
  const [pathname] = useLocation()
  const { currentUser, switchUser } = useIdentity()

  return (
    <>
      {/* Mobile bottom navigation — horizontally scrollable */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
        <div className="glass border-t border-border/50">
          <div
            className="flex items-stretch h-16 overflow-x-auto scrollbar-hide px-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {navItems.map((item) => (
              <NavItem
                key={item.href}
                item={item}
                isActive={pathname === item.href}
                isMobile
              />
            ))}
          </div>
        </div>
      </nav>

      {/* Desktop side navigation — scrollable */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 flex-col items-center py-6 glass border-r border-border/50 z-40 overflow-y-auto scrollbar-hide">
        <Link href="/" className="mb-6 flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center transition-transform hover:scale-110 active:scale-95">
            <Heart className="w-5 h-5 text-primary fill-primary" />
          </div>
        </Link>

        <div className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              isActive={pathname === item.href}
            />
          ))}
        </div>

        <div className="mt-4 flex flex-col items-center gap-2 flex-shrink-0">
          <button
            onClick={switchUser}
            className="p-2.5 rounded-xl glass-light hover:bg-primary/10 transition-colors group"
            title="Switch user"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
          <div className="text-[10px] text-muted-foreground text-center leading-tight">
            {currentUser}
          </div>
        </div>
      </nav>

      {/* Mobile header */}
      <header className="fixed top-0 left-0 right-0 z-40 md:hidden glass border-b border-border/50">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary fill-primary" />
            <span className="font-serif text-foreground text-sm">ana & ali</span>
          </Link>
          <button
            onClick={switchUser}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-light"
          >
            <span className="text-muted-foreground text-xs">{currentUser}</span>
            <RefreshCw className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
      </header>
    </>
  )
})