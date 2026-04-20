// scenes.jsx — Align HCM cinematic motion graphic
// 1080 x 1350 portrait, 40s duration

const ORANGE = '#FF6A13';
const ORANGE_DIM = '#B34B0E';
const BG = '#0B0B0D';
const PANEL = '#141418';
const PANEL_BORDER = 'rgba(255,255,255,0.06)';
const GRAY = '#6b6b73';
const WHITE = '#F3F1EC';

const FONT_SANS = '"Archivo", "Helvetica Neue", Helvetica, Arial, sans-serif';
const FONT_MONO = '"JetBrains Mono", ui-monospace, monospace';

// ─── Align logo (client-provided image) ────
function AlignLogo({ scale = 1 }) {
  return (
    <img src={window.__resources ? window.__resources.alignLogo : 'align-logo.png'}
      style={{ height: 70 * scale, width: 'auto', display: 'block' }} alt="Align HCM"/>
  );
}

// ─── Persistent chrome: logo, LIVE badge, footer telemetry ────────────────
function Chrome({ sig = 80 }) {
  const t = useTime();
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  return (
    <>
      {/* Top-left logo */}
      <div style={{ position: 'absolute', left: 40, top: 36 }}>
        <AlignLogo scale={1} />
      </div>
      {/* Top-right LIVE */}
      <div style={{ position: 'absolute', right: 40, top: 48,
        display: 'flex', alignItems: 'center', gap: 10,
        fontFamily: FONT_MONO, fontSize: 13, color: WHITE,
        letterSpacing: '0.2em', fontWeight: 600,
      }}>
        <span style={{
          width: 7, height: 7, borderRadius: 4, background: ORANGE,
          boxShadow: `0 0 ${8 + pulse * 12}px ${ORANGE}`,
          opacity: 0.6 + pulse * 0.4,
        }}/>
        <span>LIVE <span style={{ opacity: 0.5 }}>//</span> HCM AUDIT</span>
      </div>
      {/* Footer */}
      <div style={{ position: 'absolute', left: 40, bottom: 32,
        fontFamily: FONT_MONO, fontSize: 12, color: WHITE, opacity: 0.5,
        letterSpacing: '0.18em', fontWeight: 600,
      }}>SYSTEM / UTIL / V3.2</div>
      <div style={{ position: 'absolute', right: 40, bottom: 32,
        display: 'flex', alignItems: 'center', gap: 10,
        fontFamily: FONT_MONO, fontSize: 12, color: WHITE,
        letterSpacing: '0.18em', fontWeight: 600,
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: 3, background: ORANGE,
          opacity: 0.5 + pulse * 0.5,
        }}/>
        <span style={{ color: ORANGE }}>STREAM</span>
        <span style={{ opacity: 0.75 }}>SIG {Math.floor(sig + Math.sin(t * 2) * 5)}%</span>
      </div>
    </>
  );
}

// ─── Ambient background: particles, waveform, streaks ─────────────────────
function Particles({ count = 60, seed = 1 }) {
  const t = useTime();
  const dots = React.useMemo(() => {
    const arr = [];
    let s = seed;
    const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    for (let i = 0; i < count; i++) {
      arr.push({
        x: rnd() * 1080,
        y: rnd() * 1350,
        r: 0.6 + rnd() * 2.2,
        speed: 4 + rnd() * 16,
        phase: rnd() * Math.PI * 2,
        color: rnd() > 0.82 ? ORANGE : '#fff',
        op: 0.25 + rnd() * 0.5,
      });
    }
    return arr;
  }, [count, seed]);
  return (
    <svg width="1080" height="1350" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {dots.map((d, i) => {
        const y = (d.y + t * d.speed) % 1350;
        const op = d.op * (0.55 + 0.45 * Math.sin(t * 1.6 + d.phase));
        return <circle key={i} cx={d.x} cy={y} r={d.r} fill={d.color} opacity={op} />;
      })}
    </svg>
  );
}

function Waveform({ y = 1200, amp = 14, freq = 0.012, color = ORANGE, opacity = 0.6, seed = 0 }) {
  const t = useTime();
  const pts = [];
  for (let x = 0; x <= 1080; x += 8) {
    const yy = y + Math.sin(x * freq + t * 1.4 + seed) * amp
            + Math.sin(x * freq * 2.3 + t * 0.8 + seed * 2) * amp * 0.3;
    pts.push(`${x},${yy}`);
  }
  return (
    <svg width="1080" height="1350" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="1.5" opacity={opacity}/>
    </svg>
  );
}

