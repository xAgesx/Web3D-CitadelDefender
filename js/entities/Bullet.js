// js/entities/Bullet.js
'use strict';

// Shared geometries
const _B_SMALL = new THREE.SphereGeometry(0.17, 4, 4); // low poly
const _B_LARGE = new THREE.SphereGeometry(0.30, 4, 4);

// Scratch vector
const _BTGT = new THREE.Vector3();

class Bullet {
  constructor(pos, target, cfg) {
    this.target = target;
    this.cfg    = cfg;

    // Reuse material per color where possible (most bullets of same tower type share color)
    this.mesh = new THREE.Mesh(
      cfg.splash > 0 ? _B_LARGE : _B_SMALL,
      new THREE.MeshBasicMaterial({ color: cfg.pc }) // MeshBasic — no lighting calc
    );
    this.mesh.position.copy(pos);
    // No PointLight on bullets — too many mid-wave
    State.scene.add(this.mesh);
  }

  update() {
    if (!this.target || !State.enemies.includes(this.target)) { this.remove(); return; }

    _BTGT.copy(this.target.mesh.position);
    _BTGT.y += this.target.size * 0.5;
    _BTGT.sub(this.mesh.position);

    const len = _BTGT.length();
    if (len < 0.52) {
      this._impact();
    } else {
      _BTGT.multiplyScalar((0.86 * State.gSpeed) / len);
      this.mesh.position.add(_BTGT);
    }
  }

  _impact() {
    if (this.cfg.splash > 0) {
      const pos = this.mesh.position;
      const en  = State.enemies;
      for (let i = 0; i < en.length; i++) {
        if (en[i].mesh.position.distanceTo(pos) < this.cfg.splash) {
          en[i].takeDamage(this.cfg.damage, this.cfg.slow, this.cfg.dot);
        }
      }
      spawnParticles(this.mesh.position, this.cfg.pc, 8);
    } else {
      this.target.takeDamage(this.cfg.damage, this.cfg.slow, this.cfg.dot);
    }
    this.remove();
  }

  remove() {
    State.scene.remove(this.mesh);
    const i = State.bullets.indexOf(this);
    if (i > -1) State.bullets.splice(i, 1);
  }
}