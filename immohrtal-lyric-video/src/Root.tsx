import React from 'react';
import {Composition} from 'remotion';
import {LyricVideo} from './LyricVideo';
import lyricsData from './lyrics.json';
import {AUDIO_OFFSET_SEC, FPS, OUTRO_TAIL_SEC} from './theme';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="LyricVideo"
      component={LyricVideo}
      durationInFrames={Math.round((AUDIO_OFFSET_SEC + lyricsData.duration + OUTRO_TAIL_SEC) * FPS)}
      fps={FPS}
      width={1280}
      height={720}
    />
  );
};
