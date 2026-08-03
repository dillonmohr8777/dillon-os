import { Fragment, useEffect, useRef, type CSSProperties } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { auditUrl } from '../shared/content';
import { Magnetic } from './Magnetic';
import { Reveal, RevealWords } from './Reveal';

const macBio = [
  'Mac Frederick is Founder and Managing Partner of Need Momentum. He began his career at Google, where he worked with small and midsize businesses, then founded Momentum Digital in Philadelphia in 2015.',
  'He built the agency to help small-business owners grow online with expertise that is accessible, transparent and practical. Mac now leads strategy and growth across Need Momentum\'s connected digital services.'
];

const seanBio = [
  'Sean Boyle is Managing Partner of Need Momentum and Co-Founder and Managing Partner of Momentum 360. A Penn State marketing graduate, he joined Momentum in 2017 as a sales intern and grew through sales leadership into partner, COO and owner.',
  'He focuses on operations, management, marketing, networking and entrepreneurship. Sean also runs Momentum 360\'s property-marketing division, bringing together content, photography and virtual tours.'
];

function ParticleParagraph({ children, offset }: { children: string; offset: number }) {
  const words = children.split(' ');
  return (
    <p>
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <span
            className="founder-bio__word"
            style={{ '--word-index': index + offset } as CSSProperties}
          >
            {word}
          </span>
          {index < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </p>
  );
}

export function Founders() {
  const bios = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = bios.current;
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    node.classList.add('is-particle-pending');
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      node.classList.add('is-particle-resolved');
      observer.disconnect();
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="founders founders--profiles surface-panel" id="founders">
      <div className="section-heading founders__heading">
        <RevealWords as="h2" text="Built by people who know small business." />
        <Reveal as="p" delay={1}>
          Mac Frederick and Sean Boyle have grown Momentum from a Philadelphia agency into one connected team for digital growth, operations and property marketing.
        </Reveal>
      </div>

      <div className="founder-bios" ref={bios}>
        <article className="founder-profile founder-profile--mac">
          <div className="founder__frame">
            <img
              className="founder__photo founder__photo--mac-v2"
              src="/assets/founders/mac-frederick-workshop-2026.webp"
              alt="Mac Frederick, the blond founder and managing partner of Need Momentum"
              width={1122}
              height={1402}
              loading="lazy"
              decoding="async"
            />
            <span className="founder__frame-sheen" aria-hidden="true" />
          </div>
          <div className="founder-profile__content">
            <div className="founder-profile__identity">
              <span className="founder__signal" aria-hidden="true" />
              <div>
                <h3>Mac Frederick</h3>
                <p>Founder &amp; Managing Partner</p>
              </div>
            </div>
            <div className="founder-profile__bio">
              <ParticleParagraph offset={0}>{macBio[0]}</ParticleParagraph>
              <ParticleParagraph offset={18}>{macBio[1]}</ParticleParagraph>
            </div>
          </div>
        </article>

        <article className="founder-profile founder-profile--sean">
          <div className="founder__frame">
            <img
              className="founder__photo"
              src="/assets/founders/sean-boyle-founder.webp"
              alt="Sean Boyle, the dark-haired managing partner of Need Momentum and co-founder of Momentum 360"
              width={1122}
              height={1402}
              loading="lazy"
              decoding="async"
            />
            <span className="founder__frame-sheen" aria-hidden="true" />
          </div>
          <div className="founder-profile__content">
            <div className="founder-profile__identity">
              <span className="founder__signal" aria-hidden="true" />
              <div>
                <h3>Sean Boyle</h3>
                <p>Managing Partner · Momentum 360 Co-Founder</p>
              </div>
            </div>
            <div className="founder-profile__bio">
              <ParticleParagraph offset={0}>{seanBio[0]}</ParticleParagraph>
              <ParticleParagraph offset={18}>{seanBio[1]}</ParticleParagraph>
            </div>
          </div>
        </article>
      </div>

      <Magnetic className="magnetic--founder" strength={8}>
        <a className="founder-cta" href={auditUrl}>Bring us your next challenge <ArrowUpRight /></a>
      </Magnetic>
    </section>
  );
}
