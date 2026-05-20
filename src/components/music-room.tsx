import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, SkipBack, SkipForward, Disc3 } from 'lucide-react'
import { useMusicPlayer } from '@/hooks/use-music-player'
import { MUSIC_TRACKS } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function MusicRoom() {
  const [mounted, setMounted] = useState(false)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)

  const {
    currentTrack,
    currentTrackIndex,
    isPlaying,
    progress,
    duration,
    toggle,
    nextTrack,
    prevTrack,
    selectTrack,
    seek,
  } = useMusicPlayer()

  useEffect(() => {
    setMounted(true)
  }, [])

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getSeekTime = useCallback((clientX: number) => {
    if (!progressBarRef.current || !duration) return null
    const rect = progressBarRef.current.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return percent * duration
  }, [duration])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDraggingRef.current = true
    const time = getSeekTime(e.clientX)
    if (time !== null) seek(time)

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return
      const time = getSeekTime(e.clientX)
      if (time !== null) seek(time)
    }
    const handleMouseUp = () => {
      isDraggingRef.current = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [getSeekTime, seek])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const time = getSeekTime(e.touches[0].clientX)
    if (time !== null) seek(time)

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const time = getSeekTime(e.touches[0].clientX)
      if (time !== null) seek(time)
    }
    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)
  }, [getSeekTime, seek])

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <div
        className={cn(
          "text-center mb-8 transition-all duration-500",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"
        )}
      >
        <h1 className="text-3xl md:text-4xl font-serif text-foreground text-glow mb-2">
          Music Room
        </h1>
        <p className="text-muted-foreground text-sm">our love songs</p>
      </div>

      <div
        className={cn(
          "glass rounded-3xl p-8 mb-8 transition-all duration-500 delay-100",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
        )}
      >
        <div className="relative w-48 h-48 mx-auto mb-8">
          <div
            className={cn(
              "absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 glow transition-transform",
              isPlaying && "animate-spin-slow"
            )}
          >
            <div className="absolute inset-4 rounded-full bg-romantic-dark flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
              <div className="absolute inset-8 rounded-full border border-primary/10" />
              <div className="absolute inset-16 rounded-full bg-primary/20" />
              <Disc3 className="w-12 h-12 text-primary absolute" />
            </div>
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-serif text-foreground mb-1">
            {currentTrack.name}
          </h2>
          <p className="text-muted-foreground text-sm">Taylor Swift</p>
        </div>

        <div className="mb-6">
          <div
            ref={progressBarRef}
            className="w-full h-3 bg-secondary rounded-full cursor-pointer relative group"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-100 pointer-events-none"
              style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{ left: `calc(${duration ? (progress / duration) * 100 : 0}% - 8px)` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground tabular-nums">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6">
          <button
            onClick={prevTrack}
            className="p-3 rounded-full glass-light hover:bg-primary/20 transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <SkipBack className="w-5 h-5 text-foreground" />
          </button>

          <button
            onClick={toggle}
            className="p-5 rounded-full bg-primary text-primary-foreground glow transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8" />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="p-3 rounded-full glass-light hover:bg-primary/20 transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <SkipForward className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>

      <div
        className={cn(
          "space-y-2 transition-all duration-500 delay-200",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
        )}
      >
        {MUSIC_TRACKS.map((track, index) => (
          <div
            key={track.name}
            onClick={() => selectTrack(index)}
            className={cn(
              "glass rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-all duration-200 hover:bg-white/5",
              currentTrackIndex === index && "bg-primary/10 border border-primary/20"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
              currentTrackIndex === index ? "bg-primary/20" : "bg-secondary"
            )}>
              {currentTrackIndex === index && isPlaying ? (
                <div className="flex items-end gap-0.5 h-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-primary animate-sound-wave rounded-full"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">{index + 1}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className={cn(
                "font-medium truncate",
                currentTrackIndex === index ? "text-primary" : "text-foreground"
              )}>
                {track.name}
              </p>
              <p className="text-xs text-muted-foreground">Taylor Swift</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
