// js/systems/waves.js
'use strict';

let _spawnTimer = null;

function startWave() {
  if (State.wave >= State.mapCfg.waves || State.waveActive || State.gState !== 'PLAYING') return;

  SFX.init();
  State.wave++;
  State.waveActive = true;

  document.getElementById('hwave').textContent = State.wave + '/' + State.mapCfg.waves;
  document.getElementById('wbtn').disabled = true;

  const def = State.waveDefs[State.wave - 1];
  _showBanner(def.boss ? '⚠ BOSS WAVE ' + State.wave + ' ⚠' : 'WAVE ' + State.wave);
  def.boss ? SFX.bossAlert() : SFX.waveStart();

  const list = buildSpawnList(State.wave, def);
  let i = 0;

  _spawnTimer = setInterval(() => {
    if (State.gState === 'OVER')   { clearInterval(_spawnTimer); return; }
    if (State.gState === 'PAUSED') return;                    // hold during pause
    if (i >= list.length)          { clearInterval(_spawnTimer); return; }
    State.enemies.push(new Enemy(State.wave, list[i++]));
  }, def.interval);
}

function onWaveCleared() {
  State.waveActive = false;
  SFX.waveClear();

  const bonus = Math.floor((90 + State.wave * 22) * State.mapCfg.rewardMult);
  HUD.addGold(bonus);
  HUD.addXP(32 + State.wave * 6);

  document.getElementById('wbamt').textContent = '+' + bonus + 'G';
  const bp = document.getElementById('wbonus');
  bp.className = 'show';
  setTimeout(() => bp.className = '', 2500);

  if (State.wave >= State.mapCfg.waves) {
    setTimeout(() => gameOver(true), 1800);
    return;
  }

  document.getElementById('wbtn').disabled = false;
  document.getElementById('wi').innerHTML  = 'Next: ' + wavePreviewHTML(State.wave + 1, State.waveDefs, State.mapCfg);
}

function _showBanner(txt) {
  const el = document.getElementById('wb');
  el.textContent = txt;
  el.className   = 'show';
  setTimeout(() => el.className = '', 2900);
}
