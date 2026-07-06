import { useEffect, useRef } from 'react'
import { usePlayer } from '../audio/PlayerContext'
import { prefersReducedMotion } from '../hooks/useReveal'

/**
 * Audio-reactive canvas. When a track plays, it renders the live
 * frequency spectrum from the WebAudio analyser; idle, it breathes
 * with a slow synthetic waveform so the section never feels dead.
 */
export function Visualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { playing, getAnalyser } = usePlayer()
  const playingRef = useRef(playing)
  playingRef.current = playing

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = prefersReducedMotion()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let raf = 0
    let w = 0
    let h = 0
    let running = true
    const freq = new Uint8Array(128)

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const bar = (x: number, v: number, barW: number) => {
      const bh = Math.max(2, v * h * 0.72)
      const y = (h - bh) / 2
      const grad = ctx.createLinearGradient(0, y, 0, y + bh)
      grad.addColorStop(0, 'rgba(20,25,34,0.85)')
      grad.addColorStop(0.55, 'rgba(31,158,255,0.85)')
      grad.addColorStop(1, 'rgba(39,174,96,0.9)')
      ctx.fillStyle = grad
      ctx.fillRect(x, y, barW, bh)
    }

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h)
      const analyser = getAnalyser()
      const n = 56
      const gap = 3
      const barW = (w - gap * (n - 1)) / n

      if (analyser && playingRef.current) {
        analyser.getByteFrequencyData(freq)
        for (let i = 0; i < n; i++) {
          // sample lower 70% of the spectrum where the music lives
          const v = freq[Math.floor((i / n) * freq.length * 0.7)] / 255
          bar(i * (barW + gap), 0.08 + v * 0.92, barW)
        }
      } else {
        for (let i = 0; i < n; i++) {
          const v = reduced
            ? 0.18 + 0.14 * Math.sin(i * 0.55)
            : 0.14 +
              0.1 * Math.sin(i * 0.5 + t * 0.0012) +
              0.07 * Math.sin(i * 0.23 - t * 0.0007)
          bar(i * (barW + gap), Math.abs(v), barW)
        }
      }
    }

    const loop = (t: number) => {
      if (!running) return
      draw(t)
      if (!reduced || playingRef.current) raf = requestAnimationFrame(loop)
    }

    // only animate while on screen
    const io = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting
      cancelAnimationFrame(raf)
      if (running) raf = requestAnimationFrame(loop)
    })

    resize()
    draw(0)
    window.addEventListener('resize', resize)
    io.observe(canvas)
    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      io.disconnect()
    }
  }, [getAnalyser])

  return (
    <section id="visuals" aria-labelledby="visuals-heading" className="relative z-10 mx-auto max-w-6xl px-5 py-24 md:py-36">
      <p className="section-eyebrow reveal" data-decode="">04 / Visual Feed</p>
      <h2 id="visuals-heading" className="font-display chrome-text reveal mt-5 uppercase" style={{ fontSize: 'clamp(2.4rem, 6vw, 4.5rem)', lineHeight: 1 }}>
        See the signal
      </h2>
      <p className="reveal reveal-late mt-5 max-w-xl" style={{ color: 'var(--dim)' }}>
        Press play on any track and the feed reads the mix in real time.
      </p>

      <div
        className="glass-panel reveal reveal-late mt-12 overflow-hidden rounded-2xl p-4 md:p-6"
        role="img"
        aria-label={playing ? 'Live audio spectrum visualizer' : 'Idle audio visualizer waveform'}
      >
        <canvas ref={canvasRef} className="block h-[200px] w-full md:h-[260px]" />
        <p className="mono-tag mt-3 text-center">
          {playing ? '● live — reading the mix' : '○ idle — waiting on playback'}
        </p>
      </div>

      {/* future video/teaser slots */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {['Teaser 001', 'Teaser 002', 'Teaser 003'].map((label, i) => (
          <div
            key={label}
            className={`glass-panel reveal ${i === 1 ? 'reveal-late' : i === 2 ? 'reveal-later' : ''} flex aspect-video items-center justify-center rounded-xl`}
          >
            <span className="mono-tag">{label} — video slot</span>
          </div>
        ))}
      </div>
    </section>
  )
}
