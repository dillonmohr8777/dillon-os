import { useRef, type ReactNode } from 'react'
import { artist } from '../content/album'
import { prefersReducedMotion } from '../hooks/useReveal'

/**
 * Mouse-follow 3D tilt (fine pointers only, rect cached on enter,
 * rAF-throttled). The Mac-Miller-style photo box and the logo lockup
 * both ride on this.
 */
function TiltBox({ children, max = 7, className = '' }: { children: ReactNode; max?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const rect = useRef<DOMRect | null>(null)
  const queued = useRef(false)
  const pos = useRef({ x: 0, y: 0 })
  const enabled = () => window.matchMedia('(pointer: fine)').matches && !prefersReducedMotion()

  return (
    <div
      ref={ref}
      className={className}
      style={{ transition: 'transform 0.18s ease-out' }}
      onMouseEnter={() => {
        if (enabled()) rect.current = ref.current?.getBoundingClientRect() ?? null
      }}
      onMouseMove={(e) => {
        pos.current = { x: e.clientX, y: e.clientY }
        if (queued.current || !rect.current) return
        queued.current = true
        requestAnimationFrame(() => {
          queued.current = false
          const r = rect.current
          const el = ref.current
          if (!r || !el) return
          const px = (pos.current.x - r.left) / r.width - 0.5
          const py = (pos.current.y - r.top) / r.height - 0.5
          el.style.transform = `perspective(900px) rotateY(${px * max}deg) rotateX(${py * -max}deg) translateY(-6px) scale(1.015)`
        })
      }}
      onMouseLeave={() => {
        rect.current = null
        if (ref.current) ref.current.style.transform = ''
      }}
    >
      {children}
    </div>
  )
}

/** The big artist-shot slot, Mac Miller style: wide box, 3D tilt,
 *  deep soft shadow with a blue/green ambient glow behind it. */
function HeroPhoto() {
  return (
    <div className="reveal reveal-later relative mt-16 w-full max-w-3xl">
      {/* ambient shadow backdrop */}
      <div
        aria-hidden="true"
        className="absolute -inset-x-8 -bottom-10 top-10 -z-10"
        style={{
          background:
            'radial-gradient(60% 55% at 50% 62%, rgba(20,25,34,0.22), transparent 70%), radial-gradient(45% 45% at 28% 70%, rgba(31,158,255,0.16), transparent 70%), radial-gradient(45% 45% at 74% 66%, rgba(23,168,107,0.13), transparent 70%)',
          filter: 'blur(18px)',
        }}
      />
      <TiltBox max={6}>
        <span className="pop-box block">
          {artist.heroImage ? (
            <img src={artist.heroImage} alt={`${artist.name} portrait`} className="block h-auto w-full" loading="lazy" />
          ) : (
            <span
              className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-3 px-6"
              style={{
                background:
                  'radial-gradient(70% 90% at 50% 0%, #fdfeff, transparent 60%), radial-gradient(90% 70% at 50% 100%, #ccd6e2, transparent 65%), linear-gradient(165deg, #eef2f7, #d8e0e9)',
              }}
            >
              <span className="font-display chrome-text text-2xl uppercase tracking-wide sm:text-3xl">The Shot</span>
              <span className="mono-tag text-center">
                artist photo lands here // drop public/artist.jpg
              </span>
            </span>
          )}
        </span>
      </TiltBox>
    </div>
  )
}

export function Hero() {
  return (
    <header
      id="top"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 py-20 text-center"
    >
      {/* faint blue/green atmosphere over the particle world */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(65% 50% at 50% 60%, rgba(31,158,255,0.06), transparent 65%), radial-gradient(70% 55% at 50% 30%, rgba(23,168,107,0.05), transparent 70%)',
        }}
      />

      {/* light vignette so type stays readable over the motion */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1]"
        style={{
          background:
            'radial-gradient(90% 70% at 50% 50%, transparent 32%, rgba(247,249,251,0.55) 78%, rgba(247,249,251,0.92) 100%)',
        }}
      />

      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center">
        {/* opening bar, set like a newspaper pull quote */}
        {artist.introQuote && (
          <blockquote
            className="reveal m-0 w-full max-w-2xl border-y px-2 py-5 font-serif"
            style={{
              borderColor: 'var(--line-strong)',
              fontSize: 'clamp(1.1rem, 2.3vw, 1.45rem)',
              lineHeight: 1.55,
              color: 'var(--ink)',
            }}
          >
            “{artist.introQuote}”
          </blockquote>
        )}

        <p className="mono-tag reveal mt-8" style={{ color: 'var(--signal-txt)' }}>
          {artist.sessionTag}
        </p>

        {/* the logo IS the wordmark: big, boxed, pops on hover */}
        <h1 className="reveal reveal-late m-0 mt-6 w-full max-w-[420px]">
          {artist.logo ? (
            <TiltBox max={4}>
              <span className="pop-box block p-4 sm:p-6">
                <img
                  src={artist.logo}
                  alt={artist.name}
                  className="block h-auto w-full"
                  width={1320}
                  height={1204}
                  fetchPriority="high"
                />
              </span>
            </TiltBox>
          ) : (
            <span className="font-display chrome-text block uppercase leading-[0.92]" style={{ fontSize: 'clamp(3.8rem, 15vw, 11.5rem)' }}>
              {artist.name}
            </span>
          )}
        </h1>

        <p
          className="font-serif italic reveal reveal-late mt-7"
          style={{
            fontSize: 'clamp(1.7rem, 5vw, 3.2rem)',
            lineHeight: 1.12,
            color: 'var(--ink)',
          }}
        >
          {artist.albumTitle}
        </p>

        <p
          className="reveal reveal-later mx-auto mt-4 max-w-md font-mono text-[13px] leading-relaxed tracking-[0.08em]"
          style={{ color: 'var(--dim)' }}
        >
          {artist.tagline}
        </p>

        <div className="reveal reveal-later mt-8 flex w-full flex-col items-center justify-center gap-4 sm:flex-row">
          <a className="btn btn-chrome w-full sm:w-auto" href="#listen">
            Listen Now
          </a>
          <a className="btn btn-ghost w-full sm:w-auto" href="#tracks">
            Tracklist
          </a>
        </div>

        {/* Mac Miller energy: the artist shot, huge, right under the lockup */}
        <HeroPhoto />
      </div>

      {/* scroll cue */}
      <a
        href="#listen"
        aria-label="Scroll to the listen section"
        className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2 font-mono text-[10px] tracking-[0.3em] uppercase no-underline"
        style={{ color: 'var(--faint)' }}
      >
        Scroll ↓
      </a>
    </header>
  )
}

export function MarqueeDivider() {
  const phrase = `${artist.name} ✦ ${artist.albumTitle.toUpperCase()} ✦ ${artist.releaseTag} ✦ `
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-inner font-mono text-[12px] tracking-[0.3em]" style={{ color: 'var(--faint)' }}>
        <span>{phrase.repeat(4)}</span>
        <span>{phrase.repeat(4)}</span>
      </div>
    </div>
  )
}
