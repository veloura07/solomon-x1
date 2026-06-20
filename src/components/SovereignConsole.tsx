import { useState, useEffect } from "react";
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
  Gauge
} from "lucide-react";
import { MemoryItem, AuditLog, AgentSpec } from "../types";

interface SovereignConsoleProps {
  agents: AgentSpec[];
  onAddMemory: (item: Omit<MemoryItem, "id" | "timestamp">) => void;
  onAddAuditLog: (log: Omit<AuditLog, "id" | "timestamp" | "cryptographicHash">) => void;
  onAddChatMessage: (agentName: string, content: string, systemInstruction: string) => void;
  onSetSelectedRingIndex: (index: number) => void;
  onUpdateAgentPool: (index: number, tokens: number) => void;
}

export default function SovereignConsole({
  agents,
  onAddMemory,
  onAddAuditLog,
  onAddChatMessage,
  onSetSelectedRingIndex,
  onUpdateAgentPool
}: SovereignConsoleProps) {
  const [activeTab, setActiveTab] = useState<"phase1" | "phase2" | "phase3">("phase1");
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

          {/* Dynamic Interactive Console Logger Console Stream Output */}
          <div id="directives-logger-box" className="bg-[#02010c] border border-slate-900/60 rounded-xl p-4 min-h-[140px] flex flex-col justify-between">
            <div className="text-[10px] text-slate-500 font-bold uppercase mb-2 flex items-center gap-1.5 border-b border-slate-900 pb-1.5">
              <database className="w-3.5 h-3.5 text-purple-400" />
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
