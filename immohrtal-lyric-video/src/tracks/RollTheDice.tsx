import React from 'react';
import lyricsData from './roll-the-dice-lyrics.json';
import {FloatingIcons, IconShape} from '../FloatingIcons';
import {LyricVideoBase, LyricsData} from '../LyricVideoBase';
import {TrackPalette} from '../TrackTheme';

// "Roll the Dice" — high-stakes casino-night vibe: electric purple + gold
// on the IMMOHRTAL night base, dice tumbling through the frame.
export const rollTheDiceLyrics = lyricsData as LyricsData;

export const ROLL_THE_DICE_PALETTE: TrackPalette = {
  accentA: '#c084fc',
  accentB: '#fbbf24',
  softA: '#e9d5ff',
  softB: '#fde68a',
  washA: 'rgba(147, 51, 234, 0.22)',
  washB: 'rgba(245, 158, 11, 0.14)',
};

const DieFive: IconShape = ({color}) => (
  <svg viewBox="0 0 48 48" fill="none" style={{width: '100%', height: '100%'}}>
    <rect x="3" y="3" width="42" height="42" rx="9" stroke={color} strokeWidth="2.5" />
    <circle cx="14" cy="14" r="3.4" fill={color} />
    <circle cx="34" cy="14" r="3.4" fill={color} />
    <circle cx="24" cy="24" r="3.4" fill={color} />
    <circle cx="14" cy="34" r="3.4" fill={color} />
    <circle cx="34" cy="34" r="3.4" fill={color} />
  </svg>
);

const DieTwo: IconShape = ({color}) => (
  <svg viewBox="0 0 48 48" fill="none" style={{width: '100%', height: '100%'}}>
    <rect x="3" y="3" width="42" height="42" rx="9" stroke={color} strokeWidth="2.5" />
    <circle cx="16" cy="16" r="3.8" fill={color} />
    <circle cx="32" cy="32" r="3.8" fill={color} />
  </svg>
);

const RollTheDiceMotifs: React.FC = () => (
  <FloatingIcons
    shapes={[DieFive, DieTwo]}
    colors={[ROLL_THE_DICE_PALETTE.accentA, ROLL_THE_DICE_PALETTE.accentB]}
    spin={40}
  />
);

export const RollTheDiceVideo: React.FC = () => (
  <LyricVideoBase
    audioFile="roll-the-dice.mp3"
    lyrics={rollTheDiceLyrics}
    palette={ROLL_THE_DICE_PALETTE}
    Motifs={RollTheDiceMotifs}
  />
);
