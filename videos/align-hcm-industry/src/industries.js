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
 * sector has no page of its own, so it borrows the managed payroll hero, which is
 * a calendar, an approval loop and a stack of records. See media.py.
 *
 * The line under each name is that industry's own vocabulary rather than a
 * sentence about it. That is the whole argument of the film made literal: these
 * are the words an operator uses, and a partner either knows them on arrival or
 * learns them on the client's time. Every term here is one Align configures for. */
const INDUSTRIES = [
  ['healthcare', 'Healthcare',
   'Census, float pool, credentials, differentials, ratios.'],
  ['public', 'Public Sector',
   'Bargaining units, steps and grades, accruals, prevailing wage.'],
  ['retail', 'Retail &amp; Hospitality',
   'Split shifts, tip credit, predictive scheduling, seasonal ramp.'],
  ['services', 'Services &amp; Distribution',
   'Billable utilization, per diem, multi state, hours of service.'],
  ['manufacturing', 'Manufacturing',
   'Crew rotations, shift differentials, downtime, certifications.'],
];

const CEL_W = 620, CEL_GAP = 44, CEL_STEP = CEL_W + CEL_GAP;   /* must match .cel in style.css */
const ORBIT_R = 352;

/* -------------------------------------------------------------------- spokes */

/* The orbit spokes are wires with a signal travelling out along them, not
   lightning. An earlier pass drew them as jagged discharges and it read as a
   stock effect rather than as this company: the argument the scene makes is
   that Align sits at the centre of an operation and the platforms are reached
   deliberately, which is a steady signal, not a storm.

   A line drawn from dead centre spends its first 150px behind the hub disc, so
   each spoke starts at the rim. The ring is sized around keeping that corridor
   open: hub r 152 out to chip edge r 277 is 125px of clear paper for the
   travelling pulse to be read in. */
const SPOKE_R0 = 158;

function spokeGeom(cx, cy) {
  const len = Math.hypot(cx, cy);
  const ux = cx / len, uy = cy / len;
  return {
    d: `M${(ux * SPOKE_R0).toFixed(1)} ${(uy * SPOKE_R0).toFixed(1)}`
       + ` L${cx.toFixed(1)} ${cy.toFixed(1)}`,
  };
}

