import { useState, useCallback, useRef, useEffect } from 'react'
import { MUSIC_TRACKS } from '@/lib/constants'

export function useMusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const shouldAutoPlayRef = useRef(false)

  useEffect(() => {
    const audio = new Audio(MUSIC_TRACKS[currentTrackIndex].file)
    audioRef.current = audio
    setProgress(0)
    setDuration(0)

    const handleTimeUpdate = () => setProgress(audio.currentTime)
    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
      if (shouldAutoPlayRef.current) {
        audio.play().catch(console.error)
        setIsPlaying(true)
        shouldAutoPlayRef.current = false
      }
    }
    const handleEnded = () => {
      shouldAutoPlayRef.current = true
      setCurrentTrackIndex((prev) => (prev + 1) % MUSIC_TRACKS.length)
      setIsPlaying(false)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.pause()
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
      audio.src = ''
    }
  }, [currentTrackIndex])

  const toggle = useCallback(() => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().catch(console.error)
      setIsPlaying(true)
    }
  }, [isPlaying])

  const nextTrack = useCallback(() => {
    if (audioRef.current) audioRef.current.pause()
    shouldAutoPlayRef.current = isPlaying
    setIsPlaying(false)
    setCurrentTrackIndex((prev) => (prev + 1) % MUSIC_TRACKS.length)
  }, [isPlaying])

  const prevTrack = useCallback(() => {
    if (audioRef.current) audioRef.current.pause()
    shouldAutoPlayRef.current = isPlaying
    setIsPlaying(false)
    setCurrentTrackIndex((prev) => (prev - 1 + MUSIC_TRACKS.length) % MUSIC_TRACKS.length)
  }, [isPlaying])

  const selectTrack = useCallback((index: number) => {
    if (audioRef.current) audioRef.current.pause()
    shouldAutoPlayRef.current = isPlaying
    setIsPlaying(false)
    setCurrentTrackIndex(index)
  }, [isPlaying])

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setProgress(time)
    }
  }, [])

  return {
    currentTrack: MUSIC_TRACKS[currentTrackIndex],
    currentTrackIndex,
    isPlaying,
    progress,
    duration,
    toggle,
    nextTrack,
    prevTrack,
    selectTrack,
    seek,
  }
}
