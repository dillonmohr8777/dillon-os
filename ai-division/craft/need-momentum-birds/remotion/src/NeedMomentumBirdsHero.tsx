import React, {useEffect, useState} from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const FPS = 30;
export const DURATION = 450; // 15s
export const WIDTH = 1920;
export const HEIGHT = 1080;

/**
 * Prosperity Takes Flight — beat map
 * Times in seconds @ 30fps. Named segments for layout Task 2.
 */
export const BEATS = {
  /** 0–2s · cream field + torn paper settle */
  paperSettle: {startSec: 0, endSec: 2, startF: 0, endF: 60},
  /** 2–4.5s · flock silhouettes enter */
  flockEnter: {startSec: 2, endSec: 4.5, startF: 60, endF: 135},
  /** 4.5–7.5s · flock rising + prosperity arc draws */
  flockRise: {startSec: 4.5, endSec: 7.5, startF: 135, endF: 225},
  /** 7.5–10.5s · cardinal signal (lead bird accent) */
  cardinalSignal: {startSec: 7.5, endSec: 10.5, startF: 225, endF: 315},
  /** 10.5–13s · many birds one direction + wordmark begins */
  unityWord: {startSec: 10.5, endSec: 13, startF: 315, endF: 390},
  /** 13–15s · brand lockup hold (end card) */
  brandLockup: {startSec: 13, endSec: 15, startF: 390, endF: 450},
} as const;

/** Craft SoT palette */
const CREAM = "#FBF8F4";
const CREAM_DEEP = "#F0E8DC";
const PAPER = "#E8DFD2";
const INK = "#1A1612";
const ACCENT = "#E27113";
const MUTED = "rgba(26, 22, 18, 0.38)";

const FONT_OUTFIT = "OutfitNM";
const FONT_SOURCE = "SourceSansNM";

const clayEase = Easing.bezier(0.22, 1, 0.36, 1);
const crossfadeEase = Easing.bezier(0.45, 0, 0.2, 1);

/**
 * Plates already include birds — keep SVG flock off unless debugging motion.
 * Set true to re-enable optional overlay.
 */
const SHOW_SVG_BIRDS = false;

/** GPT Image scrapbook plates → beat backgrounds (staticFile under public/) */
type PlateSpec = {
  id: string;
  src: string;
  /** Inclusive peak window where opacity ≈ 1 */
  peakStart: number;
  peakEnd: number;
  /** Soft crossfade half-width in frames */
  fade: number;
  push: number;
  driftX: number;
  driftY: number;
  rotate: number;
  origin: string;
};

const GPT_PLATES: PlateSpec[] = [
  {
    id: "NM-GPT-PLATE-01",
    src: "gpt-plates/NM-GPT-PLATE-01-flock-rising.png",
    peakStart: BEATS.paperSettle.startF,
    peakEnd: BEATS.flockEnter.endF + 10,
    fade: 34,
    push: 1.07,
    driftX: -18,
    driftY: -12,
    rotate: -0.45,
    origin: "42% 50%",
  },
  {
    id: "NM-GPT-PLATE-03",
    src: "gpt-plates/NM-GPT-PLATE-03-prosperity-arc.png",
    peakStart: BEATS.flockRise.startF - 18,
    peakEnd: BEATS.flockRise.endF + 12,
    fade: 36,
    push: 1.075,
    driftX: 16,
    driftY: -18,
    rotate: 0.35,
    origin: "58% 43%",
  },
  {
    id: "NM-GPT-PLATE-02",
    src: "gpt-plates/NM-GPT-PLATE-02-cardinal-signal.png",
    peakStart: BEATS.cardinalSignal.startF - 18,
    peakEnd: BEATS.cardinalSignal.endF + 14,
    fade: 38,
    push: 1.085,
    driftX: -14,
    driftY: 10,
    rotate: -0.25,
    origin: "46% 48%",
  },
  {
    id: "NM-GPT-PLATE-04",
    src: "gpt-plates/NM-GPT-PLATE-04-human-flightpath.png",
    peakStart: BEATS.unityWord.startF - 16,
    peakEnd: BEATS.unityWord.startF + 52,
    fade: 32,
    push: 1.06,
    driftX: 12,
    driftY: -8,
    rotate: 0.28,
    origin: "50% 54%",
  },
  {
    id: "NM-GPT-PLATE-05",
    src: "gpt-plates/NM-GPT-PLATE-05-many-birds-one-direction.png",
    peakStart: BEATS.unityWord.startF + 38,
    peakEnd: BEATS.brandLockup.startF + 14,
    fade: 34,
    push: 1.065,
    driftX: -10,
    driftY: -14,
    rotate: -0.18,
    origin: "55% 48%",
  },
  {
    id: "NM-GPT-PLATE-06",
    src: "gpt-plates/NM-GPT-PLATE-06-future-needs-momentum-lockup.png",
    peakStart: BEATS.brandLockup.startF - 20,
    peakEnd: BEATS.brandLockup.endF,
    fade: 38,
    push: 1.04,
    driftX: 0,
    driftY: -10,
    rotate: 0.12,
    origin: "50% 52%",
  },
];

