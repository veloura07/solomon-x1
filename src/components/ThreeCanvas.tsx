import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { gsap } from "gsap";
import { RotateCcw, Sparkles, Activity, Shield, Cpu, RefreshCw, X, Eye, ShieldAlert, CheckCircle, Database } from "lucide-react";
import { AgentSpec, AuditLog } from "../types";

// Custom Bloom Pass using multi-octave Gaussian downscaling and bright extraction
const CustomBloomShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uThreshold: { value: 0.18 },
    uIntensity: { value: 1.5 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 uResolution;
    uniform float uThreshold;
    uniform float uIntensity;
    varying vec2 vUv;

    vec3 getBright(vec3 c) {
      float luma = dot(c, vec3(0.299, 0.587, 0.114));
      return (luma > uThreshold) ? (c * (luma - uThreshold) * 2.2) : vec3(0.0);
    }

    vec3 blurSample(sampler2D tex, vec2 uv, float radius) {
      vec3 sum = vec3(0.0);
      float total = 0.0;
      float stepX = radius / uResolution.x;
      float stepY = radius / uResolution.y;

      for (int x = -1; x <= 1; x++) {
        for (int y = -1; y <= 1; y++) {
          vec2 offset = vec2(float(x), float(y)) * vec2(stepX, stepY);
          vec3 col = texture2D(tex, uv + offset).rgb;
          float w = 1.0 - (length(offset) * 0.45);
          sum += col * w;
          total += w;
        }
      }
      return sum / total;
    }

    void main() {
      vec4 original = texture2D(tDiffuse, vUv);
      
      // Triple Gaussian mipmap cascade for organic custom bloom
      vec3 blurLevel1 = blurSample(tDiffuse, vUv, 2.5);
      vec3 blurLevel2 = blurSample(tDiffuse, vUv, 5.5);
      vec3 blurLevel3 = blurSample(tDiffuse, vUv, 11.0);

      vec3 bright1 = getBright(blurLevel1) * 0.55;
      vec3 bright2 = getBright(blurLevel2) * 0.35;
      vec3 bright3 = getBright(blurLevel3) * 0.20;

      vec3 finalBloom = (bright1 + bright2 + bright3) * uIntensity;
      gl_FragColor = vec4(original.rgb + finalBloom, original.a);
    }
  `
};

// High-fidelity Camera/Object Motion Blur Shader
const MotionBlurShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uVelocity: { value: new THREE.Vector2(0, 0) }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 uResolution;
    uniform vec2 uVelocity;
    varying vec2 vUv;

    void main() {
      if (length(uVelocity) < 0.0001) {
        gl_FragColor = texture2D(tDiffuse, vUv);
        return;
      }
      
      vec4 accum = vec4(0.0);
      float totalWeight = 0.0;
      
      // 8 symmetrical taps along movement vector for buttery smooth fluid transition
      for (int i = 0; i < 8; i++) {
        float offsetFraction = (float(i) / 7.0) - 0.5;
        vec2 offsetUV = uVelocity * offsetFraction;
        vec4 col = texture2D(tDiffuse, vUv + offsetUV);
        float weight = 1.0 - abs(offsetFraction) * 0.4;
        accum += col * weight;
        totalWeight += weight;
      }
      
      gl_FragColor = accum / totalWeight;
    }
  `
};

// Screen Space Ambient Occlusion (SSAO) shader definition for soft, realistic contact shadows
const SSAOShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uAOStrength: { value: 1.25 },
    uAORadius: { value: 3.5 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 uResolution;
    uniform float uAOStrength;
    uniform float uAORadius;
    varying vec2 vUv;

    float rand(vec2 co) {
      return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec4 sceneCol = texture2D(tDiffuse, vUv);
      
      float ao = 0.0;
      float totalWeight = 0.0;
      const int SAMPLE_COUNT = 8;
      
      float stepSize = uAORadius / max(uResolution.x, uResolution.y);
      float currentLuma = dot(sceneCol.rgb, vec3(0.299, 0.587, 0.114));
      
      for (int i = 0; i < SAMPLE_COUNT; i++) {
        float angle = (float(i) / float(SAMPLE_COUNT)) * 6.28318;
        float noiseFactor = 0.5 + 0.5 * rand(vUv * 75.0 + float(i));
        vec2 offset = vec2(cos(angle), sin(angle)) * stepSize * noiseFactor;
        
        vec4 sampleCol = texture2D(tDiffuse, vUv + offset);
        float sampleLuma = dot(sampleCol.rgb, vec3(0.299, 0.587, 0.114));
        
        float differential = abs(currentLuma - sampleLuma);
        float weight = 1.0 - smoothstep(0.01, 1.0, float(i) / float(SAMPLE_COUNT));
        
        ao += differential * weight;
        totalWeight += weight;
      }
      
      ao = (ao / max(totalWeight, 0.001)) * uAOStrength;
      float factor = clamp(1.0 - ao, 0.45, 1.0);
      gl_FragColor = vec4(sceneCol.rgb * factor, sceneCol.a);
    }
  `
};

// Cinematic Depth of Field (DoF) post-processing shader with high-fidelity spiral Bokeh distribution
const CinematicDoFShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uFocusPoint: { value: new THREE.Vector2(0.5, 0.5) },
    uFocusRange: { value: 0.38 },
    uMaxBlur: { value: 5.5 },
    uEnabled: { value: 0.0 }, // Smoothly transitions from 0.0 to 1.0 when an agent is selected
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 uResolution;
    uniform vec2 uFocusPoint;
    uniform float uFocusRange;
    uniform float uMaxBlur;
    uniform float uEnabled;
    varying vec2 vUv;

    const float GOLDEN_ANGLE = 2.39996323;

    vec4 bokehBlur(sampler2D tex, vec2 uv, float radius) {
      vec4 accum = vec4(0.0);
      float totalWeight = 0.0;
      
      for (int i = 0; i < 20; i++) { // 20 spiral taps for a gorgeous cinematic bokeh blur
        float r = sqrt(float(i) / 19.0) * radius;
        float theta = float(i) * GOLDEN_ANGLE;
        vec2 offset = vec2(cos(theta), sin(theta)) * r / uResolution;
        
        vec4 color = texture2D(tex, uv + offset);
        // Luminance-weight sample to create beautiful high-intensity bloom rings
        float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
        float weight = 1.0 + luma * 2.2;
        
        accum += color * weight;
        totalWeight += weight;
      }
      return accum / totalWeight;
    }

    void main() {
      vec4 baseColor = texture2D(tDiffuse, vUv);
      if (uEnabled < 0.01) {
        gl_FragColor = baseColor;
        return;
      }

      float dist = distance(vUv, uFocusPoint);
      float blurFactor = smoothstep(0.04, uFocusRange, dist) * uMaxBlur * uEnabled;
      
      if (blurFactor < 0.1) {
        gl_FragColor = baseColor;
      } else {
        gl_FragColor = bokehBlur(tDiffuse, vUv, blurFactor);
      }
    }
  `
};

// Programmatically generate a detailed procedural normal map for micro-metallic texture
function createFineGrainNormalMap(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = "rgb(128, 128, 255)";
  ctx.fillRect(0, 0, size, size);

  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;

  const heights = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = (x / size) * Math.PI * 2;
      const ny = (y / size) * Math.PI * 2;
      let val = Math.sin(nx * 40) * Math.cos(ny * 40) * 0.4;
      val += Math.sin(nx * 120 + ny * 80) * 0.25;
      val += Math.sin(nx * 250 - ny * 310) * 0.15;
      val += (Math.random() - 0.5) * 0.08;
      heights[y * size + x] = val;
    }
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const left = heights[y * size + ((x - 1 + size) % size)];
      const right = heights[y * size + ((x + 1) % size)];
      const top = heights[((y - 1 + size) % size) * size + x];
      const bottom = heights[((y + 1) % size) * size + x];

      const dx = (right - left) * 8.0;
      const dy = (bottom - top) * 8.0;

      let nx = -dx;
      let ny = -dy;
      let nz = 1.0;

      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      nx /= len;
      ny /= len;
      nz /= len;

      const idx = (y * size + x) * 4;
      data[idx] = Math.round((nx * 0.5 + 0.5) * 255);
      data[idx + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      data[idx + 2] = Math.round((nz * 0.5 + 0.5) * 255);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 1);
  return texture;
}

// Programmatically generate a glowing halo sprite particle mapping
function createGlowSprite(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0.0, "rgba(255, 255, 255, 1.0)");
  grad.addColorStop(0.25, "rgba(255, 200, 120, 0.75)");
  grad.addColorStop(0.6, "rgba(124, 77, 243, 0.35)");
  grad.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

const ringVertShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    vNormal = normalMatrix * normal;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const ringFragShader = `
  uniform vec3 uColor;
  uniform vec3 uEmissive;
  uniform float uEmissiveIntensity;
  uniform sampler2D uNormalMap;
  uniform vec2 uNormalScale;
  uniform float uTime;
  uniform float uHoverIntensity;
  uniform float uPulseIntensity;
  uniform float uDoFBlur;
  uniform vec3 uAccentColor;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  vec3 perturbNormalArb(vec3 surf_pos, vec3 surf_norm, vec2 dUv, vec3 mapN, vec2 normScale) {
    vec3 q0 = dFdx(surf_pos.xyz);
    vec3 q1 = dFdy(surf_pos.xyz);
    vec2 st0 = dFdx(dUv.st);
    vec2 st1 = dFdy(dUv.st);

    vec3 N = surf_norm;

    vec3 T = q0 * st1.t - q1 * st0.t;
    vec3 B = q1 * st0.s - q0 * st1.s;

    float tlen = length(T);
    float blen = length(B);
    if (tlen > 0.0) T /= tlen;
    else T = vec3(1.0, 0.0, 0.0);

    if (blen > 0.0) B /= blen;
    else B = cross(N, T);

    vec3 perturbed = T * (mapN.x * normScale.x) + B * (mapN.y * normScale.y) + N * mapN.z;
    return normalize(perturbed);
  }

  void main() {
    vec2 dynamicNormalScale = mix(uNormalScale, uNormalScale * 0.1, uDoFBlur);
    
    // Dynamic normal coordinates and texture micro-tactility frequency scaled by accent color
    float textureScaleX = 16.0 + uAccentColor.r * 12.0;
    float textureScaleY = 4.0 + uAccentColor.g * 4.0;
    vec3 mapNormal = texture2D(uNormalMap, vUv * vec2(textureScaleX, textureScaleY)).xyz * 2.0 - 1.0;
    
    // Physical normal map interactive ripples based on accent color and input hovering
    float pulseFreq = 16.0 + dot(uAccentColor, vec3(10.0, 15.0, 5.0));
    float pulseWave = sin(vUv.x * pulseFreq + uTime * 3.0) * cos(vUv.y * pulseFreq * 0.5 - uTime * 2.0);
    mapNormal.xy += vec2(pulseWave * 0.15 * uHoverIntensity);
    mapNormal = normalize(mapNormal);

    vec3 N = normalize(vNormal);
    vec3 V = normalize(vViewPosition);

    vec3 perturbedNormal = perturbNormalArb(-vViewPosition, N, vUv * vec2(textureScaleX, textureScaleY), mapNormal, dynamicNormalScale);
    
    if (uDoFBlur > 0.05) {
      perturbedNormal = mix(perturbedNormal, N, uDoFBlur * 0.85);
    }

    vec3 lightDir1 = normalize(vec3(0.0, 20.0, 50.0) + vViewPosition);
    vec3 lightDir2 = normalize(vec3(-60.0, -30.0, -50.0) + vViewPosition);

    vec3 ambient = vec3(0.12, 0.09, 0.22) * uColor;

    float diff1 = max(dot(perturbedNormal, lightDir1), 0.0);
    float diff2 = max(dot(perturbedNormal, lightDir2), 0.0);
    
    float intensityFactor = mix(1.0, 0.35, uDoFBlur);
    vec3 diffuse1 = diff1 * vec3(1.0, 0.85, 0.6) * uColor * 1.6 * intensityFactor;
    vec3 diffuse2 = diff2 * vec3(0.5, 0.45, 1.0) * uColor * 1.1 * intensityFactor;

    vec3 halfDir1 = normalize(lightDir1 + V);
    float specPower = mix(32.0, 4.0, uDoFBlur);
    float spec1 = pow(max(dot(perturbedNormal, halfDir1), 0.0), specPower);
    vec3 specular1 = vec3(1.0, 1.0, 1.0) * spec1 * mix(0.6 + 0.4 * uHoverIntensity, 0.01, uDoFBlur);

    float activePulse = uPulseIntensity * (0.9 + 0.2 * sin(uTime * 3.5));
    float finalEmissiveIntensity = uEmissiveIntensity * activePulse * mix(1.1 + 1.3 * uHoverIntensity, 0.15, uDoFBlur);
    vec3 emissive = uEmissive * finalEmissiveIntensity;

    float sparkle = step(0.965, sin(vUv.x * 400.0 + uTime * 4.5) * cos(vUv.y * 150.0 - uTime * 2.0));
    vec3 sparkles = vec3(1.0, 0.95, 0.7) * sparkle * (0.2 + 0.8 * uHoverIntensity) * (1.0 - uDoFBlur);

    vec3 finalCol = ambient * mix(1.0, 0.3, uDoFBlur) + diffuse1 + diffuse2 + specular1 + emissive + sparkles;

    gl_FragColor = vec4(finalCol, mix(1.0, 0.45, uDoFBlur));
  }
`;

interface ThreeCanvasProps {
  selectedRingIndex: number;
  onSelectRing: (index: number) => void;
  agents: AgentSpec[];
  bloomThreshold?: number;
  bloomIntensity?: number;
  auditLogs?: AuditLog[];
}

