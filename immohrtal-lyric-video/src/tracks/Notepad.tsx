import React from 'react';
import lyricsData from './notepad-lyrics.json';
import {FloatingIcons, IconShape} from '../FloatingIcons';
import {LyricVideoBase, LyricsData} from '../LyricVideoBase';
import {TrackPalette} from '../TrackTheme';

// "Picking Up My Notepad" — writer's-desk vibe: amber pencil + teal ink on
// the IMMOHRTAL night base, notepads and pens drifting by.
export const notepadLyrics = lyricsData as LyricsData;

export const NOTEPAD_PALETTE: TrackPalette = {
  accentA: '#fbbf24',
  accentB: '#2dd4bf',
  softA: '#fde68a',
  softB: '#99f6e4',
  washA: 'rgba(245, 158, 11, 0.16)',
  washB: 'rgba(20, 184, 166, 0.18)',
};

const Notepad: IconShape = ({color}) => (
  <svg viewBox="0 0 40 48" fill="none" style={{width: '100%', height: '100%'}}>
    <rect x="4" y="6" width="32" height="38" rx="4" stroke={color} strokeWidth="2.5" />
    <path d="M11 3v6M20 3v6M29 3v6" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M11 18h18M11 25h18M11 32h12" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const Pencil: IconShape = ({color}) => (
  <svg viewBox="0 0 44 44" fill="none" style={{width: '100%', height: '100%'}}>
    <path
      d="M31 5l8 8L15 37l-10 2 2-10L31 5z"
      stroke={color}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <path d="M27 9l8 8" stroke={color} strokeWidth="2.5" />
  </svg>
);

const NotepadMotifs: React.FC = () => (
  <FloatingIcons
    shapes={[Notepad, Pencil]}
    colors={[NOTEPAD_PALETTE.accentA, NOTEPAD_PALETTE.accentB]}
    spin={18}
  />
);

export const NotepadVideo: React.FC = () => (
  <LyricVideoBase
    audioFile="notepad.mp3"
    lyrics={notepadLyrics}
    palette={NOTEPAD_PALETTE}
    Motifs={NotepadMotifs}
  />
);
