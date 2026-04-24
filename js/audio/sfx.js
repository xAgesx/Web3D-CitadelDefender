// js/audio/sfx.js
'use strict';

const SFX = (() => {
  let ctx = null, ready = false;

  function init() {
    if (ctx) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      ready = true;
    } catch (e) {}
  }

  function tone(freq, type, dur, vol, slide = 0, delay = 0) {
    if (!ready || !ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const T = ctx.currentTime + delay;
    osc.type = type;
    osc.frequency.setValueAtTime(freq, T);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(10, freq + slide), T + dur);
    gain.gain.setValueAtTime(vol, T);
    gain.gain.exponentialRampToValueAtTime(0.001, T + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(T);
    osc.stop(T + dur);
  }

  return {
    init,
    shoot(type) {
      if      (type === 'ARCHER')    tone(900,  'sine',     .09, .020, -500);
      else if (type === 'BLAST')   { tone(110,  'triangle', .45, .060,  -75); tone(190, 'sawtooth', .18, .022, -90); }
      else if (type === 'FROST')     tone(1500, 'sine',     .28, .020,  280);
      else if (type === 'POISON')    tone(380,  'sine',     .38, .016, -140);
      else                         { tone(1900, 'sawtooth', .07, .032,-1700); tone(780, 'square', .09, .016, -580); }
    },
    hit()       { tone(75,  'square',   .035, .007); },
    baseHit()   { tone(55,  'sawtooth', .38,  .100, -38); tone(38, 'sine', .55, .12); },
    place()     { tone(280, 'sine',     .11,  .033,  280); tone(470, 'sine', .18, .028, 180, .05); },
    upgrade()   { [430, 540, 650, 860].forEach((f, i) => tone(f, 'sine', .13, .052, 90, i * .07)); },
    fail()      { tone(75,  'sawtooth', .32,  .054,  -28); },
    waveStart() { tone(210, 'sine', .28, .053, 90); tone(315, 'sine', .38, .042, 45, .14); tone(420, 'sine', .48, .033, 0, .33); },
    waveClear() { [500, 630, 750, 1000].forEach((f, i) => tone(f, 'sine', .28, .052, 45, i * .1)); },
    bossAlert() { tone(100, 'sawtooth', 1.4, .070, -45); tone(75, 'square', 1.9, .090, -18); },
    rankUp()    { [250, 315, 375, 500, 630, 750].forEach((f, i) => tone(f, 'triangle', .38, .062, 90, i * .08)); },
  };
})();
