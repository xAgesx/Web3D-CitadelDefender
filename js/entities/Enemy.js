// js/entities/Enemy.js
'use strict';

//  Shared geometries (one per type, never recreated) 
const _ENEMY_GEOS = {
  BOSS:      new THREE.OctahedronGeometry(1),
  MINI_BOSS: new THREE.OctahedronGeometry(1),
  default:   new THREE.BoxGeometry(1, 1, 1),
};
const _HPBG_GEO   = new THREE.PlaneGeometry(1, 0.20);
const _HPFILL_GEO = new THREE.PlaneGeometry(1, 0.20);

// Reusable scratch vector — never allocate inside update()
const _DIR = new THREE.Vector3();

class Enemy {
  constructor(waveNum, type = 'NORMAL') {
    this.type       = type;
    this.pathIdx    = 0;
    this.slowFactor = 1;
    this.dotDmg     = 0;
    this.dotTimer   = 0;
    this.poisoned   = false;
    this.shieldHp   = 0;
    this.hasShield  = false;
    this._bbOffset  = Math.floor(Math.random() * 3); // stagger billboard per enemy

    const B  = type === 'BOSS';
    const M  = type === 'MINI_BOSS';
    const S  = type === 'SWARM';
    const F  = type === 'FAST';
    const A  = type === 'ARMORED';
    const SH = type === 'SHIELDED';
    const mc = State.mapCfg;

    const hpBase   = B ? 2200 : M ? 700 : A ? 220 : SH ? 120 : S ? 22 : F ? 38 : 55;
    this.hp        = this.maxHp = hpBase * Math.pow(1.22, waveNum) * mc.hpMult;
    this.armor     = A ? 0.42 : B ? 0.30 : SH ? 0.15 : 0;
    this.baseSpeed = (B ? 0.038 : M ? 0.048 : A ? 0.046 : S ? 0.14 : F ? 0.17 : 0.082) * mc.speedMult;
    this.reward    = Math.round((B ? 420 : M ? 160 : A ? 38 : SH ? 30 : S ? 9 : F ? 13 : 16) * mc.rewardMult);
    if (SH) { this.hasShield = true; this.shieldHp = 80 * Math.pow(1.15, waveNum); }

    const sz  = B ? 2.4 : M ? 1.65 : A ? 1.35 : SH ? 1.1 : S ? 0.52 : F ? 0.68 : 0.82;
    const col = B ? 0xcc00ff : M ? 0xff8800 : A ? 0x667788 : SH ? 0x4499ff : S ? 0xff3366 : F ? 0xffee00 : 0xff4466;
    this.size = sz;

    this.mesh = new THREE.Group();

    const geoKey  = (B || M) ? type : 'default';
    const mat     = new THREE.MeshPhongMaterial({ color: col, emissive: col, emissiveIntensity: 0.18, shininess: 16 });
    this.bodyMesh = new THREE.Mesh(_ENEMY_GEOS[geoKey] || _ENEMY_GEOS.default, mat);
    this.bodyMesh.scale.setScalar(sz);
    this.bodyMesh.position.y = sz / 2 + 0.08;
    this.bodyMesh.castShadow = false; // enemies never cast shadows
    this.mesh.add(this.bodyMesh);

    if (SH) {
      this.shieldMesh = new THREE.Mesh(
        new THREE.SphereGeometry(sz * 0.9, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0x4499ff, transparent: true, opacity: 0.28, wireframe: true })
      );
      this.shieldMesh.position.copy(this.bodyMesh.position);
      this.mesh.add(this.shieldMesh);
    }

