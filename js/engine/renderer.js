// js/engine/renderer.js
'use strict';

function initRenderer() {
  const { OPT, mapCfg } = State;

  State.renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('gc'),
    antialias: false,              // off by default — biggest single GPU win
    powerPreference: 'high-performance',
    stencil: false,                // not needed
    depth: true,
  });
  State.renderer.setSize(window.innerWidth, window.innerHeight);
  State.renderer.setPixelRatio(Math.min(window.devicePixelRatio, OPT.quality));
  State.renderer.shadowMap.enabled = OPT.shadows;
  State.renderer.shadowMap.type    = THREE.BasicShadowMap; // cheapest shadow type
  State.renderer.shadowMap.autoUpdate = true;

  State.scene = new THREE.Scene();
  State.scene.background = new THREE.Color(mapCfg.skyColor);
  State.scene.fog = new THREE.FogExp2(mapCfg.fogColor, mapCfg.fogDensity);

  State.camera = new THREE.PerspectiveCamera(44, window.innerWidth / window.innerHeight, 0.5, 400); // near/far tighter
  State.camera.position.set(28, 36, 28);

  State.orbit = new THREE.OrbitControls(State.camera, State.renderer.domElement);
  State.orbit.enableDamping  = true;
  State.orbit.maxPolarAngle  = Math.PI / 2.25;
  State.orbit.minDistance    = 12;
  State.orbit.maxDistance    = 80;
  State.orbit.dampingFactor  = 0.07;
  State.orbit.touches        = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };

  // Minimal lighting — one sun (shadow), one ambient, no fill
  const amb = new THREE.AmbientLight(mapCfg.ambLight, 0.7); // boosted to compensate for no fill
  State.scene.add(amb);

  State.sun = new THREE.DirectionalLight(mapCfg.sunColor, 1.0);
  State.sun.position.set(28, 48, 18);
  State.sun.castShadow = OPT.shadows;
  if (OPT.shadows) {
    State.sun.shadow.mapSize.set(512, 512);  // keep small
    State.sun.shadow.camera.left   = -30;
    State.sun.shadow.camera.right  =  30;
    State.sun.shadow.camera.top    =  30;
    State.sun.shadow.camera.bottom = -30;
    State.sun.shadow.bias          = -0.003;
  }
  State.scene.add(State.sun);

  // Ghost placement indicator
  State.ghost = new THREE.Mesh(
    new THREE.BoxGeometry(2, 0.22, 2),
    new THREE.MeshBasicMaterial({ color: 0x55ffaa, transparent: true, opacity: 0.3 })
  );
  State.ghost.visible = false;
  State.scene.add(State.ghost);

  // Raycaster + mouse
  State.ray   = new THREE.Raycaster();
  State.mouse = new THREE.Vector2();

  window.addEventListener('resize', () => {
    State.camera.aspect = window.innerWidth / window.innerHeight;
    State.camera.updateProjectionMatrix();
    State.renderer.setSize(window.innerWidth, window.innerHeight);
  });
}