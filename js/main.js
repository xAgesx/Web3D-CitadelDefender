// js/main.js
'use strict';

//  Title screen buttons (available before game starts) 
document.getElementById('btn-lb-ts').addEventListener('click', () => openLeaderboard());
document.getElementById('lbclose').addEventListener('click', closeLeaderboard);

//  Map select grid 
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

//  Start button 
document.getElementById('btn-start').addEventListener('click', () => {
  if (!State.selectedMapId) return;

  // Init audio (requires user gesture)
  SFX.init();
  Music.init();
  Music.play(0);

  // Apply map config to state
  State.reset(MAPS[State.selectedMapId]);
  _lbActiveMap = State.selectedMapId; // set LB default tab

  // Show game elements
  document.getElementById('ts').style.display  = 'none';
  document.getElementById('gc').style.display  = 'block';
  document.getElementById('hud').style.display = 'block';

  // Boot Three.js + map geometry
  initRenderer();
  initMap();

  // Sync HUD labels from fresh state
  HUD.syncFromState();

  // Wire up keyboard/pointer/buttons
  initInput();

  // Start render loop
  startLoop();
});