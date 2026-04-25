// js/config/maps.js
'use strict';

const MAPS = {
  FOREST: {
    id: 'FOREST', name: 'Whispering Forest', icon: '🌲', diff: 'EASY', diffClass: 'easy',
    waves: 20, lives: 25, startGold: 320,
    hpMult: 1.0, speedMult: 1.0, rewardMult: 1.0, spawnInterval: 780,
    skyColor: 0x05100a, fogColor: 0x05100a, fogDensity: .009,
    groundPalette: [0x0e1a0e, 0x112214, 0x0c160b],
    pathColor: 0x1a140c, ambLight: 0x1a3020, sunColor: 0xd8f0d0,
    path: [[-22,0,-16],[0,0,-16],[0,0,0],[-14,0,0],[-14,0,14],[14,0,14]],
    castlePos: [14, 0, 14],
  },
  DESERT: {
    id: 'DESERT', name: 'Scorched Sands', icon: '🏜️', diff: 'MEDIUM', diffClass: 'med',
    waves: 22, lives: 20, startGold: 300,
    hpMult: 1.25, speedMult: 1.18, rewardMult: 1.2, spawnInterval: 640,
    skyColor: 0x100a03, fogColor: 0x100a03, fogDensity: .010,
    groundPalette: [0x1c1408, 0x221808, 0x18120a],
    pathColor: 0x2a1e0a, ambLight: 0x402010, sunColor: 0xffcc80,
    path: [[-22,0,0],[0,0,0],[0,0,-12],[12,0,-12],[12,0,12],[22,0,12]],
    castlePos: [22, 0, 12],
  },
  VOLCANO: {
    id: 'VOLCANO', name: 'Inferno Peak', icon: '🌋', diff: 'HARD', diffClass: 'hard',
    waves: 18, lives: 15, startGold: 280,
    hpMult: 1.6, speedMult: 1.3, rewardMult: 1.5, spawnInterval: 560,
    skyColor: 0x120300, fogColor: 0x180400, fogDensity: .012,
    groundPalette: [0x1a0800, 0x200a00, 0x150600],
    pathColor: 0x2a0e00, ambLight: 0x401008, sunColor: 0xff8844,
    path: [[-20,0,-14],[-8,0,-14],[-8,0,-4],[4,0,-4],[4,0,10],[-4,0,10],[-4,0,18],[14,0,18]],
    castlePos: [14, 0, 18],
  },
  ABYSS: {
    id: 'ABYSS', name: 'Shadow Abyss', icon: '🌑', diff: 'NIGHTMARE', diffClass: 'nightmare',
    waves: 15, lives: 10, startGold: 260,
    hpMult: 2.1, speedMult: 1.45, rewardMult: 2.0, spawnInterval: 450,
    skyColor: 0x020005, fogColor: 0x020005, fogDensity: .014,
    groundPalette: [0x0a0012, 0x0c0016, 0x060010],
    pathColor: 0x180022, ambLight: 0x150025, sunColor: 0xaa88ff,
    path: [[-20,0,-16],[-6,0,-16],[-6,0,-6],[6,0,-6],[6,0,6],[-6,0,6],[-6,0,16],[14,0,16]],
    castlePos: [14, 0, 16],
  },
};

const MAP_ORDER = ['FOREST', 'DESERT', 'VOLCANO', 'ABYSS'];
