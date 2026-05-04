// js/engine/loop.js
'use strict';

// Preallocated Color for sky update — never new THREE.Color() in the loop
const _SKY_COLOR = new THREE.Color();
const _SKY_BASE  = new THREE.Color();
const _SKY_DARK  = new THREE.Color(0x111122);

function startLoop() {
  requestAnimationFrame(_tick);
}

function _tick(t) {
  requestAnimationFrame(_tick);
  State.orbit.update();
  State.frameN++;

  if (State.gState === 'PLAYING') {
    _updateEntities(t);
    _updateParticles();
    if (State.OPT.atmosphere) _updateAtmosphere(t);
    _updateSky(t);
    _updateShake();
    _updateGhost();
    drawMinimap();
  }

  State.renderer.render(State.scene, State.camera);
}

function _updateEntities(t) {
  const en = State.enemies;
  const tw = State.towers;
  const bu = State.bullets;
  for (let i = en.length - 1; i >= 0; i--) en[i].update();
  for (let i = 0; i < tw.length; i++)      tw[i].update(t);
  for (let i = bu.length - 1; i >= 0; i--) bu[i].update();
}

function _updateParticles() {
  if (!State.OPT.particles) return;
  const ps = State.particles;
  const gs = State.gSpeed;
  for (let i = ps.length - 1; i >= 0; i--) {
    const p = ps[i];
    p.mesh.position.addScaledVector(p.vel, gs);
    p.vel.y -= 0.01;
    p.life  -= 0.03 * gs;
    p.mesh.material.opacity = p.life;
    if (p.life <= 0) {
      p.mesh.visible = false;
      returnParticle(p);
      ps.splice(i, 1);
    }
  }
}

function _updateAtmosphere(t) {
  if (State.frameN % 4 !== 0) return;
  const T  = t * 0.001;
  const wi = State.worldItems;
  for (let i = 0; i < wi.length; i++) {
    wi[i].mesh.position.y       = wi[i].baseY + Math.sin(T * 0.7 + wi[i].phase) * 0.32;
    wi[i].mesh.material.opacity = 0.28 + Math.sin(T + wi[i].phase) * 0.16;
  }
}

function _updateSky(t) {
  if (State.frameN % 8 !== 0) return;
  const T = t * 0.001;
  State.sun.intensity = 0.62 + Math.sin(T * 0.042) * 0.16;
  _SKY_BASE.set(State.mapCfg.skyColor);
  _SKY_COLOR.copy(_SKY_BASE).lerp(_SKY_DARK, Math.abs(Math.sin(T * 0.02)) * 0.12);
  State.scene.background = _SKY_COLOR;
  State.scene.fog.color.copy(_SKY_COLOR);
}

function _updateShake() {
  if (State.shakeAmt > 0.015) {
    State.camera.position.x += (Math.random() - 0.5) * State.shakeAmt;
    State.camera.position.y += (Math.random() - 0.5) * State.shakeAmt * 0.35;
    State.shakeAmt *= 0.8;
  }
}

function _updateGhost() {
  if (!State.activeType) { State.ghost.visible = false; return; }
  if (State.frameN % 2 !== 0) return;
  State.ray.setFromCamera(State.mouse, State.camera);
  const hits = State.ray.intersectObjects(State.buildable);
  if (hits.length) {
    const b = hits[0].object;
    State.ghost.position.set(b.position.x, b.userData.topY + 0.14, b.position.z);
    State.ghost.visible = true;
    State.ghost.material.color.setHex(b.userData.occupied ? 0xff3333 : 0x55ffaa);
  } else {
    State.ghost.visible = false;
  }
}