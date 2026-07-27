/* Align HCM · Industry Solutions. One film, all four industries.
 *
 * Copy follows the voice on the industry hub and its four industry pages: a
 * concrete operational claim, the consequence when the pieces are disconnected,
 * then what Align actually connects. Nothing invented.
 *
 * Two set pieces carry the idea:
 *   the filmstrip, which gives every industry the frame to itself for a beat
 *   the orbit, where client marks ride a ring around the Align mark
 */

const TITLE = 'Align HCM · Industry Solutions';
const FOOTER = '· Industry Solutions ·';

/* One image per industry, from the nine hero illustrations on the hub. Public
 * sector has no page of its own, so it borrows the support hero: a dispatch desk
 * and a headset, the closest thing on the site to the work those teams do. */
const INDUSTRIES = [
  ['healthcare', 'Healthcare', 'Coverage protects care.'],
  ['public', 'Public Sector', 'Water runs, roads stay clear, and calls get answered.'],
  ['retail', 'Retail &amp; Hospitality', 'Staffing shapes the customer experience.'],
  ['services', 'Services &amp; Distribution', 'Every handoff affects delivery and trust.'],
  ['manufacturing', 'Manufacturing', 'Every assignment affects output, safety, and margin.'],
];

const CEL_W = 620, CEL_GAP = 44, CEL_STEP = CEL_W + CEL_GAP;   /* must match .cel in style.css */
const ORBIT_R = 352;

/* ---------------------------------------------------------------- lightning */

/* The orbit spokes are discharges, not wires. Every offset below comes out of
   this hash rather than Math.random, because the exporter seeks to arbitrary
   frames and has to get the identical bolt back every time it lands on one. */
const BOLT_KNOTS = 10;
/* A bolt drawn from the centre spends most of its travel behind the hub disc,
   so it starts at the rim instead. The whole ring is sized around leaving this
   corridor open: hub r 152 to chip edge r 277 is 125px of clear paper for the
   discharge to be seen in, which is why the hub shrank and the radius grew. */
const BOLT_R0 = 158;

function jit(n) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/* Shape is quantised to BOLT_HZ redraws a second. A bolt that eases between
   shapes reads as a wiggling rope; one that snaps to a new shape every couple
   of frames reads as electricity. */
const BOLT_HZ = 15;

