import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  random,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import lyricsData from './notepad-lyrics.json';
import {FloatingIcons, IconShape} from '../FloatingIcons';
import {LyricVideoBase, LyricsData} from '../LyricVideoBase';
import {TrackPalette} from '../TrackTheme';

// "Picking Up My Notepad" — a writer's desk at night. Amber pencil-light and
// teal ink on the IMMOHRTAL night base: spiral notepads and pencils rise like
// thoughts, loose torn pages flutter down past them, and faint scribble-lines
// ink themselves across the dark — bars being written in the air.
export const notepadLyrics = lyricsData as LyricsData;

export const NOTEPAD_PALETTE: TrackPalette = {
  accentA: '#fbbf24', // amber pencil
  accentB: '#2dd4bf', // teal ink
  softA: '#fde68a',
  softB: '#99f6e4',
  washA: 'rgba(245, 158, 11, 0.15)', // desk-lamp amber, upper left
  washB: 'rgba(20, 184, 166, 0.18)', // ink-pool teal, lower right
};

// ---------------------------------------------------------------------------
// Icon shapes for the drift layers
// ---------------------------------------------------------------------------

// Spiral-top steno pad with ruled lines.
const NotepadIcon: IconShape = ({color}) => (
  <svg viewBox="0 0 40 48" fill="none" style={{width: '100%', height: '100%'}}>
    <rect x="4" y="6" width="32" height="38" rx="4" stroke={color} strokeWidth="2.5" />
    <path d="M11 3v6M20 3v6M29 3v6" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M11 18h18M11 25h18M11 32h12" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

// Side-spiral notebook variant — rings down the left edge.
const SpiralBook: IconShape = ({color}) => (
  <svg viewBox="0 0 40 48" fill="none" style={{width: '100%', height: '100%'}}>
    <rect x="7" y="4" width="30" height="40" rx="4" stroke={color} strokeWidth="2.5" />
    <path d="M4 11h6M4 19h6M4 27h6M4 35h6" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M15 16h16M15 23h16M15 30h11" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

// Classic pencil, tip down-left.
const Pencil: IconShape = ({color}) => (
  <svg viewBox="0 0 44 44" fill="none" style={{width: '100%', height: '100%'}}>
    <path
      d="M31 5l8 8L15 37l-10 2 2-10L31 5z"
      stroke={color}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <path d="M27 9l8 8" stroke={color} strokeWidth="2.5" />
    <path d="M7 29l8 8" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Fountain pen with a split nib.
const Pen: IconShape = ({color}) => (
  <svg viewBox="0 0 44 44" fill="none" style={{width: '100%', height: '100%'}}>
    <path
      d="M29 5l10 10-17 17-9 3-3-3 3-9L29 5z"
      stroke={color}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <path d="M13 31l-3 3" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="18" cy="26" r="2" stroke={color} strokeWidth="2" />
    <path d="M19.5 24.5L31 13" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Loose ruled page with a folded corner — these flutter downward.
const LoosePage: IconShape = ({color}) => (
  <svg viewBox="0 0 36 44" fill="none" style={{width: '100%', height: '100%'}}>
    <path d="M5 3h17l9 9v29H5V3z" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M22 3v9h9" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M11 19h14M11 25h14M11 31h9" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

// ---------------------------------------------------------------------------
// Self-writing scribble lines — a faint stroke inks itself in, holds a beat,
// then dissolves, reappearing somewhere else. Kept out of the central lyric
// band so the words stay dominant.
// ---------------------------------------------------------------------------

const SCRIBBLE_PATHS = [
  'M3 13 Q10 3 18 11 T33 10 T48 13 T63 8 T78 12 T93 9 T108 12',
  'M3 10 C9 2 15 19 23 11 S37 2 45 12 S59 19 67 9 S83 3 91 12 T108 9',
  'M3 12 Q12 19 20 11 T38 10 Q46 3 54 11 T72 13 T90 8 T108 11',
  'M3 9 Q9 16 16 10 T30 11 T44 8 Q52 16 60 10 T76 11 T92 9 T108 12',
];

const ScribbleLine: React.FC<{seed: number}> = ({seed}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const period = 250 + Math.floor(random(`scp-${seed}`) * 160);
  const offset = Math.floor(random(`sco-${seed}`) * period);
  const local = (frame + offset) % period;
  const cycle = Math.floor((frame + offset) / period);

  // Fresh placement each cycle, biased into the top/bottom thirds so the
  // scribbles never sit under the lyric line.
  const d = SCRIBBLE_PATHS[Math.floor(random(`scd-${seed}-${cycle}`) * SCRIBBLE_PATHS.length)];
  const topBand = random(`scb-${seed}-${cycle}`) > 0.5;
  const x = width * 0.04 + random(`scx-${seed}-${cycle}`) * width * 0.68;
  const y = topBand
    ? height * 0.06 + random(`scy-${seed}-${cycle}`) * height * 0.2
    : height * 0.7 + random(`scy-${seed}-${cycle}`) * height * 0.2;
  const rot = -9 + random(`scr-${seed}-${cycle}`) * 18;
  const scale = 1.2 + random(`scs-${seed}-${cycle}`) * 1.4;
  const color =
    random(`scc-${seed}-${cycle}`) > 0.5 ? NOTEPAD_PALETTE.softA : NOTEPAD_PALETTE.softB;

  const drawEnd = period * 0.42;
  const progress = interpolate(local, [8, drawEnd], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opacity = interpolate(
    local,
    [8, 26, period * 0.62, period * 0.8],
    [0, 0.16, 0.16, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );
  if (opacity <= 0.005) return null;

  return (
    <svg
      width={116 * scale}
      height={22 * scale}
      viewBox="0 0 116 22"
      fill="none"
      style={{
        position: 'absolute',
        left: x,
        top: y - local * 0.04, // barely lifts while it writes
        transform: `rotate(${rot}deg)`,
        opacity,
        filter: `drop-shadow(0 0 8px ${color})`,
      }}
    >
      <path
        d={d}
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray={100}
        strokeDashoffset={100 - progress * 100}
      />
    </svg>
  );
};

// ---------------------------------------------------------------------------

const NotepadMotifs: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    {/* Writing tools drift upward like rising thoughts */}
    <FloatingIcons
      shapes={[NotepadIcon, SpiralBook, Pencil, Pen]}
      colors={[NOTEPAD_PALETTE.accentA, NOTEPAD_PALETTE.accentB, NOTEPAD_PALETTE.softA]}
      count={8}
      opacityRange={[0.09, 0.16]}
      sizeRange={[44, 102]}
      riseSpeed={0.1}
      spin={16}
    />
    {/* Loose pages flutter down past them — counter-motion for depth */}
    <FloatingIcons
      shapes={[LoosePage]}
      colors={[NOTEPAD_PALETTE.softA, NOTEPAD_PALETTE.softB]}
      count={4}
      opacityRange={[0.08, 0.13]}
      sizeRange={[36, 68]}
      riseSpeed={-0.17}
      spin={28}
    />
    {/* Handwriting that inks itself across the night */}
    {Array.from({length: 4}, (_, i) => (
      <ScribbleLine key={i} seed={i} />
    ))}
  </AbsoluteFill>
);

export const NotepadVideo: React.FC = () => (
  <LyricVideoBase
    audioFile="notepad.mp3"
    lyrics={notepadLyrics}
    palette={NOTEPAD_PALETTE}
    Motifs={NotepadMotifs}
  />
);
