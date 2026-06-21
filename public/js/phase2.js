/* ═══════════════════════════════════════════════════════════════
   SOLOMON — Phase 2: Central Sigil + Bloom Composer
   Core sphere, gyroscope rings, wireframe icosahedra,
   uranus rings, orbital particles, CSS halos, UnrealBloomPass.

   ── AVATAR STATE MACHINE ──────────────────────────────────────
   The sigil is Solomon's own embodied presence — the constant
   "self" beneath whichever ring is currently active. It reacts to
   real backend state instead of pulsing on a fixed sine wave
   regardless of what's happening.

   Two independent layers compose together each frame:

   1. OPERATIONAL STATE (idle/listening/thinking/speaking/error/offline)
      — what Solomon is doing right now. Driven via
      window.solomonSetAvatarState(name). Highest priority for color
      (error/offline fully override — that's Solomon's own condition,
      not a mood).

   2. EMOTIONAL TONE (valence/arousal, continuous) — how the last
      response actually felt, scored server-side by emotion_engine.py
      and pushed via window.solomonSetEmotion(valence, arousal). This
      is a heuristic, not a label — it blends into a color tint and a
      small motion-speed nudge rather than switching between a fixed
      set of named emotions, which keeps transitions smooth instead
      of jumpy.

   A third, lower-priority tint shows which ring is currently
   embodied at the sigil, set via window.solomonSetSigilRingTint(hex).

   Priority when multiple are active: operational state tint > ring
   tint > emotion tint, each composing into the one below it.

   'idle' operational params are bit-identical to the original
   hardcoded constants, so default behavior is unchanged.
   ═══════════════════════════════════════════════════════════════ */

// ═══════════════════════════════════════════════════════════════
// 1. DEPENDENCY GUARD
// ═══════════════════════════════════════════════════════════════
if (
  !window.solomonRenderer ||
  !window.solomonScene    ||
  !window.solomonCamera   ||
  !window.solomonUpdateStars    ||
  !window.solomonUpdateParticles ||
  !window.solomonNebulaMaterial
) {
  console.error(
    '[Solomon Phase 2] Required Phase 1 globals are missing. ' +
    'Ensure phase1.js is fully loaded and executed before phase2.js. ' +
    'Check that phase1.js exposes: solomonRenderer, solomonScene, ' +
    'solomonCamera, solomonUpdateStars, solomonUpdateParticles, solomonNebulaMaterial.'
  );
  throw new Error('[Solomon Phase 2] Aborting — Phase 1 globals not found.');
}

console.log('[Solomon Phase 2] Phase 1 globals confirmed. Initializing sigil.');

// ═══════════════════════════════════════════════════════════════
// 2. LOCAL ALIASES
// ═══════════════════════════════════════════════════════════════
const renderer = window.solomonRenderer;
const scene    = window.solomonScene;
const camera   = window.solomonCamera;

// ═══════════════════════════════════════════════════════════════
// 3. STOP PHASE 1 FROM RENDERING
// ═══════════════════════════════════════════════════════════════
window.solomonPhase1Active = false;

// ═══════════════════════════════════════════════════════════════
// 4. BLOOM COMPOSER SETUP
// ═══════════════════════════════════════════════════════════════
if (!THREE.EffectComposer || !THREE.RenderPass || !THREE.UnrealBloomPass) {
  console.error('[Solomon Phase 2] Postprocessing classes missing from THREE.*. ' +
    'Check that EffectComposer.js, RenderPass.js, UnrealBloomPass.js CDN ' +
    'scripts loaded successfully in index.html before phase2.js.');
  throw new Error('[Solomon Phase 2] Postprocessing unavailable.');
}

const composer = new THREE.EffectComposer(renderer);

const renderPass = new THREE.RenderPass(scene, camera);
renderPass.renderToScreen = false;
composer.addPass(renderPass);

const bloomPass = new THREE.UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.8,    // strength
  1.2,    // radius
  0.15    // threshold
);
composer.addPass(bloomPass);

