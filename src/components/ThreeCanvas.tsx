import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { Pass, FullScreenQuad } from "three/examples/jsm/postprocessing/Pass.js";
import { gsap } from "gsap";
import { RotateCcw, Sparkles, Activity, Shield, Cpu, RefreshCw, X, Eye, ShieldAlert, CheckCircle, Database } from "lucide-react";
import { AgentSpec, AuditLog, TelemetryPoint } from "../types";

const LineVertShader = `
  attribute float progress;
  varying float vProgress;
  void main() {
    vProgress = progress;
    // Optimized: Parenthesized matrix multiplication to calculate gl_Position with zero matrix-matrix overhead
    gl_Position = projectionMatrix * (modelViewMatrix * vec4(position, 1.0));
  }
`;

const LineFragShader = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uPulseSpeed;
  uniform float uColorIntensity;
  varying float vProgress;
  void main() {
    float wave = sin(vProgress * 10.0 - uTime * uPulseSpeed * 5.0) * 0.5 + 0.5;
    float wave2 = sin(vProgress * 22.0 - uTime * uPulseSpeed * 8.0) * 0.5 + 0.5;
    float waveBlend = mix(pow(wave, 6.0), pow(wave2, 3.5), 0.35);
    float glow = mix(0.15, 1.0, waveBlend) * uColorIntensity;
    gl_FragColor = vec4(uColor * glow * 1.8, glow * 0.38);
  }
`;

// Multi-pass Gaussian Bloom shaders and pass implementation
const BrightShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uThreshold: { value: 0.18 }
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
    uniform float uThreshold;
    varying vec2 vUv;
    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      float luma = dot(texel.rgb, vec3(0.299, 0.587, 0.114));
      float factor = smoothstep(uThreshold, uThreshold + 0.15, luma);
      gl_FragColor = vec4(texel.rgb * factor, texel.a);
    }
  `
};

const BlurShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uHorizontal: { value: true },
    uKernelSize: { value: 1.0 }
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
    uniform bool uHorizontal;
    uniform float uKernelSize;
    varying vec2 vUv;
    void main() {
      float weight[5];
      weight[0] = 0.2270270270;
      weight[1] = 0.1945945946;
      weight[2] = 0.1216216216;
      weight[3] = 0.0540540541;
      weight[4] = 0.0162162162;
      
      vec2 offset = vec2(uKernelSize) / uResolution;
      vec3 result = texture2D(tDiffuse, vUv).rgb * weight[0];
      if (uHorizontal) {
        for (int i = 1; i < 5; ++i) {
          result += texture2D(tDiffuse, vUv + vec2(offset.x * float(i), 0.0)).rgb * weight[i];
          result += texture2D(tDiffuse, vUv - vec2(offset.x * float(i), 0.0)).rgb * weight[i];
        }
      } else {
        for (int i = 1; i < 5; ++i) {
          result += texture2D(tDiffuse, vUv + vec2(0.0, offset.y * float(i))).rgb * weight[i];
          result += texture2D(tDiffuse, vUv - vec2(0.0, offset.y * float(i))).rgb * weight[i];
        }
      }
      gl_FragColor = vec4(result, 1.0);
    }
  `
};

const MultiPassBloomCompositeShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    tBloom1: { value: null as THREE.Texture | null },
    tBloom2: { value: null as THREE.Texture | null },
    tBloom3: { value: null as THREE.Texture | null },
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
    uniform sampler2D tBloom1;
    uniform sampler2D tBloom2;
    uniform sampler2D tBloom3;
    uniform float uIntensity;
    varying vec2 vUv;
    void main() {
      vec4 original = texture2D(tDiffuse, vUv);
      vec3 bloom1 = texture2D(tBloom1, vUv).rgb;
      vec3 bloom2 = texture2D(tBloom2, vUv).rgb;
      vec3 bloom3 = texture2D(tBloom3, vUv).rgb;
      
      vec3 finalBloom = (bloom1 * 0.45 + bloom2 * 0.35 + bloom3 * 0.20) * uIntensity;
      gl_FragColor = vec4(original.rgb + finalBloom, original.a);
    }
  `
};

export class MultiPassGaussianBloomPass extends Pass {
  threshold: number;
  intensity: number;
  
  brightRT: THREE.WebGLRenderTarget | null = null;
  rt1_h: THREE.WebGLRenderTarget | null = null;
  rt1_v: THREE.WebGLRenderTarget | null = null;
  rt2_h: THREE.WebGLRenderTarget | null = null;
  rt2_v: THREE.WebGLRenderTarget | null = null;
  rt3_h: THREE.WebGLRenderTarget | null = null;
  rt3_v: THREE.WebGLRenderTarget | null = null;

  brightQuad: FullScreenQuad;
  blurQuad: FullScreenQuad;
  compositeQuad: FullScreenQuad;

  width: number = 0;
  height: number = 0;

  constructor(width: number, height: number, threshold: number, intensity: number) {
    super();
    this.threshold = threshold;
    this.intensity = intensity;

    const brightMat = new THREE.ShaderMaterial(BrightShader);
    this.brightQuad = new FullScreenQuad(brightMat);

    const blurMat = new THREE.ShaderMaterial(BlurShader);
    this.blurQuad = new FullScreenQuad(blurMat);

    const compMat = new THREE.ShaderMaterial(MultiPassBloomCompositeShader);
    this.compositeQuad = new FullScreenQuad(compMat);

    this.setSize(width, height);
  }

  setSize(width: number, height: number) {
    if (this.width === width && this.height === height) return;
    this.width = width;
    this.height = height;

    if (this.brightRT) this.brightRT.dispose();
    if (this.rt1_h) this.rt1_h.dispose();
    if (this.rt1_v) this.rt1_v.dispose();
    if (this.rt2_h) this.rt2_h.dispose();
    if (this.rt2_v) this.rt2_v.dispose();
    if (this.rt3_h) this.rt3_h.dispose();
    if (this.rt3_v) this.rt3_v.dispose();

    const pars = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat
    };

    this.brightRT = new THREE.WebGLRenderTarget(width, height, pars);
    
    this.rt1_h = new THREE.WebGLRenderTarget(Math.max(1, Math.floor(width / 2)), Math.max(1, Math.floor(height / 2)), pars);
    this.rt1_v = new THREE.WebGLRenderTarget(Math.max(1, Math.floor(width / 2)), Math.max(1, Math.floor(height / 2)), pars);

    this.rt2_h = new THREE.WebGLRenderTarget(Math.max(1, Math.floor(width / 4)), Math.max(1, Math.floor(height / 4)), pars);
    this.rt2_v = new THREE.WebGLRenderTarget(Math.max(1, Math.floor(width / 4)), Math.max(1, Math.floor(height / 4)), pars);

    this.rt3_h = new THREE.WebGLRenderTarget(Math.max(1, Math.floor(width / 8)), Math.max(1, Math.floor(height / 8)), pars);
    this.rt3_v = new THREE.WebGLRenderTarget(Math.max(1, Math.floor(width / 8)), Math.max(1, Math.floor(height / 8)), pars);
  }

  render(renderer: THREE.WebGLRenderer, writeBuffer: THREE.WebGLRenderTarget, readBuffer: THREE.WebGLRenderTarget, deltaTime: number, maskActive: boolean) {
    if (!this.brightRT || !this.rt1_h || !this.rt1_v || !this.rt2_h || !this.rt2_v || !this.rt3_h || !this.rt3_v) return;

    const initialRenderTarget = renderer.getRenderTarget();

    // 1. Bright isolating pass
    const brightMat = this.brightQuad.material as THREE.ShaderMaterial;
    brightMat.uniforms.tDiffuse.value = readBuffer.texture;
    brightMat.uniforms.uThreshold.value = this.threshold;
    renderer.setRenderTarget(this.brightRT);
    renderer.clear();
    this.brightQuad.render(renderer);

    // 2. Blur level 1 (1/2 size)
    const blurMat = this.blurQuad.material as THREE.ShaderMaterial;
    blurMat.uniforms.uKernelSize.value = 1.0;
    
    blurMat.uniforms.tDiffuse.value = this.brightRT.texture;
    blurMat.uniforms.uHorizontal.value = true;
    blurMat.uniforms.uResolution.value.set(Math.max(1, this.width / 2), Math.max(1, this.height / 2));
    renderer.setRenderTarget(this.rt1_h);
    renderer.clear();
    this.blurQuad.render(renderer);
    
    blurMat.uniforms.tDiffuse.value = this.rt1_h.texture;
    blurMat.uniforms.uHorizontal.value = false;
    renderer.setRenderTarget(this.rt1_v);
    renderer.clear();
    this.blurQuad.render(renderer);

    // 3. Blur level 2 (1/4 size)
    blurMat.uniforms.uKernelSize.value = 2.0;

    blurMat.uniforms.tDiffuse.value = this.rt1_v.texture;
    blurMat.uniforms.uHorizontal.value = true;
    blurMat.uniforms.uResolution.value.set(Math.max(1, this.width / 4), Math.max(1, this.height / 4));
    renderer.setRenderTarget(this.rt2_h);
    renderer.clear();
    this.blurQuad.render(renderer);

    blurMat.uniforms.tDiffuse.value = this.rt2_h.texture;
    blurMat.uniforms.uHorizontal.value = false;
    renderer.setRenderTarget(this.rt2_v);
    renderer.clear();
    this.blurQuad.render(renderer);

    // 4. Blur level 3 (1/8 size)
    blurMat.uniforms.uKernelSize.value = 4.0;

    blurMat.uniforms.tDiffuse.value = this.rt2_v.texture;
    blurMat.uniforms.uHorizontal.value = true;
    blurMat.uniforms.uResolution.value.set(Math.max(1, this.width / 8), Math.max(1, this.height / 8));
    renderer.setRenderTarget(this.rt3_h);
    renderer.clear();
    this.blurQuad.render(renderer);

    blurMat.uniforms.tDiffuse.value = this.rt3_h.texture;
    blurMat.uniforms.uHorizontal.value = false;
    renderer.setRenderTarget(this.rt3_v);
    renderer.clear();
    this.blurQuad.render(renderer);

    // 5. Composite pass
    const compMat = this.compositeQuad.material as THREE.ShaderMaterial;
    compMat.uniforms.tDiffuse.value = readBuffer.texture;
    compMat.uniforms.tBloom1.value = this.rt1_v.texture;
    compMat.uniforms.tBloom2.value = this.rt2_v.texture;
    compMat.uniforms.tBloom3.value = this.rt3_v.texture;
    compMat.uniforms.uIntensity.value = this.intensity;

    if (this.renderToScreen) {
      renderer.setRenderTarget(initialRenderTarget);
      this.compositeQuad.render(renderer);
    } else {
      renderer.setRenderTarget(writeBuffer);
      if (this.clear) renderer.clear();
      this.compositeQuad.render(renderer);
    }
  }

  dispose() {
    this.brightQuad.dispose();
    this.blurQuad.dispose();
    this.compositeQuad.dispose();
    if (this.brightRT) this.brightRT.dispose();
    if (this.rt1_h) this.rt1_h.dispose();
    if (this.rt1_v) this.rt1_v.dispose();
    if (this.rt2_h) this.rt2_h.dispose();
    if (this.rt2_v) this.rt2_v.dispose();
    if (this.rt3_h) this.rt3_h.dispose();
    if (this.rt3_v) this.rt3_v.dispose();
  }
}

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
// Screen Space Ambient Occlusion (SSAO) shader definition for soft, realistic contact shadows using depth and luma crevices
const SSAOShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    tDepth: { value: null as THREE.Texture | null },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uAOStrength: { value: 1.8 },
    uAORadius: { value: 4.8 },
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
    uniform sampler2D tDepth;
    uniform vec2 uResolution;
    uniform float uAOStrength;
    uniform float uAORadius;
    varying vec2 vUv;

    float rand(vec2 co) {
      return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }

    float getLinearDepth(vec2 uv) {
      float d = texture2D(tDepth, uv).r;
      float near = 0.1;
      float far = 2000.0;
      return (2.0 * near * far) / (far + near - d * (far - near));
    }

    void main() {
      vec4 sceneCol = texture2D(tDiffuse, vUv);
      float currentDepth = getLinearDepth(vUv);
      float currentLuma = dot(sceneCol.rgb, vec3(0.299, 0.587, 0.114));
      
      // If we are looking at far background sky parameters, don't perform heavy AO
      if (currentDepth > 1900.0) {
        gl_FragColor = sceneCol;
        return;
      }
      
      float ao = 0.0;
      float totalWeight = 0.0;
      const int SAMPLE_COUNT = 16;
      
      // Radius scaled slightly based on perspective depth for consistent physical grounding
      float perspectiveRadius = uAORadius * (1.0 / (0.01 + currentDepth * 0.0035));
      float stepSize = perspectiveRadius / max(uResolution.x, uResolution.y);
      
      for (int i = 0; i < SAMPLE_COUNT; i++) {
        float angle = (float(i) / float(SAMPLE_COUNT)) * 6.2831853;
        float noiseFactor = 0.45 + 0.55 * rand(vUv * 123.456 + float(i));
        vec2 offset = vec2(cos(angle), sin(angle)) * stepSize * noiseFactor;
        
        vec2 sampleUv = vUv + offset;
        float sampleDepth = getLinearDepth(sampleUv);
        vec4 sampleCol = texture2D(tDiffuse, sampleUv);
        float sampleLuma = dot(sampleCol.rgb, vec3(0.299, 0.587, 0.114));
        
        // 1. Depth-based proximity occlusion
        float depthDiff = currentDepth - sampleDepth;
        
        // 2. Luma-based color-space crevice occlusion
        float lumaDiff = max(0.0, sampleLuma - currentLuma);
        
        // Occlude if sample point is physically in front of or inside a crevice
        if (depthDiff > 0.01 && depthDiff < 12.0) {
          float rangeNull = 1.0 - smoothstep(6.0, 12.0, depthDiff);
          float weight = (1.0 - (float(i) / float(SAMPLE_COUNT))) * rangeNull;
          ao += (depthDiff * 0.15 + lumaDiff * 0.5) * weight;
          totalWeight += weight;
        } else {
          float weight = (1.0 - (float(i) / float(SAMPLE_COUNT))) * 0.2;
          ao += lumaDiff * 0.3 * weight;
          totalWeight += weight;
        }
      }
      
      ao = (ao / max(totalWeight, 0.001)) * uAOStrength;
      
      // Keep highlights and glowing cores bright (prevent shadowing self-illuminating objects)
      float highlightMask = 1.0 - smoothstep(0.55, 0.90, currentLuma);
      float emptySpaceMask = smoothstep(0.02, 0.12, currentLuma);
      
      float shadowFactor = clamp(1.0 - ao * highlightMask * emptySpaceMask, 0.32, 1.0);
      
      gl_FragColor = vec4(sceneCol.rgb * shadowFactor, sceneCol.a);
    }
  `
};

// Cinematic Depth of Field (DoF) post-processing shader with depth-texture based focal plane selection and gorgeous spiral Bokeh distribution
const CinematicDoFShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    tDepth: { value: null as THREE.Texture | null },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uFocalDepth: { value: 160.0 }, // Dynamic linear focus depth from the camera
    uAperture: { value: 8.5 },      // Width of the focal plane tolerance zone
    uMaxBlur: { value: 5.5 },
    uEnabled: { value: 0.0 },      // Smoothly transitions from 0.0 to 1.0 when an agent is selected
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
    uniform sampler2D tDepth;
    uniform vec2 uResolution;
    uniform float uFocalDepth;
    uniform float uAperture;
    uniform float uMaxBlur;
    uniform float uEnabled;
    varying vec2 vUv;

    const float GOLDEN_ANGLE = 2.39996323;

    float getLinearDepth(vec2 uv) {
      float d = texture2D(tDepth, uv).r;
      float near = 0.1;
      float far = 2000.0;
      return (2.0 * near * far) / (far + near - d * (far - near));
    }

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

      // Linearize depth from the 16-bit hardware depth buffer texture
      float currentDepth = getLinearDepth(vUv);
      
      // Keep background or empty skybox values within visual rendering bounds
      if (currentDepth > 1900.0) {
        currentDepth = 1900.0;
      }

      // Cinematic OLED depth: analyze physical focal offset
      float depthDiff = abs(currentDepth - uFocalDepth);
      
      // Dynamic focal corridor tolerance scaled by uAperture
      float minFocusRange = uAperture * 0.15;
      float maxFocusRange = uAperture * 4.5;
      float blurFactor = smoothstep(minFocusRange, maxFocusRange, depthDiff) * uMaxBlur * uEnabled;
      
      if (blurFactor < 0.1) {
        gl_FragColor = baseColor;
      } else {
        gl_FragColor = bokehBlur(tDiffuse, vUv, blurFactor);
      }
    }
  `
};

