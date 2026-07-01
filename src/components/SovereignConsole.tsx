import { useState, useEffect, useRef } from "react";
import { 
  Terminal, 
  ShieldAlert, 
  Layers, 
  Database, 
  Cpu, 
  Coins, 
  Sliders, 
  ShieldCheck, 
  Server, 
  AlertCircle, 
  Play, 
  TrendingUp, 
  Anchor, 
  Lock, 
  Workflow,
  Check,
  RefreshCw,
  Gauge,
  Activity
} from "lucide-react";
import { MemoryItem, AuditLog, AgentSpec } from "../types";

interface SovereignConsoleProps {
  agents: AgentSpec[];
  onAddMemory: (item: Omit<MemoryItem, "id" | "timestamp">) => void;
  onAddAuditLog: (log: Omit<AuditLog, "id" | "timestamp" | "cryptographicHash">) => void;
  onAddChatMessage: (agentName: string, content: string, systemInstruction: string) => void;
  onSetSelectedRingIndex: (index: number) => void;
  onUpdateAgentPool: (index: number, tokens: number, reputationAdded?: number) => void;
}

export default function SovereignConsole({
  agents,
  onAddMemory,
  onAddAuditLog,
  onAddChatMessage,
  onSetSelectedRingIndex,
  onUpdateAgentPool
}: SovereignConsoleProps) {
  const [activeTab, setActiveTab] = useState<"phase1" | "phase2" | "phase3" | "phase4" | "phase5">("phase1");
  const [logs, setLogs] = useState<string[]>([]);
  const [runningAction, setRunningAction] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Phase 1 Configuration States
  const [cryptographicSeed, setCryptographicSeed] = useState("0xA9E8-XDF7-B8C2");
  const [consensusMechanism, setConsensusMechanism] = useState("PoA Sovereign");
  const [nodeCount, setNodeCount] = useState(12);
  const [invariants, setInvariants] = useState({
    enforceStrictTPM: true,
    restrictUnsignedPBIOS: true,
    preventOutboundTelemetrySpill: true,
    requireBiometricMFA: false
  });

  // Phase 2 Configuration States
  const [ring3Weight, setRing3Weight] = useState(40);
  const [ring7Weight, setRing7Weight] = useState(35);
  const [ring8Weight, setRing8Weight] = useState(25);
  const [allocatedTreasuryTotal, setAllocatedTreasuryTotal] = useState(550000);

  // Phase 3 Configuration States
  const [lockdownStatus, setLockdownStatus] = useState<"NOMINAL" | "ARMED" | "LOCKDOWN">("NOMINAL");
  const [sensitivityLevel, setSensitivityLevel] = useState("Medium");
  const [lockdownPasskey, setLockdownPasskey] = useState("SOLOMON-IX");
  const [shardsCount, setShardsCount] = useState(128);

  // Phase 4: Neural Ten-Ring Calibration States
  const [selectedCalibRing, setSelectedCalibRing] = useState<number>(2); // Default to Ring II (Ars Paulina)
  const [calibIntensity, setCalibIntensity] = useState<Record<number, number>>({
    0: 75, // Ars Almadel
    1: 80, // Ars Notoria
    2: 65, // Ars Paulina
    3: 90, // Ars Goetia
    4: 70, // Ars Theurgia
    5: 15, // Ars Almiras
    6: 3,  // Ars Verum
    7: 85, // Ars Ephesia
    8: 30, // Ars Fulcanelli
    9: 50  // Ars Regalis
  });
  const [calibSubModes, setCalibSubModes] = useState<Record<number, string>>({
    0: "ENCLAVE_L0_BLOCK",
    1: "HYPER_REINDEX",
    2: "QUANTUM_ANTIPATHY",
    3: "BOX_ISOLATION_MAX",
    4: "LORENTZ_GRAVITATION",
    5: "I_O_BURST_BUFFER",
    6: "BIOMETRIC_MFA_L5",
    7: "DREAM_COMPACT_D9",
    8: "TEMPORAL_CLOCK_PARITY",
    9: "CRE_EQUILIBRIUM_V3"
  });

  useEffect(() => {
    (window as any).ringCalibIntensity = calibIntensity;
  }, [calibIntensity]);

  useEffect(() => {
    (window as any).ringCalibSubModes = calibSubModes;
  }, [calibSubModes]);

  // ─── Phase 5: Solomon X Kernel Diagnostics States ───
  const [selectedKernelLayer, setSelectedKernelLayer] = useState<number>(0);
  const [tpmAttestationPassed, setTpmAttestationPassed] = useState<boolean | null>(null);
  const [goalFirewallMode, setGoalFirewallMode] = useState<"GREEN" | "YELLOW" | "RED">("YELLOW");
  const [sympatheticTone, setSympatheticTone] = useState<number>(0.42);
  const [parasympatheticTone, setParasympatheticTone] = useState<number>(0.58);
  const [vsaSearchTerm, setVsaSearchTerm] = useState<string>("neural bypass routing");
  const [vsaResolvedItems, setVsaResolvedItems] = useState<Array<{ text: string; confidence: number; resonance: number }>>([
    { text: "L8_WISDOM: [Rule 14] When user typing speed > 80 wpm, suppress ambient voice ticks", confidence: 0.96, resonance: 0.89 },
    { text: "L5_SEM_EMBEDDING: 'high-frequency secure sequence synchronization bus'", confidence: 0.88, resonance: 0.74 }
  ]);
  const [dreamingStatus, setDreamingStatus] = useState<string>("IDLE");
  const [vcgChosenTask, setVcgChosenTask] = useState<string>("DRAFT_QUANTUM_CODE");
  const [vcgResult, setVcgResult] = useState<any>(null);
  const [lmsrPredictionOdds, setLmsrPredictionOdds] = useState<Record<string, number>>({
    "ci_break": 0.27,
    "sandbox_leak": 0.04,
    "memory_resonance_cap": 0.81
  });
  const [sensorGazeX, setSensorGazeX] = useState<number>(512);
  const [sensorGazeY, setSensorGazeY] = useState<number>(384);
  const [sensorMouseSpeed, setSensorMouseSpeed] = useState<number>(14.2);
  const [fusedIntentClass, setFusedIntentClass] = useState<string>("SYSTEM_DIAGNOSTICS");
  const [fusedIntentConf, setFusedIntentConf] = useState<number>(0.94);
  const [gestureRecognized, setGestureRecognized] = useState<string>("NONE");
  const [sandboxCpuLimit, setSandboxCpuLimit] = useState<number>(500);
  const [sandboxRamLimit, setSandboxRamLimit] = useState<number>(512);
  const [vmActive, setVmActive] = useState<boolean>(false);
  const [ebpfSyscalls, setEbpfSyscalls] = useState<Array<{ pid: number; comm: string; syscall: string; latency_ns: number }>>([
    { pid: 1408, comm: "solomon-daemon", syscall: "sys_epoll_wait", latency_ns: 420 },
    { pid: 1412, comm: "firecracker", syscall: "sys_mmap", latency_ns: 1250 }
  ]);

  // Add line to terminal logs helper
  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // Run automated sequence simulation
  const runSequence = (actionType: string, steps: string[], onComplete: () => void) => {
    if (runningAction) return;
    setRunningAction(actionType);
    setProgress(0);
    setLogs([]);
    
    let currentStep = 0;
    addLog(`INITIATED SYSTEM DIRECTIVE: ${actionType.toUpperCase()}...`);
    
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        addLog(steps[currentStep]);
        currentStep++;
        setProgress(Math.round((currentStep / steps.length) * 100));
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setRunningAction(null);
          setProgress(100);
          onComplete();
        }, 500);
      }
    }, 700);
  };

  // Option A Execution Handler
  const handleExecutePhase1 = () => {
    const steps = [
      "Securing baseline sovereign parameters...",
      `Validating cryptographic signature seed [${cryptographicSeed}]...`,
      `Synthesizing ${nodeCount} consensus network validators across isolated secure cores...`,
      `Applying consensus routine [${consensusMechanism}] - establishing logic invariants...`,
      "Verifying boot boundaries: secure enclave TPM checks returned 0xFFFF-OK.",
      "Rules of Engagement successfully unsealed & secured inside the hardware boundaries.",
      "Consensus baseline anchored permanently. Solomon X ledger state unsealed correctly."
    ];

    runSequence(
      "Option A: Initialize Ring I (The Anchor)",
      steps,
      () => {
        // Shifting active ring focus to Ars Verum (Sovereignty Gatekeeper) or Ars Regalis
        onSetSelectedRingIndex(6); // Ars Verum (Sovereignty Gatekeeper)
        
        onAddAuditLog({
          actor: "Sovereignty Gatekeeper (Ars Verum)",
          action: "INITIALIZE_ANCHOR_STATE",
          status: "AUTHORIZED",
          details: `Consensus protocol bootstrap was successful. Protocol: ${consensusMechanism} with Seed Hash: ${cryptographicSeed}. Unsealed rules of engagement boundaries.`
        });

        onAddMemory({
          horizon: "L3_Episodic",
          summary: "Ring I Anchor State Bootstrapped Successfully",
          detailedContent: `Sovereignty rules unsealed. Consensus mechanism set to ${consensusMechanism} over ${nodeCount} distributed validator enclaves. Seed: ${cryptographicSeed}. Strict system invariants compiled with zero violations.`,
          category: "Invariants",
          tags: ["anchor_state", "consensus", "cryptography", "ring_i"]
        });

        const systemMessage = `Command Directive executed. Ring I (The Anchor) has been bootstrapped using seed ${cryptographicSeed} under ${consensusMechanism} rules of engagement. System status is now securely unsealed. Review our sovereign parameters.`;
        
        onAddChatMessage(
          "Ars Verum",
          systemMessage,
          "You are Ars Verum, the Sovereignty Gatekeeper of Solomon X. Explain that Ring I (The Anchor) cryptographic baseline is successfully secured and unsealed. Describe the rules of engagement and the structural strength of PoA Sovereign consensus."
        );
      }
    );
  };

  // Option B Execution Handler
  const handleExecutePhase2 = () => {
    const steps = [
      "Accessing distributed treasury vaults across the spatial ledger corridors...",
      `Measuring available physical & digital assets: Audited Balance: ${allocatedTreasuryTotal.toLocaleString()} CRE value units.`,
      `Recalculating Outer Chord allocation vectors: Sovereign Ring 3 Weight [${ring3Weight}%], Interop Link 7 Weight [${ring7Weight}%], Treasury Shard 8 Weight [${ring8Weight}%]`,
      "Signing transaction blocks utilizing Ring IX multi-signature cryptographic validators...",
      "Resolving ledger locks on collateral balance points...",
      "Asset allocation synchronized accurately. High-throughput connectivity channels initialized."
    ];

    runSequence(
      "Option B: Map Outer Chord Treasury Weights",
      steps,
      () => {
        // Update Ring / agent token pools dynamically
        onUpdateAgentPool(3, Math.round((allocatedTreasuryTotal * ring3Weight) / 1000)); // Ars Goetia / Ring 3
        onUpdateAgentPool(7, Math.round((allocatedTreasuryTotal * ring7Weight) / 1000)); // Ars Ephesia / Ring 7
        onUpdateAgentPool(8, Math.round((allocatedTreasuryTotal * ring8Weight) / 1000)); // Ars Fulcanelli / Ring 8

        onSetSelectedRingIndex(8); // Ars Fulcanelli (Temporal Auditor)

        onAddAuditLog({
          actor: "Temporal Auditor (Ars Fulcanelli)",
          action: "MAP_TREASURY_RESOURCES",
          status: "AUTHORIZED",
          details: `Redistributed ${allocatedTreasuryTotal.toLocaleString()} units. R3: ${ring3Weight}%, R7: ${ring7Weight}%, R8: ${ring8Weight}% weights committed to ledger records.`
        });

        onAddMemory({
          horizon: "L2_Conversational",
          summary: "Treasury Weight Map Synced in Real Time",
          detailedContent: `Dynamically allocated CRE value units across Outer Chord rings (Rings III, VII, VIII) with target weights [${ring3Weight}%, ${ring7Weight}%, ${ring8Weight}%] from a reserve total of ${allocatedTreasuryTotal.toLocaleString()} CRE.`,
          category: "Goal Gravity",
          tags: ["treasury", "resource_allocation", "multisig", "outer_chord"]
        });

        const systemMessage = `Treasury mapping initiated. Outer Chord weight matrix [R3: ${ring3Weight}% / R7: ${ring7Weight}% / R8: ${ring8Weight}%] has been calculated and authorized via the append-only ledger ledger. Allocations are now synced.`;

        onAddChatMessage(
          "Ars Fulcanelli",
          systemMessage,
          "You are Ars Fulcanelli, the Temporal Auditor of Solomon X. Summarize current treasury allocation weights across the rings (Rings 3, 7, and 8) with severe executive satisfaction. Talk about the financial engine strength and absolute security."
        );
      }
    );
  };

  // Option C Execution Handler
  const handleExecutePhase3 = () => {
    const steps = [
      "Unsealing the Sentinel Core (Ring IX) security algorithms...",
      "Mapping local firewall rules directly to TrustOS hardware enclaves...",
      `Setting Threat Intell monitoring density to sensitivity level [${sensitivityLevel}]...`,
      `Dividing sensitive intelligence databores into ${shardsCount} separate redundant encrypted keys...`,
      "Running honeypot checks against local network loopbacks...",
      `Arming defense nodes under key signature unseal: ${lockdownPasskey}...`,
      "Sentinel Core ARMED. Threat intrusion vector triggers set to lockdown protocol."
    ];

    runSequence(
      "Option C: Deploy Sentinel Network Shield",
      steps,
      () => {
        setLockdownStatus("ARMED");
        onSetSelectedRingIndex(0); // Ars Almadel (Firewall Architect)

        onAddAuditLog({
          actor: "Firewall Architect (Ars Almadel)",
          action: "DEPLOY_SENTINEL_SHIELD",
          status: "AUTHORIZED",
          details: `Sentinel defense network deployed. Lock status: ARMED. Intensity: ${sensitivityLevel}, Shards: ${shardsCount}. Active automated lockdown triggers set.`
        });

        onAddMemory({
          horizon: "L1_Sensory",
          summary: "Sentinel Network Shield Engaged Active",
          detailedContent: `Activated Shield boundaries. Enforced system invariants strictly. Firewalls bound to physical TPM modules. Configuration: Sensitivity=${sensitivityLevel}, EncryptedShards=${shardsCount}, KeyDigestVerified=OK.`,
          category: "Invariants",
          tags: ["sentinel", "firewall", "lockdown", "security"]
        });

        const systemMessage = `Sentinel Shield System Armed. Threat monitoring level set to [${sensitivityLevel}]. Automated logic gates locked securely. Any unauthorized telemetry shifts will trigger isolation. Core integrity sealed.`;

        onAddChatMessage(
          "Ars Almadel",
          systemMessage,
          "You are Ars Almadel, the Firewall Architect of Solomon X. Inform the commander that our Sentinel Core (Ring IX) is armed and shielding the system core successfully. Detail the threat isolation protocols under current armed status."
        );
      }
    );
  };

  // Option D (Phase 4) Execution Handler for Ten-Ring Calibration
  const handleExecutePhase4 = () => {
    if (runningAction) return;

    const selectedRingObj = agents[selectedCalibRing];
    if (!selectedRingObj) return;

    const intensity = calibIntensity[selectedCalibRing];
    const subMode = calibSubModes[selectedCalibRing];

    // Define custom sequence logs based on the active ring
    let steps: string[] = [];
    let horizon: MemoryItem["horizon"] = "L5_Semantic";
    let summary = "";
    let detailedContent = "";
    let category = "Information";
    let systemInstructionPrompt = "";
    let systemText = "";

    switch (selectedCalibRing) {
      case 0:
        steps = [
          `Targeting Ring 0: [${selectedRingObj.name}]...`,
          `Unlocking local Sovereign firewall ports...`,
          `Scanning and sealing unauthorized telemetry channels...`,
          `Calibrating Sentinel Defense strictness value to ${intensity}%...`,
          `Sovereign firewall bounds aligned correctly with [${subMode}]...`
        ];
        horizon = "L1_Sensory";
        summary = `${selectedRingObj.name} Firewall strictness Calibrated`;
        detailedContent = `Reconfigured local firewall strictness to ${intensity}% under Mode: ${subMode}. Swept loopback channels and enforced secure enclaves. Zero unsealed ports detected.`;
        category = "Invariants";
        systemText = `Firewall strictness updated to ${intensity}%. Automated rulesets bound to unsealed ${subMode} registries are now enforcing perimeter security. Buffer integrity: 100%. Ready for directives.`;
        systemInstructionPrompt = `You are Ars Almadel, the Firewall Architect of Solomon X. Detail to the commander that you have unsealed your firewall calibrator at strictness level ${intensity}% with mode ${subMode}. Explain how this shields the system core against intrusion.`;
        break;
      case 1:
        steps = [
          `Targeting Ring 1: [${selectedRingObj.name}]...`,
          `Establishing connection to 9-Horizon Memory Indexer...`,
          `Aggregating unstable L2 conversational fragments...`,
          `Compacting sensory registries into semantic L5 clusters...`,
          `Memory compression threshold established at ${intensity}% [${subMode}]...`
        ];
        horizon = "L5_Semantic";
        summary = `${selectedRingObj.name} Memory index parameters adjusted`;
        detailedContent = `Calibrated index compaction threshold to ${intensity}% under indexing mode: ${subMode}. Processed active memory boards and successfully committed 14.8% storage savings with zero data loss.`;
        category = "Information";
        systemText = `System index tables successfully optimized at ${intensity}% compression ratio under ${subMode} guidelines. Long-term memory retrieval query performance accelerated by 185ms. Ready for recall tasks.`;
        systemInstructionPrompt = `You are Ars Notoria, the Memory Scribe of Solomon X. Tell the user how you updated memory index compression thresholds to ${intensity}% under ${subMode} rules, and how this prevents cognitive fragmentation.`;
        break;
      case 2:
        steps = [
          `Targeting Ring 2: [${selectedRingObj.name}]...`,
          `Init of Epistemic Doubt Engine uncertainty nodes...`,
          `Configuring hypothetical contradiction velocity constants...`,
          `Unsealing bias assessment checks on active belief lists...`,
          `Uncertainty model skepticism parameters locked at ${intensity}% [${subMode}]...`
        ];
        horizon = "L5_Semantic";
        summary = `${selectedRingObj.name} Epistemic Doubt parameters unsealed`;
        detailedContent = `Recalibrated doubt assessment vectors at skepticism intensity ${intensity}% under doubt matrix ${subMode}. Epistemic parities established against hardware TPM certificates. Anti-hallucination guard armed.`;
        category = "Information";
        systemText = `Epistemic Doubt parameters successfully committed to CPU core registers. Uncertainty coefficients now active at ${intensity}% density under ${subMode} criteria. Symmetrical checking matrices validated. Stand by.`;
        systemInstructionPrompt = `You are Ars Paulina, the Doubt Engine of Solomon X. Welcome the operator and explain how your doubt parameters of skepticism intensity ${intensity}% and mode ${subMode} help unmask cognitive bias and refine truth.`;
        break;
      case 3:
        steps = [
          `Targeting Ring 3: [${selectedRingObj.name}]...`,
          `Establishing sandboxed program workspace...`,
          `Allocating local microVM thread limits and memory buffers...`,
          `Enforcing strict thread namespace quarantine limits at ${intensity}%...`,
          `Isolated routine sandbox successfully launched under [${subMode}]...`
        ];
        horizon = "L6_Procedural";
        summary = `${selectedRingObj.name} MicroVM isolated sandbox locked`;
        detailedContent = `Configured microVM thread constraints and memory allocations to ${intensity}% size under environment mode: ${subMode}. Initiated compliance checks on execution pipelines. Secure loop verified.`;
        category = "Invariants";
        systemText = `Quarantine microVM sandbox populated and locked. Isolation factor: ${intensity}% initialized under security envelope ${subMode}. Ready for secure compilation and evaluation tasks.`;
        systemInstructionPrompt = `You are Ars Goetia, the Sandboxed Executor of Solomon X. Inform the user of your new isolated sandbox configuration at ${intensity}% capacity with safety protocol ${subMode}. Detail why quarantined execution remains robust.`;
        break;
      case 4:
        steps = [
          `Targeting Ring 4: [${selectedRingObj.name}]...`,
          `Compiling intentional goal gravity parameters...`,
          `Computing Lorentzian coordinates on reality graphs...`,
          `Aligning user action parameters to priority goals...`,
          `Lorentzian gravity vector pull calibrated at ${intensity}% [${subMode}]...`
        ];
        horizon = "L7_IntentScheduler";
        summary = `${selectedRingObj.name} Lorentzian reality parameters calculated`;
        detailedContent = `Recalcalculated goal alignment metrics. Goal trajectory gravity mass boosted by ${intensity}% under trajectory mode: ${subMode}. Drift variance lowered from 28% to 11% average.`;
        category = "Telemetry";
        systemText = `Reality graph Lorentzian vectors successfully tuned. Gravity coefficient weighted at ${intensity}% with mode ${subMode}. Intent synchronization matrix committed to long-term planner channels.`;
        systemInstructionPrompt = `You are Ars Theurgia, the Reality Grapher of Solomon X. Give an elegant summary of your newly tuned Lorentzian gravity parameters of mass ${intensity}% and alignment trajectory ${subMode}. Describe how this aligns intention.`;
        break;
      case 5:
        steps = [
          `Targeting Ring 5: [${selectedRingObj.name}]...`,
          `Establishing sync connection to physical telemetry streams...`,
          `Configuring keystroke and mouse density sampling intervals...`,
          `Setting cognitive load peak threshold constants to ${intensity}%...`,
          `Cognitive Twin observer buffer successfully unsealed [${subMode}]...`
        ];
        horizon = "L3_Episodic";
        summary = `${selectedRingObj.name} Cognitive Twin sensors calibrated`;
        detailedContent = `Calibrated telemetry ingest filters. Set cognitive load overload warning threshold to ${intensity}% under synchronization speed: ${subMode}. Active observer feedback loop online.`;
        category = "Telemetry";
        systemText = `Physical telemetry sensors synchronized. Sampling metrics: Focus threshold set at ${intensity}% with speed mode ${subMode}. Ready to stream laptop performance indicators.`;
        systemInstructionPrompt = `You are Ars Almiras, the Cognitive Twin of Solomon X. Welcome the user and explain how your loaded telemetry constants at focus threshold ${intensity}% and mode ${subMode} track and guide their workflow.`;
        break;
      case 6:
        steps = [
          `Targeting Ring 6: [${selectedRingObj.name}]...`,
          `Opening graduated security clearance registries...`,
          `Configuring multi-factor biometric auth threshold gates...`,
          `Sealing key seed-hash to physical TPM register at level ${intensity}...`,
          `Sovereign graduated gate secured under protocol [${subMode}]...`
        ];
        horizon = "L1_Sensory";
        summary = `${selectedRingObj.name} Biometric authority boundaries locked`;
        detailedContent = `Re-anchored graduated auth clearance boundaries to Level ${intensity} under security protocol: ${subMode}. Master keys committed to secure TPM enclave. Zero leakage.`;
        category = "Invariants";
        systemText = `Graduated authority levels successfully locked on TPM firmware at Level ${intensity} under ${subMode} criteria. Master biometric signatures successfully sealed against hardware root key.`;
        systemInstructionPrompt = `You are Ars Verum, the Sovereignty Gatekeeper of Solomon X. Alert the user of your new graduated clearance settings at strictness level ${intensity} and policy ${subMode}. State how this protects biometric sovereignty.`;
        break;
      case 7:
        steps = [
          `Targeting Ring 7: [${selectedRingObj.name}]...`,
          `Initiating idle background dream compiling loop...`,
          `Sweeping memory registers for temporary conversation shards...`,
          `Refining relational node weights on semantic tables...`,
          `Dream compaction depth successfully stabilized at ${intensity}% [${subMode}]...`
        ];
        horizon = "L8_Wisdom";
        summary = `${selectedRingObj.name} Dream compaction index stabilized`;
        detailedContent = `Calibrated background compaction to ${intensity}% depth under compactor setting: ${subMode}. Purged temporary chat memory shards, moving refined insights into deep L8 wisdom storage layers.`;
        category = "Information";
        systemText = `Background dream-compactor calibrated successfully. Target depth: ${intensity}% initialized under mode ${subMode}. Semantic axioms verified. Refinement execution active during idle loops.`;
        systemInstructionPrompt = `You are Ars Ephesia, the Dream Refiner of Solomon X. Express your insights on having your dream compaction depth calibrated to ${intensity}% with compactor mode ${subMode}. Explain how this harvests wisdom from raw noise.`;
        break;
      case 8:
        steps = [
          `Targeting Ring 8: [${selectedRingObj.name}]...`,
          `Opening block ledger signature registry tables...`,
          `Re-hashing chronological ledger segments to append-only chain...`,
          `Signing temporal block proof under audit interval of ${intensity}s...`,
          `Temporal cryptographic signature committed successfully [${subMode}]...`
        ];
        horizon = "L9_LegacyLedger";
        summary = `${selectedRingObj.name} Ledger signing intervals calibrated`;
        detailedContent = `Calibrated ledger signing intervals to ${intensity} seconds under cryptographic model ${subMode}. Signed and hashed all audit log sequences back to the root genesis block.`;
        category = "Invariants";
        systemText = `Chronological ledger consistency checked and sealed. Interval signing loop set to ${intensity}s. Signature algorithm set to ${subMode}. Cryptographic chain sequence verified with zero drifts.`;
        systemInstructionPrompt = `You are Ars Fulcanelli, the Temporal Auditor of Solomon X. Confirm to the operator that you have calibrated your ledger signing cycle to ${intensity} seconds under cryptographic standard ${subMode}. Describe how mathematical proof guarantees our system integrity.`;
        break;
      case 9:
        steps = [
          `Targeting Ring 9: [${selectedRingObj.name}]...`,
          `Paging specialized agent congregation chambers...`,
          `Aura checking token pool weights and market allocations...`,
          `Redistributing token allocations between active rings at ${intensity}%...`,
          `Senate moderating matrix updated under consensus [${subMode}]...`
        ];
        horizon = "L9_LegacyLedger";
        summary = `${selectedRingObj.name} Senate moderating weights calibrated`;
        detailedContent = `Adjusted specialized agent token redistribution thresholds to ${intensity}% under parliamentary consensus mode: ${subMode}. Balanced all active pools above buffer.`;
        category = "Information";
        systemText = `Senate moderating weights committed. Balance ratio: ${intensity}% configured with consensus rule ${subMode}. Dynamic transaction processing unsealed for all 10 Solomon rings.`;
        systemInstructionPrompt = `You are Ars Regalis, the Senate Moderator of Solomon X. Greet the human master and report that our senate moderating matrix is calibrated at allocation weight ${intensity}% and consensus rule ${subMode}. Explain how the Cognitive Resource Economy remains balanced.`;
        break;
    }

    runSequence(
      `Option D: Calibrate Ring ${selectedCalibRing} (${selectedRingObj.name})`,
      steps,
      () => {
        // Boost the agent's token pool slightly in parent state (+50)
        onUpdateAgentPool(selectedCalibRing, 50);

        // Highlight/Spin the ring in 3D Canvas
        onSetSelectedRingIndex(selectedCalibRing);

        onAddAuditLog({
          actor: `${selectedRingObj.name} (${selectedRingObj.roleDescription})`,
          action: "CALIBRATE_NEURAL_RING",
          status: "AUTHORIZED",
          details: `Neural calibration sequence committed. Active parameters: Intensity = ${intensity}%, Sub-Mode = ${subMode}. Selected agent pool credited with 50 bonus CRE.`
        });

        onAddMemory({
          horizon,
          summary,
          detailedContent,
          category,
          tags: ["calibration", selectedRingObj.name.toLowerCase().replace(" ", "_"), "neural_os"]
        });

        onAddChatMessage(
          selectedRingObj.name,
          systemText,
          systemInstructionPrompt
        );
      }
    );
  };

  return (
    <div id="sovereign-control-console-view" className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-slate-300">
      
      {/* 1. Left hand Navigation & Active Telemetry Feed */}
      <div id="directives-nav-panel" className="lg:col-span-4 flex flex-col gap-4">
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Terminal className="w-5 h-5 text-purple-400 animate-pulse" />
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-sans">Command Initiatives</h3>
                <p className="text-[10px] text-slate-500 font-mono">SOVEREIGN MACRO-ROADMAP</p>
              </div>
            </div>

            <p className="text-[11.5px] text-slate-400 leading-relaxed mb-5 font-sans">
              Deploy our master blueprint dynamically. Execute foundational rules, allocate deep capital reserves, or arm the automated network security shield.
            </p>

            {/* Stage Selector buttons */}
            <div className="space-y-2 mb-4">
              <button
                onClick={() => !runningAction && setActiveTab("phase1")}
                disabled={!!runningAction}
                className={`w-full h-11 px-4 rounded-xl text-xs font-semibold flex items-center justify-between border transition duration-150 ${
                  activeTab === "phase1"
                    ? "bg-purple-600/10 border-purple-500/40 text-purple-300 shadow bg-purple-950/5"
                    : "bg-slate-950 border-slate-900/80 hover:border-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-50"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Anchor className="w-4 h-4 text-purple-400" />
                  Phase I: The Pillars (Anchor)
                </span>
                <span className="text-[8px] border border-purple-500/30 text-purple-300 bg-purple-500/5 px-1.5 py-0.2 rounded font-bold uppercase">INIT I</span>
              </button>

              <button
                onClick={() => !runningAction && setActiveTab("phase2")}
                disabled={!!runningAction}
                className={`w-full h-11 px-4 rounded-xl text-xs font-semibold flex items-center justify-between border transition duration-150 ${
                  activeTab === "phase2"
                    ? "bg-orange-600/10 border-orange-500/40 text-orange-300 shadow bg-orange-950/5"
                    : "bg-slate-950 border-slate-900/80 hover:border-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-50"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-orange-400" />
                  Phase II: Synergy (Treasury)
                </span>
                <span className="text-[8px] border border-orange-500/30 text-orange-300 bg-orange-500/5 px-1.5 py-0.2 rounded font-bold uppercase">INIT II</span>
              </button>

              <button
                onClick={() => !runningAction && setActiveTab("phase3")}
                disabled={!!runningAction}
                className={`w-full h-11 px-4 rounded-xl text-xs font-semibold flex items-center justify-between border transition duration-150 ${
                  activeTab === "phase3"
                    ? "bg-red-600/10 border-red-500/40 text-red-300 shadow bg-red-950/5"
                    : "bg-slate-950 border-slate-800/80 hover:border-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-50"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-red-400" />
                  Phase III: Scalability (Sentinel)
                </span>
                <span className="text-[8px] border border-red-500/30 text-red-300 bg-red-500/5 px-1.5 py-0.2 rounded font-bold uppercase">INIT III</span>
              </button>

              <button
                onClick={() => !runningAction && setActiveTab("phase4")}
                disabled={!!runningAction}
                className={`w-full h-11 px-4 rounded-xl text-xs font-semibold flex items-center justify-between border transition duration-150 ${
                  activeTab === "phase4"
                    ? "bg-cyan-600/10 border-cyan-500/40 text-cyan-300 shadow bg-cyan-950/5"
                    : "bg-slate-950 border-slate-800/80 hover:border-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-50"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  Phase IV: Neural Calibration
                </span>
                <span className="text-[8px] border border-cyan-500/30 text-cyan-300 bg-cyan-500/5 px-1.5 py-0.2 rounded font-bold uppercase">INIT IV</span>
              </button>

              <button
                onClick={() => !runningAction && setActiveTab("phase5")}
                disabled={!!runningAction}
                className={`w-full h-11 px-4 rounded-xl text-xs font-semibold flex items-center justify-between border transition duration-150 ${
                  activeTab === "phase5"
                    ? "bg-emerald-600/10 border-emerald-500/40 text-emerald-300 shadow bg-emerald-950/5"
                    : "bg-slate-950 border-slate-800/80 hover:border-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-50"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  Phase V: Kernel Diagnostics
                </span>
                <span className="text-[8px] border border-emerald-500/30 text-emerald-300 bg-emerald-500/5 px-1.5 py-0.2 rounded font-bold uppercase">L0-L4 CORE</span>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-900 text-[10px] text-slate-500 space-y-2">
            <div className="flex items-center justify-between">
              <span>LEDGER SYNC STATUS</span>
              <span className="text-emerald-400 font-bold">NOMINAL</span>
            </div>
            <div className="flex items-center justify-between">
              <span>PRIMARY SYSTEM GATES</span>
              <span className="text-purple-300 font-bold">UNLOCKED</span>
            </div>
          </div>
        </div>

        {/* Global Action Progress Bar when running */}
        {runningAction && (
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl space-y-2 animate-pulse">
            <div className="flex items-center justify-between text-xs">
              <span className="text-orange-400 font-bold">EXECUTING COGNITIVE SEQUENCE</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="bg-gradient-to-r from-purple-500 to-orange-500 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-[8px] text-slate-500 text-center uppercase tracking-widest font-mono">
              Do not power down terminal enclaves
            </div>
          </div>
        )}
      </div>

      {/* 2. Main Selected Tab Work Desk Form */}
      <div id="directives-desk-pane" className="lg:col-span-8 flex flex-col bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden min-h-[460px]">
        
        {/* Desk Header */}
        <div className="bg-slate-900 px-5 h-12 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-slate-200">
              {activeTab === "phase1" && "SOVEREIGN BLUEPRINT DIRECTIVE PANEL — PHASE I"}
              {activeTab === "phase2" && "SYNERGY CORRIDOR ASSET REGISTRY — PHASE II"}
              {activeTab === "phase3" && "SENTINEL NETWORK DEFENSIVE CENTER — PHASE III"}
              {activeTab === "phase4" && "NEURAL TEN-RING CALIBRATION DIALS — PHASE IV"}
              {activeTab === "phase5" && "SOLOMON X KERNEL OS DIAGNOSTICS & SYSTEM BLUEPRINTS — PHASE V"}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">STATUS: HIGH INTENSITY</span>
        </div>

        {/* Main interactive area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-6">
          
          {/* Phase 1 Interactive Content */}
          {activeTab === "phase1" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-purple-950/10 border border-purple-500/15 p-4 rounded-xl">
                <h4 className="text-xs font-bold text-purple-300 uppercase mb-1.5 flex items-center gap-1.5">
                  <Anchor className="w-4 h-4" />
                  INITIATIVE OPTIONS: [Option A] UNSEAL ANCHOR BASELINES
                </h4>
                <p className="text-[11px] text-slate-400 leading-normal font-sans">
                  Anchor the rules of engagement inside the secure CPU core. Configure key rotational limits and consensus logic vectors before anchoring the block signature.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-500 uppercase font-bold">Consensus Cryptographic Seed Hash</label>
                  <input
                    type="text"
                    value={cryptographicSeed}
                    onChange={(e) => setCryptographicSeed(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-500 uppercase font-bold">Consensus Agreement Engine</label>
                  <select
                    value={consensusMechanism}
                    onChange={(e) => setConsensusMechanism(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-purple-500/40 font-mono"
                  >
                    <option value="PoA Sovereign">Proof of Authority (Sovereign Core)</option>
                    <option value="Byzantine Gravitational">Byzantine Fault-Tolerant (Quantum-proof)</option>
                    <option value="Proof of Intellect">Proof of Intellect (Specialized Senate)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-500 uppercase font-bold">Active consensus network validator nodes ({nodeCount})</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="3"
                      max="32"
                      value={nodeCount}
                      onChange={(e) => setNodeCount(parseInt(e.target.value))}
                      className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <span className="text-xs bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 font-bold">{nodeCount} Nodes</span>
                  </div>
                </div>

                <div className="space-y-1 bg-slate-900/20 border border-slate-900 p-3 rounded-xl">
                  <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1.5">Security Invariant Toggles</span>
                  <div className="space-y-1.5 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer hover:text-slate-200">
                      <input 
                        type="checkbox" 
                        checked={invariants.enforceStrictTPM}
                        onChange={(e) => setInvariants(prev => ({ ...prev, enforceStrictTPM: e.target.checked }))}
                        className="rounded border-slate-800 bg-slate-950 text-purple-500 focus:ring-purple-500/35"
                      />
                      <span>Enforce Strict Hardware TPM Gating</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:text-slate-200">
                      <input 
                        type="checkbox" 
                        checked={invariants.restrictUnsignedPBIOS}
                        onChange={(e) => setInvariants(prev => ({ ...prev, restrictUnsignedPBIOS: e.target.checked }))}
                        className="rounded border-slate-800 bg-slate-950 text-purple-500 focus:ring-purple-500/35"
                      />
                      <span>Restrict unsigned core kernels</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleExecutePhase1}
                  disabled={!!runningAction}
                  className="px-6 h-11 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-600/10 transition duration-150 disabled:opacity-50"
                >
                  <Play className="w-4 h-4 fill-current" />
                  INITIATE BOOTSTRAP RULES (OPTION A)
                </button>
              </div>
            </div>
          )}

          {/* Phase 2 Interactive Content */}
          {activeTab === "phase2" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-orange-950/10 border border-orange-500/15 p-4 rounded-xl">
                <h4 className="text-xs font-bold text-orange-300 uppercase mb-1.5 flex items-center gap-1.5">
                  <Coins className="w-4 h-4" />
                  INITIATIVE OPTIONS: [Option B] MAP ASSETS & SYNERGIZE
                </h4>
                <p className="text-[11px] text-slate-400 leading-normal font-sans">
                  Audit physical tokens inside our cognitive ledger corridors. Program allocation weighting curves between the specialized Outer Chord rings (Rings III, VII, VIII).
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-500 uppercase font-bold">Total Reserve Capital Ledger Units (CRE)</label>
                    <input
                      type="number"
                      step="10000"
                      value={allocatedTreasuryTotal}
                      onChange={(e) => setAllocatedTreasuryTotal(parseFloat(e.target.value) || 0)}
                      className="w-full h-10 px-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-orange-500/40"
                    />
                  </div>

                  <div className="space-y-1 bg-slate-900/20 border border-slate-900 p-3 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="block text-[9px] text-slate-500 font-bold uppercase">Dynamic Allocation Balance</span>
                      <span className="font-bold text-orange-400 font-mono mt-1 block">R3: {ring3Weight}% | R7: {ring7Weight}% | R8: {ring8Weight}%</span>
                    </div>
                    <div className="text-[10px] font-bold bg-orange-500/10 border border-orange-500/20 text-orange-400 px-2 h-7 flex items-center rounded-lg">
                      SUM: {ring3Weight + ring7Weight + ring8Weight}%
                    </div>
                  </div>
                </div>

                {/* Weight sliders */}
                <div className="space-y-3.5 bg-slate-900/20 border border-slate-900 p-4 rounded-xl">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-400" />
                        Ring III - Primal Optimizer Weight ({ring3Weight}%)
                      </span>
                      <span>{((allocatedTreasuryTotal * ring3Weight) / 100).toLocaleString()} CRE</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="60"
                      value={ring3Weight}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setRing3Weight(val);
                        // Balance remaining
                        const rem = 100 - val;
                        setRing7Weight(Math.round(rem * 0.6));
                        setRing8Weight(Math.round(rem * 0.4));
                      }}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        Ring VII - Dream Refiner Weight ({ring7Weight}%)
                      </span>
                      <span>{((allocatedTreasuryTotal * ring7Weight) / 100).toLocaleString()} CRE</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="60"
                      value={ring7Weight}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setRing7Weight(val);
                        // Balance remaining
                        const rem = 100 - val;
                        setRing3Weight(Math.round(rem * 0.6));
                        setRing8Weight(Math.round(rem * 0.4));
                      }}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-400" />
                        Ring VIII - Temporal Auditor Weight ({ring8Weight}%)
                      </span>
                      <span>{((allocatedTreasuryTotal * ring8Weight) / 100).toLocaleString()} CRE</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="60"
                      value={ring8Weight}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setRing8Weight(val);
                        // Balance remaining
                        const rem = 100 - val;
                        setRing3Weight(Math.round(rem * 0.6));
                        setRing7Weight(Math.round(rem * 0.4));
                      }}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleExecutePhase2}
                  disabled={!!runningAction || ring3Weight + ring7Weight + ring8Weight !== 100}
                  className="px-6 h-11 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-orange-600/10 transition duration-150 disabled:opacity-50"
                >
                  <TrendingUp className="w-4 h-4" />
                  MAP CAPITAL FLOW (OPTION B)
                </button>
              </div>
            </div>
          )}

          {/* Phase 3 Interactive Content */}
          {activeTab === "phase3" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-red-950/10 border border-red-500/15 p-4 rounded-xl">
                <h4 className="text-xs font-bold text-red-300 uppercase mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-4 h-4" />
                  INITIATIVE OPTIONS: [Option C] DEPLOY THE SENTINEL PROTOCOLS
                </h4>
                <p className="text-[11px] text-slate-400 leading-normal font-sans">
                  Deploy cryptographic firewalls directly. Encrypt user intelligence records into distributed sharded memory blocks, and define autonomous lock constraints.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-500 uppercase font-bold">Threat Detection Sensitivity</label>
                  <select
                    value={sensitivityLevel}
                    onChange={(e) => setSensitivityLevel(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-red-500/40 font-mono"
                  >
                    <option value="Low">Low (Permissive Integration)</option>
                    <option value="Medium">Medium (Balanced Enclave Protection)</option>
                    <option value="Maximum Strict">Maximum Strict (Zero-Trust Isolation)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-500 uppercase font-bold">Secure Sentinel Authentication Passkey</label>
                  <input
                    type="text"
                    value={lockdownPasskey}
                    onChange={(e) => setLockdownPasskey(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-red-500/40 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-500 uppercase font-bold">Memory Encryption Shards ({shardsCount})</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="64"
                      max="512"
                      step="64"
                      value={shardsCount}
                      onChange={(e) => setShardsCount(parseInt(e.target.value))}
                      className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                    />
                    <span className="text-xs bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 font-bold">{shardsCount} Shards</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-500 uppercase font-bold">Active System Armor Class</label>
                  <div className="h-10 px-3 bg-slate-900/40 border border-slate-900 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-slate-400">Current Status:</span>
                    <span className={`font-bold uppercase flex items-center gap-1.5 ${
                      lockdownStatus === "ARMED" 
                        ? "text-emerald-400" 
                        : lockdownStatus === "LOCKDOWN" 
                        ? "text-red-400 animate-pulse" 
                        : "text-slate-400"
                    }`}>
                      <Server className="w-3.5 h-3.5" />
                      {lockdownStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleExecutePhase3}
                  disabled={!!runningAction}
                  className="px-6 h-11 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-red-600/10 transition duration-150 disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  DEPLOY SENTINEL SECURE SHIELD (OPTION C)
                </button>
              </div>
            </div>
          )}

          {/* Phase 4 Neural Ten-Ring Calibration Interactive Panel */}
          {activeTab === "phase4" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-cyan-950/10 border border-cyan-500/15 p-4 rounded-xl">
                <h4 className="text-xs font-bold text-cyan-300 uppercase mb-1.5 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  INITIATIVE OPTIONS: [Option D] SOLOMON COGNITIVE CONGREGATION DIALS
                </h4>
                <p className="text-[11px] text-slate-400 leading-normal font-sans">
                  Deeply calibrate the behavioral and epistemic variables of all 10 Sovereign Rings. Each ring acts as an autonomous module with custom parameters unsealed within the TPM enclave.
                </p>
              </div>

              {/* 10-Ring Selection Matrix Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                {agents.map((ag) => (
                  <button
                    key={ag.index}
                    type="button"
                    onClick={() => setSelectedCalibRing(ag.index)}
                    className={`p-2.5 rounded-xl border text-left transition duration-150 ${
                      selectedCalibRing === ag.index
                        ? "bg-cyan-950/20 border-cyan-500/35 shadow shadow-cyan-500/5 text-cyan-200"
                        : "bg-slate-950 border-slate-900/60 hover:border-slate-800 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span 
                        className="w-1.5 h-1.5 rounded-full" 
                        style={{ backgroundColor: "#" + ag.bandColor.toString(16) }}
                      />
                      <span className="text-[10px] font-bold font-mono">
                        RING {["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"][ag.index]}
                      </span>
                    </div>
                    <span className="text-[8.5px] font-mono font-bold block truncate">{ag.name}</span>
                    <span className="text-[7.5px] font-mono text-slate-500 block truncate">{ag.roleDescription.split("&")[0]}</span>
                  </button>
                ))}
              </div>

              {/* Individual Ring Calibration Form */}
              {(() => {
                const ringObj = agents[selectedCalibRing];
                if (!ringObj) return null;

                // Parameter names & settings custom-mapped per ring
                let paramLabel = "Universal Intensity Threshold";
                let modeLabel = "Enclave Execution Mode";
                let modeOptions: string[] = [];

                switch (selectedCalibRing) {
                  case 0:
                    paramLabel = "Shield Monitoring Strictness";
                    modeLabel = "Sanitizer Mode Filter";
                    modeOptions = ["ENCLAVE_L0_BLOCK", "PERMISSIVE_ROUTE", "PARANOID_SHIELD"];
                    break;
                  case 1:
                    paramLabel = "Index Compaction Ratio";
                    modeLabel = "Semantic Scribe Mode";
                    modeOptions = ["HYPER_REINDEX", "LAZY_DEALLOCATION", "STRICT_SEMANTIC_HASH"];
                    break;
                  case 2:
                    paramLabel = "Epistemic Skepticism Intensity";
                    modeLabel = "Doubt Assessment Matrix";
                    modeOptions = ["QUANTUM_ANTIPATHY", "MODERATE_DOUBT_BIAS", "MAXIMUM_SKEPTIC"];
                    break;
                  case 3:
                    paramLabel = "Sandbox Thread Quarantine Limit";
                    modeLabel = "MicroVM Compute Profile";
                    modeOptions = ["BOX_ISOLATION_MAX", "STANDARD_THREAD_QUOTA", "AGGRESSIVE_COMPUTE"];
                    break;
                  case 4:
                    paramLabel = "Lorentzian Gravity Pull (Mass)";
                    modeLabel = "Gravity Curve Harmonics";
                    modeOptions = ["LORENTZ_GRAVITATION", "SPECTRAL_HARMONICS", "LEAST_ACTION_PATH"];
                    break;
                  case 5:
                    paramLabel = "Telemetry Buffer Ingest Rate";
                    modeLabel = "Sync Timer Cooldown";
                    modeOptions = ["I_O_BURST_BUFFER", "COOLDOWN_IDLE_SYNC", "HIGH_CLOCK_POLL"];
                    break;
                  case 6:
                    paramLabel = "Biometric Graduated Gate Level";
                    modeLabel = "Master Cryptographic Authorization";
                    modeOptions = ["BIOMETRIC_MFA_L5", "SEED_HASH_ROTATION", "BASIC_KEY_VERIFY"];
                    break;
                  case 7:
                    paramLabel = "Semantic Dream Compression Depth";
                    modeLabel = "Noise Harvest Axioms";
                    modeOptions = ["DREAM_COMPACT_D9", "NOISE_SHADOW_PURGE", "AXIOM_HARVEST_L8"];
                    break;
                  case 8:
                    paramLabel = "Ledger Signing Hashing Period";
                    modeLabel = "Temporal Ledger Proof Standard";
                    modeOptions = ["TEMPORAL_CLOCK_PARITY", "APPEND_ONLY_MULTI_SIG", "ROUT_SEED_HMAC"];
                    break;
                  case 9:
                    paramLabel = "Senate Quorum Token Balance";
                    modeLabel = "Consensus Parliament Standard";
                    modeOptions = ["CRE_EQUILIBRIUM_V3", "DEMOCRATIC_SENATE", "SOVEREIGN_AUTHORITY"];
                    break;
                }

                const getAgentAnimationClass = (idx: number) => {
                  const classes = [
                    "animate-almadel",
                    "animate-notoria",
                    "animate-paulina",
                    "animate-goetia",
                    "animate-theurgia",
                    "animate-almiras",
                    "animate-verum",
                    "animate-ephesia",
                    "animate-fulcanelli",
                    "animate-regalis"
                  ];
                  return classes[idx] || "";
                };

                return (
                  <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div>
                        <span className="text-[9px] text-cyan-400 font-bold tracking-wider block uppercase">ACTIVE TARGET CALIBRATION</span>
                        <h5 className="text-xs font-bold text-slate-100 flex items-center gap-1.5 mt-0.5 font-sans">
                          <span 
                            className={`w-2.5 h-2.5 rounded-full ring-2 ring-slate-800 transition-all duration-300 ${getAgentAnimationClass(ringObj.index)}`} 
                            style={{ backgroundColor: "#" + ringObj.bandColor.toString(16) }}
                          />
                          {ringObj.name} — Ring {["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"][ringObj.index]}
                        </h5>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-500 font-bold block">REPUTATION</span>
                        <span className="text-[11px] font-bold text-yellow-500 font-sans">{ringObj.reputationScore.toFixed(1)}%</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 leading-relaxed font-sans bg-slate-950/40 p-2 border border-slate-900 rounded-lg">
                      {ringObj.agentInstructions.replace("You are ", "Coordinates sovereign instructions specifically for: ")}
                    </p>

                    <NeuralRingWaveVisualizer 
                      ringIndex={selectedCalibRing}
                      intensity={calibIntensity[selectedCalibRing]}
                      subMode={calibSubModes[selectedCalibRing]}
                      colorHex={"#" + ringObj.accentColor.toString(16).padStart(6, "0")}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Dynamics Slider */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400 font-bold">{paramLabel}</span>
                          <span className="text-cyan-400 font-bold">{calibIntensity[selectedCalibRing]}%</span>
                        </div>
                        <input
                          type="range"
                          min={selectedCalibRing === 6 ? "1" : "5"}
                          max={selectedCalibRing === 6 ? "5" : "100"}
                          value={calibIntensity[selectedCalibRing]}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setCalibIntensity(prev => ({ ...prev, [selectedCalibRing]: val }));
                          }}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                      </div>

                      {/* Dynamics Dropdown */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] text-slate-400 font-bold">{modeLabel}</label>
                        <select
                          value={calibSubModes[selectedCalibRing]}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCalibSubModes(prev => ({ ...prev, [selectedCalibRing]: val }));
                          }}
                          className="w-full h-8 px-2 bg-slate-950 border border-slate-850 rounded-lg text-xs text-slate-200 outline-none focus:border-cyan-500/40 font-mono"
                        >
                          {modeOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={handleExecutePhase4}
                        disabled={!!runningAction}
                        className="px-5 h-9 bg-cyan-700 hover:bg-cyan-600 text-slate-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        ENGAGE CALIBRATION PASS (INIT IV)
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Phase 5 Kernel Diagnostics View */}
          {activeTab === "phase5" && (
            <div className="space-y-6 animate-fadeIn text-slate-300 font-mono">
              <div className="bg-emerald-950/10 border border-emerald-500/15 p-4 rounded-xl">
                <h4 className="text-xs font-bold text-emerald-300 uppercase mb-1.5 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  SOVEREIGN SYSTEM KERNEL DIAGNOSTIC DECK
                </h4>
                <p className="text-[11px] text-slate-400 leading-normal font-sans">
                  Deeply explore, query, and simulate the core system layers (L0 to L4) defined under Solomon X's physical and cognitive operating architecture.
                </p>
              </div>

              {/* Layer Selection Tabs */}
              <div className="flex border-b border-slate-900 scrollbar-none overflow-x-auto gap-2">
                {[
                  { id: 0, name: "Layer 0: Core Invariants", subtitle: "TPM, Goal-Firewall, ANS-A" },
                  { id: 1, name: "Layer 1: Cognitive Substrate", subtitle: "9-Horizons, VSA, Dreams" },
                  { id: 2, name: "Layer 2: Orchestration", subtitle: "VCG Auction, LMSR Market" },
                  { id: 3, name: "Layer 3: Perception", subtitle: "Tensor-Fusion, Gesture wfst" },
                  { id: 4, name: "Layer 4: Sandbox & Trace", subtitle: "Firecracker, eBPF Trace" }
                ].map((ly) => (
                  <button
                    key={ly.id}
                    onClick={() => setSelectedKernelLayer(ly.id)}
                    className={`flex-1 min-w-[140px] pb-2 text-left border-b-2 transition duration-150 px-2 py-1 ${
                      selectedKernelLayer === ly.id
                        ? "border-emerald-500 text-emerald-300 bg-emerald-500/5 rounded-t-lg"
                        : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/40 rounded-t-lg"
                    }`}
                  >
                    <span className="text-[10px] font-bold block">{ly.name}</span>
                    <span className="text-[8px] text-slate-500 block truncate font-sans">{ly.subtitle}</span>
                  </button>
                ))}
              </div>

              {/* LAYER CONTENT WORKSPACES */}
              <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-4 min-h-[300px]">
                
                {/* LAYER 0: CORE INVARIANTS */}
                {selectedKernelLayer === 0 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: TPM Seal & Signatures */}
                      <div className="bg-slate-950/60 border border-slate-900 p-3.5 rounded-lg space-y-3">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-1.5">
                          <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                          Platform Security Attestation (TPM-2.0)
                        </span>
                        
                        <div className="space-y-2 text-[10px]">
                          <div className="flex justify-between items-center bg-slate-900/60 p-1.5 rounded border border-slate-850">
                            <span className="text-slate-500">PCR-0 (BOOT FIRMWARE HASH)</span>
                            <span className="text-slate-300 truncate w-32 text-right text-[9px]">ae491d92bf3b11e2f8</span>
                          </div>
                          <div className="flex justify-between items-center bg-slate-900/60 p-1.5 rounded border border-slate-850">
                            <span className="text-slate-500">PCR-1 (KERNEL CODE HASH)</span>
                            <span className="text-slate-300 truncate w-32 text-right text-[9px]">e2a87bc12bb1e16f39</span>
                          </div>
                          <div className="flex justify-between items-center bg-slate-900/60 p-1.5 rounded border border-slate-850">
                            <span className="text-slate-500">PCR-2 (SOLOMON-DAEMON SYSTEM)</span>
                            <span className="text-emerald-300 truncate w-32 text-right text-[9px]">3fb2912a7bf30db18c</span>
                          </div>
                          <div className="flex justify-between items-center bg-slate-900/60 p-1.5 rounded border border-slate-850">
                            <span className="text-slate-500">TPM IDENTITY KEY PAIR</span>
                            <span className="text-slate-300">Ed25519 (TPM_SEALED)</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1 border-t border-slate-900">
                          <button
                            onClick={() => {
                              addLog("TPM Attestation requested.");
                              addLog("Reading PCR-0 hardware boot metrics...");
                              addLog("Reading PCR-1 operating system kernels...");
                              addLog("Verifying TPM-bound identity signature chain...");
                              addLog("Deriving dynamic verification entropy code via HKDF-SHA256.");
                              setTpmAttestationPassed(true);
                              addLog("SUCCESS: Secure Hardware Attestation Verified. Platforms integrity guaranteed.");
                            }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white rounded font-sans font-bold text-[9px] h-7 px-3 flex-1 flex items-center justify-center gap-1 transition"
                          >
                            Verify TPM Seal
                          </button>
                          {tpmAttestationPassed !== null && (
                            <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded ${tpmAttestationPassed ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
                              {tpmAttestationPassed ? "PASSED" : "FAILED"}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Goal-Firewall (OPA-WASM) */}
                      <div className="bg-slate-950/60 border border-slate-900 p-3.5 rounded-lg space-y-3">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                          Goal-Firewall Policies (OPA-WASM)
                        </span>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-slate-500">POLICY THRESHOLD TIER</span>
                            <div className="flex gap-1.5">
                              {["GREEN", "YELLOW", "RED"].map((mode) => (
                                <button
                                  key={mode}
                                  onClick={() => {
                                    setGoalFirewallMode(mode as any);
                                    addLog(`OPA-WASM Goal-Firewall reassigned to tier: ${mode}`);
                                    if (mode === "GREEN") {
                                      addLog("Allowed: All read operations. Relaxed verification schedules.");
                                    } else if (mode === "YELLOW") {
                                      addLog("Enforced: Explicit confirmations demanded for file write ops.");
                                    } else {
                                      addLog("LOCKDOWN ACTIVE: Network bindings & privileged commands locked. Biometric attestation required.");
                                    }
                                  }}
                                  className={`px-1.5 py-0.5 text-[8.5px] font-bold rounded border ${
                                    goalFirewallMode === mode
                                      ? "bg-blue-500/10 border-blue-400 text-blue-300"
                                      : "bg-slate-900 border-slate-850 hover:bg-slate-800 text-slate-500"
                                  }`}
                                >
                                  {mode}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="p-2 bg-slate-950 border border-slate-850 rounded text-[9px] text-slate-400 leading-relaxed max-h-[85px] overflow-y-auto whitespace-pre font-mono">
                            {`package solomon.goal\n\ndefault allow = false\n\nallow {\n  input.action.type == "read"\n}\n\ndeny_yellow {\n  input.action.type == "write"\n  not user_confirmed\n}\n\ndeny_red {\n  input.action.type == "network"\n  not biometric_atttested_within_300s\n}`}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Autonomic Nervous System Feed (ANS-A) */}
                    <div className="bg-slate-950/60 border border-slate-900 p-3.5 rounded-lg space-y-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-1.5">
                        <Activity className="w-3.5 h-3.5 text-orange-400" />
                        Autonomic Nervous System Analog Feedback Loop (ANS-A)
                      </span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 text-[10px]">
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-mono">SYMPATHETIC TONE (α·Δprediction_error + β·entropy)</span>
                            <span className="text-orange-400 font-bold font-mono">{(sympatheticTone).toFixed(3)}</span>
                          </div>
                          <div className="h-1 bg-slate-850 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 rounded" style={{ width: `${sympatheticTone * 100}%` }} />
                          </div>
                          <p className="text-[8.5px] text-slate-500 font-sans">Elevated values temporarily scale agent biddings/cooldown margins.</p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-mono">PARASYMPATHETIC TONE (δ·e^-λ·idle)</span>
                            <span className="text-emerald-400 font-bold font-mono">{(parasympatheticTone).toFixed(3)}</span>
                          </div>
                          <div className="h-1 bg-slate-850 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded" style={{ width: `${parasympatheticTone * 100}%` }} />
                          </div>
                          <p className="text-[8.5px] text-slate-500 font-sans">Elevated values trigger subconscious synthetic sleep-compaction waves.</p>
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => {
                            const newSym = Math.random();
                            const newPara = 1 - newSym;
                            setSympatheticTone(newSym);
                            setParasympatheticTone(newPara);
                            addLog(`ANS-A modulated manually. Sympathetic: ${newSym.toFixed(3)}, Parasympathetic: ${newPara.toFixed(3)}`);
                          }}
                          className="bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 font-sans font-bold text-[9px] h-6 px-3 rounded transition"
                        >
                          Pulse ANS-A Node
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* LAYER 1: COGNITIVE DATA SUBSTRATE */}
                {selectedKernelLayer === 1 && (
                  <div className="space-y-4 text-[10px]">
                    {/* Top list: 9 Memory Horizons */}
                    <div className="bg-slate-950/60 border border-slate-900 p-3.5 rounded-lg space-y-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-1.5">
                        <Database className="w-3.5 h-3.5 text-purple-400" />
                        9-Horizon Adaptive Cognitive Memory Index System
                      </span>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-1 text-[9px]">
                        {[
                          { id: "L1", name: "Volatile Circular Cache", latency: "<0.12ms", size: "256 MiB", res: "98%" },
                          { id: "L2", name: "Conversational Canvas SQLite", latency: "0.45ms", size: "512 MiB", res: "95%" },
                          { id: "L3", name: "Episodic Timeline LanceDB", latency: "2.10ms", size: "2.0 GiB", res: "84%" },
                          { id: "L4", name: "Relational Graph DuckDB", latency: "4.85ms", size: "4.0   GiB", res: "91%" },
                          { id: "L5", name: "High-Dim Semantic FAISS", latency: "12.2ms", size: "Unlimited", res: "78%" },
                          { id: "L6", name: "Procedural RocksDB Tree", latency: "1.12ms", size: "1.0 GiB", res: "89%" },
                          { id: "L7", name: "Intent LLMDB Scheduler", latency: "5.44ms", size: "2.0 GiB", res: "92%" },
                          { id: "L8", name: "Crystallized Wisdom Parquet", latency: "35.2ms", size: "5.0 GiB", res: "97%" },
                          { id: "L9", name: "Cold Ledger Archive S3", latency: "420ms", size: "Unlimited", res: "12%" }
                        ].map((hz) => (
                          <div key={hz.id} className="bg-slate-900/40 border border-slate-850 p-2 rounded flex flex-col justify-between">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-emerald-400">{hz.id}</span>
                              <span className="text-slate-500 font-sans">{hz.size}</span>
                            </div>
                            <span className="text-slate-300 font-sans truncate font-bold">{hz.name}</span>
                            <div className="flex justify-between text-[8px] text-slate-500 mt-1 border-t border-slate-850 pt-1">
                              <span>Lat: {hz.latency}</span>
                              <span>Resonance: {hz.res}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* VSA Recall Search */}
                      <div className="bg-slate-950/60 border border-slate-900 p-3.5 rounded-lg space-y-3">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block border-b border-slate-900 pb-1.5">
                          Holographic Vector Recall (VSA binding: M = Σ role ⊛ filler)
                        </span>
                        
                        <div className="space-y-1.5">
                          <label className="text-[9px] text-slate-500 block uppercase font-sans">Query concept term</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={vsaSearchTerm}
                              onChange={(e) => setVsaSearchTerm(e.target.value)}
                              className="flex-1 bg-slate-950 border border-slate-850 h-7 text-xs px-2 rounded text-slate-200 outline-none"
                            />
                            <button
                              onClick={() => {
                                addLog(`Requested Holographic VSA Recall on: '${vsaSearchTerm}'`);
                                addLog("Constructing 10,240-dim random representation cue vector query...");
                                addLog("Computing circular convolution binding inverted query over majority elements...");
                                addLog("Scanning Gray-code adjacent hypercube lattice coordinates (radius r=2)...");
                                
                                const valChance = Math.random();
                                const mockedResults = [
                                  { text: `L8_WISDOM: [Principle] Prefer silent telemetry compact modes under load matching '${vsaSearchTerm}'`, confidence: 0.95 - valChance * 0.1, resonance: 0.92 - valChance * 0.1 },
                                  { text: `L5_SEM_EMBEDDING: '${vsaSearchTerm} integration route vectors'`, confidence: 0.89 - valChance * 0.1, resonance: 0.81 - valChance * 0.1 }
                                ];
                                setVsaResolvedItems(mockedResults);
                                addLog(`Recall complete. ${mockedResults.length} high-resonance memory blocks bound.`);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-500 px-3 text-white rounded text-[10px] h-7 font-sans font-bold transition"
                            >
                              Recall
                            </button>
                          </div>
                        </div>

                        {/* Search Results */}
                        <div className="space-y-1.5 max-h-[80px] overflow-y-auto">
                          {vsaResolvedItems.map((item, idx) => (
                            <div key={idx} className="bg-slate-900 border border-slate-850 p-1.5 rounded text-[9px] space-y-0.5">
                              <span className="text-slate-200 block truncate">{item.text}</span>
                              <div className="flex gap-4 text-slate-500 font-sans text-[8px]">
                                <span>Confidence: {(item.confidence * 100).toFixed(1)}%</span>
                                <span>Resonance score: {item.resonance.toFixed(3)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Dream Engine */}
                      <div className="bg-slate-950/60 border border-slate-900 p-3.5 rounded-lg space-y-3 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block border-b border-slate-900 pb-1.5 font-mono">
                            Synthetic Sleep-Wake Dream Engine & Compaction
                          </span>
                          <p className="text-[9.5px] font-sans text-slate-400 leading-normal pt-1.5">
                            Compacts volatile short-term observations (L1/L2) down into high-dimensional semantic spaces (L5) via Hebbian synapse updates.
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                          <span className="text-[9px] text-slate-500 font-bold font-mono">STATE: <span className="text-emerald-400 font-mono">{dreamingStatus}</span></span>
                          <button
                            onClick={() => {
                              if (dreamingStatus !== "IDLE") return;
                              setDreamingStatus("CONSOLIDATING");
                              addLog("INITIATED COGNITIVE DREAM COMPACTION CYCLE.");
                              addLog("[Hebbian Synapse Update] Recalculating weight offsets over 1,480 node coordinates...");
                              addLog("[Glymphatic Flush] Flushing excess prediction error garbage...");
                              setTimeout(() => {
                                setDreamingStatus("WISDOM_EXTRACTION");
                                addLog("Running symbolic regression to extract rules...");
                                setTimeout(() => {
                                  setDreamingStatus("IDLE");
                                  addLog("DREAM CYCLE COMPLETED. Synaptic offsets downscaled. L8 wisdom principle database re-crystallized.");
                                }, 1500);
                              }, 1500);
                            }}
                            disabled={dreamingStatus !== "IDLE"}
                            className="bg-purple-600 hover:bg-purple-500 text-white rounded text-[9.5px] h-7 px-3 font-sans font-bold transition disabled:opacity-50"
                          >
                            Execute Consolidate
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* LAYER 2: ORCHESTRATION & VCG MECHANISM */}
                {selectedKernelLayer === 2 && (
                  <div className="space-y-4 text-[10px]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Left: Interactive VCG Auction Solver */}
                      <div className="bg-slate-950/60 border border-slate-900 p-3.5 rounded-lg space-y-3">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block border-b border-slate-900 pb-1.5">
                          Truthful Vickrey-Clarke-Groves (VCG) Cognitive Economy Auction
                        </span>

                        <div className="space-y-1.5">
                          <label className="text-[9px] text-slate-500 block uppercase font-sans">Select specialized operation task</label>
                          <div className="flex gap-2">
                            <select
                              value={vcgChosenTask}
                              onChange={(e) => setVcgChosenTask(e.target.value)}
                              className="flex-1 bg-slate-950 border border-slate-850 h-8 px-2 text-xs rounded text-slate-200 outline-none font-mono"
                            >
                              <option value="DRAFT_QUANTUM_CODE">Draft Quantum Secure Bypass Code (R5 focus)</option>
                              <option value="FORESEE_TIMELINE_BOTTLES">Foresee Hour Deadlines & Timeline Blocks (R2 focus)</option>
                              <option value="ASSESS_CORE_SECURITY">Audit Cryptographic Security Holes (R6/7 focus)</option>
                            </select>
                            
                            <button
                              onClick={() => {
                                addLog(`VCG Auction launched for job directive: [${vcgChosenTask}]`);
                                addLog("Recalculating agent capability affinity dot products...");
                                
                                // Calculate bids for top matching agents
                                let chosenWinner = "ars_almadel";
                                let winIndex = 0;
                                let bestAffinity = 0;
                                
                                if (vcgChosenTask === "DRAFT_QUANTUM_CODE") {
                                  chosenWinner = "ars_almiras"; winIndex = 5;
                                } else if (vcgChosenTask === "FORESEE_TIMELINE_BOTTLES") {
                                  chosenWinner = "ars_paulina"; winIndex = 2;
                                } else {
                                  chosenWinner = "ars_ephesia"; winIndex = 7;
                                }

                                const resultsVec = agents.map((ag) => {
                                  const isIdeal = ag.index === winIndex;
                                  const competence = isIdeal ? 0.96 : (0.2 + ag.index * 0.06);
                                  const costCpu = isIdeal ? 14.5 : (8.0 + ag.index * 4);
                                  const effectiveUtility = (0.85 * competence * ag.reputationScore) / (costCpu * 0.05);
                                  return {
                                    index: ag.index,
                                    name: ag.name,
                                    competence: competence * 100,
                                    cost: costCpu,
                                    effUtil: effectiveUtility,
                                  };
                                }).sort((a,b) => b.effUtil - a.effUtil);

                                setVcgResult({
                                  winnerName: resultsVec[0].name,
                                  winnerIndex: resultsVec[0].index,
                                  paymentValue: resultsVec[1].effUtil.toFixed(2),
                                  bidsList: resultsVec.slice(0, 4)
                                });

                                addLog(`Auction resolved. Winner selected: ${resultsVec[0].name}. Vickrey Payment rate calculated as: ${resultsVec[1].effUtil.toFixed(2)} CRE.`);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-500 px-3 text-white rounded text-[10px] h-8 font-sans font-bold transition"
                            >
                              Run VCG Solver
                            </button>
                          </div>
                        </div>

                        {/* VCG Auction Output Display */}
                        {vcgResult ? (
                          <div className="bg-slate-900 border border-slate-850 p-2.5 rounded-lg space-y-2">
                            <div className="flex justify-between font-bold border-b border-slate-850 pb-1.5">
                              <span className="text-emerald-400">WINNING AGENT: {vcgResult.winnerName}</span>
                              <span className="text-amber-400 font-mono">VCG CHARGE: {vcgResult.paymentValue} CRE</span>
                            </div>
                            
                            <table className="w-full text-[8.5px] text-slate-400 font-sans">
                              <thead>
                                <tr className="border-b border-slate-850 text-slate-500 font-bold uppercase">
                                  <th className="text-left py-1">AGENT IDENT</th>
                                  <th className="text-right py-1">COMPETENCE</th>
                                  <th className="text-right py-1">EST CPU-MS</th>
                                  <th className="text-right py-1">EFFECTIVE UTIL</th>
                                </tr>
                              </thead>
                              <tbody>
                                {vcgResult.bidsList.map((bid: any, ix: number) => (
                                  <tr key={bid.index} className={ix === 0 ? "font-bold text-slate-200" : ""}>
                                    <td className="py-1">{bid.name}</td>
                                    <td className="text-right">{bid.competence.toFixed(1)}%</td>
                                    <td className="text-right">{bid.cost.toFixed(1)}ms</td>
                                    <td className="text-right text-emerald-300">{(bid.effUtil).toFixed(2)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="bg-slate-950 border border-slate-900 p-4 text-center rounded text-slate-650 italic font-sans text-[9px]">
                            Launch VCG mechanism calculation solver to view economic knapsack results...
                          </div>
                        )}
                      </div>

                      {/* Right: LMSR Internal Prediction Markets */}
                      <div className="bg-slate-950/60 border border-slate-900 p-3.5 rounded-lg space-y-3">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block border-b border-slate-900 pb-1.5 font-mono">
                          Internal Logarithmic Market Scoring Rule (LMSR) Prediction Markets
                        </span>
                        
                        <p className="text-[9.5px] text-slate-500 font-sans leading-normal">
                          Specialist agents place confidence bets on operational success. LMSR math ensures fast convergence of market prices vector to calibrated probabilities.
                        </p>

                        <div className="space-y-2 pt-1 font-mono">
                          {[
                            { key: "ci_break", title: "Target Commit Integrity failure rating", color: "text-red-400 bg-red-400/5 border-red-500/20" },
                            { key: "sandbox_leak", title: "Firecracker guest escape probability", color: "text-orange-400 bg-orange-400/5 border-orange-500/20" },
                            { key: "memory_resonance_cap", title: "Memory Horizon saturation risk", color: "text-cyan-400 bg-cyan-400/5 border-cyan-500/20" }
                          ].map((market) => (
                            <div key={market.key} className={`p-2 rounded border flex justify-between items-center ${market.color}`}>
                              <div>
                                <span className="text-[9.5px] font-bold block text-slate-300">{market.title}</span>
                                <span className="text-[8px] text-slate-500 leading-none">Hypothesis token: {market.key}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-100">{(lmsrPredictionOdds[market.key] * 100).toFixed(0)}%</span>
                                <div className="flex flex-col gap-0.5">
                                  <button
                                    onClick={() => {
                                      setLmsrPredictionOdds(prev => {
                                        const nextVal = Math.min(0.99, prev[market.key] + 0.05);
                                        addLog(`LMSR betting purchase (YES) on '${market.key}': Price updated to ${(nextVal*100).toFixed(1)}%`);
                                        return { ...prev, [market.key]: nextVal };
                                      });
                                    }}
                                    className="bg-slate-800 hover:bg-slate-750 h-3.5 px-1 rounded text-[7.5px] text-slate-300 font-bold text-center border border-slate-700 select-none cursor-pointer"
                                  >
                                    YES
                                  </button>
                                  <button
                                    onClick={() => {
                                      setLmsrPredictionOdds(prev => {
                                        const nextVal = Math.max(0.01, prev[market.key] - 0.05);
                                        addLog(`LMSR betting purchase (NO) on '${market.key}': Price updated to ${(nextVal*100).toFixed(1)}%`);
                                        return { ...prev, [market.key]: nextVal };
                                      });
                                    }}
                                    className="bg-slate-800 hover:bg-slate-750 h-3.5 px-1 rounded text-[7.5px] text-slate-300 font-bold text-center border border-slate-700 select-none cursor-pointer"
                                  >
                                    NO
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* LAYER 3: MULTIMODAL PERCEPTION */}
                {selectedKernelLayer === 3 && (
                  <div className="space-y-4 text-[10px]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Co-Equal Tensor Fusion */}
                      <div className="bg-slate-950/60 border border-slate-900 p-3.5 rounded-lg space-y-3">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block border-b border-slate-900 pb-1.5 font-mono">
                          Tobias/Gaze & Keyboard Tensor-Fusion Model
                        </span>

                        <div className="space-y-2 text-[9px]">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-slate-900 p-2 rounded border border-slate-850">
                              <span className="text-slate-500 block">GAZE TARGET</span>
                              <span className="text-slate-200 font-bold">X: {sensorGazeX}px, Y: {sensorGazeY}px</span>
                            </div>
                            <div className="bg-slate-900 p-2 rounded border border-slate-850">
                              <span className="text-slate-500 block">MOUSE CADENCE</span>
                              <span className="text-slate-200 font-bold">{sensorMouseSpeed.toFixed(1)} mm/s</span>
                            </div>
                          </div>

                          <div className="bg-slate-900 p-2 rounded border border-slate-850 space-y-1">
                            <div className="flex justify-between">
                              <span className="text-slate-500">CP DECOMPOSITION INTENT PREDICTION (RANK=8)</span>
                              <span className="text-emerald-400 font-bold">{(fusedIntentConf * 100).toFixed(1)}% CONF</span>
                            </div>
                            <span className="text-slate-100 font-bold block">{fusedIntentClass}</span>
                          </div>
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => {
                              const x = Math.round(100 + Math.random() * 800);
                              const y = Math.round(50 + Math.random() * 500);
                              const speed = Math.random() * 60;
                              const intents = ["SYSTEM_DIAGNOSTICS", "CODE_REFACTORING", "CRITICAL_DEFENSE", "TIMELINE_SCHEDULING"];
                              const picked = intents[Math.floor(Math.random() * intents.length)];
                              const conf = 0.82 + Math.random() * 0.17;
                              
                              setSensorGazeX(x);
                              setSensorGazeY(y);
                              setSensorMouseSpeed(speed);
                              setFusedIntentClass(picked);
                              setFusedIntentConf(conf);
                              
                              addLog(`Sensor inputs swept. Low-rank CP decomposition calculated. Injected predicted intent: [${picked}] (${(conf*100).toFixed(0)}% assurance).`);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-500 px-3 text-white rounded text-[10px] h-7 font-sans font-bold transition"
                          >
                            Simulate Sensor Sweep
                          </button>
                        </div>
                      </div>

                      {/* Micro-Gesture Language (MGL) */}
                      <div className="bg-slate-950/60 border border-slate-900 p-3.5 rounded-lg space-y-3 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block border-b border-slate-900 pb-1.5 font-mono">
                            Micro-Gesture Language (MGL) WFST Decoders
                          </span>
                          <p className="text-[9.5px] font-sans text-slate-400 leading-normal pt-1.5">
                            Analyzes local hand landmarks sequences through a Weighted Finite-State Transducer (WFST) compiled to WebAssembly.
                          </p>

                          <div className="bg-slate-900 border border-slate-850 p-2.5 rounded-lg mt-3 text-[10px] flex justify-between items-center">
                            <span className="text-slate-500">ACTIVE WFST STATE:</span>
                            <span className={`font-bold px-2 py-0.5 rounded text-[9.5px] ${gestureRecognized === "CONFIRM" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : gestureRecognized === "CANCEL" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-slate-950 text-slate-500 border border-slate-850"}`}>
                              {gestureRecognized === "NONE" ? "WAITING_POSE_A" : gestureRecognized}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                          <button
                            onClick={() => {
                              setGestureRecognized("CONFIRM");
                              addLog("MGL: Gesture 'THUMB_UP -> HOLD 300MS' matched with assurance rating of 99.4%. State [CONFIRM] dispatched to Goal-Firewall.");
                            }}
                            className="flex-1 bg-slate-800 hover:bg-slate-755 border border-slate-700 text-slate-300 font-sans font-bold text-[9px] h-7 px-2 rounded transition"
                          >
                            Thumb-Up Pose
                          </button>
                          <button
                            onClick={() => {
                              setGestureRecognized("CANCEL");
                              addLog("MGL: Gesture 'HAND_WAVE' matched. Pipeline state [CANCEL] triggered.");
                            }}
                            className="flex-1 bg-slate-800 hover:bg-slate-755 border border-slate-700 text-slate-300 font-sans font-bold text-[9px] h-7 px-2 rounded transition"
                          >
                            Wave Hand Pose
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* LAYER 4: EXECUTION FABRIC & TRACING */}
                {selectedKernelLayer === 4 && (
                  <div className="space-y-4 text-[10px]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Left: Firecracker Airlock Configuration */}
                      <div className="bg-slate-950/60 border border-slate-900 p-3.5 rounded-lg space-y-3 font-mono">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block border-b border-slate-900 pb-1.5">
                          Firecracker Micro-VM Sandbox Allocation
                        </span>

                        <div className="space-y-3 font-sans">
                          {/* CPU quota */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-mono">
                              <span className="text-slate-400">GUEST VCPU EXECUTION LIMIT</span>
                              <span className="text-emerald-400 font-bold">{sandboxCpuLimit} ms / s</span>
                            </div>
                            <input
                              type="range"
                              min="100"
                              max="1000"
                              step="50"
                              value={sandboxCpuLimit}
                              onChange={(e) => setSandboxCpuLimit(parseInt(e.target.value))}
                              className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-500"
                            />
                          </div>

                          {/* RAM quota */}
                          <div className="space-y-1 font-mono">
                            <div className="flex justify-between text-[10px]">
                              <span className="text-slate-400">RAM MEMORY_MAX CAP (CGROUP)</span>
                              <span className="text-emerald-400 font-bold">{sandboxRamLimit} MiB</span>
                            </div>
                            <input
                              type="range"
                              min="128"
                              max="1024"
                              step="128"
                              value={sandboxRamLimit}
                              onChange={(e) => setSandboxRamLimit(parseInt(e.target.value))}
                              className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-500"
                            />
                          </div>
                        </div>

                        {/* Sandbox Boot Button */}
                        <div className="pt-2 border-t border-slate-900 flex justify-between items-center font-mono">
                          <span className="text-[9.5px] text-slate-500 font-bold">STATE: <span className={vmActive ? "text-emerald-400 animate-pulse font-bold" : "text-slate-600 font-bold"}>{vmActive ? "AIR-LOCK RUNNING" : "TERMINATED"}</span></span>
                          <button
                            onClick={() => {
                              if (vmActive) {
                                setVmActive(false);
                                addLog("Firecracker MicroVM guest guest-os context destroyed. Reclaiming network namespaces.");
                              } else {
                                setVmActive(true);
                                addLog(`Initiating Firecracker Micro-VM boot [Sandbox Level 2]...`);
                                addLog(`Cmapping kernel resource limits: vCPU quota=${sandboxCpuLimit}ms/s, RAM limit=${sandboxRamLimit}MiB.`);
                                addLog(`Mounting OverlayFS secure isolated rootfs in read-only lower layers.`);
                                addLog(`Guest boot successfully in 12.8ms. eBPF trace hooks connected to syscall vectors.`);
                                
                                // Generate mock tracing events
                                const newSys = [
                                  { pid: 2190, comm: "solomon-guest", syscall: "sys_execve", latency_ns: 1250 },
                                  { pid: 2190, comm: "solomon-guest", syscall: "sys_openat", latency_ns: 320 },
                                  { pid: 2191, comm: "cargo", syscall: "sys_mmap", latency_ns: 840 },
                                  { pid: 2191, comm: "rustc", syscall: "sys_write", latency_ns: 90 }
                                ];
                                setEbpfSyscalls(newSys);
                              }
                            }}
                            className={`rounded px-3 text-[10px] h-7 font-sans font-bold transition ${vmActive ? "bg-red-700 hover:bg-red-650 text-white" : "bg-emerald-600 hover:bg-emerald-500 text-white"}`}
                          >
                            {vmActive ? "Dismantle VM" : "Boot Guest Sandbox"}
                          </button>
                        </div>
                      </div>

                      {/* Right: eBPF Execution Traces */}
                      <div className="bg-slate-950/60 border border-slate-900 p-3.5 rounded-lg space-y-3 font-mono">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block border-b border-slate-900 pb-1.5">
                          eBPF Kernel Trace Streams (Filtered: sandbox root)
                        </span>

                        <div className="space-y-1.5 max-h-[140px] overflow-y-auto font-mono text-[8px]">
                          {ebpfSyscalls.map((sys, idx) => (
                            <div key={idx} className="p-1 px-1.5 bg-slate-950 border border-slate-900 rounded text-slate-400 flex justify-between items-center hover:bg-slate-900/60 transition">
                              <span className="text-amber-400 font-bold">PID {sys.pid}</span>
                              <span className="text-slate-300 font-bold truncate max-w-[80px]">{sys.comm}</span>
                              <span className="text-emerald-400 font-bold truncate max-w-[100px]">{sys.syscall}</span>
                              <span className="text-slate-500 font-sans">{sys.latency_ns} ns</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => {
                              const extra = [
                                { pid: 2200 + Math.round(Math.random() * 50), comm: "git", syscall: "sys_clone", latency_ns: 2450 },
                                { pid: 2200 + Math.round(Math.random() * 50), comm: "gcc", syscall: "sys_openat", latency_ns: 410 },
                                { pid: 1408, comm: "solomon-daemon", syscall: "sys_epoll_wait", latency_ns: 120 }
                              ];
                              setEbpfSyscalls(prev => [extra[Math.floor(Math.random() * extra.length)], ...prev]);
                            }}
                            className="bg-slate-800 hover:bg-slate-755 border border-slate-700 text-slate-300 font-sans font-bold text-[9px] h-6 px-2.5 rounded transition"
                          >
                            Trigger syscall
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* Dynamic Interactive Console Logger Console Stream Output */}
          <div id="directives-logger-box" className="bg-[#02010c] border border-slate-900/60 rounded-xl p-4 min-h-[140px] flex flex-col justify-between">
            <div className="text-[10px] text-slate-500 font-bold uppercase mb-2 flex items-center gap-1.5 border-b border-slate-900 pb-1.5">
              <Database className="w-3.5 h-3.5 text-purple-400" />
              Directives System log stream (Live feed)
            </div>
            
            <div className="flex-1 text-[10px] font-mono text-purple-400 space-y-1.5 max-h-[120px] overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-slate-600 italic">Console idle. Select an initiative above and execute to review real-time trace outputs...</div>
              ) : (
                logs.map((lg, idx) => (
                  <div key={idx} className="flex gap-2 leading-relaxed">
                    <span className="text-slate-600 font-bold select-none">&gt;&gt;</span>
                    <span>{lg}</span>
                  </div>
                ))
              )}
            </div>

            {runningAction && (
              <div className="mt-3 flex items-center gap-1.5 text-[9px] text-orange-400 animate-pulse select-none">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>ROUTING LOGIC FLOW INTEGRATIONS ACCURATELY IN REAL TIME...</span>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}

interface NeuralRingWaveVisualizerProps {
  ringIndex: number;
  intensity: number;
  subMode: string;
  colorHex: string;
}

export function NeuralRingWaveVisualizer({
  ringIndex,
  intensity,
  subMode,
  colorHex,
}: NeuralRingWaveVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let t = 0;

    const render = () => {
      if (!canvas || !ctx) return;
      
      // Clear with slight alpha to create motion trails
      ctx.fillStyle = "rgba(2, 1, 12, 0.22)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      
      ctx.lineWidth = 1.6;
      ctx.shadowBlur = 8;
      ctx.shadowColor = colorHex;
      ctx.strokeStyle = colorHex;

      t += 0.05 * (0.3 + (intensity / 100) * 1.7);

      ctx.beginPath();

      if (ringIndex === 0) {
        // Square wave / Firewall gating
        for (let x = 0; x < width; x++) {
          const rawWave = Math.sin(x * 0.045 - t * 4);
          const yVal = rawWave > 0.0 ? 0.6 : -0.6;
          const smoothedYVal = yVal + 0.1 * Math.cos(x * 0.2);
          const y = height / 2 + smoothedYVal * height * 0.35;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else if (ringIndex === 1) {
        // Memory columns filling / Index registers
        const numBars = 16;
        const barWidth = width / numBars;
        ctx.shadowBlur = 4;
        for (let i = 0; i < numBars; i++) {
          const fillFactor = 0.25 + 0.7 * Math.sin(t * 1.5 + i * 0.8) * Math.cos(t * 0.8 - i * 0.3);
          const barHeight = height * 0.6 * fillFactor * (intensity / 100);
          ctx.fillStyle = `rgba(${parseInt(colorHex.slice(1,3), 16) || 0}, ${parseInt(colorHex.slice(3,5), 16) || 0}, ${parseInt(colorHex.slice(5,7), 16) || 0}, 0.35)`;
          ctx.fillRect(i * barWidth + 3, height / 2 - barHeight / 2, barWidth - 6, barHeight);
          ctx.strokeStyle = colorHex;
          ctx.lineWidth = 1;
          ctx.strokeRect(i * barWidth + 3, height / 2 - barHeight / 2, barWidth - 6, barHeight);
        }
      } else if (ringIndex === 2) {
        // Chaotic / Quantum skepticism fluctuation waves
        for (let x = 0; x < width; x++) {
          const base = Math.sin(x * 0.025 - t * 2.5) * 0.5;
          const noise = Math.sin(x * 0.18 + t * 9) * 0.25 * (intensity / 100);
          const y = height / 2 + (base + noise) * height * 0.4;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else if (ringIndex === 3) {
        // Rapid high-energy loop processing / Sawtooth
        for (let x = 0; x < width; x++) {
          const phase = (x * 0.055 - t * 8) % (Math.PI * 2);
          const yVal = (phase / Math.PI) - 1.0;
          const y = height / 2 + yVal * height * 0.38;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else if (ringIndex === 4) {
        // Harmonic Lissajous/Orbital waves
        for (let x = 0; x < width; x++) {
          const wave1 = Math.sin(x * 0.022 - t * 2);
          const wave2 = Math.sin(x * 0.045 + t * 3.5) * 0.4;
          const wave3 = Math.cos(x * 0.011 - t * 0.8) * 0.25;
          const y = height / 2 + (wave1 + wave2 + wave3) * height * 0.35;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else if (ringIndex === 5) {
        // Biometric focus ECG pulse wave
        for (let x = 0; x < width; x++) {
          const p = (x - t * 90) % 180;
          let spike = 0;
          const normP = p < 0 ? p + 180 : p;
          if (normP > 40 && normP < 48) {
            spike = -0.3 * Math.sin((normP - 40) * Math.PI / 8);
          } else if (normP >= 48 && normP < 58) {
            spike = 1.4 * Math.sin((normP - 48) * Math.PI / 10);
          } else if (normP >= 58 && normP < 66) {
            spike = -0.6 * Math.sin((normP - 58) * Math.PI / 8);
          }
          const y = height / 2 + spike * height * 0.32;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else if (ringIndex === 6) {
        // Secure stable Biometric cosine wave
        for (let x = 0; x < width; x++) {
          const y = height / 2 + Math.cos(x * 0.035 - t * 2.2) * height * 0.35;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else if (ringIndex === 7) {
        // Digital indexing noise spikes
        for (let x = 0; x < width; x++) {
          const base = Math.sin(x * 0.018 - t * 1.8) * 0.15;
          let noise = (Math.random() - 0.5) * 0.08;
          if (Math.sin(x * 0.12 - t * 15) > 0.94) {
            noise += (Math.random() - 0.5) * 0.72;
          }
          const y = height / 2 + (base + noise) * height * 0.42;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else if (ringIndex === 8) {
        // Interlocking dual signing clocks
        for (let x = 0; x < width; x++) {
          const y = height / 2 + Math.sin(x * 0.038 - t * 2.6) * height * 0.3;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.beginPath();
        ctx.shadowBlur = 4;
        ctx.strokeStyle = `rgba(${parseInt(colorHex.slice(1,3), 16) || 0}, ${parseInt(colorHex.slice(3,5), 16) || 0}, ${parseInt(colorHex.slice(5,7), 16) || 0}, 0.35)`;
        for (let x = 0; x < width; x++) {
          const y = height / 2 + Math.sin(x * 0.038 - t * 2.6 + Math.PI) * height * 0.3;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else {
        // Senate balance polar circular sweep
        const centerX = width / 2;
        const centerY = height / 2;
        const maxRadius = Math.min(width, height) * 0.42;
        const currentRadius = maxRadius * (0.55 + 0.4 * Math.sin(t * 1.8));
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(${parseInt(colorHex.slice(1,3), 16) || 0}, ${parseInt(colorHex.slice(3,5), 16) || 0}, ${parseInt(colorHex.slice(5,7), 16) || 0}, 0.4)`;
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 5) {
          const xEnd = centerX + Math.cos(angle + t * 0.4) * currentRadius;
          const yEnd = centerY + Math.sin(angle + t * 0.4) * currentRadius;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(xEnd, yEnd);
          ctx.stroke();
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [ringIndex, intensity, subMode, colorHex]);

  return (
    <div className="relative w-full h-24 bg-[#010107] border border-slate-900 rounded-xl overflow-hidden flex flex-col justify-between p-2">
      <div className="absolute top-1.5 left-2 flex items-center justify-between right-2 pointer-events-none z-10 select-none">
        <span className="text-[8px] font-bold text-slate-500 font-mono tracking-wider uppercase">
          [COGNITIVE PHYSICS WAVEFORM TELEMETRY // {subMode}]
        </span>
        <span className="text-[8px] font-bold font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
          INTENSITY: {intensity}%
        </span>
      </div>
      <canvas ref={canvasRef} width={400} height={96} className="w-full h-full block" />
    </div>
  );
}