// Resize handler for composer
window.addEventListener('resize', () => {
  composer.setSize(window.innerWidth, window.innerHeight);
});

// ═══════════════════════════════════════════════════════════════
// 5. LIGHTING
// ═══════════════════════════════════════════════════════════════
const ambientLight = new THREE.AmbientLight(0x111122, 1.2);
scene.add(ambientLight);

const sigilLight = new THREE.PointLight(0xff9d00, 4.0, 400);
sigilLight.position.set(0, 0, 80);
scene.add(sigilLight);

const rimLight = new THREE.PointLight(0x4488ff, 1.5, 350);
rimLight.position.set(0, 0, -120);
scene.add(rimLight);

// ═══════════════════════════════════════════════════════════════
// 6. SIGIL GROUP
// ═══════════════════════════════════════════════════════════════
const sigilGroup = new THREE.Group();
sigilGroup.position.set(0, 0, 0);
scene.add(sigilGroup);

// ═══════════════════════════════════════════════════════════════
// 7. COMPONENT 1 — CORE SPHERE
// ═══════════════════════════════════════════════════════════════
const BASE_CORE_COLOR = 0xff9d00; // Solomon's own "native" identity color
const coreGeo = new THREE.SphereGeometry(9, 32, 32);
const coreMat = new THREE.MeshStandardMaterial({
  color:             BASE_CORE_COLOR,
  emissive:          BASE_CORE_COLOR,
  emissiveIntensity: 4.5,
  metalness:         0.2,
  roughness:         0.4,
  transparent:       true,
  opacity:           0.95
});
const coreMesh = new THREE.Mesh(coreGeo, coreMat);
coreMesh.position.set(0, 0, 0);
sigilGroup.add(coreMesh);

// ═══════════════════════════════════════════════════════════════
// 8. COMPONENT 2 — GYROSCOPE RINGS (3 tori)
// ═══════════════════════════════════════════════════════════════
function makeGyroMat() {
  return new THREE.MeshStandardMaterial({
    color:             0xc9933a,
    emissive:          0xc9933a,
    emissiveIntensity: 0.8,
    metalness:         1.0,
    roughness:         0.15,
  });
}

const gyroGeoA = new THREE.TorusGeometry(30, 0.4, 32, 160);
const gyroMatA = makeGyroMat();
const gyroA    = new THREE.Mesh(gyroGeoA, gyroMatA);
gyroA.rotation.set(0, 0, 0);
sigilGroup.add(gyroA);

const gyroGeoB = new THREE.TorusGeometry(34, 0.6, 32, 160);
const gyroMatB = makeGyroMat();
const gyroB    = new THREE.Mesh(gyroGeoB, gyroMatB);
gyroB.rotation.set(Math.PI / 2, 0, 0);
sigilGroup.add(gyroB);

const gyroGeoC = new THREE.TorusGeometry(38, 0.3, 16, 160);
const gyroMatC = makeGyroMat();
const gyroC    = new THREE.Mesh(gyroGeoC, gyroMatC);
gyroC.rotation.set(Math.PI / 4, 0, Math.PI / 4);
sigilGroup.add(gyroC);

// ═══════════════════════════════════════════════════════════════
// 9. COMPONENT 3 — WIREFRAME ICOSAHEDRA (2 meshes)
// ═══════════════════════════════════════════════════════════════
const icoGeo = new THREE.IcosahedronGeometry(24, 2); // increased detail from 1 to 2

const icoMatA = new THREE.MeshStandardMaterial({
  color:       0xffcc44,
  wireframe:   true,
  transparent: true,
  opacity:     0.45,
  emissive:    0xffaa00,
  emissiveIntensity: 0.8
});
const icoA = new THREE.Mesh(icoGeo, icoMatA);
icoA.rotation.set(0, 0, 0);
sigilGroup.add(icoA);

