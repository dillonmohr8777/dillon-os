/*
  Ten worlds, one engine.

  Every spec follows the same contract: verified business facts (name, domain
  where a radar brief supplied one, city), a palette pulled from the plate set,
  a world (ground, props, choreography, lighting, particles, panels, camera
  route), and the page copy. Copy describes the trade, never the client — no
  services, prices, hours, staff, or history are asserted anywhere.

  Image provenance: /assets/plates/<slug>/ — synthetic concept plates from the
  agent/momentum-next10-image-system handoff. They are art direction, not
  photographs of the business.
*/

const plates = (slug) => ({
  hero: `/assets/plates/${slug}/hero.webp`,
  hero900: `/assets/plates/${slug}/hero-900.webp`,
  macro: `/assets/plates/${slug}/macro.webp`,
  material: `/assets/plates/${slug}/material.webp`
});

export const SITES = {
  /* ======================================================================
     169 · Germantown Dental Group — ALIGN
     Porcelain planes find their line; steel arrives after calm.
  ====================================================================== */
  "germantown-dental-group": {
    build: 169,
    name: "Germantown Dental Group",
    lockup: ["Germantown", "Dental Group"],
    initials: "GD",
    verb: "ALIGN",
    domain: "germantowndental.us",
    city: "Philadelphia, PA",
    vertical: "General dentistry",
    lens: "50 MM",
    accent: "#8fd8c8",
    accent2: "#2b7f74",
    bg: "#071216",
    plates: plates("germantown-dental-group"),
    heroAlt: "A sculptural dental chair and circular exam light emerging from layered porcelain planes in a dark teal room.",
    world: {
      clear: 0x081419, fog: 0x0e2229, fogDensity: 0.015, exposure: 1.24,
      sky: 0xbfe8df, ground: 0x0a1a1c, ambient: 1.05,
      cold: 0xa8ded2, coldIntensity: 2.9, coldPosition: [-8, 11, 8],
      warm: 0xd9fff2, warmIntensity: 2.2, warmPeak: 9, warmRange: 18, warmPosition: [0.6, 2.6, 1.4], warmRamp: [0.5, 0.86],
      env: { sky: 0x1d4a46, floor: 0x06100f, lamp: 0xcfffe9, cool: 0x9fd8cc, lampUV: [0.66, 0.4], lampPower: 3.2, coolUV: [0.2, 0.3], coolPower: 2.0, intensity: 1.0 },
      bloom: 0.16, plateDistance: 26, platePosition: [0.6, 1.7, -15],
      groundMat: "stone", groundTint: 0x24413f, groundY: -1.75, rootYaw: -0.04,
      beats: { preset: "pushReveal", r: 8.6, h: 2.4, low: 1.05, target: [0.1, -0.3, 0], fov: 33 },
      props: [
        { geo: "box", size: [3.4, 0.22, 2.2], mat: "porcelain", pos: [0, -1.05, 0], from: [-7, 2.2, 0], phase: [0.04, 0.26] },
        { geo: "box", size: [3.0, 0.22, 1.9], mat: "porcelain", pos: [0.15, -0.66, 0.1], from: [7, 2.6, 0], phase: [0.12, 0.36] },
        { geo: "box", size: [2.6, 0.22, 1.6], mat: "porcelain", pos: [0.3, -0.27, 0.2], from: [-6, 3.2, 0], phase: [0.2, 0.46] },
        { geo: "box", size: [2.2, 0.22, 1.3], mat: "ceramicWhite", pos: [0.45, 0.12, 0.3], from: [6, 3.8, 0], phase: [0.28, 0.56] },
        { geo: "cylinder", size: [0.05, 0.05, 2.3, 12], mat: "steel", pos: [-2.5, -0.6, 0.9], rot: [0, 0, 0.5], from: [0, 4.5, 0], phase: [0.44, 0.66] },
        { geo: "cylinder", size: [0.04, 0.04, 1.9, 12], mat: "steel", pos: [-2.1, -0.75, 1.2], rot: [0, 0, 0.62], from: [0, 4.5, 0], phase: [0.5, 0.7] },
        { geo: "torus", size: [0.85, 0.06, 16, 64], mat: "steel", pos: [2.6, 0.9, -0.6], rot: [1.2, 0, 0], from: [0, 3.4, -2], phase: [0.58, 0.8], spin: { axis: "z", speed: 0.12 } },
        { geo: "sphere", size: [0.34, 24, 18], mat: "glow", tint: 0xd9fff2, pos: [2.6, 0.9, -0.6], glow: true, glowRamp: [0.58, 0.86, 0, 0.85] }
      ],
      particles: [{ color: 0xcfffe9, count: 90, spread: [10, 5, 6], seed: 31, size: 0.02, opacity: 0.12, ramp: [0.3, 0.8] }],
    },
    panels: [
      { id: "instruments", src: "macro", label: "Instruments", meta: "Laid out before the first look", size: [3.0, 2.25], position: [-5.6, 1.3, 1.6], rotY: 0.42, in: [0.16, 0.3], out: [0.5, 0.62] },
      { id: "materials", src: "material", label: "Materials", meta: "Porcelain, steel, frosted glass", size: [2.8, 2.1], position: [5.4, 1.5, 2.2], rotY: -0.44, in: [0.56, 0.7], out: [0.9, 1.02] }
    ],
    states: ["Unsettled", "In line", "Instrumented", "Calm"],
    copy: {
      context: "A mouth is an argument between forces. Care is the act of settling it.",
      h1: "Everything in<br />its right line.",
      chapters: [
        { step: "Baseline", state: "Unsettled", title: "First, see what is actually there.", body: "The opening shot holds loose porcelain planes in cool shadow. Nothing is claimed yet — the name and the neighborhood are known; everything clinical stays a question for the chair.", ledger: [["Known", "The practice name and its part of Philadelphia"], ["Held open", "Services, insurance, hours, and availability"]] },
        { step: "Alignment", state: "In line", title: "Order is built one plane at a time.", body: "Layer settles onto layer until the stack reads as a whole. That is the trade: small corrections, in sequence, each one making the next possible." },
        { step: "Instruments", state: "Instrumented", title: "Steel arrives only after the plan.", body: "Tools enter the frame late and deliberately. The order of operations is the difference between treatment and guesswork.", list: ["Name what hurts before anything touches it", "Agree the sequence before the first instrument", "Ask what can wait — and what cannot"] },
        { step: "Source", state: "Calm", title: "The finished frame points back to the real practice.", body: "Use the practice's own site to confirm services, insurance participation, hours, and how they book new patients.", cta: ["Visit the practice site", "https://germantowndental.us"] }
      ],
      sequence: {
        heading: "Six checks between discomfort and a settled mouth.",
        lede: "General dentistry is sequence work. Each stage below exists to make the next one smaller.",
        cards: [
          ["01", "Exam", "Look everywhere, not just where it hurts. The quiet tooth next door is usually the next appointment."],
          ["02", "Imaging", "What enamel hides, film shows. Decisions get made on evidence, not on guesses."],
          ["03", "Plan", "Sequence matters: stabilize first, restore second, perfect last."],
          ["04", "Prevention", "The cheapest dentistry is the visit where nothing needs drilling."],
          ["05", "Restoration", "Match the material to the tooth — porcelain, composite, or metal each earn their place."],
          ["06", "Recall", "A settled mouth stays settled because someone rechecks it on schedule."]
        ]
      },
      brief: [
        "This page is a concept. The imagery is synthetic art direction, the sequence describes how general dentistry is commonly staged, and none of it describes this practice's actual services or results.",
        "Before anything went live we would confirm the real scope with the practice — which treatments they perform in-house versus refer, which insurers they participate with, and how they want new patients to arrive."
      ],
      note: "Nothing here should be read as a claim about Germantown Dental Group's services, insurance participation, pricing, hours, or availability. Those come from the practice.",
      verify: { line: "Confirm everything current directly with the practice.", links: [["Practice site", "https://germantowndental.us"], ["Map", "https://www.google.com/maps/search/?api=1&query=Germantown%20Dental%20Group%20Philadelphia%20PA"]] }
    }
  },

  /* ======================================================================
     170 · Udis & Conn Orthodontics — SHAPE
     An archwire draws through ceramic brackets like a bridge span.
  ====================================================================== */
  "udis-conn-orthodontics": {
    build: 170,
    name: "Udis & Conn Orthodontics",
    lockup: ["Udis & Conn", "Orthodontics"],
    initials: "UC",
    verb: "SHAPE",
    domain: "udisandconnorthodontics.com",
    city: "Jenkintown, PA",
    vertical: "Orthodontics",
    lens: "85 MM",
    accent: "#f2a08c",
    accent2: "#7fa8d8",
    bg: "#070d16",
    plates: plates("udis-conn-orthodontics"),
    heroAlt: "An orthodontic archwire sweeping through suspended ceramic brackets like an architectural span, ink blue field to the left.",
    world: {
      clear: 0x070d16, fog: 0x0c1524, fogDensity: 0.016, exposure: 1.22,
      sky: 0xc4d8f2, ground: 0x0a1220, ambient: 0.95,
      cold: 0x9fc0e8, coldIntensity: 2.8, coldPosition: [-7, 10, 8],
      warm: 0xf2a08c, warmIntensity: 1.8, warmPeak: 7, warmRange: 16, warmPosition: [1.8, 1.6, 1.6], warmRamp: [0.52, 0.88],
      env: { sky: 0x1c2c4a, floor: 0x070a12, lamp: 0xf2b49e, cool: 0x8fb4e0, lampUV: [0.7, 0.44], lampPower: 2.6, coolUV: [0.22, 0.28], coolPower: 2.4, intensity: 1.0 },
      bloom: 0.17, plateDistance: 25, platePosition: [0.5, 1.5, -14],
      groundMat: "stone", groundTint: 0x1c2836, groundY: -1.7, rootYaw: -0.05,
      beats: { preset: "driftLateral", r: 8.2, h: 2.1, low: 1.0, target: [0, -0.15, 0], fov: 32 },
      props: [
        { geo: "box", size: [0.34, 0.4, 0.3], mat: "ceramicWhite", pos: [-2.4, -0.1, 0], from: [0, 3.6, 0], phase: [0.05, 0.24] },
        { geo: "box", size: [0.34, 0.4, 0.3], mat: "ceramicWhite", pos: [-1.2, 0.14, 0.1], from: [0, 4.0, 0], phase: [0.1, 0.3] },
        { geo: "box", size: [0.34, 0.4, 0.3], mat: "ceramicWhite", pos: [0, 0.26, 0.16], from: [0, 4.4, 0], phase: [0.15, 0.36] },
        { geo: "box", size: [0.34, 0.4, 0.3], mat: "ceramicWhite", pos: [1.2, 0.14, 0.1], from: [0, 4.0, 0], phase: [0.2, 0.42] },
        { geo: "box", size: [0.34, 0.4, 0.3], mat: "ceramicWhite", pos: [2.4, -0.1, 0], from: [0, 3.6, 0], phase: [0.25, 0.48] },
        { geo: "tube", pts: [[-3.4, -0.5, -0.1], [-2.4, 0.02, 0.02], [-1.2, 0.3, 0.12], [0, 0.44, 0.18], [1.2, 0.3, 0.12], [2.4, 0.02, 0.02], [3.4, -0.5, -0.1]], r: 0.035, mat: "steel", pos: [0, 0, 0], from: [-9, 0, 0], phase: [0.36, 0.62] },
        { geo: "torus", size: [0.16, 0.045, 14, 40], mat: "ceramicWhite", tint: 0xf2a08c, pos: [-1.2, 0.14, 0.32], from: [0, 0, 2.4], phase: [0.6, 0.74], fadeIn: true, spin: { axis: "z", speed: 0.4 } },
        { geo: "torus", size: [0.16, 0.045, 14, 40], mat: "ceramicWhite", tint: 0xf2a08c, pos: [1.2, 0.14, 0.32], from: [0, 0, 2.4], phase: [0.66, 0.8], fadeIn: true, spin: { axis: "z", speed: -0.35 } }
      ],
      particles: [{ color: 0xcfe2ff, count: 70, spread: [9, 4.5, 5], seed: 41, size: 0.018, opacity: 0.1, ramp: [0.25, 0.75] }],
    },
    panels: [
      { id: "adjustment", src: "macro", label: "Adjustment", meta: "Plier, bracket, coiled wire", size: [2.9, 2.2], position: [-5.4, 1.35, 1.8], rotY: 0.44, in: [0.14, 0.28], out: [0.5, 0.62] },
      { id: "hardware", src: "material", label: "Hardware", meta: "Ceramic, silver wire, elastics", size: [2.7, 2.05], position: [5.2, 1.45, 2.3], rotY: -0.46, in: [0.58, 0.72], out: [0.92, 1.02] }
    ],
    states: ["Scattered", "Seated", "Tensioned", "Held"],
    copy: {
      context: "Teeth do not move because they are pushed. They move because they are held, gently, for a long time.",
      h1: "Force, applied<br />with patience.",
      chapters: [
        { step: "Brackets", state: "Scattered", title: "Every piece is placed before anything moves.", body: "Ceramic brackets settle one by one into a span. Placement is the whole game — a millimeter of error at the start becomes a month at the end.", ledger: [["Known", "The practice name and its Jenkintown address area"], ["Held open", "Treatment options, timelines, pricing, and availability"]] },
        { step: "The wire", state: "Seated", title: "One wire carries the entire plan.", body: "The archwire slides through every bracket and takes tension. From here the system works around the clock, quietly, whether anyone watches or not." },
        { step: "Tension", state: "Tensioned", title: "Small forces, long durations, honest physics.", body: "Elastics arrive late and tune the load. Orthodontics is not an event — it is a held position that biology slowly agrees with.", list: ["Ask what is moving and why", "Ask what the wire changes this visit", "Ask what happens if an elastic is skipped"] },
        { step: "Source", state: "Held", title: "The finished frame points back to the real practice.", body: "Use the practice's own site to confirm consult availability, treatment options, and what a first visit involves.", cta: ["Visit the practice site", "https://udisandconnorthodontics.com"] }
      ],
      sequence: {
        heading: "Six decisions between a first consult and a finished smile.",
        lede: "Orthodontics compresses years of biology into a plan. These are the moments where the plan is actually made.",
        cards: [
          ["01", "Records", "Photos, scans, and a bite that gets measured, not eyeballed."],
          ["02", "Plan", "Where each tooth ends up — and the order they travel in."],
          ["03", "Placement", "Brackets bonded to positions chosen tooth by tooth."],
          ["04", "Activation", "The first wire goes in light. Force arrives gradually, on purpose."],
          ["05", "Adjustment", "Visits that read progress and re-tension the system."],
          ["06", "Retention", "The quiet phase that decides whether the work holds for decades."]
        ]
      },
      brief: [
        "This page is a concept. The imagery is synthetic art direction, the sequence describes how orthodontic treatment is commonly staged, and none of it describes this practice's actual methods or results.",
        "Before anything went live we would confirm the real scope with the practice — which appliance systems they offer, how they schedule consults, and what they want families to know first."
      ],
      note: "Nothing here should be read as a claim about Udis & Conn Orthodontics' treatments, pricing, timelines, hours, or availability. Those come from the practice.",
      verify: { line: "Confirm everything current directly with the practice.", links: [["Practice site", "https://udisandconnorthodontics.com"], ["Map", "https://www.google.com/maps/search/?api=1&query=Udis%20%26%20Conn%20Orthodontics%20Jenkintown%20PA"]] }
    }
  },

  /* ======================================================================
     171 · Jarman Sales & Service — BALANCE
     Copper serpentines and a condenser fan assemble; heat meets cold.
  ====================================================================== */
  "jarman-sales-service": {
    build: 171,
    name: "Jarman Sales & Service, Inc",
    lockup: ["Jarman", "Sales & Service"],
    initials: "JS",
    verb: "BALANCE",
    domain: "jarmanairconditioning.com",
    city: "Philadelphia, PA",
    vertical: "Heating & cooling",
    lens: "35 MM",
    accent: "#f0a05a",
    accent2: "#6fb6c8",
    bg: "#0a1014",
    plates: plates("jarman-sales-service"),
    heroAlt: "Copper refrigeration coils and a condenser fan assembling into a hovering airflow machine, cool blue to warm amber.",
    world: {
      clear: 0x0a1014, fog: 0x12202a, fogDensity: 0.017, exposure: 1.2,
      sky: 0xbfe0ea, ground: 0x121012, ambient: 0.95,
      cold: 0x9fd2e4, coldIntensity: 2.7, coldPosition: [-9, 10, 7],
      warm: 0xf0a05a, warmIntensity: 2.2, warmPeak: 10, warmRange: 20, warmPosition: [2.2, 0.4, 1.8], warmRamp: [0.5, 0.84],
      env: { sky: 0x27424e, floor: 0x0b0d0e, lamp: 0xf2b070, cool: 0x8fc8dc, lampUV: [0.74, 0.5], lampPower: 3.0, coolUV: [0.2, 0.26], coolPower: 2.4, intensity: 1.0 },
      bloom: 0.18, plateDistance: 27, platePosition: [0.4, 1.9, -16],
      groundMat: "stone", groundTint: 0x272425, groundY: -1.75, rootYaw: -0.07,
      beats: { preset: "orbitArc", r: 9.2, h: 2.5, low: 1.15, target: [0.1, -0.25, 0], fov: 34 },
      props: [
        { geo: "tube", pts: [[-2.6, -1.2, 0.6], [-2.6, -0.5, 0.6], [-1.4, -0.5, 0.6], [-1.4, -1.15, 0.6], [-0.2, -1.15, 0.6], [-0.2, -0.5, 0.6]], r: 0.09, mat: "copper", pos: [0, 0, 0], from: [-7, 0, 0], phase: [0.06, 0.3] },
        { geo: "tube", pts: [[0.4, -0.5, 0.6], [0.4, -1.15, 0.6], [1.6, -1.15, 0.6], [1.6, -0.5, 0.6], [2.8, -0.5, 0.6], [2.8, -1.2, 0.6]], r: 0.09, mat: "copper", pos: [0, 0, 0], from: [7, 0, 0], phase: [0.14, 0.38] },
        { geo: "box", size: [2.5, 2.1, 1.5], mat: "darkSteel", pos: [0.1, -0.55, -0.7], from: [0, -4.2, 0], phase: [0.26, 0.5] },
        { geo: "torus", size: [1.05, 0.06, 14, 72], mat: "steel", pos: [0.1, 0.1, 0.14], from: [0, 3.6, 0], phase: [0.44, 0.64] },
        { geo: "cylinder", size: [0.16, 0.16, 0.22, 20], mat: "darkSteel", pos: [0.1, 0.1, 0.14], rot: [1.5708, 0, 0], from: [0, 3.6, 0], phase: [0.46, 0.66] },
        { geo: "ring", size: [0.6, 0.17, 1.7], mat: "steel", tint: 0xb7bfc7, pos: [0.1, 0.1, 0.14], from: [0, 3.6, 0], phase: [0.48, 0.66], spin: { axis: "z", speed: 3.4, ramp: [0.58, 0.86] } },
        { geo: "ring", size: [0.6, 0.17, 1.7], mat: "steel", tint: 0xb7bfc7, pos: [0.1, 0.1, 0.14], rot: [0, 0, 2.094], from: [0, 3.6, 0], phase: [0.48, 0.66], spin: { axis: "z", speed: 3.4, ramp: [0.58, 0.86] } },
        { geo: "ring", size: [0.6, 0.17, 1.7], mat: "steel", tint: 0xb7bfc7, pos: [0.1, 0.1, 0.14], rot: [0, 0, 4.188], from: [0, 3.6, 0], phase: [0.48, 0.66], spin: { axis: "z", speed: 3.4, ramp: [0.58, 0.86] } },
        { geo: "cylinder", size: [0.32, 0.32, 1.1, 24], mat: "copper", pos: [2.4, -1.15, -0.4], from: [0, -3, 0], phase: [0.52, 0.72] },
        { geo: "sphere", size: [0.28, 24, 18], mat: "glow", tint: 0xffb46a, pos: [2.4, -0.5, -0.4], glow: true, glowRamp: [0.55, 0.85, 0, 0.9], pulse: 1.6 }
      ],
      particles: [
        { color: 0xd8f2fa, count: 80, spread: [8, 4, 5], seed: 51, size: 0.03, opacity: 0.12, ramp: [0.2, 0.6], position: [-2.5, 1.2, 0.5], driftSpeed: 0.03 },
        { color: 0xffc98a, count: 60, spread: [4, 3, 3], seed: 52, size: 0.035, opacity: 0.14, ramp: [0.6, 0.9], position: [2.4, 0.6, 0], riseSpeed: 0.5 }
      ],
    },
    panels: [
      { id: "gauges", src: "macro", label: "Gauges", meta: "Pressure tells the truth", size: [3.1, 2.35], position: [-5.8, 1.4, 1.7], rotY: 0.42, in: [0.16, 0.3], out: [0.52, 0.64] },
      { id: "coil", src: "material", label: "Coil", meta: "Copper, fins, condensation", size: [2.9, 2.2], position: [5.6, 1.5, 2.4], rotY: -0.44, in: [0.58, 0.72], out: [0.92, 1.02] }
    ],
    states: ["Split", "Connected", "Spinning", "Balanced"],
    copy: {
      context: "Comfort is a temperature argument between inside and outside. Somebody has to referee it.",
      h1: "Heat moved,<br />not made.",
      chapters: [
        { step: "Two sides", state: "Split", title: "Every system is a hot side and a cold side.", body: "Copper lines assemble in from both edges of the frame. Refrigeration never destroys heat — it relocates it, and the craft is in the route.", ledger: [["Known", "The company name and its Philadelphia service area"], ["Held open", "Brands carried, service scope, pricing, and scheduling"]] },
        { step: "The loop", state: "Connected", title: "A sealed loop, or nothing.", body: "The cabinet rises to meet the linework. One weak joint anywhere and the whole argument leaks out over a summer." },
        { step: "Airflow", state: "Spinning", title: "The fan is the only part the ear ever meets.", body: "The condenser spins up late, when the loop deserves it. Airflow is where oversized promises get tested against duct reality.", list: ["Ask what the load calculation found", "Ask where the refrigerant lines run", "Ask what maintenance the warranty expects"] },
        { step: "Source", state: "Balanced", title: "The finished frame points back to the real company.", body: "Use the company's own site to confirm what they install and service, and how they schedule work.", cta: ["Visit the company site", "https://jarmanairconditioning.com"] }
      ],
      sequence: {
        heading: "Six stages between a hot room and a balanced one.",
        lede: "HVAC work is sizing, routing, and commissioning. The equipment is the easy part.",
        cards: [
          ["01", "Load", "The room is measured, not guessed. Equipment gets sized to the building it actually serves."],
          ["02", "Route", "Where lines and ducts can run decides half the install quality."],
          ["03", "Set", "The unit lands level, drained, and serviceable — future visits are designed in now."],
          ["04", "Braze & pull", "Joints sealed, system evacuated. The vacuum gauge decides when it is done."],
          ["05", "Charge", "Refrigerant by the numbers on the gauges, not by feel."],
          ["06", "Commission", "Temperatures verified at the registers, where comfort actually happens."]
        ]
      },
      brief: [
        "This page is a concept. The imagery is synthetic art direction, the sequence describes how HVAC work is commonly staged, and none of it describes this company's actual installations.",
        "Before anything went live we would confirm the real scope with the company — brands they carry, whether they run service plans, and how they want calls to arrive."
      ],
      note: "Nothing here should be read as a claim about Jarman Sales & Service's offerings, licensing, pricing, hours, or availability. Those come from the company.",
      verify: { line: "Confirm everything current directly with the company.", links: [["Company site", "https://jarmanairconditioning.com"], ["Map", "https://www.google.com/maps/search/?api=1&query=Jarman%20Sales%20%26%20Service%20Philadelphia%20PA"]] }
    }
  },

  /* ======================================================================
     172 · Lee's Hoagie House — STACK
     Strata drop onto a deli counter; the stack becomes architecture.
  ====================================================================== */
  "lees-hoagie-house": {
    build: 172,
    name: "Lee's Hoagie House",
    lockup: ["Lee's", "Hoagie House"],
    initials: "LH",
    verb: "STACK",
    domain: "leeshoagieshorsham.com",
    city: "Horsham, PA",
    vertical: "Hoagies & sandwiches",
    lens: "50 MM",
    accent: "#e8b84a",
    accent2: "#c8452e",
    bg: "#120c08",
    plates: plates("lees-hoagie-house"),
    heroAlt: "A monumental hoagie cross-section on a dark deli counter, crust and layered ingredients lit like a landscape.",
    world: {
      clear: 0x120c08, fog: 0x1e1410, fogDensity: 0.017, exposure: 1.26,
      sky: 0xf2d8b4, ground: 0x1a0f08, ambient: 1.0,
      cold: 0xc8b49a, coldIntensity: 2.2, coldPosition: [-7, 10, 8],
      warm: 0xffb45a, warmIntensity: 2.6, warmPeak: 11, warmRange: 20, warmPosition: [1.4, 1.4, 1.8], warmRamp: [0.42, 0.8],
      env: { sky: 0x4a3018, floor: 0x140b06, lamp: 0xffc27a, cool: 0xc8b49a, lampUV: [0.68, 0.46], lampPower: 3.6, coolUV: [0.18, 0.3], coolPower: 1.6, intensity: 1.05 },
      bloom: 0.18, plateDistance: 26, platePosition: [0.5, 1.6, -15],
      groundMat: "wood", groundTint: 0x2a1c10, groundY: -1.72, rootYaw: -0.05,
      beats: { preset: "craneDown", r: 8.8, h: 3.4, low: 1.05, target: [0.1, -0.5, 0], fov: 34 },
      props: [
        { geo: "box", size: [4.6, 0.5, 2.0], mat: "bread", pos: [0, -1.3, 0], from: [0, 4.6, 0], phase: [0.04, 0.22] },
        { geo: "box", size: [4.3, 0.16, 1.8], mat: "paper", tint: 0xd8b490, pos: [0.05, -0.97, 0.02], from: [-6.5, 1.2, 0], phase: [0.14, 0.32] },
        { geo: "box", size: [4.2, 0.14, 1.75], mat: "paper", tint: 0xd9c49a, pos: [0.1, -0.82, 0.04], from: [6.5, 1.4, 0], phase: [0.22, 0.4] },
        { geo: "box", size: [4.1, 0.12, 1.7], mat: "cloth", tint: 0x5e7040, pos: [0.14, -0.7, 0.06], from: [-6, 1.8, 0], phase: [0.3, 0.48] },
        { geo: "box", size: [4.0, 0.14, 1.65], mat: "cloth", tint: 0x9a3a2c, pos: [0.18, -0.57, 0.08], from: [6, 2.0, 0], phase: [0.38, 0.56] },
        { geo: "box", size: [4.2, 0.42, 1.8], mat: "bread", tint: 0xa86f3c, pos: [0.22, -0.3, 0.1], from: [0, 4.2, 0], phase: [0.5, 0.7], arcLift: 0.5 },
        { geo: "cylinder", size: [0.045, 0.045, 1.6, 10], mat: "wood", tint: 0x8a5c30, pos: [1.9, 0.15, 0.5], rot: [0, 0, 0.5], from: [0, 3, 0], phase: [0.66, 0.82] }
      ],
      particles: [{ color: 0xffd9a0, count: 90, spread: [9, 5, 6], seed: 61, size: 0.024, opacity: 0.14, ramp: [0.3, 0.8] }],
    },
    panels: [
      { id: "the-build", src: "macro", label: "The build", meta: "Meat, sharp provolone, oil", size: [3.1, 2.35], position: [-5.7, 1.35, 1.7], rotY: 0.44, in: [0.16, 0.3], out: [0.52, 0.64] },
      { id: "strata", src: "material", label: "Strata", meta: "Crust, fold, pepper, paper", size: [2.9, 2.2], position: [5.5, 1.45, 2.3], rotY: -0.44, in: [0.6, 0.74], out: [0.92, 1.02] }
    ],
    states: ["Bare", "Layered", "Capped", "Wrapped"],
    copy: {
      context: "A hoagie is architecture you can hold. The order of the layers is the whole building code.",
      h1: "Built in layers,<br />eaten in seconds.",
      chapters: [
        { step: "The roll", state: "Bare", title: "Everything stands on the bread.", body: "The roll drops first and alone. If the crust is wrong, nothing stacked on it can save the build — that rule never changes.", ledger: [["Known", "The shop name and its Horsham storefront"], ["Held open", "Menu, prices, hours, and what sells out"]] },
        { step: "Strata", state: "Layered", title: "Each layer earns its position.", body: "Meat below cheese, cheese below the wet ingredients, oil last. The sequence is not tradition for its own sake — it keeps the bottom dry and the bite even." },
        { step: "The cap", state: "Capped", title: "Closing it is a commitment.", body: "The top settles like a roof. From here the build is judged in cross-section — every layer visible, every shortcut on display.", list: ["Ask what bread arrives fresh that morning", "Ask which build the counter is proudest of", "Ask what to order for a first visit"] },
        { step: "Source", state: "Wrapped", title: "The finished frame points back to the real shop.", body: "Use the shop's own site for the actual menu, hours, and ordering.", cta: ["See the real menu", "https://leeshoagieshorsham.com"] }
      ],
      sequence: {
        heading: "Six calls a counter makes before noon.",
        lede: "A sandwich shop is a supply chain with a lunch rush at the end. These are the decisions underneath it.",
        cards: [
          ["01", "Bread", "Ordered against tomorrow's weather and today's count. Stale rolls end businesses."],
          ["02", "Slice", "Meat and cheese cut to thickness that folds, not flops."],
          ["03", "Mise", "Lettuce shredded, tomatoes drained, onions cried over before eleven."],
          ["04", "Build", "The order of layers, kept identical a hundred times a day."],
          ["05", "Wrap", "Tight paper is structural. A loose wrap unbuilds the sandwich."],
          ["06", "The line", "Speed at the counter is mise en place made visible."]
        ]
      },
      brief: [
        "This page is a concept. The imagery is synthetic art direction, the sequence describes how a hoagie counter commonly runs, and none of it is this shop's actual menu or recipe.",
        "Before anything went live we would confirm the real menu, the story the family wants told, and the photography the shop would actually stand behind."
      ],
      note: "Nothing here should be read as a claim about Lee's Hoagie House's menu, prices, sourcing, hours, or availability. Those come from the shop.",
      verify: { line: "Confirm everything current directly with the shop.", links: [["Shop site", "https://leeshoagieshorsham.com"], ["Map", "https://www.google.com/maps/search/?api=1&query=Lee%27s%20Hoagie%20House%20Horsham%20PA"]] }
    }
  },

  /* ======================================================================
     173 · Anthony Gueriera Jr. Insurance — COVER
     Paper shields orbit a brass key and settle into cover.
  ====================================================================== */
  "anthony-gueriera-insurance": {
    build: 173,
    name: "Anthony Gueriera Jr. Insurance Agency LLC",
    lockup: ["Gueriera", "Insurance Agency"],
    initials: "AG",
    verb: "COVER",
    domain: "broomallinsuranceagency.com",
    city: "Broomall, PA",
    vertical: "Independent insurance",
    lens: "50 MM",
    accent: "#c8a860",
    accent2: "#4a7a5c",
    bg: "#0a120d",
    plates: plates("anthony-gueriera-insurance"),
    heroAlt: "A brass key, house silhouette, and layered protective paper orbiting a calm void on bottle green.",
    world: {
      clear: 0x0a120d, fog: 0x122018, fogDensity: 0.016, exposure: 1.2,
      sky: 0xd8e2c8, ground: 0x0c140e, ambient: 0.95,
      cold: 0xb4ccb4, coldIntensity: 2.4, coldPosition: [-8, 10, 8],
      warm: 0xe8c884, warmIntensity: 2.0, warmPeak: 8, warmRange: 18, warmPosition: [1.6, 2.2, 1.6], warmRamp: [0.5, 0.86],
      env: { sky: 0x2a4634, floor: 0x0a0f0a, lamp: 0xf0d49a, cool: 0xa8c8a8, lampUV: [0.7, 0.42], lampPower: 2.8, coolUV: [0.2, 0.3], coolPower: 1.8, intensity: 1.0 },
      bloom: 0.15, plateDistance: 25, platePosition: [0.5, 1.5, -14],
      groundMat: "cloth", groundTint: 0x1c3024, groundY: -1.7, rootYaw: -0.04,
      beats: { preset: "pushReveal", r: 8.4, h: 2.3, low: 1.0, target: [0, -0.2, 0], fov: 33 },
      props: [
        { geo: "torus", size: [0.5, 0.09, 16, 56], mat: "brass", pos: [0, -0.1, 0], rot: [0, 0, 1.5708], from: [0, 3.8, 0], phase: [0.05, 0.26], spin: { axis: "x", speed: 0.14 } },
        { geo: "box", size: [0.16, 0.9, 0.09], mat: "brass", pos: [0, -0.85, 0], from: [0, 3.8, 0], phase: [0.05, 0.26] },
        { geo: "box", size: [0.34, 0.14, 0.09], mat: "brass", pos: [0.1, -1.2, 0], from: [0, 3.8, 0], phase: [0.08, 0.28] },
        { geo: "plane", size: [2.6, 3.3], mat: "paper", pos: [-1.7, 0.1, -0.9], rot: [0, 0.5, 0.02], from: [-5, 0.4, -2], phase: [0.24, 0.46], opacity: 0.94, fadeIn: true },
        { geo: "plane", size: [2.3, 3.0], mat: "paper", tint: 0xd9cfae, pos: [1.8, 0.05, -0.5], rot: [0, -0.55, -0.02], from: [5, 0.5, -2], phase: [0.34, 0.56], opacity: 0.94, fadeIn: true },
        { geo: "plane", size: [2.0, 2.6], mat: "paper", tint: 0xcabf9e, pos: [0.2, 0.15, -1.4], rot: [0, 0.05, 0.01], from: [0, 4.4, -1], phase: [0.44, 0.66], opacity: 0.94, fadeIn: true },
        { geo: "box", size: [1.5, 0.95, 0.08], mat: "darkSteel", tint: 0x2e3c33, pos: [-2.4, -1.15, 0.9], rot: [0, 0.4, 0], from: [-4, 0, 2], phase: [0.56, 0.76] },
        { geo: "cone", size: [0.6, 0.5, 4], mat: "darkSteel", tint: 0x2e3c33, pos: [-2.4, -0.42, 0.9], rot: [0, 0.4, 0], from: [-4, 0.4, 2], phase: [0.6, 0.8] }
      ],
      particles: [{ color: 0xe8dcae, count: 70, spread: [9, 4.5, 5], seed: 71, size: 0.02, opacity: 0.1, ramp: [0.3, 0.8] }],
    },
    panels: [
      { id: "the-desk", src: "macro", label: "The desk", meta: "Folders, key, calculator", size: [3.0, 2.25], position: [-5.5, 1.3, 1.7], rotY: 0.42, in: [0.15, 0.29], out: [0.5, 0.62] },
      { id: "boundaries", src: "material", label: "Boundaries", meta: "Embossed paper, brass, graphite", size: [2.8, 2.1], position: [5.4, 1.45, 2.3], rotY: -0.44, in: [0.58, 0.72], out: [0.92, 1.02] }
    ],
    states: ["Exposed", "Sheltered", "Documented", "Covered"],
    copy: {
      context: "Insurance is a promise measured in paper. The craft is knowing which paper, before the bad day.",
      h1: "What holds<br />when it happens.",
      chapters: [
        { step: "The key", state: "Exposed", title: "Everything owned is a thing that can be lost.", body: "A brass key hangs alone in the opening frame — the house, the car, the small business behind it. Nothing is protected yet.", ledger: [["Known", "The agency name and its Broomall office area"], ["Held open", "Carriers, lines written, quotes, and availability"]] },
        { step: "Layers", state: "Sheltered", title: "Coverage arrives in overlapping sheets.", body: "Paper planes settle around the key, one exposure at a time. Independent agents work like this: match the layer to the risk, not the risk to a single carrier's shelf." },
        { step: "The gaps", state: "Documented", title: "What is not written is not covered.", body: "The last sheet closes the set. The difference between agents is in the questions asked before binding — the exclusions found early, not discovered at claim time.", list: ["Ask what the policy excludes, in plain words", "Ask what changed since last renewal", "Ask which claims scenarios were priced in"] },
        { step: "Source", state: "Covered", title: "The finished frame points back to the real agency.", body: "Use the agency's own site to confirm what they write and how they quote.", cta: ["Visit the agency site", "https://broomallinsuranceagency.com"] }
      ],
      sequence: {
        heading: "Six questions an independent agent settles before binding.",
        lede: "The paperwork is the product. These are the checks that make it worth the paper.",
        cards: [
          ["01", "Exposure", "What can actually go wrong here — house, auto, business, umbrella."],
          ["02", "Valuation", "Rebuild cost is not market price. The number has to survive a bad year."],
          ["03", "Market", "An independent shop quotes across carriers instead of defending one."],
          ["04", "Exclusions", "The policy is what it excludes. Read that part twice."],
          ["05", "Bind", "Coverage starts when it is bound, not when it is discussed."],
          ["06", "Review", "Every renewal is a chance to re-fit the coverage to a changed life."]
        ]
      },
      brief: [
        "This page is a concept. The imagery is synthetic art direction, the sequence describes how independent insurance work is commonly staged, and none of it describes this agency's actual carriers or policies.",
        "Before anything went live we would confirm the real scope with the agency — lines written, carriers represented, and how they want quote requests to arrive."
      ],
      note: "Nothing here should be read as a claim about Anthony Gueriera Jr. Insurance Agency's carriers, coverage, pricing, hours, or availability. Those come from the agency.",
      verify: { line: "Confirm everything current directly with the agency.", links: [["Agency site", "https://broomallinsuranceagency.com"], ["Map", "https://www.google.com/maps/search/?api=1&query=Anthony%20Gueriera%20Insurance%20Broomall%20PA"]] }
    }
  },

  /* ======================================================================
     174 · Bàn Bàn Asian Bistro — IGNITE
     A black ceramic bowl, chopsticks, flame and steam.
  ====================================================================== */
  "ban-ban-asian-bistro": {
    build: 174,
    name: "Bàn Bàn Asian Bistro",
    lockup: ["Bàn Bàn", "Asian Bistro"],
    initials: "BB",
    verb: "IGNITE",
    domain: "banbanasianbistro.net",
    city: "Philadelphia area",
    vertical: "Asian bistro",
    lens: "50 MM",
    accent: "#e85838",
    accent2: "#f2c84a",
    bg: "#120808",
    plates: plates("ban-ban-asian-bistro"),
    heroAlt: "A black ceramic bowl, chopstick geometry, hibachi flame and curling steam staged like night-market theatre.",
    world: {
      clear: 0x120808, fog: 0x201010, fogDensity: 0.018, exposure: 1.24,
      sky: 0xf2c8a8, ground: 0x160a08, ambient: 0.95,
      cold: 0xc89a8a, coldIntensity: 2.2, coldPosition: [-7, 10, 8],
      warm: 0xff7a48, warmIntensity: 2.8, warmPeak: 12, warmRange: 18, warmPosition: [0.8, 0.6, 1.4], warmRamp: [0.4, 0.78],
      env: { sky: 0x48201a, floor: 0x120806, lamp: 0xff9a5a, cool: 0xc89a8a, lampUV: [0.66, 0.48], lampPower: 3.8, coolUV: [0.2, 0.3], coolPower: 1.5, intensity: 1.05 },
      bloom: 0.22, plateDistance: 25, platePosition: [0.5, 1.5, -14],
      groundMat: "ceramicBlack", groundTint: 0x16090b, groundY: -1.7, rootYaw: -0.05,
      beats: { preset: "orbitArc", r: 8.2, h: 2.2, low: 0.95, target: [0, -0.35, 0], fov: 33 },
      props: [
        { geo: "cylinder", size: [1.5, 1.0, 0.9, 40], mat: "ceramicBlack", pos: [0, -1.0, 0], from: [0, 4.2, 0], phase: [0.05, 0.28] },
        { geo: "torus", size: [1.48, 0.07, 16, 72], mat: "ceramicBlack", tint: 0x241417, pos: [0, -0.56, 0], rot: [1.5708, 0, 0], from: [0, 4.2, 0], phase: [0.08, 0.3] },
        { geo: "cylinder", size: [0.035, 0.025, 2.4, 10], mat: "wood", tint: 0x9a6a3a, pos: [1.7, -0.25, 0.7], rot: [0, 0, 0.9], from: [4, 1.6, 0], phase: [0.3, 0.5] },
        { geo: "cylinder", size: [0.035, 0.025, 2.4, 10], mat: "wood", tint: 0x9a6a3a, pos: [1.85, -0.32, 0.55], rot: [0, 0, 0.98], from: [4.4, 1.8, 0], phase: [0.34, 0.54] },
        { geo: "cone", size: [0.34, 1.0, 20, true], mat: "glow", tint: 0xff8a3a, pos: [0, -0.1, 0], glow: true, glowRamp: [0.42, 0.7, 0, 0.34], pulse: 2.6 },
        { geo: "cone", size: [0.17, 0.66, 16, true], mat: "glow", tint: 0xffd24a, pos: [0.04, 0.08, 0], glow: true, glowRamp: [0.48, 0.74, 0, 0.5], pulse: 3.4 },
        { geo: "torus", size: [2.3, 0.025, 10, 72], mat: "brass", tint: 0x8a4a2a, pos: [0, -1.55, 0], rot: [1.5708, 0, 0], from: [0, 0, 0], phase: [0.6, 0.8], fadeIn: true, opacity: 0.8, spin: { axis: "z", speed: 0.1 } }
      ],
      particles: [
        { color: 0xffd8b4, count: 110, spread: [3.5, 4.5, 3], seed: 81, size: 0.05, opacity: 0.2, ramp: [0.45, 0.8], position: [0, 1.4, 0], riseSpeed: 0.6, driftSpeed: 0.05 },
        { color: 0xff9a5a, count: 60, spread: [2.5, 3, 2.5], seed: 82, size: 0.02, opacity: 0.25, ramp: [0.5, 0.85], position: [0, 0.4, 0], driftSpeed: 0.09 }
      ],
    },
    panels: [
      { id: "the-pass", src: "macro", label: "The pass", meta: "Scallion, sesame, heat", size: [3.0, 2.25], position: [-5.5, 1.35, 1.7], rotY: 0.44, in: [0.16, 0.3], out: [0.52, 0.64] },
      { id: "glaze", src: "material", label: "Glaze", meta: "Lacquer, chili oil, steam", size: [2.8, 2.1], position: [5.4, 1.45, 2.3], rotY: -0.44, in: [0.6, 0.74], out: [0.92, 1.02] }
    ],
    states: ["Cold", "Set", "Lit", "Served"],
    copy: {
      context: "A bistro kitchen is a theatre where the fire is the lead and everything else is timing.",
      h1: "Fire, timed<br />to the second.",
      chapters: [
        { step: "The bowl", state: "Cold", title: "It starts dark, cold, and precise.", body: "A black ceramic bowl lands on a bare counter. Before service there is only geometry — the bowl, the sticks, the station. The theatre needs its stage set exactly.", ledger: [["Known", "The bistro name and its online ordering domain"], ["Held open", "Menu, prices, hours, and seating"]] },
        { step: "The station", state: "Set", title: "Mise en place is the recipe.", body: "Chopsticks slide in at their working angle. In a wok kitchen the cooking is seconds long — all of the craft happens in the arrangement before the flame." },
        { step: "The flame", state: "Lit", title: "Heat is an ingredient with a schedule.", body: "The burner catches and steam lifts. Wok hei is not a flavor added at the end — it is what happens when fire, oil and timing agree for one breath.", list: ["Ask what the kitchen is proudest of at full heat", "Ask what arrives fresh that morning", "Ask what to order on a first visit"] },
        { step: "Source", state: "Served", title: "The finished frame points back to the real bistro.", body: "Use the bistro's own site for the actual menu, hours, and ordering.", cta: ["See the real menu", "https://banbanasianbistro.net"] }
      ],
      sequence: {
        heading: "Six beats between a cold wok and a served table.",
        lede: "Bistro cooking compresses hours of preparation into seconds of fire. The sequence is the discipline.",
        cards: [
          ["01", "Prep", "Everything cut, sauced, and staged before the first order fires."],
          ["02", "Heat", "The wok comes up until oil shimmers — temperature is a visual call."],
          ["03", "Sequence", "Aromatics, protein, vegetables, sauce. The order is the recipe."],
          ["04", "Breath", "The toss that puts flame into the pan for one controlled second."],
          ["05", "Finish", "Scallion, sesame, oil — the last five seconds decide the plate."],
          ["06", "The pass", "Hot food moves now. A minute under the lamp undoes the fire."]
        ]
      },
      brief: [
        "This page is a concept. The imagery is synthetic art direction, the sequence describes how wok-driven kitchens commonly run, and none of it is this bistro's actual menu or kitchen.",
        "Before anything went live we would confirm the real menu, the dishes the kitchen wants to lead with, and photography the bistro would stand behind."
      ],
      note: "Nothing here should be read as a claim about Bàn Bàn Asian Bistro's menu, prices, sourcing, hours, or availability. Those come from the bistro.",
      verify: { line: "Confirm everything current directly with the bistro.", links: [["Bistro site", "https://banbanasianbistro.net"], ["Map", "https://www.google.com/maps/search/?api=1&query=Ban%20Ban%20Asian%20Bistro%20PA"]] }
    }
  },

  /* ======================================================================
     175 · Big Head Transport — MOVE
     A tire rolls in, the hook drops, the cable takes tension.
  ====================================================================== */
  "big-head-transport": {
    build: 175,
    name: "Big Head Transport, LLC",
    lockup: ["Big Head", "Transport"],
    initials: "BH",
    verb: "MOVE",
    domain: "bigheadtransportllc.com",
    city: "Philadelphia, PA",
    vertical: "Transport & roadside",
    lens: "35 MM",
    accent: "#f2a83a",
    accent2: "#5a7a9a",
    bg: "#080c12",
    plates: plates("big-head-transport"),
    heroAlt: "A monumental tire, tow hook, and taut recovery cable on wet night asphalt under an amber beacon.",
    world: {
      clear: 0x080c12, fog: 0x0e141e, fogDensity: 0.018, exposure: 1.22,
      sky: 0xa8bcd8, ground: 0x0a0c10, ambient: 0.9,
      cold: 0x8fa8c8, coldIntensity: 2.6, coldPosition: [-8, 11, 7],
      warm: 0xffa03a, warmIntensity: 2.4, warmPeak: 10, warmRange: 22, warmPosition: [2.6, 1.8, 1.2], warmRamp: [0.45, 0.8],
      env: { sky: 0x22303e, floor: 0x080a0c, lamp: 0xffaa4a, cool: 0x8aa4c4, lampUV: [0.76, 0.4], lampPower: 3.2, coolUV: [0.2, 0.24], coolPower: 2.2, intensity: 1.0 },
      bloom: 0.2, plateDistance: 27, platePosition: [0.4, 1.8, -16],
      groundMat: "stone", groundTint: 0x14181c, groundY: -1.75, rootYaw: -0.06,
      beats: { preset: "driftLateral", r: 9.4, h: 2.3, low: 1.1, target: [0.2, -0.5, 0], fov: 35 },
      props: [
        { geo: "torus", size: [1.35, 0.5, 22, 72], mat: "rubber", pos: [0.6, -0.4, 0], rot: [0, 0, 0], from: [-9, 0, 0], phase: [0.05, 0.3], spin: { axis: "z", speed: -0.9, ramp: [0.05, 0.3] } },
        { geo: "disc", size: [0.78, 0.34, 28], mat: "darkSteel", pos: [0.6, -0.4, 0], rot: [1.5708, 0, 0], from: [-9, 0, 0], phase: [0.05, 0.3], spin: { axis: "y", speed: -0.9, ramp: [0.05, 0.3] } },
        { geo: "torus", size: [0.34, 0.09, 14, 44], mat: "steel", pos: [-1.9, -0.9, 0.5], rot: [0.3, 0, 0], from: [0, 4, 0], phase: [0.34, 0.52] },
        { geo: "capsule", size: [0.11, 0.75], mat: "steel", pos: [-1.9, -1.4, 0.5], rot: [0, 0, 0.5], from: [0, 4, 0], phase: [0.36, 0.54] },
        { geo: "tube", pts: [[-1.9, -1.15, 0.5], [-0.6, -1.35, 0.35], [0.9, -1.45, 0.2], [2.6, -1.5, 0.05], [4.4, -1.52, -0.1]], r: 0.05, mat: "steel", tint: 0x9a8a6a, pos: [0, 0, 0], from: [0, -2.6, 0], phase: [0.5, 0.72] },
        { geo: "box", size: [0.5, 0.32, 0.3], mat: "glow", tint: 0xffb44a, pos: [3.4, 1.5, -1.2], glow: true, glowRamp: [0.4, 0.7, 0.1, 0.95], pulse: 2.2 },
        { geo: "box", size: [2.6, 1.5, 1.4], mat: "darkSteel", tint: 0x1e242c, pos: [3.6, -0.95, -1.4], from: [6, 0, 0], phase: [0.3, 0.52] }
      ],
      particles: [
        { color: 0xbcd2ea, count: 120, spread: [10, 5, 6], seed: 91, size: 0.02, opacity: 0.14, ramp: [0.1, 0.5], driftSpeed: 0.04 },
        { color: 0xffc27a, count: 50, spread: [5, 3, 4], seed: 92, size: 0.03, opacity: 0.16, ramp: [0.5, 0.85], position: [3, 0.8, -1], driftSpeed: 0.06 }
      ],
    },
    panels: [
      { id: "rigging", src: "macro", label: "Rigging", meta: "Hook, cable, rain", size: [3.1, 2.35], position: [-5.8, 1.4, 1.8], rotY: 0.42, in: [0.16, 0.3], out: [0.52, 0.64] },
      { id: "traction", src: "material", label: "Traction", meta: "Tread, braid, wet steel", size: [2.9, 2.2], position: [5.6, 1.5, 2.4], rotY: -0.44, in: [0.6, 0.74], out: [0.92, 1.02] }
    ],
    states: ["Stranded", "Rigged", "Tensioned", "Moving"],
    copy: {
      context: "Every roadside call is the same promise: what stopped will move again, safely, tonight.",
      h1: "Stopped is<br />temporary.",
      chapters: [
        { step: "The scene", state: "Stranded", title: "It starts where somebody's night went wrong.", body: "A tire rolls into an empty wet frame. Transport work begins at the worst moment of someone else's day — that is the product.", ledger: [["Known", "The company name and its Philadelphia service area"], ["Held open", "Service types, coverage hours, rates, and dispatch"]] },
        { step: "Rigging", state: "Rigged", title: "The hook is placed, never thrown.", body: "Hook and shackle drop into position. Recovery is rigging work — where the load path runs decides whether metal gets saved or bent." },
        { step: "Tension", state: "Tensioned", title: "The cable takes the argument.", body: "The line pulls taut across the frame and the beacon holds steady. A controlled pull is quiet; drama at the hook usually means the plan was wrong.", list: ["Ask where the vehicle is going before it moves", "Ask what the operator needs from you at the scene", "Ask how they secure what they carry"] },
        { step: "Source", state: "Moving", title: "The finished frame points back to the real company.", body: "Use the company's own site to confirm services and how dispatch actually works.", cta: ["Visit the company site", "https://bigheadtransportllc.com"] }
      ],
      sequence: {
        heading: "Six steps between a dead stop and a safe delivery.",
        lede: "Transport and recovery is procedure under pressure. The sequence is what keeps people and metal intact.",
        cards: [
          ["01", "The call", "Location, vehicle, condition. The right truck leaves because the right questions got asked."],
          ["02", "Scene", "Beacons on, lane taken, traffic managed before anything touches the vehicle."],
          ["03", "Rig", "Attachment points chosen for the frame, not for convenience."],
          ["04", "Pull", "Slow, straight, watched. Tension does the work; patience does the safety."],
          ["05", "Secure", "Four points minimum before a wheel turns. Load shift is the silent accident."],
          ["06", "Deliver", "The job ends at the destination, on the ground, undamaged."]
        ]
      },
      brief: [
        "This page is a concept. The imagery is synthetic art direction, the sequence describes how transport and recovery work is commonly staged, and none of it describes this company's actual operations.",
        "Before anything went live we would confirm the real scope with the company — services offered, coverage area and hours, and how they want calls routed."
      ],
      note: "Nothing here should be read as a claim about Big Head Transport's services, rates, coverage, hours, or availability. Those come from the company.",
      verify: { line: "Confirm everything current directly with the company.", links: [["Company site", "https://bigheadtransportllc.com"], ["Map", "https://www.google.com/maps/search/?api=1&query=Big%20Head%20Transport%20Philadelphia%20PA"]] }
    }
  },

  /* ======================================================================
     176 · Dutton Road Veterinary Clinic — CARE
     A stethoscope arc settles around a folded blanket and collar.
  ====================================================================== */
  "dutton-road-veterinary-clinic": {
    build: 176,
    name: "Dutton Road Veterinary Clinic",
    lockup: ["Dutton Road", "Veterinary Clinic"],
    initials: "DR",
    verb: "CARE",
    domain: null,
    city: "Philadelphia, PA",
    vertical: "Veterinary care",
    lens: "50 MM",
    accent: "#a8c89a",
    accent2: "#c89a6a",
    bg: "#0c110c",
    plates: plates("dutton-road-veterinary-clinic"),
    heroAlt: "A stethoscope arcing around a folded pet blanket, worn collar, and polished exam instrument on deep sage.",
    world: {
      clear: 0x0c110c, fog: 0x141c14, fogDensity: 0.015, exposure: 1.22,
      sky: 0xd8e4c8, ground: 0x0e120c, ambient: 1.0,
      cold: 0xbcd4ac, coldIntensity: 2.4, coldPosition: [-8, 10, 8],
      warm: 0xe8b47a, warmIntensity: 2.2, warmPeak: 8.5, warmRange: 18, warmPosition: [1.4, 1.8, 1.6], warmRamp: [0.48, 0.84],
      env: { sky: 0x32422a, floor: 0x0c100a, lamp: 0xf0c48a, cool: 0xb0d0a0, lampUV: [0.68, 0.44], lampPower: 2.9, coolUV: [0.2, 0.3], coolPower: 1.9, intensity: 1.0 },
      bloom: 0.15, plateDistance: 25, platePosition: [0.5, 1.5, -14],
      groundMat: "cloth", groundTint: 0x24301e, groundY: -1.7, rootYaw: -0.04,
      beats: { preset: "craneDown", r: 8.4, h: 3.0, low: 1.0, target: [0, -0.45, 0], fov: 33 },
      props: [
        { geo: "box", size: [2.6, 0.5, 1.9], mat: "cloth", tint: 0x8a9a72, pos: [0, -1.3, 0], from: [0, 4, 0], phase: [0.05, 0.26] },
        { geo: "box", size: [2.2, 0.4, 1.5], mat: "cloth", tint: 0x9aaa80, pos: [0.1, -0.88, 0.05], from: [-6, 1.5, 0], phase: [0.14, 0.34] },
        { geo: "torus", size: [0.55, 0.075, 14, 48], mat: "leather", tint: 0x8a5c34, pos: [1.7, -1.35, 0.8], rot: [1.5708, 0, 0], from: [4, 1.4, 0], phase: [0.3, 0.5] },
        { geo: "tube", pts: [[-2.6, 0.4, -0.6], [-1.6, 0.9, 0.2], [0, 1.05, 0.55], [1.6, 0.9, 0.2], [2.5, 0.4, -0.5], [2.9, -0.3, -0.9]], r: 0.045, mat: "darkSteel", tint: 0x3a4440, pos: [0, 0, 0], from: [0, 3.2, 0], phase: [0.4, 0.64] },
        { geo: "disc", size: [0.32, 0.1, 28], mat: "steel", pos: [2.9, -0.62, -0.9], rot: [0.5, 0, 0], from: [0, 3.2, 0], phase: [0.46, 0.68] },
        { geo: "capsule", size: [0.05, 0.9], mat: "steel", pos: [-2.2, -1.3, 1.1], rot: [0, 0, 1.2], from: [-3, 1.2, 1], phase: [0.6, 0.78] }
      ],
      particles: [{ color: 0xe8e0c0, count: 70, spread: [9, 4.5, 5], seed: 101, size: 0.02, opacity: 0.1, ramp: [0.3, 0.8] }],
    },
    panels: [
      { id: "gentle-hands", src: "macro", label: "Gentle hands", meta: "Stethoscope, bandage, calm", size: [3.0, 2.25], position: [-5.5, 1.3, 1.7], rotY: 0.42, in: [0.15, 0.29], out: [0.5, 0.62] },
      { id: "textures", src: "material", label: "Textures", meta: "Steel, sage, worn leather", size: [2.8, 2.1], position: [5.4, 1.45, 2.3], rotY: -0.44, in: [0.58, 0.72], out: [0.92, 1.02] }
    ],
    states: ["Anxious", "Settled", "Examined", "Home"],
    copy: {
      context: "The patient never explains the symptom. Veterinary medicine is diagnosis with the sound off.",
      h1: "Care for the<br />ones who can't say.",
      chapters: [
        { step: "Arrival", state: "Anxious", title: "The exam starts in the waiting room.", body: "A blanket and a collar land before any instrument. Most of veterinary skill is making a frightened animal feel like nothing unusual is happening.", ledger: [["Known", "The clinic name and its Philadelphia location area"], ["Held open", "Services, species seen, hours, and appointment availability"]] },
        { step: "Trust", state: "Settled", title: "Calm is a clinical tool.", body: "The soft layers stack first, then the leather collar rests. Handling order matters: the animal decides how much medicine happens today." },
        { step: "The exam", state: "Examined", title: "Listen first, everywhere.", body: "The stethoscope arcs over the blanket and settles. Hands and ears find what the patient cannot report — that is the whole discipline.", list: ["Bring what changed, written down", "Ask what the exam found, organ by organ", "Ask what can wait and what cannot"] },
        { step: "Source", state: "Home", title: "The finished frame points back to the real clinic.", body: "Confirm services, hours, and appointments through the clinic's public listings.", cta: ["Find the clinic", "https://www.google.com/maps/search/?api=1&query=Dutton%20Road%20Veterinary%20Clinic%20Philadelphia%20PA"] }
      ],
      sequence: {
        heading: "Six parts of an exam the patient never mentions.",
        lede: "A veterinary visit is a structured conversation with a patient who cannot speak. This is the structure.",
        cards: [
          ["01", "History", "The owner is the medical record. Good clinics interview them like it matters."],
          ["02", "Handling", "Restraint that reads as comfort. The exam only works if the patient allows it."],
          ["03", "Systems", "Heart, lungs, belly, joints, teeth — in order, every time, so nothing hides."],
          ["04", "Findings", "What was found, explained in plain words with options and costs together."],
          ["05", "Plan", "Treat, test, or watch — chosen with the owner, not announced to them."],
          ["06", "Follow-up", "The recheck that confirms the plan worked, or catches it early when it didn't."]
        ]
      },
      brief: [
        "This page is a concept. The imagery is synthetic art direction, the sequence describes how small-animal exams are commonly structured, and none of it describes this clinic's actual practice.",
        "Before anything went live we would confirm the real scope with the clinic — species seen, services offered in-house, and how appointments are booked. No verified website domain was on file for this business, so every link here routes to public listings."
      ],
      note: "Nothing here should be read as a claim about Dutton Road Veterinary Clinic's services, staff, pricing, hours, or availability. Those come from the clinic.",
      verify: { line: "Confirm everything current directly with the clinic via its public listings.", links: [["Map & listings", "https://www.google.com/maps/search/?api=1&query=Dutton%20Road%20Veterinary%20Clinic%20Philadelphia%20PA"]] }
    }
  },

  /* ======================================================================
     177 · Elite Auto Parts — ASSEMBLE
     An exploded rotor stack closes into catalog order.
  ====================================================================== */
  "elite-auto-parts": {
    build: 177,
    name: "Elite Auto Parts",
    lockup: ["Elite", "Auto Parts"],
    initials: "EA",
    verb: "ASSEMBLE",
    domain: "cecarparts.com",
    city: "Philadelphia, PA",
    vertical: "Auto parts",
    lens: "50 MM",
    accent: "#e84a3a",
    accent2: "#5a8ac8",
    bg: "#0b0d10",
    plates: plates("elite-auto-parts"),
    heroAlt: "An exploded brake rotor, bearing, spring and fasteners hovering in exact catalog order above a graphite stage.",
    world: {
      clear: 0x0b0d10, fog: 0x13161c, fogDensity: 0.016, exposure: 1.22,
      sky: 0xbcc8dc, ground: 0x0c0e11, ambient: 0.95,
      cold: 0x9ab0d0, coldIntensity: 2.7, coldPosition: [-8, 11, 7],
      warm: 0xe8643a, warmIntensity: 1.8, warmPeak: 7.5, warmRange: 16, warmPosition: [1.8, 1.4, 1.6], warmRamp: [0.55, 0.88],
      env: { sky: 0x252c3a, floor: 0x0a0c0e, lamp: 0xe8845a, cool: 0x94b0d8, lampUV: [0.72, 0.42], lampPower: 2.6, coolUV: [0.2, 0.26], coolPower: 2.5, intensity: 1.0 },
      bloom: 0.16, plateDistance: 26, platePosition: [0.5, 1.6, -15],
      groundMat: "stone", groundTint: 0x1a1d22, groundY: -1.75, rootYaw: -0.05,
      beats: { preset: "pushReveal", r: 8.8, h: 2.4, low: 1.05, target: [0.1, -0.3, 0], fov: 33 },
      props: [
        { geo: "disc", size: [1.35, 0.16, 44], mat: "steel", tint: 0x8a929c, pos: [0, -0.9, 0], rot: [0.12, 0, 0], from: [0, -2.8, 0], phase: [0.05, 0.28], spin: { axis: "y", speed: 0.1 } },
        { geo: "torus", size: [0.62, 0.14, 18, 56], mat: "steel", pos: [0, -0.1, 0], rot: [1.69, 0, 0], from: [0, 3.4, 0], phase: [0.2, 0.42], spin: { axis: "z", speed: 0.14 } },
        { geo: "cylinder", size: [0.16, 0.16, 0.7, 18], mat: "steel", tint: 0xb0b8c0, pos: [-0.8, 0.55, 0.3], from: [-3.4, 2.4, 0], phase: [0.34, 0.54] },
        { geo: "cylinder", size: [0.16, 0.16, 0.7, 18], mat: "steel", tint: 0xb0b8c0, pos: [0.8, 0.55, 0.3], from: [3.4, 2.4, 0], phase: [0.38, 0.58] },
        { geo: "cylinder", size: [0.07, 0.07, 0.5, 12], mat: "brass", tint: 0x9aa2ac, pos: [-0.45, 1.15, 0.5], from: [-2, 3, 0], phase: [0.5, 0.68] },
        { geo: "cylinder", size: [0.07, 0.07, 0.5, 12], mat: "brass", tint: 0x9aa2ac, pos: [0.45, 1.15, 0.5], from: [2, 3, 0], phase: [0.54, 0.72] },
        { geo: "torus", size: [1.6, 0.03, 10, 72], mat: "glow", tint: 0xe84a3a, pos: [0, -0.35, 0], rot: [1.5708, 0, 0], glow: true, glowRamp: [0.6, 0.85, 0, 0.8] }
      ],
      particles: [{ color: 0xc8d4e8, count: 80, spread: [9, 5, 5], seed: 111, size: 0.02, opacity: 0.11, ramp: [0.25, 0.7] }],
    },
    panels: [
      { id: "fitment", src: "macro", label: "Fitment", meta: "Calipers against the spec", size: [3.0, 2.25], position: [-5.6, 1.35, 1.7], rotY: 0.42, in: [0.15, 0.29], out: [0.5, 0.62] },
      { id: "catalog", src: "material", label: "Catalog", meta: "Machined faces, one red flag", size: [2.8, 2.1], position: [5.4, 1.45, 2.3], rotY: -0.44, in: [0.6, 0.74], out: [0.92, 1.02] }
    ],
    states: ["Exploded", "Ordered", "Fitted", "Boxed"],
    copy: {
      context: "The right part is a fact, not an opinion. Everything in this trade hangs on the lookup.",
      h1: "The exact part,<br />or no part.",
      chapters: [
        { step: "Exploded", state: "Exploded", title: "A car is ten thousand answers to look up.", body: "The rotor stack opens the page mid-air, every component held apart in catalog order. Parts work starts with seeing the assembly the way the book sees it.", ledger: [["Known", "The store name and its Philadelphia location area"], ["Held open", "Inventory, brands stocked, pricing, and hours"]] },
        { step: "Order", state: "Ordered", title: "Fitment beats brand, every time.", body: "Pieces close toward their seats. Year, make, model, engine, trim — the five questions that separate the right rotor from an expensive guess." },
        { step: "The check", state: "Fitted", title: "Measured, not assumed.", body: "The red ring flags the last check before the box: does the number on the part match the number on the vehicle. Good counters check twice.", list: ["Bring the VIN, not a description", "Ask what grade options exist for the job", "Ask what the return policy expects"] },
        { step: "Source", state: "Boxed", title: "The finished frame points back to the real store.", body: "Use the store's own site to confirm inventory and hours.", cta: ["Visit the store site", "https://cecarparts.com"] }
      ],
      sequence: {
        heading: "Six lookups between a symptom and the right box.",
        lede: "A parts counter is a search engine with a person attached. The discipline is in the questions.",
        cards: [
          ["01", "Identify", "VIN first. Trim levels lie; the number does not."],
          ["02", "Diagnose", "The failed part is sometimes the victim. Ask what killed it."],
          ["03", "Cross-reference", "OEM number to aftermarket equivalents, grade by grade."],
          ["04", "Grade", "Economy, standard, premium — matched to the vehicle's remaining life."],
          ["05", "Verify", "Measure the old part against the new before anyone drives away."],
          ["06", "Back it", "A part is only as good as the counter standing behind it."]
        ]
      },
      brief: [
        "This page is a concept. The imagery is synthetic art direction, the sequence describes how parts counters commonly work, and none of it describes this store's actual inventory.",
        "Before anything went live we would confirm the real scope with the store — lines stocked, delivery and ordering, and how they want lookups to arrive."
      ],
      note: "Nothing here should be read as a claim about Elite Auto Parts' inventory, brands, pricing, hours, or availability. Those come from the store.",
      verify: { line: "Confirm everything current directly with the store.", links: [["Store site", "https://cecarparts.com"], ["Map", "https://www.google.com/maps/search/?api=1&query=Elite%20Auto%20Parts%20Philadelphia%20PA"]] }
    }
  },

  /* ======================================================================
     178 · Kehan's Auto Service — RESTORE
     Engine parts rise out of the bay shadow into work light.
  ====================================================================== */
  "kehans-auto-service": {
    build: 178,
    name: "Kehan's Auto Service",
    lockup: ["Kehan's", "Auto Service"],
    initials: "KA",
    verb: "RESTORE",
    domain: "kehansautoservice.com",
    city: "Philadelphia, PA",
    vertical: "Auto repair",
    lens: "35 MM",
    accent: "#f2b45a",
    accent2: "#7a94ac",
    bg: "#0a0d10",
    plates: plates("kehans-auto-service"),
    heroAlt: "A ratchet, piston, belt and engine components rising from service-bay shadow into warm work light.",
    world: {
      clear: 0x0a0d10, fog: 0x121820, fogDensity: 0.017, exposure: 1.22,
      sky: 0xc0cede, ground: 0x0c0e10, ambient: 0.92,
      cold: 0x94aac4, coldIntensity: 2.5, coldPosition: [-8, 10, 7],
      warm: 0xffb45a, warmIntensity: 2.4, warmPeak: 10.5, warmRange: 20, warmPosition: [1.6, 1.2, 1.8], warmRamp: [0.45, 0.82],
      env: { sky: 0x2a3644, floor: 0x0a0c0e, lamp: 0xffbe6a, cool: 0x8ea8c4, lampUV: [0.7, 0.46], lampPower: 3.4, coolUV: [0.2, 0.28], coolPower: 2.0, intensity: 1.0 },
      bloom: 0.18, plateDistance: 26, platePosition: [0.4, 1.7, -15],
      groundMat: "stone", groundTint: 0x16181a, groundY: -1.75, rootYaw: -0.06,
      beats: { preset: "orbitArc", r: 9.0, h: 2.5, low: 1.1, target: [0.1, -0.35, 0], fov: 34 },
      props: [
        { geo: "cylinder", size: [0.5, 0.5, 1.1, 32], mat: "steel", tint: 0xaab2bc, pos: [-0.9, -0.6, 0], from: [0, -3.4, 0], phase: [0.06, 0.3] },
        { geo: "capsule", size: [0.09, 0.85], mat: "steel", pos: [-0.9, 0.35, 0], from: [0, -3.4, 0], phase: [0.1, 0.34] },
        { geo: "torus", size: [0.95, 0.08, 16, 64], mat: "rubber", pos: [0.9, -0.5, 0.2], rot: [0.18, 0, 0], from: [0, 3.6, 0], phase: [0.26, 0.48], spin: { axis: "z", speed: 0.35, ramp: [0.5, 0.8] } },
        { geo: "torus", size: [0.4, 0.07, 14, 44], mat: "steel", tint: 0x8a929c, pos: [2.1, -1.1, 0.5], rot: [1.5708, 0, 0], from: [4.5, 1.2, 0], phase: [0.4, 0.6] },
        { geo: "box", size: [1.15, 0.09, 0.14], mat: "steel", tint: 0x9aa2ac, pos: [2.75, -1.1, 0.5], from: [4.5, 1.2, 0], phase: [0.44, 0.64] },
        { geo: "cylinder", size: [0.22, 0.26, 0.55, 20], mat: "brass", tint: 0x8a7040, pos: [-2.2, -1.35, 0.7], from: [-3.5, 1.5, 0], phase: [0.55, 0.74] },
        { geo: "sphere", size: [0.3, 24, 18], mat: "glow", tint: 0xffc26a, pos: [1.6, 1.3, 1.0], glow: true, glowRamp: [0.45, 0.8, 0, 0.9], pulse: 1.2 }
      ],
      particles: [{ color: 0xffd9a4, count: 90, spread: [9, 5, 6], seed: 121, size: 0.025, opacity: 0.13, ramp: [0.35, 0.8] }],
    },
    panels: [
      { id: "torque", src: "macro", label: "Torque", meta: "The wrench set to spec", size: [3.1, 2.35], position: [-5.7, 1.4, 1.8], rotY: 0.42, in: [0.16, 0.3], out: [0.52, 0.64] },
      { id: "wear", src: "material", label: "Wear", meta: "Oiled steel, belt, washer", size: [2.9, 2.2], position: [5.5, 1.5, 2.4], rotY: -0.44, in: [0.6, 0.74], out: [0.92, 1.02] }
    ],
    states: ["Down", "Opened", "Torqued", "Running"],
    copy: {
      context: "Every car in a service bay is a story about deferred decisions. Repair is where the deferrals end.",
      h1: "Worn is not<br />finished.",
      chapters: [
        { step: "The bay", state: "Down", title: "It arrives as a symptom, not a diagnosis.", body: "A piston rises out of the dark first. The noise, the light on the dash, the pull to one side — the bay's first job is translating symptoms into causes.", ledger: [["Known", "The shop name and its Philadelphia location area"], ["Held open", "Services, specialties, pricing, and scheduling"]] },
        { step: "Opened", state: "Opened", title: "Honest repair starts with showing the part.", body: "The belt and hardware swing into the light. The difference between a repair and an invoice is whether the customer gets to see what was actually worn." },
        { step: "Torque", state: "Torqued", title: "Tight is a number, not a feeling.", body: "The wrench arrives last and set to spec. Fasteners at the right torque are the quiet difference between fixed and fixed-for-now.", list: ["Ask to see the worn part", "Ask what fails next if this is ignored", "Ask what the shop would do on their own car"] },
        { step: "Source", state: "Running", title: "The finished frame points back to the real shop.", body: "Use the shop's own site to confirm services and how they schedule work.", cta: ["Visit the shop site", "https://kehansautoservice.com"] }
      ],
      sequence: {
        heading: "Six honest steps between a symptom and a running car.",
        lede: "Auto repair is diagnosis, parts, and torque — in that order, with the customer in the loop.",
        cards: [
          ["01", "Interview", "When it happens, what it sounds like, what changed. The owner knows more than they think."],
          ["02", "Reproduce", "The shop confirms the symptom before selling the cause."],
          ["03", "Diagnose", "Test, measure, isolate. Parts-cannon repair is just expensive guessing."],
          ["04", "Estimate", "The cause, the fix, the number — agreed before the wrench moves."],
          ["05", "Repair", "Right part, right torque, old part in the box for the customer."],
          ["06", "Verify", "Road-tested against the original complaint, not just started in the lot."]
        ]
      },
      brief: [
        "This page is a concept. The imagery is synthetic art direction, the sequence describes how honest repair shops commonly work, and none of it describes this shop's actual services.",
        "Before anything went live we would confirm the real scope with the shop — services and specialties, warranty terms, and how they want appointments to arrive."
      ],
      note: "Nothing here should be read as a claim about Kehan's Auto Service's offerings, warranties, pricing, hours, or availability. Those come from the shop.",
      verify: { line: "Confirm everything current directly with the shop.", links: [["Shop site", "https://kehansautoservice.com"], ["Map", "https://www.google.com/maps/search/?api=1&query=Kehan%27s%20Auto%20Service%20Philadelphia%20PA"]] }
    }
  }
};

export const ORDER = [
  "germantown-dental-group",
  "udis-conn-orthodontics",
  "jarman-sales-service",
  "lees-hoagie-house",
  "anthony-gueriera-insurance",
  "ban-ban-asian-bistro",
  "big-head-transport",
  "dutton-road-veterinary-clinic",
  "elite-auto-parts",
  "kehans-auto-service"
];
