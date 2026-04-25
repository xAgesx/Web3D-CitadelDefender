// js/config/towers.js
'use strict';

const TOWER_DEFS = {
  ARCHER:    { name: 'Sentry',  cost: 50,  range: 6.5, rate: 650,  damage: 12, splash: 0,   slow: 0,   dot: 0,  chain: 0, pc: 0xe8c840 },
  BLAST:     { name: 'Mortar',  cost: 110, range: 5.5, rate: 2000, damage: 50, splash: 4.2, slow: 0,   dot: 0,  chain: 0, pc: 0xe74c3c },
  FROST:     { name: 'Cryo',    cost: 85,  range: 6.5, rate: 1200, damage: 9,  splash: 2.2, slow: .6,  dot: 0,  chain: 0, pc: 0x5dade2 },
  POISON:    { name: 'Plague',  cost: 130, range: 7,   rate: 1100, damage: 5,  splash: 0,   slow: 0,   dot: 22, chain: 0, pc: 0x58d68d },
  LIGHTNING: { name: 'Tesla',   cost: 200, range: 7.5, rate: 1500, damage: 30, splash: 0,   slow: .18, dot: 0,  chain: 3, pc: 0xf39c12 },
};

const XP_TABLE = [0, 100, 250, 460, 720, 1050, 1450, 1950, 2600, 3400];
const RANKS    = ['I','II','III','IV','V','VI','VII','VIII','IX','X'];