function GridLines() {
  const t = useTime();
  const offset = (t * 12) % 60;
  return (
    <svg width="1080" height="1350" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.06 }}>
      <defs>
        <pattern id="g" width="60" height="60" patternUnits="userSpaceOnUse" x={-offset}>
          <path d="M60 0H0V60" fill="none" stroke="#fff" strokeWidth="0.5"/>
        </pattern>
      </defs>
      <rect width="1080" height="1350" fill="url(#g)" />
    </svg>
  );
}

// Horizontal light streak that sweeps across
function Streak({ y, delay = 0, dur = 2.4, color = ORANGE }) {
  const t = useTime();
  const local = ((t - delay) % (dur + 2)) / dur;
  if (local < 0 || local > 1) return null;
  const x = local * 1200 - 200;
  const op = Math.sin(local * Math.PI);
  return (
    <div style={{
      position: 'absolute', top: y, left: x,
      width: 280, height: 1,
      background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
      opacity: op * 0.8,
      pointerEvents: 'none',
    }}/>
  );
}

// Orange endpoint dot + connecting line (decorative data-node)
function DataEdge({ x1, y1, x2, y2, delay = 0, dur = 0.6 }) {
  const t = useTime();
  const p = clamp((t - delay) / dur, 0, 1);
  const ease = Easing.easeOutCubic(p);
  const cx = x1 + (x2 - x1) * ease;
  const cy = y1 + (y2 - y1) * ease;
  return (
    <svg width="1080" height="1350" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <line x1={x1} y1={y1} x2={cx} y2={cy} stroke={ORANGE} strokeWidth="1" opacity="0.7"/>
      {p >= 1 && <circle cx={x2} cy={y2} r="3.5" fill={ORANGE} opacity={0.6 + 0.4 * Math.sin(t * 4)} />}
    </svg>
  );
}

function Background() {
  return (
    <>
      <GridLines/>
      <Particles count={70} seed={3}/>
      <Waveform y={1210} amp={10} opacity={0.35} color={ORANGE} seed={0}/>
      <Waveform y={1250} amp={8} opacity={0.25} color={ORANGE_DIM} seed={2}/>
      <Streak y={270} delay={1} dur={3} color={ORANGE}/>
      <Streak y={540} delay={3.5} dur={3.6} color={ORANGE_DIM}/>
      <Streak y={820} delay={6} dur={3.2} color={ORANGE}/>
      <Streak y={1050} delay={8.5} dur={4} color={ORANGE_DIM}/>
    </>
  );
}

// ─── SCENE 1: HOOK (0-7s) ─────────────────────────────────────────────────
function Scene1() {
  const { localTime, duration } = useSprite();
  const t = localTime;

  // Orange pulse expands from center at t=0
  const pulseR = t < 3 ? 20 + Easing.easeOutCubic(clamp(t/2, 0, 1)) * 520 : 540;
  const pulseOp = t < 3 ? (1 - clamp(t/3, 0, 1)) * 0.35 : 0;

  // Soft vignette behind text
  const vigScale = 0.4 + Easing.easeOutCubic(clamp(t/1.4, 0, 1)) * 0.6;

  // Text glitch on entry
  const tLine = clamp((t - 0.7) / 0.5, 0, 1);
  const textOp = Easing.easeOutCubic(tLine);
  const glitch = tLine < 1 ? (Math.random() - 0.5) * 4 * (1 - tLine) : 0;

  // Exit
  const exitT = clamp((t - (duration - 0.6)) / 0.6, 0, 1);
  const exitOp = 1 - exitT;
  const exitY = -exitT * 40;

  return (
    <div style={{ position: 'absolute', inset: 0, color: WHITE, fontFamily: FONT_SANS }}>
      {/* Big radial glow */}
      <div style={{
        position: 'absolute', left: 540, top: 675,
        width: pulseR * 2, height: pulseR * 2,
        marginLeft: -pulseR, marginTop: -pulseR,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${ORANGE}66 0%, transparent 70%)`,
        opacity: pulseOp,
      }}/>
      {/* Static vignette that grows to hold */}
      <div style={{
        position: 'absolute', left: 540, top: 690,
        width: 900, height: 900, marginLeft: -450, marginTop: -450,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${ORANGE}1a 0%, transparent 60%)`,
        transform: `scale(${vigScale})`,
        opacity: exitOp,
      }}/>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 500, textAlign: 'center',
        fontFamily: FONT_MONO, fontSize: 16, color: ORANGE,
        letterSpacing: '0.35em', fontWeight: 600,
        opacity: textOp * exitOp,
        transform: `translateY(${exitY}px)`,
      }}>
        <span style={{ borderTop: `1px solid ${ORANGE}`, paddingTop: 10, paddingLeft: 40, paddingRight: 40, display: 'inline-block' }}>
          — DIAGNOSTIC INITIATED —
        </span>
      </div>

      {/* Main headline */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 580,
        textAlign: 'center', color: WHITE,
        fontWeight: 800, fontSize: 86, lineHeight: 1.05,
        letterSpacing: '-0.025em',
        opacity: textOp * exitOp,
        transform: `translate(${glitch}px, ${exitY}px)`,
      }}>
        <div>Are you getting</div>
        <div>your <em style={{ color: ORANGE, fontStyle: 'italic', fontWeight: 800 }}>money's worth</em></div>
        <div>out of your HCM?</div>
      </div>
    </div>
  );
}