    // HP bar uses shared geo scaled per enemy
    this.hbBg = new THREE.Mesh(
      _HPBG_GEO,
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45 })
    );
    this.hbBg.scale.x    = sz * 1.7;
    this.hbBg.position.y = sz + 0.85;

    this.hbFill = new THREE.Mesh(
      _HPFILL_GEO,
      new THREE.MeshBasicMaterial({ color: 0x00dd66 })
    );
    this.hbFill.scale.x    = sz * 1.7;
    this.hbFill.position.y = sz + 0.851;

    this.mesh.add(this.hbBg);
    this.mesh.add(this.hbFill);

    this.mesh.position.copy(getPath()[0]);
    State.scene.add(this.mesh);
  }

  update() {
    const PATH = getPath();
    const tgt  = PATH[this.pathIdx + 1];
    if (!tgt) { this.reachGoal(); return; }

    // Zero-allocation movement using scratch vector
    _DIR.subVectors(tgt, this.mesh.position);
    const len = _DIR.length();

    if (len < 0.32) {
      this.pathIdx++;
    } else {
      _DIR.multiplyScalar((this.baseSpeed * this.slowFactor * State.gSpeed) / len);
      this.mesh.position.add(_DIR);
      this.bodyMesh.rotation.y = Math.atan2(_DIR.x, _DIR.z);
    }

    this.slowFactor = Math.min(1, this.slowFactor + 0.005 * State.gSpeed);

    if (this.poisoned) {
      this.dotTimer -= State.gSpeed * 0.016;
      if (this.dotTimer <= 0) {
        this.dotTimer = 0.6;
        this.hp = Math.max(0, this.hp - this.dotDmg);
        this._updateHpBar();
        if (this.hp <= 0) this.die();
      }
    }

    // Staggered billboard — each enemy updates on a different frame
    if ((State.frameN + this._bbOffset) % 3 === 0) {
      this.hbBg.lookAt(State.camera.position);
      this.hbFill.lookAt(State.camera.position);
      if (this.shieldMesh) this.shieldMesh.lookAt(State.camera.position);
    }
  }

  _updateHpBar() {
    const r = Math.max(0, this.hp / this.maxHp);
    this.hbFill.scale.x    = r * this.size * 1.7;
    this.hbFill.position.x = (r - 1) * this.size * 0.85;
    this.hbFill.material.color.setHex(r > 0.5 ? 0x00dd66 : r > 0.25 ? 0xffbb00 : 0xff3322);
  }

  takeDamage(dmg, slow, dot) {
    if (this.hasShield && this.shieldHp > 0) {
      this.shieldHp -= dmg;
      if (this.shieldHp <= 0) {
        this.hasShield = false;
        if (this.shieldMesh) { this.mesh.remove(this.shieldMesh); this.shieldMesh = null; }
        spawnParticles(this.mesh.position, 0x4499ff, 8);
      }
      return;
    }
    this.hp -= dmg * (1 - this.armor);
    if (slow > 0) this.slowFactor = Math.min(this.slowFactor, 1 - slow);
    if (dot > 0)  { this.poisoned = true; this.dotDmg = dot / 10; this.dotTimer = 0; }
    this._updateHpBar();
    SFX.hit();
    if (this.hp <= 0) this.die();
  }

  die() {
    const pos = this.mesh.position.clone();
    HUD.addGold(this.reward);
    HUD.addXP(this.type === 'BOSS' ? 85 : this.type === 'MINI_BOSS' ? 45 : this.type === 'SWARM' ? 3 : 12);
    HUD.addScore(Math.floor(this.reward * (1 + State.kills / 200)));
    State.kills++;
    State.comboKills++;
    clearTimeout(State.comboTmr);
    State.comboTmr = setTimeout(() => {
      State.comboKills = 0;
      document.getElementById('combo').classList.remove('show');
    }, 2200);
    if (State.comboKills >= 3) {
      document.getElementById('combon').textContent = 'x' + State.comboKills;
      document.getElementById('combo').classList.add('show');
    }
    spawnParticles(pos, this.bodyMesh.material.color.getHex(),
      this.type === 'BOSS' ? 30 : this.type === 'SWARM' ? 2 : 7);
    if (this.type === 'BOSS' || this.type === 'MINI_BOSS')
      State.shakeAmt = this.type === 'BOSS' ? 1.8 : 0.8;
    if (State.OPT.floattext) floatText(pos, '+' + this.reward + 'G', '#e8c840');
    this.remove();
  }

  reachGoal() {
    const dmg = this.type === 'BOSS' ? 14 : this.type === 'MINI_BOSS' ? 6 : this.type === 'SWARM' ? 1 : 2;
    HUD.addLives(-dmg);
    State.shakeAmt = this.type === 'BOSS' ? 2.2 : 0.65;
    SFX.baseHit();
    this.remove();
  }

  remove() {
    State.scene.remove(this.mesh);
    const i = State.enemies.indexOf(this);
    if (i > -1) State.enemies.splice(i, 1);
    if (State.enemies.length === 0 && State.waveActive) onWaveCleared();
  }
}