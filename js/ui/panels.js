// js/ui/panels.js
'use strict';

//  Tower Info Panel 

function openPanel(tower) {
  State.selTower   = tower;
  State.activeType = null;
  document.querySelectorAll('.tb').forEach(b => b.classList.remove('active'));

  const c = tower.config;
  document.getElementById('tipn').textContent = c.name;
  document.getElementById('tipl').textContent = 'LVL ' + tower.level;
  document.getElementById('tpwr').textContent = Math.floor(c.damage);
  document.getElementById('trng').textContent = c.range.toFixed(1);
  document.getElementById('tspd').textContent = (c.rate / 1000).toFixed(2) + 's';

  // Special stat row
  const sr = document.getElementById('tspecr');
  if      (c.splash > 0) { sr.style.display='flex'; document.getElementById('tspecl').textContent='Splash'; document.getElementById('tspecv').textContent=c.splash.toFixed(1); }
  else if (c.slow   > 0) { sr.style.display='flex'; document.getElementById('tspecl').textContent='Slow';   document.getElementById('tspecv').textContent=Math.floor(c.slow*100)+'%'; }
  else if (c.dot    > 0) { sr.style.display='flex'; document.getElementById('tspecl').textContent='DoT/s';  document.getElementById('tspecv').textContent=Math.floor(c.dot); }
  else if (c.chain  > 0) { sr.style.display='flex'; document.getElementById('tspecl').textContent='Chain';  document.getElementById('tspecv').textContent=c.chain; }
  else                   { sr.style.display='none'; }

  // Upgrade button
  const uc  = tower.upgCost();
  const upb = document.getElementById('tipupg');
  upb.style.display = '';
  upb.disabled = State.gold < uc || tower.level >= 5;
  if (tower.level >= 5) {
    upb.textContent = '✓ MAX LEVEL';
  } else {
    upb.innerHTML = '⬆ Upgrade (<span id="tupc">' + uc + '</span>G)';
  }

  document.getElementById('tipsel').style.display = '';
  document.getElementById('tsv').textContent = tower.sellValue();

  document.getElementById('tip').classList.add('open');
}

function closePanel() {
  State.selTower = null;
  document.getElementById('tip').classList.remove('open');
}

//  Pause Menu 

function togglePause() {
  if (State.gState === 'PLAYING') {
    State.gState = 'PAUSED';
    document.getElementById('pmenu').style.display = 'flex';
    document.getElementById('psw').textContent = State.wave;
    document.getElementById('pss').textContent = State.score.toLocaleString();
    document.getElementById('psk').textContent = State.kills;
  } else if (State.gState === 'PAUSED') {
    State.gState = 'PLAYING';
    document.getElementById('pmenu').style.display = 'none';
  }
}

//  Game Over 

function gameOver(victory = false) {
  if (State.gState === 'OVER') return;
  State.gState = 'OVER';

  const modal = document.getElementById('gov');
  modal.style.display = 'flex';

  const title = document.getElementById('gotitle');
  title.textContent  = victory ? 'KINGDOM SAVED' : 'KINGDOM FALLEN';
  title.style.color  = victory ? 'var(--success)' : 'var(--danger)';

  document.getElementById('gow').textContent = State.wave;
  document.getElementById('gok').textContent = State.kills;
  document.getElementById('gos').textContent = State.score.toLocaleString();

  // Show name input only if score qualifies for top 10
  if (State.score > 0 && LB.isTopScore(State.selectedMapId, State.score)) {
    document.getElementById('gonf').style.display = 'block';
  }
}
