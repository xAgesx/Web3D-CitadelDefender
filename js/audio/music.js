// js/audio/music.js
'use strict';

const Music = (() => {
  let ctx = null, masterGain = null;
  let currentTrack = 0, paused = false, volume = 0.5;
  let scheduled = [], nextBeat = 0, beatTick = null;

  const TRACKS = [
    { name: 'Ember Citadel',   bpm: 72,  root: 220, mode: 'minor'      },
    { name: 'March of Iron',   bpm: 90,  root: 196, mode: 'dorian'     },
    { name: 'Siege at Dusk',   bpm: 80,  root: 246, mode: 'phrygian'   },
    { name: 'Ascendant Glory', bpm: 100, root: 164, mode: 'mixolydian' },
  ];

  const SCALES = {
    minor:      [0, 2, 3, 5, 7, 8, 10],
    dorian:     [0, 2, 3, 5, 7, 9, 10],
    phrygian:   [0, 1, 3, 5, 7, 8, 10],
    mixolydian: [0, 2, 4, 5, 7, 9, 10],
  };

  function init() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(ctx.destination);
  }

  function note(freq, startTime, dur, type = 'sine', vol = 0.055) {
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, startTime);
    g.gain.linearRampToValueAtTime(vol, startTime + 0.04);
    g.gain.exponentialRampToValueAtTime(0.001, startTime + dur);
    osc.connect(g);
    g.connect(masterGain);
    osc.start(startTime);
    osc.stop(startTime + dur + 0.05);
    scheduled.push(osc);
  }

  function scheduleBeat() {
    if (!ctx || paused) return;
    const track   = TRACKS[currentTrack];
    const beatLen = 60 / track.bpm;
    const scale   = SCALES[track.mode];
    const root    = track.root;
    const now     = ctx.currentTime;
    if (nextBeat < now) nextBeat = now;

    for (let b = 0; b < 8; b++) {
      const t = nextBeat + b * beatLen;
      // Bass on beats 1 & 3
      if (b % 4 === 0 || b % 4 === 2) {
        const bass = (root / 2) * Math.pow(2, scale[Math.floor(Math.random() * 3)] / 12);
        note(bass, t, beatLen * 1.8, 'triangle', 0.065);
      }
      // Melody
      if (Math.random() > 0.38) {
        const si  = Math.floor(Math.random() * scale.length);
        const oct = Math.random() > 0.5 ? 2 : 1;
        const mel = root * oct * Math.pow(2, scale[si] / 12);
        const dur = beatLen * (Math.random() > 0.5 ? 1 : 0.5);
        note(mel, t + beatLen * (b % 2 === 0 ? 0 : 0.5), dur, 'sine', 0.038);
      }
      // Ambient pad every 8 beats
      if (b === 0) {
        note(root * 1.5, t, beatLen * 8, 'sine', 0.022);
      }
    }
    nextBeat += 8 * beatLen;
  }

  function stopAll() {
    scheduled.forEach(n => { try { n.stop(); } catch (e) {} });
    scheduled = [];
    clearInterval(beatTick);
  }

  function play(idx) {
    if (!ctx) init();
    stopAll();
    currentTrack = ((idx % TRACKS.length) + TRACKS.length) % TRACKS.length;
    paused   = false;
    nextBeat = ctx.currentTime;
    scheduleBeat();
    beatTick = setInterval(scheduleBeat, 4000);
    _updateUI();
  }

  function togglePause() {
    if (!ctx) return;
    paused = !paused;
    paused ? ctx.suspend() : ctx.resume();
    document.getElementById('mplay').textContent = paused ? '▶' : '⏸';
  }

  function setVolume(v) {
    volume = v;
    if (masterGain) masterGain.gain.value = v;
  }

  function _updateUI() {
    document.getElementById('mname').textContent = TRACKS[currentTrack].name;
    document.getElementById('mplay').textContent = paused ? '▶' : '⏸';
  }

  return {
    init,
    play,
    togglePause,
    setVolume,
    next() { play(currentTrack + 1); },
    prev() { play(currentTrack - 1); },
  };
})();
