// js/entities/Tower.js
'use strict';

// Shared geometries — one instance for all towers of each type
const _TOWER_GEOS = {
  ARCHER:    new THREE.OctahedronGeometry(0.42),
  BLAST:     new THREE.CylinderGeometry(0.18, 0.38, 0.85, 6),
  FROST:     new THREE.IcosahedronGeometry(0.42),
  POISON:    new THREE.TetrahedronGeometry(0.46),
  LIGHTNING: new THREE.TorusKnotGeometry(0.26, 0.085, 20, 3), // reduced segments
};
const _BASE_GEO = new THREE.CylinderGeometry(0.9, 1.1, 0.38, 8);
const _COL_GEO  = new THREE.CylinderGeometry(0.42, 0.58, 1.75, 6);

// Shared materials for base/column (same color on all towers)
const _BASE_MAT = new THREE.MeshPhongMaterial({ color: 0x1a1a2e, shininess: 18 });
const _COL_MAT  = new THREE.MeshPhongMaterial({ color: 0x22223a, shininess: 14 });

// Scratch vector for fire origin
const _FIRE_ORIGIN = new THREE.Vector3();

class Tower {
  constructor(block, type) {
    this.type     = type;
    this.level    = 1;
    this.block    = block;
    this.lastShot = 0;
    this.squash   = 1;
    this.config   = JSON.parse(JSON.stringify(TOWER_DEFS[type]));

    this.mesh = new THREE.Group();
    const c   = this.config.pc;

    // Base + column share materials across all tower instances
    const plat = new THREE.Mesh(_BASE_GEO, _BASE_MAT);
    plat.position.y = 0.19;
    plat.castShadow = false; // tower base shadows disabled for perf
    this.mesh.add(plat);

    const col = new THREE.Mesh(_COL_GEO, _COL_MAT);
    col.position.y = 1.06;
    col.castShadow = false;
    this.mesh.add(col);

    this.head = new THREE.Group();
    this.head.position.y = 2.1;

    // Crystal: unique material per tower (color differs), shared geo
    this.crystal = new THREE.Mesh(
      _TOWER_GEOS[type],
      new THREE.MeshPhongMaterial({ color: c, emissive: c, emissiveIntensity: 0.62 })
    );
    this.head.add(this.crystal);
    this.mesh.add(this.head);

    // NO PointLight per tower — replaced with a single emissive pulse
    // This alone cuts draw calls significantly with many towers
    this._glowIntensity = 0;

    this.mesh.position.set(block.position.x, block.userData.topY, block.position.z);
    this.mesh.userData = { tower: this };
    State.scene.add(this.mesh);
  }

  update(t) {
    // Squash
    this.squash += (1 - this.squash) * 0.1;
    this.head.scale.set(1 / this.squash, this.squash, 1 / this.squash);
    this.crystal.rotation.y += 0.02;

    // Find closest enemy — direct loop, no array methods
    let best = null, bestD = this.config.range;
    const en = State.enemies;
    const mp = this.mesh.position;
    for (let i = 0; i < en.length; i++) {
      const d = en[i].mesh.position.distanceTo(mp);
      if (d < bestD) { bestD = d; best = en[i]; }
    }

    if (best) {
      this.head.lookAt(best.mesh.position);
      if (t - this.lastShot > this.config.rate / State.gSpeed) {
        this._fire(best);
        this.lastShot = t;
        this.squash   = 1.42;
        // Emissive flash instead of point light
        this.crystal.material.emissiveIntensity = 1.5;
      }
    } else {
      this.head.rotation.y += 0.01;
    }

    // Decay emissive flash
    if (this.crystal.material.emissiveIntensity > 0.62) {
      this.crystal.material.emissiveIntensity -= 0.06;
    }
  }

  _fire(primary) {
    _FIRE_ORIGIN.copy(this.mesh.position);
    _FIRE_ORIGIN.y += 2.1;

    if (this.type === 'LIGHTNING') {
      const en    = State.enemies;
      const chain = [primary];
      const pp    = primary.mesh.position;
      for (let i = 0; i < en.length && chain.length - 1 < this.config.chain; i++) {
        if (en[i] !== primary && en[i].mesh.position.distanceTo(pp) < 4.5) chain.push(en[i]);
      }
      for (let i = 0; i < chain.length; i++) {
        State.bullets.push(new Bullet(_FIRE_ORIGIN.clone(), chain[i], this.config));
      }
    } else {
      State.bullets.push(new Bullet(_FIRE_ORIGIN.clone(), primary, this.config));
    }
    SFX.shoot(this.type);
  }

  upgrade() {
    const cost = this.upgCost();
    if (State.gold < cost || this.level >= 5) return false;
    HUD.addGold(-cost);
    this.level++;
    this.config.damage *= 1.38;
    this.config.range  += 0.45;
    this.config.rate    = Math.max(200, this.config.rate * 0.88);
    if (this.config.dot)   this.config.dot   *= 1.28;
    if (this.config.chain) this.config.chain  = Math.min(5, this.config.chain + 1);
    this.crystal.scale.multiplyScalar(1.10);
    this.crystal.material.emissiveIntensity = Math.min(1.4, this.crystal.material.emissiveIntensity + 0.16);
    SFX.upgrade();
    spawnParticles(this.mesh.position, this.config.pc, 18);
    return true;
  }

  upgCost()   { return Math.floor(this.config.cost * 1.65 * this.level); }
  sellValue() { return Math.floor(this.config.cost * 0.52 + (this.level - 1) * this.config.cost * 0.34); }
}