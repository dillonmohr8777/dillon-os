import { useEffect, useState } from 'react'
import { artist } from '../content/album'

/**
 * Shared nav. On the home page section links smooth-scroll to
 * anchors; on subpages they navigate back to the home page sections.
 */
export function Nav({ home = true }: { home?: boolean }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const anchor = (hash: string) => (home ? hash : `./index.html${hash}`)
  const links: Array<[string, string]> = [
    [anchor('#listen'), 'Listen'],
    [anchor('#tracks'), 'Tracks'],
    ['./about.html', 'About'],
    ['./blog.html', 'Blog'],
    ['./contact.html', 'Contact'],
  ]

  return (
    <nav
      aria-label="Main"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass-panel border-x-0 border-t-0' : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <a
          href={home ? '#top' : './index.html'}
          className="flex items-center no-underline"
          aria-label={`${artist.name} - home`}
        >
          {artist.logo ? (
            <img src={artist.logo} alt="" className="h-11 w-auto" width={1000} height={906} />
          ) : (
            <span className="font-display chrome-text text-xl tracking-wide uppercase">{artist.name}</span>
          )}
        </a>
        <div className="hidden items-center gap-7 md:flex">
          {links.map(([href, label]) => (
            <a
              key={label}
              href={href}
              className="font-mono text-[11px] uppercase tracking-[0.22em] no-underline transition-colors hover:text-[#141922]"
              style={{ color: 'var(--dim)' }}
            >
              {label}
            </a>
          ))}
        </div>
        <a href={anchor('#listen')} className="btn btn-chrome !min-h-[40px] !px-5 !text-[11px]">
          Listen
        </a>
      </div>
    </nav>
  )
}