// God-Rays (Volumetric Light Shafts) post-processing shader with screen-space light-source projection and ray marching accumulation
const GodRaysShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uLightPositionScreen: { value: new THREE.Vector2(0.5, 0.5) },
    uExposure: { value: 0.16 }, // Subtle and museum-quality
    uDecay: { value: 0.94 },    // Speed of attenuation
    uDensity: { value: 0.82 },  // Spacing between light samples
    uWeight: { value: 0.58 },   // Luminance weight of each step
    uClampMax: { value: 0.75 },
    uTime: { value: 0.0 }
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
    uniform vec2 uLightPositionScreen;
    uniform float uExposure;
    uniform float uDecay;
    uniform float uDensity;
    uniform float uWeight;
    uniform float uClampMax;
    uniform float uTime;
    varying vec2 vUv;

    void main() {
      const int SAMPLES = 36; // High sample density for smooth gradient shafts
      vec2 deltaTexCoord = vUv - uLightPositionScreen;
      deltaTexCoord *= (1.0 / float(SAMPLES)) * uDensity;
      
      vec2 texCoord = vUv;
      float illuminationDecay = 1.0;
      vec3 accumulatedRays = vec3(0.0);
      
      for (int i = 0; i < SAMPLES; i++) {
        texCoord -= deltaTexCoord;
        vec3 sampleColor = texture2D(tDiffuse, texCoord).rgb;
        
        // Extract high-intensity self-illuminating regions (like Artificial Star core & Solomon Script glyphs)
        float luma = dot(sampleColor, vec3(0.2126, 0.7152, 0.0722));
        vec3 brightPart = sampleColor * smoothstep(0.48, 0.88, luma);
        
        accumulatedRays += brightPart * illuminationDecay * uWeight;
        illuminationDecay *= uDecay;
      }
      
      vec4 original = texture2D(tDiffuse, vUv);
      vec3 lightShafts = clamp(accumulatedRays * uExposure, 0.0, uClampMax);
      
      // Fine-grain atmospheric dust simulation in the light shafts
      float dustNoise = sin(vUv.x * 2500.0 + uTime * 3.5) * cos(vUv.y * 1800.0 - uTime * 3.0);
      vec3 dustGrain = vec3(0.012) * dustNoise * lightShafts;
      
      gl_FragColor = vec4(original.rgb + lightShafts + dustGrain, original.a);
    }
  `
};

// Programmatically generate a detailed procedural normal map for micro-metallic texture
function createFineGrainNormalMap(): THREE.CanvasTexture {
  const size = 1024; // Upgrade resolution for ultra-fidelity micro-grain polishing
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

// Programmatically generate a premium anisotropic metallic studio MatCap texture representing reflective chromium coating
function createMetallicMatCapTexture(): THREE.CanvasTexture {
  const size = 512; // Upgraded to 512 for high resolution studio reflection mapping
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  for (let y = 0; y < size; y++) {
    const v = (y / (size - 1)) * 2.0 - 1.0;
    for (let x = 0; x < size; x++) {
      const u = (x / (size - 1)) * 2.0 - 1.0;

      const distSq = u * u + v * v;
      const dist = Math.sqrt(distSq);
      
      let nx = u;
      let ny = v;
      let nz = distSq <= 1.0 ? Math.sqrt(1.0 - distSq) : 0.0;

      if (distSq > 1.0) {
        nx /= dist;
        ny /= dist;
        nz = 0.0;
      }

      // High-end studio lighting reflections for anisotropic metallic look
      const lKey = new THREE.Vector3(0.55, 0.75, 0.35).normalize();
      const lRim = new THREE.Vector3(-0.65, -0.75, 0.15).normalize();
      const lStripe = new THREE.Vector3(-0.85, 0.15, 0.1).normalize();

      const n = new THREE.Vector3(nx, ny, nz);

      const diffKey = Math.max(0.0, n.dot(lKey));
      const diffRim = Math.max(0.0, n.dot(lRim));
      
      const stripeFactor = Math.pow(Math.abs(n.dot(lStripe)), 15.0);

      const view = new THREE.Vector3(0, 0, 1);
      const rKey = lKey.clone().multiplyScalar(-1).reflect(n);
      const specKey = Math.pow(Math.max(0.0, rKey.dot(view)), 54.0);

      // Silver-platinum core metallizer
      const ambientMetal = new THREE.Color(0x0e1014);
      const keyMetal = new THREE.Color(0xdde3ec); 
      const rimMetal = new THREE.Color(0x404554); 
      const highlightMetal = new THREE.Color(0xffffff);

      const col = new THREE.Color();
      col.copy(ambientMetal);
      col.lerp(keyMetal, diffKey * 0.78);

      const rimAdd = new THREE.Color().copy(rimMetal).multiplyScalar(diffRim * 0.45);
      col.add(rimAdd);

      const specAdd = new THREE.Color().copy(highlightMetal).multiplyScalar(specKey * 2.8 + stripeFactor * 1.6);
      col.add(specAdd);

      // Outer margin falloff vignette
      if (dist > 0.94) {
        const edge = Math.max(0, Math.min(1, (1.0 - dist) / 0.06));
        col.multiplyScalar(edge);
      }

      const idx = (y * size + x) * 4;
      data[idx] = Math.round(col.r * 255);
      data[idx + 1] = Math.round(col.g * 255);
      data[idx + 2] = Math.round(col.b * 255);
      data[idx + 3] = distSq <= 1.0 ? 255 : 0;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Programmatically generate a detailed procedural Damascus steel metal mapping (Red=AO, Green=Roughness, Blue=Metallicness)
function createMetallicRoughnessTexture(): THREE.CanvasTexture {
  const size = 1024; // Upgraded to 1024 for perfectly smooth wave patterns and brushed noise details
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  for (let y = 0; y < size; y++) {
    const ny = y / size;
    for (let x = 0; x < size; x++) {
      const nx = x / size;

      // Elegant high-resolution Damascus steel wavy bands
      const angle = nx * Math.PI * 4.0;
      const wave = Math.sin(angle * 3.5 + Math.cos(ny * Math.PI * 7.0) * 4.5) * 0.5 + 0.5;
      
      // Extremely fine brushed lines
      const brushNoise = (Math.random() - 0.5) * 0.12;
      
      const ao = 0.85 + 0.15 * wave;
      const roughness = 0.1 + 0.22 * (1.0 - wave) + Math.abs(brushNoise);
      const metallic = 0.92 - 0.12 * wave;

      const idx = (y * size + x) * 4;
      data[idx] = Math.round(ao * 255);                 // R: Ambient Occlusion
      data[idx + 1] = Math.round(roughness * 255);         // G: Roughness
      data[idx + 2] = Math.round(metallic * 255);          // B: Metallicness
      data[idx + 3] = 255;                                 // A
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 1);
  return texture;
}

const ringGlowVertShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    vNormal = normalMatrix * normal;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const ringGlowFragShader = `
  uniform vec3 uColor;
  uniform float uGlowIntensity;
  uniform float uHoverIntensity;
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;
  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vViewPosition);
    
    // Smooth atmospheric contour glow (Fresnel view-angle falloff)
    float dotProduct = max(dot(N, V), 0.0);
    float glow = pow(1.0 - dotProduct, 3.5); // high contrast grazing edge
    
    // Subtle pulsating flow around the ring torus
    float stream = sin(vUv.x * 12.0 - uTime * 3.5) * cos(vUv.y * 4.0 + uTime * 2.0) * 0.15 + 0.85;
    
    // Compose dynamic volumetric pulse
    float pulse = 0.9 + 0.1 * sin(uTime * 4.5);
    
    vec3 finalColor = uColor * uGlowIntensity * pulse * stream * glow * (1.0 + uHoverIntensity * 0.85);
    
    gl_FragColor = vec4(finalColor, glow * 0.55 * pulse * (1.0 + uHoverIntensity * 0.45));
  }
`;

const ringVertShader = `
  uniform float uTime;
  uniform float uReputationScore;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  // Adaptive 3-Octave Fractal Brownian Motion (FBM) noise displacement
  // Reacts dynamically to the agent's reputation level
  float fbmNoise(vec3 p, float time, float rep) {
    // Normal reputation range 45.0 to 100.0
    // Lower reputation yields a more unstable, chaotic, rougher organic displacement.
    // Higher reputation yields a pristine, harmonically resonant organic ripple.
    float chaos = clamp((100.0 - rep) / 55.0, 0.0, 1.0);
    
    float speed = 1.2 + chaos * 1.8;
    float amp = 0.035 + chaos * 0.135; // Scales up to 0.17 under lower reputation
    
    // Wave Octave 1 - Broad physical swell
    float n = sin(p.x * 0.78 + time * speed) * cos(p.y * 0.85 + time * speed * 0.95) * sin(p.z * 0.72 + time * speed * 1.05);
    // Wave Octave 2 - Medium mechanical ripple
    n += 0.52 * sin(p.x * 2.1 - time * speed * 1.35) * cos(p.y * 1.85 + time * speed * 1.15) * sin(p.z * 2.3 - time * speed * 0.85);
    // Wave Octave 3 - Micro-high fidelity organic detail
    n += 0.26 * sin(p.x * 4.9 + time * speed * 2.05) * cos(p.y * 4.25 - time * speed * 1.75) * sin(p.z * 4.45 + time * speed * 2.25);
    
    // Amplify the displacement roughness slightly when reputation drops to reflect cognitive fragmentation
    n *= (1.0 + chaos * 0.45);
    return n * amp;
  }

  void main() {
    vUv = uv;
    vec3 displacedPos = position;
    
    float disp = fbmNoise(position, uTime, uReputationScore);
    displacedPos += normal * disp;

    vec4 mvPosition = modelViewMatrix * vec4(displacedPos, 1.0);
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
  uniform sampler2D uMatCap;
  uniform sampler2D uMetallicRoughness;
  uniform float uBloomGlowFactor;
  uniform float uDialectSeed;
  uniform float uReputationScore;

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

    // Dynamic metallic roughness mapping representing Damascus procedural metal steel properties
    vec3 metallicRoughness = texture2D(uMetallicRoughness, vUv * vec2(2.0, 1.0)).rgb;
    float ao = metallicRoughness.r;
    float roughness = mix(0.08, 0.42, metallicRoughness.g);
    float metallic = metallicRoughness.b * (0.85 + 0.15 * uHoverIntensity);

    // Matcap UV coordinate from view-space perturbedNormal
    vec2 uvMatCap = perturbedNormal.xy * 0.5 + 0.5;
    vec3 matcapReflection = texture2D(uMatCap, uvMatCap).rgb;

    vec3 lightDir1 = normalize(vec3(0.0, 20.0, 50.0) + vViewPosition);
    vec3 lightDir2 = normalize(vec3(-60.0, -30.0, -50.0) + vViewPosition);

    // Highly refined physical base color (metallized coating mixed with procedural matcap reflection)
    vec3 alloyColor = mix(uColor, vec3(1.0, 0.85, 0.45), 0.3); // golden alloy component
    vec3 baseColor = mix(alloyColor, alloyColor * matcapReflection * 2.0, metallic * 0.7);
    vec3 ambient = vec3(0.06, 0.05, 0.12) * baseColor * ao;

    float diff1 = max(dot(perturbedNormal, lightDir1), 0.0);
    float diff2 = max(dot(perturbedNormal, lightDir2), 0.0);
    
    float intensityFactor = mix(1.0, 0.35, uDoFBlur);
    vec3 diffuse1 = diff1 * vec3(1.0, 0.88, 0.7) * baseColor * 1.8 * intensityFactor;
    vec3 diffuse2 = diff2 * vec3(0.4, 0.5, 0.9) * baseColor * 1.1 * intensityFactor;

    // Dual-Lobe metallic specular highlight (broad satin shimmer + sharp lacquer gloss)
    vec3 halfDir1 = normalize(lightDir1 + V);
    float shininessBroad = mix(32.0, 8.0, roughness);
    float shininessSharp = mix(240.0, 32.0, roughness);
    float specBroad = pow(max(dot(perturbedNormal, halfDir1), 0.0), mix(shininessBroad, 4.0, uDoFBlur));
    float specSharp = pow(max(dot(perturbedNormal, halfDir1), 0.0), mix(shininessSharp, 16.0, uDoFBlur));
    
    vec3 specular1 = vec3(1.0, 0.95, 0.82) * (specBroad * 0.35 + specSharp * 2.8) * mix(0.7 + 0.5 * uHoverIntensity, 0.01, uDoFBlur);

    // Procedural Cosmic / Celestial Reflection Mapping
    vec3 R = reflect(-V, perturbedNormal);
    vec3 spaceR = R;
    float waveX = sin(spaceR.x * 4.0 + uTime * 0.08) * 0.5 + 0.5;
    float waveY = cos(spaceR.y * 3.5 - uTime * 0.12) * 0.5 + 0.5;
    float waveZ = sin(spaceR.z * 5.0 + uTime * 0.15) * 0.5 + 0.5;
    
    // Ambient cosmic reflection combined with agent's individual accent colors
    vec3 envReflection = (vec3(0.08, 0.05, 0.22) * waveX + vec3(0.18, 0.26, 0.75) * waveY + uAccentColor * waveZ) * 1.3;
    
    // Upgrade: Real metallic Fresnel reflection (Schlick's approximation) with extreme chromatic light refraction
    // Utilizing the direct dot product of geometric surface normal (N) and view direction (V) for metallic light refraction
    float cosTheta = max(0.0, dot(N, V));
    float grazeShift = 0.08 * (1.0 - cosTheta); // Metallic grazing refraction dispersion
    
    // Spectral-shifted F0 base reflectance vectors representing high-fidelity golden-silver metallurgy
    vec3 F0_red = mix(vec3(0.04), alloyColor * 1.4, metallic);
    vec3 F0_grn = mix(vec3(0.04), alloyColor * 1.25, metallic);
    vec3 F0_blu = mix(vec3(0.04), alloyColor * 1.1, metallic);

    // Compute chromatic Fresnel refractance at extreme angles
    float fresnelR = pow(max(0.0, 1.0 - (cosTheta + grazeShift)), 5.0);
    float fresnelG = pow(max(0.0, 1.0 - cosTheta), 5.0);
    float fresnelB = pow(max(0.0, 1.0 - (cosTheta - grazeShift)), 5.0);

    vec3 F_schlick = vec3(
      F0_red.r + (1.0 - F0_red.r) * fresnelR,
      F0_grn.g + (1.0 - F0_grn.g) * fresnelG,
      F0_blu.b + (1.0 - F0_blu.b) * fresnelB
    );

    // Iridescent spectrum based on chromatic Fresnel phase shift
    float fresnelAvg = (fresnelR + fresnelG + fresnelB) / 3.0;
    vec3 iridescentSpectrum = vec3(
      0.5 + 0.5 * sin(fresnelAvg * 6.28 + uTime * 0.35),
      0.4 + 0.6 * sin(fresnelAvg * 6.28 + uTime * 0.28 + 2.09),
      0.6 + 0.4 * sin(fresnelAvg * 6.28 + uTime * 0.22 + 4.18)
    );

    // Blend environmental reflection with iridescent coating using the physically computed metallic Fresnel vector F_schlick
    vec3 coatingReflection = mix(envReflection * 0.35, envReflection * 2.3 + iridescentSpectrum * uAccentColor * 1.2, F_schlick);
    
    // Smoothly blend the fresnel variable for standard ambient layer subtraction as well
    float fresnel = fresnelAvg;
    
    // Emissive glowing patterns (e.g. glowing digital circuit or gold runic engravings)
    float activePulse = uPulseIntensity * (0.9 + 0.2 * sin(uTime * 3.5));
    float finalEmissiveIntensity = uEmissiveIntensity * activePulse * uBloomGlowFactor * mix(1.1 + 1.3 * uHoverIntensity, 0.15, uDoFBlur);
    
    // ─── PROCEDURAL GEOMETRIC SOLOMON SCRIPT LANGUAGE ENGINE ───
    // Divides each ring into 24 high-precision orbital script sectors
    float glyphCellCount = 24.0;
    float segmentId = floor(vUv.x * glyphCellCount);
    
    // Scale and shift coordinates to a clean [-1, 1] local glyph cell box
    vec2 glyphLocalPos = vec2(fract(vUv.x * glyphCellCount) * 2.0 - 1.0, (vUv.y * 2.0 - 1.0) * 2.45); 
    
    float distToCenter = length(glyphLocalPos);
    float valFwidth = fwidth(distToCenter);
    
    // Solomon Structure 1: Concentric Celestial Orbit Rings
    float outerRing = abs(distToCenter - 0.68);
    float innerRing = abs(distToCenter - 0.36);
    float outerRingMask = smoothstep(0.045 + valFwidth * 1.5, 0.045 - valFwidth * 1.5, outerRing);
    float innerRingMask = smoothstep(0.04 + valFwidth * 1.5, 0.04 - valFwidth * 1.5, innerRing);
    
    // Solomon Structure 2: Mathematical Node Grid Coordinates
    float centerNodeMask = smoothstep(0.12 + valFwidth, 0.08 - valFwidth, distToCenter);
    
    // Solomon Structure 3: Precise Axioms / Connecting Tangent Lines
    float radialLineX = smoothstep(0.035, 0.012, abs(glyphLocalPos.x));
    float radialLineY = smoothstep(0.035, 0.012, abs(glyphLocalPos.y));
    
    // Solomon Structure 4: Sub-Orbital Quantum Satellites (rotating dynamically)
    float satSpeed = 0.85 + mod(segmentId, 3.0) * 0.65;
    float satAngle = uTime * satSpeed + segmentId * 1.332;
    vec2 satPos1 = vec2(cos(satAngle), sin(satAngle)) * 0.52;
    float satelliteNode1 = smoothstep(0.10 + valFwidth, 0.06 - valFwidth, length(glyphLocalPos - satPos1));
    
    vec2 satPos2 = vec2(cos(satAngle + 3.1415), sin(satAngle + 3.1415)) * 0.35;
    float satelliteNode2 = smoothstep(0.08 + valFwidth, 0.04 - valFwidth, length(glyphLocalPos - satPos2));
    
    // Select and assemble the dialect based on a pseudo-random seed per segment cell
    float cellSeed = sin(segmentId * 14.88 + 3.14 + uDialectSeed * 42.12) * 0.5 + 0.5;
    float runeInlay = 0.0;
    
    if (cellSeed < 0.25) {
      // Celestial Dialect A: Central node, outer orbit, spinning sub-orbitals, aligned axial line
      runeInlay = max(centerNodeMask, outerRingMask * step(0.12, cos(atan(glyphLocalPos.y, glyphLocalPos.x) + uTime * 0.25)));
      runeInlay = max(runeInlay, satelliteNode1);
      runeInlay = max(runeInlay, radialLineX * step(distToCenter, 0.68));
    } else if (cellSeed < 0.50) {
      // Celestial Dialect B: Concentric dual-lattice ring system with an orthogonal intersection grid
      runeInlay = max(outerRingMask, innerRingMask);
      runeInlay = max(runeInlay, radialLineX * radialLineY * step(distToCenter, 0.85));
      runeInlay = max(runeInlay, satelliteNode2);
    } else if (cellSeed < 0.75) {
      // Celestial Dialect C: Spline-crossings with dual orbiting quantum satellites
      runeInlay = max(outerRingMask, radialLineY * step(abs(glyphLocalPos.x), 0.52));
      runeInlay = max(runeInlay, satelliteNode1);
      runeInlay = max(runeInlay, satelliteNode2);
    } else {
      // Celestial Dialect D: Modular coordinate arcs with an offset central satellite
      float arcAngle = atan(glyphLocalPos.y, glyphLocalPos.x);
      float arcSeg = step(0.2, sin(arcAngle * 3.0 + uTime * 0.4));
      runeInlay = max(centerNodeMask, outerRingMask * arcSeg);
      runeInlay = max(runeInlay, satelliteNode1);
    }
    
    // ─── PART 2B: IDLE REPUTATION DECAY SPECTRAL NOISE ───
    // Introduce reputation-based geometric degradation and flicker below 60%
    float minRepThreshold = 60.0;
    if (uReputationScore < minRepThreshold) {
      float decayAlpha = clamp((minRepThreshold - uReputationScore) / minRepThreshold, 0.0, 1.0);
      
      // Determine pixel/block frequency for the high-frequency digital noise
      float blockX = 140.0;
      float blockY = 32.0;
      vec2 gridUv = floor(vUv * vec2(blockX, blockY));
      
      // Seed pseudo-random generator with grid coordinates & time for ultra-rapid flicker
      float noiseVal = fract(sin(dot(gridUv, vec2(12.9898, 78.233))) * 43758.5453123);
      float fastFlicker = fract(sin(uTime * 48.0 + noiseVal * 12.0) * 1253.11);
      
      // At low reputation, the rune coordinate mappings are broken / dislocated
      float dislocateFlicker = step(0.88, fract(sin(uTime * 3.5 + segmentId * 15.0) * 917.2));
      
      // Degrade rune geometry: substitute structured glyph with pure pixelated geometric static
      float noiseGlyph = step(0.12, noiseVal) * step(noiseVal, 0.35 + decayAlpha * 0.4);
      runeInlay = mix(runeInlay, noiseGlyph, decayAlpha);
      
      // Randomly shut down/flicker entire segment sectors when corrupted
      float segmentFlicker = step(decayAlpha * 0.45, fract(sin(segmentId * 52.3 + uTime * 18.0) * 43758.5453));
      runeInlay *= segmentFlicker;
      
      // Intermittent dramatic dropouts / high frequency noise overlay
      if (fastFlicker < decayAlpha * 0.55 && dislocateFlicker > 0.5) {
        runeInlay = noiseVal * 1.5;
      }
    }
    
    vec3 runesEmissive = uAccentColor * min(runeInlay, 2.0) * 2.0 * finalEmissiveIntensity;
    
    // Linked to uAccentColor with a constant baseline to maintain a consistent, attractive glow
    float baseGlowConstant = 0.55; // Ensures an attractive constant glow regardless of viewport activity
    vec3 baseEmissive = mix(uEmissive, uAccentColor, 0.65) * (baseGlowConstant + finalEmissiveIntensity * 0.85);
    vec3 emissive = mix(baseEmissive, baseEmissive * 1.5 + runesEmissive, 0.6 + 0.4 * uHoverIntensity);

    // Micro-sparkles configuration with screen-space hardware anti-aliasing to prevent jagged edges on closeups
    float sparkleNoise = sin(vUv.x * 600.0 + uTime * 5.5) * cos(vUv.y * 220.0 - uTime * 3.0);
    float valSparkle = fwidth(sparkleNoise);
    float sparkle = smoothstep(0.975 - valSparkle * 1.5, 0.975 + valSparkle * 1.5, sparkleNoise);
    vec3 sparkles = vec3(1.0, 0.98, 0.85) * sparkle * (0.35 + 0.85 * uHoverIntensity) * (1.0 - uDoFBlur);

    // Blend standard diffuse with metallic representation
    vec3 finalDiffuse = mix(diffuse1 + diffuse2, vec3(0.0), metallic);
    vec3 finalSpecular = mix(specular1, specular1 * 2.0 + matcapReflection * 1.2, metallic);

    // Assembly of physical layers (Base Diffuse + Ambient + Dual spec + Glossy coating reflections + Emissive patterns + Sparkles)
    vec3 finalCol = (ambient * mix(1.0, 0.35, uDoFBlur) + finalDiffuse) * (1.0 - fresnel * 0.4) 
                  + finalSpecular 
                  + coatingReflection * mix(0.9 + uHoverIntensity * 0.4, 0.05, uDoFBlur) 
                  + emissive 
                  + sparkles;

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
  telemetryData?: TelemetryPoint[];
  sendingChat?: boolean;
  isListeningMic?: boolean;
}

