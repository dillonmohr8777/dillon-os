"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type MouseEvent,
} from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── Tilt card with cursor-tracked sheen ── */
export function TiltCard({
  children,
  className = "",
  max = 6,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rect = useRef<DOMRect | null>(null);
  const [sheen, setSheen] = useState({ x: 50, y: 50 });

  const onMove = (e: MouseEvent) => {
    const r = rect.current;
    const el = ref.current;
    if (!r || !el) return;
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${px * max}deg) rotateX(${py * -max}deg) translateY(-4px)`;
    setSheen({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    });
  };

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden transition-transform duration-200 ease-out ${className}`}
      onMouseEnter={() => {
        if (!prefersReducedMotion()) rect.current = ref.current?.getBoundingClientRect() ?? null;
      }}
      onMouseMove={onMove}
      onMouseLeave={() => {
        rect.current = null;
        if (ref.current) ref.current.style.transform = "";
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at ${sheen.x}% ${sheen.y}%, rgba(255,255,255,0.12), transparent 55%)`,
        }}
        aria-hidden
      />
      {children}
    </div>
  );
}

/* ── Magnetic button ── */
export function MagneticButton({
  children,
  className = "",
  href,
}: {
  children: ReactNode;
  className?: string;
  href?: string;
}) {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 20 });
  const sy = useSpring(y, { stiffness: 300, damping: 20 });

  const onMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.15);
    y.set((e.clientY - r.top - r.height / 2) * 0.15);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const style = { x: sx, y: sy };

  if (href) {
    return (
      <motion.a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        style={style}
        className={className}
        onMouseMove={onMove}
        onMouseLeave={reset}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type="button"
      style={style}
      className={className}
      onMouseMove={onMove}
      onMouseLeave={reset}
    >
      {children}
    </motion.button>
  );
}

/* ── Count-up numeral ── */
export function CountUp({
  value,
  suffix = "",
  decimals = 0,
  className = "",
}: {
  value: number;
  suffix?: string;
  decimals?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const [display, setDisplay] = useState(decimals > 0 ? "0.0" : "0");

  useEffect(() => {
    if (!inView || prefersReducedMotion()) {
      setDisplay(
        decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString()
      );
      return;
    }
    const duration = 1400;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = value * eased;
      setDisplay(
        decimals > 0
          ? current.toFixed(decimals)
          : Math.round(current).toLocaleString()
      );
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value, decimals]);

  return (
    <span ref={ref} className={className}>
      {display}
      {suffix}
    </span>
  );
}

/* ── Growing tick line ── */
export function TickLine({ delay = 0 }: { delay?: number }) {
  return (
    <motion.span
      className="inline-block h-px bg-gradient-to-r from-align-orange to-align-teal"
      initial={{ width: 0, opacity: 0 }}
      whileInView={{ width: 48, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay, ease: [0.17, 0.4, 0.02, 0.99] }}
    />
  );
}

/* ── Word-by-word headline reveal ── */
export function WordReveal({
  words,
  className = "",
}: {
  words: readonly string[];
  className?: string;
}) {
  return (
    <h1 className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "110%", rotateX: 12, opacity: 0, scale: 0.94 }}
            animate={{ y: 0, rotateX: 0, opacity: 1, scale: 1 }}
            transition={{
              duration: 0.75,
              delay: 0.12 + i * 0.1,
              ease: [0.17, 0.4, 0.02, 0.99],
            }}
          >
            {word}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </h1>
  );
}

/* ── Scroll reveal wrapper ── */
export function RevealPop({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28, scale: 0.94, rotateX: 8 }}
      whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.7, delay, ease: [0.17, 0.4, 0.02, 0.99] }}
    >
      {children}
    </motion.div>
  );
}

/* ── Lightbox ── */
export function Lightbox({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy/90 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="reveal-pop max-h-[90vh] max-w-2xl overflow-auto rounded-2xl border border-white/10 bg-navy-light p-6 shadow-2xl"
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ ease: [0.17, 0.4, 0.02, 0.99] }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Chrome numeral styling helper ── */
export function ChromeNumeral({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`chrome-numeral font-display ${className}`}>{children}</span>
  );
}