function boltGeom(cx, cy, i, step) {
  const len = Math.hypot(cx, cy);
  const ux = cx / len, uy = cy / len;     /* along the spoke */
  const px = -uy, py = ux;                /* across it */
  const span = len - BOLT_R0;
  /* f runs 0 at the hub rim to 1 at the mark */
  const at = (f, j) => [ux * (BOLT_R0 + span * f) + px * j, uy * (BOLT_R0 + span * f) + py * j];
  const amp = span * 0.14;

  const knots = [];
  let d = `M${(ux * BOLT_R0).toFixed(1)} ${(uy * BOLT_R0).toFixed(1)}`;
  for (let k = 1; k < BOLT_KNOTS; k++) {
    const f = k / BOLT_KNOTS;
    /* the bell pins both ends, so the bolt always leaves the hub and lands on
       the mark dead centre however hard the middle is thrown around */
    const j = (jit(i * 7.3 + k * 13.7 + step * 3.1) - 0.5) * 2 * amp * Math.sin(f * Math.PI);
    const p = at(f + (jit(i * 5.1 + k * 2.3 + step * 1.7) - 0.5) * 0.05, j);
    knots.push(p);
    d += ` L${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  }
  d += ` L${cx.toFixed(1)} ${cy.toFixed(1)}`;

  /* one dead end branch. It is the single cheapest thing that separates a
     lightning bolt from a jagged line. */
  const bk = 3 + Math.floor(jit(i * 3.7 + step * 5.9) * 4);
  const [ax, ay] = knots[Math.min(bk, knots.length - 1)];
  const side = jit(i * 11.3 + step * 2.7) < 0.5 ? -1 : 1;
  const fl = 30 + jit(i * 9.1 + step * 4.3) * 30;
  const fork = `M${ax.toFixed(1)} ${ay.toFixed(1)}`
    + ` L${(ax + (ux * 0.34 + px * side * 0.62) * fl).toFixed(1)} ${(ay + (uy * 0.34 + py * side * 0.62) * fl).toFixed(1)}`
    + ` L${(ax + (ux * 0.72 + px * side * 0.98) * fl).toFixed(1)} ${(ay + (uy * 0.72 + py * side * 0.98) * fl).toFixed(1)}`;

  return { d, fork, forkAt: (bk + 1) / BOLT_KNOTS };
}

const SCENES = [

  /* 0. the ink reveal ---------------------------------------------------- */
  /* The lockup is masked by a rectangle sweeping left to right. That rectangle
     is displaced by fractal noise and blurred, so its leading edge behaves like
     ink spreading into paper rather than a hard wipe. The filter is on the mask,
     never on the artwork, so the logo itself stays perfectly sharp. */
  {
    id: 's0', in: 0.0, out: 6.2,
    html: `
      <div class="center inkstage">
        <div class="inkwrap">
          <svg class="inklockup" viewBox="-30 -30 750 310">
            <defs>
              <filter id="inkbleed" x="-35%" y="-55%" width="170%" height="210%">
                <feTurbulence type="fractalNoise" baseFrequency="0.008 0.015"
                  numOctaves="4" seed="9" result="n"/>
                <feDisplacementMap in="SourceGraphic" in2="n" scale="58"
                  xChannelSelector="R" yChannelSelector="G" result="d"/>
                <feGaussianBlur in="d" stdDeviation="5"/>
              </filter>
              <mask id="inkmask" maskUnits="userSpaceOnUse" x="-90" y="-90" width="900" height="440">
                <rect data-front x="-90" y="-90" width="0" height="440" fill="#fff" filter="url(#inkbleed)"/>
              </mask>
            </defs>
            <g mask="url(#inkmask)">${lockupSVG('link', 690).replace(/^\s*<svg[^>]*>|<\/svg>\s*$/g, '')}</g>
          </svg>
          <div class="inkcap" data-cap>Human Capital Management</div>
          <div class="inkbloom" data-bloom></div>
        </div>
        <p class="body inkline" data-line>None of this <span class="hi">happens by accident</span>.</p>
      </div>`,
    draw(root, lt, dur) {
      /* the lockup's own wipe animations are not wanted here; the ink front is
         the reveal, so the clip rects are opened all the way up front */
      drawLockup(root, 'link', 1);

      const front = q(root, '[data-front]');
      const p = E.easeInOutQuart(seg(lt, 0.25, 2.5));
      front.setAttribute('width', (p * 900).toFixed(1));

      /* a warm bloom rides just behind the leading edge */
      const bloom = q(root, '[data-bloom]');
      bloom.style.opacity = (pulse(lt, 0.3, 0.8, 2.1, 2.9) * 0.9).toFixed(3);
      bloom.style.transform = `translate3d(${(-420 + p * 900).toFixed(0)}px,0,0)`;

      const cap = q(root, '[data-cap]');
      const cp = E.easeOutCubic(seg(lt, 2.15, 2.95));
      cap.style.opacity = cp.toFixed(3);
      cap.style.letterSpacing = `${lerp(0.42, 0.215, cp).toFixed(4)}em`;

      const line = q(root, '[data-line]');
      const lp = E.easeOutQuart(seg(lt, 2.9, 3.8));
      line.style.opacity = lp.toFixed(3);
      line.style.transform = `translate3d(0,${((1 - lp) * 26).toFixed(1)}px,0)`;
      line.style.filter = lp >= 1 ? 'none' : `blur(${((1 - lp) * 10).toFixed(1)}px)`;
    },
  },

  /* 1. hero -------------------------------------------------------------- */
  {
    id: 's1', in: 6.2, out: 11.8,
    html: split('art-left', 'hub', `
      ${eyebrow('Industry solutions')}
      <h1 class="serif lg" data-h1>${typeset('Workforce technology|for the work *every|industry depends on*.')}</h1>`),
    draw(root, lt, dur) {
      drawPanel(root, lt, dur);
      showEyebrow(root, lt, 0.5);
      revealChars(q(root, '[data-h1]'), lt, 0.78, { per: 0.019 });
    },
  },

  /* 2. the turn ----------------------------------------------------------- */
  {
    id: 's2', in: 11.8, out: 16.4,
    html: `
      <div class="ghost">ESSENTIAL WORK</div>
      <div class="pad">
        ${eyebrow('Industry context')}
        <h1 class="serif" data-h1>${typeset('Different work.|One standard for|*operational trust*.')}</h1>
      </div>`,
    draw(root, lt, dur) {
      const g = q(root, '.ghost');
      g.style.opacity = (0.05 * E.easeOutCubic(seg(lt, 0, 0.9))).toFixed(4);
      g.style.transform = `translate(-50%,-50%) scale(${lerp(1, 1.09, seg(lt, 0, dur)).toFixed(4)})`;
      showEyebrow(root, lt, 0.06);
      revealChars(q(root, '[data-h1]'), lt, 0.26, { per: 0.021 });
    },
  },

  /* 3. the filmstrip ------------------------------------------------------ */
  {
    id: 's3', in: 16.4, out: 32.8,
    html: `
      <div class="strip">
        <div class="halo" data-halo></div>
        <div class="track" data-track>
          ${INDUSTRIES.map(([key]) => `
            <div class="cel"><div class="img" style="background-image:url(${HEROES[key]})"></div></div>`).join('')}
        </div>
      </div>
      <div class="striplabel"><div class="slot">
        ${INDUSTRIES.map(([, name, line]) => `<div class="lab"><h2>${name}</h2><p>${line}</p></div>`).join('')}
      </div></div>
      <div class="stripdots">${INDUSTRIES.map(() => '<i></i>').join('')}</div>`,
    draw(root, lt, dur) {
      const n = INDUSTRIES.length;
      /* hold on each cel, then glide: a staircase eased at the risers */
      const run = seg(lt, 0.45, dur - 0.5);
      const k = run * (n - 1);
      const i0 = Math.floor(k), fr = k - i0;
      const pos = i0 + E.easeInOutQuart(clamp01((fr - 0.34) / 0.5));
      const active = Math.round(pos);

      const enter = E.easeOutQuart(seg(lt, 0, 0.9));
      q(root, '[data-track]').style.transform =
        `translate3d(${(960 - CEL_W / 2 - pos * CEL_STEP).toFixed(1)}px,${((1 - enter) * 46).toFixed(1)}px,0)`;

      qa(root, '.cel').forEach((c, i) => {
        const d = Math.abs(i - pos);
        c.style.transform = `scale(${Math.max(0.74, 1 - d * 0.15).toFixed(3)})`;
        c.style.opacity = (Math.max(0.13, 1 - d * 0.52) * enter).toFixed(3);
        c.style.filter = d < 0.3 ? 'none'
          : `saturate(${Math.max(0.35, 1 - d * 0.4).toFixed(2)}) blur(${Math.min(4, d * 1.6).toFixed(1)}px)`;
      });

      qa(root, '.lab').forEach((l, i) => {
        const p = clamp01(1 - Math.abs(i - pos) * 2.2);
        l.style.opacity = (p * enter).toFixed(3);
        l.style.transform = `translate3d(0,${((1 - p) * 22).toFixed(1)}px,0)`;
      });

      qa(root, '.stripdots i').forEach((el, i) => {
        el.style.background = i === active
          ? 'linear-gradient(90deg,#ee6b2f,#f9a45c)' : 'rgba(12,30,70,.13)';
      });
      q(root, '[data-halo]').style.opacity = enter.toFixed(3);
    },
  },

  /* 4. operational realities ---------------------------------------------- */
  {
    id: 's4', in: 32.8, out: 39.0,
    html: `
      <div class="pad">
        ${eyebrow('Operational realities')}
        <h1 class="serif sm" data-h1 style="margin-bottom:52px">${typeset('The environment changes.|The workforce operation *has to respond*.')}</h1>
        <div class="facts">
          ${[['coverage', 'Coverage has a different consequence',
              'Every open shift can reach patient care, customer service, order fulfillment, or production output.'],
             ['rules', 'Rules multiply across the workforce',
              'Credentials, agreements, jurisdictions, premiums, and site requirements shape who can work and how they are paid.'],
             ['handoff', 'Every handoff reaches time and pay',
              'Schedules, transfers, approvals, and exceptions need one dependable path from the frontline to payroll.']]
            .map(([ic, h, p]) => `<div class="card">${tile(ic)}<h3>${h}</h3><p>${p}</p></div>`).join('')}
        </div>
      </div>`,
    draw(root, lt) {
      showEyebrow(root, lt, 0.06);
      revealChars(q(root, '[data-h1]'), lt, 0.24, { per: 0.013 });
      stagger(qa(root, '.card'), lt, 1.35, 0.24, { dy: 44 });
    },
  },

  /* 5. how Align helps ------------------------------------------------------ */
  {
    id: 's5', in: 39.0, out: 45.8,
    html: `
      <div class="pad">
        ${eyebrow('How Align helps')}
        <h1 class="serif sm" data-h1 style="margin-bottom:48px">${typeset('Build one workforce foundation|without *flattening industry complexity*.')}</h1>
        <div class="facts four">
          ${[['design', 'Design for the work itself',
              'Configure roles, rules, workflows, and access around the people, locations, and commitments each industry carries.'],
             ['connect', 'Connect coverage, time, and pay',
              'Carry frontline decisions through timekeeping, approval, and payroll without losing the reason behind the work.'],
             ['visible', 'Make workforce risk visible',
              'Give leaders timely insight into coverage, qualifications, exceptions, labor cost, and service readiness.'],
             ['relevant', 'Keep the platform relevant',
              'Use expert support and a practical roadmap as regulations, workforce expectations, and operating needs change.']]
            .map(([ic, h, p]) => `<div class="card">${tile(ic)}<h3>${h}</h3><p>${p}</p></div>`).join('')}
        </div>
      </div>`,
    draw(root, lt) {
      showEyebrow(root, lt, 0.06);
      revealChars(q(root, '[data-h1]'), lt, 0.24, { per: 0.012 });
      stagger(qa(root, '.card'), lt, 1.3, 0.2, { dy: 44 });
    },
  },

  /* 6. the orbit ------------------------------------------------------------ */
  {
    id: 's6', in: 45.8, out: 56.0,
    html: `
      <div class="pad" style="right:944px">
        ${eyebrow('Trusted across industries')}
        <h1 class="serif sm" data-h1 style="font-size:70px">${typeset('Different industries.|Different platforms.|*The same team*.')}</h1>
        <p class="body" style="font-size:27px;max-width:660px">Healthcare, public sector, manufacturing,
          retail and hospitality, services and distribution.</p>
      </div>
      <div class="orbit">
        <svg class="wires" viewBox="-500 -500 1000 1000">
          <defs>
            <filter id="orbwide" x="-70%" y="-70%" width="240%" height="240%">
              <feGaussianBlur stdDeviation="9"/>
            </filter>
            <filter id="orbtight" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="4"/>
            </filter>
          </defs>
          <circle data-ring0 cx="0" cy="0" r="${ORBIT_R}" fill="none" stroke="rgba(22,50,110,.16)" stroke-width="1.5" stroke-dasharray="7 11"/>
          <circle data-ring1 cx="0" cy="0" r="198" fill="none" stroke="rgba(238,107,47,.30)" stroke-width="1.6" stroke-dasharray="2 11"/>
          <g data-spokes></g>
        </svg>
        <div class="hub" data-hub><div class="hubcore">${lockupSVG('lhub', 300)}</div></div>
        ${CLIENTS.map(c => `<div class="chip">
          <div class="flare" data-flare></div>
          <div class="disc"><img src="${c.src}" alt="${c.name}"></div>
        </div>`).join('')}
      </div>`,
    draw(root, lt, dur) {
      const n = CLIENTS.length;

      /* Each connection is five stacked paths, written once rather than every
         frame. The rest wire is always there so the ring reads as joined between
         strikes; the four bolt layers only light when a discharge runs.
         pathLength="1" lets the front be a plain dash fraction, so revealing the
         bolt hub outward is two attributes instead of a length measurement. */
      if (!root.__built) {
        const spokes = q(root, '[data-spokes]');
        for (let i = 0; i < n; i++) {
          spokes.insertAdjacentHTML('beforeend',
            '<g data-bolt>'
            + '<path data-rest fill="none" stroke="rgba(22,50,110,.16)" stroke-width="1.5"/>'
            /* On a white stage a bolt reads by being saturated, not bright: a
               pale glow just hazes the paper. So the atmosphere is warm and
               wide, the halo is mid orange, and the bolt itself is the deepest
               orange in the palette so it holds against cream. */
            + '<path data-wide fill="none" stroke="#f2a05c" stroke-width="16" stroke-linecap="round"'
            + ' stroke-linejoin="round" pathLength="1" filter="url(#orbwide)"/>'
            + '<path data-glow fill="none" stroke="#f2762f" stroke-width="8" stroke-linecap="round"'
            + ' stroke-linejoin="round" pathLength="1" filter="url(#orbtight)"/>'
            + '<path data-core fill="none" stroke="#d94a12" stroke-width="3.8" stroke-linecap="round"'
            + ' stroke-linejoin="round" pathLength="1"/>'
            + '<path data-fila fill="none" stroke="#ffcf8a" stroke-width="1.3" stroke-linecap="round"'
            + ' stroke-linejoin="round" pathLength="1"/>'
            + '<path data-fork fill="none" stroke="#d94a12" stroke-width="2.2" stroke-linecap="round"'
            + ' stroke-linejoin="round"/>'
            + '<path data-hot fill="none" stroke="#ff8a3c" stroke-width="6" stroke-linecap="round"'
            + ' stroke-linejoin="round" pathLength="1" filter="url(#orbtight)"/>'
            + '</g>');
        }
        root.__built = true;
      }

      showEyebrow(root, lt, 0.1);
      revealChars(q(root, '[data-h1]'), lt, 0.3, { per: 0.014 });
      showBody(root, lt, 1.5);

      const hubP = E.easeOutBack(seg(lt, 0.15, 1.0));
      const hub = q(root, '[data-hub]');
      hub.style.opacity = clamp01(hubP * 1.4).toFixed(3);
      hub.style.transform = `scale(${Math.max(0, hubP).toFixed(3)})`;
      /* the lockup inside the hub assembles as the circle lands */
      drawLockup(root, 'lhub', seg(lt, 0.45, 1.7));

      /* the ring turns slowly; each chip counter turns, so marks stay level */
      const spin = lerp(-9, 9, seg(lt, 0, dur)) * Math.PI / 180;
      q(root, '[data-ring0]').style.transform = `rotate(${(seg(lt, 0, dur) * 26).toFixed(2)}deg)`;
      q(root, '[data-ring1]').style.transform = `rotate(${(seg(lt, 0, dur) * -38).toFixed(2)}deg)`;

      const bolts = qa(root, '[data-bolt]');
      /* the last chip lands at 2.22s, so nothing discharges before then */
      const live = E.easeOutCubic(seg(lt, 2.2, 3.0));
      const step = Math.floor(lt * BOLT_HZ);
      const STRIKE = 2.6;              /* seconds between strikes on one spoke */
      const TRAVEL = 0.30;             /* fraction of the cycle spent crossing */
      let charge = 0;                  /* how hard the hub is firing this frame */

      qa(root, '.chip').forEach((chip, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2 + spin;
        const s = 0.75 + i * 0.11;
        const grow = Math.max(0, E.easeOutBack(seg(lt, s, s + 0.7)));
        const cx = Math.cos(a) * ORBIT_R, cy = Math.sin(a) * ORBIT_R;

        /* staggered by i/n, so the discharge chases around the ring rather than
           all eight firing at once */
        const raw = (lt - 2.2) / STRIKE - i / n;
        const ph = raw - Math.floor(raw);
        const front = Math.min(1, ph / TRAVEL);
        const frontE = E.easeOutQuart(front);
        const decay = ph <= TRAVEL ? 1 : Math.max(0, 1 - (ph - TRAVEL) / 0.34);
        /* a little brightness jitter per shape, so the bolt crackles */
        const amp = live * decay * decay * (0.72 + 0.28 * jit(i * 4.1 + step * 6.7));
        /* the mark takes the hit once the front lands on it */
        const hit = ph <= TRAVEL ? 0 : Math.max(0, 1 - (ph - TRAVEL) / 0.42);
        charge = Math.max(charge, live * Math.max(0, 1 - ph / 0.13));

        chip.style.opacity = clamp01(E.easeOutCubic(seg(lt, s, s + 0.4)) * 1.2).toFixed(3);
        chip.style.transform = `translate3d(${(cx * grow).toFixed(1)}px,${(cy * grow).toFixed(1)}px,0)`
          + ` scale(${(0.6 + 0.4 * grow + 0.05 * hit * hit).toFixed(3)})`;
        const flare = q(chip, '[data-flare]');
        flare.style.opacity = (hit * hit * live).toFixed(3);
        flare.style.transform = `scale(${(0.82 + 0.3 * hit).toFixed(3)})`;

        const g = bolts[i];
        const dash = `${frontE.toFixed(3)} 1`;
        const geo = boltGeom(cx, cy, i, step);

        const rest = q(g, '[data-rest]');
        rest.setAttribute('d', `M0 0 L${cx.toFixed(1)} ${cy.toFixed(1)}`);
        rest.setAttribute('opacity', (E.easeOutCubic(seg(lt, s + 0.1, s + 0.6)) * 0.9).toFixed(3));

        [['[data-wide]', 0.30], ['[data-glow]', 0.52], ['[data-core]', 1], ['[data-fila]', 0.8]].forEach(([sel, k]) => {
          const p = q(g, sel);
          p.setAttribute('d', geo.d);
          p.setAttribute('stroke-dasharray', dash);
          p.setAttribute('opacity', (amp * k).toFixed(3));
        });

        /* the charge itself, a short fat dash chasing the front out to the mark */
        const hot = q(g, '[data-hot]');
        hot.setAttribute('d', geo.d);
        hot.setAttribute('stroke-dasharray', '0.13 1');
        hot.setAttribute('stroke-dashoffset', (0.13 - frontE).toFixed(3));
        hot.setAttribute('opacity', (amp * (front < 1 ? 0.85 : 0.3)).toFixed(3));

        const fork = q(g, '[data-fork]');
        fork.setAttribute('d', geo.fork);
        fork.setAttribute('opacity', (frontE > geo.forkAt ? amp * 0.8 : 0).toFixed(3));
      });

      /* the hub brightens as it launches, so the energy reads as coming from us */
      const core = q(root, '.hubcore');
      core.style.transform = `scale(${(1 + 0.022 * charge).toFixed(4)})`;
      hub.style.boxShadow = `0 30px 70px rgba(16,38,86,.22),`
        + ` 0 0 0 ${(15 + 9 * charge).toFixed(1)}px rgba(238,107,47,${(0.07 + 0.11 * charge).toFixed(3)}),`
        + ` 0 0 ${(40 + 70 * charge).toFixed(0)}px rgba(238,107,47,${(0.10 + 0.24 * charge).toFixed(3)})`;
    },
  },

  /* 7. SmartCare ------------------------------------------------------------ */
  {
    id: 's7', in: 56.0, out: 61.2,
    html: `
      <div class="center">
        <img class="scmark" data-mark src="${SMARTCARE}" alt="SmartCare by Align HCM">
        <p class="body" style="text-align:center;margin-top:40px;font-size:34px">
          Expert support from launch through <span class="hi">continuous improvement.</span></p>
      </div>`,
    draw(root, lt) {
      const m = q(root, '[data-mark]');
      const p = E.easeOutQuart(seg(lt, 0.12, 1.1));
      m.style.opacity = p.toFixed(3);
      m.style.transform = `translate3d(0,${((1 - p) * 30).toFixed(1)}px,0) scale(${lerp(0.93, 1, p).toFixed(4)})`;
      m.style.filter = p >= 1 ? 'none' : `blur(${((1 - p) * 12).toFixed(1)}px)`;
      showBody(root, lt, 1.2);
    },
    wash: lt => pulse(lt, 0.0, 0.08, 0.14, 0.55) * 0.22,
  },

  /* 8. end card -------------------------------------------------------------- */
  {
    id: 's8', in: 61.2, out: 67.2,
    html: `
      <div class="endcard">
        <div data-lock>${lockupSVG('lend', 940)}</div>
        <div class="lockup-cap" data-cap>Human Capital Management</div>
        <div class="hairline" data-hair></div>
        <div class="tag" data-tag>Align moves at your speed.<br><span class="accent">Which is always right now.</span></div>
        <div class="url" data-url>ALIGNHCM.COM</div>
      </div>`,
    draw(root, lt) {
      drawLockup(root, 'lend', seg(lt, 0.1, 1.5));
      const lp = E.easeOutQuart(seg(lt, 0.05, 1.2));
      q(root, '[data-lock]').style.transform = `scale(${lerp(0.94, 1, lp).toFixed(4)})`;
      const cap = q(root, '[data-cap]');
      const cp = E.easeOutCubic(seg(lt, 0.95, 1.6));
      cap.style.opacity = cp.toFixed(3);
      cap.style.letterSpacing = `${lerp(0.34, 0.215, cp).toFixed(4)}em`;
      q(root, '[data-hair]').style.transform = `scaleX(${E.easeOutQuart(seg(lt, 1.35, 2.0)).toFixed(3)})`;
      const tag = q(root, '[data-tag]');
      const tp = E.easeOutQuart(seg(lt, 1.6, 2.5));
      tag.style.opacity = tp.toFixed(3);
      tag.style.transform = `translate3d(0,${((1 - tp) * 24).toFixed(2)}px,0)`;
      tag.style.filter = tp >= 1 ? 'none' : `blur(${((1 - tp) * 10).toFixed(2)}px)`;
      const up = E.easeOutCubic(seg(lt, 2.3, 3.0));
      const url = q(root, '[data-url]');
      url.style.opacity = (up * 0.95).toFixed(3);
      url.style.letterSpacing = `${lerp(0.6, 0.38, up).toFixed(4)}em`;
    },
    wash: lt => pulse(lt, 0.0, 0.08, 0.12, 0.5) * 0.24,
  },
];