// ─── SCENE 2: TENSION — renewal timeline (7-15s) ──────────────────────────
function Scene2() {
  const { localTime, duration } = useSprite();
  const t = localTime;

  // Timeline fill progress
  const fillP = Easing.easeInOutCubic(clamp((t - 2.5) / 3.5, 0, 1));

  // Exit
  const exitT = clamp((t - (duration - 0.6)) / 0.6, 0, 1);
  const exitOp = 1 - exitT;

  const headOp = Easing.easeOutCubic(clamp(t / 0.8, 0, 1));
  const subOp = Easing.easeOutCubic(clamp((t - 1.0) / 0.7, 0, 1));
  const timelineOp = Easing.easeOutCubic(clamp((t - 1.8) / 0.6, 0, 1));

  return (
    <div style={{ position: 'absolute', inset: 0, color: WHITE, fontFamily: FONT_SANS, opacity: exitOp }}>
      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: 40, top: 210,
        fontFamily: FONT_MONO, fontSize: 15, color: ORANGE,
        letterSpacing: '0.3em', fontWeight: 600,
        opacity: headOp,
      }}>OBSERVATION // 01</div>

      {/* Headline */}
      <div style={{
        position: 'absolute', left: 40, right: 40, top: 250,
        fontWeight: 800, fontSize: 70, lineHeight: 1.05,
        letterSpacing: '-0.025em',
        opacity: headOp,
        transform: `translateY(${(1 - headOp) * 14}px)`,
      }}>
        Most organizations <span style={{ color: ORANGE }}>renew</span><br/>
        their HCM every <span style={{ textDecoration: `underline ${ORANGE}`, textUnderlineOffset: 8 }}>3 years</span>.
      </div>

      {/* Subhead */}
      <div style={{
        position: 'absolute', left: 40, right: 40, top: 470,
        fontSize: 34, fontWeight: 500, lineHeight: 1.25, color: '#cfcdc6',
        letterSpacing: '-0.005em',
        opacity: subOp,
        transform: `translateY(${(1 - subOp) * 12}px)`,
      }}>
        Very few stop to ask<br/>
        what they're actually using.
      </div>

      {/* Timeline */}
      <div style={{
        position: 'absolute', left: 40, right: 40, top: 640,
        opacity: timelineOp,
      }}>
        {/* Labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between',
          fontFamily: FONT_MONO, fontSize: 13, color: WHITE,
          letterSpacing: '0.2em', fontWeight: 600, marginBottom: 14,
        }}>
          <span><span style={{color: ORANGE}}>Y1</span> • GO-LIVE</span>
          <span><span style={{color: ORANGE}}>Y2</span> • ADOPTION</span>
          <span><span style={{color: ORANGE}}>Y3</span> • RENEW</span>
        </div>
        {/* Bar */}
        <div style={{ position: 'relative', height: 10, background: '#1f1e23', borderRadius: 5 }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${fillP * 100}%`,
            background: `linear-gradient(90deg, ${ORANGE}, ${ORANGE_DIM})`,
            borderRadius: 5,
            boxShadow: `0 0 18px ${ORANGE}88`,
          }}/>
          {/* Head */}
          <div style={{
            position: 'absolute', left: `${fillP * 100}%`, top: '50%',
            width: 22, height: 22, marginLeft: -11, marginTop: -11,
            background: '#fff', borderRadius: 11,
            boxShadow: `0 0 22px ${ORANGE}`, border: `2px solid ${ORANGE}`,
          }}/>
          {/* Tick marks */}
          {[0, 0.5, 1].map((p, i) => (
            <div key={i} style={{
              position: 'absolute', left: `${p * 100}%`, top: -6, bottom: -6,
              width: 2, marginLeft: -1, background: '#fff', opacity: 0.3,
            }}/>
          ))}
        </div>

        {/* Cost drift alert */}
        <div style={{
          marginTop: 34, display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '10px 16px',
          border: `1px solid ${ORANGE}`,
          borderRadius: 6,
          fontFamily: FONT_MONO, fontSize: 13, color: ORANGE,
          letterSpacing: '0.18em', fontWeight: 600,
          background: `${ORANGE}10`,
          opacity: Easing.easeOutCubic(clamp((t - 4.5) / 0.6, 0, 1)),
        }}>
          <span style={{ fontSize: 16 }}>⚠</span> COST DRIFT
        </div>
      </div>
    </div>
  );
}

// ─── SCENE 3: PROBLEM DASHBOARD (15-25s) ──────────────────────────────────
function AnomalyPanel({ delay, label, value, valueColor = WHITE, children, t, w = 480, h = 180, x, y }) {
  const appear = Easing.easeOutCubic(clamp((t - delay) / 0.5, 0, 1));
  const alert = Math.sin((t - delay) * 3) * 0.5 + 0.5;
  const alertVisible = t > delay + 0.4;
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: w, height: h,
      background: `linear-gradient(145deg, ${PANEL} 0%, #0f0f12 100%)`,
      border: `1px solid ${alertVisible ? `rgba(255,106,19,${0.2 + alert * 0.3})` : PANEL_BORDER}`,
      borderRadius: 4,
      padding: '18px 22px',
      opacity: appear,
      transform: `translateY(${(1 - appear) * 20}px)`,
      boxShadow: alertVisible ? `0 0 30px rgba(255,106,19,${0.08 + alert * 0.08})` : 'none',
      overflow: 'hidden',
    }}>
      {/* alert dot */}
      <div style={{
        position: 'absolute', right: 14, top: 14,
        width: 7, height: 7, borderRadius: 4, background: ORANGE,
        opacity: alertVisible ? 0.5 + alert * 0.5 : 0,
      }}/>
      <div style={{
        fontFamily: FONT_MONO, fontSize: 11, color: '#9a988f',
        letterSpacing: '0.22em', fontWeight: 600,
      }}>{label}</div>
      <div style={{
        fontFamily: FONT_SANS, fontWeight: 800, fontSize: 52,
        color: valueColor, marginTop: 6, letterSpacing: '-0.02em',
        lineHeight: 1,
      }}>{value}</div>
      <div style={{ position: 'absolute', left: 22, right: 22, bottom: 18, top: 92 }}>
        {children}
      </div>
    </div>
  );
}