const icoMatB = new THREE.MeshStandardMaterial({
  color:       0xffaa00,
  wireframe:   true,
  transparent: true,
  opacity:     0.35,
  emissive:    0xff7700,
  emissiveIntensity: 0.6
});
const icoB = new THREE.Mesh(icoGeo, icoMatB);
icoB.rotation.set(
  THREE.MathUtils.degToRad(30),
  THREE.MathUtils.degToRad(45),
  THREE.MathUtils.degToRad(15)
);
sigilGroup.add(icoB);

// Extra inner diamond structure for intricate complexity
const diamondGeo = new THREE.OctahedronGeometry(18, 0);
const diamondMat = new THREE.MeshStandardMaterial({
  color: 0xffcc33,
  wireframe: true,
  transparent: true,
  opacity: 0.6,
  emissive: 0xffaa22,
  emissiveIntensity: 1.2
});
const diamondMesh = new THREE.Mesh(diamondGeo, diamondMat);
sigilGroup.add(diamondMesh);

// ═══════════════════════════════════════════════════════════════
// 10. COMPONENT 4 — URANUS RINGS (5 thin orbital planes)
// ═══════════════════════════════════════════════════════════════
const uranusRingDefs = [
  { radius: 38, tube: 0.25, rotX: 1.20, rotY: 0.00, rotZ: 0.30,
    spinAxis: 'y', spinSpeed:  0.0012, opacity: 0.40 },
  { radius: 48, tube: 0.20, rotX: 0.40, rotY: 1.05, rotZ: 0.00,
    spinAxis: 'x', spinSpeed: -0.0009, opacity: 0.35 },
  { radius: 56, tube: 0.22, rotX: 0.80, rotY: 0.00, rotZ: 0.70,
    spinAxis: 'z', spinSpeed:  0.0015, opacity: 0.25 },
  { radius: 64, tube: 0.18, rotX: 0.20, rotY: 0.60, rotZ: 1.10,
    spinAxis: 'y', spinSpeed: -0.0010, opacity: 0.20 },
  { radius: 72, tube: 0.15, rotX: 1.50, rotY: 0.30, rotZ: 0.50,
    spinAxis: 'x', spinSpeed:  0.0008, opacity: 0.15 },
];

const uranusRings = [];

