// js/engine/map.js
'use strict';

// Shared geometries — created once, reused for all tiles
const _TILE_GEO = new THREE.BoxGeometry(2, 1, 2);
const _matCache = {};

function _getTileMat(color) {
  if (!_matCache[color]) _matCache[color] = new THREE.MeshPhongMaterial({ color, shininess: 6 });
  return _matCache[color];
}

// Stored path vectors for this game session
let _PATH = [];

function getPath() { return _PATH; }

function _buildPath() {
  _PATH = State.mapCfg.path.map(([x, y, z]) => new THREE.Vector3(x, y, z));
}

function _isOnPath(x, z) {
  for (let i = 0; i < _PATH.length - 1; i++) {
    const line = new THREE.Line3(_PATH[i], _PATH[i + 1]);
    const cl   = new THREE.Vector3();
    line.closestPointToPoint(new THREE.Vector3(x, 0, z), true, cl);
    if (cl.distanceTo(new THREE.Vector3(x, 0, z)) < 3.0) return true;
  }
  return false;
}

function initMap() {
  const { scene, OPT, mapCfg, buildable } = State;
  _buildPath();

  // Ground tiles
  const cp = mapCfg.groundPalette;
  for (let x = -26; x <= 26; x += 2.2) {
    for (let z = -26; z <= 26; z += 2.2) {
      if (Math.sqrt(x * x + z * z) > 30) continue;
      const op  = _isOnPath(x, z);
      const h   = op ? 0.24 : 0.45 + Math.random() * 0.55;
      const col = op ? mapCfg.pathColor : cp[Math.floor(Math.random() * cp.length)];
      const tile = new THREE.Mesh(_TILE_GEO, _getTileMat(col));
      tile.scale.y = h;
      tile.position.set(x, h / 2, z);
      tile.receiveShadow = OPT.shadows;
      tile.userData = { occupied: false, topY: h };
      scene.add(tile);
      if (!op) buildable.push(tile);
    }
  }

  _buildCastle();

  const spawnRing = new THREE.Mesh(
    new THREE.RingGeometry(1, 1.35, 12),
    new THREE.MeshBasicMaterial({ color: 0xe74c3c, transparent: true, opacity: 0.38, side: THREE.DoubleSide })
  );
  spawnRing.rotation.x = -Math.PI / 2;
  spawnRing.position.set(_PATH[0].x, 0.32, _PATH[0].z);
  scene.add(spawnRing);

  const [cx, , cz] = mapCfg.castlePos;
  const goalRing = new THREE.Mesh(
    new THREE.RingGeometry(1.5, 2, 12),
    new THREE.MeshBasicMaterial({ color: 0xe8c840, transparent: true, opacity: 0.28, side: THREE.DoubleSide })
  );
  goalRing.rotation.x = -Math.PI / 2;
  goalRing.position.set(cx, 0.4, cz);
  scene.add(goalRing);

  if (OPT.atmosphere) _buildAtmosphere();
}

function _buildCastle() {
  const { scene, OPT, mapCfg, worldItems } = State;
  const cg = new THREE.Group();

  const keep = new THREE.Mesh(
    new THREE.BoxGeometry(5, 6, 5),
    new THREE.MeshPhongMaterial({ color: 0x2a2a36, shininess: 12 })
  );
  keep.position.y = 3;
  cg.add(keep);

  [[-2.5, -2.5], [2.5, -2.5], [-2.5, 2.5], [2.5, 2.5]].forEach(([tx, tz]) => {
    const tower = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.85, 7, 8),
      new THREE.MeshPhongMaterial({ color: 0x23233a })
    );
    tower.position.set(tx, 3.5, tz);
    cg.add(tower);
    const cap = new THREE.Mesh(
      new THREE.ConeGeometry(0.85, 1.4, 8),
      new THREE.MeshPhongMaterial({ color: 0x6a1515 })
    );
    cap.position.set(tx, 7.65, tz);
    cg.add(cap);
  });

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(3.8, 3.2, 4),
    new THREE.MeshPhongMaterial({ color: 0x7a1818 })
  );
  roof.position.y = 7.6;
  roof.rotation.y = Math.PI / 4;
  cg.add(roof);

  const castleLight = new THREE.PointLight(0xffcc66, 2.2, 12);
  castleLight.position.set(0, 5, 0);
  cg.add(castleLight);

  const [cx, cy, cz] = mapCfg.castlePos;
  cg.position.set(cx, cy, cz);
  cg.traverse(c => { if (c.isMesh) { c.castShadow = OPT.shadows; c.receiveShadow = OPT.shadows; } });
  scene.add(cg);
}

function _buildAtmosphere() {
  const { scene, mapCfg, worldItems } = State;
  const palette = {
    FOREST:  0x88ccff,
    DESERT:  0xffcc66,
    VOLCANO: 0xff6622,
    ABYSS:   0x8844ff,
  };
  const col = palette[mapCfg.id] || 0x88ccff;

  for (let i = 0; i < 35; i++) {
    const p = new THREE.Mesh(
      new THREE.SphereGeometry(0.055),
      new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.45 })
    );
    p.position.set((Math.random() - 0.5) * 50, 1.2 + Math.random() * 9, (Math.random() - 0.5) * 50);
    worldItems.push({ mesh: p, phase: Math.random() * Math.PI * 2, baseY: p.position.y });
    scene.add(p);
  }
}
