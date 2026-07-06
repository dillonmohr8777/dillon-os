import { artist } from '../content/album'
import { TiltBox } from './TiltBox'

export function Hero() {
  return (
    <header
      id="top"
      className="home-hero relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 py-20 text-center"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(65% 50% at 50% 60%, rgba(31,158,255,0.06), transparent 65%), radial-gradient(70% 55% at 50% 30%, rgba(23,168,107,0.05), transparent 70%)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1]"
        style={{
          background:
            'radial-gradient(90% 70% at 50% 50%, transparent 32%, rgba(247,249,251,0.55) 78%, rgba(247,249,251,0.92) 100%)',
        }}
      />

      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center">
        <h1 className="sr-only">
          {artist.name} — {artist.albumTitle}
        </h1>

        <p className="mono-tag hero-session reveal" style={{ color: 'var(--signal-txt)' }}>
          {artist.sessionTag}
        </p>

        {/* the shot leads: first thing you see */}
        <div className="reveal reveal-late relative mt-8 w-full max-w-[440px]">
          <div aria-hidden="true" className="hero-shadow-field" />
          <TiltBox max={5}>
            <span className="pop-box sheen block">
              {artist.heroImage ? (
                <img
                  src={artist.heroImage}
                  alt={`${artist.name} portrait`}
                  className="block aspect-square w-full object-cover"
                  width={1080}
                  height={1080}
                  fetchPriority="high"
                />
              ) : (
                <span className="artist-slot artist-slot-neutral flex aspect-square w-full flex-col items-center justify-center gap-4 px-6">
                  <span className="split-lines" aria-hidden="true" />
                  <span className="font-display chrome-text-light text-4xl uppercase tracking-wide sm:text-6xl">The Shot</span>
                  <span className="mono-tag text-center">artist image placeholder</span>
                </span>
              )}
            </span>
          </TiltBox>
        </div>

        {artist.introQuoteLines.length > 0 && (
          <blockquote
            className="opening-bar reveal reveal-late m-0 mt-10 w-full border-y px-2 py-8 font-serif"
            style={{ borderColor: 'var(--line-strong)', color: 'var(--ink)' }}
          >
            {artist.introQuoteLines.map((line, i) => (
              <span
                key={i}
                className="block"
                style={{
                  fontSize: 'clamp(1.35rem, 3.4vw, 2.9rem)',
                  lineHeight: 1.2,
                  textWrap: 'balance',
                }}
              >
                {i === 0 && '"'}
                {line}
                {i === artist.introQuoteLines.length - 1 && '"'}
              </span>
            ))}
          </blockquote>
        )}

        <p
          className="font-serif italic reveal reveal-late mt-8"
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
      </div>

      <a
        href="#listen"
        aria-label="Scroll to the listen section"
        className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2 font-mono text-[10px] tracking-[0.3em] uppercase no-underline"
        style={{ color: 'var(--faint)' }}
      >
        Scroll
      </a>
    </header>
  )
}

/** Big logo near the bottom of the page: materializes like ink
 *  soaking into the paper as it scrolls into view. */
export function LogoOutro() {
  return (
    <section aria-label={`${artist.name} logo`} className="relative z-10 overflow-hidden px-5 py-28 md:py-40">
      <div className="mx-auto flex max-w-4xl flex-col items-center">
        <div className="ink-reveal reveal w-full max-w-[560px]">
          <img
            src="logo-mark.png"
            alt={artist.name}
            className="block h-auto w-full"
            width={1000}
            height={906}
            loading="lazy"
          />
        </div>
        <p className="mono-tag reveal reveal-later mt-8" style={{ color: 'var(--signal-txt)' }}>
          {artist.releaseTag}
        </p>
      </div>
    </section>
  )
}

export function MarqueeDivider() {
  const phrase = `${artist.name} / ${artist.albumTitle.toUpperCase()} / ${artist.releaseTag} / `
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-inner font-mono text-[12px] tracking-[0.3em]" style={{ color: 'var(--faint)' }}>
        <span>{phrase.repeat(4)}</span>
        <span>{phrase.repeat(4)}</span>
      </div>
    </div>
  )
}
