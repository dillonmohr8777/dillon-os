import { artist, contact, socials } from '../content/album'
import { InstagramIcon, TikTokIcon, XIcon, YouTubeIcon } from './icons'

const socialIcons: Record<string, () => React.ReactNode> = {
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
  x: XIcon,
  youtube: YouTubeIcon,
}

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-heading" className="relative z-10 mx-auto max-w-4xl px-5 py-24 md:py-36 text-center">
      <p className="section-eyebrow reveal justify-center" data-decode="">05 / Contact</p>
      <h2 id="contact-heading" className="font-display chrome-text reveal mt-5 uppercase" style={{ fontSize: 'clamp(2.4rem, 6.5vw, 5rem)', lineHeight: 1 }}>
        Book the delusion
      </h2>
      <p className="reveal reveal-late mx-auto mt-5 max-w-md" style={{ color: 'var(--dim)' }}>
        Shows, features, press. One inbox. Answered after dark.
      </p>

      <div className="reveal reveal-late mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <a className="btn btn-chrome" href={`mailto:${contact.bookingEmail}`}>
          {contact.bookingEmail}
        </a>
        <a className="btn btn-ghost" href={contact.phoneHref}>
          {contact.phone}
        </a>
      </div>

      <ul className="reveal reveal-later m-0 mt-14 flex list-none flex-wrap items-center justify-center gap-3 p-0">
        {socials.map((s) => {
          const Icon = socialIcons[s.id]
          const inner = (
            <>
              <Icon />
              <span className="font-mono text-[11px] tracking-[0.18em]">{s.handle}</span>
            </>
          )
          return (
            <li key={s.id}>
              {s.href ? (
                <a
                  className="platform-pill !gap-3 !rounded-full !px-5 !py-3 no-underline"
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${artist.name} on ${s.label}`}
                >
                  {inner}
                </a>
              ) : (
                <span
                  className="platform-pill is-dead !gap-3 !rounded-full !px-5 !py-3"
                  aria-label={`${s.label} ${s.handle} — link coming soon`}
                  style={{ color: 'var(--dim)' }}
                >
                  {inner}
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="relative z-10 border-t px-5 py-10" style={{ borderColor: 'var(--line)' }}>
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <span className="font-display chrome-text text-lg uppercase tracking-wide">{artist.name}</span>
        <nav aria-label="Footer" className="flex items-center gap-5">
          {[
            ['./index.html', 'Home'],
            ['./about.html', 'About'],
            ['./blog.html', 'Blog'],
            ['./contact.html', 'Contact'],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="font-mono text-[11px] uppercase tracking-[0.2em] no-underline transition-colors hover:text-[#141922]"
              style={{ color: 'var(--faint)' }}
            >
              {label}
            </a>
          ))}
        </nav>
        <span className="font-mono text-[11px] tracking-[0.2em] uppercase" style={{ color: 'var(--faint)' }}>
          © {new Date().getFullYear()} {artist.name} · recorded after hours
        </span>
      </div>
    </footer>
  )
}
