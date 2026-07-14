import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock3 } from "lucide-react";
import { notFound } from "next/navigation";
import { CTABand } from "@/components/CTABand";
import { Reveal } from "@/components/Reveal";
import { blogPosts, getBlogPost } from "@/lib/blog";
import { business } from "@/lib/site";
import { absoluteUrl, createPageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  const metadata = createPageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
  });
  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.modifiedAt,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const postUrl = absoluteUrl(`/blog/${post.slug}/`);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${postUrl}#article`,
        headline: post.title,
        description: post.excerpt,
        image: absoluteUrl(post.image),
        datePublished: post.publishedAt,
        dateModified: post.modifiedAt,
        mainEntityOfPage: postUrl,
        author: {
          "@type": "Organization",
          name: business.name,
          url: absoluteUrl("/"),
        },
        publisher: {
          "@type": "Organization",
          name: business.name,
          logo: {
            "@type": "ImageObject",
            url: absoluteUrl("/img/logo.png"),
          },
        },
        articleSection: post.category,
        inLanguage: "en-US",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: absoluteUrl("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "HVAC Advice",
            item: absoluteUrl("/blog/"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.title,
            item: postUrl,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <article className="container-px pb-16 pt-36 sm:pt-44">
        <Reveal>
          <Link href="/blog" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> All Advice
          </Link>
          <div className="grid gap-10 lg:grid-cols-[1fr,0.9fr] lg:items-center">
            <div>
              <span className="eyebrow mb-5">{post.category}</span>
              <h1 className="heading text-4xl leading-[1.02] text-white sm:text-5xl lg:text-6xl">{post.title}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">{post.excerpt}</p>
              <p className="mt-5 flex items-center gap-2 text-sm text-slate-500"><Clock3 className="h-4 w-4" /> {post.readTime}</p>
            </div>
            <figure className="liquid-frame overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.image} alt={post.imageAlt} className="aspect-[4/3] w-full object-cover" />
            </figure>
          </div>
        </Reveal>

        <div className="mx-auto mt-16 max-w-3xl">
          <Reveal><p className="text-xl leading-relaxed text-slate-200">{post.intro}</p></Reveal>
          {post.sections.map((section, index) => (
            <Reveal key={section.heading} delay={0.04 * index} className="mt-12">
              <section className="glass-copy p-7 sm:p-9">
                <h2 className="heading text-2xl text-white sm:text-3xl">{section.heading}</h2>
                <div className="mt-5 space-y-4 text-base leading-relaxed text-slate-300">
                  {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </section>
            </Reveal>
          ))}
        </div>
      </article>
      <CTABand />
    </>
  );
}
