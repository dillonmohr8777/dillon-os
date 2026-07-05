import { artist } from '../content/album'

export function Hero() {
  return (
    <header
      id="top"
      className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden px-5 text-center"
    >
      {/* faint blue atmosphere over the GL world */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(65% 50% at 50% 62%, rgba(31,158,255,0.06), transparent 65%), radial-gradient(80% 65% at 50% 40%, rgba(40,58,96,0.22), transparent 70%)',
        }}
      />

      {/* vignette so type stays readable over the particle world */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1]"
        style={{
          background:
            'radial-gradient(90% 70% at 50% 52%, transparent 30%, rgba(5,6,9,0.5) 78%, rgba(5,6,9,0.88) 100%)',
        }}
      />

      {/* the type */}
      <div className="relative z-10 max-w-5xl">
        <p className="mono-tag reveal" style={{ color: 'var(--signal-txt)' }}>
          {artist.sessionTag}
        </p>

        <h1
          className="font-display chrome-text reveal reveal-late uppercase leading-[0.92] mt-6"
          style={{
            fontSize: 'clamp(3.8rem, 15vw, 11.5rem)',
            letterSpacing: '0.01em',
          }}
        >
          {artist.name}
        </h1>

        <p
          className="font-serif italic reveal reveal-late mt-5"
          style={{
            fontSize: 'clamp(1.6rem, 4.6vw, 3.2rem)',
            lineHeight: 1.15,
            color: 'var(--ink)',
          }}
        >
          {artist.albumTitle}
        </p>

        <p
          className="reveal reveal-later mx-auto mt-7 max-w-md font-mono text-[13px] leading-relaxed tracking-[0.08em]"
          style={{ color: 'var(--dim)' }}
        >
          {artist.tagline}
        </p>

        <div className="reveal reveal-later mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a className="btn btn-chrome w-full sm:w-auto" href="#listen">
            Listen Now
          </a>
          <a className="btn btn-ghost w-full sm:w-auto" href="#tracks">
            Tracklist
          </a>
        </div>
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
