import { markings, pittsburghLegacy, story } from '../content/album'

export function Story() {
  return (
    <section id="story" aria-labelledby="story-heading" className="story-section relative z-10 overflow-hidden py-24 md:py-36">
      {/* soft blue/green pressure glow behind the statement */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(60% 55% at 78% 30%, rgba(31,158,255,0.07), transparent 65%), radial-gradient(55% 50% at 15% 75%, rgba(23,168,107,0.06), transparent 65%)',
        }}
      />
      <div className="mx-auto max-w-4xl px-5">
        <p className="section-eyebrow reveal" data-decode="">03 / The Story</p>
        <h2 id="story-heading" className="font-display chrome-text reveal mt-5 uppercase" style={{ fontSize: 'clamp(2.4rem, 6vw, 4.5rem)', lineHeight: 1 }}>
          {story.heading}
        </h2>

        <blockquote
          className="font-serif italic reveal reveal-late mt-12 border-l-2 pl-6 md:pl-10"
          style={{
            fontSize: 'clamp(1.5rem, 3.6vw, 2.4rem)',
            lineHeight: 1.3,
            borderColor: 'var(--signal)',
            color: 'var(--ink)',
            margin: '3rem 0 0',
          }}
        >
          "{story.pullQuote}"
        </blockquote>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {story.paragraphs.map((p, i) => (
            <p
              key={i}
              className={`reveal ${i === 1 ? 'reveal-late' : i === 2 ? 'reveal-later' : ''} m-0 text-[16.5px] leading-[1.8] ${i === 2 ? 'md:col-span-2 md:max-w-2xl' : ''}`}
              style={{ color: 'var(--dim)' }}
            >
              {p}
            </p>
          ))}
        </div>

        <p className="mono-tag reveal mt-16">Pittsburgh signal</p>
        <div className="legacy-strip reveal reveal-late mt-5 grid gap-3 sm:grid-cols-4">
          {pittsburghLegacy.map((item) => (
            <div key={item.label} className="legacy-card compact">
              <span className="legacy-label">{item.label}</span>
              <p>{item.line}</p>
            </div>
          ))}
        </div>

        {/* the three markings */}
        <p className="mono-tag reveal mt-16">The three markings</p>
        <ol className="m-0 mt-5 grid list-none gap-4 p-0 sm:grid-cols-3">
          {markings.map((m, i) => (
            <li
              key={m.numeral}
              className={`marking-card glass-panel reveal ${i === 1 ? 'reveal-late' : i === 2 ? 'reveal-later' : ''} rounded-2xl p-6`}
            >
              <span className="font-display chrome-text block text-4xl" aria-hidden="true">
                {m.numeral}
              </span>
              <span className="mt-3 block font-body text-[16px] font-medium">{m.label}</span>
              <span className="mono-tag mt-1 block" style={{ color: 'var(--signal-txt)' }}>
                {m.coord}
              </span>
              <span className="mt-3 block text-[14px] leading-relaxed" style={{ color: 'var(--dim)' }}>
                {m.line}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