function BarChart({ t, bars = 8 }) {
  // Growing bars, climbing
  const vals = [];
  for (let i = 0; i < bars; i++) {
    const base = 0.3 + (i / bars) * 0.6;
    vals.push(base + Math.sin(t * 2 + i) * 0.05);
  }
  return (
    <svg width="100%" height="100%" viewBox="0 0 200 60" preserveAspectRatio="none">
      {vals.map((v, i) => {
        const active = i === bars - 1;
        return <rect key={i} x={i * (200 / bars) + 2} y={60 - v * 60}
          width={(200 / bars) - 6} height={v * 60}
          fill={active ? ORANGE : '#3a3a40'} />;
      })}
    </svg>
  );
}

function BarsFlicker({ t }) {
  const bars = 18;
  const active = Math.floor(t * 3) % bars;
  return (
    <svg width="100%" height="100%" viewBox="0 0 200 60" preserveAspectRatio="none">
      {Array.from({length: bars}).map((_, i) => {
        const h = 20 + ((i * 7 + Math.floor(t * 9)) % 30);
        const isActive = i === active;
        return <rect key={i} x={i * (200/bars) + 1.5} y={60 - h} width={(200/bars) - 3} height={h}
          fill={isActive ? ORANGE : '#3a3a40'} />;
      })}
    </svg>
  );
}

function Gauge({ t, pct = 62 }) {
  const cx = 70, cy = 60, r = 52;
  const a = Math.PI * (1 - pct / 100);
  const x2 = cx + r * Math.cos(Math.PI - a);
  const y2 = cy - r * Math.sin(Math.PI - a);
  const wobble = Math.sin(t * 4) * 3;
  return (
    <svg width="100%" height="100%" viewBox="0 0 200 70">
      <path d={`M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}`} stroke="#2a2a30" strokeWidth="6" fill="none" strokeLinecap="round"/>
      <path d={`M${cx - r} ${cy} A${r} ${r} 0 0 1 ${x2} ${y2}`} stroke={ORANGE} strokeWidth="6" fill="none" strokeLinecap="round"/>
      {/* needle */}
      <line x1={cx} y1={cy} x2={cx + (r-6) * Math.cos(Math.PI - a) + wobble * 0.5} y2={cy - (r-6) * Math.sin(Math.PI - a)} stroke="#fff" strokeWidth="1.5"/>
      <circle cx={cx} cy={cy} r="3" fill={WHITE}/>
    </svg>
  );
}

