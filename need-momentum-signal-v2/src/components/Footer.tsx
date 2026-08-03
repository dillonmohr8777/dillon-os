import { ArrowUpRight } from 'lucide-react';
import { auditUrl } from '../shared/content';
import { pulseSignal } from '../shared/signalBus';
import { LazySignalScene } from './LazyScene';
import { Magnetic } from './Magnetic';
import { RevealWords } from './Reveal';

export function FinalCta() {
  return (
    <section className="final-cta surface-deep">
      <div className="final-cta__glow" aria-hidden="true" />
      <div className="final-cta__copy">
        <RevealWords as="h2" text="Build momentum around your business." />
        <p>Start with a free audit and find the move that can create momentum now.</p>
      </div>
      <Magnetic className="magnetic--final" strength={10}>
        <a href={auditUrl} onPointerEnter={pulseSignal}>Request a free audit <ArrowUpRight /></a>
      </Magnetic>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="footer footer--particle">
      <div className="footer-horizon" aria-hidden="true" />
      <div className="footer-particle-stage" aria-hidden="true">
        <LazySignalScene variant="wordmark" />
        <div className="footer-atom-field"><span /><span /><span /></div>
      </div>
      <p>Strategy, local presence and spatial media in one connected company.</p>
      <nav className="footer__links" aria-label="Footer">
        <a href="https://www.needmomentum.com/privacy-policy/">Privacy</a>
        <a href="https://www.needmomentum.com/contact-us/">Contact</a>
      </nav>
      <small>© 2026 Momentum Digital LLC.</small>
    </footer>
  );
}
