import { posts } from '../content/blog'
import { SubPage } from '../components/SubPage'

export function BlogPage() {
  return (
    <SubPage>
      <p className="section-eyebrow reveal" data-decode="">Blog</p>
      <h1 className="font-display chrome-text reveal mt-5 uppercase" style={{ fontSize: 'clamp(2.6rem, 7vw, 5rem)', lineHeight: 1 }}>
        Field notes
      </h1>
      <p className="reveal reveal-late mt-5 max-w-xl" style={{ color: 'var(--dim)' }}>
        The life behind the record, written while it happens. New entries land as the album comes together.
      </p>

      <div className="mt-14 flex flex-col gap-10">
        {posts.map((post, i) => (
          <article key={post.slug} id={post.slug} className={`glass-panel reveal ${i % 2 === 1 ? 'reveal-late' : ''} rounded-2xl p-7 md:p-10`}>
            <p className="mono-tag" style={{ color: 'var(--signal-txt)' }}>
              {post.date} · {post.tag}
            </p>
            <h2 className="font-display chrome-text mt-3 uppercase" style={{ fontSize: 'clamp(1.9rem, 4.5vw, 3rem)', lineHeight: 1.05 }}>
              {post.title}
            </h2>
            <div className="mt-6 flex flex-col gap-5">
              {post.paragraphs.map((p, j) => (
                <p key={j} className="m-0 max-w-2xl text-[16.5px] leading-[1.8]" style={{ color: 'var(--dim)' }}>
                  {p}
                </p>
              ))}
            </div>
          </article>
        ))}
      </div>

      <p className="mono-tag reveal mt-10">more entries coming. edit or add posts in src/content/blog.ts</p>
    </SubPage>
  )
}