function BrokenLine({ t }) {
  const dash = ((t * 40) % 20).toFixed(1);
  return (
    <svg width="100%" height="100%" viewBox="0 0 200 40">
      <line x1="0" y1="20" x2="60" y2="20" stroke={ORANGE} strokeWidth="2"/>
      <circle cx="60" cy="20" r="3" fill={ORANGE}/>
      <polyline points="60,20 75,12 90,28 105,14 120,26" fill="none" stroke={ORANGE} strokeWidth="1.5" strokeDasharray={`4 ${dash}`} opacity="0.8"/>
      {/* disconnected trail */}
      {[130, 148, 166, 184].map((x, i) => (
        <circle key={i} cx={x} cy="20" r="2.5" fill="#6b6b73" opacity={0.3 + ((Math.sin(t * 2 + i) + 1)/2) * 0.5}/>
      ))}
    </svg>
  );
}

function SpreadsheetRow({ t }) {
  // Row of tiny spreadsheet icons drifting outside
  const drift = Math.sin(t * 1.2) * 6;
  return (
    <div style={{ position: 'absolute', right: 22, top: 24, display: 'flex', gap: 6, transform: `translateX(${drift}px)` }}>
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} style={{
          width: 28, height: 34, background: '#1d1d22',
          border: '1px solid #3a3a40', borderRadius: 2,
          display: 'flex', flexDirection: 'column', padding: 3, gap: 2,
          opacity: 0.6 + Math.sin(t * 2 + i) * 0.2,
        }}>
          <div style={{ height: 3, background: '#3a3a40' }}/>
          <div style={{ height: 3, background: '#3a3a40' }}/>
          <div style={{ height: 3, background: i === 2 ? ORANGE : '#3a3a40' }}/>
          <div style={{ height: 3, background: '#3a3a40' }}/>
        </div>
      ))}
    </div>
  );
}

function Scene3() {
  const { localTime, duration } = useSprite();
  const t = localTime;
  const exitT = clamp((t - (duration - 0.6)) / 0.6, 0, 1);
  const exitOp = 1 - exitT;

  const headOp = Easing.easeOutCubic(clamp(t / 0.8, 0, 1));
  const scanLineP = clamp((t - 0.4) / 1.2, 0, 1);

  return (
    <div style={{ position: 'absolute', inset: 0, color: WHITE, fontFamily: FONT_SANS, opacity: exitOp }}>
      {/* Scan eyebrow with scanning line */}
      <div style={{
        position: 'absolute', left: 40, top: 210,
        display: 'flex', alignItems: 'center', gap: 14,
        fontFamily: FONT_MONO, fontSize: 14, color: ORANGE,
        letterSpacing: '0.28em', fontWeight: 600,
        opacity: headOp,
      }}>
        <span style={{ width: 8, height: 8, borderRadius: 4, background: ORANGE,
          boxShadow: `0 0 10px ${ORANGE}` }}/>
        <span>SYSTEM SCAN <span style={{opacity: 0.5}}>//</span> 5 ANOMALIES DETECTED</span>
        <div style={{
          flex: 1, height: 1, background: `linear-gradient(90deg, ${ORANGE} ${scanLineP * 100}%, ${ORANGE}22 ${scanLineP * 100}%)`,
          marginLeft: 12,
        }}/>
      </div>

      {/* Headline */}
      <div style={{
        position: 'absolute', left: 40, right: 40, top: 255,
        fontWeight: 800, fontSize: 68, lineHeight: 1.05,
        letterSpacing: '-0.025em', opacity: headOp,
      }}>
        Where value <em style={{ color: ORANGE, fontStyle: 'italic' }}>quietly leaks</em>.
      </div>

      {/* Panels grid: 2x2 + 1 wide */}
      <AnomalyPanel t={t} delay={1.2} label="MANUAL WORKFLOWS" value={<><span>+{Math.floor(38 + Math.sin(t*2) * 2)}</span><span style={{color: ORANGE}}>%</span></>} x={40} y={400} w={480} h={200}>
        <BarChart t={t}/>
      </AnomalyPanel>

      <AnomalyPanel t={t} delay={1.6} label="PAYROLL EXCEPTIONS" value={<span style={{color: ORANGE}}>{147 + Math.floor(Math.sin(t*3) * 3)}</span>} x={560} y={400} w={480} h={200}>
        <BarsFlicker t={t}/>
      </AnomalyPanel>

      <AnomalyPanel t={t} delay={2.0} label="REPORT ACCURACY" value={<><span style={{color: ORANGE}}>{Math.floor(62 + Math.sin(t*2.5) * 2)}%</span><span style={{color: ORANGE, fontSize: 28, marginLeft: 6}}>↓</span></>} x={40} y={620} w={480} h={200}>
        <Gauge t={t} pct={62}/>
      </AnomalyPanel>

      <AnomalyPanel t={t} delay={2.4} label="WORKFLOW ALIGNMENT" value={<span style={{color: ORANGE}}>BROKEN</span>} x={560} y={620} w={480} h={200}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
          <BrokenLine t={t}/>
        </div>
      </AnomalyPanel>

      <AnomalyPanel t={t} delay={2.8} label="SHADOW SPREADSHEETS" value={<span style={{color: ORANGE}}>24 FILES</span>} x={40} y={840} w={1000} h={140}>
        <div style={{ position: 'relative', height: '100%' }}>
          <div style={{
            position: 'absolute', left: 0, top: '50%', width: '55%', height: 1,
            background: `linear-gradient(90deg, ${ORANGE}, ${ORANGE}00)`,
          }}/>
          <div style={{
            position: 'absolute', left: 240, top: '50%', marginTop: -10,
            fontFamily: FONT_MONO, fontSize: 11, color: '#6b6b73', letterSpacing: '0.2em',
          }}>SYSTEM</div>
          <SpreadsheetRow t={t}/>
        </div>
      </AnomalyPanel>

      {/* Overlay text — appears late in scene */}
      <div style={{
        position: 'absolute', left: 40, right: 40, top: 1020,
        fontSize: 28, fontWeight: 600, lineHeight: 1.3, color: WHITE,
        letterSpacing: '-0.005em',
        opacity: Easing.easeOutCubic(clamp((t - 5.5) / 0.8, 0, 1)),
      }}>
        If your team is still doing <span style={{ textDecoration: `underline ${ORANGE}`, textUnderlineOffset: 4 }}>manual work</span> your<br/>
        system should be handling, <span style={{color: ORANGE}}>you're leaving value on the table.</span>
      </div>
    </div>
  );
}

