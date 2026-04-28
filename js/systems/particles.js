// js/systems/particles.js
'use strict';

const _particlePool = [];
// Single shared geometry and per-color materials cached
const _P_GEO      = new THREE.BufferGeometry();
const _P_VERTS    = new Float32Array(3);
_P_GEO.setAttribute('position', new THREE.BufferAttribute(_P_VERTS, 3));

// Use Points instead of individual Mesh objects — one draw call for all particles
// Each particle is a Point in a PointsMaterial system

// Simple pooled Box approach but with shared geo (better than per-instance geo)
const _PMESH_GEO = new THREE.BoxGeometry(0.14, 0.14, 0.14);
const _pMatCache = {};

function _getPMat(color) {
  if (!_pMatCache[color]) {
    _pMatCache[color] = new THREE.MeshBasicMaterial({ color, transparent: true });
  }
  return _pMatCache[color];
}

function spawnParticles(pos, color, count, speed = 0.22) {
  if (!State.OPT.particles) return;
  // Cap total particles for perf
  const maxTotal = 80;
  const actual   = Math.min(count, maxTotal - State.particles.length);
  if (actual <= 0) return;

  for (let i = 0; i < actual; i++) {
    let p;
    if (_particlePool.length) {
      p = _particlePool.pop();
      p.mesh.material = _getPMat(color); // swap material, no new object
      p.mesh.visible  = true;
    } else {
      p = { mesh: new THREE.Mesh(_PMESH_GEO, _getPMat(color)) };
      State.scene.add(p.mesh);
    }
    p.mesh.position.set(
      pos.x + (Math.random() - 0.5) * 0.3,
      pos.y + 0.4,
      pos.z + (Math.random() - 0.5) * 0.3
    );
    p.vel  = new THREE.Vector3((Math.random() - 0.5) * speed, Math.random() * 0.42, (Math.random() - 0.5) * speed);
    p.life = 1.0;
    State.particles.push(p);
  }
}

function returnParticle(p) {
  _particlePool.push(p);
}

function floatText(pos3d, text, color = '#fff') {
  if (!State.OPT.floattext) return;
  const el       = document.createElement('div');
  el.className   = 'ft';
  el.style.color = color;
  el.textContent = text;
  document.body.appendChild(el);
  const v    = pos3d.clone().project(State.camera);
  el.style.left = (v.x * 0.5 + 0.5) * window.innerWidth  + 'px';
  el.style.top  = (-v.y * 0.5 + 0.5) * window.innerHeight + 'px';
  setTimeout(() => el.remove(), 980);
}