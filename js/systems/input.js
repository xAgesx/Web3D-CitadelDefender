// js/systems/input.js
'use strict';

function initInput() {
  window.addEventListener('pointerdown', _onPointer);
  window.addEventListener('mousemove',   _onMouseMove);
  window.addEventListener('contextmenu', _onRightClick);
  window.addEventListener('keydown',     _onKey);

  
  // Tower bar clicks
  document.querySelectorAll('.tb').forEach(btn => {
    btn.addEventListener('click',       e => _onTowerBtnClick(e, btn));
    btn.addEventListener('mouseenter',  ()  => _onTowerBtnHover(btn));
    btn.addEventListener('mouseleave',  ()  => _onTowerBtnLeave(btn));
  });

  // HUD buttons
  document.getElementById('wbtn').addEventListener('click',    startWave);
  document.getElementById('spdbtn').addEventListener('click',  _cycleSpeed);
  document.getElementById('psbtn').addEventListener('click',   togglePause);
  document.getElementById('lbbtn').addEventListener('click',   () => openLeaderboard());

  // Tower info panel
  document.getElementById('tipupg').addEventListener('click', _onUpgrade);
  document.getElementById('tipsel').addEventListener('click', _onSell);
  document.getElementById('tipcl').addEventListener('click',  closePanel);

  // Pause menu
  document.getElementById('resumebtn').addEventListener('click',    togglePause);
  document.getElementById('restartpbtn').addEventListener('click',  () => location.reload());
  ['os','op','oa','of','oq'].forEach(id => document.getElementById(id).addEventListener('change', _applySettings));


  // Game over
  document.getElementById('gosubmit').addEventListener('click', _onGoSubmit);
  document.getElementById('goskip').addEventListener('click',   () => location.reload());
  document.getElementById('golb').addEventListener('click',     _onGoLB);

  // Music bar
  document.getElementById('mplay').addEventListener('click',  () => Music.togglePause());
  document.getElementById('mnext').addEventListener('click',  () => Music.next());
  document.getElementById('mprev').addEventListener('click',  () => Music.prev());
  document.getElementById('mvol').addEventListener('input',   e  => Music.setVolume(parseFloat(e.target.value)));
}

//  Pointer / Click 
function _onPointer(e) {
  if (State.gState !== 'PLAYING') return;
  if (e.target.closest('#hud') && e.target.id !== 'gc') return;
  if (e.button !== undefined && e.button !== 0) return;

  State.mouse.set(
    e.clientX / window.innerWidth  *  2 - 1,
    e.clientY / window.innerHeight * -2 + 1
  );
  State.ray.setFromCamera(State.mouse, State.camera);

  if (State.activeType) {
    _tryPlaceTower();
  } else {
    _trySelectTower();
  }
}

function _onMouseMove(e) {
  State.mouse.set(
    e.clientX / window.innerWidth  *  2 - 1,
    e.clientY / window.innerHeight * -2 + 1
  );
}

function _onRightClick(e) {
  e.preventDefault();
  State.activeType = null;
  closePanel();
  document.querySelectorAll('.tb').forEach(b => b.classList.remove('active'));
}

//  Keyboard 
const _TOWER_KEYS = ['ARCHER', 'BLAST', 'FROST', 'POISON', 'LIGHTNING'];

function _onKey(e) {
  const idx = parseInt(e.key) - 1;
  if (idx >= 0 && idx < _TOWER_KEYS.length) {
    const type = _TOWER_KEYS[idx];
    const btn  = document.querySelector(`[data-t="${type}"]`);
    if (btn && !btn.classList.contains('lk')) {
      document.querySelectorAll('.tb').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      State.activeType = type;
      State.selTower   = null;
      closePanel();
      SFX.init();
    }
  }

  if (e.key === 'Escape') {
    const isPlaying = State.gState === 'PLAYING';
    const isPaused  = State.gState === 'PAUSED';
    if (isPlaying || isPaused) togglePause();
    State.activeType = null;
    document.querySelectorAll('.tb').forEach(b => b.classList.remove('active'));
  }

  if (e.key === ' ') {
    e.preventDefault();
    if (!document.getElementById('wbtn').disabled) startWave();
  }
}