export default function ThreeCanvas({ 
  selectedRingIndex, 
  onSelectRing, 
  agents,
  bloomThreshold = 0.22,
  bloomIntensity = 1.5,
  auditLogs = []
}: ThreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const selectedIndexRef = useRef<number>(selectedRingIndex);
  const physicalRingsRef = useRef<any[]>([]);

  const bloomThresholdRef = useRef<number>(bloomThreshold);
  const bloomIntensityRef = useRef<number>(bloomIntensity);

  // Sync bloom parameters in the background to avoid re-constructing the WebGL canvas
  useEffect(() => {
    bloomThresholdRef.current = bloomThreshold;
    bloomIntensityRef.current = bloomIntensity;
  }, [bloomThreshold, bloomIntensity]);

  // Sync selected index and trigger GSAP animations
  useEffect(() => {
    selectedIndexRef.current = selectedRingIndex;

    if (physicalRingsRef.current.length > 0) {
      physicalRingsRef.current.forEach((pr) => {
        const isSelected = pr.index === selectedRingIndex;
        
        // Smoothly animate base scale and pulse intensity using GSAP
        gsap.to(pr.animState, {
          scale: isSelected ? 2.5 : 1.0,
          pulseIntensity: isSelected ? 1.6 : 1.0,
          duration: 0.85,
          ease: "back.out(1.2)",
          overwrite: "auto"
        });
      });
    }
  }, [selectedRingIndex]);

  // Global Escape key event listener to return to overview
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onSelectRing(-1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onSelectRing]);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;

    // Subtle hover-responsive parallax state
    const parallax = { x: 0, y: 0 };

    // ─── PART 1: SCENE SETUP ──────────────────────────────
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      2000
    );
    camera.position.set(0, 0, 160);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
      stencil: false,
      depth: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 4.0));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x02010c, 1.0);

    // ─── PART 2: LIGHTING ─────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0x15122e, 1.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xff9900, 3.5, 300);
    pointLight1.position.set(0, 20, 50);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x7c4df3, 2.0, 300);
    pointLight2.position.set(-60, -30, -50);
    scene.add(pointLight2);

    // ─── PART 3: SPACE BACKGROUND NEBULA ──────────────────
    // Custom shader plane representing deep cosmic nebulas
    const nebulaVert = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const nebulaFrag = `
      uniform float uTime;
      varying vec2 vUv;

      float wash_pow(float val, float p) {
        return pow(max(val, 0.0001), p);
      }

      vec3 sampleNebula(vec2 uv, float time) {
        vec3 base = vec3(0.006, 0.003, 0.02);
        vec3 acc = vec3(0.0);
        
        vec2 c[4];
        c[0] = vec2(0.2, 0.3) + vec2(sin(time * 0.1) * 0.04, cos(time * 0.07) * 0.04);
        c[1] = vec2(0.8, 0.7) + vec2(cos(time * 0.08) * 0.05, sin(time * 0.11) * 0.03);
        c[2] = vec2(0.7, 0.2) + vec2(sin(time * 0.14) * 0.03, cos(time * 0.09) * 0.04);
        c[3] = vec2(0.3, 0.82) + vec2(cos(time * 0.06) * 0.05, sin(time * 0.08) * 0.05);

        vec3 col[4];
        col[0] = vec3(0.18, 0.03, 0.42); // deep violet
        col[1] = vec3(0.00, 0.12, 0.38); // space blue
        col[2] = vec3(0.36, 0.05, 0.12); // cosmic red
        col[3] = vec3(0.02, 0.18, 0.22); // space teal

        float op[4] = float[](0.42, 0.38, 0.32, 0.30);
        float ps[4] = float[](0.18, 0.12, 0.22, 0.15);

        for(int i = 0; i < 4; i++) {
          float d = length(uv - c[i]);
          float f = 1.0 - smoothstep(0.0, 0.95, d);
          f = wash_pow(f, 3.4);
          float pulse = 0.85 + 0.15 * sin(time * ps[i] + float(i) * 1.5);
          acc += col[i] * op[i] * f * pulse;
        }

        return base + acc;
      }

      void main() {
        // High-fidelity procedural 3x3 gaussian convolution pass
        vec3 finalCol = vec3(0.0);
        float totalWeight = 0.0;
        
        float blurSize = 0.022; // Out of focus blur amplitude
        float w[3];
        w[0] = 0.2241; w[1] = 0.6125; w[2] = 0.2241;

        for (int x = -1; x <= 1; x++) {
          for (int y = -1; y <= 1; y++) {
            vec2 offset = vec2(float(x), float(y)) * blurSize;
            float weight = w[x + 1] * w[y + 1];
            finalCol += sampleNebula(vUv + offset, uTime) * weight;
            totalWeight += weight;
          }
        }
        
        gl_FragColor = vec4(finalCol / totalWeight, 1.0);
      }
    `;

    const nebulaMaterial = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0.0 } },
      vertexShader: nebulaVert,
      fragmentShader: nebulaFrag,
      depthWrite: false,
    });

    const bgQuad = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      nebulaMaterial
    );
    // Render as back quad
    bgQuad.position.set(0, 0, -1);
    const bgScene = new THREE.Scene();
    const bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    bgScene.add(bgQuad);

    const normalMapTexture = createFineGrainNormalMap();
    const glowSpriteTexture = createGlowSprite();

    // ─── PART 3B: EFFECT COMPOSER AND BLOOM POST-PROCESSING ───
    const composer = new EffectComposer(renderer);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 4.0));
    composer.renderToScreen = true;

    const renderPass = new RenderPass(scene, camera);
    renderPass.clear = false; // Keep background nebula
    composer.addPass(renderPass);

    const bloomPass = new ShaderPass(CustomBloomShader);
    bloomPass.uniforms.uResolution.value.set(container.clientWidth, container.clientHeight);
    bloomPass.uniforms.uThreshold.value = bloomThresholdRef.current;
    bloomPass.uniforms.uIntensity.value = bloomIntensityRef.current;
    composer.addPass(bloomPass);

    // Screen Space Ambient Occlusion ShaderPass to render detailed contact soft shadows
    const ssaoPass = new ShaderPass(SSAOShader);
    ssaoPass.uniforms.uResolution.value.set(container.clientWidth, container.clientHeight);
    composer.addPass(ssaoPass);

    // Cinematic Depth of Field (DoF) post-processing pass
    const dofPass = new ShaderPass(CinematicDoFShader);
    dofPass.uniforms.uResolution.value.set(container.clientWidth, container.clientHeight);
    composer.addPass(dofPass);

    // High-fidelity Camera/Object Motion Blur Pass
    const motionBlurPass = new ShaderPass(MotionBlurShader);
    motionBlurPass.uniforms.uResolution.value.set(container.clientWidth, container.clientHeight);
    motionBlurPass.uniforms.uVelocity.value.set(0, 0);
    composer.addPass(motionBlurPass);

    // ─── PART 4: TWINKLING STARFIELD ──────────────────────
    const STAR_COUNT = 300;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(STAR_COUNT * 3);
    const starParams = [] as { phase: number; speed: number; amp: number; index: number }[];

    for (let i = 0; i < STAR_COUNT; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 500;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 400;
      starPositions[i * 3 + 2] = -50 - Math.random() * 200;

      starParams.push({
        phase: Math.random() * Math.PI * 2,
        speed: 0.01 + Math.random() * 0.02,
        amp: 0.4 + Math.random() * 0.6,
        index: i,
      });
    }

    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.4,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
      depthWrite: false,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // ─── PART 5: DRIFTING PLASMA PARTICLES ────────────────
    const PARTICLE_COUNT = 150;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
    const particleSpeeds = [] as number[];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 200;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 150;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 100;
      particleSpeeds.push(0.05 + Math.random() * 0.12);
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xc9933a,
      size: 5.5, // Increased size for dreamy out of focus glow
      map: glowSpriteTexture,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    const driftingParticles = new THREE.Points(particleGeo, particleMat);
    scene.add(driftingParticles);

    // ─── PART 4C: ORBITING EPHEMERAL LIGHT TRAIL PARTICLES ───────────────
    const MAX_TRAIL_PARTICLES = 400;
    const trailGeo = new THREE.BufferGeometry();
    const trailPositions = new Float32Array(MAX_TRAIL_PARTICLES * 3);
    const trailColors = new Float32Array(MAX_TRAIL_PARTICLES * 3);
    const trailSizes = new Float32Array(MAX_TRAIL_PARTICLES);

    for (let i = 0; i < MAX_TRAIL_PARTICLES; i++) {
      trailPositions[i * 3] = 9999.0;
      trailPositions[i * 3 + 1] = 9999.0;
      trailPositions[i * 3 + 2] = 9999.0;
    }

    trailGeo.setAttribute("position", new THREE.BufferAttribute(trailPositions, 3));
    trailGeo.setAttribute("color", new THREE.BufferAttribute(trailColors, 3));
    trailGeo.setAttribute("size", new THREE.BufferAttribute(trailSizes, 1));

    const trailMat = new THREE.PointsMaterial({
      size: 1.0,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      map: glowSpriteTexture,
    });

    const trailPoints = new THREE.Points(trailGeo, trailMat);
    scene.add(trailPoints);

    interface TrailParticle {
      pos: THREE.Vector3;
      color: THREE.Color;
      size: number;
      age: number;
      maxAge: number;
      theta: number;
      radialOffset: number;
      speed: number;
      ringIndex: number;
      zWobbleFreq: number;
    }
    const activeTrails: TrailParticle[] = [];

    // ─── PART 5B: COGNITIVE ENERGY RING (HIGH-DETAIL SPINNING SPARKLES) ─────
    const SPARKS_COUNT = 450;
    const sparksGeo = new THREE.BufferGeometry();
    const sparksPositions = new Float32Array(SPARKS_COUNT * 3);
    const sparksRates = new Float32Array(SPARKS_COUNT);
    const sparksRadii = new Float32Array(SPARKS_COUNT);
    const sparksOffsets = new Float32Array(SPARKS_COUNT);
    
    for (let i = 0; i < SPARKS_COUNT; i++) {
      const ang = (i / SPARKS_COUNT) * Math.PI * 2 + Math.random() * 0.1;
      const rad = 30 + Math.random() * 12; // Radius range
      sparksPositions[i * 3] = Math.cos(ang) * rad;
      sparksPositions[i * 3 + 1] = Math.sin(ang) * rad;
      sparksPositions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      sparksRates[i] = 0.12 + Math.random() * 0.18; // Speed rates
      sparksRadii[i] = rad;
      sparksOffsets[i] = Math.random() * Math.PI * 2;
    }
    sparksGeo.setAttribute("position", new THREE.BufferAttribute(sparksPositions, 3));
    const sparksMat = new THREE.PointsMaterial({
      color: 0xcca33a,
      size: 3.5, // Higher point footprint for glowing visual bokeh
      map: glowSpriteTexture,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sparksRing = new THREE.Points(sparksGeo, sparksMat);
    scene.add(sparksRing);

    // ─── PART 6: CENTRAL COGNITIVE SIGIL & GYRO ───────────
    const sigilGroup = new THREE.Group();
    scene.add(sigilGroup);

    // 6A. Core Sphere
    const coreGeo = new THREE.SphereGeometry(6, 128, 128); // Elevated subdivision density
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xff9900,
      emissive: 0xff9900,
      emissiveIntensity: 1.5,
      roughness: 0.2,
      metalness: 0.8,
      normalMap: normalMapTexture,
      normalScale: new THREE.Vector2(0.15, 0.15)
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    sigilGroup.add(coreMesh);

    // 6B. Gyroscope Rings (concentric)
    const gyroRings = [] as THREE.Mesh[];
    const ringRadii = [12, 16, 20];
    const ringColors = [0xffd070, 0xc9933a, 0x7c4df3];

    ringRadii.forEach((rad, idx) => {
      const geo = new THREE.TorusGeometry(rad, 0.45, 64, 300); // Super-sampled subdivision facets
      const mat = new THREE.MeshStandardMaterial({
        color: ringColors[idx],
        emissive: ringColors[idx],
        emissiveIntensity: 0.4,
        roughness: 0.15,
        metalness: 0.9,
        normalMap: normalMapTexture,
        normalScale: new THREE.Vector2(0.22, 0.22) // Subtle normal mapping bumps
      });
      const ring = new THREE.Mesh(geo, mat);
      
      // Give initial random rotations
      ring.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      sigilGroup.add(ring);
      gyroRings.push(ring);
    });

    // 6C. Wireframe Orbit Icosahedra
    const icoGeo = new THREE.IcosahedronGeometry(25, 1);
    const icoMat = new THREE.MeshBasicMaterial({
      color: 0x7c4df3,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const icoMesh = new THREE.Mesh(icoGeo, icoMat);
    sigilGroup.add(icoMesh);

    // ─── PART 7: THE 10 RINGS OF SOLOMON ───────────────────
    const physicalRings = [] as {
      index: number;
      group: THREE.Group;
      homePos: THREE.Vector3;
      initRot: THREE.Euler;
      bandMesh: THREE.Mesh;
      stoneMesh: THREE.Mesh;
      color: number;
      animState: {
        scale: number;
        hoverScale: number;
        hoverIntensity: number;
        pulseIntensity: number;
      };
      rotVelocity: { x: number; y: number; z: number };
    }[];

    agents.forEach((spec) => {
      const g = new THREE.Group();
      
      // Concentric or orbital spacing for the inactive rings
      // Layout the 10 rings in a circle radius 60
      const angle = (spec.index / 10) * Math.PI * 2;
      const homeX = Math.cos(angle) * 62;
      const homeY = Math.sin(angle) * 45;
      const homeZ = -15 + Math.random() * 20;

      const homePos = new THREE.Vector3(homeX, homeY, homeZ);
      const initRot = new THREE.Euler(
        0.3 + Math.random() * 0.4,
        0.2 + Math.random() * 0.5,
        angle
      );

      // Create Torus Band with hyper-resolution subdivisions (128 x 512)
      const bandGeo = new THREE.TorusGeometry(8, 1.25, 128, 512);
      const bandMat = new THREE.ShaderMaterial({
        vertexShader: ringVertShader,
        fragmentShader: ringFragShader,
        uniforms: {
          uColor: { value: new THREE.Color(spec.bandColor) },
          uEmissive: { value: new THREE.Color(spec.bandColor) },
          uEmissiveIntensity: { value: 0.65 },
          uNormalMap: { value: normalMapTexture },
          uNormalScale: { value: new THREE.Vector2(0.28, 0.28) },
          uTime: { value: 0.0 },
          uHoverIntensity: { value: 0.0 },
          uPulseIntensity: { value: 1.0 },
          uDoFBlur: { value: 0.0 },
          uAccentColor: { value: new THREE.Color(spec.accentColor) },
        },
        depthWrite: true,
        depthTest: true,
      });
      const bandMesh = new THREE.Mesh(bandGeo, bandMat);
      g.add(bandMesh);

      // Create an additive volumetric atmospheric glow mesh around the torus band (ethereal bloom simulator)
      const glowGeo = new THREE.TorusGeometry(8, 1.55, 48, 180);
      const glowMat = new THREE.MeshBasicMaterial({
        color: spec.bandColor,
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
      });
      const glowMesh = new THREE.Mesh(glowGeo, glowMat);
      g.add(glowMesh);

      // Create Stone details with high segment density
      const stoneGeo = new THREE.SphereGeometry(1.6, 48, 48);
      const stoneMat = new THREE.MeshStandardMaterial({
        color: spec.stoneColor,
        emissive: spec.stoneColor,
        emissiveIntensity: 2.8, // Enhanced emissive glow for intense bloom feeling
        roughness: 0.1,
        metalness: 0.3,
        normalMap: normalMapTexture,
        normalScale: new THREE.Vector2(0.12, 0.12)
      });
      const stoneMesh = new THREE.Mesh(stoneGeo, stoneMat);
      // Position stone on upper crest of torus ring
      const stoneRad = 8;
      stoneMesh.position.set(
        Math.cos(spec.stoneAngle) * stoneRad,
        Math.sin(spec.stoneAngle) * stoneRad,
        0.8
      );
      g.add(stoneMesh);

      // Create distinct decorative nodes based on detailType
      const N = 8;
      const nodesMat = new THREE.MeshStandardMaterial({
        color: spec.accentColor,
        roughness: 0.2,
        metalness: 0.8,
      });

      for (let i = 0; i < N; i++) {
        const nodeAngle = (i / N) * Math.PI * 2;
        let nodeGeo: THREE.BufferGeometry;

        if (spec.detailType === "crystalFacets") {
          nodeGeo = new THREE.OctahedronGeometry(0.8, 0);
        } else if (spec.detailType === "thorns") {
          nodeGeo = new THREE.ConeGeometry(0.5, 2.0, 6);
        } else if (spec.detailType === "segmentedPlates") {
          nodeGeo = new THREE.BoxGeometry(0.4, 1.6, 2.0);
        } else {
          nodeGeo = new THREE.SphereGeometry(0.6, 8, 8);
        }

        const nodeMesh = new THREE.Mesh(nodeGeo, nodesMat);
        const nodeRad = 8;
        nodeMesh.position.set(
          Math.cos(nodeAngle) * nodeRad,
          Math.sin(nodeAngle) * nodeRad,
          0
        );
        nodeMesh.rotation.z = nodeAngle;
        if (spec.detailType === "thorns") {
          nodeMesh.rotation.x = Math.PI / 2;
        }
        g.add(nodeMesh);
      }

      g.position.copy(homePos);
      g.rotation.copy(initRot);
      scene.add(g);

      physicalRings.push({
        index: spec.index,
        group: g,
        homePos,
        initRot,
        bandMesh,
        stoneMesh,
        color: spec.bandColor,
        animState: {
          scale: spec.index === selectedIndexRef.current ? 2.5 : 1.0,
          hoverScale: 1.0,
          hoverIntensity: 0.0,
          pulseIntensity: spec.index === selectedIndexRef.current ? 1.6 : 1.0,
        },
        rotVelocity: {
          x: (Math.random() - 0.5) * 0.15,
          y: (Math.random() - 0.5) * 0.25,
          z: (Math.random() - 0.5) * 0.10,
        }
      });
    });

    physicalRingsRef.current = physicalRings;

    // ─── PART 8: RAYCASTER CLICK AND GSAP HOVER HANDLERS ─────────────────
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredRingIndex = -1;

    const handleCanvasClick = (event: MouseEvent) => {
      // Safeguard: only trigger canvas operations if the click was directly on the WebGL canvas element
      if (event.target !== canvasRef.current) {
        return;
      }

      const rect = renderer.domElement.getBoundingClientRect();
      const clientX = event.clientX - rect.left;
      const clientY = event.clientY - rect.top;

      mouse.x = (clientX / rect.width) * 2 - 1;
      mouse.y = -(clientY / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      let closestRingIndex = -1;
      let minDistance = Infinity;

      physicalRings.forEach((pr) => {
        const intersects = raycaster.intersectObjects(pr.group.children, true);
        if (intersects.length > 0) {
          if (intersects[0].distance < minDistance) {
            minDistance = intersects[0].distance;
            closestRingIndex = pr.index;
          }
        }
      });

      if (closestRingIndex !== -1) {
        onSelectRing(closestRingIndex);

        // Apply high physical rotational impulse to the clicked archetype ring
        const clickedPr = physicalRings.find((pr) => pr.index === closestRingIndex);
        if (clickedPr) {
          clickedPr.rotVelocity.y += 6.5; // Strong high-speed spin
          clickedPr.rotVelocity.x += (Math.random() - 0.5) * 2.8; // Wobble torque
          clickedPr.rotVelocity.z += (Math.random() - 0.5) * 2.8;
        }

        // Propagate sympathetic structural kinetic ripple to intermediate neighbor rings
        physicalRings.forEach((pr) => {
          if (pr.index !== closestRingIndex) {
            // Compute index-space separation (the rings represent a logical network/senate)
            const indexDistance = Math.min(
              Math.abs(pr.index - closestRingIndex),
              10 - Math.abs(pr.index - closestRingIndex)
            );
            
            // Distribute minor kinetic torque based on proximity
            const sympatheticFactor = Math.max(0, 3.5 - indexDistance) / 3.5;
            if (sympatheticFactor > 0) {
              pr.rotVelocity.y += sympatheticFactor * 2.5 * (Math.random() * 0.5 + 0.5);
              pr.rotVelocity.x += (Math.random() - 0.5) * sympatheticFactor * 1.5;
              pr.rotVelocity.z += (Math.random() - 0.5) * sympatheticFactor * 1.5;
            }
          }
        });
      } else {
        // Recenter to global senate overview when clicking on empty background space of the canvas
        onSelectRing(-1);
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const clientX = event.clientX - rect.left;
      const clientY = event.clientY - rect.top;

      mouse.x = (clientX / rect.width) * 2 - 1;
      mouse.y = -(clientY / rect.height) * 2 + 1;

      // Update parallax targets based on mouse coordinates
      parallax.x = mouse.x;
      parallax.y = mouse.y;

      raycaster.setFromCamera(mouse, camera);

      let closestRingIndex = -1;
      let minDistance = Infinity;

      physicalRings.forEach((pr) => {
        const intersects = raycaster.intersectObjects(pr.group.children, true);
        if (intersects.length > 0) {
          if (intersects[0].distance < minDistance) {
            minDistance = intersects[0].distance;
            closestRingIndex = pr.index;
          }
        }
      });

      if (closestRingIndex !== hoveredRingIndex) {
        // Fade out previous hover state
        if (hoveredRingIndex !== -1) {
          const oldPr = physicalRings.find((p) => p.index === hoveredRingIndex);
          if (oldPr) {
            gsap.to(oldPr.animState, {
              hoverScale: 1.0,
              hoverIntensity: 0.0,
              duration: 0.45,
              ease: "power2.out",
              overwrite: "auto",
            });
          }
        }

        // Fade in new hover state
        hoveredRingIndex = closestRingIndex;
        if (hoveredRingIndex !== -1) {
          const newPr = physicalRings.find((p) => p.index === hoveredRingIndex);
          if (newPr) {
            gsap.to(newPr.animState, {
              hoverScale: 1.25,      // Smoothly expand slightly on hover!
              hoverIntensity: 1.0,   // Increase emission power and micro-shimmer sparkles
              duration: 0.45,
              ease: "power2.out",
              overwrite: "auto",
            });
          }
        }
      }
    };

    let isDragging = false;
    let lastMousePos = { x: 0, y: 0 };
    let dragRingIndex = -1;

    const handleMouseDown = (event: MouseEvent) => {
      isDragging = true;
      lastMousePos.x = event.clientX;
      lastMousePos.y = event.clientY;

      const rect = renderer.domElement.getBoundingClientRect();
      const clientX = event.clientX - rect.left;
      const clientY = event.clientY - rect.top;
      const clickMouse = new THREE.Vector2(
        (clientX / rect.width) * 2 - 1,
        -(clientY / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(clickMouse, camera);

      let closestIndex = -1;
      let minDistance = Infinity;
      physicalRings.forEach((pr) => {
        const intersects = raycaster.intersectObjects(pr.group.children, true);
        if (intersects.length > 0) {
          if (intersects[0].distance < minDistance) {
            minDistance = intersects[0].distance;
            closestIndex = pr.index;
          }
        }
      });
      dragRingIndex = closestIndex;
    };

    const handleMouseMoveDrag = (event: MouseEvent) => {
      handleMouseMove(event);

      if (!isDragging) return;

      const currentX = event.clientX;
      const currentY = event.clientY;
      const dx = currentX - lastMousePos.x;
      const dy = currentY - lastMousePos.y;

      const sensitivity = 0.0055;
      if (dragRingIndex !== -1) {
        const ring = physicalRings.find((p) => p.index === dragRingIndex);
        if (ring) {
          ring.rotVelocity.y += dx * sensitivity * 1.6;
          ring.rotVelocity.x += dy * sensitivity * 1.6;
        }
      } else if (selectedIndexRef.current !== -1) {
        const activeRing = physicalRings.find((p) => p.index === selectedIndexRef.current);
        if (activeRing) {
          activeRing.rotVelocity.y += dx * sensitivity * 1.6;
          activeRing.rotVelocity.x += dy * sensitivity * 1.6;
        }
      } else {
        physicalRings.forEach((pr) => {
          pr.rotVelocity.y += dx * sensitivity * 0.45;
          pr.rotVelocity.x += dy * sensitivity * 0.45;
        });
      }

      lastMousePos.x = currentX;
      lastMousePos.y = currentY;
    };

    const handleMouseUp = () => {
      isDragging = false;
      dragRingIndex = -1;
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 0) return;
      isDragging = true;
      const touch = event.touches[0];
      lastMousePos.x = touch.clientX;
      lastMousePos.y = touch.clientY;

      const rect = renderer.domElement.getBoundingClientRect();
      const clientX = touch.clientX - rect.left;
      const clientY = touch.clientY - rect.top;
      const clickMouse = new THREE.Vector2(
        (clientX / rect.width) * 2 - 1,
        -(clientY / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(clickMouse, camera);

      let closestIndex = -1;
      let minDistance = Infinity;
      physicalRings.forEach((pr) => {
        const intersects = raycaster.intersectObjects(pr.group.children, true);
        if (intersects.length > 0) {
          if (intersects[0].distance < minDistance) {
            minDistance = intersects[0].distance;
            closestIndex = pr.index;
          }
        }
      });
      dragRingIndex = closestIndex;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!isDragging || event.touches.length === 0) return;
      const touch = event.touches[0];
      const currentX = touch.clientX;
      const currentY = touch.clientY;
      const dx = currentX - lastMousePos.x;
      const dy = currentY - lastMousePos.y;

      const sensitivity = 0.0055;
      if (dragRingIndex !== -1) {
        const ring = physicalRings.find((p) => p.index === dragRingIndex);
        if (ring) {
          ring.rotVelocity.y += dx * sensitivity * 1.6;
          ring.rotVelocity.x += dy * sensitivity * 1.6;
        }
      } else if (selectedIndexRef.current !== -1) {
        const activeRing = physicalRings.find((p) => p.index === selectedIndexRef.current);
        if (activeRing) {
          activeRing.rotVelocity.y += dx * sensitivity * 1.6;
          activeRing.rotVelocity.x += dy * sensitivity * 1.6;
        }
      } else {
        physicalRings.forEach((pr) => {
          pr.rotVelocity.y += dx * sensitivity * 0.45;
          pr.rotVelocity.x += dy * sensitivity * 0.45;
        });
      }

      lastMousePos.x = currentX;
      lastMousePos.y = currentY;
    };

    container.addEventListener("click", handleCanvasClick);
    container.addEventListener("mousedown", handleMouseDown);
    container.addEventListener("mousemove", handleMouseMoveDrag);
    container.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("mouseleave", handleMouseUp);
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: true });
    container.addEventListener("touchend", handleMouseUp, { passive: true });

    // ─── PART 9: RENDER / ANIMATION RAF LOOP ─────────────────────────────
    let clock = new THREE.Clock();
    let animationFrameId = 0;
    let frameCount = 0;
    let lastFpsUpdate = performance.now();

    // Throttle, Dynamic Pixel Ratio scaling, and Fixed Physics Timestep variables
    let lastRenderTime = performance.now();
    const FRAME_DURATION = 1000 / 60; // Locked 60 FPS frame duration limit
    let physicsAccumulator = 0;
    const FIXED_TIMESTEP = 0.016666; // Fixed timestep (60 Hz clock)

    let currentDPRScale = Math.min(window.devicePixelRatio, 4.0);
    let targetDPRScale = currentDPRScale;
    let lastScalingTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const now = performance.now();
      const elapsed = now - lastRenderTime;

      // requestAnimationFrame Throttle to enforce a stable, stutter-free maximum frame delivery rate
      if (elapsed < FRAME_DURATION - 0.5) {
        return;
      }

      // Maintain lock-step frame spacing to eliminate refresh-rate drift
      lastRenderTime = now - (elapsed % FRAME_DURATION);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Dynamic Resolution Scaling (DRS) based on frame render latency
      const scaleDelta = now - lastScalingTime;
      if (scaleDelta > 350) {
        if (delta > 0.020) { // Slow frame detected (under ~50fps): immediately step down resolution to preserve performance
          targetDPRScale = Math.max(1.0, targetDPRScale - 0.4);
          lastScalingTime = now;
        } else if (delta < 0.015 && targetDPRScale < currentDPRScale) { // Fast frames (above 65fps) stable: gently scale back to pristine High-DPI
          targetDPRScale = Math.min(currentDPRScale, targetDPRScale + 0.2);
          lastScalingTime = now;
        }
      }

      // Smoothly interpolate pixel ratio to avoid any screen-freeze or abrupt changes
      const activeDPR = THREE.MathUtils.lerp(renderer.getPixelRatio(), targetDPRScale, 1.5 * delta);
      if (Math.abs(renderer.getPixelRatio() - activeDPR) > 0.01) {
        renderer.setPixelRatio(activeDPR);
        composer.setPixelRatio(activeDPR);
        composer.setSize(container.clientWidth, container.clientHeight);
      }

      // Performance stats calculation
      frameCount++;
      const currentPerfTime = performance.now();
      if (currentPerfTime - lastFpsUpdate >= 500) {
        const computedFps = Math.round((frameCount * 1000) / (currentPerfTime - lastFpsUpdate));
        const computedCalls = renderer.info.render.calls;
        const computedTriangles = renderer.info.render.triangles;
        frameCount = 0;
        lastFpsUpdate = currentPerfTime;

        // Directly manipulate DOM elements for zero-overhead performance overlay (no React re-renders!)
        const fpsEl = document.getElementById("perf-fps-val");
        const callsEl = document.getElementById("perf-calls-val");
        const trisEl = document.getElementById("perf-tris-val");
        const glowEl = document.getElementById("perf-glow-val");

        if (fpsEl) {
          fpsEl.textContent = `${computedFps} FPS`;
          if (computedFps > 55) {
            fpsEl.className = "text-emerald-400 font-bold";
          } else if (computedFps > 30) {
            fpsEl.className = "text-yellow-400 font-bold";
          } else {
            fpsEl.className = "text-red-400 font-bold";
          }
        }
        if (callsEl) {
          callsEl.textContent = `${computedCalls}`;
        }
        if (trisEl) {
          trisEl.textContent = `${computedTriangles.toLocaleString()}`;
        }
        if (glowEl) {
          glowEl.textContent = `${bloomIntensityRef.current.toFixed(1)}x`;
        }
      }

      const activeIdx = selectedIndexRef.current;

      // ─── FIXED TIMESTEP ACCUMULATOR LOOP FOR PHYSIO-KINETIC CALCULATIONS ───
      physicsAccumulator += delta;
      if (physicsAccumulator > 0.1) {
        physicsAccumulator = 0.1; // Clamp accumulator to avoid performance "spikes of doom" on lag
      }

      while (physicsAccumulator >= FIXED_TIMESTEP) {
        // 1. Rotate deep space stars & plasma drift (Fixed Update)
        starField.rotation.y += 0.005 * FIXED_TIMESTEP;

        const posAttr = driftingParticles.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          let y = posAttr.getY(i) - particleSpeeds[i] * 5.0 * FIXED_TIMESTEP;
          if (y < -80) {
            y = 80;
          }
          posAttr.setY(i, y);
        }
        posAttr.needsUpdate = true;

        // 2. Spin central Gyros in conflicting patterns (Fixed Update)
        gyroRings.forEach((ring, idx) => {
          const factor = (idx + 1) * 0.12;
          ring.rotation.x += factor * FIXED_TIMESTEP;
          ring.rotation.y += factor * 0.7 * FIXED_TIMESTEP;
        });

        // 3. Inertia-based Rotational Ring Physics & Spring/Viscous damping Calculations
        physicalRings.forEach((pr) => {
          const isSelected = pr.index === activeIdx;
          const isBeingDragged = isDragging && (dragRingIndex === pr.index || (dragRingIndex === -1 && activeIdx === pr.index));

          if (isSelected) {
            // Centered active ring spins rapidly under sustained driving torque
            const targetVx = 0.50;
            const targetVy = 1.40;
            const targetVz = 0.05;

            // Only apply sustained target driving torque if user is not actively whipping/dragging the ring
            if (!isBeingDragged) {
              pr.rotVelocity.x = THREE.MathUtils.lerp(pr.rotVelocity.x, targetVx, 2.5 * FIXED_TIMESTEP);
              pr.rotVelocity.y = THREE.MathUtils.lerp(pr.rotVelocity.y, targetVy, 2.5 * FIXED_TIMESTEP);
              pr.rotVelocity.z = THREE.MathUtils.lerp(pr.rotVelocity.z, targetVz, 2.5 * FIXED_TIMESTEP);
            } else {
              // Under manual drag interaction, apply standard cinematic velocity friction decay to prevent spin explosion
              pr.rotVelocity.x *= Math.pow(0.95, FIXED_TIMESTEP * 25);
              pr.rotVelocity.y *= Math.pow(0.95, FIXED_TIMESTEP * 25);
              pr.rotVelocity.z *= Math.pow(0.95, FIXED_TIMESTEP * 25);
            }

            // Rotate group coordinates
            pr.group.rotation.x += pr.rotVelocity.x * FIXED_TIMESTEP;
            pr.group.rotation.y += pr.rotVelocity.y * FIXED_TIMESTEP;
            pr.group.rotation.z += pr.rotVelocity.z * FIXED_TIMESTEP;
          } else {
            // RESTORING TORSION SPRING AND VISCOUS DAMPING MODEL
            // Returns shortest path angular differences around Euler angles
            const shortestAngleDiff = (current: number, target: number) => {
              return Math.atan2(Math.sin(current - target), Math.cos(current - target));
            };

            // If the unselected ring is being dragged, skip spring-back force & let manual spin dominate
            let accelX = 0;
            let accelY = 0;
            let accelZ = 0;

            if (!isBeingDragged) {
              // Stiffness drives the pull back to original stable orientation
              // Damping slows down high rotation speeds smoothly over time to prevent chaotic ringing
              const stiffness = 2.5; 
              const damping = 1.6;

              accelX = -stiffness * shortestAngleDiff(pr.group.rotation.x, pr.initRot.x) - damping * pr.rotVelocity.x;
              accelY = -stiffness * shortestAngleDiff(pr.group.rotation.y, pr.initRot.y) - damping * pr.rotVelocity.y;
              accelZ = -stiffness * shortestAngleDiff(pr.group.rotation.z, pr.initRot.z) - damping * pr.rotVelocity.z;
            }

            // Integrate acceleration into angular velocity
            pr.rotVelocity.x += accelX * FIXED_TIMESTEP;
            pr.rotVelocity.y += accelY * FIXED_TIMESTEP;
            pr.rotVelocity.z += accelZ * FIXED_TIMESTEP;

            // Apply quadratic/exponential aerodynamic air drag so high speeds decay quickly & gradually to zero
            const physicalDrag = Math.pow(0.932, FIXED_TIMESTEP * 25);
            pr.rotVelocity.x *= physicalDrag;
            pr.rotVelocity.y *= physicalDrag;
            pr.rotVelocity.z *= physicalDrag;

            // Apply final integrated rotation step
            pr.group.rotation.x += pr.rotVelocity.x * FIXED_TIMESTEP;
            pr.group.rotation.y += pr.rotVelocity.y * FIXED_TIMESTEP;
            pr.group.rotation.z += pr.rotVelocity.z * FIXED_TIMESTEP;
          }
        });

        physicsAccumulator -= FIXED_TIMESTEP;
      }

      // ─── VISUAL/RENDERING CYCLE (interpolations and render-frame visual properties) ───
      // update dynamic background nebulas shader
      nebulaMaterial.uniforms.uTime.value = time;

      // 1B. Animate spinning high-detail sparks ring in opposite direction
      const sparksPosAttr = sparksRing.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < SPARKS_COUNT; i++) {
        const rate = sparksRates[i];
        const baseRad = sparksRadii[i];
        // Rotate in reverse slowly
        const ang = -time * rate + (i / SPARKS_COUNT) * Math.PI * 2 + sparksOffsets[i] * 0.05;
        // Minor pulse distance
        const rad = baseRad + Math.sin(time * 1.2 + sparksOffsets[i]) * 1.5;
        const zValue = Math.cos(time * 0.4 + sparksOffsets[i]) * 3.0;
        sparksPosAttr.setXYZ(i, Math.cos(ang) * rad, Math.sin(ang) * rad, zValue);
      }
      sparksPosAttr.needsUpdate = true;

      icoMesh.rotation.y = -time * 0.04;
      sigilGroup.rotation.z = time * 0.02;

      // Pulse core glowing intensity
      const pulseRatio = 1.0 + 0.3 * Math.sin(time * 2.5);
      coreMat.emissiveIntensity = 1.5 * pulseRatio;

      const isAgentActive = activeIdx !== -1;

      // Hover-responsive parallax camera shift
      const targetCamX = parallax.x * 12.0;
      const targetCamY = parallax.y * 10.0;
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 3.5 * delta);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 3.5 * delta);
      camera.lookAt(0, 0, 0);

      // ─── UPDATE AND EMIT LIGHT TRAILS ───
      physicalRings.forEach((pr) => {
        const isSelected = pr.index === activeIdx;
        const emitProb = isSelected ? 0.95 : 0.4;
        
        if (Math.random() < emitProb) {
          const rColor = new THREE.Color(pr.color);
          const activeAgent = agents.find((ag) => ag.index === pr.index);
          const accentColor = activeAgent ? new THREE.Color(activeAgent.accentColor) : rColor;
          const blendedColor = rColor.clone().lerp(accentColor, 0.45);

          activeTrails.push({
            pos: new THREE.Vector3(),
            color: blendedColor,
            size: (isSelected ? 5.2 : 2.6) * (0.6 + Math.random() * 0.9),
            age: 0,
            maxAge: 0.8 + Math.random() * 1.0,
            theta: Math.random() * Math.PI * 2,
            radialOffset: (Math.random() - 0.5) * 0.6,
            speed: (0.8 + Math.random() * 1.2) * (isSelected ? 2.5 : 1.0),
            ringIndex: pr.index,
            zWobbleFreq: 2.0 + Math.random() * 4.0,
          });
        }
      });

      // Update particle ages and move vertices
      const posArr = trailGeo.attributes.position.array as Float32Array;
      const colArr = trailGeo.attributes.color.array as Float32Array;
      const sizeArr = trailGeo.attributes.size.array as Float32Array;

      let traceCount = 0;
      for (let i = activeTrails.length - 1; i >= 0; i--) {
        const pt = activeTrails[i];
        pt.age += delta;

        // splicing if old
        if (pt.age >= pt.maxAge) {
          activeTrails.splice(i, 1);
          continue;
        }

        if (traceCount < MAX_TRAIL_PARTICLES) {
          const pr = physicalRings.find((r) => r.index === pt.ringIndex);
          if (pr) {
            // increment angle around the torus ring path
            pt.theta += pt.speed * delta;

            const radius = 8.0 + pt.radialOffset;
            const localX = Math.cos(pt.theta) * radius;
            const localY = Math.sin(pt.theta) * radius;
            const localZ = Math.sin(pt.theta * pt.zWobbleFreq + pt.age * 5.0) * 0.5;

            const localPos = new THREE.Vector3(localX, localY, localZ);
            pt.pos.copy(localPos).applyMatrix4(pr.group.matrixWorld);

            const pct = pt.age / pt.maxAge;
            const alpha = 1.0 - pct;

            posArr[traceCount * 3] = pt.pos.x;
            posArr[traceCount * 3 + 1] = pt.pos.y;
            posArr[traceCount * 3 + 2] = pt.pos.z;

            colArr[traceCount * 3] = pt.color.r * alpha * 2.2;
            colArr[traceCount * 3 + 1] = pt.color.g * alpha * 2.2;
            colArr[traceCount * 3 + 2] = pt.color.b * alpha * 2.2;

            sizeArr[traceCount] = pt.size * alpha;

            traceCount++;
          }
        }
      }

      // Zero-out remaining particles
      for (let i = traceCount; i < MAX_TRAIL_PARTICLES; i++) {
        posArr[i * 3] = 9999.0;
        posArr[i * 3 + 1] = 9999.0;
        posArr[i * 3 + 2] = 9999.0;
        colArr[i * 3] = 0;
        colArr[i * 3 + 1] = 0;
        colArr[i * 3 + 2] = 0;
        sizeArr[i] = 0;
      }

      trailGeo.attributes.position.needsUpdate = true;
      trailGeo.attributes.color.needsUpdate = true;
      trailGeo.attributes.size.needsUpdate = true;

      // ─── DYNAMIC DEPTH OF FIELD (DoF) FOCUS AND BLUR INTERPOLATION ───
      if (isAgentActive) {
        const focusedRing = physicalRings.find((pr) => pr.index === activeIdx);
        if (focusedRing) {
          const tempV = new THREE.Vector3();
          focusedRing.group.getWorldPosition(tempV);
          tempV.project(camera);
          
          const focusX = (tempV.x * 0.5) + 0.5;
          const focusY = (tempV.y * 0.5) + 0.5;
          dofPass.uniforms.uFocusPoint.value.set(focusX, focusY);
        }
      }

      const targetDofEnabled = isAgentActive ? 1.0 : 0.0;
      dofPass.uniforms.uEnabled.value = THREE.MathUtils.lerp(
        dofPass.uniforms.uEnabled.value,
        targetDofEnabled,
        5.0 * delta
      );

      // ─── DYNAMIC BLOOM PASS ADAPTATION BASED ON SELECTION & CALIBRATION ───
      const targetBloomRadius = isAgentActive ? 1.25 : 0.65;
      bloomPass.uniforms.uIntensity.value = THREE.MathUtils.lerp(bloomPass.uniforms.uIntensity.value, (isAgentActive ? 2.35 : 1.15) * bloomIntensityRef.current, 5.0 * delta);
      bloomPass.uniforms.uThreshold.value = bloomThresholdRef.current;

      // Shift workspace ambient/point lights and core material colors towards agent accent color when active
      const activeAgent = agents.find((ag) => ag.index === activeIdx);
      if (activeAgent) {
        const accentColObj = new THREE.Color(activeAgent.accentColor);
        const stoneColObj = new THREE.Color(activeAgent.stoneColor);

        pointLight2.color.lerp(accentColObj, 5.0 * delta);
        pointLight1.color.lerp(stoneColObj, 5.0 * delta);

        coreMat.color.lerp(accentColObj, 5.0 * delta);
        coreMat.emissive.lerp(accentColObj, 5.0 * delta);
      } else {
        const defaultAccent = new THREE.Color(0x7c4df3);
        const defaultStone = new THREE.Color(0xffd070);

        pointLight2.color.lerp(defaultAccent, 4.0 * delta);
        pointLight1.color.lerp(defaultStone, 4.0 * delta);

        coreMat.color.lerp(new THREE.Color(0xff9900), 4.0 * delta);
        coreMat.emissive.lerp(new THREE.Color(0xff9900), 4.0 * delta);
      }

      // 3. Interpolations & Ring Animations (Positions, scales, Hover materials, MotionBlur vector tracking)
      let calculatedMotionBlurVector = new THREE.Vector2(0, 0);

      physicalRings.forEach((pr) => {
        const isSelected = pr.index === activeIdx;

        // Smooth position positioning (LERP with integrated floating offset to prevent jumps)
        const ringAngle = (pr.index / 10) * Math.PI * 2;
        const ringFloatOffset = isSelected ? 0.0 : Math.sin(time * 1.5 + ringAngle) * 3.5;
        const targetPos = isSelected 
          ? new THREE.Vector3(0, 0, 18) 
          : new THREE.Vector3(pr.homePos.x, pr.homePos.y + ringFloatOffset, pr.homePos.z);
        pr.group.position.lerp(targetPos, 7.0 * delta);
        
        // Compute base and hover-multipled GSAP scale
        const scaleVal = pr.animState.scale * pr.animState.hoverScale;
        pr.group.scale.set(scaleVal, scaleVal, scaleVal);

        // Update custom shader material properties
        if (pr.bandMesh.material instanceof THREE.ShaderMaterial) {
          pr.bandMesh.material.uniforms.uTime.value = time;
          pr.bandMesh.material.uniforms.uHoverIntensity.value = pr.animState.hoverIntensity;
          pr.bandMesh.material.uniforms.uPulseIntensity.value = pr.animState.pulseIntensity;

          // Dynamic Bokeh Depth Of Field interpolation
          // If no specific ring is active, keep all clear and focused (0.0)
          // If a ring is active, blur all OTHER rings seamlessly (1.0)
          const targetDoF = (activeIdx !== -1 && !isSelected) ? 1.0 : 0.0;
          const currentDoF = pr.bandMesh.material.uniforms.uDoFBlur.value;
          pr.bandMesh.material.uniforms.uDoFBlur.value = THREE.MathUtils.lerp(currentDoF, targetDoF, 6.0 * delta);
        }

        // Project the physical ring spin velocity into 2D camera coordinates for camera motion blur calculations
        if (isSelected || activeIdx === -1) {
          calculatedMotionBlurVector.x += pr.rotVelocity.y * 0.0035; // Horizontal screen blur from rotating around vertical Y-axis
          calculatedMotionBlurVector.y += pr.rotVelocity.x * 0.0035; // Vertical screen blur from rotating around horizontal X-axis
        }

        if (isSelected) {
          pr.stoneMesh.scale.setScalar(1.0 + 0.2 * Math.sin(time * 5));
        } else {
          pr.stoneMesh.scale.setScalar(1.0);
        }
      });

      // Apply dynamic camera-screen motion blur pass values smoothly
      motionBlurPass.uniforms.uVelocity.value.x = THREE.MathUtils.lerp(motionBlurPass.uniforms.uVelocity.value.x, calculatedMotionBlurVector.x, 6.0 * delta);
      motionBlurPass.uniforms.uVelocity.value.y = THREE.MathUtils.lerp(motionBlurPass.uniforms.uVelocity.value.y, calculatedMotionBlurVector.y, 6.0 * delta);

      // Render backgrounds & main layers separately for high-fidelity composite depth
      renderer.autoClear = false;
      renderer.clear();
      
      // Render static background quad first on frame backbuffer (unbloomed)
      renderer.render(bgScene, bgCamera);
      
      // Render foreground interactive group inside the bloom composites pipeline
      composer.render();
    };

    // Pre-warm and compile both scene pipelines on the GPU to completely eliminate initial frame drops
    renderer.compile(scene, camera);
    renderer.compile(bgScene, bgCamera);

    animate();

    // ─── PART 10: RESIZE OBSERVER ────────────────────────────────────────
    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
      composer.setSize(container.clientWidth, container.clientHeight);
      ssaoPass.uniforms.uResolution.value.set(container.clientWidth, container.clientHeight);
      dofPass.uniforms.uResolution.value.set(container.clientWidth, container.clientHeight);
      bloomPass.uniforms.uResolution.value.set(container.clientWidth, container.clientHeight);
      motionBlurPass.uniforms.uResolution.value.set(container.clientWidth, container.clientHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // CLEANUP
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener("click", handleCanvasClick);
      container.removeEventListener("mousedown", handleMouseDown);
      container.removeEventListener("mousemove", handleMouseMoveDrag);
      container.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("mouseleave", handleMouseUp);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleMouseUp);
      resizeObserver.disconnect();
      renderer.dispose();
      composer.dispose();
    };
  }, [agents, onSelectRing]);

  return (
    <div id="solomon-render-viewport" ref={containerRef} className="relative w-full h-full cursor-pointer overflow-hidden rounded-2xl bg-slate-950 border border-slate-800/60 shadow-2xl group flex items-center justify-center">
      {/* Dynamic Instruction Overlay */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none bg-slate-950/80 backdrop-blur-sm px-3 h-8 flex items-center border border-slate-800 rounded-full text-xs font-mono text-slate-400 gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping" />
        SOLOMON COGNITIVE CORE • LAYER 3 INTERACTION
      </div>

      {/* Floating Reset-to-Overview FAB */}
      {selectedRingIndex !== -1 && (
        <button
          id="floating-reset-view-fab"
          onClick={(e) => {
            e.stopPropagation();
            onSelectRing(-1);
          }}
          className="absolute top-16 left-4 z-20 bg-slate-900/95 hover:bg-slate-850 text-orange-400 hover:text-orange-300 border border-orange-500/20 hover:border-orange-500/40 font-mono text-xs px-4 h-9 rounded-xl flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/5 pointer-events-auto cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-orange-400 transition-transform group-hover:rotate-18m animate-spin-pulse" />
          <span>RESET TO METROPOLIS CORE</span>
        </button>
      )}

      {/* FIXED GLASSMORPHIC RETURN BUTTON - UPPER RIGHT OF VIEWPORT */}
      {selectedRingIndex !== -1 && (
        <button
          id="upper-right-glass-return-btn"
          onClick={(e) => {
            e.stopPropagation();
            onSelectRing(-1);
          }}
          className="fixed top-6 right-6 z-[100] bg-slate-900/50 backdrop-blur-md hover:bg-slate-900/70 text-slate-100 hover:text-white border border-white/10 hover:border-purple-500/30 px-4 h-10 rounded-full flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/40 pointer-events-auto cursor-pointer font-mono text-[11px] tracking-wide"
        >
          <RotateCcw className="w-3.5 h-3.5 text-orange-400 transition-transform hover:rotate-[-45deg] duration-300" />
          <span>RETURN TO SYSTEM VIEW</span>
        </button>
      )}


      
      {/* FPS & Draw-Calls Overlay */}
      <div id="canvas-performance-monitor" className="absolute top-4 right-4 z-10 pointer-events-none bg-slate-950/85 backdrop-blur-md px-3 py-2 border border-slate-800/80 rounded-xl text-[10px] font-mono text-slate-300 space-y-1.5 min-w-[135px] hover:opacity-10 transition-opacity flex flex-col shadow-lg shadow-black/50">
        <div className="text-slate-500 font-bold border-b border-slate-900 pb-1 mb-0.5 flex items-center justify-between gap-1">
          <div className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-orange-400 animate-pulse" />
            <span>CORE MON</span>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-slate-500 uppercase font-sans font-bold">FPS:</span>
          <span id="perf-fps-val" className="text-emerald-400 font-bold">60 FPS</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-slate-500 uppercase font-sans font-bold">Calls:</span>
          <span id="perf-calls-val" className="text-purple-400 font-bold">0</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-slate-500 uppercase font-sans font-bold">Tris:</span>
          <span id="perf-tris-val" className="text-blue-400 font-bold">0</span>
        </div>
        <div className="flex justify-between gap-3 border-t border-slate-900/60 pt-1 mt-0.5">
          <span className="text-slate-500 uppercase font-sans font-bold">Glow:</span>
          <span id="perf-glow-val" className="text-amber-400 font-medium">1.5x</span>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-10 pointer-events-none bg-slate-950/85 backdrop-blur-sm px-4 py-2 border border-slate-800 rounded-xl text-[10px] font-mono text-slate-400 text-right">
        <div>ORBITAL RING VELOCITY: CONSTANT</div>
        <div className="text-orange-400">CLICK ANY ORBITAL RING TO MERGE COGNITIVE AGENT</div>
      </div>

      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* ARCHETYPE INSPECTOR MODAL */}
      {selectedRingIndex !== -1 && (() => {
        const activeAgent = agents.find((ag) => ag.index === selectedRingIndex);
        if (!activeAgent) return null;

        // Custom stats computed dynamically
        const specSegmentCount = 65536 + (activeAgent.detailType === 'hexNodes' ? 12288 : activeAgent.detailType === 'crystalFacets' ? 24576 : 8192);
        const rotationSpeed = (0.12 + selectedRingIndex * 0.045).toFixed(3);
        
        // Find historical audit logs specific to this agent
        const filteredLogs = auditLogs.filter(
          (log) => log.actor.toLowerCase().includes(activeAgent.name.toLowerCase()) || 
                   log.details.toLowerCase().includes(activeAgent.name.toLowerCase())
        );

        // Pre-seeded authentic logs if list is currently empty
        const defaultAgentLogs = [
          {
            id: `seed_log_1_${selectedRingIndex}`,
            timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
            action: "ENCLAVE_NODE_INITIALIZE",
            details: `Secure cryptographic handshake verified. Allocated custom ${activeAgent.detailType} geometries.`,
            status: "AUTHORIZED",
            cryptographicHash: "3f8ea9824bcdae7c4f1283adbaefde023847bcdfe7ab92cd84cdae8492bcdfae"
          },
          {
            id: `seed_log_2_${selectedRingIndex}`,
            timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString(),
            action: "SYNC_CONCURRENT_SENATE",
            details: `Calibrated focus vectors. Connected safely to local memory cortex with score ${activeAgent.reputationScore}%.`,
            status: "AUTHORIZED",
            cryptographicHash: "cf78de02bcdef9282387daea90bcde72c43bcdae34fdcc8902bcaeaefcde09d"
          }
        ];

        const displayLogs = filteredLogs.length > 0 ? filteredLogs : defaultAgentLogs;

        return (
          <div 
            className="absolute top-4 right-4 bottom-4 w-96 max-w-[calc(100%-2rem)] z-25 flex flex-col bg-slate-950/90 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-2xl shadow-purple-950/20 pointer-events-auto overflow-hidden animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Header */}
            <div className="p-4 border-b border-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div 
                  className="w-3.5 h-3.5 rounded-full" 
                  style={{ backgroundColor: `#${activeAgent.stoneColor.toString(16).padStart(6, '0')}`, boxShadow: `0 0 12px #${activeAgent.stoneColor.toString(16).padStart(6, '0')}` }} 
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-100 font-sans tracking-wide uppercase">{activeAgent.name}</h3>
                  <p className="text-[10px] text-slate-400 font-mono tracking-tight uppercase">ARCHETYPE INSPECTOR • CORE LAYER SPEC</p>
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectRing(-1);
                }}
                className="w-7 h-7 flex items-center justify-center bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer focus:outline-none"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5 overflow-y-auto font-mono text-xs flex-1">
              
              {/* Escape Button: Clear return pathway */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectRing(-1);
                }}
                className="w-full py-2.5 bg-orange-500/10 hover:bg-orange-500/15 border border-orange-500/20 text-orange-300 rounded-xl flex items-center justify-center gap-2 font-mono text-xs font-semibold transition-all shadow-md active:scale-95 cursor-pointer uppercase group"
              >
                <RotateCcw className="w-3.5 h-3.5 text-orange-400 group-hover:rotate-[-45deg] transition-transform animate-spin-pulse" />
                <span>← Return to Senate Overview</span>
              </button>

              {/* Description Box */}
              <div className="bg-slate-950/50 border border-slate-850 p-3.5 rounded-xl space-y-1.5">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">ROLE & CLASSIFICATION</span>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans font-medium">
                  {activeAgent.roleDescription}
                </p>
              </div>

                {/* Technical Specifications Grid */}
                <div className="space-y-2">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">TECHNICAL DESIGN SPECIFICATIONS</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-slate-950/30 border border-slate-800/40 p-2.5 rounded-lg">
                      <span className="text-[9px] text-slate-500 block">SEGMENT SUBDIVS</span>
                      <span className="text-slate-100 font-bold font-mono">{specSegmentCount.toLocaleString()} Polys</span>
                    </div>
                    <div className="bg-slate-950/30 border border-slate-800/40 p-2.5 rounded-lg">
                      <span className="text-[9px] text-slate-500 block">ORBIT ROT SPEED</span>
                      <span className="text-orange-400 font-bold font-mono">{rotationSpeed} rad/s</span>
                    </div>
                    <div className="bg-slate-950/30 border border-slate-800/40 p-2.5 rounded-lg">
                      <span className="text-[9px] text-slate-500 block">TACTILITY PATTERN</span>
                      <span className="text-purple-400 font-bold font-mono uppercase truncate">{activeAgent.detailType}</span>
                    </div>
                    <div className="bg-slate-950/30 border border-slate-800/40 p-2.5 rounded-lg">
                      <span className="text-[9px] text-slate-500 block">SOVEREIGNTY LEVEL</span>
                      <span className="text-emerald-400 font-bold font-mono">{activeAgent.reputationScore}% Verified</span>
                    </div>
                  </div>
                </div>

                {/* Cryptographic Key Detail */}
                <div className="bg-slate-950/40 border border-slate-800/40 p-3 rounded-lg flex items-center justify-between gap-3 text-[10px]">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                    <div>
                      <div className="text-slate-300 font-semibold leading-none">SIGNING ENCLAVE KEY</div>
                      <div className="text-[8px] text-slate-500 font-mono mt-0.5 uppercase">SEALED MASTER INVARIANT INTEGRITY</div>
                    </div>
                  </div>
                  <span className="text-[9px] text-blue-300 bg-blue-500/10 px-2 h-5 flex items-center border border-blue-500/20 rounded-md truncate max-w-[140px] select-all cursor-copy">
                    SHA256:(3f8e...{activeAgent.stoneColor.toString(16).substring(0,3)})
                  </span>
                </div>

                {/* Historical Audit Logs */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-950 pb-1.5">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">HISTORICAL AUDIT LOGS</span>
                    <span className="text-[9px] text-slate-500 font-mono">COUNT: {displayLogs.length}</span>
                  </div>
                  <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                    {displayLogs.map((log) => (
                      <div key={log.id} className="bg-slate-950/60 border border-slate-950 p-2.5 rounded-lg text-[10px] space-y-1">
                        <div className="flex items-center justify-between text-[8px] text-slate-500">
                          <span className="text-purple-400 font-semibold">{log.action || "OPERATION_LOGGED"}</span>
                          <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-slate-300 font-sans text-[11.5px] leading-normal">{log.details}</p>
                        <div className="text-[8px] text-slate-600 font-mono truncate">HASH: {log.cryptographicHash || "GENERIC_SECURE_RECORD"}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
              
              {/* Footer */}
              <div className="p-3 bg-slate-950 border-t border-slate-900 flex items-center justify-between text-[9px] font-mono text-slate-500 px-4">
                <span>TPM STATE: ARMED & RUNNING</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectRing(-1);
                  }}
                  className="text-orange-400 hover:text-white transition-colors cursor-pointer font-bold uppercase"
                >
                  DISMISS INSPECTOR
                </button>
              </div>

          </div>
        );
      })()}
    </div>
  );
}
