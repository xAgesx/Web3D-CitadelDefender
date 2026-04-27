// js/config/waves.js
'use strict';

/**
 * Generates the wave definition array for a given map config.
 * @param {object} mapCfg - a MAPS entry
 * @returns {Array<object>} waveDefs
 */
function buildWaveDefs(mapCfg) {
  const defs = [];
  for (let w = 1; w <= mapCfg.waves; w++) {
    const boss     = w % 5 === 0;
    const miniFreq = mapCfg.id === 'ABYSS' ? 3 : 4;
    const mini     = w % miniFreq === 0 && !boss;
    const abyssBoss = mapCfg.id === 'ABYSS' && w % 3 === 0;
    const isBoss   = boss || abyssBoss;
    defs.push({
      boss:     isBoss,
      mini,
      count:    isBoss ? 1 : mini ? 4 : 10 + w * 3,
      swarm:    w >= 5,
      fast:     w >= 3,
      armored:  w >= 7,
      shield:   mapCfg.id === 'ABYSS' && w >= 5,
      interval: Math.max(350, mapCfg.spawnInterval - w * 14),
    });
  }
  return defs;
}

/**
 * Returns an array of enemy type strings for one wave.
 * @param {number} w - wave number (1-based)
 * @param {object} def - a waveDef entry
 * @returns {string[]}
 */
function buildSpawnList(w, def) {
  const list = [];
  if (def.boss) { list.push('BOSS'); return list; }
  for (let i = 0; i < def.count; i++) {
    if (def.mini && i === Math.floor(def.count / 2)) { list.push('MINI_BOSS'); continue; }
    const r = Math.random();
    if (def.shield  && r < .12) list.push('SHIELDED');
    else if (def.armored && r < .14) list.push('ARMORED');
    else if (def.fast    && r < .26) list.push('FAST');
    else if (def.swarm   && r < .42) list.push('SWARM');
    else list.push('NORMAL');
  }
  return list;
}

/**
 * Returns HTML badge string showing enemy composition of the next wave.
 * @param {number} n - next wave number
 * @param {Array}  waveDefs
 * @param {object} mapCfg
 * @returns {string}
 */
function wavePreviewHTML(n, waveDefs, mapCfg) {
  if (n > mapCfg.waves) return '';
  const d = waveDefs[n - 1];
  const tags = [];
  if (d.boss) tags.push(['BOSS', '#cc00ff']);
  else {
    if (d.mini)    tags.push(['MINI',     '#ff8800']);
    if (d.shield)  tags.push(['SHIELDED', '#4499ff']);
    if (d.armored) tags.push(['ARMORED',  '#667788']);
    if (d.fast)    tags.push(['FAST',     '#ffee00']);
    if (d.swarm)   tags.push(['SWARM',    '#ff3366']);
    if (!tags.length) tags.push(['STD',   '#ff4466']);
  }
  return tags.map(([t, c]) => `<span class="wet" style="color:${c};border:1px solid ${c}50">${t}</span>`).join('');
}
