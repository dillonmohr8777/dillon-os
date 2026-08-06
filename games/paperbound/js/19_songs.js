/* ==========================================================================
   PAPERBOUND — 19_songs.js
   Chiptune patterns for the tracker in 02_audio.js.
   "." holds the previous note, "-" rests. Percussion lane: o kick, X snare,
   x hat.
   ========================================================================== */
'use strict';

(function () {
  var S = PB.Audio.defineSong;

  S('title', {
    bpm: 96, div: 4, tracks: [
      { wave: 'square', vol: .11, seq: 'C5 . E5 . G5 . E5 . A5 . . . G5 . . . F5 . A5 . C6 . A5 . G5 . . . . . . .' },
      { wave: 'triangle', vol: .13, seq: 'C3 . . . G3 . . . A2 . . . E3 . . . F2 . . . C3 . . . G2 . . . G2 . . .' },
      { wave: 'square', vol: .05, seq: 'E4 . . . B4 . . . C5 . . . G4 . . . A4 . . . E5 . . . D5 . . . D5 . . .' },
      { wave: 'noise', vol: .22, seq: 'x - x - X - x - x - x - X - x x x - x - X - x - x - x - X - x x' }
    ]
  });

  S('town', {
    bpm: 118, div: 4, tracks: [
      { wave: 'square', vol: .1, seq: 'G4 A4 B4 . D5 . B4 . A4 . G4 . E4 . . . F4 G4 A4 . C5 . A4 . G4 . E4 . D4 . . .' },
      { wave: 'triangle', vol: .12, seq: 'G2 . D3 . G2 . D3 . E2 . B2 . E2 . B2 . F2 . C3 . F2 . C3 . D2 . A2 . D2 . A2 .' },
      { wave: 'square', vol: .045, seq: 'B4 . . . G4 . . . G4 . . . E4 . . . A4 . . . F4 . . . B3 . . . F4 . . .' },
      { wave: 'noise', vol: .2, seq: 'x - x x X - x - x - x x X - x - x - x x X - x - x - x x X - x x' }
    ]
  });

  S('forest', {
    bpm: 104, div: 4, tracks: [
      { wave: 'triangle', vol: .13, seq: 'E4 . G4 . A4 . B4 . D5 . B4 . A4 . G4 . E4 . D4 . E4 . G4 . A4 . . . . . . .' },
      { wave: 'triangle', vol: .12, seq: 'E2 . . . B2 . . . C3 . . . G2 . . . A2 . . . E3 . . . D3 . . . B2 . . .' },
      { wave: 'square', vol: .04, seq: '- - B4 . - - D5 . - - E5 . - - D5 . - - A4 . - - C5 . - - B4 . . . . .' },
      { wave: 'noise', vol: .13, seq: 'x - - x - - x - x - - x - - x - x - - x - - x - x - - x - x - -' }
    ]
  });

  S('ember', {
    bpm: 132, div: 4, tracks: [
      { wave: 'sawtooth', vol: .085, seq: 'D4 . F4 . G4 . A4 . C5 . A4 . G4 . F4 . D4 . D4 . F4 . G4 . A#4 . A4 . G4 . F4 .' },
      { wave: 'triangle', vol: .14, seq: 'D2 . . . D2 . . . F2 . . . F2 . . . G2 . . . G2 . . . A2 . . . A2 . . .' },
      { wave: 'square', vol: .05, seq: 'A4 . . . A4 . . . C5 . . . C5 . . . D5 . . . D5 . . . E5 . . . E5 . . .' },
      { wave: 'noise', vol: .26, seq: 'o - x - X - x o o - x - X - x x o - x - X - x o o - x x X - x x' }
    ]
  });

  S('harbor', {
    bpm: 100, div: 4, tracks: [
      { wave: 'square', vol: .095, seq: 'A4 . C5 . E5 . D5 . C5 . A4 . G4 . E4 . F4 . A4 . C5 . B4 . A4 . G4 . E4 . . .' },
      { wave: 'triangle', vol: .13, seq: 'A2 . E3 . A2 . E3 . F2 . C3 . F2 . C3 . D2 . A2 . D2 . A2 . E2 . B2 . E2 . B2 .' },
      { wave: 'triangle', vol: .055, seq: 'E4 . . . C5 . . . A4 . . . F4 . . . D4 . . . A4 . . . G4 . . . B3 . . .' },
      { wave: 'noise', vol: .16, seq: 'x - - - X - - - x - - - X - - x x - - - X - - - x - - - X - x -' }
    ]
  });

  S('carnival', {
    bpm: 142, div: 4, tracks: [
      { wave: 'square', vol: .1, seq: 'C5 E5 G5 E5 C5 E5 G5 E5 D5 F5 A5 F5 D5 F5 A5 F5 E5 G5 C6 G5 E5 G5 C6 G5 D5 B4 G4 B4 D5 F5 A5 G5' },
      { wave: 'triangle', vol: .13, seq: 'C3 . G2 . C3 . G2 . D3 . A2 . D3 . A2 . E3 . B2 . E3 . B2 . G2 . D3 . G2 . G2 .' },
      { wave: 'square', vol: .045, seq: 'G4 . . . E4 . . . A4 . . . F4 . . . B4 . . . G4 . . . B3 . . . D4 . . .' },
      { wave: 'noise', vol: .24, seq: 'o x X x o x X x o x X x o x X x o x X x o x X x o x X x o X x X' }
    ]
  });

  S('library', {
    bpm: 84, div: 4, tracks: [
      { wave: 'triangle', vol: .13, seq: 'D4 . F4 . A4 . . . G4 . E4 . D4 . . . C4 . E4 . G4 . . . F4 . D4 . C4 . . .' },
      { wave: 'triangle', vol: .11, seq: 'D2 . . . A2 . . . B1 . . . F2 . . . C2 . . . G2 . . . A1 . . . E2 . . .' },
      { wave: 'square', vol: .038, seq: '- - A4 . - - D5 . - - G4 . - - B4 . - - G4 . - - C5 . - - F4 . - - A4 .' },
      { wave: 'noise', vol: .09, seq: '- - - x - - - - - - - x - - - - - - - x - - - - - - - x - - - x' }
    ]
  });

  S('frost', {
    bpm: 92, div: 4, tracks: [
      { wave: 'triangle', vol: .13, seq: 'B4 . . . F#5 . . . E5 . . . D5 . . . C#5 . . . E5 . . . D5 . . . B4 . . .' },
      { wave: 'triangle', vol: .12, seq: 'B2 . . . B2 . . . G2 . . . G2 . . . A2 . . . A2 . . . E2 . . . F#2 . . .' },
      { wave: 'square', vol: .05, seq: 'F#5 . . . B5 . . . B4 . . . F#5 . . . E5 . . . A5 . . . F#5 . . . D5 . . .' },
      { wave: 'noise', vol: .1, seq: '- - x - - - x - - - x - - - x x - - x - - - x - - - x - - x - -' }
    ]
  });

  S('foundry', {
    bpm: 136, div: 4, tracks: [
      { wave: 'sawtooth', vol: .08, seq: 'E4 E4 - E4 G4 - E4 - D4 D4 - D4 F4 - D4 - C4 C4 - C4 E4 - C4 - D4 - E4 - G4 - A4 -' },
      { wave: 'triangle', vol: .14, seq: 'E2 . E2 . E2 . E2 . D2 . D2 . D2 . D2 . C2 . C2 . C2 . C2 . D2 . D2 . G2 . G2 .' },
      { wave: 'square', vol: .04, seq: 'B4 . . . B4 . . . A4 . . . A4 . . . G4 . . . G4 . . . A4 . . . B4 . . .' },
      { wave: 'noise', vol: .28, seq: 'o - X - o - X - o - X - o - X x o - X - o - X - o - X - o X X x' }
    ]
  });

  S('blot', {
    bpm: 88, div: 4, tracks: [
      { wave: 'sawtooth', vol: .075, seq: 'C4 . . . D#4 . . . C4 . . . A#3 . . . G#3 . . . A#3 . . . C4 . . . . . . .' },
      { wave: 'triangle', vol: .14, seq: 'C2 . . . C2 . . . G#1 . . . G#1 . . . A#1 . . . A#1 . . . G1 . . . G1 . . .' },
      { wave: 'square', vol: .035, seq: '- - - - G4 . . . - - - - D#4 . . . - - - - C4 . . . - - - - D#4 . . .' },
      { wave: 'noise', vol: .18, seq: 'o - - - X - - - o - - - X - - x o - - - X - - - o - - x X - x -' }
    ]
  });

  S('battle', {
    bpm: 150, div: 4, tracks: [
      { wave: 'square', vol: .1, seq: 'A4 - A4 C5 - A4 - E5 D5 - C5 - A4 - G4 - F4 - F4 A4 - F4 - C5 A#4 - A4 - F4 - E4 -' },
      { wave: 'triangle', vol: .14, seq: 'A2 . A2 . A2 . A2 . A2 . A2 . A2 . A2 . F2 . F2 . F2 . F2 . E2 . E2 . E2 . E2 .' },
      { wave: 'square', vol: .045, seq: 'E5 . . . E5 . . . C5 . . . C5 . . . A4 . . . A4 . . . B4 . . . B4 . . .' },
      { wave: 'noise', vol: .26, seq: 'o - x - X - x - o - x - X - x x o - x - X - x - o - x x X - x X' }
    ]
  });

  S('boss', {
    bpm: 160, div: 4, tracks: [
      { wave: 'sawtooth', vol: .085, seq: 'D4 D4 - D4 F4 - D4 A#3 C4 C4 - C4 D#4 - C4 G3 A#3 A#3 - A#3 D4 - A#3 F3 A3 - C4 - D4 - F4 -' },
      { wave: 'triangle', vol: .15, seq: 'D2 D2 D2 D2 D2 D2 D2 D2 C2 C2 C2 C2 C2 C2 C2 C2 A#1 A#1 A#1 A#1 A#1 A#1 A#1 A#1 A1 A1 A1 A1 A1 A1 A1 A1' },
      { wave: 'square', vol: .05, seq: 'A4 . . . A4 . . . G4 . . . G4 . . . F4 . . . F4 . . . E4 . . . A4 . . .' },
      { wave: 'noise', vol: .3, seq: 'o x X x o x X x o x X x o x X X o x X x o x X x o x X x o X X X' }
    ]
  });

  S('final', {
    bpm: 168, div: 4, tracks: [
      { wave: 'sawtooth', vol: .09, seq: 'E4 - G4 - B4 - E5 - D5 - B4 - G4 - E4 - F4 - A4 - C5 - F5 - E5 - C5 - A4 - F4 -' },
      { wave: 'triangle', vol: .15, seq: 'E2 E2 E2 E2 E2 E2 E2 E2 E2 E2 E2 E2 E2 E2 E2 E2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2' },
      { wave: 'square', vol: .055, seq: 'B4 . . . E5 . . . G5 . . . E5 . . . C5 . . . F5 . . . A5 . . . F5 . . .' },
      { wave: 'noise', vol: .32, seq: 'o x X x o x X x o x X x o X X X o x X x o x X x o x X x o X X X' }
    ]
  });

  S('victory', {
    bpm: 130, div: 4, tracks: [
      { wave: 'square', vol: .12, seq: 'C5 E5 G5 C6 . . . . A5 . F5 . G5 . . . C6 . . . . . . . . . . . . . . .' },
      { wave: 'triangle', vol: .14, seq: 'C3 . G2 . C3 . . . F2 . C3 . G2 . . . C3 . . . . . . . . . . . . . . .' },
      { wave: 'noise', vol: .22, seq: 'o - X - o - X - o - X - o - X x o - - - - - - - - - - - - - - -' }
    ]
  });

  S('coliseum', {
    bpm: 146, div: 4, tracks: [
      { wave: 'square', vol: .1, seq: 'G4 . B4 . D5 . B4 . G5 . D5 . B4 . G4 . F4 . A4 . C5 . A4 . F5 . C5 . A4 . F4 .' },
      { wave: 'triangle', vol: .14, seq: 'G2 . D3 . G2 . D3 . G2 . D3 . G2 . D3 . F2 . C3 . F2 . C3 . F2 . C3 . F2 . C3 .' },
      { wave: 'square', vol: .045, seq: 'D5 . . . G5 . . . B4 . . . D5 . . . C5 . . . F5 . . . A4 . . . C5 . . .' },
      { wave: 'noise', vol: .27, seq: 'o x X x o x X x o x X x o x X X o x X x o x X x o x X x o X X x' }
    ]
  });

  S('voidsong', {
    bpm: 72, div: 4, tracks: [
      { wave: 'sine', vol: .12, seq: 'C5 . . . . . . . A#4 . . . . . . . G4 . . . . . . . A#4 . . . . . . .' },
      { wave: 'triangle', vol: .1, seq: 'C2 . . . . . . . . . . . . . . . G1 . . . . . . . . . . . . . . .' },
      { wave: 'sine', vol: .05, seq: '- - - - G5 . . . - - - - F5 . . . - - - - D5 . . . - - - - F5 . . .' }
    ]
  });

  S('sad', {
    bpm: 74, div: 4, tracks: [
      { wave: 'triangle', vol: .13, seq: 'A4 . . . G4 . . . F4 . . . E4 . . . D4 . . . E4 . . . F4 . . . . . . .' },
      { wave: 'triangle', vol: .11, seq: 'A2 . . . . . . . F2 . . . . . . . D2 . . . . . . . E2 . . . . . . .' }
    ]
  });

  S('credits', {
    bpm: 108, div: 4, tracks: [
      { wave: 'square', vol: .1, seq: 'C5 . D5 . E5 . G5 . A5 . G5 . E5 . D5 . C5 . D5 . E5 . C5 . D5 . . . . . . .' },
      { wave: 'triangle', vol: .13, seq: 'C3 . G2 . A2 . E3 . F2 . C3 . G2 . D3 . C3 . G2 . A2 . E3 . F2 . G2 . C3 .' },
      { wave: 'square', vol: .04, seq: 'E4 . . . G4 . . . C5 . . . B4 . . . A4 . . . G4 . . . E4 . . . E4 . . .' },
      { wave: 'noise', vol: .16, seq: 'x - x - X - x - x - x - X - x x x - x - X - x - x - x - X - x x' }
    ]
  });

  S('tense', {
    bpm: 112, div: 4, tracks: [
      { wave: 'triangle', vol: .12, seq: 'D3 . . . D#3 . . . D3 . . . A2 . . . D3 . . . F3 . . . E3 . . . D3 . . .' },
      { wave: 'sawtooth', vol: .05, seq: '- - - - - - - - A4 . . . - - - - - - - - - - - - A#4 . . . - - - -' },
      { wave: 'noise', vol: .14, seq: 'o - - - - - - - o - - - - - - x o - - - - - - - o - - - - - x -' }
    ]
  });
})();
