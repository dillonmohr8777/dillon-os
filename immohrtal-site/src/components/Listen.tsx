import { artist, platforms, type Platform } from '../content/album'
import { AppleMusicIcon, PresaveIcon, SoundCloudIcon, SpotifyIcon, YouTubeIcon } from './icons'

const platformIcons: Record<Platform['id'], () => React.ReactNode> = {
  spotify: SpotifyIcon,
  apple: AppleMusicIcon,
  youtube: YouTubeIcon,
  soundcloud: SoundCloudIcon,
  presave: PresaveIcon,
}

/** Generated placeholder cover — swap by setting `artist.coverArt`. */
function CoverPlaceholder() {
  return (
    <div
      className="cover-tilt relative aspect-square w-full overflow-hidden rounded-2xl border"
      style={{
        borderColor: 'var(--line-strong)',
        background:
          'radial-gradient(75% 65% at 30% 22%, rgba(70,90,130,0.55), transparent 60%), radial-gradient(70% 60% at 75% 85%, rgba(31,158,255,0.24), transparent 62%), linear-gradient(160deg, #0d1220, #05070c)',
        boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
      }}
    >
      {/* orbit line across the cover */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full border"
        style={{ borderColor: 'rgba(190,206,232,0.18)', transform: 'translate(-50%,-50%) rotate(-24deg) scaleY(0.42)' }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <span className="font-display chrome-text-light uppercase leading-none" style={{ fontSize: 'clamp(2.6rem, 7vw, 4.2rem)' }}>
          {artist.name}
        </span>
        <span className="font-serif italic mt-3" style={{ fontSize: 'clamp(1.1rem, 2.6vw, 1.6rem)', color: '#eef1f7' }}>
          {artist.albumTitle}
        </span>
      </div>
      <span
        className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-[9px] tracking-[0.3em] uppercase"
        style={{ color: 'rgba(226,233,245,0.7)' }}
      >
        Final art pending
      </span>
    </div>
  )
}

export function Listen() {
  return (
    <section id="listen" aria-labelledby="listen-heading" className="relative z-10 mx-auto max-w-6xl px-5 py-24 md:py-36">
      <p className="section-eyebrow reveal" data-decode="">01 / Listen</p>
      <h2 id="listen-heading" className="font-display chrome-text reveal mt-5 uppercase" style={{ fontSize: 'clamp(2.4rem, 6vw, 4.5rem)', lineHeight: 1 }}>
        Play it everywhere
      </h2>
      <p className="reveal reveal-late mt-5 max-w-xl" style={{ color: 'var(--dim)' }}>
        One album, every platform. Pre save it now and it lands in your library the second it drops.
      </p>

      <div className="mt-14 grid items-start gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-16">
        <div className="reveal mx-auto w-full max-w-md">
          {artist.coverArt ? (
            <img
              src={artist.coverArt}
              alt={`${artist.name} — ${artist.albumTitle} album cover`}
              className="cover-tilt aspect-square w-full rounded-2xl object-cover"
              width={640}
              height={640}
              loading="lazy"
            />
          ) : (
            <CoverPlaceholder />
          )}
        </div>

        <ul className="reveal reveal-late m-0 flex list-none flex-col gap-3 p-0">
          {platforms.map((p) => {
            const Icon = platformIcons[p.id]
            const inner = (
              <>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border" style={{ borderColor: 'var(--line-strong)' }}>
                  <Icon />
                </span>
                <span className="flex-1 font-body text-[17px] font-medium">{p.label}</span>
                <span className="font-mono text-[10px] tracking-[0.26em] uppercase" style={{ color: p.href ? 'var(--green-txt)' : 'var(--faint)' }}>
                  {p.href ? 'Open →' : 'Soon'}
                </span>
              </>
            )
            return (
              <li key={p.id}>
                {p.href ? (
                  <a className="platform-pill" href={p.href} target="_blank" rel="noopener noreferrer">
                    {inner}
                  </a>
                ) : (
                  <div className="platform-pill is-dead" aria-label={`${p.label} — link coming soon`}>
                    {inner}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
