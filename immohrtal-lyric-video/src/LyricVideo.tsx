import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig} from 'remotion';
import './fonts';
import lyricsData from './lyrics.json';
import {Background} from './Background';
import {Motifs} from './Motifs';
import {Intro} from './Intro';
import {LyricLine, Line} from './LyricLine';
import {Logo3D} from './Logo3D';
import {Outro} from './Outro';
import {AUDIO_OFFSET_SEC, FPS} from './theme';

const lines = lyricsData.lines as Line[];

// A line stays on screen until just before the next line enters (or a beat
// after it finishes singing during instrumental gaps).
const lineWindows = lines.map((line, i) => {
  const enter = (line.start + AUDIO_OFFSET_SEC) * FPS - 8;
  const next = lines[i + 1];
  const naturalEnd = (line.end + AUDIO_OFFSET_SEC) * FPS + 40;
  const nextEnter = next ? (next.start + AUDIO_OFFSET_SEC) * FPS - 8 : Infinity;
  const end = Math.min(naturalEnd, nextEnter);
  return {from: Math.max(0, Math.round(enter)), to: Math.round(end)};
});

// Instrumental gaps longer than ~5s get a floating logo interlude.
const interludes: {from: number; to: number}[] = [];
for (let i = 0; i < lines.length - 1; i++) {
  const gap = lines[i + 1].start - lines[i].end;
  if (gap > 5) {
    interludes.push({
      from: Math.round((lines[i].end + AUDIO_OFFSET_SEC + 1.2) * FPS),
      to: Math.round((lines[i + 1].start + AUDIO_OFFSET_SEC - 0.6) * FPS),
    });
  }
}

// Lines that open after a pause get a background bloom on landing.
const pulseTimes = lines
  .filter((l, i) => i === 0 || l.start - lines[i - 1].end > 1.8)
  .map((l) => l.start + AUDIO_OFFSET_SEC);

export const LyricVideo: React.FC = () => {
  const {durationInFrames, width} = useVideoConfig();

  const introExitStart = Math.round((AUDIO_OFFSET_SEC - 0.9) * FPS);
  const introEnd = Math.round((AUDIO_OFFSET_SEC + 0.35) * FPS);

  const lastEnd = lines[lines.length - 1].end;
  const outroFrom = Math.round((lastEnd + AUDIO_OFFSET_SEC + 0.6) * FPS);

  return (
    <AbsoluteFill>
      <Background pulseTimes={pulseTimes} />
      <Motifs />

      <Sequence from={Math.round(AUDIO_OFFSET_SEC * FPS)}>
        <Audio src={staticFile('track.mp3')} />
      </Sequence>

      <Sequence from={0} durationInFrames={introEnd} name="Intro">
        <Intro fadeOutStart={introExitStart} fadeOutEnd={introEnd - 2} />
      </Sequence>

      {lines.map((line, i) => {
        const w = lineWindows[i];
        if (w.to <= w.from) return null;
        return (
          <Sequence key={i} from={w.from} durationInFrames={w.to - w.from} name={`L${i}`}>
            <LyricLine
              line={line}
              index={i}
              audioOffset={AUDIO_OFFSET_SEC - w.from / FPS}
              exitFrame={w.to - w.from - 10}
            />
          </Sequence>
        );
      })}

      {interludes.map((iv, i) =>
        iv.to > iv.from ? (
          <Sequence key={`iv-${i}`} from={iv.from} durationInFrames={iv.to - iv.from} name={`Interlude${i}`}>
            <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
              <div style={{opacity: 0.9}}>
                <Logo3D width={width * 0.2} reflection={false} wobble={7} />
              </div>
            </AbsoluteFill>
          </Sequence>
        ) : null,
      )}

      <Sequence from={outroFrom} durationInFrames={durationInFrames - outroFrom} name="Outro">
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
};