// ─── SCENE 4: TRANSFORMATION (25-33s) ─────────────────────────────────────
function Scene4() {
  const { localTime, duration } = useSprite();
  const t = localTime;

  // Orange sweep at start
  const sweepP = clamp(t / 1.4, 0, 1);
  const sweepX = -200 + Easing.easeInOutCubic(sweepP) * 1400;

  const headOp = Easing.easeOutCubic(clamp((t - 1.0) / 0.6, 0, 1));
  const layerOp = Easing.easeOutCubic(clamp((t - 1.8) / 0.6, 0, 1));
  const statsOp = Easing.easeOutCubic(clamp((t - 2.4) / 0.6, 0, 1));

  // Count-up metrics
  const autoP = Easing.easeOutCubic(clamp((t - 2.6) / 2.5, 0, 1));
  const autoVal = Math.floor(autoP * 94);
  const accP = Easing.easeOutCubic(clamp((t - 2.9) / 2.5, 0, 1));
  const accVal = Math.floor(accP * 99);
  const cycleP = Easing.easeOutCubic(clamp((t - 3.2) / 2.5, 0, 1));
  const cycleVal = (9 - cycleP * 6).toFixed(0);

  const exitT = clamp((t - (duration - 0.6)) / 0.6, 0, 1);
  const exitOp = 1 - exitT;

  return (
    <div style={{ position: 'absolute', inset: 0, color: WHITE, fontFamily: FONT_SANS, opacity: exitOp }}>
      {/* Sweep */}
      {sweepP < 1 && (
        <div style={{
          position: 'absolute', top: 0, bottom: 0,
          left: sweepX, width: 260,
          background: `linear-gradient(90deg, transparent, ${ORANGE}aa, transparent)`,
          filter: 'blur(12px)',
          mixBlendMode: 'screen',
        }}/>
      )}

      <div style={{
        position: 'absolute', left: 40, top: 210,
        fontFamily: FONT_MONO, fontSize: 15, color: ORANGE,
        letterSpacing: '0.3em', fontWeight: 600,
        opacity: headOp,
      }}>OPTIMIZATION // ACTIVE</div>

      <div style={{
        position: 'absolute', left: 40, right: 40, top: 250,
        fontWeight: 800, fontSize: 72, lineHeight: 1.05,
        letterSpacing: '-0.025em', opacity: headOp,
      }}>
        System <span style={{color: ORANGE}}>realigns</span>.<br/>
        Value returns.
      </div>

      <div style={{
        position: 'absolute', left: 40, right: 40, top: 450,
        height: 1, background: `linear-gradient(90deg, ${ORANGE}, ${ORANGE}00)`,
        opacity: layerOp,
      }}/>

      {/* SmartCare activation bar */}
      <div style={{
        position: 'absolute', left: 40, right: 40, top: 500,
        padding: '22px 26px',
        border: `1px solid ${ORANGE}`,
        borderRadius: 6,
        display: 'flex', alignItems: 'center', gap: 20,
        background: `linear-gradient(90deg, ${ORANGE}18, transparent)`,
        opacity: layerOp,
        transform: `translateY(${(1 - layerOp) * 14}px)`,
        boxShadow: `0 0 40px ${ORANGE}33`,
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 4,
          background: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24,
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24"><polygon points="12,3 22,21 2,21" fill="#fff"/></svg>
        </div>
        <div>
          <div style={{
            fontFamily: FONT_MONO, fontSize: 11, color: ORANGE,
            letterSpacing: '0.28em', fontWeight: 600,
          }}>LAYER ACTIVATED</div>
          <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 2 }}>
            SmartCare<sup style={{ fontSize: 14, fontWeight: 600 }}>™</sup> Optimization
          </div>
        </div>
      </div>

      {/* Three metric cards */}
      {[
        { label: 'AUTOMATION', val: `${autoVal}`, unit: '%', delta: '↑ 124%', x: 40 },
        { label: 'ACCURACY', val: `${accVal}`, unit: '%', delta: '↑ 68%', x: 380 },
        { label: 'CYCLE TIME', val: `${cycleVal}`, unit: 'D', delta: '↓ 75%', x: 720 },
      ].map((m, i) => (
        <div key={i} style={{
          position: 'absolute', left: m.x, top: 680,
          width: 320, height: 170,
          background: PANEL, border: `1px solid ${PANEL_BORDER}`,
          borderRadius: 4, padding: '18px 22px',
          opacity: statsOp,
          transform: `translateY(${(1 - statsOp) * 20}px)`,
        }}>
          <div style={{
            fontFamily: FONT_MONO, fontSize: 11, color: '#9a988f',
            letterSpacing: '0.22em', fontWeight: 600,
          }}>{m.label}</div>
          <div style={{
            fontWeight: 800, fontSize: 70, lineHeight: 1,
            marginTop: 14, letterSpacing: '-0.03em',
            color: WHITE,
          }}>{m.val}<span style={{ color: ORANGE, fontSize: 40, marginLeft: 4 }}>{m.unit}</span></div>
          <div style={{
            marginTop: 14, fontFamily: FONT_MONO, fontSize: 14,
            color: ORANGE, fontWeight: 600, letterSpacing: '0.08em',
          }}>{m.delta}</div>
        </div>
      ))}

      {/* Reconnected waveform with nodes */}
      <FlowingGraph t={t} y={920} delay={3.4}/>
    </div>
  );
}

