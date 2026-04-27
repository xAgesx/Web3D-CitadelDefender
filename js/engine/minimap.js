// js/engine/minimap.js
'use strict';

let _mmFrame = 0;

function drawMinimap() {
  if (++_mmFrame % 4 !== 0) return; // throttle: draw every 4 frames

  const cv  = document.getElementById('mmc');
  const ctx = cv.getContext('2d');
  const W   = 88;
  const sc  = W / 64;

  ctx.clearRect(0, 0, W, W);

  // Background
  ctx.fillStyle = '#05070f';
  ctx.fillRect(0, 0, W, W);

  // Path
  const PATH = getPath();
  ctx.strokeStyle = '#3a2510';
  ctx.lineWidth = 5;
  ctx.beginPath();
  PATH.forEach((p, i) => {
    const x = (p.x + 32) * sc;
    const y = (p.z + 32) * sc;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Towers
  State.towers.forEach(t => {
    const x = (t.mesh.position.x + 32) * sc;
    const y = (t.mesh.position.z + 32) * sc;
    ctx.fillStyle = '#' + t.config.pc.toString(16).padStart(6, '0');
    ctx.fillRect(x - 2, y - 2, 3, 3);
  });

  // Enemies
  State.enemies.forEach(e => {
    const x = (e.mesh.position.x + 32) * sc;
    const y = (e.mesh.position.z + 32) * sc;
    ctx.fillStyle = e.type === 'BOSS' ? '#cc00ff' : '#ff4466';
    ctx.beginPath();
    ctx.arc(x, y, e.type === 'BOSS' ? 3 : 1.8, 0, Math.PI * 2);
    ctx.fill();
  });

  // Castle dot
  const [cx, , cz] = State.mapCfg.castlePos;
  ctx.fillStyle = '#e8c840';
  ctx.beginPath();
  ctx.arc((cx + 32) * sc, (cz + 32) * sc, 3, 0, Math.PI * 2);
  ctx.fill();
}
