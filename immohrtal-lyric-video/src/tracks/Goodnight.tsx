import React from 'react';
import lyricsData from './goodnight-lyrics.json';
import {FloatingIcons, IconShape} from '../FloatingIcons';
import {LyricVideoBase, LyricsData} from '../LyricVideoBase';
import {TrackPalette} from '../TrackTheme';

// "Goodnight" — hushed midnight vibe: lavender + moonlight blue on the
// IMMOHRTAL night base, moons and Zzz drifting like slow breathing.
export const goodnightLyrics = lyricsData as LyricsData;

export const GOODNIGHT_PALETTE: TrackPalette = {
  accentA: '#a5b4fc',
  accentB: '#38bdf8',
  softA: '#c7d2fe',
  softB: '#bae6fd',
  washA: 'rgba(99, 102, 241, 0.20)',
  washB: 'rgba(14, 165, 233, 0.14)',
};

const Moon: IconShape = ({color}) => (
  <svg viewBox="0 0 44 44" fill="none" style={{width: '100%', height: '100%'}}>
    <path
      d="M38 27.5A17 17 0 1 1 16.5 6 13.5 13.5 0 0 0 38 27.5z"
      stroke={color}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  </svg>
);

const Zzz: IconShape = ({color}) => (
  <svg viewBox="0 0 44 44" fill="none" style={{width: '100%', height: '100%'}}>
    <path
      d="M6 12h13l-13 12h13M26 20h9l-9 8h9"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const GoodnightMotifs: React.FC = () => (
  <FloatingIcons
    shapes={[Moon, Zzz]}
    colors={[GOODNIGHT_PALETTE.accentA, GOODNIGHT_PALETTE.accentB]}
    riseSpeed={0.07}
    spin={8}
    opacityRange={[0.08, 0.14]}
  />
);

export const GoodnightVideo: React.FC = () => (
  <LyricVideoBase
    audioFile="goodnight.mp3"
    lyrics={goodnightLyrics}
    palette={GOODNIGHT_PALETTE}
    Motifs={GoodnightMotifs}
  />
);