const plateOpacity = (frame: number, plate: PlateSpec) => {
  const {peakStart, peakEnd, fade} = plate;
  return (
    interpolate(frame, [peakStart - fade, peakStart], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: crossfadeEase,
    }) *
    interpolate(frame, [peakEnd, peakEnd + fade], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: crossfadeEase,
    })
  );
};

const plateProgress = (frame: number, plate: PlateSpec) =>
  interpolate(frame, [plate.peakStart, plate.peakEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: clayEase,
  });

const useCraftFonts = () => {
  const [handle] = useState(() => delayRender("nm-craft-fonts"));
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const outfit = new FontFace(
        FONT_OUTFIT,
        `url(${staticFile("fonts/Outfit-Bold.ttf")})`,
        {weight: "700", style: "normal"},
      );
      const source = new FontFace(
        FONT_SOURCE,
        `url(${staticFile("fonts/SourceSans3-Regular.ttf")})`,
        {weight: "400", style: "normal"},
      );
      const loaded = await Promise.all([outfit.load(), source.load()]);
      loaded.forEach((f) => document.fonts.add(f));
      if (!cancelled) continueRender(handle);
    };
    load().catch((err) => {
      console.error(err);
      continueRender(handle);
    });
    return () => {
      cancelled = true;
    };
  }, [handle]);
};

/** Deterministic torn-paper clip path */
const tornClip = (seed: number) => {
  const pts: string[] = [];
  const edge = (
    count: number,
    axis: "x" | "y",
    fixed: number,
    from: number,
    to: number,
    amp: number,
  ) => {
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const along = from + (to - from) * t;
      const n = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
      const frac = n - Math.floor(n);
      const jitter = (frac - 0.5) * amp;
      const nick = frac > 0.9 ? amp * 1.6 : 0;
      if (axis === "x") pts.push(`${along}% ${fixed + jitter + nick}%`);
      else pts.push(`${fixed + jitter + nick}% ${along}%`);
    }
  };
  edge(14, "x", 0, 0, 100, 1.1);
  edge(10, "y", 100, 0, 100, 1.0);
  edge(14, "x", 100, 100, 0, 1.1);
  edge(10, "y", 0, 100, 0, 1.0);
  return `polygon(${pts.join(",")})`;
};

type BirdKind = "dove" | "cardinal" | "flock";

type BirdSpec = {
  id: string;
  kind: BirdKind;
  assetId: string;
  x: number;
  y: number;
  scale: number;
  enterOffset: number;
  driftX: number;
  driftY: number;
  rotate: number;
};

