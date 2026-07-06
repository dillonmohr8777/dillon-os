import React from 'react';
import {Composition} from 'remotion';
import lyricsData from './lyrics.json';
import {LyricVideo} from './LyricVideo';
import {LyricsData, trackDurationInFrames} from './LyricVideoBase';
import {GoodnightVideo, goodnightLyrics} from './tracks/Goodnight';
import {GradeALoveVideo, gradeALoveLyrics} from './tracks/GradeALove';
import {NotepadVideo, notepadLyrics} from './tracks/Notepad';
import {RollTheDiceVideo, rollTheDiceLyrics} from './tracks/RollTheDice';
import {OUTRO_TAIL_SEC} from './theme';

const DIMS = {fps: 30, width: 1280, height: 720} as const;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="LyricVideo"
        component={LyricVideo}
        durationInFrames={trackDurationInFrames(lyricsData as LyricsData, OUTRO_TAIL_SEC)}
        {...DIMS}
      />
      <Composition
        id="RollTheDice"
        component={RollTheDiceVideo}
        durationInFrames={trackDurationInFrames(rollTheDiceLyrics, OUTRO_TAIL_SEC)}
        {...DIMS}
      />
      <Composition
        id="GradeALove"
        component={GradeALoveVideo}
        durationInFrames={trackDurationInFrames(gradeALoveLyrics, OUTRO_TAIL_SEC)}
        {...DIMS}
      />
      <Composition
        id="Notepad"
        component={NotepadVideo}
        durationInFrames={trackDurationInFrames(notepadLyrics, OUTRO_TAIL_SEC)}
        {...DIMS}
      />
      <Composition
        id="Goodnight"
        component={GoodnightVideo}
        durationInFrames={trackDurationInFrames(goodnightLyrics, OUTRO_TAIL_SEC)}
        {...DIMS}
      />
    </>
  );
};
