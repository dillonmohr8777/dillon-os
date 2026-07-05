import { artist } from '../content/album'

export function Hero() {
  return (
    <header
      id="top"
      className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden px-5 py-20 text-center"
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
        <p className="mono-tag reveal" style={{ color: 'var(--signal-txt)' }}>
          {artist.sessionTag}
        </p>

        {/* the logo IS the wordmark: big, boxed, pops on hover */}
        <h1 className="reveal reveal-late m-0 mt-6 w-full max-w-[420px]">
          {artist.logo ? (
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

        {/* Mac Miller energy: the artist shot, huge, right under the lockup.
            Set artist.heroImage in src/content/album.ts when the photo lands. */}
        {artist.heroImage && (
          <div className="reveal reveal-later mt-14 w-full max-w-3xl">
            <span className="pop-box block">
              <img
                src={artist.heroImage}
                alt={`${artist.name} portrait`}
                className="block h-auto w-full"
                loading="lazy"
              />
            </span>
          </div>
        )}
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
