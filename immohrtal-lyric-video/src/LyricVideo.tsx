import React from 'react';
import lyricsData from './lyrics.json';
import {LyricVideoBase, LyricsData} from './LyricVideoBase';
import {Motifs} from './Motifs';
import {BRAND_PALETTE} from './TrackTheme';

// Original inspirational video — brand palette, sparkle/star/bolt motifs.
export const LyricVideo: React.FC = () => (
  <LyricVideoBase
    audioFile="track.mp3"
    lyrics={lyricsData as LyricsData}
    palette={BRAND_PALETTE}
    Motifs={Motifs}
  />
);