function FlowingGraph({ t, y, delay = 0 }) {
  const p = Easing.easeOutCubic(clamp((t - delay) / 1.2, 0, 1));
  const nodes = [90, 210, 330, 450, 570, 690, 810, 930];
  return (
    <svg width="1080" height="160" style={{ position: 'absolute', left: 0, top: y }}>
      {/* connecting curve */}
      <path
        d={`M50 80 ${nodes.map((x, i) => {
          const yy = 80 + Math.sin(t * 1.2 + i * 0.7) * 14;
          return `L ${x} ${yy}`;
        }).join(' ')} L 1030 80`}
        stroke={ORANGE} strokeWidth="1.5" fill="none"
        strokeDasharray="2000" strokeDashoffset={(1 - p) * 2000}
      />
      {nodes.map((x, i) => {
        const appear = clamp((t - delay - i * 0.08) / 0.4, 0, 1);
        const yy = 80 + Math.sin(t * 1.2 + i * 0.7) * 14;
        return <circle key={i} cx={x} cy={yy} r={appear * 5} fill={ORANGE}
          opacity={0.7 + 0.3 * Math.sin(t * 3 + i)}/>;
      })}
    </svg>
  );
}

// ─── SCENE 5: CTA / CHECKLIST (33-40s) ────────────────────────────────────
function ChecklistItem({ n, label, t, delay }) {
  const p = Easing.easeOutCubic(clamp((t - delay) / 0.5, 0, 1));
  const checkP = Easing.easeOutBack(clamp((t - delay - 0.35) / 0.35, 0, 1));
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 18,
      padding: '18px 22px',
      background: `linear-gradient(145deg, ${PANEL}, #0f0f12)`,
      border: `1px solid ${PANEL_BORDER}`,
      borderRadius: 4, marginBottom: 14,
      opacity: p, transform: `translateX(${(1 - p) * -24}px)`,
    }}>
      <div style={{
        width: 38, height: 38, background: ORANGE, borderRadius: 4,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transform: `scale(${checkP})`,
      }}>
        <svg width="20" height="20" viewBox="0 0 20 20">
          <polyline points="4,10 9,15 17,6" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray="30" strokeDashoffset={(1 - checkP) * 30}/>
        </svg>
      </div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 13, color: ORANGE, fontWeight: 600, letterSpacing: '0.12em', minWidth: 30 }}>
        0{n}
      </div>
      <div style={{ fontFamily: FONT_SANS, fontSize: 26, fontWeight: 600, color: WHITE, letterSpacing: '-0.01em' }}>
        {label}
      </div>
    </div>
  );
}

