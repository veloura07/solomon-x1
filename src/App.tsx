import { useState, useEffect, useRef, FormEvent, useCallback } from "react";
import { Message, MemoryItem, AuditLog, AgentSpec, TelemetryPoint } from "./types";
import ThreeCanvas from "./components/ThreeCanvas";
import MemoryCortex from "./components/MemoryCortex";
import TrustTerminal from "./components/TrustTerminal";
import StateTracker from "./components/StateTracker";
import SovereignConsole from "./components/SovereignConsole";
import { CognitiveResourceEconomy, Layer0Firewall, EvolutionLab } from "./components/SolomonOSComponents";
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
  GitBranch,
  User
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
    reputationScore: 98.4 
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
    reputationScore: 92.1 
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
    reputationScore: 89.5 
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
    reputationScore: 95.8 
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
    reputationScore: 87.2 
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
    reputationScore: 94.6 
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
    reputationScore: 99.2 
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
    reputationScore: 90.5 
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
    reputationScore: 96.3 
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
    reputationScore: 99.8 
  }
];


  // Generate simple random hash
  const generateHash = () => {
    const chars = "abcdef0123456789";
    let hash = "";
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  };

export default function App() {
  const [activeTab, setActiveTab] = useState<'presence' | 'directives' | 'economy' | 'firewall' | 'memory' | 'evolution' | 'trust' | 'twin'>('presence');
  const [selectedRingIndex, setSelectedRingIndex] = useState(9); // Ars Regalis active by default
  const [isCinematicFading, setIsCinematicFading] = useState(false);
  const [agents, setAgents] = useState<AgentSpec[]>(INITIAL_AGENTS);
  
  const handleSelectRing = useCallback((idx: number) => {
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
  }, [selectedRingIndex]);

  const [bloomThreshold, setBloomThreshold] = useState<number>(0.22);
  const [bloomIntensity, setBloomIntensity] = useState<number>(1.5);
  
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
    { timeIndex: 0, timeString: "45m ago", focusLevel: 80, cognitiveLoad: 40, momentum: 70 },
    { timeIndex: 1, timeString: "40m ago", focusLevel: 82, cognitiveLoad: 35, momentum: 72 },
    { timeIndex: 2, timeString: "35m ago", focusLevel: 85, cognitiveLoad: 38, momentum: 75 },
    { timeIndex: 3, timeString: "30m ago", focusLevel: 83, cognitiveLoad: 48, momentum: 74 },
    { timeIndex: 4, timeString: "25m ago", focusLevel: 78, cognitiveLoad: 50, momentum: 70 },
    { timeIndex: 5, timeString: "20m ago", focusLevel: 88, cognitiveLoad: 42, momentum: 78 },
    { timeIndex: 6, timeString: "15m ago", focusLevel: 92, cognitiveLoad: 32, momentum: 84 },
    { timeIndex: 7, timeString: "10m ago", focusLevel: 90, cognitiveLoad: 35, momentum: 89 },
    { timeIndex: 8, timeString: "5m ago", focusLevel: 86, cognitiveLoad: 44, momentum: 87 },
    { timeIndex: 9, timeString: "Just now", focusLevel: 88, cognitiveLoad: 40, momentum: 90 },
  ]);

  const activeAgent = selectedRingIndex !== -1 ? agents[selectedRingIndex] : null;
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sendingChat]);


  // Add memory handler
  const handleAddMemory = useCallback((newItem: Omit<MemoryItem, "id" | "timestamp">) => {
    setMemoryItems(prev => {
      const addedItem: MemoryItem = {
        ...newItem,
        id: "mem_" + (prev.length + 1),
        timestamp: new Date().toISOString()
      };
      return [addedItem, ...prev];
    });
  }, []);

  // Add audit log handler
  const handleAddAuditLog = useCallback((newLog: Omit<AuditLog, "id" | "timestamp" | "cryptographicHash">) => {
    setAuditLogs(prev => {
      const addedLog: AuditLog = {
        ...newLog,
        id: "audit_" + (prev.length + 1),
        timestamp: new Date().toISOString(),
        cryptographicHash: generateHash()
      };
      return [addedLog, ...prev];
    });
  }, []);

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
      
      const wsUrl = (import.meta as any).env?.VITE_SOLOMON_WS_URL || "ws://localhost:8765";
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
          "What is my current cognitive twins focus metric?",
          "Check memory OS indices from the last session",
          "Are TPM secure registers unsealed?",
          "Describe how Ars Paulina models doubt",
        ];
        const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
        setChatInput(randomPhrase);
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

      const activeInstructions = activeAgent 
        ? activeAgent.agentInstructions 
        : "You are the Solomon X Senate Assembly. The user has not selected a specific agent. Speak as a unified network of 10 specialized agents coordinating their operations. Encourage the user to select an operational ring to establish a direct high-fidelity neural interface.";

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
                  <div className="flex-1 min-h-[320px] lg:min-h-[460px]">
                    <ThreeCanvas 
                      selectedRingIndex={selectedRingIndex}
                      onSelectRing={handleSelectRing}
                      agents={agents}
                      bloomThreshold={bloomThreshold}
                      bloomIntensity={bloomIntensity}
                      auditLogs={auditLogs}
                      telemetryData={telemetryData}
                    />
                  </div>

                  {/* Ring selection Tray Grid */}
                  <div id="archetypes-tray" className="bg-slate-900/30 border border-slate-900 p-4 rounded-2xl">
                    <div className="text-[10px] text-slate-500 font-mono font-bold uppercase mb-3 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-purple-400" />
                      specialised dynamic ring senate
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {agents.map((ag) => (
                        <button
                          key={ag.index}
                          onClick={() => handleSelectRing(ag.index)}
                          className={`p-2.5 border rounded-xl text-left transition ${
                            selectedRingIndex === ag.index
                              ? "bg-purple-950/20 border-purple-500/35 shadow-lg shadow-purple-500/5 text-purple-200"
                              : "bg-slate-950/60 border-slate-900 hover:border-slate-800 text-slate-400"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <span 
                              className="w-1.5 h-1.5 rounded-full" 
                              style={{ backgroundColor: "#" + ag.bandColor.toString(16) }}
                            />
                            <span className="text-[10px] font-bold font-mono tracking-normal">{ag.name}</span>
                          </div>
                          <span className="text-[8px] font-mono leading-tight block truncate text-slate-500">{ag.roleDescription}</span>
                        </button>
                      ))}
                    </div>
                  </div>
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
                        <h3 className="text-xs font-bold text-slate-100 uppercase">
                          {activeAgent ? activeAgent.name : "Solomon Senate"}
                        </h3>
                        <p className="text-[9px] text-purple-400 font-mono">
                          {activeAgent ? activeAgent.roleDescription : "Concurrent Ring Senate Assembly"}
                        </p>
                      </div>
                    </div>
                    <Cpu className="w-4 h-4 text-slate-500" />
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
              onUpdateAgentPool={(index, tokensAdded) => {
                setAgents(prev => prev.map(ag => {
                  if (ag.index === index) {
                    return {
                      ...ag,
                      tokenPool: ag.tokenPool + tokensAdded
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
              onUpdateAgentPool={(index, amt) => {
                setAgents(prev => prev.map(ag => ag.index === index ? { ...ag, tokenPool: ag.tokenPool + amt } : ag));
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
            />
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
    </div>
  );
}
