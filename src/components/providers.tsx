import { useState, useEffect } from 'react'
import { IdentityProvider, useIdentity } from '@/hooks/use-identity'
import { LoadingScreen } from '@/components/loading-screen'
import { IdentitySelector } from '@/components/identity-selector'
import { FloatingHearts } from '@/components/floating-hearts'
import { Navigation } from '@/components/navigation'
import { PasswordGate } from '@/components/password-gate'

function AppContent({ children }: { children: React.ReactNode }) {
  const [showLoadingScreen, setShowLoadingScreen] = useState(true)
  const { isIdentitySet } = useIdentity()

  useEffect(() => {
    const hasSeenLoading = sessionStorage.getItem('hasSeenLoading')
    if (hasSeenLoading) {
      setShowLoadingScreen(false)
    }
  }, [])

  const handleLoadingComplete = () => {
    setShowLoadingScreen(false)
    sessionStorage.setItem('hasSeenLoading', 'true')
  }

  if (showLoadingScreen) {
    return <LoadingScreen onComplete={handleLoadingComplete} />
  }

  if (!isIdentitySet) {
    return <IdentitySelector />
  }

  return (
    <>
      <FloatingHearts />
      <Navigation />
      <main className="min-h-screen pt-14 pb-20 md:pt-0 md:pb-0 md:pl-20">
        {children}
      </main>
    </>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PasswordGate>
      <IdentityProvider>
        <AppContent>{children}</AppContent>
      </IdentityProvider>
    </PasswordGate>
  )
}
