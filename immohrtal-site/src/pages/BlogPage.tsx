import { posts } from '../content/blog'
import { SubPage } from '../components/SubPage'
import { TiltBox } from '../components/TiltBox'

export function BlogPage() {
  return (
    <SubPage tone="dark">
      <p className="section-eyebrow reveal" data-decode="">Blog</p>
      <h1
        className="font-display chrome-text reveal mt-5 uppercase"
        style={{ fontSize: 'clamp(2.6rem, 7vw, 5.4rem)', lineHeight: 0.95 }}
      >
        Real rap, duality, and the sport
      </h1>
      <p className="reveal reveal-late mt-5 max-w-2xl text-[17px] leading-[1.8]" style={{ color: 'var(--dim)' }}>
        Field notes for fans looking for new rappers in 2026, authentic rap, lyrical rap,
        storytelling, duality, and the craft behind Dance With The Delusional. IMMOHRTAL is Dillon Mohr:
        28, chief marketing officer by day, rapper by obsession.
      </p>

      {/* the Erie Underground zine sheet */}
      <div className="reveal reveal-late mt-12 w-full max-w-xl">
        <TiltBox max={4}>
          <figure className="pop-box m-0 block p-3">
            <img
              src="blog-erie.jpg"
              alt="Erie Underground zine page: from the lake, for the world"
              className="block h-auto w-full rounded-xl"
              loading="lazy"
            />
            <figcaption className="mono-tag mt-3 pb-1 text-center">Erie Underground // Vol. 814</figcaption>
          </figure>
        </TiltBox>
      </div>

      <div className="mt-14 flex flex-col gap-8">
        {posts.map((post, i) => (
          <article key={post.slug} id={post.slug} className={`blog-card reveal ${i % 2 === 1 ? 'reveal-late' : ''}`}>
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="mono-tag" style={{ color: 'var(--signal-txt)' }}>
                  {post.date} / {post.tag}
                </p>
                <h2
                  className="font-display chrome-text mt-3 uppercase"
                  style={{ fontSize: 'clamp(2rem, 4.8vw, 3.6rem)', lineHeight: 0.98 }}
                >
                  {post.title}
                </h2>
              </div>
              <div className="blog-number font-display">{String(i + 1).padStart(2, '0')}</div>
            </div>

            <p className="blog-answer mt-6">{post.answer}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {post.targetQueries.map((query) => (
                <span key={query} className="query-chip">
                  {query}
                </span>
              ))}
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {post.sections.map((section) => (
                <section key={section.heading} className="blog-section-block">
                  <h3 className="font-display uppercase">{section.heading}</h3>
                  <div className="mt-4 flex flex-col gap-4">
                    {section.paragraphs.map((paragraph, j) => (
                      <p key={j}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {post.faqs.map((faq) => (
                <div key={faq.question} className="faq-tile">
                  <h3>{faq.question}</h3>
                  <p>{faq.answer}</p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>

      <p className="mono-tag reveal mt-10">more chapters as the record builds.</p>
    </SubPage>
  )
}
