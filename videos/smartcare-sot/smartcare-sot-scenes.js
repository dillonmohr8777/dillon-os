// smartcare-sot-scenes.js - dark SmartCare "Stabilize · Optimize · Thrive"
// Six GSAP scenes matching the five SmartCare slides + an Align sign-off.
// Motion parameters: swipe transitions (in player), disappearing-ink exits,
// 3D pop-ins on cards / checklists / icons.
(function () {
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  function splitChars(el, klass = 'char') {
    const nodes = Array.from(el.childNodes);
    el.innerHTML = '';
    nodes.forEach((node) => {
      if (node.nodeType === 3) {
        // Skip whitespace-only text between block lines / words - otherwise it
        // forms an empty inline line-box and throws off vertical rhythm.
        if (!/\S/.test(node.textContent)) return;
        for (const ch of node.textContent) {
          const s = document.createElement('span');
          if (ch === ' ') { s.className = klass + ' space'; s.innerHTML = '&nbsp;'; }
          else { s.className = klass; s.textContent = ch; }
          el.appendChild(s);
        }
      } else if (node.nodeType === 1) {
        const inner = Array.from(node.childNodes);
        node.innerHTML = '';
        inner.forEach(n2 => {
          if (n2.nodeType === 3) {
            for (const ch of n2.textContent) {
              const s = document.createElement('span');
              if (ch === ' ') { s.className = klass + ' space'; s.innerHTML = '&nbsp;'; }
              else { s.className = klass; s.textContent = ch; }
              node.appendChild(s);
            }
          } else node.appendChild(n2);
        });
        el.appendChild(node);
      }
    });
    return el.querySelectorAll('.' + klass);
  }

  const ease = { expo:'expo.out', power4:'power4.out', power3:'power3.out', back:'back.out(1.5)' };

  // ── Icon library (viewBox 0 0 48 48) ──
  const ICON = {
    person:`<circle cx="24" cy="17" r="8.5"/><path d="M9 41c0-8.5 6.7-14 15-14s15 5.5 15 14"/>`,
    bars:`<path d="M13 40V27"/><path d="M24 40V14"/><path d="M35 40V31"/><circle cx="13" cy="24.5" r="2"/><circle cx="24" cy="11.5" r="2"/><circle cx="35" cy="28.5" r="2"/>`,
    shield:`<path d="M24 5l16 6v10c0 11-8 18.5-16 22-8-3.5-16-11-16-22V11z"/><path d="M16.5 24l5 5 11-12"/>`,
    gear:`<circle cx="24" cy="24" r="7.5"/><path d="M24 6v6M24 36v6M6 24h6M36 24h6M11.5 11.5l4.2 4.2M32.3 32.3l4.2 4.2M36.5 11.5l-4.2 4.2M15.7 32.3l-4.2 4.2"/>`,
    kase:`<rect x="9" y="9" width="30" height="30" rx="4"/><path d="M9 19h30"/><path d="M15 27h9M15 33h13"/>`,
    adoption:`<path d="M9 37l11-10 7 6 13-16"/><path d="M32 17h8v8"/>`,
    workflow:`<circle cx="12" cy="24" r="5.5"/><circle cx="37" cy="13" r="5.5"/><circle cx="37" cy="35" r="5.5"/><path d="M17 22l15-7M17 26l15 7"/>`,
    cleanup:`<path d="M30 9l9 9"/><path d="M26 13L12 27l9 9 14-14z"/><path d="M12 27l-4 13 13-4"/>`,
    insights:`<circle cx="21" cy="21" r="12"/><path d="M30 30l9 9"/><path d="M16 24v-3M21 24v-8M26 24v-5"/>`,
    knight:`<g fill="#F5821F" stroke="none"><path d="M16 41h17c0-2.5-1.3-3.6-2.6-4.5H18.6C17.3 37.4 16 38.5 16 41zM19 34.5h11c1.3-9.2-1-13.5-6.2-17.4 1.2-2 2-4.2 1-6.4l-4 3-1.8-4.2-2.2 4-3-2 1 5.2c-3.2 2-5.4 5-5.4 9.2l5 1-2 3.2 4 1c-1.4 1.3-2.4 2.6-2.4 3.4z"/></g>`,
    trendup:`<path d="M8 34l10-10 6 6 16-18"/><path d="M40 12h-8M40 12v8"/>`,
    resolution:`<path d="M24 5l16 6v10c0 11-8 18.5-16 22-8-3.5-16-11-16-22V11z"/><path d="M16.5 24l5 5 11-12"/>`,
  };
  const CHECK = `<svg viewBox="0 0 24 24"><path d="M5 13l5 5L19 7"/></svg>`;

  function iconRow(items){
    return `<div class="sc-icons">` + items.map((it,i)=>
      (i>0?`<div class="ic-div"></div>`:``) +
      `<div class="ic"><div class="ic-ring"><svg viewBox="0 0 48 48">${it.s}</svg></div><div class="ic-lbl">${it.l}</div></div>`
    ).join('') + `</div>`;
  }
  function checks(items){
    return `<div class="checks">` + items.map(t=>
      `<div class="check"><span class="cbox">${CHECK}</span><span class="ctxt">${t}</span></div>`
    ).join('') + `</div>`;
  }

  // shared entrance for a headline: char-pop from below with blur
  function popHead(tl, chars, at=0.2){
    gsap.set(chars, { yPercent: 115, opacity: 0, filter:'blur(8px)' });
    tl.to(chars, { yPercent:0, opacity:1, filter:'blur(0px)', duration:0.8, stagger:0.02, ease:ease.expo }, at);
  }
  function popCard(tl, card, at=0.35){
    gsap.set(card, { opacity:0, y:60, z:-320, rotationY:-16, transformPerspective:1200, transformOrigin:'50% 50%' });
    tl.to(card, { opacity:1, y:0, z:0, rotationY:0, duration:1.1, ease:'back.out(1.4)' }, at);
  }
  function popChecks(tl, chks, at){
    gsap.set(chks, { opacity:0, x:40, z:-120, rotationY:14, transformPerspective:900, transformOrigin:'0% 50%' });
    tl.to(chks, { opacity:1, x:0, z:0, rotationY:0, duration:0.6, stagger:0.14, ease:ease.back }, at);
  }
  function popIcons(tl, ics, at){
    gsap.set(ics, { opacity:0, y:40, z:-140, rotationX:-30, transformPerspective:800, transformOrigin:'50% 100%' });
    tl.to(ics, { opacity:1, y:0, z:0, rotationX:0, duration:0.6, stagger:0.1, ease:ease.back }, at);
  }

  // ═══════════════ SCENE 0 - Align HCM intro ═══════════════
  function scene0(root){
    root.innerHTML = `
      <div class="s0 scene-inner">
        <div class="intro-stage">
          <div class="intro-halo"></div>
          <div class="intro-ring r3"></div>
          <div class="intro-ring r2"></div>
          <div class="intro-ring"></div>
          <img class="intro-logo" src="assets/alignhcm-logo-transparent.png" alt="Align HCM"/>
          <div class="intro-sweep"></div>
        </div>
      </div>`;
    const tl = gsap.timeline();
    const halo = $('.intro-halo', root), rings = $$('.intro-ring', root);
    const logo = $('.intro-logo', root), sweep = $('.intro-sweep', root);
    gsap.set(halo, { opacity:0, scale:0.55, transformOrigin:'50% 50%' });
    gsap.set(rings, { opacity:0, scale:0.35, transformOrigin:'50% 50%' });
    gsap.set(logo, { opacity:0, scale:0.72, filter:'blur(16px)', y:14, rotationX:14, transformPerspective:1300, transformOrigin:'50% 60%' });
    gsap.set(sweep, { xPercent:-170, opacity:0 });
    tl.to(halo, { opacity:1, scale:1, duration:1.7, ease:'power2.out' }, 0.1)
      .to(rings, { opacity:1, scale:1, duration:1.5, stagger:0.14, ease:'power3.out' }, 0.2)
      .to(logo, { opacity:1, scale:1, filter:'blur(0px)', y:0, rotationX:0, duration:1.5, ease:'power3.out' }, 0.55)
      // light sweep glides across the logo
      .fromTo(sweep, { xPercent:-170, opacity:0.9 }, { xPercent:170, opacity:0.9, duration:1.3, ease:'power2.inOut' }, 2.0)
      .set(sweep, { opacity:0 })
      // gentle breathing
      .to(logo, { scale:1.02, duration:2.4, ease:'sine.inOut', yoyo:true, repeat:1 }, 3.2)
      // decorations disappear just before the wipe into slide 1
      .to(rings, { opacity:0, scale:1.16, duration:1.5, stagger:0.08, ease:'power2.inOut' }, 6.2)
      .to(halo, { opacity:0.4, duration:1.3, ease:'power2.inOut' }, 6.2);
    return tl;
  }

  // ═══════════════ SCENE 1 - Support ═══════════════
  function scene1(root){
    root.innerHTML = `
      <div class="s1 scene-inner">
        <h1 class="sc-head" style="top:262px;font-size:110px">
          <span class="ln">Stay supported</span>
          <span class="ln accent">after go live.</span>
        </h1>
        <div class="sc-rule" style="top:502px"></div>
        <p class="sc-sub" style="top:550px;max-width:690px">Extend HCM capacity with responsive admin, reporting, and optimization support.</p>
        ${iconRow([
          {s:ICON.person,l:'Admin support'},{s:ICON.bars,l:'Reporting'},
          {s:ICON.shield,l:'Issue resolution'},{s:ICON.gear,l:'Optimization'}
        ]).replace('class="sc-icons"','class="sc-icons" style="left:92px;top:772px"')}
        <div class="sc-card" style="right:110px;top:150px;width:640px;height:800px">
          <div class="card-pad">
            <div class="sc-badge"><img src="assets/smartcare-logo-light.png" alt=""/></div>
            <div class="card-title" style="font-size:76px;margin-top:44px"><span class="brand">SmartCare</span><span class="mode">Support</span></div>
            <div class="card-underline" style="margin-top:22px"></div>
            <div style="margin-top:60px">${checks(['Resolve issues faster','Keep systems moving','Support ongoing optimization'])}</div>
          </div>
        </div>
      </div>`;
    const tl = gsap.timeline();
    const chars = splitChars($('.sc-head', root));
    const card = $('.sc-card', root);
    gsap.set($('.sc-rule', root), { width:0 });
    gsap.set($('.sc-sub', root), { opacity:0, y:16 });
    popHead(tl, chars, 0.2);
    tl.to($('.sc-rule', root), { width:300, duration:0.8, ease:ease.expo }, 1.1)
      .to($('.sc-sub', root), { opacity:1, y:0, duration:0.7, ease:ease.power3 }, 1.3);
    popCard(tl, card, 0.5);
    gsap.set($('.sc-badge', root), { scale:0, transformOrigin:'50% 50%' });
    tl.to($('.sc-badge', root), { scale:1, duration:0.7, ease:'back.out(1.7)' }, 1.2);
    popChecks(tl, $$('.check', root), 1.7);
    popIcons(tl, $$('.sc-icons .ic', root), 2.2);
    return tl;
  }

  // ═══════════════ SCENE 2 - Stabilize ═══════════════
  function scene2(root){
    const di = {
      warn:'<svg viewBox="0 0 24 24"><path d="M12 4 L21 19 H3 Z"/><path d="M12 10v4"/><path d="M12 16.3v.2"/></svg>',
      clock:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
      checkc:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M8 12l3 3 5-6"/></svg>',
      person:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.6"/><path d="M5.5 20c0-3.6 3-5.6 6.5-5.6s6.5 2 6.5 5.6"/></svg>',
      doc:'<svg viewBox="0 0 24 24"><rect x="5.5" y="3.5" width="13" height="17" rx="2"/><path d="M9 9h6M9 13h6M9 17h4"/></svg>',
      refresh:'<svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 3.5V9h-5.5"/></svg>'
    };
    root.innerHTML = `
      <div class="s2 scene-inner">
        <h1 class="sc-head" style="top:120px;font-size:90px">
          <span class="ln">Stabilize</span>
          <span class="ln accent">what just launched.</span>
        </h1>
        <div class="sc-rule" style="top:306px"></div>
        <p class="sc-sub" style="top:342px;max-width:740px;font-size:28px">Post go live support that brings fast issue triage, reliable admin coverage, and steady momentum across HCM operations.</p>
        <div class="widget s2dash" style="left:88px;top:486px;width:800px;height:322px">
          <div class="w-pad">
            <div class="dash-grid">
              <div class="dash-cell">
                <div class="dc-h">Open cases</div>
                <div class="dc-row"><span class="dc-ic">${di.warn}</span><span class="dc-l">High priority</span><span class="dc-v">3</span><span class="dc-x">›</span></div>
                <div class="dc-row"><span class="dc-ic">${di.clock}</span><span class="dc-l">In progress</span><span class="dc-v">5</span><span class="dc-x">›</span></div>
                <div class="dc-row"><span class="dc-ic">${di.checkc}</span><span class="dc-l">Waiting on customer</span><span class="dc-v">2</span><span class="dc-x">›</span></div>
              </div>
              <div class="dash-cell">
                <div class="dc-h">Priority queue</div>
                <div class="dc-row"><span class="pdot"></span><span class="dc-l">Payroll calculation issue</span><span class="ptag">High</span></div>
                <div class="dc-row"><span class="pdot"></span><span class="dc-l">User access request</span><span class="ptag">High</span></div>
                <div class="dc-row"><span class="pdot med"></span><span class="dc-l">Benefits enrollment error</span><span class="ptag med">Medium</span></div>
              </div>
              <div class="dash-cell">
                <div class="dc-h">Recent activity</div>
                <div class="dc-row"><span class="dc-ic">${di.refresh}</span><span class="dc-l">Payroll run completed successfully</span></div>
                <div class="dc-row"><span class="dc-ic">${di.person}</span><span class="dc-l">Workflow issue resolved</span></div>
                <div class="dc-row"><span class="dc-ic">${di.person}</span><span class="dc-l">User access request completed</span></div>
              </div>
              <div class="dash-cell">
                <div class="dc-h">Admin requests</div>
                <div class="dc-row"><span class="dc-ic">${di.person}</span><span class="dc-l">User access</span></div>
                <div class="dc-row"><span class="dc-ic">${di.doc}</span><span class="dc-l">Report request</span></div>
                <div class="dc-row"><span class="dc-ic">${di.doc}</span><span class="dc-l">Configuration update</span></div>
              </div>
            </div>
          </div>
        </div>
        ${iconRow([
          {s:ICON.person,l:'Admin support'},{s:ICON.kase,l:'Case management'},
          {s:ICON.shield,l:'Issue resolution'},{s:'<path d="M24 44 V24"/><path d="M24 28 C 15 28 9 22 9 13 C 18 13 24 19 24 28 Z"/><path d="M24 24 C 33 24 39 18 39 9 C 30 9 24 15 24 24 Z"/>',l:'Adoption support'}
        ]).replace('class="sc-icons"','class="sc-icons" style="left:88px;top:824px;gap:14px"')}
        <div class="sc-card s2card" style="right:96px;top:150px;width:648px;height:800px">
          <div class="card-pad" style="padding:60px 56px">
            <div class="sc-badge white"><img src="assets/smartcare-logo-transparent.png" alt=""/></div>
            <div class="card-title mode" style="font-size:88px;color:#fff">Stabilize</div>
            <div class="card-underline" style="margin-top:24px"></div>
            <div>${checks(['Triage issues quickly','Support daily admin','Resolve cases with urgency','Restore confidence fast'])}</div>
          </div>
        </div>
      </div>`;
    const tl = gsap.timeline();
    const chars = splitChars($('.sc-head', root));
    gsap.set($('.sc-rule', root), { width:0 });
    gsap.set($('.sc-sub', root), { opacity:0, y:16 });
    popHead(tl, chars, 0.15);
    tl.to($('.sc-rule', root), { width:280, duration:0.8, ease:ease.expo }, 0.9)
      .to($('.sc-sub', root), { opacity:1, y:0, duration:0.7, ease:ease.power3 }, 1.1);
    popCard(tl, $('.sc-card', root), 0.5);
    gsap.set($('.sc-badge', root), { scale:0, rotate:-8, transformOrigin:'50% 50%' });
    tl.to($('.sc-badge', root), { scale:1, rotate:0, duration:0.7, ease:'back.out(1.7)' }, 1.2);
    popChecks(tl, $$('.s2card .check', root), 1.6);
    const w = $('.widget', root);
    gsap.set(w, { opacity:0, y:44, z:-180, rotationX:-12, transformPerspective:1200, transformOrigin:'50% 100%' });
    tl.to(w, { opacity:1, y:0, z:0, rotationX:0, duration:0.9, ease:'back.out(1.3)' }, 1.3);
    gsap.set($$('.dc-h', root), { opacity:0 });
    gsap.set($$('.dc-row', root), { opacity:0, x:-14 });
    tl.to($$('.dc-h', root), { opacity:1, duration:0.4, stagger:0.05, ease:ease.power3 }, 1.6)
      .to($$('.dc-row', root), { opacity:1, x:0, duration:0.4, stagger:0.03, ease:ease.power3 }, 1.7);
    popIcons(tl, $$('.sc-icons .ic', root), 2.3);
    return tl;
  }

  // ═══════════════ SCENE 3 - Optimize ═══════════════
  function scene3(root){
    root.innerHTML = `
      <div class="s3 scene-inner">
        <h1 class="sc-head" style="top:206px;font-size:100px">
          <span class="ln">Optimize the</span>
          <span class="ln accent">system you</span>
          <span class="ln accent">already own.</span>
        </h1>
        <div class="sc-rule" style="top:552px"></div>
        <p class="sc-sub" style="top:598px;max-width:560px">Fine tune workflows, reporting, and configuration to get more from HCM.</p>
        ${iconRow([
          {s:ICON.gear,l:'Configuration'},{s:ICON.bars,l:'Reporting'},
          {s:ICON.workflow,l:'Workflows'},{s:ICON.cleanup,l:'Cleanup'}
        ]).replace('class="sc-icons"','class="sc-icons" style="left:92px;top:790px"')}
        <div class="sc-card" style="right:104px;top:150px;width:600px;height:780px">
          <div class="card-pad">
            <div class="sc-badge"><img src="assets/smartcare-logo-light.png" alt=""/></div>
            <div class="card-title" style="font-size:72px;margin-top:42px"><span class="brand">SmartCare</span><span class="mode">Optimize</span></div>
            <div class="card-underline" style="margin-top:22px"></div>
            <div style="margin-top:56px">${checks(['Refine configuration','Improve reporting','Reduce workflow friction'])}</div>
          </div>
        </div>
      </div>`;
    const tl = gsap.timeline();
    const chars = splitChars($('.sc-head', root));
    gsap.set($('.sc-rule', root), { width:0 });
    gsap.set($('.sc-sub', root), { opacity:0, y:16 });
    popHead(tl, chars, 0.2);
    tl.to($('.sc-rule', root), { width:300, duration:0.8, ease:ease.expo }, 1.0)
      .to($('.sc-sub', root), { opacity:1, y:0, duration:0.7, ease:ease.power3 }, 1.2);
    popCard(tl, $('.sc-card', root), 0.5);
    gsap.set($('.sc-badge', root), { scale:0, transformOrigin:'50% 50%' });
    tl.to($('.sc-badge', root), { scale:1, duration:0.7, ease:'back.out(1.7)' }, 1.2);
    popChecks(tl, $$('.sc-card .check', root), 1.7);
    popIcons(tl, $$('.sc-icons .ic', root), 2.0);
    return tl;
  }

  // ═══════════════ SCENE 4 - Thrive ═══════════════
  function scene4(root){
    root.innerHTML = `
      <div class="s4 scene-inner">
        <h1 class="sc-head" style="top:256px;font-size:116px">
          <span class="ln">Thrive</span>
          <span class="ln accent">beyond support.</span>
        </h1>
        <div class="sc-rule" style="top:512px"></div>
        <p class="sc-sub" style="top:558px;max-width:600px">Turn ongoing support into continuous improvement, better visibility, and stronger HCM performance.</p>
        ${iconRow([
          {s:ICON.insights,l:'Insights'},{s:ICON.gear,l:'Process improvement'},
          {s:ICON.knight,l:'Strategy'},{s:ICON.trendup,l:'Growth'}
        ]).replace('class="sc-icons"','class="sc-icons" style="left:92px;top:790px"')}
        <div class="sc-card" style="right:104px;top:150px;width:600px;height:760px">
          <div class="card-pad">
            <div class="sc-badge"><img src="assets/smartcare-logo-light.png" alt=""/></div>
            <div class="card-title" style="font-size:76px;margin-top:42px"><span class="brand">SmartCare</span><span class="mode">Thrive</span></div>
            <div class="card-underline" style="margin-top:22px"></div>
            <div style="margin-top:56px">${checks(['Drive continuous improvement','Strengthen decision making','Expand platform value'])}</div>
          </div>
        </div>
      </div>`;
    const tl = gsap.timeline();
    const chars = splitChars($('.sc-head', root));
    gsap.set($('.sc-rule', root), { width:0 });
    gsap.set($('.sc-sub', root), { opacity:0, y:16 });
    popHead(tl, chars, 0.2);
    tl.to($('.sc-rule', root), { width:300, duration:0.8, ease:ease.expo }, 1.05)
      .to($('.sc-sub', root), { opacity:1, y:0, duration:0.7, ease:ease.power3 }, 1.25);
    popCard(tl, $('.sc-card', root), 0.5);
    gsap.set($('.sc-badge', root), { scale:0, transformOrigin:'50% 50%' });
    tl.to($('.sc-badge', root), { scale:1, duration:0.7, ease:'back.out(1.7)' }, 1.2);
    popChecks(tl, $$('.sc-card .check', root), 1.7);
    popIcons(tl, $$('.sc-icons .ic', root), 2.0);
    return tl;
  }

  // ═══════════════ SCENE 5 - Summary ═══════════════
  function scene5(root){
    root.innerHTML = `
      <div class="s5 scene-inner">
        <h1 class="sc-head">
          <span class="word">Stabilize.</span> <span class="word accent">Optimize.</span> <span class="word">Thrive.</span>
        </h1>
        <p class="sc-sub">One SmartCare support model for the work that keeps HCM moving after go live.</p>
        <div class="sc-badge tr" style="position:absolute;top:70px;right:96px;width:150px;height:150px"><img src="assets/smartcare-logo-light.png" alt=""/></div>
        <div class="flow">
          <div class="fcard">
            <div class="fnum">01</div>
            <div class="fhead"><div class="ficon"><svg viewBox="0 0 48 48">${ICON.shield}</svg></div><div class="ftitle">Stabilize</div></div>
            <div class="fstit">Secure a strong start</div>
            <div class="fbody">Resolve issues, answer questions, and keep systems running smoothly so your team stays focused after go live.</div>
          </div>
          <span class="farrow" style="left:326px;top:150px">→</span>
          <div class="fcard">
            <div class="fnum">02</div>
            <div class="fhead"><div class="ficon"><svg viewBox="0 0 48 48">${ICON.bars}</svg></div><div class="ftitle">Optimize</div></div>
            <div class="fstit">Work smarter, every day</div>
            <div class="fbody">Refine processes, improve reporting, and streamline workflows to drive efficiency and maximize your HCM investment.</div>
          </div>
          <span class="farrow" style="left:692px;top:150px">→</span>
          <div class="fcard">
            <div class="fnum">03</div>
            <div class="fhead"><div class="ficon"><svg viewBox="0 0 48 48">${ICON.trendup}</svg></div><div class="ftitle">Thrive</div></div>
            <div class="fstit">Evolve and grow</div>
            <div class="fbody">Leverage insights, adopt best practices, and scale with confidence as your organization grows and your needs evolve.</div>
          </div>
        </div>
        <div class="covers">
          <h3>What SmartCare covers</h3>
          <div class="card-underline"></div>
          ${checks(['HRIS admin support','Reporting and issue resolution','Optimization guidance'])}
        </div>
      </div>`;
    const tl = gsap.timeline();
    const words = $$('.sc-head .word', root);
    gsap.set(words, { yPercent:120, opacity:0, z:-260, rotationX:-45, transformPerspective:1000, transformOrigin:'50% 120%' });
    gsap.set($('.sc-sub', root), { opacity:0, y:16 });
    gsap.set($('.sc-badge', root), { scale:0, opacity:0, transformOrigin:'50% 50%' });
    tl.to($('.sc-badge', root), { scale:1, opacity:1, duration:0.8, ease:'back.out(1.6)' }, 0.1)
      .to(words, { yPercent:0, opacity:1, z:0, rotationX:0, duration:0.85, stagger:0.16, ease:'back.out(1.5)' }, 0.25)
      .to($('.sc-sub', root), { opacity:1, y:0, duration:0.7, ease:ease.power3 }, 1.0);
    const fcards = $$('.fcard', root);
    gsap.set(fcards, { opacity:0, y:70, z:-320, rotationX:-40, transformPerspective:1100, transformOrigin:'50% 100%' });
    tl.to(fcards, { opacity:1, y:0, z:0, rotationX:0, duration:0.9, stagger:0.22, ease:'back.out(1.4)' }, 1.2);
    gsap.set($$('.farrow', root), { opacity:0, scale:0.4, transformOrigin:'50% 50%' });
    tl.to($$('.farrow', root), { opacity:1, scale:1, duration:0.5, stagger:0.22, ease:'back.out(2)' }, 1.7);
    const cov = $('.covers', root);
    gsap.set(cov, { opacity:0, x:60, z:-200, rotationY:-18, transformPerspective:1100, transformOrigin:'100% 50%' });
    tl.to(cov, { opacity:1, x:0, z:0, rotationY:0, duration:0.9, ease:'back.out(1.3)' }, 1.5);
    gsap.set($('.covers .card-underline', root), { width:0 });
    tl.to($('.covers .card-underline', root), { width:120, duration:0.6, ease:ease.expo }, 2.1);
    popChecks(tl, $$('.covers .check', root), 2.2);
    return tl;
  }

  // ═══════════════ SCENE 6 - Beautiful Align ending ═══════════════
  function scene6(root){
    root.innerHTML = `
      <div class="s6 scene-inner">
        <div class="end-stage">
          <div class="end-ring r2"></div>
          <div class="end-ring"></div>
          <div class="end-halo"></div>
          <img class="end-heart" src="assets/smartcare-logo-light.png" alt="SmartCare"/>
          <div class="end-kicker">Go-live was just the beginning</div>
          <h1 class="end-tagline"><span class="stab">Stabilize.</span> <span class="opt">Optimize.</span> <span class="thr">Thrive.</span></h1>
          <p class="end-sub">One SmartCare support model that keeps your HCM moving, long after go live.</p>
          <div class="end-lockup">
            <img class="end-align" src="assets/alignhcm-logo-transparent.png" alt="Align HCM"/>
            <div class="end-web">ALIGNHCM<span class="dot">.</span>COM</div>
          </div>
        </div>
      </div>`;
    const tl = gsap.timeline();
    const halo = $('.end-halo', root), rings = $$('.end-ring', root), heart = $('.end-heart', root);
    const kicker = $('.end-kicker', root), words = [$('.stab',root),$('.opt',root),$('.thr',root)];
    const sub = $('.end-sub', root), lockup = $('.end-lockup', root);
    gsap.set(halo, { opacity:0, scale:0.7, transformOrigin:'50% 50%' });
    gsap.set(rings, { opacity:0, scale:0.72, transformOrigin:'50% 50%' });
    gsap.set(heart, { opacity:0, scale:0.5, z:-340, rotationX:-40, transformPerspective:1100, transformOrigin:'50% 60%' });
    gsap.set(kicker, { opacity:0, y:16, letterSpacing:'0.66em' });
    gsap.set(words, { opacity:0, y:70, z:-300, rotationX:-55, transformPerspective:1000, transformOrigin:'50% 120%' });
    gsap.set(sub, { opacity:0, y:20 });
    gsap.set(lockup, { opacity:0, y:28 });
    tl.to(halo, { opacity:1, scale:1, duration:1.8, ease:'power2.out' }, 0.1)
      .to(rings, { opacity:1, scale:1, duration:1.4, stagger:0.12, ease:'power3.out' }, 0.2)
      .to(heart, { opacity:1, scale:1, z:0, rotationX:0, duration:1.0, ease:'back.out(1.5)' }, 0.35)
      .to(kicker, { opacity:1, y:0, letterSpacing:'0.46em', duration:0.9, ease:'power3.out' }, 0.9)
      .to(words, { opacity:1, y:0, z:0, rotationX:0, duration:0.85, stagger:0.16, ease:'back.out(1.6)' }, 1.25)
      .to(sub, { opacity:1, y:0, duration:0.9, ease:'power3.out' }, 2.2)
      .to(lockup, { opacity:1, y:0, duration:0.9, ease:'power3.out' }, 2.7);
    tl.to(rings, { scale:'+=0.03', repeat:-1, yoyo:true, duration:3, ease:'sine.inOut', stagger:0.2 }, 4.2)
      .to(heart, { y:'-=8', repeat:-1, yoyo:true, duration:2.6, ease:'sine.inOut' }, 4.2);
    return tl;
  }

  window.SOTScenes = { scene0, scene1, scene2, scene3, scene4, scene5, scene6 };
})();