/** Optional SVG flock overlay — plates already include birds */
const FLOCK: BirdSpec[] = [
  {id: "d1", kind: "dove", assetId: "NM-BIRD-DOVE-01", x: 18, y: 62, scale: 1.0, enterOffset: 0, driftX: 220, driftY: -180, rotate: -8},
  {id: "d2", kind: "dove", assetId: "NM-BIRD-DOVE-01", x: 28, y: 70, scale: 0.75, enterOffset: 8, driftX: 260, driftY: -150, rotate: -4},
  {id: "d3", kind: "dove", assetId: "NM-BIRD-DOVE-01", x: 12, y: 78, scale: 0.65, enterOffset: 16, driftX: 200, driftY: -120, rotate: -12},
  {id: "c1", kind: "cardinal", assetId: "NM-BIRD-CARDINAL-01", x: 42, y: 58, scale: 1.15, enterOffset: 24, driftX: 280, driftY: -200, rotate: -6},
  {id: "f1", kind: "flock", assetId: "NM-FLOCK-BG-01", x: 55, y: 72, scale: 0.55, enterOffset: 4, driftX: 300, driftY: -160, rotate: -2},
  {id: "f2", kind: "flock", assetId: "NM-FLOCK-BG-01", x: 62, y: 66, scale: 0.5, enterOffset: 12, driftX: 320, driftY: -140, rotate: 3},
  {id: "f3", kind: "flock", assetId: "NM-FLOCK-BG-01", x: 70, y: 74, scale: 0.45, enterOffset: 20, driftX: 280, driftY: -130, rotate: -5},
  {id: "d4", kind: "dove", assetId: "NM-BIRD-DOVE-01", x: 35, y: 80, scale: 0.7, enterOffset: 28, driftX: 240, driftY: -110, rotate: 2},
  {id: "f4", kind: "flock", assetId: "NM-FLOCK-BG-01", x: 48, y: 68, scale: 0.48, enterOffset: 10, driftX: 290, driftY: -170, rotate: -7},
  {id: "d5", kind: "dove", assetId: "NM-BIRD-DOVE-01", x: 22, y: 55, scale: 0.85, enterOffset: 32, driftX: 250, driftY: -190, rotate: -10},
  {id: "f5", kind: "flock", assetId: "NM-FLOCK-BG-01", x: 78, y: 60, scale: 0.52, enterOffset: 36, driftX: 180, driftY: -150, rotate: 4},
  {id: "c2", kind: "cardinal", assetId: "NM-BIRD-CARDINAL-01", x: 66, y: 52, scale: 0.9, enterOffset: 44, driftX: 200, driftY: -210, rotate: -3},
];

const BirdSvg: React.FC<{kind: BirdKind; accent?: boolean}> = ({kind, accent}) => {
  const fill =
    kind === "cardinal" ? ACCENT : kind === "dove" ? "#D9D0C4" : MUTED;
  const stroke = kind === "cardinal" || accent ? ACCENT : "rgba(26,22,18,0.25)";
  return (
    <svg width="120" height="72" viewBox="0 0 120 72" fill="none">
      <path
        d="M8 42 C22 28, 38 18, 58 22 C72 12, 92 14, 108 28 C96 30, 88 36, 84 44 C98 48, 110 56, 114 64 C96 58, 78 54, 62 54 C48 62, 30 64, 14 58 C18 52, 14 46, 8 42 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="2"
        opacity={kind === "flock" ? 0.55 : 0.92}
      />
      <circle cx="96" cy="30" r="2.2" fill={INK} opacity={0.5} />
      {kind === "cardinal" ? (
        <path d="M88 18 L96 8 L100 20" fill={ACCENT} opacity={0.95} />
      ) : null}
    </svg>
  );
};

