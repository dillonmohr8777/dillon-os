/* ==========================================================================
   PAPERBOUND — 02_audio.js
   Everything you hear is synthesised at runtime: no audio files ship with the
   game. A tiny tracker schedules note events a fraction of a second ahead of
   the audio clock so timing does not depend on the render loop.
   ========================================================================== */
'use strict';

PB.Audio = (function () {

  var ctx = null, master = null, musicBus = null, sfxBus = null;
  var ready = false, muted = false;
  var musicVol = 0.55, sfxVol = 0.7;
  var song = null, songName = '', step = 0, nextTime = 0, stepDur = 0.125;
  var LOOKAHEAD = 0.22;
  var noiseBuf = null;
  var pendingSong = null;
  var fadeOutUntil = 0;

  var NOTES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

  function freq(name) {
    if (!name || name === '-' || name === '.') return 0;
    var m = /^([A-G])([#b]?)(-?\d)$/.exec(name);
    if (!m) return 0;
    var n = NOTES[m[1]];
    if (m[2] === '#') n++; else if (m[2] === 'b') n--;
    var oct = parseInt(m[3], 10);
    var midi = (oct + 1) * 12 + n;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function init() {
    if (ctx) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = muted ? 0 : 1; master.connect(ctx.destination);
    musicBus = ctx.createGain(); musicBus.gain.value = musicVol; musicBus.connect(master);
    sfxBus = ctx.createGain(); sfxBus.gain.value = sfxVol; sfxBus.connect(master);
    // white noise source buffer for percussion / paper rustle
    var len = ctx.sampleRate * 1.0;
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = noiseBuf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    ready = true;
    if (pendingSong) { var p = pendingSong; pendingSong = null; play(p); }
  }

  function resume() {
    if (!ctx) init();
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  /* ---- one-shot voice -------------------------------------------------- */
  function voice(opt) {
    if (!ready) return;
    var t0 = opt.t || ctx.currentTime;
    var bus = opt.bus || sfxBus;
    var g = ctx.createGain();
    g.connect(bus);
    var src;
    if (opt.wave === 'noise') {
      src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
      if (opt.filter) {
        var f = ctx.createBiquadFilter();
        f.type = opt.filter; f.frequency.value = opt.cut || 1200; f.Q.value = opt.q || 1;
        src.connect(f); f.connect(g);
      } else src.connect(g);
    } else {
      src = ctx.createOscillator();
      src.type = opt.wave || 'square';
      src.frequency.setValueAtTime(Math.max(20, opt.f0 || 440), t0);
      if (opt.f1 !== undefined) {
        if (opt.glide === 'exp') src.frequency.exponentialRampToValueAtTime(Math.max(20, opt.f1), t0 + (opt.dur || 0.2));
        else src.frequency.linearRampToValueAtTime(Math.max(20, opt.f1), t0 + (opt.dur || 0.2));
      }
      if (opt.vib) {
        var lfo = ctx.createOscillator(), lg = ctx.createGain();
        lfo.frequency.value = opt.vib; lg.gain.value = opt.vibAmt || 6;
        lfo.connect(lg); lg.connect(src.frequency);
        lfo.start(t0); lfo.stop(t0 + (opt.dur || 0.2) + 0.05);
      }
      src.connect(g);
    }
    var v = (opt.vol === undefined ? 0.25 : opt.vol);
    var a = opt.atk === undefined ? 0.005 : opt.atk;
    var dur = opt.dur || 0.2;
    var rel = opt.rel === undefined ? 0.04 : opt.rel;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(v, t0 + a);
    if (opt.sus !== undefined) {
      g.gain.linearRampToValueAtTime(v * opt.sus, t0 + a + (opt.dec || 0.05));
    }
    g.gain.setValueAtTime(g.gain.value, t0 + dur);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + rel);
    src.start(t0);
    src.stop(t0 + dur + rel + 0.02);
  }

  /* ---- sfx library ----------------------------------------------------- */
  var SFX = {
    blip:      { wave: 'square',   f0: 700,  dur: 0.03, vol: 0.11, rel: 0.02 },
    blip2:     { wave: 'square',   f0: 900,  dur: 0.03, vol: 0.09, rel: 0.02 },
    cursor:    { wave: 'square',   f0: 620,  f1: 780,  dur: 0.05, vol: 0.16 },
    ok:        { wave: 'square',   f0: 660,  f1: 990,  dur: 0.09, vol: 0.2 },
    cancel:    { wave: 'square',   f0: 480,  f1: 260,  dur: 0.1,  vol: 0.18 },
    error:     { wave: 'sawtooth', f0: 190,  f1: 130,  dur: 0.16, vol: 0.16 },
    jump:      { wave: 'square',   f0: 420,  f1: 880,  dur: 0.12, vol: 0.2, glide: 'exp' },
    land:      { wave: 'noise',    filter: 'lowpass', cut: 700, dur: 0.07, vol: 0.16 },
    step:      { wave: 'noise',    filter: 'bandpass', cut: 2200, q: 2, dur: 0.035, vol: 0.06 },
    hit:       { wave: 'noise',    filter: 'lowpass', cut: 2600, dur: 0.09, vol: 0.28 },
    hitBig:    { wave: 'noise',    filter: 'lowpass', cut: 1400, dur: 0.2,  vol: 0.34 },
    mallet:    { wave: 'noise',    filter: 'lowpass', cut: 900, dur: 0.14, vol: 0.32 },
    hurt:      { wave: 'square',   f0: 330,  f1: 110,  dur: 0.22, vol: 0.24 },
    guard:     { wave: 'square',   f0: 1200, f1: 1600, dur: 0.06, vol: 0.22 },
    superguard:{ wave: 'square',   f0: 1500, f1: 2400, dur: 0.11, vol: 0.26, vib: 30, vibAmt: 40 },
    stylish:   { wave: 'triangle', f0: 1046, f1: 1568, dur: 0.14, vol: 0.24 },
    coin:      { wave: 'square',   f0: 1046, f1: 1568, dur: 0.1,  vol: 0.2 },
    heal:      { wave: 'triangle', f0: 523,  f1: 1046, dur: 0.26, vol: 0.22 },
    fp:        { wave: 'triangle', f0: 784,  f1: 1318, dur: 0.2,  vol: 0.2 },
    fold:      { wave: 'noise',    filter: 'bandpass', cut: 3400, q: 3, dur: 0.16, vol: 0.2 },
    rustle:    { wave: 'noise',    filter: 'highpass', cut: 2800, dur: 0.22, vol: 0.14 },
    fire:      { wave: 'noise',    filter: 'bandpass', cut: 1100, q: 0.7, dur: 0.4, vol: 0.24 },
    ice:       { wave: 'triangle', f0: 1800, f1: 900,  dur: 0.3,  vol: 0.2, vib: 18, vibAmt: 60 },
    zap:       { wave: 'sawtooth', f0: 1400, f1: 220,  dur: 0.18, vol: 0.2 },
    water:     { wave: 'noise',    filter: 'lowpass', cut: 600, dur: 0.34, vol: 0.2 },
    door:      { wave: 'noise',    filter: 'lowpass', cut: 500, dur: 0.3, vol: 0.2 },
    chest:     { wave: 'square',   f0: 523,  f1: 1046, dur: 0.3, vol: 0.2 },
    levelup:   { wave: 'square',   f0: 523,  f1: 1568, dur: 0.5, vol: 0.24 },
    seal:      { wave: 'triangle', f0: 392,  f1: 1568, dur: 0.7, vol: 0.26, vib: 6, vibAmt: 14 },
    roar:      { wave: 'sawtooth', f0: 150,  f1: 60,   dur: 0.7, vol: 0.3, vib: 12, vibAmt: 20 },
    defeat:    { wave: 'square',   f0: 660,  f1: 130,  dur: 0.7, vol: 0.22 },
    danger:    { wave: 'square',   f0: 880,  f1: 880,  dur: 0.09, vol: 0.2 },
    charge:    { wave: 'square',   f0: 220,  f1: 880,  dur: 0.45, vol: 0.16 },
    swap:      { wave: 'square',   f0: 880,  f1: 590,  dur: 0.09, vol: 0.16 },
    tear:      { wave: 'noise',    filter: 'bandpass', cut: 1800, q: 1.4, dur: 0.5, vol: 0.26 }
  };

  function sfx(name, detune) {
    if (!ready) { init(); if (!ready) return; }
    var o = SFX[name];
    if (!o) return;
    var c = {}; for (var k in o) c[k] = o[k];
    if (detune) { if (c.f0) c.f0 *= detune; if (c.f1) c.f1 *= detune; }
    c.bus = sfxBus;
    voice(c);
  }

  /* Layered stingers built from the primitive voices. */
  function chord(freqs, dur, wave, vol) {
    if (!ready) return;
    var t = ctx.currentTime;
    for (var i = 0; i < freqs.length; i++) {
      voice({ wave: wave || 'square', f0: freqs[i], dur: dur || 0.4, vol: (vol || 0.14), t: t + i * 0.02, bus: sfxBus, rel: 0.25 });
    }
  }
  function fanfare(kind) {
    if (!ready) { init(); if (!ready) return; }
    var t = ctx.currentTime, seq;
    if (kind === 'victory') seq = [[523, .11], [659, .11], [784, .11], [1046, .34]];
    else if (kind === 'levelup') seq = [[659, .1], [784, .1], [1046, .1], [1318, .38]];
    else if (kind === 'item') seq = [[784, .09], [1046, .22]];
    else if (kind === 'seal') seq = [[392, .14], [523, .14], [659, .14], [784, .14], [1046, .5]];
    else seq = [[523, .12], [784, .3]];
    var at = 0;
    for (var i = 0; i < seq.length; i++) {
      voice({ wave: 'square', f0: seq[i][0], dur: seq[i][1], vol: 0.2, t: t + at, bus: sfxBus, rel: 0.12 });
      voice({ wave: 'triangle', f0: seq[i][0] / 2, dur: seq[i][1], vol: 0.16, t: t + at, bus: sfxBus, rel: 0.12 });
      at += seq[i][1];
    }
  }

  /* ---- tracker --------------------------------------------------------- */
  /* A song is { bpm, div, tracks:[{wave, vol, oct, seq:"C4 . E4 - ..."}] }.
     "." sustains the previous note, "-" is a rest. All tracks must be the
     same length in steps; the shortest simply loops within the pattern. */
  var SONGS = {};
  function defineSong(name, def) {
    def.tracks.forEach(function (tr) {
      if (typeof tr.seq === 'string') tr.notes = tr.seq.trim().split(/\s+/);
      else tr.notes = tr.seq;
    });
    def.len = def.tracks.reduce(function (m, t) { return Math.max(m, t.notes.length); }, 0);
    SONGS[name] = def;
  }

  function play(name) {
    if (songName === name) return;
    if (!ready) { pendingSong = name; init(); if (!ready) { songName = name; return; } }
    songName = name;
    song = SONGS[name] || null;
    step = 0;
    if (song) {
      stepDur = 60 / song.bpm / (song.div || 4);
      nextTime = ctx.currentTime + 0.05;
    }
  }
  function stop() { song = null; songName = ''; }

  function tick() {
    if (!ready || !song) return;
    var now = ctx.currentTime;
    while (nextTime < now + LOOKAHEAD) {
      scheduleStep(step, nextTime);
      step++;
      nextTime += stepDur;
      if (step >= song.len) step = 0;
    }
  }

  function scheduleStep(s, t) {
    for (var i = 0; i < song.tracks.length; i++) {
      var tr = song.tracks[i];
      var n = tr.notes[s % tr.notes.length];
      if (!n || n === '.' || n === '-') continue;
      if (tr.wave === 'noise' || n === 'x' || n === 'X' || n === 'o') {
        // percussion lane: x = hat, X = snare, o = kick
        if (n === 'o') voice({ wave: 'sine', f0: 150, f1: 45, dur: 0.1, vol: (tr.vol || .3) * .9, t: t, bus: musicBus, glide: 'exp' });
        else if (n === 'X') voice({ wave: 'noise', filter: 'bandpass', cut: 1900, q: 0.9, dur: 0.09, vol: (tr.vol || .3) * .5, t: t, bus: musicBus });
        else voice({ wave: 'noise', filter: 'highpass', cut: 6500, dur: 0.03, vol: (tr.vol || .3) * .26, t: t, bus: musicBus });
        continue;
      }
      var f = freq(n);
      if (!f) continue;
      // sustain: extend while following steps are "."
      var hold = 1, k = s + 1;
      while (k < s + 16 && tr.notes[k % tr.notes.length] === '.') { hold++; k++; }
      voice({
        wave: tr.wave || 'square', f0: f, dur: stepDur * hold * 0.92,
        vol: tr.vol === undefined ? 0.13 : tr.vol, t: t, bus: musicBus,
        atk: tr.atk === undefined ? 0.008 : tr.atk,
        rel: tr.rel === undefined ? 0.05 : tr.rel,
        vib: tr.vib, vibAmt: tr.vibAmt
      });
    }
  }

  function setMusicVol(v) { musicVol = PB.U.clamp(v, 0, 1); if (musicBus) musicBus.gain.value = musicVol; }
  function setSfxVol(v) { sfxVol = PB.U.clamp(v, 0, 1); if (sfxBus) sfxBus.gain.value = sfxVol; }
  function getMusicVol() { return musicVol; }
  function getSfxVol() { return sfxVol; }
  function setMuted(v) { muted = v; if (master) master.gain.value = v ? 0 : 1; }
  function isMuted() { return muted; }

  return {
    init: init, resume: resume, tick: tick, sfx: sfx, chord: chord, fanfare: fanfare,
    play: play, stop: stop, defineSong: defineSong,
    setMusicVol: setMusicVol, setSfxVol: setSfxVol, getMusicVol: getMusicVol, getSfxVol: getSfxVol,
    setMuted: setMuted, isMuted: isMuted,
    get current() { return songName; }
  };
})();
