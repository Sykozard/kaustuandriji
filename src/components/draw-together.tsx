import { useEffect, useRef, useState, useCallback } from 'react'
import { Eraser, Trash2, Download, Pencil } from 'lucide-react'
import { useIdentity } from '@/hooks/use-identity'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const CANVAS_KEY = 'kaustuandriji_canvas'
const CHANNEL = 'drawing-room-v1'

const COLORS = {
  Kaustu: ['#e11d74', '#a855f7', '#ec4899', '#f472b6', '#ffffff', '#1a1015'],
  Riji: ['#f472b6', '#e11d74', '#fb7185', '#a855f7', '#ffffff', '#1a1015'],
}
const SIZES = [2, 4, 8, 14]

interface DrawEvent {
  x: number; y: number; prevX: number; prevY: number
  color: string; size: number; user: string
}

export function DrawTogether() {
  const { currentUser } = useIdentity()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const isDrawing = useRef(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const [color, setColor] = useState(currentUser === 'Kaustu' ? '#e11d74' : '#f472b6')
  const [size, setSize] = useState(4)
  const [isEraser, setIsEraser] = useState(false)
  const [online, setOnline] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctxRef.current = ctx

    const resize = () => {
      const saved = canvas.toDataURL()
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      ctx.fillStyle = '#0a0608'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      // Restore saved drawing
      const img = new Image()
      img.onload = () => ctx.drawImage(img, 0, 0)
      img.src = saved
    }

    resize()

    // Load saved canvas
    const saved = localStorage.getItem(CANVAS_KEY)
    if (saved) {
      const img = new Image()
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      img.src = saved
    } else {
      ctx.fillStyle = '#0a0608'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    window.addEventListener('resize', resize)
    setTimeout(() => setMounted(true), 100)
    return () => window.removeEventListener('resize', resize)
  }, [])

  // Save canvas periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const canvas = canvasRef.current
      if (canvas) localStorage.setItem(CANVAS_KEY, canvas.toDataURL())
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Supabase Realtime
  useEffect(() => {
    const channel = supabase.channel(CHANNEL)
    channelRef.current = channel

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        setOnline(Object.keys(state).length > 1)
      })
      .on('broadcast', { event: 'draw' }, ({ payload }: { payload: DrawEvent }) => {
        drawStroke(payload, false)
      })
      .on('broadcast', { event: 'clear' }, () => {
        clearCanvas(false)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user: currentUser, online_at: new Date().toISOString() })
        }
      })

    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser])

  const drawStroke = useCallback((data: DrawEvent, broadcast = true) => {
    const ctx = ctxRef.current
    if (!ctx) return
    ctx.beginPath()
    ctx.lineWidth = data.size
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = data.color
    ctx.moveTo(data.prevX, data.prevY)
    ctx.lineTo(data.x, data.y)
    ctx.stroke()

    if (broadcast && channelRef.current) {
      channelRef.current.send({ type: 'broadcast', event: 'draw', payload: data })
    }
  }, [])

  const clearCanvas = useCallback((broadcast = true) => {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (!canvas || !ctx) return
    ctx.fillStyle = '#0a0608'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    localStorage.removeItem(CANVAS_KEY)
    if (broadcast && channelRef.current) {
      channelRef.current.send({ type: 'broadcast', event: 'clear', payload: {} })
    }
  }, [])

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e) {
      const touch = e.touches[0]
      return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY }
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }
  }

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    isDrawing.current = true
    lastPos.current = getPos(e, canvas)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    if (!isDrawing.current || !lastPos.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const pos = getPos(e, canvas)
    const activeColor = isEraser ? '#0a0608' : color
    const activeSize = isEraser ? size * 3 : size
    drawStroke({ x: pos.x, y: pos.y, prevX: lastPos.current.x, prevY: lastPos.current.y, color: activeColor, size: activeSize, user: currentUser || '' })
    lastPos.current = pos
  }

  const stopDraw = () => {
    isDrawing.current = false
    lastPos.current = null
    const canvas = canvasRef.current
    if (canvas) localStorage.setItem(CANVAS_KEY, canvas.toDataURL())
  }

  const downloadCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = 'kaustuandriji-drawing.png'
    link.href = canvas.toDataURL()
    link.click()
  }

  const myColors = COLORS[currentUser as keyof typeof COLORS] || COLORS.Kaustu

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] md:h-screen p-3 md:p-6 max-w-5xl mx-auto">
      <div className={cn("text-center mb-3 transition-all duration-500", mounted ? "opacity-100" : "opacity-0")}>
        <h1 className="text-2xl md:text-3xl font-serif text-foreground text-glow">Draw Together</h1>
        <p className="text-muted-foreground text-xs mt-0.5 flex items-center justify-center gap-1.5">
          <span className={cn("w-1.5 h-1.5 rounded-full", online ? "bg-green-400" : "bg-muted-foreground/40")} />
          {online ? 'both online — drawing live! ✨' : 'drawing solo (share the link to draw together)'}
        </p>
      </div>

      {/* Toolbar */}
      <div className={cn("glass rounded-2xl p-3 mb-3 flex items-center gap-3 flex-wrap transition-all duration-500 delay-100", mounted ? "opacity-100" : "opacity-0")}>
        {/* Colors */}
        <div className="flex gap-1.5">
          {myColors.map(c => (
            <button
              key={c}
              onClick={() => { setColor(c); setIsEraser(false) }}
              className={cn("w-7 h-7 rounded-full transition-all duration-150 hover:scale-110",
                color === c && !isEraser ? "ring-2 ring-white/60 scale-110" : "")}
              style={{ background: c, border: c === '#1a1015' ? '1px solid rgba(255,255,255,0.2)' : 'none' }}
            />
          ))}
        </div>

        <div className="w-px h-6 bg-border" />

        {/* Sizes */}
        <div className="flex gap-1.5 items-center">
          {SIZES.map(s => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={cn("rounded-full bg-foreground transition-all duration-150 hover:scale-110",
                size === s ? "ring-2 ring-primary/60" : "opacity-40")}
              style={{ width: `${s + 8}px`, height: `${s + 8}px` }}
            />
          ))}
        </div>

        <div className="w-px h-6 bg-border" />

        {/* Tools */}
        <div className="flex gap-1.5">
          <button
            onClick={() => setIsEraser(false)}
            className={cn("p-2 rounded-xl transition-all", !isEraser ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5")}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsEraser(true)}
            className={cn("p-2 rounded-xl transition-all", isEraser ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5")}
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>

        <div className="ml-auto flex gap-1.5">
          <button onClick={downloadCanvas} className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all" title="Download">
            <Download className="w-4 h-4" />
          </button>
          <button onClick={() => clearCanvas()} className="p-2 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all" title="Clear">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className={cn("flex-1 glass rounded-2xl overflow-hidden transition-all duration-500 delay-150", mounted ? "opacity-100" : "opacity-0")}>
        <canvas
          ref={canvasRef}
          className="w-full h-full touch-none"
          style={{ cursor: isEraser ? 'cell' : 'crosshair' }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
      </div>
    </div>
  )
}
