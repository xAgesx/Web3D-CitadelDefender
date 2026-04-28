// js/state.js
'use strict';

const State = {
  gState: 'IDLE',      
  selectedMapId: null,
  mapCfg: null,
  waveDefs: [],

  gold: 300,
  lives: 20,
  wave: 0,
  score: 0,
  kills: 0,
  xp: 0,
  rank: 1,

  waveActive: false,
  activeType: null,     
  selTower: null,       
  gSpeed: 1,
  shakeAmt: 0,
  comboKills: 0,
  comboTmr: null,

  OPT: {
    shadows:    true,
    particles:  true,
    atmosphere: true,
    floattext:  true,
    quality:    2,
  },

  scene:    null,
  camera:   null,
  renderer: null,
  orbit:    null,
  sun:      null,
  ghost:    null,       

  enemies:    [],
  towers:     [],
  bullets:    [],
  particles:  [],
  worldItems: [],  
  buildable:  [],  
  
  frameN: 0,

  
  ray:   null,
  mouse: null,

  
  reset(mapCfg) {
    this.mapCfg    = mapCfg;
    this.waveDefs  = buildWaveDefs(mapCfg);
    this.gold      = mapCfg.startGold;
    this.lives     = mapCfg.lives;
    this.wave      = 0;
    this.score     = 0;
    this.kills     = 0;
    this.xp        = 0;
    this.rank      = 1;
    this.gSpeed    = 1;
    this.shakeAmt  = 0;
    this.comboKills= 0;
    this.waveActive= false;
    this.activeType= null;
    this.selTower  = null;
    this.gState    = 'PLAYING';
    this.frameN    = 0;
    this.enemies   = [];
    this.towers    = [];
    this.bullets   = [];
    this.particles = [];
    this.worldItems= [];
    this.buildable = [];
  },
};
