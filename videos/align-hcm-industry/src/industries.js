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

/* one image per industry, taken from that industry's own page */
const INDUSTRIES = [
  ['healthcare', 'Healthcare', 'Coverage protects care.'],
  ['retail', 'Retail &amp; Hospitality', 'Staffing shapes the customer experience.'],
  ['services', 'Services &amp; Distribution', 'Every handoff affects delivery and trust.'],
  ['manufacturing', 'Manufacturing', 'Every assignment affects output, safety, and margin.'],
];

const CEL_W = 620, CEL_GAP = 44, CEL_STEP = CEL_W + CEL_GAP;   /* must match .cel in style.css */
const ORBIT_R = 306;

/* the official Align mark, from /hubfs/Site Images/Align Favicon.svg */
const ALIGN_MARK = `
<svg viewBox="0 0 720 720">
  <polygon fill="#ee6b2f" points="480 600.5 363.4 600.5 0 102 116.6 102"/>
  <polygon fill="#16326e" points="637.4 600.5 520.8 600.5 157.4 102 274 102"/>
  <circle fill="#ee6b2f" cx="400.9" cy="145.2" r="64.4"/>
  <circle fill="#ee6b2f" cx="535.9" cy="315.3" r="64.4"/>
  <circle fill="#ee6b2f" cx="655.6" cy="482.8" r="64.4"/>
</svg>`;

const SCENES = [

  /* 1. hero -------------------------------------------------------------- */
  {
    id: 's1', in: 0.0, out: 5.6,
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
    id: 's2', in: 5.6, out: 10.2,
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
    id: 's3', in: 10.2, out: 23.4,
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
    id: 's4', in: 23.4, out: 29.6,
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
    id: 's5', in: 29.6, out: 36.4,
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
    id: 's6', in: 36.4, out: 46.6,
    html: `
      <div class="pad" style="right:944px">
        ${eyebrow('Trusted across industries')}
        <h1 class="serif sm" data-h1 style="font-size:66px">${typeset('One partner at the center|of the *workforce operation*.')}</h1>
        <p class="body" style="font-size:27px;max-width:700px">Healthcare, manufacturing, retail and hospitality,
          services and distribution. <span class="hi">One connected operation.</span></p>
      </div>
      <div class="orbit">
        <svg class="wires" viewBox="-500 -500 1000 1000">
          <circle data-ring0 cx="0" cy="0" r="${ORBIT_R}" fill="none" stroke="rgba(22,50,110,.13)" stroke-width="1.5" stroke-dasharray="7 11"/>
          <circle data-ring1 cx="0" cy="0" r="188" fill="none" stroke="rgba(238,107,47,.20)" stroke-width="1.5" stroke-dasharray="3 9"/>
          <g data-spokes></g>
          <g data-pulses></g>
        </svg>
        <div class="hub" data-hub>${ALIGN_MARK}</div>
        ${CLIENTS.map(c => `<div class="chip"><img src="${c.src}" alt="${c.name}"></div>`).join('')}
      </div>`,
    draw(root, lt, dur) {
      const n = CLIENTS.length;

      /* spokes and pulses are geometry, written once rather than every frame */
      if (!root.__built) {
        const spokes = q(root, '[data-spokes]'), pulses = q(root, '[data-pulses]');
        for (let i = 0; i < n; i++) {
          spokes.insertAdjacentHTML('beforeend',
            '<line x1="0" y1="0" x2="0" y2="0" stroke="rgba(22,50,110,.18)" stroke-width="1.6" data-spoke/>');
          pulses.insertAdjacentHTML('beforeend', '<circle r="5" fill="#ee6b2f" data-pulse/>');
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

      /* the ring turns slowly; each chip counter turns, so marks stay level */
      const spin = lerp(-9, 9, seg(lt, 0, dur)) * Math.PI / 180;
      q(root, '[data-ring0]').style.transform = `rotate(${(seg(lt, 0, dur) * 26).toFixed(2)}deg)`;
      q(root, '[data-ring1]').style.transform = `rotate(${(seg(lt, 0, dur) * -38).toFixed(2)}deg)`;

      const spokeEls = qa(root, '[data-spoke]');
      const pulseEls = qa(root, '[data-pulse]');

      qa(root, '.chip').forEach((chip, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2 + spin;
        const s = 0.75 + i * 0.11;
        const grow = Math.max(0, E.easeOutBack(seg(lt, s, s + 0.7)));
        const cx = Math.cos(a) * ORBIT_R, cy = Math.sin(a) * ORBIT_R;
        chip.style.opacity = clamp01(E.easeOutCubic(seg(lt, s, s + 0.4)) * 1.2).toFixed(3);
        chip.style.transform =
          `translate3d(${(cx * grow).toFixed(1)}px,${(cy * grow).toFixed(1)}px,0) scale(${(0.6 + 0.4 * grow).toFixed(3)})`;

        spokeEls[i].setAttribute('x2', cx.toFixed(1));
        spokeEls[i].setAttribute('y2', cy.toFixed(1));
        spokeEls[i].setAttribute('opacity', (E.easeOutCubic(seg(lt, s + 0.1, s + 0.6)) * 0.9).toFixed(3));

        /* a signal runs out from the hub to each mark, offset per spoke */
        const t = (seg(lt, 1.4, dur) * 2.2 + i / n) % 1;
        const trav = Math.min(0.12 + t * 0.9, 1);
        pulseEls[i].setAttribute('cx', (cx * trav).toFixed(1));
        pulseEls[i].setAttribute('cy', (cy * trav).toFixed(1));
        pulseEls[i].setAttribute('opacity',
          (Math.sin(t * Math.PI) * 0.85 * E.easeOutCubic(seg(lt, 1.4, 2.1))).toFixed(3));
      });
    },
  },

  /* 7. SmartCare ------------------------------------------------------------ */
  {
    id: 's7', in: 46.6, out: 51.8,
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
    id: 's8', in: 51.8, out: 57.8,
    html: `
      <div class="endcard">
        <div data-lock>${lockupSVG('lend', 940)}</div>
        <div class="lockup-cap" data-cap>Human Capital Management</div>
        <div class="hairline" data-hair></div>
        <div class="tag" data-tag>Built for the people <span class="accent">who keep it running.</span></div>
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