const PaperLayer: React.FC<{
  seed: number;
  frame: number;
  top: number;
  left: number;
  width: number;
  height: number;
  rotate: number;
  opacity: number;
  color?: string;
}> = ({seed, frame, top, left, width, height, rotate, opacity, color = PAPER}) => {
  const lift = Math.sin(frame / 27 + seed) * 3.5;
  const slide = Math.cos(frame / 39 + seed) * 2.2;
  const paperRotate = rotate + Math.sin(frame / 54 + seed) * 0.45;
  return (
    <div
      style={{
        position: "absolute",
        top: `${top}%`,
        left: `${left}%`,
        width: `${width}%`,
        height: `${height}%`,
        backgroundColor: color,
        opacity,
        transform: `translate(${slide}px, ${lift}px) rotate(${paperRotate}deg)`,
        clipPath: tornClip(seed),
        boxShadow: "0 18px 40px rgba(89,72,55,0.18)",
      }}
    />
  );
};

const PaperEdgeMotion: React.FC<{frame: number}> = ({frame}) => {
  const breathe = Math.sin(frame / 42) * 1.8;
  const nudge = Math.cos(frame / 57) * 2.4;
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: "-28px -22px auto -22px",
          height: 70,
          backgroundColor: CREAM,
          clipPath: tornClip(18.6),
          transform: `translateY(${breathe}px) rotate(${0.08 * breathe}deg)`,
          boxShadow: "0 16px 34px rgba(89,72,55,0.12)",
          opacity: 0.82,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "auto -26px -34px -24px",
          height: 82,
          backgroundColor: "#EFE7DB",
          clipPath: tornClip(22.2),
          transform: `translate(${nudge}px, ${-breathe}px) rotate(${-0.06 * nudge}deg)`,
          boxShadow: "0 -16px 38px rgba(89,72,55,0.12)",
          opacity: 0.76,
        }}
      />
    </>
  );
};

const ArcPath: React.FC<{progress: number}> = ({progress}) => {
  const dash = 1200;
  const offset = dash * (1 - progress);
  return (
    <svg
      width="1920"
      height="1080"
      viewBox="0 0 1920 1080"
      style={{position: "absolute", inset: 0, opacity: 0.45}}
    >
      <path
        d="M120 820 C480 620, 720 480, 980 420 C1240 360, 1520 300, 1800 220"
        fill="none"
        stroke={ACCENT}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={`${dash}`}
        strokeDashoffset={offset}
        opacity={0.7}
      />
    </svg>
  );
};