uranusRingDefs.forEach(def => {
  const geo = new THREE.TorusGeometry(def.radius, def.tube, 16, 200);
  const mat = new THREE.MeshStandardMaterial({
    color:       0xffeebb,
    transparent: true,
    opacity:     def.opacity,
    emissive:    0xffaa33,
    emissiveIntensity: def.opacity * 2.0
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.set(def.rotX, def.rotY, def.rotZ);
  sigilGroup.add(mesh);
  uranusRings.push({ mesh, def });
});

// ═══════════════════════════════════════════════════════════════
// 11. COMPONENT 5 — ORBITAL ENERGY PARTICLES
// ═══════════════════════════════════════════════════════════════
const ORBITAL_COUNT = 150;
const orbPositions  = new Float32Array(ORBITAL_COUNT * 3);
const orbColors     = new Float32Array(ORBITAL_COUNT * 3);

const orbData = [];

for (let i = 0; i < ORBITAL_COUNT; i++) {
  const orbitRadius = 32 + Math.random() * 22;
  const inclination = Math.random() * Math.PI;
  const azimuth     = Math.random() * Math.PI * 2;
  const speed       = 0.004 + Math.random() * 0.008;
  const noiseAmp    = 2.0 + Math.random() * 3.0;
  const noiseFreqX  = 0.3 + Math.random() * 0.5;
  const noiseFreqY  = 0.3 + Math.random() * 0.5;
  const noisePhaseX = Math.random() * Math.PI * 2;
  const noisePhaseY = Math.random() * Math.PI * 2;

  orbData.push({
    orbitRadius, inclination, azimuth,
    speed, noiseAmp, noiseFreqX, noiseFreqY, noisePhaseX, noisePhaseY
  });

  orbPositions[i * 3]     = 0;
  orbPositions[i * 3 + 1] = 0;
  orbPositions[i * 3 + 2] = 0;

  const t = Math.random();
  orbColors[i * 3]     = 1.0;
  orbColors[i * 3 + 1] = 0.75 + t * 0.25;
  orbColors[i * 3 + 2] = 0.2  + t * 0.4;
}

const orbGeo = new THREE.BufferGeometry();
orbGeo.setAttribute('position', new THREE.BufferAttribute(orbPositions, 3));
orbGeo.setAttribute('color',    new THREE.BufferAttribute(orbColors, 3));

const orbMat = new THREE.PointsMaterial({
  size:         2.2,
  vertexColors: true,
  transparent:  true,
  opacity:      0.85,
  sizeAttenuation: true,
});

const orbPoints = new THREE.Points(orbGeo, orbMat);
sigilGroup.add(orbPoints);

function updateOrbitalParticles(time, speedMult) {
  for (let i = 0; i < ORBITAL_COUNT; i++) {
    const d = orbData[i];
    d.azimuth += d.speed * speedMult;

    const sinInc = Math.sin(d.inclination);
    const cosInc = Math.cos(d.inclination);
    const sinAz  = Math.sin(d.azimuth);
    const cosAz  = Math.cos(d.azimuth);

    let x = d.orbitRadius * sinInc * cosAz;
    let y = d.orbitRadius * cosInc;
    let z = d.orbitRadius * sinInc * sinAz;

    x += Math.sin(time * d.noiseFreqX + d.noisePhaseX) * d.noiseAmp;
    y += Math.sin(time * d.noiseFreqY + d.noisePhaseY) * d.noiseAmp;
    z += Math.cos(time * d.noiseFreqX + d.noisePhaseX) * d.noiseAmp;

    orbPositions[i * 3]     = x;
    orbPositions[i * 3 + 1] = y;
    orbPositions[i * 3 + 2] = z;
  }
  orbGeo.attributes.position.needsUpdate = true;
}

// ═══════════════════════════════════════════════════════════════
// 12. HALO CSS CIRCLES
// ═══════════════════════════════════════════════════════════════
const haloStyle = document.createElement('style');
haloStyle.textContent = `
  @keyframes sigilHaloPulse {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50%       { opacity: 1.0; transform: scale(1.04); }
  }
`;
document.head.appendChild(haloStyle);

const haloData = [
  { size: 260, opacity: 0.18, duration: 3.2 },
  { size: 310, opacity: 0.10, duration: 4.0 },
  { size: 370, opacity: 0.05, duration: 5.1 },
];

const haloContainer = document.createElement('div');
haloContainer.id = 'sigil-halos';
haloContainer.style.cssText = [
  'position: fixed',
  'top: 50%',
  'left: 50%',
  'transform: translate(-50%, -50%)',
  'pointer-events: none',
  'z-index: 2',
  'width: 0',
  'height: 0',
].join(';');

haloData.forEach(h => {
  const halo = document.createElement('div');
  halo.style.cssText = [
    `position: absolute`,
    `width: ${h.size}px`,
    `height: ${h.size}px`,
    `top: ${-h.size / 2}px`,
    `left: ${-h.size / 2}px`,
    `border-radius: 50%`,
    `border: 1px solid rgba(201, 147, 58, ${h.opacity})`,
    `animation: sigilHaloPulse ${h.duration}s ease-in-out infinite`,
  ].join(';');
  haloContainer.appendChild(halo);
});

document.body.appendChild(haloContainer);

// ═══════════════════════════════════════════════════════════════
// 13. AVATAR STATE MACHINE — OPERATIONAL LAYER
// ═══════════════════════════════════════════════════════════════
const AVATAR_STATES = {
  idle: {
    pulseSpeed: 2.856, pulseAmpMin: 0.88, pulseAmpRange: 0.24,
    emissiveBase: 2.8, emissiveRange: 1.4, lightIntensity: 4.0,
    bloomStrength: 1.4, motionMult: 1.0, particleMult: 1.0, haloMult: 1.0,
    tintColor: null, tintWeight: 0,
  },
  listening: {
    pulseSpeed: 3.4, pulseAmpMin: 0.90, pulseAmpRange: 0.20,
    emissiveBase: 3.0, emissiveRange: 1.3, lightIntensity: 4.4,
    bloomStrength: 1.5, motionMult: 1.15, particleMult: 1.1, haloMult: 1.1,
    tintColor: null, tintWeight: 0,
  },
  thinking: {
    pulseSpeed: 6.2, pulseAmpMin: 0.92, pulseAmpRange: 0.14,
    emissiveBase: 3.6, emissiveRange: 1.0, lightIntensity: 5.2,
    bloomStrength: 1.7, motionMult: 2.2, particleMult: 1.8, haloMult: 1.3,
    tintColor: null, tintWeight: 0,
  },
  speaking: {
    pulseSpeed: 4.2, pulseAmpMin: 0.90, pulseAmpRange: 0.22,
    emissiveBase: 3.3, emissiveRange: 1.6, lightIntensity: 4.8,
    bloomStrength: 1.6, motionMult: 1.6, particleMult: 1.4, haloMult: 1.2,
    tintColor: null, tintWeight: 0,
  },
  error: {
    pulseSpeed: 11.0, pulseAmpMin: 0.80, pulseAmpRange: 0.45,
    emissiveBase: 2.2, emissiveRange: 2.2, lightIntensity: 3.6,
    bloomStrength: 1.3, motionMult: 0.4, particleMult: 0.5, haloMult: 0.8,
    tintColor: 0xff2222, tintWeight: 0.55,
  },
  offline: {
    pulseSpeed: 1.2, pulseAmpMin: 0.94, pulseAmpRange: 0.06,
    emissiveBase: 0.7, emissiveRange: 0.2, lightIntensity: 1.0,
    bloomStrength: 0.6, motionMult: 0.12, particleMult: 0.1, haloMult: 0.25,
    tintColor: 0x445566, tintWeight: 0.6,
  },
};

let avatarStateName = 'idle';
const current = Object.assign({}, AVATAR_STATES.idle);
const LERP_RATE = 0.06;

const sigilRingTint = { color: null, weight: 0 };
let tokenFlicker = 0;

function lerpCurrentTowardTarget() {
  const target = AVATAR_STATES[avatarStateName] || AVATAR_STATES.idle;
  for (const key in target) {
    if (key === 'tintColor') continue;
    current[key] += (target[key] - current[key]) * LERP_RATE;
  }
  current.tintColor  = target.tintColor;
  current.tintWeight += (target.tintWeight - current.tintWeight) * LERP_RATE;
}

// ═══════════════════════════════════════════════════════════════
// 13b. EMOTIONAL TONE LAYER (valence/arousal, continuous)
// ═══════════════════════════════════════════════════════════════
const EMOTION_CORNERS = {
  subdued:  new THREE.Color(0x5a6b85), // valence -1, arousal 0
  content:  new THREE.Color(0xffe9b0), // valence +1, arousal 0
  intense:  new THREE.Color(0xff2a2a), // valence -1, arousal 1
  excited:  new THREE.Color(0xff3da6), // valence +1, arousal 1
};

const emotionColorCurrent = new THREE.Color(BASE_CORE_COLOR);
const emotionColorTarget  = new THREE.Color(BASE_CORE_COLOR);
let emotionWeightCurrent  = 0;
let emotionWeightTarget   = 0;
let emotionMotionCurrent  = 1;
let emotionMotionTarget   = 1;

function lerpEmotionTowardTarget() {
  emotionColorCurrent.lerp(emotionColorTarget, LERP_RATE);
  emotionWeightCurrent += (emotionWeightTarget - emotionWeightCurrent) * LERP_RATE;
  emotionMotionCurrent += (emotionMotionTarget - emotionMotionCurrent) * LERP_RATE;
}

function computeCoreColor() {
  const color = new THREE.Color(BASE_CORE_COLOR);

  if (current.tintColor !== null && current.tintWeight > 0.01) {
    color.lerp(new THREE.Color(current.tintColor), current.tintWeight);
    return color;
  }

  if (sigilRingTint.color !== null && sigilRingTint.weight > 0.01) {
    color.lerp(new THREE.Color(sigilRingTint.color), sigilRingTint.weight);
  }

  if (emotionWeightCurrent > 0.01) {
    color.lerp(emotionColorCurrent, emotionWeightCurrent);
  }

  return color;
}

window.solomonSetAvatarState = function (name) {
  if (!AVATAR_STATES[name]) {
    console.warn('[Solomon Phase 2] Unknown avatar state:', name);
    return;
  }
  avatarStateName = name;
};

window.solomonGetAvatarState = function () {
  return avatarStateName;
};

window.solomonPulseAvatarToken = function () {
  tokenFlicker = 1.0;
};

window.sigilScaleBlastOffset = 0;
window.sigilBloomBlastOffset = 0;

window.solomonSetSigilRingTint = function (hexColor, weight) {
  sigilRingTint.color  = hexColor;
  sigilRingTint.weight = (typeof weight === 'number') ? weight : 0.4;
  
  // Enhance sigil join animation: a bright pulse, elastic scale up, and fast gyro spin
  gsap.fromTo(window, { sigilScaleBlastOffset: 0.8, sigilBloomBlastOffset: 2.0 }, { sigilScaleBlastOffset: 0, sigilBloomBlastOffset: 0, duration: 1.5, ease: 'elastic.out(1, 0.3)' });
  tokenFlicker = 2.0; 
  
  [gyroA, gyroB, gyroC].forEach((g, i) => {
    gsap.to(g.rotation, { 
      x: g.rotation.x + Math.PI, 
      y: g.rotation.y + Math.PI, 
      z: g.rotation.z + Math.PI, 
      duration: 1.5 + (i * 0.2), 
      ease: 'power3.out' 
    });
    gsap.fromTo(g.scale, { x: 0.8, y: 0.8, z: 0.8 }, { x: 1, y: 1, z: 1, duration: 1.5, ease: 'elastic.out(1, 0.4)' });
  });
};

window.solomonClearSigilRingTint = function () {
  sigilRingTint.color  = null;
  sigilRingTint.weight = 0;
  
  // Enhance sigil leave animation: pulse down and gyros spin out
  gsap.fromTo(window, { sigilScaleBlastOffset: -0.4, sigilBloomBlastOffset: 1.0 }, { sigilScaleBlastOffset: 0, sigilBloomBlastOffset: 0, duration: 1.5, ease: 'back.out(1.5)' });
  tokenFlicker = 1.0;
  
  [gyroA, gyroB, gyroC].forEach((g, i) => {
    gsap.to(g.rotation, { 
      x: g.rotation.x - Math.PI, 
      y: g.rotation.y - Math.PI, 
      z: g.rotation.z - Math.PI, 
      duration: 1.5 + (i * 0.2), 
      ease: 'power3.inOut' 
    });
    // A quick shockwave expansion before reverting
    gsap.to(g.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 0.5, yoyo: true, repeat: 1, ease: 'power2.out' });
  });
};

window.solomonSetEmotion = function (valence, arousal) {
  const nx = Math.max(0, Math.min(1, (valence + 1) / 2));
  const ny = Math.max(0, Math.min(1, arousal));

  const bottom = EMOTION_CORNERS.subdued.clone().lerp(EMOTION_CORNERS.content, nx);
  const top    = EMOTION_CORNERS.intense.clone().lerp(EMOTION_CORNERS.excited, nx);
  emotionColorTarget.copy(bottom.lerp(top, ny));

  emotionWeightTarget = Math.max(0, Math.min(0.35, ny * 0.25 + Math.abs(valence) * 0.15));
  emotionMotionTarget = 1 + (ny - 0.4) * 0.4;
};

window.solomonResetEmotion = function () {
  emotionColorTarget.set(BASE_CORE_COLOR);
  emotionWeightTarget = 0;
  emotionMotionTarget = 1;
};

// ═══════════════════════════════════════════════════════════════
// 14. PHASE 2 ANIMATION LOOP
// ═══════════════════════════════════════════════════════════════
let p2Time = 0;
const p2Clock = new THREE.Clock();

function phase2Loop() {
  requestAnimationFrame(phase2Loop);
  const dt = p2Clock.getDelta();
  const dtNorm = dt * 60; // Normalize so 1.0 means 60fps
  // Smoothly increment global time (similar to old behavior where +0.01 per frame meant roughly +0.6 per second at 60fps)
  p2Time += dtNorm * 0.01;
  window.solomonP2DeltaNorm = dtNorm; // Expose for other phases

  window.solomonNebulaMaterial.uniforms.uTime.value = p2Time;
  window.solomonUpdateStars(p2Time);
  window.solomonUpdateParticles();

  lerpCurrentTowardTarget();
  lerpEmotionTowardTarget();
  
  // Frame-independent token flicker decay
  tokenFlicker *= Math.pow(0.90, dtNorm);

  const motionMult   = current.motionMult * emotionMotionCurrent * dtNorm;
  const particleMult = current.particleMult * emotionMotionCurrent; // we'll assume particles update handles dt internally or we leave it

  const corePulse = 0.5 + 0.5 * Math.sin(p2Time * current.pulseSpeed);
  const coreScaleBase = current.pulseAmpMin + current.pulseAmpRange * corePulse;
  
  // Add subtle high-frequency secondary shimmer per user request
  const secondaryShimmer = Math.sin(p2Time * 15.0) * 0.05 * current.pulseAmpRange;
  coreMesh.scale.setScalar(coreScaleBase + window.sigilScaleBlastOffset + secondaryShimmer);
  
  coreMat.emissiveIntensity = current.emissiveBase + current.emissiveRange * corePulse + tokenFlicker * 1.8 + window.sigilBloomBlastOffset;

  const liveColor = computeCoreColor();
  coreMat.color.copy(liveColor);
  coreMat.emissive.copy(liveColor);

  sigilLight.intensity = current.lightIntensity + tokenFlicker * 1.2 + window.sigilBloomBlastOffset;
  bloomPass.strength    = current.bloomStrength + (window.sigilBloomBlastOffset * 0.5);

  gyroA.rotation.y += 0.004  * motionMult;
  gyroB.rotation.z -= 0.0028 * motionMult;
  gyroC.rotation.x += 0.0055 * motionMult;

  icoA.rotation.x += 0.0015 * motionMult;
  icoA.rotation.y += 0.0022 * motionMult;
  icoA.rotation.z += 0.0018 * motionMult;

  icoB.rotation.x -= 0.0020 * motionMult;
  icoB.rotation.y -= 0.0015 * motionMult;
  icoB.rotation.z += 0.0025 * motionMult;

  if (typeof diamondMesh !== 'undefined') {
    diamondMesh.rotation.x -= 0.003 * motionMult;
    diamondMesh.rotation.y += 0.005 * motionMult;
  }

  uranusRings.forEach(({ mesh, def }) => {
    mesh.rotation[def.spinAxis] += def.spinSpeed * motionMult;
  });

  updateOrbitalParticles(p2Time, particleMult);

  haloContainer.style.opacity = Math.min(1, current.haloMult);

  composer.render();
}

phase2Loop();

// ═══════════════════════════════════════════════════════════════
// 15. GLOBALS EXPOSED FOR PHASE 3
// ═══════════════════════════════════════════════════════════════
window.solomonComposer   = composer;
window.solomonSigilGroup = sigilGroup;
window.solomonP2Time     = () => p2Time;

console.log('[Solomon Phase 2] Sigil initialized. Avatar state machine running.');