function Scene5() {
  const { localTime, duration } = useSprite();
  const t = localTime;

  const headOp = Easing.easeOutCubic(clamp(t / 0.7, 0, 1));
  const items = [
    'Utilization of purchased modules',
    'Workflow vs. configuration debt',
    'Hidden payroll exceptions',
    'Reporting & data integrity',
    'Shadow spreadsheets & exports',
  ];

  const ctaOp = Easing.easeOutCubic(clamp((t - 4.3) / 0.6, 0, 1));

  return (
    <div style={{ position: 'absolute', inset: 0, color: WHITE, fontFamily: FONT_SANS }}>
      <div style={{
        position: 'absolute', left: 40, top: 210,
        fontFamily: FONT_MONO, fontSize: 15, color: ORANGE,
        letterSpacing: '0.3em', fontWeight: 600,
        opacity: headOp,
      }}>CHECKLIST // PRE-RENEWAL</div>

      <div style={{
        position: 'absolute', left: 40, right: 40, top: 250,
        fontWeight: 800, fontSize: 68, lineHeight: 1.05,
        letterSpacing: '-0.025em', opacity: headOp,
      }}>
        5 things most teams<br/>
        <em style={{ color: ORANGE, fontStyle: 'italic' }}>don't check</em> before renewing.
      </div>

      <div style={{ position: 'absolute', left: 40, right: 40, top: 460 }}>
        {items.map((label, i) => (
          <ChecklistItem key={i} n={i+1} label={label} t={t} delay={0.8 + i * 0.5}/>
        ))}
      </div>

      {/* CTA Button */}
      <div style={{
        position: 'absolute', left: 40, top: 1030,
        opacity: ctaOp, transform: `translateY(${(1 - ctaOp) * 14}px)`,
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 16,
          padding: '20px 28px',
          background: ORANGE, borderRadius: 6,
          fontFamily: FONT_SANS, fontWeight: 700, fontSize: 28,
          color: '#1a1a1e', letterSpacing: '-0.01em',
          boxShadow: `0 0 40px ${ORANGE}66`,
        }}>
          Book a 30-min HCM audit
          <div style={{
            width: 36, height: 36, borderRadius: 18, background: '#1a1a1e',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M3 8h10m-4-4l4 4-4 4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div style={{
          marginTop: 14,
          fontFamily: FONT_MONO, fontSize: 13, color: WHITE, opacity: 0.7,
          letterSpacing: '0.18em', fontWeight: 600,
        }}>ALIGNHCM.COM <span style={{color: ORANGE}}>/</span> AUDIT</div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────
function Video() {
  const t = useTime();
  // update timestamp label each second
  React.useEffect(() => {
    const root = document.getElementById('videoroot');
    if (root) root.setAttribute('data-screen-label', `t=${Math.floor(t)}s`);
  }, [Math.floor(t)]);

  // signal meter bumps per scene for chrome variation
  const sig = t < 7 ? 80 : t < 15 ? 64 : t < 25 ? 78 : t < 33 ? 56 : 89;

  return (
    <div id="videoroot" style={{ position: 'absolute', inset: 0, background: BG, overflow: 'hidden' }}
      data-screen-label="t=0s">
      <Background/>
      <Chrome sig={sig}/>

      <Sprite start={0} end={7}><Scene1/></Sprite>
      <Sprite start={7} end={15}><Scene2/></Sprite>
      <Sprite start={15} end={25}><Scene3/></Sprite>
      <Sprite start={25} end={33}><Scene4/></Sprite>
      <Sprite start={33} end={40}><Scene5/></Sprite>
    </div>
  );
}

function App() {
  return (
    <Stage width={1080} height={1350} duration={40} background={BG} persistKey="alignhcm">
      <Video/>
    </Stage>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