const SCENES = [

  /* 0. the ink reveal ---------------------------------------------------- */
  /* The lockup is masked by a rectangle sweeping left to right. That rectangle
     is displaced by fractal noise and blurred, so its leading edge behaves like
     ink spreading into paper rather than a hard wipe. The filter is on the mask,
     never on the artwork, so the logo itself stays perfectly sharp. */
  {
    id: 's0', in: 0.0, out: 4.8,
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
    },
  },

  /* 1. hero -------------------------------------------------------------- */
  {
    id: 's1', in: 4.8, out: 10.4,
    html: split('art-left', 'hub', `
      ${eyebrow('Industry expertise')}
      <h1 class="serif lg" data-h1>${typeset('We configure HCM|platforms around|*how your industry|actually runs*.')}</h1>`),
    draw(root, lt, dur) {
      drawPanel(root, lt, dur);
      showEyebrow(root, lt, 0.5);
      revealChars(q(root, '[data-h1]'), lt, 0.78, { per: 0.019 });
    },
  },

  /* 2. the turn ----------------------------------------------------------- */
  {
    id: 's2', in: 10.4, out: 15.0,
    html: `
      <div class="ghost">FLUENCY</div>
      <div class="pad">
        ${eyebrow('Why it matters')}
        <h1 class="serif" data-h1>${typeset('Every industry runs on|its own vocabulary.|*We already speak it*.')}</h1>
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
    id: 's3', in: 15.0, out: 31.4,
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
    id: 's4', in: 31.4, out: 37.6,
    html: `
      <div class="pad">
        ${eyebrow('Configured to your environment')}
        <h1 class="serif sm" data-h1 style="margin-bottom:52px">${typeset('Configuration is where|a platform *becomes your operation*.')}</h1>
        <div class="facts">
          ${[['rules', 'Your agreements, in the rules',
              'Union contracts, bargaining steps, licensure, premiums, and jurisdiction requirements built into the configuration rather than worked around after go-live.'],
             ['coverage', 'Your coverage, in the schedule',
              'Ratios, crew rotations, float pools, split shifts, and seasonal ramp modeled the way your operation actually staffs.'],
             ['handoff', 'Your reality, in the pay',
              'Differentials, premiums, per diem, tip credit, and multi state treatment calculated correctly the first time.']]
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
    id: 's5', in: 37.6, out: 44.4,
    html: `
      <div class="pad">
        ${eyebrow('How we work')}
        <h1 class="serif sm" data-h1 style="margin-bottom:48px">${typeset('A configuration your teams|*recognize on day one*.')}</h1>
        <div class="facts four">
          ${[['design', 'We arrive knowing the work',
              'Consultants who have configured for your industry before, rather than a generalist learning your operation as they go.'],
             ['connect', 'We build to your environment',
              'Roles, rules, workflows, and access shaped around your locations, your agreements, and the commitments you carry.'],
             ['visible', 'We carry coverage into pay',
              'Frontline decisions travel through timekeeping, approval, and payroll without losing the reason behind them.'],
             ['relevant', 'We stay past go-live',
              'Expert support and a practical roadmap as regulations, agreements, and operating needs change.']]
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
    id: 's6', in: 44.4, out: 54.6,
    html: `
      <div class="pad" style="right:944px">
        ${eyebrow('Many platforms, every industry')}
        <h1 class="serif sm" data-h1 style="font-size:70px">${typeset('We speak the platform.|We speak *your business*.')}</h1>
        <p class="body" style="font-size:27px;max-width:660px">UKG, Dayforce, HiBob and Paylocity across
          healthcare, public sector, manufacturing, retail and hospitality, services and distribution.</p>
      </div>
      <div class="orbit">
        <svg class="wires" viewBox="-500 -500 1000 1000">
          <defs>
            <filter id="orbwide" x="-70%" y="-70%" width="240%" height="240%">
              <feGaussianBlur stdDeviation="9"/>
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

      /* Each connection is three stacked paths, written once rather than every
         frame. The rest wire is always there so the ring reads as joined between
         signals; the glow and the travelling pulse ride on top of it.
         pathLength="1" lets the pulse be a plain dash fraction, so moving it out
         along the wire is two attributes instead of a length measurement. */
      if (!root.__built) {
        const spokes = q(root, '[data-spokes]');
        for (let i = 0; i < n; i++) {
          spokes.insertAdjacentHTML('beforeend',
            '<g data-spoke>'
            + '<path data-rest fill="none" stroke="rgba(22,50,110,.16)" stroke-width="1.5"/>'
            /* On a white stage the signal reads by being saturated, not bright:
               a pale glow just hazes the paper. So the atmosphere is warm and
               wide and the pulse itself is the deepest orange in the palette,
               which is what holds it against cream. */
            + '<path data-glow fill="none" stroke="#f2a05c" stroke-width="13" stroke-linecap="round"'
            + ' pathLength="1" filter="url(#orbwide)"/>'
            + '<path data-pulse fill="none" stroke="#d94a12" stroke-width="4" stroke-linecap="round"'
            + ' pathLength="1"/>'
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

      const spokes = qa(root, '[data-spoke]');
      /* the last chip lands at 2.22s, so nothing signals before then */
      const live = E.easeOutCubic(seg(lt, 2.2, 3.0));
      const CYCLE = 2.6;               /* seconds between signals on one spoke */
      const TRAVEL = 0.34;             /* fraction of the cycle spent crossing */
      const PULSE = 0.20;              /* length of the pulse as a dash fraction */
      let charge = 0;                  /* how hard the hub is sending this frame */

      qa(root, '.chip').forEach((chip, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2 + spin;
        const s = 0.75 + i * 0.11;
        const grow = Math.max(0, E.easeOutBack(seg(lt, s, s + 0.7)));
        const cx = Math.cos(a) * ORBIT_R, cy = Math.sin(a) * ORBIT_R;

        /* staggered by i/n, so the discharge chases around the ring rather than
           all eight firing at once */
        const raw = (lt - 2.2) / CYCLE - i / n;
        const ph = raw - Math.floor(raw);
        const front = Math.min(1, ph / TRAVEL);
        /* eased in and out, so the pulse leaves the hub and settles on the mark
           rather than running the wire at a constant machine speed */
        const frontE = E.easeInOutCubic(front);
        const amp = live * (ph <= TRAVEL ? 1 : Math.max(0, 1 - (ph - TRAVEL) / 0.30));
        /* the mark lights once the signal lands on it */
        const hit = ph <= TRAVEL ? 0 : Math.max(0, 1 - (ph - TRAVEL) / 0.42);
        charge = Math.max(charge, live * Math.max(0, 1 - ph / 0.13));

        chip.style.opacity = clamp01(E.easeOutCubic(seg(lt, s, s + 0.4)) * 1.2).toFixed(3);
        chip.style.transform = `translate3d(${(cx * grow).toFixed(1)}px,${(cy * grow).toFixed(1)}px,0)`
          + ` scale(${(0.6 + 0.4 * grow + 0.05 * hit * hit).toFixed(3)})`;
        const flare = q(chip, '[data-flare]');
        flare.style.opacity = (hit * hit * live).toFixed(3);
        flare.style.transform = `scale(${(0.82 + 0.3 * hit).toFixed(3)})`;

        const g = spokes[i];
        const geo = spokeGeom(cx, cy);

        const rest = q(g, '[data-rest]');
        rest.setAttribute('d', `M0 0 L${cx.toFixed(1)} ${cy.toFixed(1)}`);
        rest.setAttribute('opacity', (E.easeOutCubic(seg(lt, s + 0.1, s + 0.6)) * 0.9).toFixed(3));

        /* A short dash travelling hub to mark. The gap is padded either side so
           the dash pattern never repeats down the wire and leaves a dotted line
           behind the pulse. */
        const off = (PULSE - frontE * (1 + PULSE)).toFixed(4);
        [['[data-glow]', 0.5], ['[data-pulse]', 1]].forEach(([sel, k]) => {
          const p = q(g, sel);
          p.setAttribute('d', geo.d);
          p.setAttribute('stroke-dasharray', `${PULSE} 1`);
          p.setAttribute('stroke-dashoffset', off);
          p.setAttribute('opacity', (amp * k).toFixed(3));
        });
      });

      /* the hub brightens as it launches, so the energy reads as coming from us */
      const core = q(root, '.hubcore');
      core.style.transform = `scale(${(1 + 0.022 * charge).toFixed(4)})`;
      hub.style.boxShadow = `0 30px 70px rgba(16,38,86,.22),`
        + ` 0 0 0 ${(15 + 9 * charge).toFixed(1)}px rgba(238,107,47,${(0.07 + 0.11 * charge).toFixed(3)}),`
        + ` 0 0 ${(40 + 70 * charge).toFixed(0)}px rgba(238,107,47,${(0.10 + 0.24 * charge).toFixed(3)})`;
    },
  },

  /* 7. past go-live ---------------------------------------------------------- */
  /* This beat used to lead with the SmartCare mark. It was pulled: SmartCare is
     its own product story with its own film, and dropping its logo into the last
     ten seconds of the industry cut read as a second brand arriving with no
     setup. The claim the beat is actually making is about continuity of the
     industry team, so the line carries it on its own. */
  {
    id: 's7', in: 54.6, out: 59.8,
    html: `
      <div class="center">
        <h1 class="serif sm" data-h1 style="font-size:76px;text-align:center">${typeset('The same industry team,|*long after go-live*.')}</h1>
      </div>`,
    draw(root, lt) {
      revealChars(q(root, '[data-h1]'), lt, 0.24, { per: 0.019 });
    },
    wash: lt => pulse(lt, 0.0, 0.08, 0.14, 0.55) * 0.22,
  },

  /* 8. end card -------------------------------------------------------------- */
  {
    id: 's8', in: 59.8, out: 65.8,
    html: `
      <div class="endcard">
        <div data-lock>${lockupSVG('lend', 940)}</div>
        <div class="lockup-cap" data-cap>Human Capital Management</div>
        <div class="hairline" data-hair></div>
        <!-- Expertise leads, the configuration is the proof. An earlier pass ended
             on the configuration itself, which put the mechanism ahead of the thing
             that actually differentiates Align: knowing the industry. The config is
             where that knowledge becomes visible, so it goes second. -->
        <div class="tag" data-tag>We know your industry.<br><span class="accent">The configuration proves it.</span></div>
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
