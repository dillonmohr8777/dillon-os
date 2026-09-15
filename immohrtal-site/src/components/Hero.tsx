import { useEffect, useRef, useState } from 'react'
import { artist } from '../content/album'
import { prefersReducedMotion } from '../hooks/useReveal'

const HERO_VIDEO = '/video/dance-with-the-delusional-hero.mp4'
const HERO_POSTER = '/video/dance-with-the-delusional-hero-poster.jpg'

function VideoOpening() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [reducedMotion] = useState(() => prefersReducedMotion())

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (reducedMotion) {
      video.pause()
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
          void video.play().catch(() => undefined)
          return
        }

        video.pause()
        video.muted = true
        setMuted(true)
      },
      { threshold: [0, 0.25] },
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [reducedMotion])

  const toggleSound = async () => {
    const video = videoRef.current
    if (!video) return

    if (!playing || video.paused) {
      video.muted = false
      setMuted(false)
      try {
        await video.play()
      } catch {
        video.muted = true
        setMuted(true)
      }
      return
    }

    video.muted = !video.muted
    setMuted(video.muted)
  }

  const controlLabel = !playing
    ? 'Play video with sound'
    : muted
      ? 'Turn sound on'
      : 'Mute video'

  return (
    <section className="hero-video-stage" aria-label="Dance With The Delusional video">
      <div className="hero-video-frame">
        <video
          ref={videoRef}
          className="hero-video-media"
          src={HERO_VIDEO}
          poster={HERO_POSTER}
          aria-label={`${artist.name}, Dance With The Delusional visual`}
          autoPlay={!reducedMotion}
          muted={muted}
          loop
          playsInline
          preload="auto"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
      </div>

      <div className="hero-video-meta">
        <p className="hero-video-kicker font-mono">
          Dance With The Delusional <span aria-hidden="true">//</span> 15 second transmission
        </p>
        <button type="button" className="hero-sound-control" onClick={toggleSound} aria-label={controlLabel}>
          <span aria-hidden="true" className={`hero-sound-indicator${muted ? '' : ' is-live'}`} />
          {controlLabel}
        </button>
      </div>

      <a href="#hero-story" className="hero-video-scroll font-mono">
        Enter the album
      </a>
    </section>
  )
}

function AnimatedQuoteLine({
  line,
  lineIndex,
  isFirst,
  isLast,
}: {
  line: string
  lineIndex: number
  isFirst: boolean
  isLast: boolean
}) {
  return (
    <span
      className="opening-line block"
      style={{
        fontSize: 'clamp(1.35rem, 3.4vw, 2.9rem)',
        lineHeight: 1.2,
        textWrap: 'balance',
      }}
    >
      {isFirst && <span className="opening-quote-mark">"</span>}
      {line.split(' ').map((word, wordIndex) => {
        const delay = lineIndex * 420 + wordIndex * 95
        return (
          <span key={`${lineIndex}-${wordIndex}-${word}`} className="ink-word" style={{ animationDelay: `${delay}ms, ${delay + 160}ms` }}>
            {word}
            {wordIndex < line.split(' ').length - 1 ? ' ' : ''}
          </span>
        )
      })}
      {isLast && <span className="opening-quote-mark">"</span>}
    </span>
  )
}

export function Hero() {
  return (
    <header id="top" className="home-hero relative overflow-hidden text-center">
      <VideoOpening />

      <div id="hero-story" className="hero-copy relative z-10 flex w-full flex-col items-center px-5">
        <h1 className="sr-only">
          {artist.name}, {artist.albumTitle}
        </h1>

        <p className="mono-tag hero-session reveal" style={{ color: 'var(--signal-txt)' }}>
          {artist.sessionTag}
        </p>

        {artist.introQuoteLines.length > 0 && (
          <blockquote
            className="opening-bar reveal reveal-late m-0 mt-8 w-full max-w-5xl border-y px-2 py-8 font-serif"
            style={{ borderColor: 'var(--line-strong)', color: 'var(--ink)' }}
          >
            {artist.introQuoteLines.map((line, i) => (
              <AnimatedQuoteLine
                key={line}
                line={line}
                lineIndex={i}
                isFirst={i === 0}
                isLast={i === artist.introQuoteLines.length - 1}
              />
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
  const phrase =
    artist.marqueeBars.length > 0
      ? artist.marqueeBars.map((b) => b.toUpperCase()).join(' / ') + ' / '
      : `${artist.name} / ${artist.albumTitle.toUpperCase()} / ${artist.releaseTag} / `
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-inner font-mono text-[12px] tracking-[0.3em]" style={{ color: 'var(--faint)' }}>
        <span>{phrase.repeat(4)}</span>
        <span>{phrase.repeat(4)}</span>
      </div>
    </div>
  )
}
