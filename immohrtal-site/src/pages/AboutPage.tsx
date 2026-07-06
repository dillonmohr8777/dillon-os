import { artist, markings, story } from '../content/album'
import { SubPage } from '../components/SubPage'

export function AboutPage() {
  return (
    <SubPage>
      <p className="section-eyebrow reveal" data-decode="">About</p>
      <h1 className="font-display chrome-text reveal mt-5 uppercase" style={{ fontSize: 'clamp(2.6rem, 7vw, 5rem)', lineHeight: 1 }}>
        {artist.name}
      </h1>
      <p className="font-serif italic reveal reveal-late mt-4" style={{ fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', color: 'var(--ink)' }}>
        {artist.albumTitle}
      </p>

      <blockquote
        className="font-serif italic reveal reveal-late mt-10 border-l-2 pl-6"
        style={{ fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', lineHeight: 1.35, borderColor: 'var(--signal)', color: 'var(--ink)', margin: '2.5rem 0 0' }}
      >
        “{story.pullQuote}”
      </blockquote>

      <div className="mt-10 flex flex-col gap-6">
        {story.paragraphs.map((p, i) => (
          <p key={i} className={`reveal ${i > 0 ? 'reveal-late' : ''} m-0 max-w-2xl text-[16.5px] leading-[1.8]`} style={{ color: 'var(--dim)' }}>
            {p}
          </p>
        ))}
        <p className="reveal reveal-late m-0 max-w-2xl text-[16.5px] leading-[1.8]" style={{ color: 'var(--dim)' }}>
          He spent a decade telling other people’s stories and making other people’s things sound like movements. This record is the first time he gave his own story the same treatment. Written late, kept honest, and released with no permission asked.
        </p>
      </div>

      <p className="mono-tag reveal mt-14">The three markings</p>
      <ol className="m-0 mt-5 grid list-none gap-4 p-0 sm:grid-cols-3">
        {markings.map((m, i) => (
          <li key={m.numeral} className={`glass-panel reveal ${i === 1 ? 'reveal-late' : i === 2 ? 'reveal-later' : ''} rounded-2xl p-6`}>
            <span className="font-display chrome-text block text-4xl" aria-hidden="true">{m.numeral}</span>
            <span className="mt-3 block font-body text-[16px] font-medium">{m.label}</span>
            <span className="mono-tag mt-1 block" style={{ color: 'var(--signal-txt)' }}>{m.coord}</span>
            <span className="mt-3 block text-[14px] leading-relaxed" style={{ color: 'var(--dim)' }}>{m.line}</span>
          </li>
        ))}
      </ol>

      <div className="reveal reveal-later mt-14 flex flex-col gap-4 sm:flex-row">
        <a className="btn btn-chrome" href="./index.html#listen">Hear the album</a>
        <a className="btn btn-ghost" href="./blog.html">Read the blog</a>
      </div>
    </SubPage>
  )
}
