import { useEffect, useState } from 'react'
import { artist } from '../content/album'

const links = [
  { href: '#listen', label: 'Listen' },
  { href: '#tracks', label: 'Tracks' },
  { href: '#story', label: 'Story' },
  { href: '#visuals', label: 'Visuals' },
  { href: '#contact', label: 'Contact' },
]

export function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      aria-label="Main"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass-panel border-x-0 border-t-0' : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <a href="#top" className="flex items-center no-underline" aria-label={`${artist.name} — back to top`}>
          {artist.logo ? (
            <img src={artist.logo} alt="" className="h-11 w-auto" width={1320} height={1204} />
          ) : (
            <span className="font-display chrome-text text-xl tracking-wide uppercase">{artist.name}</span>
          )}
        </a>
        <div className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-mono text-[11px] uppercase tracking-[0.22em] no-underline transition-colors hover:text-[#141922]"
              style={{ color: 'var(--dim)' }}
            >
              {l.label}
            </a>
          ))}
        </div>
        <a href="#listen" className="btn btn-chrome !min-h-[40px] !px-5 !text-[11px]">
          Listen
        </a>
      </div>
    </nav>
  )
}
