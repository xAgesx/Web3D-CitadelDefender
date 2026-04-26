// js/main.js
'use strict';

// ── Map select grid ──────────────────────────────────────────────
(function buildMapGrid() {
  const grid = document.getElementById('map-grid');
  MAP_ORDER.forEach(id => {
    const m    = MAPS[id];
    const card = document.createElement('div');
    card.className = 'map-card';
    card.innerHTML = `
      <div class="map-icon">${m.icon}</div>
      <div class="map-name">${m.name}</div>
      <div class="map-diff ${m.diffClass}">${m.diff}</div>`;
    card.onclick = () => {
      document.querySelectorAll('.map-card').forEach(c => c.classList.remove('sel'));
      card.classList.add('sel');
      State.selectedMapId = id;
      document.getElementById('btn-start').disabled = false;
    };
    grid.appendChild(card);
  });
})();

document.getElementById('btn-start').addEventListener('click', () => {
  if (!State.selectedMapId) return;

  SFX.init();
  Music.init();
  Music.play(0);

  State.reset(MAPS[State.selectedMapId]);
  _lbActiveMap = State.selectedMapId; // set LB default tab

  document.getElementById('ts').style.display  = 'none';
  document.getElementById('gc').style.display  = 'block';
  document.getElementById('hud').style.display = 'block';

  initRenderer();
  initMap();

  HUD.syncFromState();

  initInput();

  startLoop();
});
