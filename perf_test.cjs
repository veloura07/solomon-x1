const { performance } = require('perf_hooks');

const MAX_TRAIL_PARTICLES = 3000;

function createParticles(count) {
  const particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      pos: { x: 0, y: 0, z: 0 },
      color: { r: 1, g: 1, b: 1 },
      size: 1,
      age: Math.random() * 0.5,
      maxAge: 1.0,
      speed: 1,
      ringIndex: i % 10,
      zWobbleFreq: 1,
      theta: 0,
      radialOffset: 0
    });
  }
  return particles;
}

function runOriginal(iterations, initialCount) {
  let activeTrails = createParticles(initialCount);
  const delta = 0.016; // 60fps

  const start = performance.now();
  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < 50; i++) {
      activeTrails.push({
        pos: { x: 0, y: 0, z: 0 },
        color: { r: 1, g: 1, b: 1 },
        size: 1,
        age: 0,
        maxAge: 1.0,
        speed: 1,
        ringIndex: i % 10,
        zWobbleFreq: 1,
        theta: 0,
        radialOffset: 0
      });
    }

    let traceCount = 0;
    for (let i = activeTrails.length - 1; i >= 0; i--) {
      const pt = activeTrails[i];
      pt.age += delta;

      if (pt.age >= pt.maxAge) {
        activeTrails.splice(i, 1);
        continue;
      }

      if (traceCount < MAX_TRAIL_PARTICLES) {
        pt.theta += pt.speed * delta;
        traceCount++;
      }
    }
  }
  const end = performance.now();
  return end - start;
}

function runOptimized4(iterations, initialCount) {
  let activeTrails = createParticles(initialCount);
  const delta = 0.016;

  const start = performance.now();
  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < 50; i++) {
      activeTrails.push({
        pos: { x: 0, y: 0, z: 0 },
        color: { r: 1, g: 1, b: 1 },
        size: 1,
        age: 0,
        maxAge: 1.0,
        speed: 1,
        ringIndex: i % 10,
        zWobbleFreq: 1,
        theta: 0,
        radialOffset: 0
      });
    }

    let traceCount = 0;
    let nextIdx = activeTrails.length - 1;
    for (let i = activeTrails.length - 1; i >= 0; i--) {
      const pt = activeTrails[i];
      pt.age += delta;

      // splicing if old
      if (pt.age >= pt.maxAge) {
        continue;
      }

      if (traceCount < MAX_TRAIL_PARTICLES) {
        pt.theta += pt.speed * delta;
        traceCount++;
      }
      activeTrails[nextIdx--] = pt;
    }

    // Shift elements to the front
    const validCount = activeTrails.length - 1 - nextIdx;
    for(let i = 0; i < validCount; i++) {
        activeTrails[i] = activeTrails[nextIdx + 1 + i];
    }
    activeTrails.length = validCount;
  }
  const end = performance.now();
  return end - start;
}


const iters = 2000;
const startParticles = 5000;

console.log(`Running baseline with ${iters} iterations and ${startParticles} particles...`);
const baselineTime = runOriginal(iters, startParticles);
console.log(`Baseline time: ${baselineTime.toFixed(2)} ms`);

console.log(`Running optimized4 with ${iters} iterations and ${startParticles} particles...`);
const optTime = runOptimized4(iters, startParticles);
console.log(`Optimized4 time: ${optTime.toFixed(2)} ms`);
console.log(`Improvement: ${(baselineTime / optTime).toFixed(2)}x faster`);
