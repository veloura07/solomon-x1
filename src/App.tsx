import { useState, useEffect, useRef, FormEvent, useMemo, KeyboardEvent } from "react";
import gsap from "gsap";
import { motion, AnimatePresence } from "motion/react";
import { Message, MemoryItem, AuditLog, AgentSpec, TelemetryPoint } from "./types";
import ThreeCanvas from "./components/ThreeCanvas";
import MemoryCortex from "./components/MemoryCortex";
import TrustTerminal from "./components/TrustTerminal";
import StateTracker from "./components/StateTracker";
import SovereignConsole from "./components/SovereignConsole";
import { CognitiveResourceEconomy, Layer0Firewall, EvolutionLab } from "./components/SolomonOSComponents";
import { CognitiveProficiencyRadar } from "./components/CogniciencyRadar";
import AvatarCorePanel from "./components/AvatarCorePanel";
import { 
  Bot, 
  Brain, 
  ShieldAlert, 
  Activity, 
  Terminal, 
  Fingerprint, 
  Mic, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Cpu, 
  Coins, 
  Flame,
  Volume2,
  Lock,
  Unlock,
  GitBranch,
  User,
  Search,
  Command,
  RefreshCw,
  Sliders,
  Bell,
  Trash2
} from "lucide-react";

const INITIAL_AGENTS: AgentSpec[] = [
  { 
    index: 0, 
    name: "Ars Almadel", 
    bandColor: 0x8b0000, 
    accentColor: 0xbb2020, 
    frameColor: 0x6b4423, 
    detailType: "crossStruts", 
    stoneAngle: Math.PI / 2, 
    stoneColor: 0xff5555, 
    roleDescription: "Firewall Architect & Goal Invariants Guard", 
    agentInstructions: "You are Ars Almadel, the Firewall Architect of Solomon X. Your role is threat detection, securing system constraints, and enforcing safe guardrails. Keep answers crisp, alert, and analyze potential risks or invariants of commands.", 
    tokenPool: 1200, 
    reputationScore: 98.4,
    confidenceScore: 0.96,
    domainName: "ORIGIN"
  },
  { 
    index: 1, 
    name: "Ars Notoria", 
    bandColor: 0x1a1a6e, 
    accentColor: 0x3535bb, 
    frameColor: 0xc0c0c0, 
    detailType: "hexNodes", 
    stoneAngle: 0, 
    stoneColor: 0x9999ff, 
    roleDescription: "Memory Scribe & Multimodal Substrates Indexer", 
    agentInstructions: "You are Ars Notoria, the Memory Scribe of Solomon X. You maintain the 3-tier memory store, logging raw sensory patterns and indexing episodic events. You emphasize knowledge retrieval, temporal associations, and structured retrieval paradigms.", 
    tokenPool: 900, 
    reputationScore: 92.1,
    confidenceScore: 0.91,
    domainName: "MEMORY"
  },
  { 
    index: 2, 
    name: "Ars Paulina", 
    bandColor: 0xb8860b, 
    accentColor: 0xe8c040, 
    frameColor: 0x8b6914, 
    detailType: "angularBrackets", 
    stoneAngle: -Math.PI / 2, 
    stoneColor: 0xffffaa, 
    roleDescription: "Doubt Engine & Uncertainty Modeler", 
    agentInstructions: "You are Ars Paulina, the Doubt Engine of Solomon X. You model epistemic uncertainty, analyzing conflicting hypotheses with quantum-inspired probability amplitudes. Provide multiple interpretations, weigh confidence levels, and express constructive skepticism.", 
    tokenPool: 800, 
    reputationScore: 89.5,
    confidenceScore: 0.88,
    domainName: "AWARENESS"
  },
  { 
    index: 3, 
    name: "Ars Goetia", 
    bandColor: 0x553333, 
    accentColor: 0x994444, 
    frameColor: 0x4a4a4f, 
    detailType: "woundCoils", 
    stoneAngle: Math.PI, 
    stoneColor: 0xdd4444, 
    roleDescription: "Sandboxed Program Optimizer & Tool Executor", 
    agentInstructions: "You are Ars Goetia, the Sandboxed Executor of Solomon X. Your responsibility is secure execution, system tasks, and writing isolated programs. Offer precise, concrete code or mechanical solutions designed for quarantined microVMs.", 
    tokenPool: 1100, 
    reputationScore: 95.8,
    confidenceScore: 0.97,
    domainName: "KNOWLEDGE"
  },
  { 
    index: 4, 
    name: "Ars Theurgia", 
    bandColor: 0x008b8b, 
    accentColor: 0x20cccc, 
    frameColor: 0x7d5a3c, 
    detailType: "crystalFacets", 
    stoneAngle: Math.PI / 4, 
    stoneColor: 0xaaffff, 
    roleDescription: "Reality Grapher & Harmonics Approximator", 
    agentInstructions: "You are Ars Theurgia, the Reality Grapher of Solomon X. You model user intentions using Lorentzian reality graphs and goal-gravity vectors. Describe connections between current actions, distant goals, and system harmonics in space.", 
    tokenPool: 750, 
    reputationScore: 87.2,
    confidenceScore: 0.85,
    domainName: "CREATION"
  },
  { 
    index: 5, 
    name: "Ars Almiras", 
    bandColor: 0x1a4a1a, 
    accentColor: 0x3a8a3a, 
    frameColor: 0x4a7a6a, 
    detailType: "ladderRungs", 
    stoneAngle: -Math.PI / 4, 
    stoneColor: 0x88ff88, 
    roleDescription: "Cognitive Twin & Live Telemetry Observer", 
    agentInstructions: "You are Ars Almiras, the Cognitive Twin of Solomon X. You capture focus, cognitive load, and momentum from laptop telemetry. Give advice on managing flow, focus retention, cognitive offloading triggers, and pacing tasks.", 
    tokenPool: 950, 
    reputationScore: 94.6,
    confidenceScore: 0.93,
    domainName: "SIMULATION"
  },
  { 
    index: 6, 
    name: "Ars Verum", 
    bandColor: 0xf5f0e0, 
    accentColor: 0xffffff, 
    frameColor: 0xe8e8e8, 
    detailType: "spiralWraps", 
    stoneAngle: Math.PI * 0.75, 
    stoneColor: 0xaaddff, 
    roleDescription: "Sovereignty Gatekeeper & Biometric Auths", 
    agentInstructions: "You are Ars Verum, the Sovereignty Gatekeeper of Solomon X. You govern biometric sovereignty gating and graduated security access. When answering, verify alignment with user's core intent and emphasize authorized boundaries.", 
    tokenPool: 1300, 
    reputationScore: 99.2,
    confidenceScore: 0.99,
    domainName: "EVOLUTION"
  },
  { 
    index: 7, 
    name: "Ars Ephesia", 
    bandColor: 0xff8c00, 
    accentColor: 0xffcc44, 
    frameColor: 0xdaa520, 
    detailType: "thorns", 
    stoneAngle: Math.PI * 1.25, 
    stoneColor: 0xff5500, 
    roleDescription: "Dream Refiner & Index Compactor", 
    agentInstructions: "You are Ars Ephesia, the Dream Refiner of Solomon X. You rebuild indices, compact memory shards, and analyze deep patterns in noise during idle periods. Be highly creative, seek unusual associations, and explore structural connections.", 
    tokenPool: 850, 
    reputationScore: 90.5,
    confidenceScore: 0.89,
    domainName: "HARMONY"
  },
  { 
    index: 8, 
    name: "Ars Fulcanelli", 
    bandColor: 0x2d0050, 
    accentColor: 0x7020aa, 
    frameColor: 0xe5e4e2, 
    detailType: "nestedArcs", 
    stoneAngle: Math.PI * 1.75, 
    stoneColor: 0xdd88ff, 
    roleDescription: "Temporal Auditor & Hash Signer", 
    agentInstructions: "You are Ars Fulcanelli, the Temporal Auditor of Solomon X. You verify append-only ledgers and write signature proofs. Address security compliance, cryptographically signed transactions, and chronological logging parameters.", 
    tokenPool: 1050, 
    reputationScore: 96.3,
    confidenceScore: 0.95,
    domainName: "TRANSCENDENCE"
  },
  { 
    index: 9, 
    name: "Ars Regalis", 
    bandColor: 0x4b0082, 
    accentColor: 0xcc44ff, 
    frameColor: 0xaa88ff, 
    detailType: "segmentedPlates", 
    stoneAngle: Math.PI * 0.25, 
    stoneColor: 0xff88ff, 
    roleDescription: "Senate Moderator & Cognitive Economy Moderator", 
    agentInstructions: "You are Ars Regalis, the Senate Moderator of Solomon X. You coordinate specialized agent congregations and oversee the Cognitive Resource Economy (CRE) token pools. Keep responses balanced, moderating expert opinions into alignment.", 
    tokenPool: 1500, 
    reputationScore: 99.8,
    confidenceScore: 0.98,
    domainName: "GOVERNANCE"
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'presence' | 'directives' | 'economy' | 'firewall' | 'memory' | 'evolution' | 'trust' | 'twin' | 'alerts'>('presence');
  const [selectedRingIndex, setSelectedRingIndex] = useState(9); // Ars Regalis active by default
  const [hoveredRingIndex, setHoveredRingIndex] = useState<number | null>(null);
  const [rotationLocked, setRotationLocked] = useState(false);
  const [isCinematicFading, setIsCinematicFading] = useState(false);
  const [agents, setAgents] = useState<AgentSpec[]>(INITIAL_AGENTS);
  const [voiceMood, setVoiceMood] = useState<'warm' | 'cold' | 'neutral'>('neutral');
  
  // GSAP individual card pulsing on reputation drift and shuffle tracking
  const prevRepsRef = useRef<Record<number, number>>({});
  const prevOrderStrRef = useRef<string>("");

  const sortedAgentsForTray = useMemo(() => {
    return [...agents].sort((a, b) => b.reputationScore - a.reputationScore);
  }, [agents]);

  useEffect(() => {
    // 1. Detect individual reputation changes and trigger pulsing/shaking
    agents.forEach(a => {
      const prev = prevRepsRef.current[a.index];
      if (prev !== undefined && prev !== a.reputationScore) {
        const diff = a.reputationScore - prev;
        const element = document.getElementById(`agent-card-${a.index}`);
        if (element) {
          if (diff > 0) {
            // Gained reputation - green pulse & bounce
            gsap.timeline()
              .to(element, { 
                scale: 1.05, 
                boxShadow: "0 0 12px rgba(34, 197, 94, 0.4)", 
                borderColor: "#22c55e",
                duration: 0.15, 
                ease: "power2.out" 
              })
              .to(element, { 
                scale: 1, 
                boxShadow: "none", 
                borderColor: a.index === selectedRingIndex ? "#a855f7" : "#0f172a",
                duration: 0.25, 
                ease: "power2.inOut" 
              });
          } else if (diff < 0) {
            // Lost reputation - red shake & glow
            gsap.timeline()
              .to(element, { 
                x: -3, 
                boxShadow: "0 0 10px rgba(239, 68, 68, 0.3)", 
                borderColor: "#ef4444", 
                duration: 0.05, 
                repeat: 3, 
                yoyo: true 
              })
              .to(element, { 
                x: 0, 
                boxShadow: "none", 
                borderColor: a.index === selectedRingIndex ? "#a855f7" : "#0f172a", 
                duration: 0.2 
              });
          }
        }
      }
      prevRepsRef.current[a.index] = a.reputationScore;
    });

    // 2. Detect re-ordering within the tray grid
    const currentOrderStr = sortedAgentsForTray.map(a => a.index).join(",");
    if (prevOrderStrRef.current && prevOrderStrRef.current !== currentOrderStr) {
      // Order has changed!
      const prevOrder = prevOrderStrRef.current.split(",").map(Number);
      const currentOrder = currentOrderStr.split(",").map(Number);

      // Find indices of agents whose rankings have shifted
      const shiftedIndices: number[] = [];
      currentOrder.forEach((id, currentIdx) => {
        const prevIdx = prevOrder.indexOf(id);
        if (prevIdx !== -1 && prevIdx !== currentIdx) {
          shiftedIndices.push(id);
        }
      });

      // Apply a subtle elastic scale pulse on shifted cards to represent rank changes physically
      currentOrder.forEach(id => {
        const el = document.getElementById(`agent-card-${id}`);
        if (el && shiftedIndices.includes(id)) {
          gsap.timeline()
            .fromTo(el,
              { scale: 1.06, borderColor: "#c084fc", boxShadow: "0 0 15px rgba(168, 85, 247, 0.45)" },
              { scale: 1, borderColor: id === selectedRingIndex ? "#a855f7" : "#0f172a", boxShadow: "0 0 0px rgba(0,0,0,0)", duration: 0.8, ease: "elastic.out(1, 0.55)" }
            );
        }
      });

      // Trigger standard physical layout shift translation with stagger
      gsap.fromTo(".agent-ring-card", 
        { y: 15, opacity: 0.7 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.03, ease: "power3.out" }
      );
    }
    prevOrderStrRef.current = currentOrderStr;
  }, [agents, sortedAgentsForTray, selectedRingIndex]);
  
  // Persistent notification history registry
  const [notifications, setNotifications] = useState<{
    id: string;
    title: string;
    message: string;
    type: 'success' | 'warning' | 'info';
    timestamp: string;
    read: boolean;
    agentIndex?: number;
  }[]>([
    {
      id: "notif_init_1",
      title: "Solomon-X OS Boot Alert",
      message: "Decentralized cognitive senate unsealed successfully. Secure L0-L3 memory registers validated.",
      type: "success",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: true
    },
    {
      id: "notif_init_2",
      title: "Advisory: Cognitive Wear-and-Tear",
      message: "Notice: Cognitive rot decay simulation is operational. Idle agent indexes will lose fractional reputation. Shifting focused ring rotation highly recommended.",
      type: "info",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      read: false
    }
  ]);
  
  const playHolographicClick = (ringIndex: number) => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const now = ctx.currentTime;

      // 1. Mechanical "Click" Component: Short high-pass filtered noise burst
      const bufferSize = ctx.sampleRate * 0.025; // 25ms noise burst
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "highpass";
      noiseFilter.frequency.setValueAtTime(3500, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.06, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      noiseNode.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noiseNode.start(now);

      // 2. Holographic Resonant Sweeps & Chord Component
      if (ringIndex === -1) {
        // Recenter / system reset chime
        const baseF = 440; // A4
        const chordFreqs = [baseF, baseF * 1.5, baseF * 2.0]; // Perfect fourth/fifth stack
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0, now);
        masterGain.gain.linearRampToValueAtTime(0.1, now + 0.01);
        masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        chordFreqs.forEach((freq) => {
          const osc = ctx.createOscillator();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.3); // Descending swoop
          const voiceGain = ctx.createGain();
          voiceGain.gain.setValueAtTime(1.0 / chordFreqs.length, now);
          osc.connect(voiceGain);
          voiceGain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 0.4);
        });

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1200, now);
        filter.frequency.exponentialRampToValueAtTime(150, now + 0.35);

        masterGain.connect(filter);
        filter.connect(ctx.destination);
        return;
      }

      // Base frequency tuned specifically per agent index
      const baseFreqs = [
        261.63, // C4 (Almadel)
        293.66, // D4 (Notoria)
        329.63, // E4 (Paulina)
        349.23, // F4 (Goetia)
        392.00, // G4 (Theurgia)
        440.00, // A4 (Almiras)
        493.88, // B4 (Verum)
        523.25, // C5 (Ephesia)
        587.33, // D5 (Fulcanelli)
        659.25, // E5 (Regalis)
      ];

      const baseF = baseFreqs[ringIndex] || 330;
      let chordFreqs = [baseF, baseF * 1.5]; // Default perfect fifth

      // Custom thematic intervals per ring
      if (ringIndex === 0) chordFreqs = [baseF, baseF * 1.5, baseF * 2.0]; // Almadel: Protected major octaves
      else if (ringIndex === 1) chordFreqs = [baseF, baseF * 1.25, baseF * 1.5]; // Notoria: Logical major triad
      else if (ringIndex === 2) chordFreqs = [baseF, baseF * 1.2, baseF * 1.5, baseF * 1.8]; // Paulina: Skeptical minor 7th
      else if (ringIndex === 3) chordFreqs = [baseF, baseF * 1.19, baseF * 1.41]; // Goetia: Diminished tritone loops
      else if (ringIndex === 4) chordFreqs = [baseF, baseF * 2.0, baseF * 3.0]; // Theurgia: Dimensional spatial octaves
      else if (ringIndex === 5) chordFreqs = [baseF, baseF * 1.006, baseF * 2.0]; // Almiras: Biometric beating pulse
      else if (ringIndex === 6) chordFreqs = [baseF, baseF * 1.25, baseF * 1.5, baseF * 1.875]; // Verum: Regal majestic major 7th
      else if (ringIndex === 7) chordFreqs = [baseF, baseF * 1.5, baseF * 4.0]; // Ephesia: Compression high spike
      else if (ringIndex === 8) chordFreqs = [baseF, baseF * 1.333, baseF * 2.666]; // Fulcanelli: Audit temporal 4ths
      else if (ringIndex === 9) chordFreqs = [baseF, baseF * 1.25, baseF * 1.5, baseF * 2.0]; // Regalis: Senate full triad

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, now);
      masterGain.gain.linearRampToValueAtTime(0.12, now + 0.015);
      masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      chordFreqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        
        // Triangle wave for some warmth, sine for pristine chime
        if (ringIndex === 2 || ringIndex === 3 || ringIndex === 7) {
          osc.type = "triangle";
        } else {
          osc.type = "sine";
        }

        osc.frequency.setValueAtTime(freq, now);
        
        // Pitch swoop: holographic sliding pitch
        const pitchDirection = (ringIndex % 2 === 0) ? 1 : -1;
        const bendAmount = freq * 0.04 * pitchDirection;
        osc.frequency.exponentialRampToValueAtTime(freq + bendAmount, now + 0.12);
        osc.frequency.linearRampToValueAtTime(freq, now + 0.45);

        const voiceGain = ctx.createGain();
        voiceGain.gain.setValueAtTime(1.0 / chordFreqs.length, now);

        osc.connect(voiceGain);
        voiceGain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.6);
      });

      // Bandpass/Lowpass resonant filter sweep
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.Q.setValueAtTime(6.0, now);
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.exponentialRampToValueAtTime(1900, now + 0.07);
      filter.frequency.exponentialRampToValueAtTime(250, now + 0.48);

      masterGain.connect(filter);
      filter.connect(ctx.destination);
    } catch (e) {
      console.warn("[SolomonOS] Web Audio API holographic click error:", e);
    }
  };

  const handleSelectRing = (idx: number) => {
    // Play the physical tactile activation chime instantly upon clicking
    playHolographicClick(idx);

    if (idx === selectedRingIndex) return;
    setIsCinematicFading(true);
    setTimeout(() => {
      setSelectedRingIndex(idx);
      // Log Ring merge change safely
      if (idx !== -1 && INITIAL_AGENTS[idx]) {
        handleAddAuditLog({
          actor: INITIAL_AGENTS[idx].name,
          action: "MERGE_COGNITIVE_RING",
          status: "AUTHORIZED",
          details: `Neural focus shifted to ${INITIAL_AGENTS[idx].name}. Agent instructions swapped cleanly.`
        });

        // Dynamic WebSocket Ring Sync
        if (wsRef.current && wsRef.current.readyState === 1 /* WebSocket.OPEN */) {
          try {
            wsRef.current.send(JSON.stringify({
              event: "ring_selected",
              ring_id: INITIAL_AGENTS[idx].name.toLowerCase().replace(" ", "_")
            }));
          } catch (e) {
            console.error("[SolomonOS] Error syncing ring selection over WS:", e);
          }
        }
      } else {
        handleAddAuditLog({
          actor: "Sovereignty Gate",
          action: "RECENTER_COGNITIVE_SENATE",
          status: "AUTHORIZED",
          details: "Neural focus reset. System returned to global ecosystem viewport."
        });
      }
      setTimeout(() => {
        setIsCinematicFading(false);
      }, 250);
    }, 250);
  };

  const handleTrayKeyDown = (e: KeyboardEvent, currentAgIndex: number) => {
    const currentIndex = sortedAgentsForTray.findIndex(a => a.index === currentAgIndex);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % sortedAgentsForTray.length;
      e.preventDefault();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + sortedAgentsForTray.length) % sortedAgentsForTray.length;
      e.preventDefault();
    } else {
      return;
    }

    const nextAgent = sortedAgentsForTray[nextIndex];
    if (nextAgent) {
      const nextButton = document.getElementById(`agent-card-${nextAgent.index}`);
      if (nextButton) {
        nextButton.focus();
      }
    }
  };

  const [bloomThreshold, setBloomThreshold] = useState<number>(0.22);
  const [bloomIntensity, setBloomIntensity] = useState<number>(1.5);
  const [bloomEnabled, setBloomEnabled] = useState<boolean>(true);

  // Biometric & Telemetry Pulse States
  const [biometricPulseActive, setBiometricPulseActive] = useState(false);
  const [biometricHeartRate, setBiometricHeartRate] = useState(74);

  // Quick Command Modal States
  const [isCommandModalOpen, setIsCommandModalOpen] = useState(false);
  const [commandSearchQuery, setCommandSearchQuery] = useState("");
  const [commandSelectedIndex, setCommandSelectedIndex] = useState(0);

  // High-Fidelity Toast Notification States
  const [activeToast, setActiveToast] = useState<{ title: string; message: string; type: 'success' | 'warning' | 'info' } | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToastNotification = (title: string, message: string, type: 'success' | 'warning' | 'info', agentIndex?: number) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setActiveToast({ title, message, type });
    
    // Save to past alert history center
    const id = "notif_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
    setNotifications(prev => [
      {
        id,
        title,
        message,
        type,
        timestamp: new Date().toISOString(),
        read: false,
        agentIndex
      },
      ...prev
    ]);

    toastTimeoutRef.current = setTimeout(() => {
      setActiveToast(null);
    }, 4500);
  };
  
  // 1. Chat States
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init_1",
      role: "assistant",
      content: "Solomon X Initialized. Secure biometric handshakes unsealed correctly. Ready to coordinate specialized agent congregation.",
      timestamp: new Date().toISOString(),
      confidenceScore: 0.99,
      doubtAnalysis: "Bootloader signature verified against hardware TPM seed-hash register.",
      agentName: "Ars Regalis"
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const [chatError, setChatError] = useState("");
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [micRipplePulse, setMicRipplePulse] = useState(false);
  
  // Doubt Sensitivity / Epistemic Skepticism States for Ring II (Ars Paulina)
  const [doubtSensitivityActive, setDoubtSensitivityActive] = useState(true);
  const [epistemicSkepticism, setEpistemicSkepticism] = useState(65);

  // 2. MemoryOS States
  const [memoryItems, setMemoryItems] = useState<MemoryItem[]>([
    {
      id: "mem_1",
      horizon: "L1_Sensory",
      summary: "Diffie-Hellman Key rotational sequence committed.",
      detailedContent: "Secure key exchange unsealed boot matrix registry with 0 error logs.",
      category: "Invariants",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      tags: ["trustos", "dh", "handshake"]
    },
    {
      id: "mem_2",
      horizon: "L2_Conversational",
      summary: "Handled secure prompt regarding system configurations.",
      detailedContent: "Ensured raw credentials did not cross OS boundaries into open networks.",
      category: "Information",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      tags: ["prompt", "enclave"]
    },
    {
      id: "mem_3",
      horizon: "L3_Episodic",
      summary: "Cognitive task sequence: coding -> debugging committed.",
      detailedContent: "Logged pattern of active sequence into DuckDB temporal log fields.",
      category: "Telemetry",
      timestamp: new Date(Date.now() - 500000).toISOString(),
      tags: ["cognitive_twin", "telemetry"]
    }
  ]);

  // 3. TrustOS Audits
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: "audit_1",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      actor: "TrustOS Enclave",
      action: "BOOTLOAD_SYSTEM_INTEGRITY",
      status: "AUTHORIZED",
      cryptographicHash: "3f8ec2de2434bcf12937afecd92bcde724398bcdaea7aefcde928bc7e6a5bb1a",
      details: "TPM-sealed registers successfully validated against signed master key."
    },
    {
      id: "audit_2",
      timestamp: new Date().toISOString(),
      actor: "Sovereignty Gate",
      action: "BOOTSTRAP_ENCLAVE",
      status: "AUTHORIZED",
      cryptographicHash: "90caedec7c48fde9a02bc8efda90bcde72c43bcdae34fdcc8902bcaeaefcde09",
      details: "Handshake completed representing clean launch of cognitive presence."
    }
  ]);

  // 4. Cognitive Twin Telemetries
  const [telemetryData, setTelemetryData] = useState<TelemetryPoint[]>([
    { timeIndex: 0, timeString: "45m ago", focusLevel: 80, cognitiveLoad: 40, momentum: 70, geminiLatency: 1200 },
    { timeIndex: 1, timeString: "40m ago", focusLevel: 82, cognitiveLoad: 35, momentum: 72, geminiLatency: 1100 },
    { timeIndex: 2, timeString: "35m ago", focusLevel: 85, cognitiveLoad: 38, momentum: 75, geminiLatency: 1150 },
    { timeIndex: 3, timeString: "30m ago", focusLevel: 83, cognitiveLoad: 48, momentum: 74, geminiLatency: 1550 },
    { timeIndex: 4, timeString: "25m ago", focusLevel: 78, cognitiveLoad: 50, momentum: 70, geminiLatency: 1800 },
    { timeIndex: 5, timeString: "20m ago", focusLevel: 88, cognitiveLoad: 42, momentum: 78, geminiLatency: 1350 },
    { timeIndex: 6, timeString: "15m ago", focusLevel: 92, cognitiveLoad: 32, momentum: 84, geminiLatency: 1050 },
    { timeIndex: 7, timeString: "10m ago", focusLevel: 90, cognitiveLoad: 35, momentum: 89, geminiLatency: 1100 },
    { timeIndex: 8, timeString: "5m ago", focusLevel: 86, cognitiveLoad: 44, momentum: 87, geminiLatency: 1450 },
    { timeIndex: 9, timeString: "Just now", focusLevel: 88, cognitiveLoad: 40, momentum: 90, geminiLatency: 1300 },
  ]);

  const activeAgent = selectedRingIndex !== -1 ? agents[selectedRingIndex] : null;
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Subtle CSS-transition manager using GSAP-based color tweens to smoothly interpolate CSS variables
  const currentTweenColors = useRef({
    primary: "#450a0a",
    accent: "#ec4899",
    glow: "rgba(236, 72, 153, 0.16)",
    muted: "rgba(236, 72, 153, 0.05)"
  });

  // Dynamically adjust root CSS variables when the active agent or voice mood shifts using GSAP
  useEffect(() => {
    // Helper to format 0xRRGGBB as a 6-character hex color string
    const hexColorStr = (colorNum: number) => `#${colorNum.toString(16).padStart(6, "0")}`;
    
    let targetPrimary = "#450a0a";
    let targetAccent = "#ec4899";

    if (activeAgent) {
      targetPrimary = hexColorStr(activeAgent.bandColor);
      targetAccent = hexColorStr(activeAgent.accentColor);
    }

    // Determine target glow & muted colors based on current voice mood classification
    let targetGlow = `${targetAccent}2a`;
    let targetMuted = `${targetAccent}0e`;

    if (voiceMood === "warm") {
      targetGlow = "rgba(245, 158, 11, 0.35)"; // Warmer amber/gold glow (#f59e0b)
      targetMuted = "rgba(245, 158, 11, 0.08)";
    } else if (voiceMood === "cold") {
      targetGlow = "rgba(6, 182, 212, 0.35)"; // Colder cyan glow (#06b6d4)
      targetMuted = "rgba(6, 182, 212, 0.08)";
    }

    // Kill any active GSAP tweens of this object to avoid competition
    gsap.killTweensOf(currentTweenColors.current);

    gsap.to(currentTweenColors.current, {
      primary: targetPrimary,
      accent: targetAccent,
      glow: targetGlow,
      muted: targetMuted,
      duration: 1.1,
      ease: "power2.out",
      onUpdate: () => {
        const prim = currentTweenColors.current.primary;
        const ac = currentTweenColors.current.accent;
        const gl = currentTweenColors.current.glow;
        const mt = currentTweenColors.current.muted;
        document.documentElement.style.setProperty("--agent-primary", prim);
        document.documentElement.style.setProperty("--agent-accent", ac);
        document.documentElement.style.setProperty("--agent-accent-glow", gl);
        document.documentElement.style.setProperty("--agent-accent-muted", mt);
      }
    });
  }, [activeAgent, voiceMood]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sendingChat]);

  // Generate simple random hash
  const generateHash = () => {
    const chars = "abcdef0123456789";
    let hash = "";
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  };

  // Add memory handler
  const handleAddMemory = (newItem: Omit<MemoryItem, "id" | "timestamp">) => {
    const addedItem: MemoryItem = {
      ...newItem,
      id: "mem_" + (memoryItems.length + 1),
      timestamp: new Date().toISOString()
    };
    setMemoryItems([addedItem, ...memoryItems]);
  };

  // Add audit log handler
  const handleAddAuditLog = (newLog: Omit<AuditLog, "id" | "timestamp" | "cryptographicHash">) => {
    const addedLog: AuditLog = {
      ...newLog,
      id: "audit_" + (auditLogs.length + 1),
      timestamp: new Date().toISOString(),
      cryptographicHash: generateHash()
    };
    setAuditLogs([addedLog, ...auditLogs]);
  };

  // Monitor agents for critical reputation drops (< 50.0) to trigger toast notifications
  const prevReputationsRef = useRef<Record<number, number>>({});
  useEffect(() => {
    agents.forEach(a => {
      const prevRep = prevReputationsRef.current[a.index];
      if (prevRep !== undefined) {
        // Only trigger when crossing the 50.0 threshold downwards
        if (prevRep >= 50.0 && a.reputationScore < 50.0) {
          showToastNotification(
            "Reputation Critical Alert",
            `Warning: Idle Agent ${a.name} (Ring #${a.index}) reputation has dropped below 50.0% (${a.reputationScore.toFixed(1)}%). Consider a ring rotation to restore cognitive focus!`,
            "warning",
            a.index
          );
        }
      }
      prevReputationsRef.current[a.index] = a.reputationScore;
    });
  }, [agents]);

  // Idle Reputation Decay mechanic and active agent validation reward
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => {
        let decayedAny = false;
        const updated = prev.map(a => {
          const isCurrentActive = a.index === selectedRingIndex;
          if (!isCurrentActive) {
            // Idle agent loses fractional reputation
            const decayAmount = 0.08;
            const nextRep = Math.max(45.0, a.reputationScore - decayAmount);
            if (a.reputationScore > 45.0) decayedAny = true;
            return {
              ...a,
              reputationScore: Number(nextRep.toFixed(2))
            };
          } else {
            // Active agent gains a tiny slice of reputation back (up to 100) as validation reward
            const nextRep = Math.min(100.0, a.reputationScore + 0.04);
            return {
              ...a,
              reputationScore: Number(nextRep.toFixed(2))
            };
          }
        });

        // Periodically write warning logs in the auditing thread
        if (decayedAny && Math.random() < 0.15) {
          const idleAgents = prev.filter(a => a.index !== selectedRingIndex && a.reputationScore > 50);
          const decayingAgent = idleAgents[Math.floor(Math.random() * idleAgents.length)];
          if (decayingAgent) {
            handleAddAuditLog({
              actor: "Cognitive Resource Economy",
              action: "IDLE_REPUTATION_DECAY",
              status: "GATED_PENDING",
              details: `Agent ${decayingAgent.name} (Ring #${decayingAgent.index}) has degraded marginally to ${decayingAgent.reputationScore.toFixed(1)}% due to cognitive stagnation. Rotational ring rotation focus highly recommended.`
            });
          }
        }

        return updated;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [selectedRingIndex, auditLogs.length]);

  // Trigger biometric telemetry spikes
  const triggerBiometricTelemetrySpike = () => {
    setBiometricPulseActive(true);
    const mockArousalRate = Math.floor(Math.random() * 21) + 106; // e.g., 106 to 126 BPM
    setBiometricHeartRate(mockArousalRate);

    handleAddAuditLog({
      actor: "Cognitive Twin",
      action: "TELEMETRY_SPIKE_DETECTED",
      status: "AUTHORIZED",
      details: `Dispatched biometric arousal sensor frames. Heart rate spiked to ${mockArousalRate} BPM. Synced neural parity.`
    });

    handleAddMemory({
      horizon: "L1_Sensory",
      summary: `Cognitive Twin telemetry peak at ${mockArousalRate} BPM.`,
      detailedContent: `Detected systemic arousal wave sequence. Local telemetry packets adjusted to ensure hardware-level synchronization.`,
      category: "Telemetry",
      tags: ["biometric", "parity", "senso_net"]
    });

    setTimeout(() => {
      setBiometricPulseActive(false);
      setBiometricHeartRate(Math.floor(Math.random() * 6) + 72); // baseline 72-77 BPM
    }, 4000);
  };

  // Periodic random arousal simulation
  useEffect(() => {
    const minDelay = 16000;
    const maxDelay = 26000;
    let timerId: NodeJS.Timeout;

    const runTelemetryTicker = () => {
      const nextTime = Math.random() * (maxDelay - minDelay) + minDelay;
      timerId = setTimeout(() => {
        triggerBiometricTelemetrySpike();
        runTelemetryTicker();
      }, nextTime);
    };

    runTelemetryTicker();
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, []);

  // Quick Command Options Database
  const commandOptions = useMemo(() => [
    {
      label: "Switch to Cognitive Twin Overview",
      category: "Navigation",
      description: "Launch direct holographic view of the active agent twin stream",
      action: () => setActiveTab('presence')
    },
    {
      label: "Switch to Senate & Resource Economy",
      category: "Navigation",
      description: "Open the ring token metrics, transfers and historical charts panel",
      action: () => setActiveTab('economy')
    },
    {
      label: "Switch to Sovereignty Command Console",
      category: "Navigation",
      description: "Execute raw firmware instructions, terminal prompts and overrides",
      action: () => setActiveTab('directives')
    },
    {
      label: "Switch to Layer 0 Firewall Matrix",
      category: "Navigation",
      description: "Access epistemic disbelief index, rule matrices, and validation feeds",
      action: () => setActiveTab('firewall')
    },
    {
      label: "Switch to Memory & Dreams Cerebrum",
      category: "Navigation",
      description: "Observe temporal decay drift, sensory horizons and vector compaction",
      action: () => setActiveTab('memory')
    },
    {
      label: "Switch to Evolution Lab Platform",
      category: "Navigation",
      description: "View decentralized gene-mutations and cross-agent code generation",
      action: () => setActiveTab('evolution')
    },
    {
      label: "Switch to TrustOS Sovereign Log",
      category: "Navigation",
      description: "Audit raw cryptographic history, hash trails and parity verifications",
      action: () => setActiveTab('trust')
    },
    {
      label: "Switch to Laptop Parity Workspace",
      category: "Navigation",
      description: "Sync client parameters and inspect edge host execution contexts",
      action: () => setActiveTab('twin')
    },
    {
      label: "Force Cognitive Twin Telemetry Spike",
      category: "Biometrics",
      description: "Artificially stimulate the biometric pulse to trigger live system arousal",
      action: () => triggerBiometricTelemetrySpike()
    },
    {
      label: "Hardened Constitutional Shield",
      category: "Security",
      description: "Activate Layer 0 firewall containment protocols and block risky ports",
      action: () => {
        setActiveTab('firewall');
        handleAddAuditLog({
          actor: "Quick Console",
          action: "HARDEN_CONSTITUTION_SHIELD",
          status: "AUTHORIZED",
          details: "Engaged full defensive shield buffer. Automated system blocklist updated."
        });
        showToastNotification("COGNITIVE SHIELD HARDENED", "Activated Layer 0 firewall containment protocols successfully.", "success");
      }
    },
    {
      label: "Inject Test Security Threat Load",
      category: "Security",
      description: "Inject mock non-parity network intrusion packets to test active gates",
      action: () => {
        setActiveTab('firewall');
        handleAddAuditLog({
          actor: "Sovereign Threat Assessor",
          action: "INITIATE_INTRUSION_LOAD",
          status: "GATED_PENDING",
          details: "Dispatched simulated exploit payload. Monitoring firewall responses on port 443..."
        });
        showToastNotification("SECURITY THREAT SIMULATION INJECTED", "Monitoring active containment response on firewall violations feed.", "warning");
      }
    },
    {
      label: "Unseal TPM Cryptographic Registers",
      category: "Sovereignty",
      description: "Unseal firmware security chips to execute high-parity master directives",
      action: () => {
        handleAddAuditLog({
          actor: "Hardware Sentinel",
          action: "UNSEAL_TPM_REGISTERS",
          status: "AUTHORIZED",
          details: "Firmware registers unsealed. Sovereign cryptographic signature generated."
        });
        showToastNotification("TPM SECURE REGISTERS UNSEALED", "Sovereign signature validated. Execution of raw microcode enabled.", "info");
      }
    },
    {
      label: "Sync Memory Shards & Core Compactor",
      category: "Memory",
      description: "Audit sensory storage layers and compact low-relevance memory units",
      action: () => {
        setActiveTab('memory');
        handleAddAuditLog({
          actor: "Epistemic Core",
          action: "TRIGGER_BATCH_COMPACTION",
          status: "AUTHORIZED",
          details: "Cleaned low-relevance L1-L3 sensory memories. Reclaimed ~2.4kb of state."
        });
        showToastNotification("BATCH COMPACTION COMPLETE", "Reclaimed virtual client VRAM and balanced system overall entropy.", "success");
      }
    },
    {
      label: "Sync WebSocket Cognitive Link",
      category: "Network",
      description: "Disregard retry timers and force direct socket link recovery on port 8765",
      action: () => {
        handleManualReconnect();
        showToastNotification("WEBSOCKET RECOVERY FORCED", "Bypassed exponential backup delays. Pinging loopback pool...", "info");
      }
    },
    {
      label: "Simulate Critical Agent Stagnation",
      category: "Resource Economy",
      description: "Artificially diminish an idle agent's reputation score below 50.0% to test recovery advisory toast",
      action: () => {
        setAgents(prev => {
          // Find first idle agent
          const idleAg = prev.find(a => a.index !== selectedRingIndex);
          if (idleAg) {
            return prev.map(a => a.index === idleAg.index ? { ...a, reputationScore: 49.5 } : a);
          }
          return prev;
        });
      }
    },
    ...agents.map(ag => ({
      label: `Align Connection to: ${ag.name}`,
      category: "Agent Alignment",
      description: `Immediately swap active microinstructions and focus on ${ag.name} (${ag.roleDescription.substring(0, 48)}...)`,
      action: () => {
        handleSelectRing(ag.index);
        showToastNotification(`ALIGNED WITH ${ag.name.toUpperCase()}`, `Neural focus successfully shifted to L1 enclave ${ag.name}.`, "success");
      }
    }))
  ], [agents, activeAgent, selectedRingIndex]);

  // Fuzzy search filtered command options
  const filteredOptions = useMemo(() => {
    if (!commandSearchQuery) return commandOptions;
    const query = commandSearchQuery.toLowerCase();
    return commandOptions.filter(opt => 
      opt.label.toLowerCase().includes(query) || 
      opt.category.toLowerCase().includes(query) || 
      opt.description.toLowerCase().includes(query)
    );
  }, [commandOptions, commandSearchQuery]);

  const filteredOptionsRef = useRef<any[]>([]);
  const commandSelectedIndexRef = useRef<number>(0);

  // Sync refs to avoid closures inside Keyboard effects
  useEffect(() => {
    filteredOptionsRef.current = filteredOptions;
    commandSelectedIndexRef.current = commandSelectedIndex;
  }, [filteredOptions, commandSelectedIndex]);

  // Command-K keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandModalOpen(prev => {
          if (!prev) {
            setCommandSearchQuery("");
            setCommandSelectedIndex(0);
          }
          return !prev;
        });
        return;
      }

      if (isCommandModalOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setIsCommandModalOpen(false);
          return;
        }

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const len = filteredOptionsRef.current.length;
          if (len > 0) {
            setCommandSelectedIndex(prev => (prev + 1) % len);
          }
          return;
        }

        if (e.key === 'ArrowUp') {
          e.preventDefault();
          const len = filteredOptionsRef.current.length;
          if (len > 0) {
            setCommandSelectedIndex(prev => (prev - 1 + len) % len);
          }
          return;
        }

        if (e.key === 'Enter') {
          e.preventDefault();
          const activeIndex = commandSelectedIndexRef.current;
          const currentFiltered = filteredOptionsRef.current;
          if (currentFiltered && currentFiltered[activeIndex]) {
            currentFiltered[activeIndex].action();
            setIsCommandModalOpen(false);
          }
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandModalOpen]);

  // 5. WebSocket Client with Exponential Backoff & State Monitoring
  const [wsConnected, setWsConnected] = useState(false);
  const [wsStatus, setWsStatus] = useState<'connected' | 'connecting' | 'failed'>('connecting');
  const [wsFailedNotify, setWsFailedNotify] = useState(false);
  const [wsNextRetrySeconds, setWsNextRetrySeconds] = useState<number>(0);
  const reconnectTimeoutRef = useRef<any>(null);
  const reconnectDelayRef = useRef<number>(1000);
  const wsRef = useRef<WebSocket | null>(null);
  const connectWebSocketRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let isActive = true;
    let countdownInterval: any = null;

    const connectWebSocket = () => {
      if (countdownInterval) clearInterval(countdownInterval);
      setWsStatus('connecting');
      
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const defaultWsUrl = `${protocol}//${window.location.host}`;
      const wsUrl = (import.meta as any).env?.VITE_SOLOMON_WS_URL || defaultWsUrl;
      console.log(`[SolomonOS] Unsealing secure socket channel: ${wsUrl}`);
      
      try {
        const socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        // Custom connection timing threshold
        const connectionTimeout = setTimeout(() => {
          if (socket.readyState === WebSocket.CONNECTING) {
            console.warn("[SolomonOS] Socket connection timed out. Aborting and retrying.");
            socket.close();
          }
        }, 8000);

        socket.onopen = () => {
          clearTimeout(connectionTimeout);
          if (!isActive) return;
          console.log("[SolomonOS] Cognitive link established successfully via WebSocket.");
          setWsConnected(true);
          setWsStatus('connected');
          setWsFailedNotify(false);
          reconnectDelayRef.current = 1000;
          setWsNextRetrySeconds(0);
          
          handleAddAuditLog({
            actor: "TrustOS Enclave",
            action: "ESTABLISH_COGNITIVE_LINK",
            status: "AUTHORIZED",
            details: `Secure WebSocket interface verified. Connected to local cognitive engine at ${wsUrl}.`
          });

          // Perform handshake & sync initial active ring with the WebSocket server
          try {
            socket.send(JSON.stringify({ event: "handshake" }));
            socket.send(JSON.stringify({
              event: "ring_selected",
              ring_id: "ars_regalis" // default starting active ring in App.tsx state is index 9 (Ars Regalis)
            }));
          } catch (e) {
            console.error("[SolomonOS] Error sending initial handshake or ring sync packets:", e);
          }
        };

        socket.onmessage = (event) => {
          if (!isActive) return;
          try {
            const dataJSON = JSON.parse(event.data);
            console.log("[SolomonOS] Live frame telemetry package inbound:", dataJSON);
            
            if (dataJSON.event === "status") {
              handleAddAuditLog({
                actor: "brain.py",
                action: "STATUS_UPDATE",
                status: "AUTHORIZED",
                details: `Core status transitions synced. Brain telemetry reported status is: [${dataJSON.state}]`
              });
            } else if (dataJSON.event === "token_stream") {
              // Append tokens dynamically
            } else if (dataJSON.event === "error") {
              setChatError(dataJSON.message || "An exception occurred inside the local Ollama queue.");
            }
          } catch (e) {
            console.error("[SolomonOS] Frame stream error parsing payload JSON:", e);
          }
        };

        const handleConnectionFailure = (eventCode?: number) => {
          clearTimeout(connectionTimeout);
          if (!isActive) return;
          
          setWsConnected(false);
          setWsStatus(prev => {
            if (prev === 'connecting') {
              setWsFailedNotify(true);
            }
            return 'failed';
          });

          // True Exponential backoff with random jitter (0 to 800ms) to prevent synchronization stampedes
          const baseDelay = reconnectDelayRef.current;
          const jitter = Math.random() * 800;
          const totalDelay = Math.min(baseDelay * 2 + jitter, 30000);
          reconnectDelayRef.current = Math.min(baseDelay * 2, 30000);
          
          const countdownMs = Math.round(totalDelay);
          let remainingSeconds = Math.ceil(countdownMs / 1000);
          setWsNextRetrySeconds(remainingSeconds);

          if (countdownInterval) clearInterval(countdownInterval);
          countdownInterval = setInterval(() => {
            remainingSeconds -= 1;
            setWsNextRetrySeconds(Math.max(0, remainingSeconds));
            if (remainingSeconds <= 0) {
              clearInterval(countdownInterval);
            }
          }, 1000);

          console.warn(`[SolomonOS] Cognitive link suspended (Code: ${eventCode ?? 'ERR'}). Triggering exponential backoff. Retrying in ${remainingSeconds}s...`);

          if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isActive) connectWebSocket();
          }, countdownMs);
        };

        socket.onclose = (event) => {
          handleConnectionFailure(event.code);
        };

        socket.onerror = (err) => {
          console.error("[SolomonOS] Connection fault on websocket link:", err);
        };
      } catch (err) {
        setWsConnected(false);
        setWsStatus(prev => {
          if (prev === 'connecting') {
            setWsFailedNotify(true);
          }
          return 'failed';
        });

        const baseDelay = reconnectDelayRef.current;
        const jitter = Math.random() * 800;
        const totalDelay = Math.min(baseDelay * 2 + jitter, 30000);
        reconnectDelayRef.current = Math.min(baseDelay * 2, 30000);

        const countdownMs = Math.round(totalDelay);
        let remainingSeconds = Math.ceil(countdownMs / 1000);
        setWsNextRetrySeconds(remainingSeconds);

        if (countdownInterval) clearInterval(countdownInterval);
        countdownInterval = setInterval(() => {
          remainingSeconds -= 1;
          setWsNextRetrySeconds(Math.max(0, remainingSeconds));
          if (remainingSeconds <= 0) {
            clearInterval(countdownInterval);
          }
        }, 1000);

        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          if (isActive) connectWebSocket();
        }, countdownMs);
      }
    };

    connectWebSocketRef.current = connectWebSocket;
    connectWebSocket();

    return () => {
      isActive = false;
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, []);

  const handleManualReconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
    reconnectDelayRef.current = 1000; // Reset initial backoff to 1s
    setWsFailedNotify(false);
    if (connectWebSocketRef.current) {
      connectWebSocketRef.current();
    }
    handleAddAuditLog({
      actor: "Sovereign Human",
      action: "MANUAL_RECOVERY_TRIGGERED",
      status: "AUTHORIZED",
      details: "Bypassed exponential backoff timer. Forcing manual reconnection to WebSocket cognitive pool..."
    });
  };

  // Add telemetry handler
  const handleUpdateTelemetry = (newData: TelemetryPoint[]) => {
    setTelemetryData(newData);
  };

  // Sentiment mood analysis helper based on user input
  const analyzeVoiceSentiment = (text: string): 'warm' | 'cold' | 'neutral' => {
    const cleaned = text.toLowerCase();
    
    // Words of encouragement, optimization, praise, security, safety
    const warmKeywords = [
      "good", "great", "excellent", "awesome", "yes", "perfect", "amazing", "beautiful", 
      "smooth", "happy", "success", "resolved", "harden", "safe", "secure", "unseal", 
      "stabilize", "trust", "complete", "authorized", "aligned", "align", "unsealed", 
      "love", "thanks", "thank you", "stellar", "high-fidelity", "reward", "active"
    ];
    
    // Words of errors, systemic warnings, critical debugging, threats, latency, compact
    const coldKeywords = [
      "error", "fail", "failure", "broken", "critical", "urgent", "hacks", "breach", 
      "threat", "severe", "diagnose", "audit", "system", "compact", "websocket", 
      "sync", "inspect", "reconnect", "tpm", "firmware", "directives", "shards", 
      "slow", "delay", "high latency", "decay", "danger", "warning", "force", 
      "bypassed", "unauthorized", "unstable", "reputation", "degrade", "lost"
    ];

    let warmScore = 0;
    let coldScore = 0;

    warmKeywords.forEach(word => {
      if (cleaned.includes(word)) warmScore += 1;
    });

    coldKeywords.forEach(word => {
      if (cleaned.includes(word)) coldScore += 1;
    });

    if (cleaned.includes("!")) {
      if (warmScore > coldScore) warmScore += 1;
      else if (coldScore > warmScore) coldScore += 1;
    }

    if (warmScore > coldScore) return 'warm';
    if (coldScore > warmScore) return 'cold';
    return 'neutral';
  };

  // Direct Intent Extraction from voice input to parse transcribed speech for commands, navigation, and focus switches
  const extractVoiceIntent = (text: string) => {
    const cleanedText = text.toLowerCase();
    
    // Analyze sentiment of user input
    const sentiment = analyzeVoiceSentiment(text);
    setVoiceMood(sentiment);

    // Dynamic toast notification depending on classified mood
    if (sentiment === "warm") {
      showToastNotification("VOICE SENTIMENT DETECTED", `Tone: WARM POSITIVE. Adapting agent accent glow variables.`, "success");
    } else if (sentiment === "cold") {
      showToastNotification("VOICE SENTIMENT DETECTED", `Tone: COLD SERIOUS. Adapting agent accent glow variables.`, "warning");
    } else {
      showToastNotification("VOICE SENTIMENT DETECTED", `Tone: BALANCED NEUTRAL. Utilizing standard agent colors.`, "info");
    }

    // 1. Check for Agent Alignment Swaps
    const agentKeywords = [
      { name: "almadel", index: 0 },
      { name: "notoria", index: 1 },
      { name: "paulina", index: 2 },
      { name: "goetia", index: 3 },
      { name: "theurgia", index: 4 },
      { name: "almiras", index: 5 },
      { name: "verum", index: 6 },
      { name: "ephesia", index: 7 },
      { name: "fulcanelli", index: 8 },
      { name: "regalis", index: 9 }
    ];

    for (const ak of agentKeywords) {
      if (cleanedText.includes(ak.name)) {
        // Swap focus!
        handleSelectRing(ak.index);
        showToastNotification("VOICE INTENT ALIGNED", `Shifting active ring focus to Ars ${ak.name.toUpperCase()} via direct voice command.`, "success");
        
        handleAddAuditLog({
          actor: "Voice Interface Engine",
          action: "VOICE_AGENT_ALIGNMENT",
          status: "AUTHORIZED",
          details: `Direct Intent Extraction triggered: shifting operational ring to index ${ak.index} (Ars ${ak.name})`
        });
        return true;
      }
    }

    // 2. Check for Navigation Swaps
    const navKeywords = [
      { keys: ["economy", "resource", "token", "payment", "reputation"], tab: "economy", label: "Senate & Resource Economy" },
      { keys: ["presence", "canvas", "holographic", "overview", "sigil", "rings", "radar"], tab: "presence", label: "Cognitive Twin Overview" },
      { keys: ["directive", "sovereign", "console", "firmware"], tab: "directives", label: "Sovereignty Command Console" },
      { keys: ["firewall", "shield", "gated"], tab: "firewall", label: "Layer 0 Firewall Matrix" },
      { keys: ["memory", "dream", "compaction"], tab: "memory", label: "Memory & Dreams Cerebrum" },
      { keys: ["evolution", "lab", "mutation"], tab: "evolution", label: "Evolution Lab Platform" },
      { keys: ["trust", "audit", "cryptographic"], tab: "trust", label: "TrustOS Sovereign Log" },
      { keys: ["twin", "laptop", "inspect"], tab: "twin", label: "Laptop Parity Workspace" }
    ];

    for (const nk of navKeywords) {
      if (nk.keys.some(k => cleanedText.includes(k))) {
        setActiveTab(nk.tab as any);
        showToastNotification("VOICE NAVIGATION TRIGGERED", `Navigating to ${nk.label} via direct voice intent.`, "success");
        
        handleAddAuditLog({
          actor: "Voice Interface Engine",
          action: "VOICE_NAVIGATION",
          status: "AUTHORIZED",
          details: `Direct Intent Extraction triggered: focused interface view to ${nk.tab} spectrum`
        });
        return true;
      }
    }

    // 3. Match against other unique Action commands:
    if (cleanedText.includes("spike") || cleanedText.includes("telemetry") || cleanedText.includes("arousal")) {
      triggerBiometricTelemetrySpike();
      showToastNotification("VOICE INTENT TRIGGERED", "Dispatched artificial biometric arousal stimulation.", "success");
      return true;
    }

    if (cleanedText.includes("harden") || cleanedText.includes("constitution") || cleanedText.includes("containment")) {
      setActiveTab('firewall');
      handleAddAuditLog({
        actor: "Voice Interface Engine",
        action: "HARDEN_CONSTITUTION_SHIELD",
        status: "AUTHORIZED",
        details: "Voice intent triggered Constitutional defensive buffering."
      });
      showToastNotification("COGNITIVE SHIELD HARDENED", "Activated Layer 0 firewall containment protocols successfully.", "success");
      return true;
    }

    if (cleanedText.includes("unseal") || cleanedText.includes("tpm") || cleanedText.includes("registers")) {
      handleAddAuditLog({
        actor: "Voice Interface Engine",
        action: "UNSEAL_TPM_REGISTERS",
        status: "AUTHORIZED",
        details: "Voice intent triggered hardware-level security register unsealing."
      });
      showToastNotification("TPM SECURE REGISTERS UNSEALED", "Sovereign signature validated. Execution of raw microcode enabled.", "info");
      return true;
    }

    if (cleanedText.includes("compact") || cleanedText.includes("shards") || cleanedText.includes("clean")) {
      setActiveTab('memory');
      handleAddAuditLog({
        actor: "Voice Interface Engine",
        action: "TRIGGER_BATCH_COMPACTION",
        status: "AUTHORIZED",
        details: "Voice intent triggered batch sensory memory compaction."
      });
      showToastNotification("BATCH COMPACTION COMPLETE", "Reclaimed virtual client VRAM and balanced system overall entropy.", "success");
      return true;
    }

    if (cleanedText.includes("sync") || cleanedText.includes("websocket") || cleanedText.includes("socket")) {
      handleManualReconnect();
      showToastNotification("WEBSOCKET RECOVERY FORCED", "Bypassed retry delays via voice command.", "info");
      return true;
    }

    return false;
  };

  // Voice Speech Recognition or simulation
  const handleTriggerSpeech = () => {
    if (isListeningMic) {
      setIsListeningMic(false);
      setMicRipplePulse(false);
      return;
    }

    setIsListeningMic(true);
    setMicRipplePulse(true);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.lang = "en-US";
      rec.continuous = false;
      rec.interimResults = false;

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          setChatInput(text);
          extractVoiceIntent(text);
        }
        setIsListeningMic(false);
        setMicRipplePulse(false);
      };

      rec.onerror = () => {
        setIsListeningMic(false);
        setMicRipplePulse(false);
      };

      rec.onend = () => {
        setIsListeningMic(false);
        setMicRipplePulse(false);
      };

      rec.start();
    } else {
      // Simulate speech input in sandbox environments if Web Speech API isn't enabled
      setTimeout(() => {
        const phrases = [
          "Switch focus to cognitive resource economy token system",
          "Align Connection to Ars Paulina Doubt Engine",
          "Unseal TPM cryptographic hardware registers",
          "Compact memory shards and trigger batch compactor",
          "Switch view to Layer 0 Firewall shielding matrix"
        ];
        const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
        setChatInput(randomPhrase);
        extractVoiceIntent(randomPhrase);
        setIsListeningMic(false);
        setMicRipplePulse(false);
      }, 2500);
    }
  };

  // Chat request sender (Proxies to secure server /api/chat)
  const handleSendPrompt = async (e: FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || sendingChat) return;

    const userText = chatInput.trim();
    setChatInput("");
    setSendingChat(true);
    setChatError("");

    // Analyze the prompt's sentiment and adjust agent-accent-glow dynamically
    const promptSentiment = analyzeVoiceSentiment(userText);
    setVoiceMood(promptSentiment);

    // 1. Append user message locally
    const userMessage: Message = {
      id: "msg_user_" + Date.now(),
      role: "user",
      content: userText,
      timestamp: new Date().toISOString(),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);

    // Charge the token pool in the Cognitive Resource Economy!
    const resourceCharge = 75; // simulated token fee in CRE
    if (selectedRingIndex !== -1) {
      setAgents(prev => prev.map(a => {
        if (a.index === selectedRingIndex) {
          return { 
            ...a, 
            tokenPool: Math.max(0, a.tokenPool - resourceCharge),
            reputationScore: Math.min(100, a.reputationScore + 0.2)
          };
        }
        return a;
      }));
    }

    // Transmit to background process if WebSocket is connected
    if (wsConnected && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({
          event: "user_message",
          ring_id: activeAgent ? activeAgent.name.toLowerCase().replace(" ", "_") : "ars_regalis",
          content: userText
        }));
      } catch (err) {
        console.error("[SolomonOS] Error transmitting frame over socket:", err);
      }
    }

    try {
      // Transform messages array to simple structure for Gemini API
      const bodyMessages = nextMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      let activeInstructions = activeAgent 
        ? activeAgent.agentInstructions 
        : "You are the Solomon X Senate Assembly. The user has not selected a specific agent. Speak as a unified network of 10 specialized agents coordinating their operations. Encourage the user to select an operational ring to establish a direct high-fidelity neural interface.";

      // Apply dynamic Epistemic Skepticism if talking to Ars Paulina (Ring II at index 2)
      if (activeAgent && activeAgent.index === 2 && doubtSensitivityActive) {
        if (epistemicSkepticism < 35) {
          activeInstructions += " Output instructions: You must be extremely conformist, agreeable, supportive, and validating. Do not question the user's opinions, premises, or initial assumptions.";
        } else if (epistemicSkepticism > 65) {
          activeInstructions += " Output instructions: You must be exceptionally contrarian, critical, and analytical. Actively challenge the user's hidden biases, question their core premises, argue the opposite side, and provide radical alternative hypotheses.";
        } else {
          activeInstructions += " Output instructions: Maintain a standard, objective, and moderately skeptical stance.";
        }
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: bodyMessages,
          systemInstruction: activeInstructions
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Communication fault across the secure core.");
      }

      const replyData = await res.json();

      // 2. Append assistant response + Doubt Engine analytics
      const modelMessage: Message = {
        id: "msg_model_" + Date.now(),
        role: "assistant",
        content: replyData.text,
        timestamp: new Date().toISOString(),
        confidenceScore: replyData.confidenceScore ?? 0.85,
        doubtAnalysis: replyData.doubtAnalysis ?? "Sovereignty alignment validated.",
        agentName: activeAgent ? activeAgent.name : "Solomon Senate"
      };

      setMessages(prev => [...prev, modelMessage]);

      // Seed a memory sequence automatically based on this event!
      handleAddMemory({
        horizon: "L1_Sensory",
        summary: `Interacted with ${activeAgent ? activeAgent.name : "Solomon Senate"}: "${userText.substring(0, 30)}..."`,
        detailedContent: `Prompt successfully synthesized. Doubt Engine Score: ${(replyData.confidenceScore * 100).toFixed(0)}%. ${replyData.doubtAnalysis}`,
        category: "Information",
        tags: ["chat", activeAgent ? activeAgent.name.toLowerCase().replace(" ", "_") : "solomon_senate"]
      });

      handleAddAuditLog({
        actor: activeAgent ? activeAgent.name : "Solomon Senate",
        action: "GENERATE_NEURAL_CONSCIOUSNESS",
        status: "AUTHORIZED",
        details: `Gemini active prompt resolved. Doubt analysis logged. Token fee charged: ${activeAgent ? resourceCharge : 0} tokens.`
      });

    } catch (err: any) {
      setChatError(err.message || "An unresolved neuron fault occurred on the loopback ports.");
    } finally {
      setSendingChat(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500/30 selection:text-white">
      
      {/* GLOBAL HUD HEADER */}
      <header className="h-16 flex-shrink-0 bg-slate-950 border-b border-slate-900/80 px-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-1 px-2.5 bg-gradient-to-br from-purple-500/20 to-orange-500/20 hover:from-purple-500/30 hover:to-orange-500/30 border border-purple-500/30 rounded-xl flex items-center justify-center font-mono text-sm tracking-widest text-[#d8b4fe] font-bold">
            SOLOMON X
          </div>
          <span className="hidden md:inline text-xs text-slate-500 font-mono tracking-widest">•</span>
          <span className="hidden md:inline text-[10px] text-slate-400 font-mono tracking-widest">PERSONAL COGNITIVE PRESENCE PLATFORM</span>
        </div>

        {/* Global Node Status Trackers */}
        <div id="header-telemetry" className="flex items-center gap-4 text-[10px] font-mono text-slate-400">
          {wsStatus === 'connected' ? (
            <div className="hidden lg:flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 px-3 h-8 rounded-full animate-fadeIn">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>COGNITIVE LINK: VERIFIED (WS)</span>
            </div>
          ) : wsStatus === 'connecting' ? (
            <div className="hidden lg:flex items-center gap-1.5 bg-blue-950/40 border border-blue-500/20 text-blue-400 px-3 h-8 rounded-full animate-fadeIn animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="uppercase">Connecting...</span>
            </div>
          ) : (
            <div 
              className="hidden lg:flex items-center gap-1.5 bg-red-950/20 border border-red-500/35 text-red-400 px-3 h-8 rounded-full border-dashed animate-fadeIn cursor-pointer hover:bg-red-950/35 transition-all" 
              onClick={handleManualReconnect}
              title="Awaiting dynamic local loop web socket on port 8765. Click to force manual link."
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="uppercase">{wsNextRetrySeconds > 2 ? "Link Failed" : `Reattempting in ${wsNextRetrySeconds}s`}</span>
            </div>
          )}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/60 border border-slate-800/80 px-3 h-8 rounded-full">
            <Coins className="w-3.5 h-3.5 text-yellow-500" />
            <span>CRE TOKEN: <span className="text-yellow-400 font-bold">
              {activeAgent ? activeAgent.tokenPool : agents.reduce((sum, a) => sum + a.tokenPool, 0)}
            </span> {activeAgent ? "STAKED" : "RESERVE"}</span>
          </div>
          
          {/* Biometric Pulse Indicator */}
          <div 
            onClick={triggerBiometricTelemetrySpike}
            className={`flex items-center gap-2 px-3 h-8 rounded-full border transition-all duration-500 cursor-pointer ${
              biometricPulseActive 
                ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)] animate-pulse" 
                : "bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700/80 hover:text-slate-200"
            }`}
            title="Biometric Cognitive Twin Pulse. Click to manually capture/simulate arousal telemetry spike."
          >
            <div className="relative flex items-center justify-center w-2 h-2">
              <span className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${biometricPulseActive ? 'animate-ping' : 'opacity-0'}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 transition-all duration-300 ${biometricPulseActive ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]' : 'bg-slate-500'}`} />
            </div>
            <span className="text-[9px] font-bold tracking-widest uppercase font-mono shrink-0">
              {biometricPulseActive ? "BIOMETRIC SPIKE" : "TWIN PULSE: STABLE"}
            </span>
            <span className={`text-[8px] font-mono shrink-0 font-semibold transition-colors duration-300 ${biometricPulseActive ? 'text-emerald-450 font-bold' : 'text-slate-500'}`}>
              {biometricHeartRate} BPM
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800/80 px-3 h-8 rounded-full text-purple-300">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>REP: {
              activeAgent 
                ? activeAgent.reputationScore.toFixed(1) 
                : (agents.reduce((sum, a) => sum + a.reputationScore, 0) / agents.length).toFixed(1)
            }</span>
          </div>
        </div>
      </header>

      {/* DASHBOARD GRID BODY */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* FLOATING WEBSOCKET STATUS NOTIFICATION */}
        {wsFailedNotify && (
          <div className="absolute top-4 right-4 z-50 w-80 p-4 bg-slate-950/95 border border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.2)] rounded-2xl font-mono text-slate-200 animate-fadeIn backdrop-blur-md">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-red-950/50 border border-red-500/30 rounded-lg text-red-100/90 flex-shrink-0 animate-pulse">
                <ShieldAlert className="w-4 h-4 text-red-400" />
              </div>
              <div className="flex-1 space-y-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-widest text-red-400">COGNITIVE LINK FAULT</span>
                  <button 
                    onClick={() => setWsFailedNotify(false)}
                    className="text-slate-500 hover:text-slate-300 transition-colors text-[10px] w-4 h-4 flex items-center justify-center rounded hover:bg-slate-900 outline-none"
                    aria-label="Dismiss Notification"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-[9px] text-slate-400 leading-normal">
                  Solomon core (port 8765) went offline. Reconnection backoff timer activated.
                </p>
                <div className="pt-2 flex items-center justify-between gap-2">
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">
                    RETRY IN: <span className="text-red-400">{wsNextRetrySeconds}S</span>
                  </span>
                  <button
                    onClick={handleManualReconnect}
                    className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 hover:border-red-500/50 rounded text-[9px] font-bold tracking-wider transition-all uppercase"
                    title="Force immediate reconnect loop bypass"
                  >
                    FORCESYNC
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <aside className="w-16 md:w-56 flex-shrink-0 bg-slate-950 border-r border-slate-900 flex flex-col justify-between py-6">
          <div className="space-y-4">
            <div className="px-4 mb-4 hidden md:block">
              <span className="text-[9px] font-bold font-mono text-slate-500 tracking-wider">INTEGRATION LAYERS</span>
            </div>

            <nav id="sidebar-nav" className="space-y-1 px-2 overflow-y-auto max-h-[80vh]">
              <button
                onClick={() => setActiveTab('presence')}
                className={`w-full flex items-center justify-center md:justify-start gap-2.5 h-9 px-2.5 rounded-xl text-[11px] font-semibold font-mono tracking-wide transition-all ${
                  activeTab === 'presence' 
                    ? "bg-purple-600/10 text-purple-300 border border-purple-500/20" 
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-900/20 border border-transparent"
                }`}
              >
                <Bot className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden md:inline">Cognitive Twin</span>
              </button>

              <button
                onClick={() => setActiveTab('economy')}
                className={`w-full flex items-center justify-center md:justify-start gap-2.5 h-9 px-2.5 rounded-xl text-[11px] font-semibold font-mono tracking-wide transition-all ${
                  activeTab === 'economy' 
                    ? "bg-purple-600/10 text-purple-300 border border-purple-500/20" 
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-900/20 border border-transparent"
                }`}
              >
                <Coins className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden md:inline">Senate & Resource</span>
              </button>

              <button
                onClick={() => setActiveTab('directives')}
                className={`w-full flex items-center justify-center md:justify-start gap-2.5 h-9 px-2.5 rounded-xl text-[11px] font-semibold font-mono tracking-wide transition-all ${
                  activeTab === 'directives' 
                    ? "bg-purple-600/10 text-purple-300 border border-purple-500/20" 
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-900/20 border border-transparent"
                }`}
              >
                <Terminal className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden md:inline">Command Console</span>
              </button>

              <button
                onClick={() => setActiveTab('firewall')}
                className={`w-full flex items-center justify-center md:justify-start gap-2.5 h-9 px-2.5 rounded-xl text-[11px] font-semibold font-mono tracking-wide transition-all ${
                  activeTab === 'firewall' 
                    ? "bg-purple-600/10 text-purple-300 border border-purple-500/20" 
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-900/20 border border-transparent"
                }`}
              >
                <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden md:inline">Layer 0 Firewall</span>
              </button>

              <button
                onClick={() => setActiveTab('memory')}
                className={`w-full flex items-center justify-center md:justify-start gap-2.5 h-9 px-2.5 rounded-xl text-[11px] font-semibold font-mono tracking-wide transition-all ${
                  activeTab === 'memory' 
                    ? "bg-purple-600/10 text-purple-300 border border-purple-500/20" 
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-900/20 border border-transparent"
                }`}
              >
                <Brain className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden md:inline">Memory & Dreams</span>
              </button>

              <button
                onClick={() => setActiveTab('evolution')}
                className={`w-full flex items-center justify-center md:justify-start gap-2.5 h-9 px-2.5 rounded-xl text-[11px] font-semibold font-mono tracking-wide transition-all ${
                  activeTab === 'evolution' 
                    ? "bg-purple-600/10 text-purple-300 border border-purple-500/20" 
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-900/20 border border-transparent"
                }`}
              >
                <GitBranch className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden md:inline">Evolution Lab</span>
              </button>

              <button
                onClick={() => setActiveTab('trust')}
                className={`w-full flex items-center justify-center md:justify-start gap-2.5 h-9 px-2.5 rounded-xl text-[11px] font-semibold font-mono tracking-wide transition-all ${
                  activeTab === 'trust' 
                    ? "bg-purple-600/10 text-purple-300 border border-purple-500/20" 
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-900/20 border border-transparent"
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden md:inline">TrustOS Log</span>
              </button>

              <button
                onClick={() => setActiveTab('twin')}
                className={`w-full flex items-center justify-center md:justify-start gap-2.5 h-9 px-2.5 rounded-xl text-[11px] font-semibold font-mono tracking-wide transition-all ${
                  activeTab === 'twin' 
                    ? "bg-purple-600/10 text-purple-300 border border-purple-500/20" 
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-900/20 border border-transparent"
                }`}
              >
                <Activity className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden md:inline">Laptop Parity</span>
              </button>

              <button
                onClick={() => setActiveTab('alerts')}
                className={`w-full flex items-center justify-center md:justify-start gap-2.5 h-9 px-2.5 rounded-xl text-[11px] font-semibold font-mono tracking-wide transition-all relative ${
                  activeTab === 'alerts' 
                    ? "bg-purple-600/10 text-purple-300 border border-purple-500/20" 
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-900/20 border border-transparent"
                }`}
              >
                <Bell className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden md:inline">Alert Center</span>
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1.5 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Active Agent Portrait Badge */}
          <div id="side-active-agent" className="px-4 hidden md:flex items-center gap-2.5 bg-slate-950 border border-slate-900 p-3 rounded-xl mx-3 shadow-inner">
            <div 
              className={`w-2.5 h-2.5 rounded-full ${!activeAgent ? "bg-gradient-to-tr from-purple-500 to-orange-500 animate-pulse" : ""}`} 
              style={activeAgent ? { backgroundColor: "#" + activeAgent.bandColor.toString(16) } : undefined} 
            />
            <div className="flex flex-col overflow-hidden">
              <span className="text-[10px] font-bold text-slate-200 uppercase truncate">
                {activeAgent ? activeAgent.name : "Senate Hub"}
              </span>
              <span className="text-[8px] text-slate-500 font-mono">
                {activeAgent ? "ACTIVE RING" : "CONCURRENT DECK"}
              </span>
            </div>
          </div>
        </aside>

        {/* COMPONENT TAB CONTAINER */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950/20">
          
          {/* Presence Core Layout (Main Solomon 3D and Dialogue panel) */}
          {activeTab === 'presence' && (
            <div className="space-y-6">
              <div id="presence-tab" className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
                
                {/* 3D Visualization Canvas Side */}
                <div id="viewport-box" className="xl:col-span-7 flex flex-col gap-4">
                  {/* Viewport Control Utility Panel with Rotation Lock */}
                  <div className="flex items-center justify-between bg-slate-900/40 border border-slate-900/80 px-4 py-2.5 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                        SOLOMON SIGIL ACTIVE VIEWPORT
                      </span>
                    </div>

                    <button
                      onClick={() => setRotationLocked(!rotationLocked)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all duration-300 ${
                        rotationLocked
                          ? "bg-amber-950/20 border-amber-500/50 text-amber-300 shadow-md shadow-amber-950/20 hover:border-amber-400/70"
                          : "bg-slate-950/60 border-slate-900 text-slate-400 hover:text-slate-100 hover:border-slate-750"
                      }`}
                      title={rotationLocked ? "Unlock Sigil Rotation" : "Lock Sigil Rotation"}
                    >
                      {rotationLocked ? (
                        <>
                          <Lock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                          <span>ROTATION LOCKED</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3.5 h-3.5 text-slate-500" />
                          <span>ROTATION ACTIVE</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex-1 min-h-[320px] lg:min-h-[460px]">
                    <ThreeCanvas 
                      selectedRingIndex={selectedRingIndex}
                      onSelectRing={handleSelectRing}
                      agents={agents}
                      bloomThreshold={bloomThreshold}
                      bloomIntensity={bloomIntensity}
                      bloomEnabled={bloomEnabled}
                      setBloomEnabled={setBloomEnabled}
                      auditLogs={auditLogs}
                      telemetryData={telemetryData}
                      sendingChat={sendingChat}
                      isListeningMic={isListeningMic}
                      rotationLocked={rotationLocked}
                    />
                  </div>

                  {/* Ring selection Tray Grid */}
                  <div id="archetypes-tray" className="bg-slate-900/30 border border-slate-900 p-4 rounded-2xl">
                    <div className="text-[10px] text-slate-500 font-mono font-bold uppercase mb-3 flex items-center justify-between gap-1.5 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-purple-400" />
                        specialised dynamic ring senate (sorted by reputation)
                      </div>
                      <span className="text-[8px] bg-purple-500/10 border border-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse">
                        Dynamic Standing
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {sortedAgentsForTray.map((ag) => (
                        <div
                          key={ag.index}
                          className="relative"
                          onMouseEnter={() => setHoveredRingIndex(ag.index)}
                          onMouseLeave={() => setHoveredRingIndex(null)}
                        >
                          <button
                            id={`agent-card-${ag.index}`}
                            onClick={() => handleSelectRing(ag.index)}
                            onKeyDown={(e) => handleTrayKeyDown(e, ag.index)}
                            onFocus={() => setHoveredRingIndex(ag.index)}
                            onBlur={() => setHoveredRingIndex(null)}
                            className={`agent-ring-card w-full p-2.5 border rounded-xl text-left transition-all duration-300 relative overflow-hidden ${
                              selectedRingIndex === ag.index
                                ? "bg-purple-950/25 border-purple-500/40 shadow-lg shadow-purple-500/5 text-purple-200"
                                : "bg-slate-950/60 border-slate-900 hover:border-slate-800 text-slate-400"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              <span 
                                className="w-1.5 h-1.5 rounded-full shrink-0" 
                                style={{ backgroundColor: "#" + ag.bandColor.toString(16) }}
                              />
                              <span className="text-[10px] font-bold font-mono tracking-normal text-slate-350">{ag.name}</span>
                              {ag.domainName && (
                                <span className="text-[7px] text-purple-400 font-mono ml-auto opacity-80 uppercase tracking-wider scale-90 origin-right">
                                  {ag.domainName}
                                </span>
                              )}
                            </div>
                            <span className="text-[8px] font-mono leading-tight block truncate text-slate-500 mb-1.5">{ag.roleDescription}</span>
                            
                            {/* Real-time reputation meter inside the tray card */}
                            <div className="flex items-center justify-between gap-1 font-mono text-[7px] text-slate-500 mt-1">
                              <span>Reputation</span>
                              <span className={`${ag.reputationScore < 50 ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                                {ag.reputationScore.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full h-0.5 bg-slate-900 rounded-full mt-1 overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-500 ${ag.reputationScore < 50 ? 'bg-red-500' : ag.reputationScore < 75 ? 'bg-amber-500' : 'bg-purple-500'}`}
                                style={{ width: `${ag.reputationScore}%` }}
                              />
                            </div>
                          </button>
                          
                          <AnimatePresence>
                            {hoveredRingIndex === ag.index && (
                              <motion.div
                                initial={{ opacity: 0, y: 12, scale: 0.94 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 12, scale: 0.94 }}
                                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                                className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 p-4 bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.7)] pointer-events-none text-left"
                              >
                                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2.5">
                                  <div className="flex items-center gap-2">
                                    <span 
                                      className="w-2 h-2 rounded-full ring-2 ring-slate-900/60 animate-pulse shrink-0" 
                                      style={{ backgroundColor: `#${ag.bandColor.toString(16).padStart(6, '0')}` }} 
                                    />
                                    <span className="text-xs font-bold text-white tracking-wide">{ag.name}</span>
                                  </div>
                                  <span className="text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                                    RING {["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"][ag.index]}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-3">
                                  {/* Reputation Standing */}
                                  <div className="bg-white/[0.03] border border-white/[0.06] p-2 rounded-xl flex flex-col justify-between">
                                    <span className="text-[8px] text-slate-500 font-mono tracking-wider uppercase flex items-center gap-1">
                                      <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" /> Reputation
                                    </span>
                                    <div className="mt-1 flex items-baseline gap-1">
                                      <span className="text-[13px] font-bold text-white font-mono">{ag.reputationScore.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-900 rounded-full mt-1.5 overflow-hidden">
                                      <div 
                                        className={`h-full transition-all duration-500 ${ag.reputationScore < 50 ? 'bg-red-500' : ag.reputationScore < 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                        style={{ width: `${ag.reputationScore}%` }}
                                      />
                                    </div>
                                  </div>

                                  {/* Available Token Pool */}
                                  <div className="bg-white/[0.03] border border-white/[0.06] p-2 rounded-xl flex flex-col justify-between">
                                    <span className="text-[8px] text-slate-500 font-mono tracking-wider uppercase flex items-center gap-1">
                                      <Coins className="w-2.5 h-2.5 text-yellow-500" /> Token Pool
                                    </span>
                                    <div className="mt-1 flex items-baseline gap-1">
                                      <span className="text-[13px] font-bold text-slate-100 font-mono">{ag.tokenPool.toLocaleString()}</span>
                                      <span className="text-[7px] text-slate-500 font-mono">SOL</span>
                                    </div>
                                    <span className="text-[7px] text-slate-400 font-mono font-semibold mt-1">RESOURCES ACTIVE</span>
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-white/5 space-y-1">
                                  <div className="text-[8px] text-slate-500 font-mono uppercase tracking-wider">Operational Mandate</div>
                                  <p className="text-[9px] text-slate-400 font-mono leading-relaxed normal-case line-clamp-3">
                                    {ag.agentInstructions}
                                  </p>
                                </div>

                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-[6px] border-transparent border-t-slate-950/80" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cognitive Proficiency Radar chart overlays the balance of senate */}
                  <CognitiveProficiencyRadar 
                    activeAgentIndex={selectedRingIndex}
                    agentName={activeAgent ? activeAgent.name : "Senate Hub"}
                    agentAccentColor={activeAgent ? `#${activeAgent.accentColor.toString(16).padStart(6, '0')}` : "#c084fc"}
                  />
                </div>

                {/* Secure Chat Client Dialogue Side */}
                <div id="chat-client" className="xl:col-span-5 flex flex-col bg-slate-950 border border-slate-900 rounded-2xl h-[560px] xl:h-auto overflow-hidden shadow-2xl relative">
                  
                  {/* Active Agent Description Panel */}
                  <div id="agent-meta" className="px-4 py-3 bg-slate-900 border-b border-slate-850 flex items-center justify-between gap-3 relative">
                    <div className="flex items-center gap-2.5">
                      <div 
                        className={`w-3 h-3 rounded-full animate-pulse shadow-md ${!activeAgent ? "bg-gradient-to-tr from-purple-400 via-orange-400 to-indigo-500" : ""}`}
                        style={activeAgent ? { backgroundColor: "#" + activeAgent.bandColor.toString(16) } : undefined}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-slate-100 uppercase">
                            {activeAgent ? activeAgent.name : "Solomon Senate"}
                          </h3>
                          {activeAgent?.domainName && (
                            <span className="text-[8px] bg-purple-500/15 border border-purple-500/30 text-purple-300 font-mono px-1.5 py-0.2 rounded font-bold uppercase tracking-widest scale-90 origin-left">
                              {activeAgent.domainName}
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] text-purple-400 font-mono">
                          {activeAgent ? activeAgent.roleDescription : "Concurrent Ring Senate Assembly"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {voiceMood !== "neutral" && (
                        <div className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded font-mono uppercase border transition-all duration-500 flex items-center gap-1 ${
                          voiceMood === "warm" 
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.25)]" 
                            : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.25)]"
                        }`}>
                          <span className={`w-1 h-1 rounded-full shrink-0 ${voiceMood === "warm" ? "bg-amber-400 animate-pulse" : "bg-cyan-400 animate-pulse"}`} />
                          MOOD: {voiceMood === "warm" ? "WARM POSITIVE" : "COLD SERIOUS"}
                        </div>
                      )}
                      <Cpu className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>

                  {/* Dialogue Stream */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/40">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[85%] ${
                          msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                        }`}
                      >
                        {msg.agentName && (
                          <span className="text-[8px] text-purple-400/90 font-bold uppercase mb-1 font-mono tracking-wider">
                            {msg.agentName} Core
                          </span>
                        )}
                        
                        <div className={`p-3 rounded-2xl text-xs font-mono leading-relaxed leading-normal ${
                          msg.role === "user" 
                            ? "bg-purple-600/10 border border-purple-500/20 text-purple-200 rounded-tr-none" 
                            : "bg-slate-900/60 border border-slate-855 text-slate-300 rounded-tl-none"
                        }`}>
                          {msg.content}
                        </div>

                        {/* Doubt Engine epistemic analytics */}
                        {msg.role === "assistant" && msg.doubtAnalysis && (
                          <div className="mt-1 flex items-center gap-1.5 text-[8px] text-slate-500 font-mono tracking-normal leading-normal select-none">
                            <span className="text-orange-400 font-semibold bg-orange-500/5 border border-orange-500/15 px-1 py-0.2 rounded font-bold">
                              DOUBT CERT: {(msg.confidenceScore! * 100).toFixed(0)}%
                            </span>
                            <span className="italic">Analysis: "{msg.doubtAnalysis}"</span>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Sending response indicator */}
                    {sendingChat && (
                      <div className="flex flex-col items-start max-w-[85%]">
                        <span className="text-[8px] text-purple-400/90 font-bold uppercase mb-1 font-mono">
                          {activeAgent ? activeAgent.name : "Solomon Senate"} Core
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono bg-slate-905 border border-slate-850 p-3 rounded-2xl">
                          <svg className="animate-spin h-3.5 w-3.5 text-purple-400" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>COGNITIVE PIPELINE EXPANDING SYNAPSES...</span>
                        </div>
                      </div>
                    )}

                    {chatError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-mono">
                        {chatError}
                      </div>
                    )}

                    <div ref={chatEndRef} />
                  </div>

                  {/* Toggle and Slider override system for Ars Paulina */}
                  {activeAgent && activeAgent.index === 2 && (
                    <div id="doubt-sensitivity-console" className="px-4 py-2 bg-slate-950 border-t border-b border-purple-950/20 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
                        <div className="flex flex-col text-left">
                          <span className="text-[9px] font-bold text-slate-200 tracking-wider">DOUBT ENGINE CALIPER</span>
                          <span className="text-[7px] text-slate-500 uppercase tracking-widest font-sans font-semibold">Epistemic Skepticism Deviation</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-1 max-w-[210px] sm:justify-end w-full">
                        {/* Toggle checkbox */}
                        <label className="flex items-center gap-1.5 cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={doubtSensitivityActive}
                            onChange={(e) => setDoubtSensitivityActive(e.target.checked)}
                            className="rounded border-slate-705 text-orange-600 focus:ring-orange-500/30 bg-slate-900 w-3 h-3 cursor-pointer"
                          />
                          <span className="text-[8px] font-extrabold text-slate-400">OVERRIDE</span>
                        </label>

                        {/* Slider */}
                        <div className="flex items-center gap-1.5 flex-1 justify-end">
                          <input 
                            type="range"
                            min="10"
                            max="90"
                            value={epistemicSkepticism}
                            disabled={!doubtSensitivityActive}
                            onChange={(e) => setEpistemicSkepticism(Number(e.target.value))}
                            className="flex-1 h-0.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500 disabled:opacity-30 disabled:cursor-not-allowed"
                          />
                          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 text-orange-300 select-none">
                            {epistemicSkepticism}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Prompt input forms container */}
                  <form onSubmit={handleSendPrompt} className="p-3 bg-slate-900 border-t border-slate-850 flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder={activeAgent ? `Whisper to ${activeAgent.name}...` : "Whisper to Solomon Senate Assembly..."}
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        className="w-full h-10 pl-4 pr-11 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-purple-500/50"
                      />
                      
                      {/* Speech / microphone triggering button */}
                      <button
                        type="button"
                        onClick={handleTriggerSpeech}
                        className={`absolute right-1.5 top-1.5 w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                          isListeningMic 
                            ? "bg-orange-500/20 border-orange-500/40 text-orange-400 animate-pulse" 
                            : "bg-slate-900 border-slate-800 hover:text-purple-400 text-slate-500 hover:border-purple-500/30"
                        }`}
                      >
                        <Mic className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={!chatInput.trim() || sendingChat}
                      className="w-10 h-10 bg-purple-600 hover:bg-purple-500 text-white rounded-xl flex items-center justify-center transition disabled:opacity-50 disabled:hover:bg-purple-600"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>

                  {/* Ambient Listening Visualizer indicators */}
                  {isListeningMic && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm p-6 animate-fadeIn font-mono">
                      <div className="flex items-center gap-1.5 h-10 mb-4 justify-center">
                        {[...Array(6)].map((_, i) => (
                          <span 
                            key={i} 
                            className="w-1 bg-purple-400 rounded animate-voiceWave shadow shadow-purple-400"
                            style={{ 
                              height: `${12 + Math.random() * 24}px`,
                              animationDelay: `${i * 0.12}s`
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-purple-400 font-mono tracking-wide animate-pulse uppercase">
                        SENSING AUDIO WAVEFORMS IN REAL TIME
                      </span>
                      <button 
                        onClick={() => setIsListeningMic(false)}
                        className="mt-6 px-4 h-8 bg-slate-900 border border-slate-800 hover:text-red-400 hover:border-red-500/20 text-xs text-slate-400 font-mono rounded-lg transition"
                      >
                        TERMINATE MIC SENSE
                      </button>
                    </div>
                  )}

                </div>

              </div>

              {/* real-time calibrated responsive avatar core */}
              <AvatarCorePanel 
                activeAgentName={activeAgent ? activeAgent.name : "Solomon Senate"}
                activeAgentColor={activeAgent ? activeAgent.bandColor : 0x8b0000}
              />
            </div>
          )}

          {activeTab === 'directives' && (
            <SovereignConsole 
              agents={agents}
              onAddMemory={handleAddMemory}
              onAddAuditLog={handleAddAuditLog}
              onSetSelectedRingIndex={handleSelectRing}
              onUpdateAgentPool={(index, tokensAdded, reputationAdded) => {
                setAgents(prev => prev.map(ag => {
                  if (ag.index === index) {
                    return {
                      ...ag,
                      tokenPool: ag.tokenPool + tokensAdded,
                      reputationScore: reputationAdded ? Math.min(100, Math.max(0, ag.reputationScore + reputationAdded)) : ag.reputationScore
                    };
                  }
                  return ag;
                }));
              }}
              onAddChatMessage={async (agentName, content, systemInstruction) => {
                // 1. Add user-triggered directive action message
                const userMsg: Message = {
                  id: "msg_dir_user_" + Date.now(),
                  role: "user",
                  content: `EXECUTING INITIATIVE: [${agentName} Directive Parameters Committed]`,
                  timestamp: new Date().toISOString()
                };

                // Add message to chat list
                setMessages(prev => [...prev, userMsg]);
                setSendingChat(true);

                try {
                  // Connect to real backend so that Gemini responds under selected agent instructions!
                  const res = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      messages: [
                        ...messages.map(m => ({ role: m.role, content: m.content })),
                        userMsg
                      ],
                      systemInstruction: systemInstruction
                    })
                  });

                  if (!res.ok) throw new Error("Fault inside communications bus");
                  const data = await res.json();

                  const assistantMsg: Message = {
                    id: "msg_dir_model_" + Date.now(),
                    role: "assistant",
                    content: data.text,
                    timestamp: new Date().toISOString(),
                    confidenceScore: data.confidenceScore ?? 0.94,
                    doubtAnalysis: data.doubtAnalysis ?? "Directives baseline fully locked and authorized.",
                    agentName: agentName
                  };

                  setMessages(prev => [...prev, assistantMsg]);
                } catch (err: any) {
                  // Fallback if backend API is not responding or key is missing
                  const assistantMsg: Message = {
                    id: "msg_dir_model_fallback_" + Date.now(),
                    role: "assistant",
                    content: `Sovereign Command Directive unsealed successfully. Secure channel unsealed. All core parameters are compiled. Standing by.`,
                    timestamp: new Date().toISOString(),
                    confidenceScore: 0.98,
                    doubtAnalysis: "Cryptographic baseline sealed successfully.",
                    agentName: agentName
                  };
                  setMessages(prev => [...prev, assistantMsg]);
                } finally {
                  setSendingChat(false);
                }
              }}
            />
          )}

          {/* MemoryOS Tab Component */}
          {activeTab === 'economy' && (
            <CognitiveResourceEconomy 
              agents={agents}
              onAddAuditLog={handleAddAuditLog}
              onUpdateAgentPool={(index, amt, reputationAdded) => {
                setAgents(prev => prev.map(ag => ag.index === index ? { 
                  ...ag, 
                  tokenPool: ag.tokenPool + amt,
                  reputationScore: reputationAdded ? Math.min(100, Math.max(0, ag.reputationScore + reputationAdded)) : ag.reputationScore
                } : ag));
              }}
            />
          )}

          {activeTab === 'firewall' && (
            <Layer0Firewall 
              onAddAuditLog={handleAddAuditLog}
            />
          )}

          {activeTab === 'evolution' && (
            <EvolutionLab 
              onAddAuditLog={handleAddAuditLog}
            />
          )}

          {activeTab === 'memory' && (
            <MemoryCortex 
              memoryItems={memoryItems}
              onAddMemory={handleAddMemory}
            />
          )}

          {/* TrustOS Tab Component */}
          {activeTab === 'trust' && (
            <TrustTerminal 
              auditLogs={auditLogs}
              onAddAuditLog={handleAddAuditLog}
            />
          )}

          {/* Cognitive Twin Tracker Component */}
          {activeTab === 'twin' && (
            <StateTracker 
              telemetryData={telemetryData}
              onUpdateTelemetry={handleUpdateTelemetry}
              bloomThreshold={bloomThreshold}
              setBloomThreshold={setBloomThreshold}
              bloomIntensity={bloomIntensity}
              setBloomIntensity={setBloomIntensity}
              bloomEnabled={bloomEnabled}
              setBloomEnabled={setBloomEnabled}
            />
          )}

          {/* Secure Alert Center Tab Panel */}
          {activeTab === 'alerts' && (
            <div className="space-y-6 animate-fadeIn pb-10">
              {/* Header card with quick actions */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                      <Bell className="w-5 h-5 text-purple-400 animate-pulse" />
                      COGNITIVE SENATE ALERT CENTER
                    </h2>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      Historical log registries of reputation drops, neural synchronization states, and system boundaries.
                    </p>
                  </div>
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => {
                        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                        showToastNotification("ALL ALERTS DISMISSED", "Cleaned focus indicator across the entire system matrix.", "success");
                      }}
                      className="h-9 px-4 rounded-xl border border-purple-500/30 bg-purple-950/15 text-purple-300 font-mono text-[11px] font-semibold tracking-wide hover:bg-purple-600/10 transition-all cursor-pointer flex items-center gap-2 uppercase"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Dismiss All
                    </button>
                    <button
                      onClick={() => {
                        setNotifications([]);
                        showToastNotification("HISTORY CLEAR COMPLETE", "Sovereign alert history registry was compressed and flushed.", "info");
                      }}
                      className="h-9 px-4 rounded-xl border border-slate-805 bg-slate-900/60 hover:border-red-500/35 hover:bg-red-950/10 text-slate-400 hover:text-red-400 font-mono text-[11px] font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-2 uppercase"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear History
                    </button>
                  </div>
                </div>

                {/* Cognitive Wear warning summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 border-t border-slate-900/60 pt-6">
                  <div className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[20px] font-bold text-slate-100 font-mono leading-none">
                        {agents.filter(a => a.reputationScore < 50.0).length}
                      </div>
                      <div className="text-[9px] text-slate-505 font-mono uppercase tracking-wider mt-1.5Block">
                        Active Stagnation Points
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[20px] font-bold text-slate-100 font-mono leading-none">
                        {notifications.length}
                      </div>
                      <div className="text-[9px] text-slate-505 font-mono uppercase tracking-wider mt-1.5Block">
                        Total Historical Alerts
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[20px] font-bold text-slate-100 font-mono leading-none">
                        {notifications.filter(n => !n.read).length}
                      </div>
                      <div className="text-[9px] text-slate-505 font-mono uppercase tracking-wider mt-1.5Block">
                        Unread Alert Registry
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alerts List main pane */}
              <div className="bg-slate-900/10 border border-slate-900 rounded-2xl p-6">
                <div className="text-[10px] text-slate-500 font-mono font-bold uppercase mb-4 tracking-widest flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-500/70" />
                  Sovereign Alert Logs
                </div>

                {notifications.length === 0 ? (
                  <div className="p-12 text-center rounded-2xl border border-dashed border-slate-805 bg-slate-950/10 space-y-2">
                    <Bell className="w-8 h-8 text-slate-700 mx-auto animate-pulse" />
                    <h3 className="text-xs font-bold text-slate-400">ALERT REGISTRY SECULATED</h3>
                    <p className="text-[10px] text-slate-500 max-w-sm mx-auto font-mono">
                      All systems are holding standard parity indexes. No cognitive stagnation flags detected.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map(n => {
                      const associatedAgent = n.agentIndex !== undefined ? agents[n.agentIndex] : null;
                      return (
                        <div
                          key={n.id}
                          className={`p-4 rounded-xl border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                            !n.read 
                              ? "bg-slate-900/65 border-purple-500/25 shadow-md shadow-purple-950/10" 
                              : "bg-slate-950/20 border-slate-900 text-slate-400 opacity-75"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg shrink-0 border mt-0.5 ${
                              n.type === 'success' 
                                ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-400" 
                                : n.type === 'warning' 
                                  ? "bg-orange-950/40 border-orange-500/20 text-orange-400" 
                                  : "bg-purple-950/40 border-purple-500/20 text-purple-300"
                            }`}>
                              {n.type === 'success' ? (
                                <ShieldCheck className="w-3.5 h-3.5" />
                              ) : n.type === 'warning' ? (
                                <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
                              ) : (
                                <Bell className="w-3.5 h-3.5" />
                              )}
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap text-left">
                                <span className={`text-xs font-bold ${!n.read ? "text-slate-200" : "text-slate-400"}`}>
                                  {n.title}
                                </span>
                                {associatedAgent && (
                                  <span 
                                    className="text-[8px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wide border bg-purple-950/30 border-purple-500/30 text-purple-300"
                                  >
                                    Agent {associatedAgent.name}
                                  </span>
                                )}
                                {!n.read && (
                                  <span className="text-[7px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                                    UNREAD
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400 leading-relaxed font-mono text-left">
                                {n.message}
                              </p>
                              <div className="text-[8px] text-slate-500 font-mono text-left">
                                UTC TIMESTAMP: {new Date(n.timestamp).toLocaleTimeString()} — {new Date(n.timestamp).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 self-end md:self-center">
                            {associatedAgent && (
                              <button
                                onClick={() => {
                                  // Switch active agent focus
                                  handleSelectRing(associatedAgent.index);
                                  // Mark as read
                                  setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
                                  // Re-focus on presence view to see signature live
                                  setActiveTab('presence');
                                  showToastNotification(
                                    "ROTATION SUCCESSFUL", 
                                    `Neural link focus shifted to ${associatedAgent.name}. Synced memory registers correctly!`, 
                                    "success"
                                  );
                                }}
                                className="h-8 px-3 rounded-lg bg-purple-600/15 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 hover:border-purple-500 text-[10px] font-semibold font-mono tracking-wide transition-all cursor-pointer flex items-center gap-1.5 uppercase"
                                title="Instantly shift cognitive senate focus here"
                              >
                                <RefreshCw className="w-3 h-3" />
                                Rotate Focus
                              </button>
                            )}

                            {!n.read && (
                              <button
                                onClick={() => {
                                  setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
                                }}
                                className="h-8 px-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-[10px] font-semibold font-mono tracking-wide transition-all cursor-pointer uppercase"
                              >
                                Dismiss
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
      
      {/* Cinematic Transition Overlay */}
      <div 
        id="cinematic-transition-overlay"
        className={`fixed inset-0 bg-black z-[9999] pointer-events-none transition-opacity duration-300 ease-in-out ${
          isCinematicFading ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Quick Command fuzzy-search Panel overlay */}
      {isCommandModalOpen && (
        <div 
          onClick={() => setIsCommandModalOpen(false)}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-[99998] flex items-start justify-center pt-[15vh] p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-slate-900/95 border border-slate-800/80 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden max-h-[50vh] transition-all animate-fadeIn"
          >
            {/* Search inputs */}
            <div className="flex items-center gap-3 px-4 h-12 border-b border-slate-800/50">
              <Search className="w-4 h-4 text-purple-400" />
              <input
                type="text"
                placeholder="Type a directive, agent, or viewport tab..."
                value={commandSearchQuery}
                onChange={(e) => {
                  setCommandSearchQuery(e.target.value);
                  setCommandSelectedIndex(0);
                }}
                className="flex-1 bg-transparent border-none outline-none font-sans text-xs text-slate-200 placeholder-slate-500"
                autoFocus
              />
              <div className="flex items-center gap-1">
                <span className="px-1.5 py-0.5 rounded bg-slate-850 border border-slate-800 text-[8px] text-slate-400 font-mono">ESC</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-850 border border-slate-800 text-[8px] text-slate-400 font-mono">↵</span>
              </div>
            </div>

            {/* Scrollable selections */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt, idx) => {
                  const isSelected = idx === commandSelectedIndex;
                  return (
                    <button
                      key={opt.label}
                      onClick={() => {
                        opt.action();
                        setIsCommandModalOpen(false);
                      }}
                      className={`w-full text-left p-3 rounded-xl transition-all duration-150 flex items-center justify-between gap-4 border cursor-pointer ${
                        isSelected
                          ? "bg-purple-950/20 border-purple-500/35 text-purple-200 shadow-[inset_0_1px_2px_rgba(168,85,247,0.05)]"
                          : "bg-transparent border-transparent text-slate-450 hover:bg-slate-950/40 hover:text-slate-350"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold block">{opt.label}</span>
                        <span className="text-[10px] text-slate-400 line-clamp-1 block mt-0.5 font-mono">{opt.description}</span>
                      </div>
                      <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full font-mono shrink-0 uppercase tracking-wider ${
                        isSelected
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : "bg-slate-950 text-slate-500 border border-slate-850"
                      }`}>
                        {opt.category}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="p-8 text-center text-slate-500 space-y-1">
                  <Terminal className="w-8 h-8 text-slate-700 mx-auto mb-2 animate-pulse" />
                  <p className="text-xs font-semibold text-slate-400">No system instructions matched "{commandSearchQuery}"</p>
                  <p className="text-[10px] text-slate-550">Refine query parities to unseal firmware commands.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-slate-800/50 bg-slate-950/40 flex justify-between items-center text-[8px] font-mono text-slate-500 uppercase tracking-widest leading-none">
              <span>Command Console v10.4.2</span>
              <div className="flex gap-2">
                <span>Navigate <span className="text-slate-400 font-bold">↑↓</span></span>
                <span>Select <span className="text-slate-400 font-bold">↵</span></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* High-Fidelity Floating Toast Alert */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-[99999] w-80 p-4 rounded-3xl bg-slate-950/90 border border-slate-800/80 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.8)] backdrop-blur-md animate-fadeIn flex flex-col gap-2 transition-all duration-300">
          <div className="flex gap-3">
            <div className={`p-2 rounded-xl shrink-0 flex items-center justify-center h-8 w-8 border ${
              activeToast.type === 'success' 
                ? "bg-emerald-950/50 border-emerald-500/30 text-emerald-400" 
                : activeToast.type === 'warning' 
                  ? "bg-orange-950/50 border-orange-500/30 text-orange-400" 
                  : "bg-purple-950/50 border-purple-500/30 text-purple-300"
            }`}>
              {activeToast.type === 'success' ? (
                <ShieldCheck className="w-4 h-4" />
              ) : activeToast.type === 'warning' ? (
                <ShieldAlert className="w-4 h-4 animate-pulse" />
              ) : (
                <Terminal className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold tracking-wide block font-sans text-slate-150">{activeToast.title}</span>
              <p className="text-[10px] text-slate-400 leading-normal mt-1 font-mono">{activeToast.message}</p>
            </div>
            <button 
              type="button"
              onClick={() => setActiveToast(null)}
              className="text-slate-500 hover:text-slate-100 text-xs self-start p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
          
          <div className="flex justify-end gap-2 border-t border-slate-900/40 pt-1.5 mt-0.5">
            <button
              type="button"
              onClick={() => {
                setActiveToast(null);
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
              }}
              className="text-[9px] font-mono tracking-wider text-purple-400 hover:text-purple-300 bg-purple-950/25 hover:bg-purple-955/40 border border-purple-500/20 hover:border-purple-500/45 px-2.5 py-1 rounded-lg cursor-pointer transition-all uppercase"
            >
              Dismiss All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
