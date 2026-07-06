import React from 'react';
import lyricsData from './grade-a-love-lyrics.json';
import {FloatingIcons, IconShape} from '../FloatingIcons';
import {LyricVideoBase, LyricsData} from '../LyricVideoBase';
import {TrackPalette} from '../TrackTheme';

// "Grade A Love" — warm romance vibe: rose + soft gold on the IMMOHRTAL
// night base, hearts drifting upward like embers.
export const gradeALoveLyrics = lyricsData as LyricsData;

export const GRADE_A_LOVE_PALETTE: TrackPalette = {
  accentA: '#fb7185',
  accentB: '#f9a8d4',
  softA: '#fecdd3',
  softB: '#fbcfe8',
  washA: 'rgba(244, 63, 94, 0.20)',
  washB: 'rgba(236, 72, 153, 0.14)',
};

const Heart: IconShape = ({color}) => (
  <svg viewBox="0 0 44 40" fill="none" style={{width: '100%', height: '100%'}}>
    <path
      d="M22 37C10 28 3 21.5 3 13.5 3 7.5 7.5 3 13 3c3.6 0 7 1.9 9 5 2-3.1 5.4-5 9-5 5.5 0 10 4.5 10 10.5C41 21.5 34 28 22 37z"
      stroke={color}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  </svg>
);

const HeartFilled: IconShape = ({color}) => (
  <svg viewBox="0 0 44 40" fill="none" style={{width: '100%', height: '100%'}}>
    <path
      d="M22 37C10 28 3 21.5 3 13.5 3 7.5 7.5 3 13 3c3.6 0 7 1.9 9 5 2-3.1 5.4-5 9-5 5.5 0 10 4.5 10 10.5C41 21.5 34 28 22 37z"
      fill={color}
      opacity="0.7"
    />
  </svg>
);

const GradeALoveMotifs: React.FC = () => (
  <FloatingIcons
    shapes={[Heart, HeartFilled]}
    colors={[GRADE_A_LOVE_PALETTE.accentA, GRADE_A_LOVE_PALETTE.accentB]}
    riseSpeed={0.22}
    spin={10}
  />
);

export const GradeALoveVideo: React.FC = () => (
  <LyricVideoBase
    audioFile="grade-a-love.mp3"
    lyrics={gradeALoveLyrics}
    palette={GRADE_A_LOVE_PALETTE}
    Motifs={GradeALoveMotifs}
  />
);