const PlateBackgrounds: React.FC<{frame: number}> = ({frame}) => (
  <AbsoluteFill data-layer="gpt-plates">
    {GPT_PLATES.map((plate) => {
      const opacity = plateOpacity(frame, plate);
      if (opacity <= 0.001) return null;
      const progress = plateProgress(frame, plate);
      const scale = interpolate(progress, [0, 1], [1.018, plate.push]);
      const x = interpolate(progress, [0, 1], [0, plate.driftX]);
      const y = interpolate(progress, [0, 1], [0, plate.driftY]);
      const rotate = interpolate(progress, [0, 1], [0, plate.rotate]);
      return (
        <AbsoluteFill
          key={plate.id}
          data-asset-id={plate.id}
          style={{
            opacity,
            filter: "contrast(1.015) saturate(1.02)",
          }}
        >
          <Img
            src={staticFile(plate.src)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotate}deg)`,
              transformOrigin: plate.origin,
            }}
          />
        </AbsoluteFill>
      );
    })}
  </AbsoluteFill>
);

export const NeedMomentumBirdsHero: React.FC = () => {
  useCraftFonts();
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  // --- Beat 1: 0–2s paper settle ---
  const paperIn = interpolate(
    frame,
    [BEATS.paperSettle.startF, BEATS.paperSettle.endF],
    [0, 1],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: clayEase},
  );

  // --- Beat 3: 4.5–7.5s prosperity arc draws ---
  const arcProgress = interpolate(
    frame,
    [BEATS.flockRise.startF, BEATS.flockRise.endF],
    [0, 1],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: clayEase},
  );

  // --- Beat 4: 7.5–10.5s cardinal signal pulse ---
  const cardinalPulse = interpolate(
    frame,
    [BEATS.cardinalSignal.startF, BEATS.cardinalSignal.startF + 30, BEATS.cardinalSignal.endF],
    [0.35, 1, 0.75],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
  );

  // --- Beat 5–6: 10.5–15s wordmark + brand lockup ---
  const wordIn = interpolate(
    frame,
    [BEATS.unityWord.startF, BEATS.unityWord.endF],
    [0, 1],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: clayEase},
  );
  const wordY = interpolate(
    frame,
    [BEATS.unityWord.startF, BEATS.unityWord.endF],
    [28, 0],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: clayEase},
  );
  const lockupHold = interpolate(
    frame,
    [BEATS.brandLockup.startF, BEATS.brandLockup.endF],
    [0.92, 1],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
  );

  const draftPulse = interpolate(
    Math.sin((frame / FPS) * Math.PI * 1.2),
    [-1, 1],
    [0.78, 1],
  );

  const lockupIn = interpolate(
    frame,
    [BEATS.brandLockup.startF - 18, BEATS.brandLockup.startF + 18],
    [0, 1],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: clayEase},
  );

  const lockupY = interpolate(
    frame,
    [BEATS.brandLockup.startF - 18, BEATS.brandLockup.startF + 18],
    [34, 0],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: clayEase},
  );

  const unity = interpolate(
    frame,
    [BEATS.unityWord.startF, BEATS.brandLockup.endF],
    [0, 1],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: clayEase},
  );

  // Soft cream underlay only while first plate fades in
  const creamFade = interpolate(frame, [0, 45], [1, 0.15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{backgroundColor: CREAM, overflow: "hidden"}}>
      {/* Soft cream depth underlay */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 40%, ${CREAM} 0%, ${CREAM_DEEP} 70%, #E6DCCE 100%)`,
          opacity: creamFade,
        }}
      />

      {/* Primary: GPT scrapbook plates as beat backgrounds */}
      <PlateBackgrounds frame={frame} />
      <PaperEdgeMotion frame={frame} />

      {/* Subtle warm wash so wordmark stays readable over busy plates */}
      <AbsoluteFill
        style={{
          background:
            frame >= BEATS.unityWord.startF
              ? `linear-gradient(180deg, rgba(251,248,244,0.05) 0%, rgba(251,248,244,0.35) 55%, rgba(251,248,244,0.72) 100%)`
              : "transparent",
          opacity: wordIn,
          pointerEvents: "none",
        }}
      />

      {/* Beat 1 — light torn paper accents (plates already scrapbook; keep sparse) */}
      <div style={{opacity: paperIn * 0.35}} data-beat="paperSettle">
        <PaperLayer seed={3.1} frame={frame} top={8} left={-4} width={48} height={36} rotate={-4} opacity={0.35} />
        <PaperLayer seed={7.4} frame={frame} top={52} left={55} width={50} height={42} rotate={3.5} opacity={0.25} color={CREAM_DEEP} />
      </div>

      {/* Beat 3 — Prosperity arc accent (over plate) */}
      <div data-beat="flockRise" style={{opacity: 0.85}}>
        <ArcPath progress={arcProgress} />
      </div>

      {/* Optional SVG flock overlay — off by default (plates include birds) */}
      {SHOW_SVG_BIRDS
        ? FLOCK.map((b) => {
            const enterStart = BEATS.flockEnter.startF + b.enterOffset;
            const local = Math.max(0, frame - enterStart);
            const opacity = interpolate(local, [0, 20], [0, 0.55], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const rise = interpolate(
              frame,
              [BEATS.flockRise.startF, BEATS.brandLockup.endF],
              [0, 1],
              {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: clayEase},
            );
            const flap = Math.sin((frame + b.enterOffset) / 7) * 4;
            const unityX = interpolate(unity, [0, 1], [0, 4]);
            const unityY = interpolate(unity, [0, 1], [0, -3]);
            const x = b.x + (b.driftX / 19.2) * rise + unityX;
            const y = b.y + (b.driftY / 10.8) * rise + unityY;
            const isLead = b.id === "c1";
            const leadGlow =
              isLead && frame >= BEATS.cardinalSignal.startF
                ? `drop-shadow(0 0 ${10 + cardinalPulse * 14}px rgba(226,113,19,${0.25 + cardinalPulse * 0.45}))`
                : isLead
                  ? "drop-shadow(0 0 8px rgba(226,113,19,0.25))"
                  : undefined;
            return (
              <div
                key={b.id}
                data-asset-id={b.assetId}
                data-beat-enter="flockEnter"
                style={{
                  position: "absolute",
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: `translate(-50%, -50%) scale(${b.scale * (isLead && frame >= BEATS.cardinalSignal.startF ? 1 + cardinalPulse * 0.08 : 1)}) rotate(${b.rotate + flap}deg)`,
                  opacity,
                  filter: leadGlow,
                }}
              >
                <BirdSvg kind={b.kind} accent={isLead} />
              </div>
            );
          })
        : null}

      {/* Beats 5–6 — DRAFT wordmark + brand lockup (Outfit Bold) — no logo */}
      <div
        data-beat="unityWord-brandLockup"
        data-asset-id="NM-WORDMARK-DRAFT"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 96,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: wordIn * lockupHold,
          transform: `translateY(${wordY}px) scale(${lockupHold})`,
        }}
      >
        <div
          style={{
            fontFamily: FONT_OUTFIT,
            fontWeight: 700,
            fontSize: 104,
            letterSpacing: 0,
            color: INK,
            textAlign: "center",
            lineHeight: 1.05,
            textShadow: "0 2px 18px rgba(251,248,244,0.85)",
          }}
        >
          Need Momentum
        </div>
        <div
          style={{
            marginTop: 10,
            padding: "8px 18px 7px",
            fontFamily: FONT_OUTFIT,
            fontSize: 30,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: CREAM,
            backgroundColor: ACCENT,
            opacity: draftPulse,
            transform: "rotate(-1.5deg)",
            boxShadow: "0 10px 24px rgba(89,72,55,0.2)",
          }}
        >
          DRAFT
        </div>
        <div
          data-asset-id="NM-FUTURE-LOCKUP"
          style={{
            marginTop: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            opacity: lockupIn,
            transform: `translateY(${lockupY}px)`,
          }}
        >
          <div
            style={{
              fontFamily: FONT_SOURCE,
              fontSize: 32,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: INK,
              lineHeight: 1,
              textShadow: "0 2px 18px rgba(251,248,244,0.82)",
            }}
          >
            THE FUTURE NEEDS
          </div>
          <div
            style={{
              marginTop: 4,
              fontFamily: FONT_OUTFIT,
              fontWeight: 700,
              fontSize: 132,
              letterSpacing: 0,
              color: ACCENT,
              lineHeight: 0.92,
              textShadow: "0 4px 22px rgba(251,248,244,0.88)",
            }}
          >
            MOMENTUM
          </div>
        </div>
        <div
          style={{
            marginTop: 16,
            width: 180,
            height: 5,
            backgroundColor: ACCENT,
            borderRadius: 2,
            opacity: 0.85,
          }}
        />
      </div>

      {/* Corner craft tag */}
      <div
        style={{
          position: "absolute",
          top: 36,
          left: 48,
          fontFamily: FONT_SOURCE,
          fontSize: 16,
          color: MUTED,
          letterSpacing: "0.08em",
          opacity: interpolate(frame, [BEATS.paperSettle.startF + 20, BEATS.paperSettle.endF], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        scrapbook flock · prosperity · humanizing AI
      </div>

      {/* End hold tint — brand lockup beat */}
      <AbsoluteFill
        data-beat="brandLockup"
        style={{
          pointerEvents: "none",
          boxShadow: "inset 0 0 180px rgba(89,72,55,0.12)",
          opacity: interpolate(
            frame,
            [BEATS.brandLockup.startF, durationInFrames],
            [0.55, 0.9],
            {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
          ),
        }}
      />
    </AbsoluteFill>
  );
};