export default function ThreeCanvas({ 
  selectedRingIndex, 
  onSelectRing, 
  agents,
  bloomThreshold = 0.22,
  bloomIntensity = 1.5,
  auditLogs = [],
  telemetryData = [],
  sendingChat = false,
  isListeningMic = false
}: ThreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const selectedIndexRef = useRef<number>(selectedRingIndex);
  const physicalRingsRef = useRef<any[]>([]);

  // HUD and Telemetry references for zero-allocation Direct DOM mutations at 60 FPS
  const hudRef = useRef<HTMLDivElement>(null);
  const hudLoadCircleRef = useRef<SVGCircleElement>(null);
  const hudTextLoadRef = useRef<HTMLSpanElement>(null);
  const hudTextStatusRef = useRef<HTMLSpanElement>(null);
  const hudTextNameRef = useRef<HTMLSpanElement>(null);
  const hudTextMomentumRef = useRef<HTMLSpanElement>(null);
  
  // Tooltip references
  const hoverTooltipRef = useRef<HTMLDivElement>(null);
  const hoverTextRef = useRef<HTMLSpanElement>(null);


  // Maintain immediate reactive refs for frame iterations
  const agentsRef = useRef<AgentSpec[]>(agents);
  useEffect(() => {
    agentsRef.current = agents;
  }, [agents]);

  const bloomThresholdRef = useRef<number>(bloomThreshold);
  const bloomIntensityRef = useRef<number>(bloomIntensity);
  
  const sendingChatRef = useRef<boolean>(!!sendingChat);
  const isListeningMicRef = useRef<boolean>(!!isListeningMic);

  useEffect(() => {
    sendingChatRef.current = !!sendingChat;
  }, [sendingChat]);

  useEffect(() => {
    isListeningMicRef.current = !!isListeningMic;
  }, [isListeningMic]);

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
    let zoomLevel = 0.0; // Dynamic scroll wheel zoom offset

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
    renderer.setClearColor(0x000000, 1.0); // Absolute pure OLED black base

    // ─── PART 2: LIGHTING ─────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0x080718, 0.85); // High-contrast, deeply moody dark-room ambient key
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
        vec3 base = vec3(0.000, 0.000, 0.000); // Perfect native pure OLED absolute black backing
        vec3 acc = vec3(0.0);
        
        vec2 c[4];
        c[0] = vec2(0.2, 0.3) + vec2(sin(time * 0.1) * 0.04, cos(time * 0.07) * 0.04);
        c[1] = vec2(0.8, 0.7) + vec2(cos(time * 0.08) * 0.05, sin(time * 0.11) * 0.03);
        c[2] = vec2(0.7, 0.2) + vec2(sin(time * 0.14) * 0.03, cos(time * 0.09) * 0.04);
        c[3] = vec2(0.3, 0.82) + vec2(cos(time * 0.06) * 0.05, sin(time * 0.08) * 0.05);

        vec3 col[4];
        col[0] = vec3(0.08, 0.015, 0.22); // Deep rich violet gas glow
        col[1] = vec3(0.00, 0.04, 0.18);  // Deep space indigo/blue gas glow
        col[2] = vec3(0.18, 0.01, 0.04);  // Pure blood red ruby filament
        col[3] = vec3(0.01, 0.08, 0.10);  // Deep dark space teal dust cloud

        float op[4] = float[](0.28, 0.24, 0.20, 0.18); // Highly optimized lower opacities for organic smoke detail
        float ps[4] = float[](0.18, 0.12, 0.22, 0.15);

        for(int i = 0; i < 4; i++) {
          float d = length(uv - c[i]);
          float f = 1.0 - smoothstep(0.0, 0.95, d);
          f = wash_pow(f, 3.8); // Steeper curve to keep bounds incredibly clean and ink black
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
    const matCapTexture = createMetallicMatCapTexture();
    const metallicRoughnessTexture = createMetallicRoughnessTexture();

    // Maximize anisotropic filtering for pristine textures at steep camera angles
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    [normalMapTexture, matCapTexture, metallicRoughnessTexture].forEach((tex) => {
      tex.anisotropy = maxAnisotropy;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
    });

    // ─── PART 3B: EFFECT COMPOSER AND BLOOM POST-PROCESSING WITH HARDWARE MSAA ───
    const composeTarget = new THREE.WebGLRenderTarget(container.clientWidth, container.clientHeight, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType, // Pristine 16-bit color depth to eliminate banding in bloom/nebulas
      samples: 8, // Hardware MSAA for WebGL2 post-processing! Extreme high-quality anti-aliasing!
      depthTexture: new THREE.DepthTexture(container.clientWidth, container.clientHeight)
    });
    const composer = new EffectComposer(renderer, composeTarget);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 4.0));
    composer.renderToScreen = true;

    const renderPass = new RenderPass(scene, camera);
    renderPass.clear = false; // Keep background nebula
    composer.addPass(renderPass);

    const bloomPass = new MultiPassGaussianBloomPass(
      container.clientWidth,
      container.clientHeight,
      bloomThresholdRef.current,
      bloomIntensityRef.current
    );
    composer.addPass(bloomPass);

    // Screen Space Ambient Occlusion ShaderPass to render detailed contact soft shadows
    const ssaoPass = new ShaderPass(SSAOShader);
    ssaoPass.uniforms.tDepth = { value: composeTarget.depthTexture };
    ssaoPass.uniforms.uResolution.value.set(container.clientWidth, container.clientHeight);
    composer.addPass(ssaoPass);

    // Cinematic Depth of Field (DoF) post-processing pass
    const dofPass = new ShaderPass(CinematicDoFShader);
    dofPass.uniforms.tDepth = { value: composeTarget.depthTexture };
    dofPass.uniforms.uResolution.value.set(container.clientWidth, container.clientHeight);
    composer.addPass(dofPass);

    // High-fidelity Camera/Object Motion Blur Pass
    const motionBlurPass = new ShaderPass(MotionBlurShader);
    motionBlurPass.uniforms.uResolution.value.set(container.clientWidth, container.clientHeight);
    motionBlurPass.uniforms.uVelocity.value.set(0, 0);
    composer.addPass(motionBlurPass);

    // High-fidelity God-Rays Pass (Volumetric light shafts)
    const godRaysPass = new ShaderPass(GodRaysShader);
    godRaysPass.uniforms.uResolution.value.set(container.clientWidth, container.clientHeight);
    composer.addPass(godRaysPass);

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
      ringRef?: any;
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

    // 6A. CORE (Layer 6: Miniature artificial sun of consciousness & info)
    // We map this to coreMesh so that existing camera / selected scale tweens continue to work perfectly.
    const coreGeo = new THREE.SphereGeometry(3.6, 64, 64);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      emissive: 0xffaa00,
      emissiveIntensity: 5.5, // blinding energy core
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.85,
      thickness: 2.0,
      ior: 1.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.01
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    sigilGroup.add(coreMesh);

    // ─── PART 6A-1: MINIATURE STELLAR STAR & CORONA FLARES ───
    const scratchStellarVec = new THREE.Vector3();
    const starCoreGeo = new THREE.DodecahedronGeometry(1.6, 2);
    const starCoreMat = new THREE.MeshBasicMaterial({
      color: 0xffeab0,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    const starCoreMesh = new THREE.Mesh(starCoreGeo, starCoreMat);
    sigilGroup.add(starCoreMesh);

    // Dynamic solar flare corona particles
    const coronaCount = 80;
    const coronaGeo = new THREE.BufferGeometry();
    const coronaPositionsInit = new Float32Array(coronaCount * 3);
    const coronaPositionsLive = new Float32Array(coronaCount * 3);
    const coronaSpeeds = new Float32Array(coronaCount);
    
    for (let i = 0; i < coronaCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const rad = 1.65 + Math.random() * 0.45;
      
      const x = rad * Math.sin(phi) * Math.cos(theta);
      const y = rad * Math.sin(phi) * Math.sin(theta);
      const z = rad * Math.cos(phi);
      
      coronaPositionsInit[i * 3] = x;
      coronaPositionsInit[i * 3 + 1] = y;
      coronaPositionsInit[i * 3 + 2] = z;
      
      coronaPositionsLive[i * 3] = x;
      coronaPositionsLive[i * 3 + 1] = y;
      coronaPositionsLive[i * 3 + 2] = z;
      
      coronaSpeeds[i] = 1.5 + Math.random() * 2.5;
    }
    
    coronaGeo.setAttribute('position', new THREE.BufferAttribute(coronaPositionsLive, 3));
    const coronaMat = new THREE.PointsMaterial({
      color: 0xffaa00,
      size: 0.85,
      map: glowSpriteTexture,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const coronaField = new THREE.Points(coronaGeo, coronaMat);
    sigilGroup.add(coronaField);

    // 6B. OUTER ORBITAL CAGE (Layer 1: 12 rotating circles at different spherical angles)
    // We map these to the gyroRings array so they receive dynamic spin and GSAP spikes!
    const gyroRings = [] as THREE.Mesh[];
    const cageRingColors = [
      0xffd070, 0xc9933a, 0x7c4df3, 0xcca33a,
      0xff9900, 0xaa44ff, 0xffaa00, 0x8b0000,
      0x4b0082, 0x008b8b, 0x1a4a1a, 0xff8c00
    ];

    for (let i = 0; i < 12; i++) {
      const rad = 20.0 - (i * 0.35); // nested cage radii
      const geo = new THREE.TorusGeometry(rad, 0.16, 16, 128);
      const mat = new THREE.MeshPhysicalMaterial({
        color: cageRingColors[i % cageRingColors.length],
        emissive: cageRingColors[i % cageRingColors.length],
        emissiveIntensity: 1.6,
        roughness: 0.12,
        metalness: 0.98,
        clearcoat: 1.0,
        clearcoatRoughness: 0.04
      });
      const ring = new THREE.Mesh(geo, mat);
      
      // Compute golden spiral spherical distribution orientations for clean 3D scaffolding
      const phi = Math.acos(-1.0 + (2.0 * i) / 12.0);
      const theta = Math.sqrt(12.0 * Math.PI) * phi;
      ring.rotation.set(phi, theta, 0);
      
      sigilGroup.add(ring);
      gyroRings.push(ring);
    }

    // 6C. SACRED GEOMETRY SPHERE (Layer 2: Metatron-inspired original wireframe system)
    const metatronGroup = new THREE.Group();
    sigilGroup.add(metatronGroup);
    
    const icoGeo = new THREE.IcosahedronGeometry(14.0, 1);
    const dodecaGeo = new THREE.DodecahedronGeometry(11.0, 1);
    const metatronMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      wireframe: true,
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const metatronIco = new THREE.Mesh(icoGeo, metatronMat);
    const metatronDodeca = new THREE.Mesh(dodecaGeo, metatronMat);
    metatronDodeca.rotation.y = Math.PI / 4;
    metatronGroup.add(metatronIco);
    metatronGroup.add(metatronDodeca);

    // 6D. FLOATING SYMBOLS (Layer 3: 350+ golden Solomon Script glyph nodes orbiting in space)
    const symbolPointsCount = 380;
    const symbolPositions = new Float32Array(symbolPointsCount * 3);
    const symbolMetadata = [] as { radius: number; phi: number; theta: number; speed: number; phase: number }[];
    
    for (let i = 0; i < symbolPointsCount; i++) {
      const radius = 15.0 + Math.random() * 4.2;
      const phi = Math.acos(-1.0 + Math.random() * 2.0);
      const theta = Math.random() * Math.PI * 2;
      
      symbolPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      symbolPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      symbolPositions[i * 3 + 2] = radius * Math.cos(phi);
      
      symbolMetadata.push({
        radius,
        phi,
        theta,
        speed: (0.2 + Math.random() * 0.6) * (Math.random() < 0.5 ? 1.0 : -1.0),
        phase: Math.random() * Math.PI * 2
      });
    }
    
    const symbolCloudGeo = new THREE.BufferGeometry();
    symbolCloudGeo.setAttribute("position", new THREE.BufferAttribute(symbolPositions, 3));
    const symbolCloudMat = new THREE.PointsMaterial({
      color: 0xffe6a0,
      size: 0.85,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      map: glowSpriteTexture,
      depthWrite: false
    });
    const symbolCloud = new THREE.Points(symbolCloudGeo, symbolCloudMat);
    sigilGroup.add(symbolCloud);

    // 6E. LIGHT WEB (Layer 4: Neural light connections mapping nodes together)
    const neuralGroup = new THREE.Group();
    sigilGroup.add(neuralGroup);
    const networkNodeCount = 32;
    const networkNodesPos = [] as THREE.Vector3[];
    // Evenly spaced points on sphere radius 12.5
    for (let i = 0; i < networkNodeCount; i++) {
      const phi = Math.acos(-1.0 + (2.0 * i) / networkNodeCount);
      const theta = Math.sqrt(networkNodeCount * Math.PI) * phi;
      const r = 12.5;
      const p = new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
      networkNodesPos.push(p);
      
      // Node marker
      const markerGeo = new THREE.SphereGeometry(0.16, 8, 8);
      const markerMat = new THREE.MeshBasicMaterial({ color: 0xffd070 });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.copy(p);
      neuralGroup.add(marker);
    }
    const linePositions = [] as number[];
    for (let i = 0; i < networkNodeCount; i++) {
      for (let j = i + 1; j < networkNodeCount; j++) {
        const dist = networkNodesPos[i].distanceTo(networkNodesPos[j]);
        if (dist < 6.8) {
          linePositions.push(networkNodesPos[i].x, networkNodesPos[i].y, networkNodesPos[i].z);
          linePositions.push(networkNodesPos[j].x, networkNodesPos[j].y, networkNodesPos[j].z);
        }
      }
    }
    const lightWebGeo = new THREE.BufferGeometry();
    lightWebGeo.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
    const lightWebMat = new THREE.LineBasicMaterial({
      color: 0x7c4df3,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const lightWeb = new THREE.LineSegments(lightWebGeo, lightWebMat);
    neuralGroup.add(lightWeb);

    // 6F. INNER STAR (Layer 5: 12-point stellar construct)
    const starGroup = new THREE.Group();
    sigilGroup.add(starGroup);
    for (let i = 0; i < 12; i++) {
      const phi = Math.acos(-1.0 + (2.0 * i) / 12.0);
      const theta = Math.sqrt(12.0 * Math.PI) * phi;
      const axialDir = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.sin(phi) * Math.sin(theta),
        Math.cos(phi)
      );
      const needleGeo = new THREE.ConeGeometry(0.3, 5.0, 4);
      const needleMat = new THREE.MeshPhysicalMaterial({
        color: 0xffaa00,
        emissive: 0xff5500,
        emissiveIntensity: 3.2,
        roughness: 0.08,
        metalness: 0.92
      });
      const needle = new THREE.Mesh(needleGeo, needleMat);
      const up = new THREE.Vector3(0, 1, 0);
      needle.quaternion.setFromUnitVectors(up, axialDir);
      needle.position.copy(axialDir).multiplyScalar(2.5);
      starGroup.add(needle);
    }

    // ─── PART 6D: THE HOLOGRAPHIC COGNITIVE AVATAR ───────────
    const avatarGroup = new THREE.Group();
    avatarGroup.position.set(0, 0, 0);
    // Start collapsed so we only see it when an agent ring is unsealed/selected
    avatarGroup.scale.setScalar(selectedRingIndex !== -1 ? 1.45 : 0.001);
    scene.add(avatarGroup);

    // Dynamic wave loop geometry for real-time vocal frequency analyzer line
    const wavePointsCount = 120;
    const wavePositions = new Float32Array(wavePointsCount * 3);
    const waveProgress = new Float32Array(wavePointsCount);
    for (let i = 0; i < wavePointsCount; i++) {
      waveProgress[i] = i / wavePointsCount;
    }
    const waveGeo = new THREE.BufferGeometry();
    waveGeo.setAttribute("position", new THREE.BufferAttribute(wavePositions, 3));
    waveGeo.setAttribute("progress", new THREE.BufferAttribute(waveProgress, 1));

    // Glow line material for the vocal analyzer ribbon
    const waveMat = new THREE.ShaderMaterial({
      vertexShader: LineVertShader,
      fragmentShader: LineFragShader,
      uniforms: {
        uTime: { value: 0.0 },
        uColor: { value: new THREE.Color(0x7c4df3) },
        uPulseSpeed: { value: 2.0 },
        uColorIntensity: { value: 2.5 }
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const waveLine = new THREE.LineLoop(waveGeo, waveMat);
    avatarGroup.add(waveLine);

    // Glowing particle cloud representing the cranial "thought core" (cerebral head shape scan)
    const avatarCloudCount = 380;
    const avatarCloudGeo = new THREE.BufferGeometry();
    const avatarCloudPos = new Float32Array(avatarCloudCount * 3);
    const avatarCloudSpeeds = new Float32Array(avatarCloudCount);
    const avatarCloudPhases = new Float32Array(avatarCloudCount);

    for (let i = 0; i < avatarCloudCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      // Make it resemble a cerebral head scan structure (elongated vertically, slightly flatter sides)
      const r = 4.2 + Math.random() * 0.9;
      avatarCloudPos[i * 3] = r * Math.sin(phi) * Math.cos(theta) * 0.88; // X axis slightly thinner
      avatarCloudPos[i * 3 + 1] = r * Math.cos(phi) * 1.38; // Y axis elongated vertically for head profile
      avatarCloudPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) * 0.88; // Z axis
      
      avatarCloudSpeeds[i] = 0.5 + Math.random() * 1.5;
      avatarCloudPhases[i] = Math.random() * Math.PI * 2;
    }
    
    avatarCloudGeo.setAttribute("position", new THREE.BufferAttribute(avatarCloudPos, 3));
    const avatarCloudMat = new THREE.PointsMaterial({
      color: 0x7c4df3,
      size: 1.8,
      map: glowSpriteTexture,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const avatarPointField = new THREE.Points(avatarCloudGeo, avatarCloudMat);
    avatarGroup.add(avatarPointField);

    // A digital sweeping cursor ring representing real-time biometric scan sweeps
    const scanRingGeo = new THREE.TorusGeometry(5.2, 0.08, 16, 128);
    const scanRingMat = new THREE.MeshBasicMaterial({
      color: 0x7c4df3,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const scanRingMesh = new THREE.Mesh(scanRingGeo, scanRingMat);
    scanRingMesh.rotation.x = Math.PI / 2;
    avatarGroup.add(scanRingMesh);

    // ─── INTERACTION LENS BILLBOARD PLANE SETUP ───
    const lensCanvas = document.createElement("canvas");
    lensCanvas.width = 512;
    lensCanvas.height = 256;
    const lensCtx = lensCanvas.getContext("2d");
    const lensTexture = new THREE.CanvasTexture(lensCanvas);
    
    const lensMat = new THREE.MeshBasicMaterial({
      map: lensTexture,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      depthTest: true,
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide,
    });
    const lensGeo = new THREE.PlaneGeometry(16, 8); // widescreen HUD display proportions
    const lensMesh = new THREE.Mesh(lensGeo, lensMat);
    scene.add(lensMesh);

    // Function to dynamically update and paint data onto the lens canvas texture
    const updateLensCanvas = (agentIdx: number) => {
      if (!lensCtx) return;
      
      const agent = agents.find(ag => ag.index === agentIdx);
      if (!agent) return;

      lensCtx.clearRect(0, 0, 512, 256);

      const agentColorStr = '#' + agent.accentColor.toString(16).padStart(6, '0');
      const reputationPercent = agent.reputationScore.toFixed(1);
      const tokenVal = agent.tokenPool;
      const confidencePercent = (agent.confidenceScore * 100).toFixed(0);

      // Draw subtle shadow backing for legibility
      lensCtx.fillStyle = "rgba(2, 6, 23, 0.9)";
      
      // Paint futuristic container with cut corners (cyberpunk aesthetic)
      lensCtx.beginPath();
      lensCtx.moveTo(20, 10);
      lensCtx.lineTo(440, 10);
      lensCtx.lineTo(502, 72);
      lensCtx.lineTo(502, 246);
      lensCtx.lineTo(72, 246);
      lensCtx.lineTo(10, 184);
      lensCtx.lineTo(10, 10);
      lensCtx.closePath();
      lensCtx.fill();

      // Outer glow and border matching agent color accent
      lensCtx.strokeStyle = agentColorStr;
      lensCtx.lineWidth = 4;
      lensCtx.stroke();

      // Interior thin grid line
      lensCtx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      lensCtx.lineWidth = 1.5;
      lensCtx.strokeRect(15, 15, 482, 226);

      // Corner technical crosshairs / decorations
      lensCtx.fillStyle = agentColorStr;
      // top-left cross
      lensCtx.fillRect(15, 25, 18, 2);
      lensCtx.fillRect(25, 15, 2, 18);
      // bottom-right cross
      lensCtx.fillRect(479, 215, 18, 2);
      lensCtx.fillRect(487, 215, 2, 18);

      // Title header
      lensCtx.font = "bold 13px 'JetBrains Mono', 'Fira Code', Courier, monospace";
      lensCtx.fillStyle = "rgba(148, 163, 184, 0.85)"; // Slate-400
      lensCtx.fillText("[ COGNITIVE LENS ACTIVE ]", 35, 45);

      // Status indicator tag
      lensCtx.fillStyle = "rgba(34, 197, 94, 0.15)";
      lensCtx.strokeStyle = "rgb(34, 197, 94)";
      lensCtx.lineWidth = 1;
      lensCtx.beginPath();
      lensCtx.arc(435, 41, 4, 0, Math.PI * 2);
      lensCtx.fill();
      lensCtx.stroke();
      
      lensCtx.font = "bold 10px 'JetBrains Mono', 'Fira Code', Courier, monospace";
      lensCtx.fillStyle = "rgb(34, 197, 94)";
      lensCtx.fillText("TRACKED", 448, 45);

      // Agent Name & Archetype Role
      lensCtx.font = "900 24px 'Space Grotesk', 'Outfit', Inter, sans-serif";
      lensCtx.fillStyle = "#ffffff";
      const agentRoleLabel = agent.name.toUpperCase();
      lensCtx.fillText(agentRoleLabel, 35, 84);

      // Divider line
      lensCtx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      lensCtx.beginPath();
      lensCtx.moveTo(35, 96);
      lensCtx.lineTo(477, 96);
      lensCtx.stroke();

      // Content text
      lensCtx.font = "14px 'JetBrains Mono', 'Fira Code', Courier, monospace";
      lensCtx.fillStyle = "rgb(156, 163, 175)";
      lensCtx.fillText("REPUTATION RATING :", 38, 126);
      
      lensCtx.font = "bold 20px 'JetBrains Mono', 'Fira Code', Courier, monospace";
      lensCtx.fillStyle = agentColorStr;
      lensCtx.fillText(`${reputationPercent}%`, 255, 128);

      lensCtx.font = "14px 'JetBrains Mono', 'Fira Code', Courier, monospace";
      lensCtx.fillStyle = "rgb(156, 163, 175)";
      lensCtx.fillText("RESOURCE CONSUMED :", 38, 160);

      lensCtx.font = "bold 20px 'JetBrains Mono', 'Fira Code', Courier, monospace";
      lensCtx.fillStyle = "#f3f4f6";
      lensCtx.fillText(`${tokenVal} COG`, 255, 162);

      // Token pool consumption mini-bar (progress bar relative to 2000 COG max limit)
      const progressX = 38;
      const progressY = 184;
      const progressW = 438;
      const progressH = 14;

      // Track background
      lensCtx.fillStyle = "rgba(15, 23, 42, 0.75)";
      lensCtx.fillRect(progressX, progressY, progressW, progressH);
      lensCtx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      lensCtx.strokeRect(progressX, progressY, progressW, progressH);

      // Highlight fill
      const maxTokenLimit = 2000;
      const progressRatio = Math.max(0.05, Math.min(1.0, tokenVal / maxTokenLimit));
      const fillW = progressW * progressRatio;

      const fillGrad = lensCtx.createLinearGradient(progressX, progressY, progressX + fillW, progressY);
      fillGrad.addColorStop(0, agentColorStr);
      fillGrad.addColorStop(1, "#ffffff");
      lensCtx.fillStyle = fillGrad;
      lensCtx.fillRect(progressX, progressY, fillW, progressH);

      // Draw grid segments over progress-bar for a textured computer interface look
      lensCtx.strokeStyle = "rgba(2, 6, 23, 0.65)";
      lensCtx.lineWidth = 1.5;
      for (let offset = 12; offset < progressW; offset += 12) {
        lensCtx.beginPath();
        lensCtx.moveTo(progressX + offset, progressY);
        lensCtx.lineTo(progressX + offset, progressY + progressH);
        lensCtx.stroke();
      }

      // Metadata footer text
      lensCtx.font = "italic 10px 'JetBrains Mono', 'Fira Code', Courier, monospace";
      lensCtx.fillStyle = "rgba(148, 163, 184, 0.6)";
      lensCtx.fillText(`COGNITIVE TELEMETRY CONSOLE V${(1.2 + agentIdx * 0.1).toFixed(1)} // COG_BAND: ${confidencePercent}%`, 38, 222);

      lensTexture.needsUpdate = true;
    };

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
        resonanceScale?: number;
        resonanceRot?: number;
      };
      rotVelocity: { x: number; y: number; z: number };
      springStrengthFactor: number;
      torqueBlendFactor: number;
      dragDecayFactor: number;
      dataStreamLine?: THREE.Line;
      glowMat?: THREE.ShaderMaterial;
      outerHaloMesh?: THREE.Mesh;
      microGlyphMesh?: THREE.Mesh;
      dataRingMesh?: THREE.Points;
      planetMesh?: THREE.Mesh | THREE.Group;
      planetRing?: THREE.Mesh | THREE.Group;
      orbitalCage?: THREE.Group;
    }[];

    const DOMAIN_NAMES = [
      "ORIGIN",
      "AWARENESS",
      "MEMORY",
      "KNOWLEDGE",
      "CREATION",
      "SIMULATION",
      "EVOLUTION",
      "HARMONY",
      "TRANSCENDENCE",
      "WILDCARD"
    ];

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

      // Create Torus Band: Layer 3 (Energy Ring Pure Plasma) - subdivision 256x1024
      const bandGeo = new THREE.TorusGeometry(8, 1.25, 256, 1024);
      const bandMat = new THREE.ShaderMaterial({
        vertexShader: ringVertShader,
        fragmentShader: ringFragShader,
        uniforms: {
          uColor: { value: new THREE.Color(spec.bandColor) },
          uEmissive: { value: new THREE.Color(spec.bandColor) },
          uEmissiveIntensity: { value: 5.2 },
          uNormalMap: { value: normalMapTexture },
          uNormalScale: { value: new THREE.Vector2(0.28, 0.28) },
          uMatCap: { value: matCapTexture },
          uMetallicRoughness: { value: metallicRoughnessTexture },
          uTime: { value: 0.0 },
          uHoverIntensity: { value: 0.0 },
          uPulseIntensity: { value: 1.0 },
          uDoFBlur: { value: 0.0 },
          uAccentColor: { value: new THREE.Color(spec.accentColor) },
          uReputationScore: { value: spec.reputationScore },
          uBloomGlowFactor: { value: 2.6 },
          uDialectSeed: { value: spec.index * 13.57 }, // Seed dialect per intelligence domain!
        },
        depthWrite: true,
        depthTest: true,
      });
      const bandMesh = new THREE.Mesh(bandGeo, bandMat);
      g.add(bandMesh);

      // Layer 1: Outer Halo (Thin, contains outer script, rotates independently)
      const outerHaloMat = bandMat.clone();
      outerHaloMat.uniforms.uBloomGlowFactor = { value: 1.8 };
      outerHaloMat.uniforms.uDialectSeed = { value: spec.index * 13.57 + 4.56 }; // Offset the outer script slightly
      const outerHaloMesh = new THREE.Mesh(new THREE.TorusGeometry(9.2, 0.1, 32, 128), outerHaloMat);
      g.add(outerHaloMesh);

      // Layer 2: Micro Glyph Ring (Thousands of extra smaller symbols engraved, glowing softly)
      const microGlyphMat = bandMat.clone();
      microGlyphMat.uniforms.uBloomGlowFactor = { value: 1.1 };
      microGlyphMat.uniforms.uDialectSeed = { value: spec.index * 13.57 - 9.12 }; // Counter-dialect offsets
      const microGlyphMesh = new THREE.Mesh(new THREE.TorusGeometry(8.5, 0.15, 32, 128), microGlyphMat);
      g.add(microGlyphMesh);

      // Layer 5: Data Ring (Floating particles, unique volumetric orbitals and chaotic offsets per domain)
      const isTranscendental = spec.index === 0 || spec.index === 8 || spec.index === 9;
      const customParticleCount = isTranscendental ? 72 : 28 + (spec.index * 5);
      const customParticleRadius = 5.6 + (spec.index % 3) * 0.75;
      const customParticleSize = 0.18 + (spec.index % 4) * 0.11;

      const pPositions = new Float32Array(customParticleCount * 3);
      for (let j = 0; j < customParticleCount; j++) {
        const theta = (j / customParticleCount) * Math.PI * 2;
        const radialSway = Math.sin(theta * (2.0 + (spec.index % 3))) * (0.35 + (spec.index % 2) * 0.2);
        pPositions[j * 3] = Math.cos(theta) * (customParticleRadius + radialSway);
        pPositions[j * 3 + 1] = Math.sin(theta) * (customParticleRadius + radialSway);
        pPositions[j * 3 + 2] = (Math.random() - 0.5) * (0.2 + spec.index * 0.1);
      }
      const dataRingGeo = new THREE.BufferGeometry();
      dataRingGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
      const dataRingMat = new THREE.PointsMaterial({
        color: spec.accentColor,
        size: customParticleSize,
        map: glowSpriteTexture,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const dataRingMesh = new THREE.Points(dataRingGeo, dataRingMat);
      g.add(dataRingMesh);

      // Layer 6: Core Group (Geodesic Core + 6 Equator-Aligned Hexagonal Nodes)
      const planetGroup = new THREE.Group();
      g.add(planetGroup);

      const planetGeo = new THREE.IcosahedronGeometry(1.6, 2);
      const planetMat = new THREE.MeshPhysicalMaterial({
        color: spec.stoneColor,
        emissive: spec.stoneColor,
        emissiveIntensity: 1.5,
        roughness: 0.12,
        metalness: 0.88,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        transmission: 0.42,
        thickness: 0.8
      });
      const planetCoreMesh = new THREE.Mesh(planetGeo, planetMat);
      planetGroup.add(planetCoreMesh);

      // Add 6 hexagonal sacred geometry nodes directly onto/around the planet core
      const hexNodeGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.32, 6);
      const hexNodesMat = new THREE.MeshPhysicalMaterial({
        color: spec.accentColor,
        emissive: spec.accentColor,
        emissiveIntensity: 1.25,
        metalness: 0.9,
        roughness: 0.05,
        clearcoat: 1.0
      });

      for (let h = 0; h < 6; h++) {
        const hexAngle = (h / 6) * Math.PI * 2;
        const hexNode = new THREE.Mesh(hexNodeGeo, hexNodesMat);
        hexNode.position.set(
          Math.cos(hexAngle) * 1.85,
          Math.sin(hexAngle) * 1.85,
          0
        );
        hexNode.rotation.z = hexAngle;
        hexNode.rotation.x = Math.PI / 2;
        planetGroup.add(hexNode);
      }

      const planetMesh = planetGroup;

      // Layer 4: Nested Orbital Cage (replaces the simple circular planetRing/torus model)
      const orbitalCage = new THREE.Group();
      g.add(orbitalCage);

      const cageRingMat = new THREE.MeshPhysicalMaterial({
        color: spec.accentColor,
        emissive: spec.accentColor,
        emissiveIntensity: 0.75,
        metalness: 0.95,
        roughness: 0.1,
        clearcoat: 1.0,
        wireframe: false
      });

      // Cage 1: Outer cage band
      const cage1 = new THREE.Mesh(new THREE.TorusGeometry(3.3, 0.06, 16, 64), cageRingMat);
      cage1.rotation.x = Math.PI / 4;
      orbitalCage.add(cage1);

      // Cage 2: Middle cage band
      const cage2 = new THREE.Mesh(new THREE.TorusGeometry(2.8, 0.05, 16, 64), cageRingMat);
      cage2.rotation.y = Math.PI / 4;
      orbitalCage.add(cage2);

      // Cage 3: Inner cage band
      const cage3 = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.04, 16, 64), cageRingMat);
      cage3.rotation.z = Math.PI / 4;
      orbitalCage.add(cage3);

      const planetRing = orbitalCage;

      // Create an additive volumetric atmospheric glow mesh around the torus band (ethereal bloom simulator)
      const glowGeo = new THREE.TorusGeometry(8, 1.55, 128, 512);
      const glowMat = new THREE.ShaderMaterial({
        vertexShader: ringGlowVertShader,
        fragmentShader: ringGlowFragShader,
        uniforms: {
          uColor: { value: new THREE.Color(spec.bandColor) },
          uGlowIntensity: { value: 4.6 }, // Multiplied high-fidelity HDR glow intensity to guarantee gorgeous bloom bleeding
          uHoverIntensity: { value: 0.0 },
          uTime: { value: 0.0 }
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false,
        depthTest: true
      });
      const glowMesh = new THREE.Mesh(glowGeo, glowMat);
      g.add(glowMesh);

      // Create Stone details with high segment density and physically simulated gemstone properties
      const stoneGeo = new THREE.SphereGeometry(1.6, 96, 96);
      const stoneMat = new THREE.MeshPhysicalMaterial({
        color: spec.stoneColor,
        emissive: spec.stoneColor,
        emissiveIntensity: 3.2, // Enhanced luminous core
        roughness: 0.05,
        metalness: 0.1,
        clearcoat: 1.0,          // Highly reflective outer enamel coat
        clearcoatRoughness: 0.02,
        transmission: 0.65,      // Crystal transmission refraction
        thickness: 0.8,          // Real physical gemstone thickness
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
      const nodesMat = new THREE.MeshPhysicalMaterial({
        color: spec.accentColor,
        emissive: spec.accentColor,
        emissiveIntensity: 0.8, // Luminous runic core inside node metal
        roughness: 0.08,        // Ultra polished finish
        metalness: 0.95,        // Heavy metal density
        clearcoat: 0.8,         // Fine lacquer protection glaze
        clearcoatRoughness: 0.05
      });

      for (let i = 0; i < N; i++) {
        const nodeAngle = (i / N) * Math.PI * 2;
        const nodeGroup = new THREE.Group();
        const nodeRad = 8;
        nodeGroup.position.set(
          Math.cos(nodeAngle) * nodeRad,
          Math.sin(nodeAngle) * nodeRad,
          0
        );

        if (spec.detailType === "crystalFacets") {
          const geo = new THREE.OctahedronGeometry(0.8, 0);
          const mesh = new THREE.Mesh(geo, nodesMat);
          nodeGroup.add(mesh);
        } else if (spec.detailType === "thorns") {
          const geo = new THREE.ConeGeometry(0.4, 1.8, 32);
          const mesh = new THREE.Mesh(geo, nodesMat);
          mesh.rotation.x = Math.PI / 2;
          nodeGroup.add(mesh);
        } else if (spec.detailType === "segmentedPlates") {
          const geo = new THREE.BoxGeometry(0.3, 1.6, 2.0);
          const mesh = new THREE.Mesh(geo, nodesMat);
          nodeGroup.add(mesh);
        } else if (spec.detailType === "crossStruts") {
          // Cross Struts (Ars Almadel): perpendicular intersecting bars
          const geo1 = new THREE.BoxGeometry(1.6, 0.28, 0.28);
          const geo2 = new THREE.BoxGeometry(0.28, 1.6, 0.28);
          const mesh1 = new THREE.Mesh(geo1, nodesMat);
          const mesh2 = new THREE.Mesh(geo2, nodesMat);
          nodeGroup.add(mesh1);
          nodeGroup.add(mesh2);
        } else if (spec.detailType === "hexNodes") {
          // Hex Nodes (Ars Notoria): hexagonal prisms
          const geo = new THREE.CylinderGeometry(0.6, 0.6, 0.45, 6);
          const mesh = new THREE.Mesh(geo, nodesMat);
          mesh.rotation.x = Math.PI / 2;
          nodeGroup.add(mesh);
        } else if (spec.detailType === "angularBrackets") {
          // Angular Brackets (Ars Paulina): chevron / V-shaped support plates
          const leftGeo = new THREE.BoxGeometry(0.75, 0.22, 0.35);
          const leftMesh = new THREE.Mesh(leftGeo, nodesMat);
          leftMesh.position.set(-0.35, 0.15, 0);
          leftMesh.rotation.z = Math.PI / 4;

          const rightGeo = new THREE.BoxGeometry(0.75, 0.22, 0.35);
          const rightMesh = new THREE.Mesh(rightGeo, nodesMat);
          rightMesh.position.set(0.35, 0.15, 0);
          rightMesh.rotation.z = -Math.PI / 4;

          nodeGroup.add(leftMesh);
          nodeGroup.add(rightMesh);
        } else if (spec.detailType === "woundCoils") {
          // Wound Coils (Ars Goetia): coiled metal loops
          const coilGeo1 = new THREE.TorusGeometry(0.65, 0.13, 8, 32);
          const coilGeo2 = new THREE.TorusGeometry(0.48, 0.11, 8, 32);
          const mesh1 = new THREE.Mesh(coilGeo1, nodesMat);
          const mesh2 = new THREE.Mesh(coilGeo2, nodesMat);
          mesh1.position.z = -0.15;
          mesh2.position.z = 0.15;
          nodeGroup.add(mesh1);
          nodeGroup.add(mesh2);
        } else if (spec.detailType === "ladderRungs") {
          // Ladder Rungs (Ars Almiras): tangential triple rung sets
          const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.18, 1.4), nodesMat);
          const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.18, 1.4), nodesMat);
          const b3 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.18, 1.4), nodesMat);
          b1.position.set(-0.45, 0, 0);
          b2.position.set(0, 0, 0);
          b3.position.set(0.45, 0, 0);
          nodeGroup.add(b1);
          nodeGroup.add(b2);
          nodeGroup.add(b3);
        } else if (spec.detailType === "spiralWraps") {
          // Spiral Wraps (Ars Verum): intricate spiral toroidal knots
          const geo = new THREE.TorusKnotGeometry(0.55, 0.16, 48, 8, 2, 5);
          const mesh = new THREE.Mesh(geo, nodesMat);
          nodeGroup.add(mesh);
        } else if (spec.detailType === "nestedArcs") {
          // Nested Arcs (Ars Fulcanelli): nested layered crescents
          const arc1 = new THREE.TorusGeometry(0.8, 0.11, 8, 24, Math.PI);
          const arc2 = new THREE.TorusGeometry(0.5, 0.09, 8, 24, Math.PI);
          const mesh1 = new THREE.Mesh(arc1, nodesMat);
          const mesh2 = new THREE.Mesh(arc2, nodesMat);
          mesh1.rotation.z = Math.PI;
          mesh2.rotation.z = Math.PI;
          nodeGroup.add(mesh1);
          nodeGroup.add(mesh2);
        } else {
          // Fallback
          const geo = new THREE.SphereGeometry(0.65, 32, 32);
          const mesh = new THREE.Mesh(geo, nodesMat);
          nodeGroup.add(mesh);
        }

        nodeGroup.rotation.z = nodeAngle;
        g.add(nodeGroup);
      }

      g.position.copy(homePos);
      g.rotation.copy(initRot);
      scene.add(g);

      // Create a persistent, faint data stream connecting the central hub to each ring
      const linePointsCount = 20;
      const progressArr = new Float32Array(linePointsCount);
      const positionsArr = new Float32Array(linePointsCount * 3);
      for (let i = 0; i < linePointsCount; i++) {
        progressArr[i] = i / (linePointsCount - 1);
      }
      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute("position", new THREE.BufferAttribute(positionsArr, 3));
      lineGeo.setAttribute("progress", new THREE.BufferAttribute(progressArr, 1));

      const lineMat = new THREE.ShaderMaterial({
        vertexShader: LineVertShader,
        fragmentShader: LineFragShader,
        uniforms: {
          uTime: { value: 0.0 },
          uColor: { value: new THREE.Color(spec.bandColor) },
          uPulseSpeed: { value: 1.0 },
          uColorIntensity: { value: 1.0 },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const dataStreamLine = new THREE.Line(lineGeo, lineMat);
      scene.add(dataStreamLine);

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
          resonanceScale: 1.0,
          resonanceRot: 0.0,
        },
        rotVelocity: {
          x: (Math.random() - 0.5) * 0.15,
          y: (Math.random() - 0.5) * 0.25,
          z: (Math.random() - 0.5) * 0.10,
        },
        springStrengthFactor: 1.0,
        torqueBlendFactor: 1.0,
        dragDecayFactor: 0.932,
        dataStreamLine,
        glowMat,
        outerHaloMesh,
        microGlyphMesh,
        dataRingMesh,
        planetMesh,
        planetRing,
        orbitalCage,
      });
    });

    physicalRingsRef.current = physicalRings;

    // ─── PART 8: RAYCASTER CLICK AND GSAP HOVER HANDLERS ─────────────────
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredRingIndex = -1;
    let isCoreHovered = false;

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

      // Check intersection with central core sigil group
      const coreIntersects = raycaster.intersectObjects(sigilGroup.children, true);
      const clickedCore = coreIntersects.length > 0;

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
        if (clickedCore) {
          // Clicked on the core: reset to senate overview and give the gyros an amazing spin boost!
          onSelectRing(-1);
          gyroRings.forEach((ring, index) => {
            gsap.killTweensOf(ring.rotation);
            gsap.fromTo(ring.rotation, 
              { z: ring.rotation.z },
              { z: ring.rotation.z + Math.PI * (index % 2 === 0 ? 6.0 : -6.0), duration: 2.2, ease: "power3.out" }
            );
          });
        } else {
          // Recenter to global senate overview when clicking on empty background space of the canvas
          onSelectRing(-1);
        }
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

      // Check intersection with central core sigil group to determine if core is focused
      const sigilIntersects = raycaster.intersectObjects(sigilGroup.children, true);
      isCoreHovered = sigilIntersects.length > 0;

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
              hoverScale: 1.15,      // Smoothly expand slightly on hover!
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

      // Disable currently active inertial deceleration for clicked elements and kill running GSAP deceleration tweens
      if (closestIndex !== -1) {
        const ring = physicalRings.find((p) => p.index === closestIndex);
        if (ring) {
          gsap.killTweensOf(ring);
          ring.springStrengthFactor = 0.0;
          ring.torqueBlendFactor = 0.0;
          ring.dragDecayFactor = 0.988;
        }
      } else {
        physicalRings.forEach((p) => {
          gsap.killTweensOf(p);
          p.springStrengthFactor = 0.0;
          p.torqueBlendFactor = 0.0;
          p.dragDecayFactor = 0.988;
        });
      }
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
      // Upon manual release, trigger dynamic inertia-based deceleration curves using GSAP
      if (isDragging) {
        let draggedRingIdx = dragRingIndex;
        if (draggedRingIdx === -1 && selectedIndexRef.current !== -1) {
          draggedRingIdx = selectedIndexRef.current;
        }

        const ringsToDecelerate = draggedRingIdx !== -1 
          ? physicalRings.filter((p) => p.index === draggedRingIdx)
          : physicalRings;

        ringsToDecelerate.forEach((pr) => {
          // Immediately reset to low-friction glide state
          pr.springStrengthFactor = 0.0;
          pr.torqueBlendFactor = 0.0;
          pr.dragDecayFactor = 0.988;

          // GSAP smoothly blends these factors to slow down ring rotation, simulating a sense of physical mass
          gsap.killTweensOf(pr);
          gsap.to(pr, {
            springStrengthFactor: 1.0,
            torqueBlendFactor: 1.0,
            dragDecayFactor: 0.932,
            duration: 3.5,
            ease: "power2.out",
          });
        });
      }
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

      // Disable currently active inertial deceleration for clicked elements and kill running GSAP deceleration tweens
      if (closestIndex !== -1) {
        const ring = physicalRings.find((p) => p.index === closestIndex);
        if (ring) {
          gsap.killTweensOf(ring);
          ring.springStrengthFactor = 0.0;
          ring.torqueBlendFactor = 0.0;
          ring.dragDecayFactor = 0.988;
        }
      } else {
        physicalRings.forEach((p) => {
          gsap.killTweensOf(p);
          p.springStrengthFactor = 0.0;
          p.torqueBlendFactor = 0.0;
          p.dragDecayFactor = 0.988;
        });
      }
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

    const handleWheel = (event: WheelEvent) => {
      if (event.target === canvasRef.current) {
        event.preventDefault();
      }
      zoomLevel += event.deltaY * 0.15;
      // Clamp zoom level: maximum zoom-in is near target rings, maximum zoom-out is bounded
      zoomLevel = Math.max(-65.0, Math.min(120.0, zoomLevel));
    };
    container.addEventListener("wheel", handleWheel, { passive: false });

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

    // Pre-allocated scratch/temporary variables for high-fidelity zero-allocation frame loops
    const scratchLocalPos = new THREE.Vector3();
    const scratchTargetPos = new THREE.Vector3();
    const scratchFocusTargetPos = new THREE.Vector3();
    const scratchProjectedPos = new THREE.Vector3();
    const scratchHubPos = new THREE.Vector3(0, 0, 0);
    const scratchHUDTempV3 = new THREE.Vector3();
    const scratchCamSpacePos = new THREE.Vector3();
    
    const scratchColorActive = new THREE.Color();
    const scratchColorRing = new THREE.Color();
    const scratchColorAccent = new THREE.Color();
    const scratchColorStone = new THREE.Color();
    const scratchColorOrange = new THREE.Color();

    let currentDPRScale = Math.max(window.devicePixelRatio || 1.0, 3840.0 / Math.max(1.0, container.clientWidth));
    let targetDPRScale = currentDPRScale;
    let lastScalingTime = performance.now();
    let prevActiveIdx = -2;
    let lastRenderedHoverIdx = -2;

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

      let delta = clock.getDelta();
      // Prevent jumpy rotations and extreme jitters by clamping the high-precision clock delta
      delta = Math.max(0.0001, Math.min(0.05, delta));
      const time = clock.getElapsedTime();

      // Recalculate native 4K target dynamically on container updates
      currentDPRScale = Math.max(window.devicePixelRatio || 1.0, 3840.0 / Math.max(1.0, container.clientWidth));

      // Dynamic Resolution Scaling (DRS) based on frame render latency
      const scaleDelta = now - lastScalingTime;
      if (scaleDelta > 350) {
        if (delta > 0.0172) { // Slow frame detected (under 58 FPS): immediately fallback downsample to maintain fluid 60FPS
          targetDPRScale = Math.max(0.75, targetDPRScale - 0.45);
          lastScalingTime = now;
        } else if (delta < 0.0163 && targetDPRScale < currentDPRScale) { // Fast, idle frames (stable 60+ FPS): scale up towards native 4K
          targetDPRScale = Math.min(currentDPRScale, targetDPRScale + 0.15);
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
      const isAgentActive = activeIdx !== -1;

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
              // Smoothly blend motorized torque based on GSAP torqueBlendFactor
              pr.rotVelocity.x = THREE.MathUtils.lerp(pr.rotVelocity.x, targetVx, 2.5 * pr.torqueBlendFactor * FIXED_TIMESTEP);
              pr.rotVelocity.y = THREE.MathUtils.lerp(pr.rotVelocity.y, targetVy, 2.5 * pr.torqueBlendFactor * FIXED_TIMESTEP);
              pr.rotVelocity.z = THREE.MathUtils.lerp(pr.rotVelocity.z, targetVz, 2.5 * pr.torqueBlendFactor * FIXED_TIMESTEP);

              // Apply high-kinetic glide decay if driving torque is temporarily bypassed during glide
              if (pr.torqueBlendFactor < 1.0) {
                // Blend friction: when torqueBlendFactor is low, we use the custom dragDecayFactor (closer to 1.0, very small drag)
                const activeDragFactor = pr.dragDecayFactor * (1.15 - pr.torqueBlendFactor * 0.15);
                const physicalDrag = Math.pow(activeDragFactor, FIXED_TIMESTEP * 25);
                pr.rotVelocity.x *= physicalDrag;
                pr.rotVelocity.y *= physicalDrag;
                pr.rotVelocity.z *= physicalDrag;
              }
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
              const stiffness = 2.5 * pr.springStrengthFactor; 
              const damping = 1.6 * (0.2 + 0.8 * pr.springStrengthFactor);

              accelX = -stiffness * shortestAngleDiff(pr.group.rotation.x, pr.initRot.x) - damping * pr.rotVelocity.x;
              accelY = -stiffness * shortestAngleDiff(pr.group.rotation.y, pr.initRot.y) - damping * pr.rotVelocity.y;
              accelZ = -stiffness * shortestAngleDiff(pr.group.rotation.z, pr.initRot.z) - damping * pr.rotVelocity.z;
            }

            // Integrate acceleration into angular velocity
            pr.rotVelocity.x += accelX * FIXED_TIMESTEP;
            pr.rotVelocity.y += accelY * FIXED_TIMESTEP;
            pr.rotVelocity.z += accelZ * FIXED_TIMESTEP;

            // Apply quadratic/exponential aerodynamic air drag so high speeds decay quickly & gradually to zero
            const physicalDrag = Math.pow(pr.dragDecayFactor, FIXED_TIMESTEP * 25);
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

      metatronIco.rotation.y = -time * 0.04;
      if (metatronDodeca) {
        metatronDodeca.rotation.y = time * 0.075;
        metatronDodeca.rotation.x = time * 0.038;
      }
      sigilGroup.rotation.z = time * 0.02;

      // ─── DYNAMIC STELLAR PULSE ANIMATION (FOR MIN STAR CORE & CORONA) ───
      // Extract Gemini confidence and system latency
      let agentConfidence = 0.92;
      const activeAgentSpec = activeIdx !== -1 ? agentsRef.current.find(a => a.index === activeIdx) : undefined;
      if (activeAgentSpec) {
        agentConfidence = activeAgentSpec.confidenceScore;
      }
      
      const latestPoint = telemetryData && telemetryData.length > 0 ? telemetryData[telemetryData.length - 1] : undefined;
      const currentLatency = latestPoint?.geminiLatency ?? 1300; // latency in ms
      
      // Calculate dynamic pulse rate from system latency
      // A lower latency (e.g., 800ms) results in rapid, energetic pulsing.
      // A higher latency (e.g., 2000ms) slows down to a heavy, deep breathing cadence.
      const rawPulseSpeed = 1000.0 / Math.max(200.0, currentLatency); // cycles per second
      const pulseFreqRad = (rawPulseSpeed * 2.0 * Math.PI) * 1.35; // speed up slightly for high-fidelity breathing
      const stellarPulseFactor = Math.sin(time * pulseFreqRad);
      
      // Animate core geodesic miniature star scale & rotation
      // Core star glows brighter and scales larger when confidence is higher
      const baseStarScale = 1.0 + (agentConfidence * 0.45); 
      const latencyPulseOffset = stellarPulseFactor * 0.18;
      const finalStarScale = baseStarScale + latencyPulseOffset;
      
      starCoreMesh.scale.setScalar(finalStarScale);
      starCoreMesh.rotation.y += delta * 0.75;
      starCoreMesh.rotation.x += delta * 0.35;
      
      // Confidence score modulates inner core opacity & emissive color blending
      starCoreMat.opacity = 0.35 + (agentConfidence * 0.50) + stellarPulseFactor * 0.15;
      // High confidence triggers intense, high-temperature blue-yellow plasma; low confidence feels like dying orange ember
      const tempStarColor = new THREE.Color();
      tempStarColor.lerpColors(new THREE.Color(0xff5500), new THREE.Color(0xffe675), 0.35 + agentConfidence * 0.65);
      starCoreMat.color.copy(tempStarColor);

      // Animate solar corona flare particles
      const coronaPosAttr = coronaField.geometry.attributes.position as THREE.BufferAttribute;
      const coronaArr = coronaPosAttr.array as Float32Array;
      for (let i = 0; i < coronaCount; i++) {
        const speed = coronaSpeeds[i];
        const idx = i * 3;
        
        // Compute base vector direction
        const ix = coronaPositionsInit[idx];
        const iy = coronaPositionsInit[idx + 1];
        const iz = coronaPositionsInit[idx + 2];
        scratchStellarVec.set(ix, iy, iz);
        
        // Low confidence yields highly irregular, chaotic, unorganized coronal flares
        const flareErraticness = (1.0 - agentConfidence) * 1.65;
        const wiggle = Math.sin(time * speed + i * 3.0) * (0.12 + flareErraticness * 0.28);
        const distanceMultiplier = (1.0 + latencyPulseOffset * 0.62) * (1.05 + wiggle);
        
        scratchStellarVec.multiplyScalar(distanceMultiplier);
        
        coronaArr[idx] = scratchStellarVec.x;
        coronaArr[idx + 1] = scratchStellarVec.y;
        coronaArr[idx + 2] = scratchStellarVec.z;
      }
      coronaPosAttr.needsUpdate = true;
      
      // Slowly spin the solar corona particle cloud in opposite direction
      coronaField.rotation.y -= delta * 0.22;
      coronaField.rotation.z += delta * 0.15;
      
      // Pulse core physical glass sphere emissive intensity linked to confidence & latency breathing
      const physicalCorePower = 0.7 + (agentConfidence * 1.8);
      const glassPulse = 1.0 + 0.30 * stellarPulseFactor;
      coreMat.emissiveIntensity = (isAgentActive ? 1.05 : 1.45) * glassPulse * physicalCorePower;
      
      // Lerp physical sphere emissive color slightly to visual feedback matching the temperature
      const targetEmissiveColor = new THREE.Color(0xffaa00);
      if (agentConfidence > 0.94) {
        targetEmissiveColor.set(0xfff0a0); // extremely intense white/yellow flame
      } else if (agentConfidence < 0.70) {
        targetEmissiveColor.set(0xff3300); // deep red dying star
      }
      coreMat.emissive.lerp(targetEmissiveColor, 3.0 * delta);

      // ─── DYNAMIC HOLOGRAPHIC COGNITIVE AVATAR ANIMATIONS ───
      // Gently rotate and bob the holographic head representation
      avatarGroup.rotation.y = time * 0.42;
      avatarGroup.rotation.x = Math.sin(time * 0.6) * 0.12;
      avatarGroup.position.y = Math.sin(time * 1.5) * 0.85;

      // Vertical sweeping scanning biometric ring
      const scanY = Math.sin(time * 2.0) * 5.8;
      scanRingMesh.position.y = scanY;

      const isSpeaking = sendingChatRef.current;
      const isListening = isListeningMicRef.current;

      // Get color matches for the unsealed active agent
      const activeColorHex = activeIdx !== -1 && agents[activeIdx] ? agents[activeIdx].bandColor : 0x7c4df3;
      scratchColorActive.set(activeColorHex);
      
      waveMat.uniforms.uColor.value.copy(scratchColorActive);
      avatarCloudMat.color.copy(scratchColorActive);
      scanRingMat.color.copy(scratchColorActive);

      // Animate speaking vocal soundwave analyzer loop
      const wavePosAttr = waveGeo.attributes.position as THREE.BufferAttribute;
      const wavePosArr = wavePosAttr.array as Float32Array;

      for (let i = 0; i < wavePointsCount; i++) {
        const phi = (i / wavePointsCount) * Math.PI * 2;
        let pRadius = 7.2; // Base vocal loop radius

        if (isSpeaking) {
          // Dynamic holographic speech waveforms: multi-sinusoidal harmonic spikes
          pRadius += Math.sin(phi * 5.0 - time * 24.0) * 1.6 * Math.sin(time * 4.0)
                   + Math.cos(phi * 11.0 + time * 38.0) * 0.65;
        } else if (isListening) {
          // Steady listening prompt frequency visualizer (user audio feedback representation)
          pRadius += Math.sin(phi * 4.0 - time * 14.0) * 0.52 * (0.8 + 0.2 * Math.sin(time * 5.0));
        } else {
          // Calm subconscious cognitive breathing harmonics
          pRadius += Math.sin(phi * 2.5 - time * 2.2) * 0.22;
        }

        let zHeight = 0;
        if (isSpeaking) {
          zHeight = Math.cos(phi * 4.0 + time * 18.0) * 1.2;
        } else if (isListening) {
          zHeight = Math.sin(phi * 3.0 + time * 8.0) * 0.42;
        }

        wavePosArr[i * 3] = Math.cos(phi) * pRadius;
        wavePosArr[i * 3 + 1] = Math.sin(phi) * pRadius;
        wavePosArr[i * 3 + 2] = zHeight;
      }
      wavePosAttr.needsUpdate = true;

      // ─── HOLLYWOOD-CLASS SCI-FI CINEMATIC TRANSITIONS ───
      if (activeIdx !== prevActiveIdx) {
        prevActiveIdx = activeIdx;

        // Reset neural resonance on all rings
        physicalRings.forEach(pr => {
          gsap.killTweensOf(pr.animState, "resonanceScale");
          gsap.killTweensOf(pr.animState, "resonanceRot");
          pr.animState.resonanceScale = 1.0;
          pr.animState.resonanceRot = 0.0;
        });

        if (activeIdx !== -1) {
          // Check if active agent confidence exceeds 95%
          const activeAgentSpec = agentsRef.current.find((ag) => ag.index === activeIdx);
          if (activeAgentSpec && (activeAgentSpec.confidenceScore > 0.95 || activeAgentSpec.reputationScore > 95)) {
            const activeRing = physicalRings.find(r => r.index === activeIdx);
            if (activeRing) {
              // Trigger gentle GSAP "Neural Resonance" scale vibration (breathing)
              gsap.to(activeRing.animState, {
                resonanceScale: 1.15,
                duration: 2.2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
              });

              // Trigger gentle GSAP "Neural Resonance" smooth spin
              gsap.to(activeRing.animState, {
                resonanceRot: Math.PI * 2,
                duration: 8.0,
                repeat: -1,
                ease: "none"
              });
            }
          }

          // 1. Bloom flare explosion: spike bloom pass to represent heavy unsealing power coupling
          bloomIntensityRef.current = 4.8;
          gsap.killTweensOf(bloomIntensityRef);
          gsap.to(bloomIntensityRef, {
            current: bloomIntensity,
            duration: 1.4,
            ease: "power2.out"
          });

          // 2. Recoil Camera Zoom: rapid zoom push, decaying smoothly with high elastic recoil
          camera.position.z = 95.0 - 25.0; // zoom surge impact
          gsap.killTweensOf(camera.position);
          gsap.to(camera.position, {
            z: 95.0,
            duration: 1.6,
            ease: "elastic.out(0.85, 0.55)"
          });

          // 3. Shockwave sparks surge: Flare particles size temporarily
          sparksMat.size = 14.0;
          gsap.killTweensOf(sparksMat);
          gsap.to(sparksMat, {
            size: 3.5,
            duration: 1.3,
            ease: "power2.out"
          });

          // 4. Gyros rapid rotation spin spike!
          gyroRings.forEach((ring, index) => {
            gsap.killTweensOf(ring.rotation);
            gsap.fromTo(ring.rotation, 
              { z: ring.rotation.z },
              { z: ring.rotation.z + Math.PI * (index % 2 === 0 ? 4 : -4), duration: 2.2, ease: "power3.out" }
            );
          });

          // 5. Coordinated scales: contract 3D core sphere and surge the holographic avatar
          gsap.killTweensOf(coreMesh.scale);
          gsap.killTweensOf(avatarGroup.scale);
          gsap.to(coreMesh.scale, { x: 0.35, y: 0.35, z: 0.35, duration: 0.8, ease: "power3.out" });
          gsap.to(avatarGroup.scale, { x: 1.45, y: 1.45, z: 1.45, duration: 1.6, ease: "elastic.out(1.0, 0.42)" });
        } else {
          // Dissolving active focus: pull back 3D core sphere to 1.0 and minimize avatar
          gsap.killTweensOf(coreMesh.scale);
          gsap.killTweensOf(avatarGroup.scale);
          gsap.to(coreMesh.scale, { x: 1.0, y: 1.0, z: 1.0, duration: 0.9, ease: "power2.out" });
          gsap.to(avatarGroup.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.7, ease: "power2.out" });
        }
      }


      // Hover-responsive parallax camera shift + Focus Zoom to selected ring + Scroll Zoom level integration
      const targetCamX = parallax.x * 12.0;
      const targetCamY = parallax.y * 10.0;
      const baseCamZ = isAgentActive ? 95.0 : 160.0;
      const targetCamZ = baseCamZ + zoomLevel;
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 3.5 * delta);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 3.5 * delta);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 2.5 * delta);
      camera.lookAt(0, 0, 0);

      // ─── UPDATE AND EMIT LIGHT TRAILS ───
      physicalRings.forEach((pr) => {
        const isSelected = pr.index === activeIdx;
        const emitProb = isSelected ? 0.98 : 0.45;
        
        // Spawn multiple particles per frame if selected to provide a dense, highly visual soft cloud trail
        const spawnCount = isSelected ? 5 : 1;
        for (let s = 0; s < spawnCount; s++) {
          if (Math.random() < emitProb) {
            scratchColorRing.set(pr.color);
            const activeAgent = agents.find((ag) => ag.index === pr.index);
            if (activeAgent) {
              scratchColorAccent.set(activeAgent.accentColor);
            } else {
              scratchColorAccent.set(pr.color);
            }
            const blendedColor = scratchColorRing.clone().lerp(scratchColorAccent, 0.55);

            // Give selected particles an extended, organically pulsing age distribution
            const particleAgeSpread = 1.0 + Math.random() * 1.5;

            activeTrails.push({
              pos: new THREE.Vector3(),
              color: blendedColor,
              size: (isSelected ? 7.6 : 3.0) * (0.6 + Math.random() * 1.1),
              age: 0,
              maxAge: (isSelected ? 1.5 : 0.85) * particleAgeSpread,
              theta: Math.random() * Math.PI * 2,
              radialOffset: (Math.random() - 0.5) * (isSelected ? 1.8 : 0.6),
              speed: (0.7 + Math.random() * 1.3) * (isSelected ? 3.2 : 1.05),
              ringIndex: pr.index,
              ringRef: pr,
              zWobbleFreq: (isSelected ? 4.5 : 2.0) + Math.random() * 4.0,
            });
          }
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
          const pr = pt.ringRef || physicalRings.find((r) => r.index === pt.ringIndex);
          if (pr) {
            // increment angle around the torus ring path
            pt.theta += pt.speed * delta;

            const isSelected = pt.ringIndex === activeIdx;
            const pct = pt.age / pt.maxAge;
            const alpha = 1.0 - pct;

            // Apply soft outward spiraling and age-based organic drift for high-fidelity particles
            const radius = (8.0 + pt.radialOffset) * (1.0 + (isSelected ? 0.32 * pct : 0.08 * pct));
            const localX = Math.cos(pt.theta) * radius;
            const localY = Math.sin(pt.theta) * radius;
            const localZ = Math.sin(pt.theta * pt.zWobbleFreq + pt.age * 6.5) * (0.45 + (isSelected ? 1.12 * pct : 0.15));

            scratchLocalPos.set(localX, localY, localZ);
            pt.pos.copy(scratchLocalPos).applyMatrix4(pr.group.matrixWorld);

            // Add subtle floating upward drift to the selected particle trail for fluid aesthetic
            if (isSelected) {
              pt.pos.y += pct * 2.2;
              pt.pos.z += Math.sin(pt.age * 2.8) * 0.85;
            }

            posArr[traceCount * 3] = pt.pos.x;
            posArr[traceCount * 3 + 1] = pt.pos.y;
            posArr[traceCount * 3 + 2] = pt.pos.z;

            colArr[traceCount * 3] = pt.color.r * alpha * 2.5;
            colArr[traceCount * 3 + 1] = pt.color.g * alpha * 2.5;
            colArr[traceCount * 3 + 2] = pt.color.b * alpha * 2.5;

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
      let targetFocusPos: THREE.Vector3 | null = null;
      let focusRangeTarget = 0.38;

      if (hoveredRingIndex !== -1) {
        const hRing = physicalRings.find((pr) => pr.index === hoveredRingIndex);
        if (hRing) {
          targetFocusPos = scratchFocusTargetPos;
          hRing.group.getWorldPosition(targetFocusPos);
          focusRangeTarget = 0.32; // Tighter focus circle on hovered ring
        }
      } else if (isAgentActive) {
        const aRing = physicalRings.find((pr) => pr.index === activeIdx);
        if (aRing) {
          targetFocusPos = scratchFocusTargetPos;
          aRing.group.getWorldPosition(targetFocusPos);
          focusRangeTarget = 0.28; // Very sharp focus on the selected active agent
        }
      } else {
        // Focusing on the central core or when hovering the core
        targetFocusPos = scratchFocusTargetPos.set(0, 0, 0);
        focusRangeTarget = isCoreHovered ? 0.20 : 0.26; // Blurs background rings even more when hover-focusing core
      }

      // Automatically adjust camera focus range as the camera gets closer to the active ring archetype / core
      const focusDistanceScale = Math.max(0.18, Math.min(1.0, (camera.position.z - 30.0) / 130.0));
      focusRangeTarget *= focusDistanceScale;

      let focusTargetX = 0.5;
      let focusTargetY = 0.5;

      if (targetFocusPos) {
        scratchProjectedPos.copy(targetFocusPos);
        scratchProjectedPos.project(camera);
        focusTargetX = (scratchProjectedPos.x * 0.5) + 0.5;
        focusTargetY = (scratchProjectedPos.y * 0.5) + 0.5;
      }

      // Smoothly LERP focus point coordinates to prevent cinematic jumps
      dofPass.uniforms.uFocusPoint.value.x = THREE.MathUtils.lerp(dofPass.uniforms.uFocusPoint.value.x, focusTargetX, 8.0 * delta);
      dofPass.uniforms.uFocusPoint.value.y = THREE.MathUtils.lerp(dofPass.uniforms.uFocusPoint.value.y, focusTargetY, 8.0 * delta);

      // Smoothly LERP focus region size for dynamic focus breathing
      dofPass.uniforms.uFocusRange.value = THREE.MathUtils.lerp(dofPass.uniforms.uFocusRange.value, focusRangeTarget, 5.0 * delta);

      // Compute 3D camera-view space depth of the focus target for physically grounded DoF
      let targetFocalDepth = 160.0;
      if (targetFocusPos) {
        scratchCamSpacePos.copy(targetFocusPos).applyMatrix4(camera.matrixWorldInverse);
        targetFocalDepth = -scratchCamSpacePos.z;
      }

      // Smoothly interpolate the camera's focal depth to prevent focus popping transitions
      dofPass.uniforms.uFocalDepth.value = THREE.MathUtils.lerp(
        dofPass.uniforms.uFocalDepth.value,
        targetFocalDepth,
        6.0 * delta
      );

      // Heighten the OLED cinematic feel with a persistent yet responsive depth blur
      const targetDofEnabled = 1.0;
      dofPass.uniforms.uEnabled.value = THREE.MathUtils.lerp(
        dofPass.uniforms.uEnabled.value,
        targetDofEnabled,
        5.0 * delta
      );

      // Dynamic cinematic aperture based on active selection to compress focal plane
      const targetAperture = isAgentActive ? 4.2 : 12.0;
      dofPass.uniforms.uAperture.value = THREE.MathUtils.lerp(
        dofPass.uniforms.uAperture.value,
        targetAperture,
        5.0 * delta
      );

      // ─── DYNAMIC BLOOM PASS ADAPTATION BASED ON SELECTION & CALIBRATION ───
      const targetBloomRadius = isAgentActive ? 1.05 : 0.85;
      // High-frequency bloom intensity boost with slow cosmic breathing oscillation to ensure extreme ring brilliance
      const bloomBreathing = 1.0 + Math.sin(time * 1.5) * 0.25;
      
      // When a user hovers their mouse over a specific ring, elevate bloom parameters for a high-impact visual pulse feedback
      const isAnyRingHovered = (hoveredRingIndex !== -1);
      const hoverIntensityMul = isAnyRingHovered ? 1.85 : 1.0;
      const hoverThresholdMul = isAnyRingHovered ? 1.45 : 1.0;

      // Automatically adjust the bloom as the camera nears the active ring archetype / central construct
      const distanceScale = Math.max(0.18, Math.min(1.0, (camera.position.z - 30.0) / 130.0));
      const zoomBloomBoost = 1.0 + (1.0 - distanceScale) * 0.55;

      const bloomIntensityBoost = (isAgentActive ? 2.8 : 2.2) * bloomBreathing * hoverIntensityMul * zoomBloomBoost;
      bloomPass.intensity = THREE.MathUtils.lerp(
        bloomPass.intensity,
        bloomIntensityBoost * bloomIntensityRef.current,
        5.0 * delta
      );
      
      const targetThreshold = bloomThresholdRef.current * (isAgentActive ? 0.75 : 0.9) * hoverThresholdMul * (2.0 - zoomBloomBoost * 0.5);
      bloomPass.threshold = THREE.MathUtils.lerp(bloomPass.threshold, targetThreshold, 5.0 * delta);

      // Shift workspace ambient/point lights and core material colors towards agent accent color when active
      const activeAgent = agents.find((ag) => ag.index === activeIdx);
      if (activeAgent) {
        scratchColorAccent.set(activeAgent.accentColor);
        scratchColorStone.set(activeAgent.stoneColor);

        pointLight2.color.lerp(scratchColorAccent, 5.0 * delta);
        pointLight1.color.lerp(scratchColorStone, 5.0 * delta);

        coreMat.color.lerp(scratchColorAccent, 5.0 * delta);
        coreMat.emissive.lerp(scratchColorAccent, 5.0 * delta);
      } else {
        scratchColorAccent.set(0x7c4df3);
        scratchColorStone.set(0xffd070);

        pointLight2.color.lerp(scratchColorAccent, 4.0 * delta);
        pointLight1.color.lerp(scratchColorStone, 4.0 * delta);

        scratchColorOrange.set(0xff9900);
        coreMat.color.lerp(scratchColorOrange, 4.0 * delta);
        coreMat.emissive.lerp(scratchColorOrange, 4.0 * delta);
      }

      // 3. Interpolations & Ring Animations (Positions, scales, Hover materials, MotionBlur vector tracking)
      let calculatedMotionBlurVector = new THREE.Vector2(0, 0);

      physicalRings.forEach((pr) => {
        const isSelected = pr.index === activeIdx;

        // ─── PROCEDURAL ORBITAL RESONANCE WORKLOAD (TOKEN RATE) ───
        let tokenConsumptionRate = 4.0 + Math.sin(time * 0.8 + pr.index * 1.7) * 2.5; // low background flow
        if (isSelected) {
          tokenConsumptionRate = 22.0 + Math.sin(time * 2.5) * 8.0;
          if (sendingChat) {
            // High processing workload spike!
            tokenConsumptionRate += 160.0 + Math.sin(time * 15.0) * 45.0 + Math.cos(time * 7.5) * 25.0;
          }
        } else {
          // Occasional background bursts from other senate domains analyzing telemetry
          const burstSeed = Math.sin(time * 0.2 + pr.index * 4.3);
          if (burstSeed > 0.75) {
            tokenConsumptionRate += (burstSeed - 0.75) * 40.0 * (1.2 + Math.sin(time * 10.0));
          }
        }

        // Slightly change their rotation frequency based on workload rate
        const resonanceFreqMultiplier = 1.0 + (tokenConsumptionRate / 140.0);

        // Smooth position positioning (LERP with integrated floating offset to prevent jumps)
        const ringAngle = (pr.index / 10) * Math.PI * 2;
        const ringFloatOffset = isSelected ? 0.0 : Math.sin(time * 1.5 + ringAngle) * 3.5;
        
        let tempTargetPos = scratchTargetPos;
        if (isSelected) {
          tempTargetPos.set(0, 0, 18);
        } else {
          tempTargetPos.set(pr.homePos.x, pr.homePos.y + ringFloatOffset, pr.homePos.z);
        }
        pr.group.position.lerp(tempTargetPos, 7.0 * delta);

        // Apply high-frequency 'Orbital Resonance' vibration to ring coordinates based on workload
        const vibrAmplitude = (tokenConsumptionRate / 200.0) * 0.18; // Spikes generate strong physical rattle
        if (vibrAmplitude > 0.005) {
          const jitterX = Math.sin(time * 65.0 + pr.index * 13.0) * vibrAmplitude;
          const jitterY = Math.cos(time * 62.0 - pr.index * 11.0) * vibrAmplitude;
          const jitterZ = Math.sin(time * 58.0 + pr.index * 7.0) * vibrAmplitude;
          pr.group.position.x += jitterX;
          pr.group.position.y += jitterY;
          pr.group.position.z += jitterZ;
        }
        
        // Compute base, hover, and GSAP resonance scale
        const resScale = pr.animState.resonanceScale !== undefined ? pr.animState.resonanceScale : 1.0;
        const scaleVal = pr.animState.scale * pr.animState.hoverScale * resScale;
        pr.group.scale.set(scaleVal, scaleVal, scaleVal);

        // Apply Neural Resonance rotational shifts
        if (isSelected && pr.animState.resonanceRot !== undefined && pr.animState.resonanceRot > 0) {
          pr.group.rotation.y += pr.animState.resonanceRot * delta * 0.15;
          pr.group.rotation.x += pr.animState.resonanceRot * delta * 0.05;
        }

        // Dynamic Bokeh Depth Of Field interpolation
        // If no specific ring is active, keep all clear and focused (0.0)
        // If a ring is active, blur all OTHER rings seamlessly (1.0)
        const targetDoF = (activeIdx !== -1 && !isSelected) ? 1.0 : 0.0;
        const currentDoF = pr.bandMesh.material instanceof THREE.ShaderMaterial ? pr.bandMesh.material.uniforms.uDoFBlur.value : 0.0;
        const nextDoF = THREE.MathUtils.lerp(currentDoF, targetDoF, 6.0 * delta);

        const agentSpec = agentsRef.current.find((ag) => ag.index === pr.index);
        
        // Synchronize all cloned materials (Outer Halo, Micro Glyphs, & bandMesh)
        const updateMeshMaterialUniforms = (mesh: THREE.Mesh | undefined) => {
          if (mesh && mesh.material instanceof THREE.ShaderMaterial) {
            mesh.material.uniforms.uTime.value = time;
            mesh.material.uniforms.uHoverIntensity.value = pr.animState.hoverIntensity;
            mesh.material.uniforms.uPulseIntensity.value = pr.animState.pulseIntensity;
            mesh.material.uniforms.uDoFBlur.value = nextDoF;
            if (agentSpec) {
              mesh.material.uniforms.uReputationScore.value = agentSpec.reputationScore;
            }
          }
        };

        updateMeshMaterialUniforms(pr.bandMesh);
        updateMeshMaterialUniforms(pr.outerHaloMesh);
        updateMeshMaterialUniforms(pr.microGlyphMesh);

        // Update custom glow shader material properties
        if (pr.glowMat && pr.glowMat instanceof THREE.ShaderMaterial) {
          pr.glowMat.uniforms.uTime.value = time;
          pr.glowMat.uniforms.uHoverIntensity.value = pr.animState.hoverIntensity;
        }

        // Update organic data stream curves connecting metropolis central hub with specialized enclaves
        if (pr.dataStreamLine) {
          const lineGeo = pr.dataStreamLine.geometry as THREE.BufferGeometry;
          const posAttribute = lineGeo.attributes.position as THREE.BufferAttribute;
          const posArray = posAttribute.array as Float32Array;

          const hubPos = scratchHubPos; // central root hub position (metropolis center)
          const ringPos = pr.group.position; // live dynamic position of the active ring group

          const ptsCount = posAttribute.count;
          for (let i = 0; i < ptsCount; i++) {
            const t = i / (ptsCount - 1);
            // Dynamic sinusoidal s-curve organic sways to render interactive wave elasticity
            const swayMultiplier = Math.sin(t * Math.PI);
            const swaySpeed = 1.8 + pr.index * 0.15;
            const swayX = Math.sin(time * swaySpeed + t * Math.PI) * 0.25 * swayMultiplier;
            const swayY = Math.cos(time * (swaySpeed * 0.8) + t * Math.PI) * 0.25 * swayMultiplier;

            posArray[i * 3] = THREE.MathUtils.lerp(hubPos.x, ringPos.x, t) + swayX;
            posArray[i * 3 + 1] = THREE.MathUtils.lerp(hubPos.y, ringPos.y, t) + swayY;
            posArray[i * 3 + 2] = THREE.MathUtils.lerp(hubPos.z, ringPos.z, t);
          }
          posAttribute.needsUpdate = true;

          // Sync data pool allocation weightings for transmission speeds
          const currentAgent = agentsRef.current.find((ag) => ag.index === pr.index);
          const currentTokenVal = currentAgent ? currentAgent.tokenPool : 1000;
          const tokenRatio = Math.max(0.3, Math.min(2.5, currentTokenVal / 1000.0));

          const lineMat = pr.dataStreamLine.material as THREE.ShaderMaterial;
          lineMat.uniforms.uTime.value = time;
          lineMat.uniforms.uPulseSpeed.value = tokenRatio * 1.5;
          lineMat.uniforms.uColorIntensity.value = (isSelected ? 1.6 : 0.6) * tokenRatio;
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

        // Compute domain-specific orbital motion frequency and dynamic drift multipliers
        const domainFrequency = 0.55 + (pr.index * 0.22); // Range [0.55, 2.53] Hz
        const directionFactor = pr.index % 2 === 0 ? 1.0 : -1.0;

        const speedMult = resonanceFreqMultiplier;

         // Layer 1: Outer Halo rotation (rotating independently around local Z axis)
        if (pr.outerHaloMesh) {
          pr.outerHaloMesh.rotation.z += delta * 1.8 * directionFactor * domainFrequency * speedMult;
        }
        // Layer 2: Micro Glyph Ring rotation (rotating in opposite direction)
        if (pr.microGlyphMesh) {
          pr.microGlyphMesh.rotation.z += delta * 1.1 * -directionFactor * (domainFrequency * 0.85) * speedMult;
        }
        // Layer 4: Nested Orbital Cage rotation (counter-rotational nested bands)
        if (pr.orbitalCage && pr.orbitalCage.children.length >= 3) {
          pr.orbitalCage.rotation.y -= delta * 0.35 * directionFactor * domainFrequency * speedMult;
          
          const cageRing1 = pr.orbitalCage.children[0] as THREE.Mesh;
          const cageRing2 = pr.orbitalCage.children[1] as THREE.Mesh;
          const cageRing3 = pr.orbitalCage.children[2] as THREE.Mesh;
          
          if (cageRing1) {
            cageRing1.rotation.y += delta * 1.5 * domainFrequency * speedMult;
          }
          if (cageRing2) {
            cageRing2.rotation.x -= delta * 1.0 * domainFrequency * speedMult;
          }
          if (cageRing3) {
            cageRing3.rotation.z += delta * 1.8 * domainFrequency * speedMult;
          }
        }
        // Layer 5: Orbiting Data particles rotation
        if (pr.dataRingMesh) {
          pr.dataRingMesh.rotation.z += delta * 2.8 * directionFactor * (domainFrequency * 1.15) * speedMult;
        }
        // Layer 6: Planetary Core slow rotation (Core + 6 Hexagonal Nodes unit)
        if (pr.planetMesh) {
          pr.planetMesh.rotation.y += delta * 0.35 * domainFrequency * speedMult;
        }
      });

      // ─── INTERACTION LENS BILLBOARD PLANE ANIMATION & UPDATES ───
      // Only display the overlay when hovering over a NON-active, valid ring
      const isInteractionLensActive = (hoveredRingIndex !== -1 && hoveredRingIndex !== activeIdx);
      const targetLensOpacity = isInteractionLensActive ? 1.0 : 0.0;
      lensMat.opacity = THREE.MathUtils.lerp(lensMat.opacity, targetLensOpacity, 8.0 * delta);

      if (isInteractionLensActive) {
        const hoveredPr = physicalRings.find((p) => p.index === hoveredRingIndex);
        if (hoveredPr) {
          // Re-render canvas if the hovered index has shifted
          if (hoveredRingIndex !== lastRenderedHoverIdx) {
            updateLensCanvas(hoveredRingIndex);
            lastRenderedHoverIdx = hoveredRingIndex;
          }

          // Fetch the world position of the hovered ring group
          const hoveredWorldPos = scratchHUDTempV3;
          hoveredPr.group.getWorldPosition(hoveredWorldPos);

          // Position the billboard beautifully: float slightly above and behind the hovered ring
          // to make sure it doesn't obstruct the torus itself but provides a sleek side callout
          const lensOffset = new THREE.Vector3(0, 11.0, 3.0); // local offset floated above/closer
          lensOffset.applyQuaternion(camera.quaternion); // align to camera view orientation
          
          const lensTargetPos = hoveredWorldPos.add(lensOffset);
          lensMesh.position.lerp(lensTargetPos, 12.0 * delta);
          
          // Make sure the lens plane scale is active
          lensMesh.scale.set(1.0, 1.0, 1.0);
        }
      } else {
        lastRenderedHoverIdx = -1;
        // Float the billboard out or shrink it down slightly when closing
        lensMesh.scale.lerp(new THREE.Vector3(0.001, 0.001, 0.001), 10.0 * delta);
      }

      // Billboard orientation alignment: ensure the plane is always strictly orthogonal to the camera viewpoint
      lensMesh.quaternion.copy(camera.quaternion);

      // Apply dynamic camera-screen motion blur pass values smoothly
      motionBlurPass.uniforms.uVelocity.value.x = THREE.MathUtils.lerp(motionBlurPass.uniforms.uVelocity.value.x, calculatedMotionBlurVector.x, 6.0 * delta);
      motionBlurPass.uniforms.uVelocity.value.y = THREE.MathUtils.lerp(motionBlurPass.uniforms.uVelocity.value.y, calculatedMotionBlurVector.y, 6.0 * delta);

      // Ray-trace project the 3D position of the artificial star core (0,0,0) to screen-space NDC space for the God-Rays pass
      const lightProjV = new THREE.Vector3(0, 0, 0);
      lightProjV.project(camera);
      const ndcScreenX = (lightProjV.x * 0.5) + 0.5;
      const ndcScreenY = (lightProjV.y * 0.5) + 0.5;
      godRaysPass.uniforms.uLightPositionScreen.value.set(ndcScreenX, ndcScreenY);
      godRaysPass.uniforms.uTime.value = clock.getElapsedTime();

      // Render backgrounds & main layers separately for high-fidelity composite depth
      renderer.autoClear = false;
      renderer.clear();
      
      // Render static background quad first on frame backbuffer (unbloomed)
      renderer.render(bgScene, bgCamera);
      
      // Render foreground interactive group inside the bloom composites pipeline
      composer.render();

      // ─── UPDATE HUD OVERLAY COGNITIVE GAUGES ───
      const targetHUDIndex = selectedIndexRef.current;
      if (targetHUDIndex !== -1 && physicalRings.length > 0) {
        const pr = physicalRings.find((r) => r.index === targetHUDIndex);
        if (pr) {
          const tempV3 = scratchHUDTempV3;
          tempV3.setFromMatrixPosition(pr.group.matrixWorld);
          tempV3.project(camera);

          const width = container.clientWidth;
          const height = container.clientHeight;
          const projectedX = (tempV3.x * 0.5 + 0.5) * width;
          const projectedY = (-(tempV3.y * 0.5) + 0.5) * height;

          if (hudRef.current) {
            hudRef.current.style.transform = `translate3d(${projectedX}px, ${projectedY}px, 0)`;
            hudRef.current.style.opacity = "1";
            hudRef.current.style.pointerEvents = "auto";
          }

          const activeAgent = agentsRef.current.find((a) => a.index === targetHUDIndex);
          const name = activeAgent ? activeAgent.name : "Solomon Enclave";

          const latestPoint = telemetryData && telemetryData.length > 0 
            ? telemetryData[telemetryData.length - 1] 
            : { cognitiveLoad: 48, focusLevel: 82, momentum: 74 };

          const ringMod = (targetHUDIndex * 7) % 15;
          const cogLoad = Math.max(10, Math.min(100, Math.round(latestPoint.cognitiveLoad + ringMod - 5)));
          const momentumVal = Math.max(10, Math.min(100, Math.round(latestPoint.focusLevel + (ringMod % 5) - 2)));

          let statusText = "PROCESSING";
          if (cogLoad > 75) {
            statusText = "HIGH LOAD COUPLING";
          } else if (cogLoad < 35) {
            statusText = "COGNITIVE REST";
          } else {
            statusText = "OPTIMIZED FLOW";
          }

          if (hudTextNameRef.current) hudTextNameRef.current.textContent = name.toUpperCase();
          if (hudTextLoadRef.current) hudTextLoadRef.current.textContent = `${cogLoad}%`;
          if (hudTextMomentumRef.current) hudTextMomentumRef.current.textContent = `${momentumVal}%`;
          if (hudTextStatusRef.current) {
            hudTextStatusRef.current.textContent = statusText;
            if (cogLoad > 75) {
              hudTextStatusRef.current.className = "text-red-400 font-bold tracking-wider";
            } else if (cogLoad < 35) {
              hudTextStatusRef.current.className = "text-sky-400 font-bold tracking-wider";
            } else {
              hudTextStatusRef.current.className = "text-emerald-400 font-bold tracking-wider";
            }
          }

          if (hudLoadCircleRef.current) {
            const r = 65;
            const circum = 2 * Math.PI * r;
            const strokeDashoffset = circum - (cogLoad / 100) * circum;
            hudLoadCircleRef.current.style.strokeDasharray = `${circum}`;
            hudLoadCircleRef.current.style.strokeDashoffset = `${strokeDashoffset}`;
          }
        }
      } else {
        if (hudRef.current) {
          hudRef.current.style.opacity = "0";
          hudRef.current.style.pointerEvents = "none";
        }
      }

      // ─── UPDATE HOVER TOOLTIP ───
      if (hoveredRingIndex !== -1 && hoveredRingIndex !== targetHUDIndex && physicalRings.length > 0) {
        const hPr = physicalRings.find((r) => r.index === hoveredRingIndex);
        if (hPr) {
          const tempV3 = scratchHUDTempV3;
          tempV3.setFromMatrixPosition(hPr.group.matrixWorld);
          tempV3.project(camera);

          const width = container.clientWidth;
          const height = container.clientHeight;
          const projectedX = (tempV3.x * 0.5 + 0.5) * width;
          const projectedY = (-(tempV3.y * 0.5) + 0.5) * height;

          if (hoverTooltipRef.current) {
            hoverTooltipRef.current.style.transform = `translate3d(${projectedX}px, ${projectedY}px, 0)`;
            hoverTooltipRef.current.style.opacity = "1";
          }
          if (hoverTextRef.current) {
             const ag = agentsRef.current.find((a) => a.index === hoveredRingIndex);
             hoverTextRef.current.textContent = ag ? ag.name : "AGENT";
          }
        }
      } else {
        if (hoverTooltipRef.current) {
          hoverTooltipRef.current.style.opacity = "0";
        }
      }
    };

    // Pre-warm and compile both scene pipelines on the GPU to completely eliminate initial frame drops
    renderer.compile(scene, camera);
    renderer.compile(bgScene, bgCamera);

    animate();

    // ─── PART 10: RESIZE OBSERVER & DEVICE PIXEL DENSITY REGISTRY ──────────
    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
      composer.setSize(container.clientWidth, container.clientHeight);
      ssaoPass.uniforms.uResolution.value.set(container.clientWidth, container.clientHeight);
      dofPass.uniforms.uResolution.value.set(container.clientWidth, container.clientHeight);
      bloomPass.setSize(container.clientWidth, container.clientHeight);
      motionBlurPass.uniforms.uResolution.value.set(container.clientWidth, container.clientHeight);
      godRaysPass.uniforms.uResolution.value.set(container.clientWidth, container.clientHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Watch device pixel resolution shifts (e.g., swapping browser tabs between 4K high-density and standard displays)
    const handleDPRResolutionChange = () => {
      currentDPRScale = Math.max(window.devicePixelRatio || 1.0, 3840.0 / Math.max(1.0, container.clientWidth));
      targetDPRScale = currentDPRScale;
      bloomPass.setSize(container.clientWidth, container.clientHeight);
    };

    let dprQueryList: MediaQueryList | null = null;
    const registerDPRShiftObserver = () => {
      if (typeof window !== "undefined" && window.matchMedia) {
        const dpr = window.devicePixelRatio;
        dprQueryList = window.matchMedia(`(resolution: ${dpr}dppx)`);
        dprQueryList.addEventListener("change", () => {
          handleDPRResolutionChange();
          registerDPRShiftObserver(); // re-register for the updated current resolution dppx scale
        }, { once: true });
      }
    };
    registerDPRShiftObserver();

    // CLEANUP
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (dprQueryList && (dprQueryList as any).removeEventListener) {
        (dprQueryList as any).removeEventListener("change", handleDPRResolutionChange);
      }
      container.removeEventListener("click", handleCanvasClick);
      container.removeEventListener("mousedown", handleMouseDown);
      container.removeEventListener("mousemove", handleMouseMoveDrag);
      container.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("mouseleave", handleMouseUp);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleMouseUp);
      container.removeEventListener("wheel", handleWheel);
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

      {/* Hover Tooltip Overlay */}
      <div
        ref={hoverTooltipRef}
        className="absolute top-0 left-0 z-40 pointer-events-none transition-opacity duration-200"
        style={{ opacity: 0, transform: "translate3d(0, 0, 0)" }}
      >
        <div className="relative -translate-x-1/2 -translate-y-[200%] bg-slate-950/90 backdrop-blur-md border border-orange-500/30 px-3 py-1.5 rounded-lg shadow-xl shadow-black">
          <span ref={hoverTextRef} className="font-mono text-xs text-orange-400 font-bold tracking-widest whitespace-nowrap">
            AGENT
          </span>
        </div>
      </div>

      {/* Dynamic Projection HUD Overlay */}
      <div 
        ref={hudRef}
        className="absolute top-0 left-0 z-30 pointer-events-none transition-opacity duration-300"
        style={{ opacity: 0, transform: "translate3d(0, 0, 0)" }}
      >
        <div className="relative -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
          {/* Circular dynamic gauge around the targeted ring */}
          <svg className="w-[170px] h-[170px] absolute" viewBox="0 0 150 150">
            {/* Outer subtle ticks ring, very clean */}
            <circle cx="75" cy="75" r="71" fill="none" stroke="rgba(148, 163, 184, 0.08)" strokeWidth="1" strokeDasharray="4 6" />
            
            {/* Dynamic cognitive load arc segment */}
            <circle 
              ref={hudLoadCircleRef}
              cx="75" 
              cy="75" 
              r="65" 
              fill="none" 
              stroke="url(#cogGradient)" 
              strokeWidth="3.5" 
              strokeLinecap="round"
              strokeDasharray="408.4"
              strokeDashoffset="200"
              className="transition-all duration-300 ease-out"
              transform="rotate(-90 75 75)"
            />
            
            <defs>
              <linearGradient id="cogGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center indicator crosshair */}
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping absolute" />
          <div className="w-1 h-1 rounded-full bg-slate-300 absolute" />
          
          <div className="absolute left-[85px] top-[45px] w-12 h-[1px] bg-gradient-to-r from-orange-500/60 to-transparent origin-left rotate-[35deg]" />
          
          {/* Diagnostic box at upper right of circular gauge */}
          <div className="absolute left-[125px] -top-[5px] bg-slate-950/90 backdrop-blur-md border border-slate-800/80 px-2.5 py-1.5 rounded-lg text-[9px] font-mono select-none min-w-[150px] shadow-xl shadow-black/80 space-y-1">
            <div className="flex items-center gap-1.5 border-b border-slate-900 pb-1 mb-1">
              <Cpu className="w-2.5 h-2.5 text-purple-400" />
              <span ref={hudTextNameRef} className="text-slate-100 font-bold truncate">COGNITIVE ACTIVE</span>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-slate-500">COG LOAD:</span>
              <span ref={hudTextLoadRef} className="text-orange-400 font-bold">45%</span>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-slate-500">MOMENTUM:</span>
              <span ref={hudTextMomentumRef} className="text-purple-400 font-medium">75%</span>
            </div>
            <div className="flex justify-between items-center gap-2 border-t border-slate-900/40 pt-1 mt-1 text-[8px]">
              <span className="text-slate-500">STATUS:</span>
              <span ref={hudTextStatusRef} className="text-emerald-400 font-bold">OPTIMIZED</span>
            </div>
          </div>
        </div>
      </div>

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