function _tryPlaceTower() {
  const hits = State.ray.intersectObjects(State.buildable);
  if (!hits.length) return;

  const blk = hits[0].object;
  if (blk.userData.occupied) {
    HUD.toast('Occupied', 'err'); SFX.fail(); return;
  }
  const cost = TOWER_DEFS[State.activeType].cost;
  if (State.gold < cost) {
    HUD.toast('Not enough gold', 'err'); SFX.fail(); return;
  }

  State.towers.push(new Tower(blk, State.activeType));
  blk.userData.occupied = true;
  HUD.addGold(-cost);
  SFX.place();
  State.activeType = null;
  document.querySelectorAll('.tb').forEach(b => b.classList.remove('active'));
}

function _trySelectTower() {
  const hits = State.ray.intersectObjects(State.towers.map(t => t.mesh), true);
  if (!hits.length) { closePanel(); return; }

  let obj = hits[0].object;
  while (obj && !obj.userData.tower) obj = obj.parent;
  if (obj) openPanel(obj.userData.tower);
  else     closePanel();
}

//  Tower bar 
function _onTowerBtnClick(e, btn) {
  e.stopPropagation();
  if (btn.classList.contains('lk')) return;
  SFX.init();
  State.selTower   = null;
  State.activeType = btn.dataset.t;
  closePanel();
  document.querySelectorAll('.tb').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function _onTowerBtnHover(btn) {
  if (State.selTower || btn.classList.contains('lk')) return;
  const d = TOWER_DEFS[btn.dataset.t];
  _previewTowerData(d.name, 'NEW', d.damage, d.range, d.rate);
}

function _onTowerBtnLeave(btn) {
  document.getElementById('tipupg').style.display = '';
  document.getElementById('tipsel').style.display = '';
  if (!State.selTower) closePanel();
}

function _previewTowerData(name, lvl, dmg, range, rate) {
  document.getElementById('tipn').textContent   = name;
  document.getElementById('tipl').textContent   = lvl;
  document.getElementById('tpwr').textContent   = dmg;
  document.getElementById('trng').textContent   = range.toFixed(1);
  document.getElementById('tspd').textContent   = (rate / 1000).toFixed(2) + 's';
  document.getElementById('tipupg').style.display = 'none';
  document.getElementById('tipsel').style.display = 'none';
  document.getElementById('tspecr').style.display = 'none';
  document.getElementById('tip').classList.add('open');
}

//  Tower panel actions 
function _onUpgrade() {
  if (!State.selTower) return;
  if (State.selTower.upgrade()) openPanel(State.selTower);
  else HUD.toast('Cannot upgrade', 'err');
}

function _onSell() {
  if (!State.selTower) return;
  const val = State.selTower.sellValue();
  HUD.addGold(val);
  State.selTower.block.userData.occupied = false;
  State.scene.remove(State.selTower.mesh);
  State.towers.splice(State.towers.indexOf(State.selTower), 1);
  HUD.toast('+' + val + 'G', 'inf');
  SFX.place();
  closePanel();
}

//  Speed toggle 
function _cycleSpeed() {
  const speeds  = [1, 2, 3];
  const labels  = ['⚡1×', '⚡2×', '⚡3×'];
  State.gSpeed  = speeds[(speeds.indexOf(State.gSpeed) + 1) % speeds.length];
  document.getElementById('spdbtn').textContent = labels[speeds.indexOf(State.gSpeed)];
}

//  Settings 
function _applySettings() {
  State.OPT.shadows    = document.getElementById('os').checked;
  State.OPT.particles  = document.getElementById('op').checked;
  State.OPT.atmosphere = document.getElementById('oa').checked;
  State.OPT.floattext  = document.getElementById('of').checked;
  State.OPT.quality    = parseFloat(document.getElementById('oq').value);
  if (State.renderer) State.renderer.setPixelRatio(Math.min(window.devicePixelRatio, State.OPT.quality));
  if (State.renderer) State.renderer.shadowMap.enabled = State.OPT.shadows;
  if (State.sun)      State.sun.castShadow = State.OPT.shadows;
  State.worldItems.forEach(i => i.mesh.visible = State.OPT.atmosphere);
}

//  Game over handlers 
async function _onGoSubmit() {
  const name = document.getElementById('goname').value || 'Anonymous';
  if (State.selectedMapId) await LB.add(State.selectedMapId, name, State.score, State.wave);
  location.reload();
}

function _onGoLB() {
  document.getElementById('gov').style.display = 'none';
  openLeaderboard(State.score);
}