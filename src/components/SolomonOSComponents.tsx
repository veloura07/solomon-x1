import { useState, useEffect } from "react";
import { 
  Coins, 
  Cpu, 
  Activity, 
  ShieldCheck, 
  Flame, 
  Lock, 
  AlertTriangle, 
  RefreshCw, 
  GitBranch, 
  GitMerge, 
  CheckCircle, 
  Play, 
  FileText, 
  Terminal, 
  ExternalLink,
  Sliders,
  Sparkles,
  Zap,
  TrendingUp,
  Award
} from "lucide-react";
import { AgentSpec, AuditLog } from "../types";

// ==========================================
// SYSTEM 1 & 2: COGNITIVE RESOURCE ECONOMY & AGENT SENATE
// ==========================================
interface CognitiveResourceEconomyProps {
  agents: AgentSpec[];
  onAddAuditLog: (newLog: any) => void;
  onUpdateAgentPool: (index: number, tokensAdded: number) => void;
}

export function CognitiveResourceEconomy({ 
  agents, 
  onAddAuditLog, 
  onUpdateAgentPool 
}: CognitiveResourceEconomyProps) {
  const [allocationMode, setAllocationMode] = useState<"equilibrium" | "hyperfocus" | "idle">("equilibrium");
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferMessage, setTransferMessage] = useState("");
  const [globalRingSync, setGlobalRingSync] = useState(true);

  const toggleRingSync = () => {
    const nextVal = !globalRingSync;
    setGlobalRingSync(nextVal);
    onAddAuditLog({
      actor: "Sovereign Human",
      action: "TOGGLE_RING_SYNC",
      status: "AUTHORIZED",
      details: `Global Ring Synchronizer set to ${nextVal ? "ENABLED (REALTIME)" : "DISABLED (COOLDOWN)"}. Telemetry updates on idle cognitive rings throttled.`
    });
  };
  
  // Senate Active Debate States
  const [activeProposal, setActiveProposal] = useState({
    id: "prop_118",
    title: "Sealing of Epistemic Doubt registries on local TPM hardware registers",
    author: "Ars Paulina",
    status: "UNDER_VOTING",
    yayCount: 7,
    nayCount: 2,
    objections: ["Ars Fulcanelli: Awaiting temporal signature clearance."],
    urgencyScore: 88,
    votes: [
      { name: "Ars Regalis", vote: "YAY", role: "Senate Moderator" },
      { name: "Ars Paulina", vote: "YAY", role: "Doubt Evaluator" },
      { name: "Ars Verum", vote: "YAY", role: "Sovereignty Gatekeeper" },
      { name: "Ars Fulcanelli", vote: "PRESENT", role: "Temporal Auditor" },
      { name: "Ars Ephesia", vote: "NAY", role: "Memory Refiner" },
      { name: "Ars Almiras", vote: "YAY", role: "Cognitive Twin Observer" }
    ]
  });

  // Calculate dynamic Resource market indicators
  const totalMarketFees = agents.reduce((sum, a) => sum + (100 - a.reputationScore) * 12, 0);
  const totalStakedTokens = agents.reduce((sum, a) => sum + a.tokenPool, 0);
  const averageUtilityScore = 7.82; // EV * Confidence / Cost * Latency

  // Simulate transfer of cognitive charge
  const triggerEconomyBalancing = () => {
    setIsTransferring(true);
    setTransferMessage("REBALANCING COGNITIVE TOKENS ACROSS ALL SPECTRUMS...");
    
    setTimeout(() => {
      // Add audit log
      onAddAuditLog({
        actor: "CRE Governor",
        action: "REBALANCE_MARKET_ALLOCATION",
        status: "AUTHORIZED",
        details: "Cognitive resource pools balanced dynamically. Restored all agents above emergency 600-token buffer."
      });
      
      // Balance pools by checking who is rich/poor
      agents.forEach(a => {
        if (a.tokenPool < 650) {
          onUpdateAgentPool(a.index, 150);
        } else if (a.tokenPool > 1200) {
          onUpdateAgentPool(a.index, -100);
        }
      });
      
      setTransferMessage("COGNITIVE EQUILIBRIUM ESTABLISHED CORRECTLY.");
      setTimeout(() => setIsTransferring(false), 2000);
    }, 1800);
  };

  const castSenateYay = () => {
    setActiveProposal(prev => ({
      ...prev,
      yayCount: prev.yayCount + 1,
      votes: [...prev.votes, { name: "Operator (You)", vote: "YAY", role: "Human Sovereign" }]
    }));
    
    onAddAuditLog({
      actor: "Sovereign Human",
      action: "CAST_SENATE_VOTE",
      status: "AUTHORIZED",
      details: "Human master signature appended to Proposal #118."
    });
  };

  return (
    <div className="space-y-6 font-mono text-slate-300">
      
      {/* CRE MARKET OVERVIEW ROW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">TOTAL TOKEN LIQUIDITY</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-yellow-500 font-sans">{totalStakedTokens}</span>
            <span className="text-[9px] text-slate-400">CRE UNIT</span>
          </div>
          <div className="h-1 bg-yellow-500/10 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-yellow-500 w-4/5 rounded-full" />
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">COMPUTE FLOPs POOOL</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-cyan-400 font-sans">99.28<span className="text-sm font-light">TFLOPs</span></span>
          </div>
          <span className="text-[9px] text-slate-500 mt-2 block">DEDICATED COGNITIVE VRAM BUFFER</span>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">AVG SYSTEM UTILITY VALUE</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-semibold text-purple-400 font-sans">U = 8.44</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[8px] text-slate-500 mt-2 block">(EV x confidence) / (cost x latency)</span>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">RESOURCE CONCORD STATE</span>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1.5 rounded-lg text-center mt-3 block">
            STABLE EQUILIBRIUM
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* RESOURCE ECONOMY MARKET CHAMBER */}
        <div className="lg:col-span-7 bg-slate-900/30 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Coins className="w-4 h-4 text-yellow-500" />
                COGNITIVE ECONOMICAL COMPETITION
              </span>
              <button 
                onClick={triggerEconomyBalancing}
                disabled={isTransferring}
                className="h-8 px-3 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-[10px] font-bold text-slate-100 flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isTransferring ? 'animate-spin' : ''}`} />
                BALANCE RESOURCE MATRIX
              </button>
            </div>

            {/* Global Ring Synchronizer Toggle Panel */}
            <div className="mb-4 p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${globalRingSync ? "bg-cyan-400 animate-pulse" : "bg-slate-600"}`} />
                  <span className="text-[11px] font-bold text-slate-200">GLOBAL RING SYNCHRONIZER</span>
                </div>
                <p className="text-[9px] text-slate-500 font-mono mt-1 leading-normal">
                  Control real-time telemetry streaming for dormant rings. Disabling realtime stream shuts down idle network ticks and reduces client side web canvas CPU clock cycles.
                </p>
              </div>
              <div className="flex items-center gap-2.5 flex-shrink-0">
                <span className={`text-[9px] font-bold font-mono tracking-wider ${globalRingSync ? "text-cyan-400" : "text-slate-500"}`}>
                  {globalRingSync ? "REALTIME" : "COOLDOWN_IDLE"}
                </span>
                <button
                  type="button"
                  onClick={toggleRingSync}
                  className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-300 outline-none flex items-center cursor-pointer ${
                    globalRingSync ? "bg-cyan-500/20 border border-cyan-400/30" : "bg-slate-900 border border-slate-800"
                  }`}
                  aria-label="Toggle Global Ring Synchronizer"
                >
                  <div className={`w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                    globalRingSync ? "translate-x-4 bg-cyan-400" : "translate-x-0 bg-slate-600"
                  }`} />
                </button>
              </div>
            </div>

            {isTransferring && (
              <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-xs text-yellow-400 animate-pulse text-center">
                {transferMessage}
              </div>
            )}

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {agents.map((ag) => {
                const uScore = ((ag.reputationScore / 10) * 1.15).toFixed(2);
                const isUnderfunded = ag.tokenPool < 800;
                return (
                  <div key={ag.index} className="flex items-center justify-between p-2.5 bg-slate-950/40 border border-slate-850 rounded-xl hover:border-slate-800 transition">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#" + ag.bandColor.toString(16) }} />
                      <div>
                        <span className="text-xs font-bold text-slate-200">{ag.name}</span>
                        <span className="text-[8px] text-slate-500 block">REP SCORE: {ag.reputationScore.toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-4">
                      <div>
                        <span className="text-[9px] text-slate-500 font-semibold block">UTILITY</span>
                        <span className="text-xs font-bold text-purple-400 font-sans">U = {uScore}</span>
                      </div>
                      
                      <div>
                        <span className="text-[9px] text-slate-500 font-semibold block">TOKEN POOL</span>
                        <span className={`text-xs font-bold font-sans ${isUnderfunded ? "text-orange-400" : "text-yellow-400"}`}>
                          {ag.tokenPool} tokens
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* AGENT SENATE VIEW */}
        <div className="lg:col-span-5 bg-slate-900/30 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                SENATE ASSEMBLY CHAMBER
              </span>
              <span className="text-[8px] px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 uppercase font-bold animate-pulse">
                Voting Stage
              </span>
            </div>

            <div className="bg-slate-950/70 border border-slate-850 p-4 rounded-xl space-y-3 mb-4">
              <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                <span className="text-[9px] text-purple-300 font-mono">BILL #{activeProposal.id}</span>
                <span className="text-[9px] text-slate-500 uppercase font-mono">AUTHOR: {activeProposal.author}</span>
              </div>
              <h4 className="text-xs font-semibold text-slate-100 leading-normal">{activeProposal.title}</h4>
              
              <div className="space-y-1">
                <span className="text-[8px] text-slate-500 font-bold uppercase block">CRITIC OBJECTIONS & CONCERNS:</span>
                {activeProposal.objections.map((ob, i) => (
                  <p key={i} className="text-[9px] text-orange-400 italic font-mono leading-relaxed bg-orange-500/5 px-2 py-1 rounded">
                    • {ob}
                  </p>
                ))}
              </div>

              {/* Voting ratios visual bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-emerald-400 font-bold">Yay: {activeProposal.yayCount}</span>
                  <span className="text-red-400 font-bold font-sans">Nay: {activeProposal.nayCount}</span>
                </div>
                <div className="h-1.5 bg-red-500/20 rounded-full flex overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full" 
                    style={{ width: `${(activeProposal.yayCount / (activeProposal.yayCount + activeProposal.nayCount)) * 100}%` }} 
                  />
                </div>
              </div>
            </div>

            {/* Live senate ledger stream */}
            <div className="space-y-1 bg-slate-950/20 border border-slate-850 p-3 rounded-lg">
              <span className="text-[9px] text-slate-500 font-semibold block uppercase mb-1">CONVERSATIONAL DEBATE STREAM</span>
              <div className="space-y-1.5 max-h-[120px] overflow-y-auto text-[10px] leading-relaxed font-mono">
                {activeProposal.votes.map((v, i) => (
                  <div key={i} className="flex justify-between items-center bg-slate-900/30 p-1.5 rounded border border-slate-900">
                    <span className="text-slate-300 font-bold">{v.name} <span className="text-[8px] font-normal text-slate-500">({v.role})</span></span>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded font-sans ${v.vote === "YAY" ? "text-emerald-400 bg-emerald-500/10" : "text-amber-500 bg-amber-500/10"}`}>{v.vote}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t border-slate-800">
            <button 
              onClick={castSenateYay}
              className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-slate-100 rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              CONFIRM MASTER APPROVAL (YAY)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}


// ==========================================
// SYSTEM 3 & 4: LAYER 0 FIREWALL & DOUBT ENGINE
// ==========================================
interface Layer0FirewallProps {
  onAddAuditLog: (newLog: any) => void;
}

export function Layer0Firewall({ onAddAuditLog }: Layer0FirewallProps) {
  const [isHardening, setIsHardening] = useState(false);
  const [violations, setViolations] = useState([
    { id: "violation_1", timestamp: "32m ago", agent: "Ars Paulina Sandbox", action: "ATTEMPTED_FS_WRITE_OUTOFBOUND", severity: "WARN_GATED", ruleMatched: "RULE_02_RESTRICTED_DISK" },
    { id: "violation_2", timestamp: "1h ago", agent: "L1 Network Enclave", action: "NON_ECC_HANDSHAKE_P2P", severity: "CLEARED_AUTOMATICALLY", ruleMatched: "RULE_09_CORRECT_PARITY" }
  ]);

  // Doubt Engine State tracking
  const [doubtItems, setDoubtItems] = useState([
    { id: "f_1", claim: "DuckDB local cache indices are completely validated", confidence: 0.94, verAge: "12m", contradictionVelocity: "Low", index: 0.12, status: "GREEN" },
    { id: "f_2", claim: "Biometric sensor telemetry packet parities match sovereign master seed", confidence: 0.54, verAge: "1m", contradictionVelocity: "High", index: 0.62, status: "YELLOW" },
    { id: "f_3", claim: "External server webhook is certified secure SSL key exchange", confidence: 0.22, verAge: "5s", contradictionVelocity: "Critical", index: 0.88, status: "RED" }
  ]);

  const triggerShieldHardening = () => {
    setIsHardening(true);
    setTimeout(() => {
      onAddAuditLog({
        actor: "Layer 0 Sentinel",
        action: "HARDEN_COMPLIANCE_PARAMETERS",
        status: "AUTHORIZED",
        details: "Refreshed live enclave rules blocklist. Isolated red pipelines."
      });
      setIsHardening(false);
    }, 1500);
  };

  const triggerFactRecheck = (id: string) => {
    setDoubtItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
           verAge: "Just now",
           confidence: Math.min(0.99, item.confidence + 0.15),
           index: Math.max(0.1, item.index - 0.2),
           status: item.index - 0.2 < 0.4 ? "GREEN" as const : "YELLOW" as const
        };
      }
      return item;
    }));

    onAddAuditLog({
      actor: "Doubt Engine",
      action: "EVALUATE_EPISTEMIC_FAITH",
      status: "AUTHORIZED",
      details: `Re-calculated contradiction density and verification bounds for fact reference ${id}. Index stabilized.`
    });
  };

  return (
    <div className="space-y-6 font-mono text-slate-300">
      
      {/* SHIELD STATS BAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase">FIREWALL CORE STATE</span>
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-xl font-bold font-sans text-emerald-400 mt-2">SHIELDS ACTIVE</p>
          <span className="text-[9px] text-slate-500 block mt-1">LOCK-STEP DIRECTIVES SIGNED</span>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase">CONSTITUTIONAL CORES</span>
            <span className="text-[9px] text-emerald-400 font-bold">100% SEALED</span>
          </div>
          <p className="text-xl font-bold font-sans text-slate-100 mt-2">Zero Red Breaches</p>
          <span className="text-[9px] text-slate-500 block mt-1">EVALUATING SYSTEM TRACE STREAM</span>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase">DOUBT COEFFICIENT</span>
            <span className="text-[9px] text-orange-400 font-bold font-sans">Index avg: 0.54</span>
          </div>
          <p className="text-xl font-bold font-sans text-orange-400 mt-2">3 Epistemic Targets</p>
          <span className="text-[9px] text-slate-500 block mt-1">VERIFYING EXTERNAL SEED TRUSTS</span>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl">
          <button 
            onClick={triggerShieldHardening}
            disabled={isHardening}
            className="w-full h-full bg-purple-900/30 border border-purple-500/20 hover:border-purple-500/45 rounded-xl text-center flex flex-col items-center justify-center p-3 text-purple-300 font-bold gap-1.5 transition active:scale-[0.98]"
          >
            <ShieldCheck className={`w-5 h-5 text-purple-400 ${isHardening ? 'animate-spin' : ''}`} />
            <span>{isHardening ? "HARDENING..." : "FORCE COGNITIVE SHIELD"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* FIREWALL RULE TABLE & ALERTS */}
        <div id="enclave-actions-list" className="lg:col-span-6 bg-slate-900/30 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                CONSTITUTIONAL FIREWALL RULE MATRIX
              </span>
              <span className="text-[9px] text-orange-400 font-bold uppercase bg-orange-400/5 px-2 py-0.5 rounded border border-orange-500/20">
                Live monitoring
              </span>
            </div>

            <div className="space-y-3 mb-4">
              {/* Green Yellow Red indicator strip */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-2.5 text-center">
                  <span className="text-[9px] text-slate-500 font-bold block uppercase mb-1">GREEN LIGHT</span>
                  <span className="text-xs font-bold text-emerald-400">921 Checked</span>
                </div>
                <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-2.5 text-center">
                  <span className="text-[9px] text-slate-500 font-bold block uppercase mb-1">YELLOW WARN</span>
                  <span className="text-xs font-bold text-yellow-400">14 Gated</span>
                </div>
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-2.5 text-center">
                  <span className="text-[9px] text-slate-500 font-bold block uppercase mb-1">RED HALTED</span>
                  <span className="text-xs font-bold text-red-400">0 Liquidated</span>
                </div>
              </div>

              <div className="border-t border-slate-850 pt-3">
                <span className="text-[9px] text-slate-500 font-semibold block uppercase mb-2">INTEGRITY THREAT VIOLATIONS FEED</span>
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {violations.map((v) => (
                    <div key={v.id} className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-850 text-[10px] leading-relaxed">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-orange-400 font-bold uppercase">{v.action}</span>
                        <span className="text-[8px] text-slate-500 font-mono">{v.timestamp}</span>
                      </div>
                      <p className="text-slate-400">Source Agent: <span className="text-slate-200">{v.agent}</span> matched rule <span className="text-purple-400">{v.ruleMatched}</span></p>
                      <span className="mt-1 inline-block text-[8px] font-bold px-1.5 py-0.2 rounded bg-orange-400/10 text-orange-400 font-sans">{v.severity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DOUBT ENGINE VISIVAL FEED */}
        <div id="doubt-engine-chamber" className="lg:col-span-6 bg-slate-900/30 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                EPISTEMIC DOUBT ENGINE CORE
              </span>
              <span className="text-[8px] text-slate-500 font-mono">DISBELIEF MONITOR</span>
            </div>

            <p className="text-[11px] text-slate-400 mb-4 leading-normal">
              Solomon X refuses to hallucinate. The Doubt Engine computes an <span className="text-slate-200 font-semibold">Epistemic Disbelief Index (EDI)</span> for every synthesized proposition.
            </p>

            <div className="space-y-3">
              {doubtItems.map((item) => {
                const isGreen = item.status === "GREEN";
                const isYellow = item.status === "YELLOW";
                return (
                  <div key={item.id} className="p-3 bg-slate-950/70 border border-slate-850 rounded-xl hover:border-slate-800 transition text-[11px] space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold text-slate-200 text-xs leading-normal">{item.claim}</p>
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded font-sans ${
                        isGreen ? "bg-emerald-500/10 text-emerald-400" : isYellow ? "bg-yellow-500/10 text-yellow-400" : "bg-red-500/10 text-red-400"
                      }`}>
                        EDI: {item.index.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                      <span>VERIFIED: {item.verAge}</span>
                      <span>CONTRADICT VELOCITY: <span className={item.contradictionVelocity === "Low" ? "text-slate-400" : "text-orange-400"}>{item.contradictionVelocity}</span></span>
                    </div>

                    {/* Progress tracking bar */}
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden flex">
                      <div 
                        className={`h-full rounded-full ${isGreen ? "bg-emerald-500" : isYellow ? "bg-yellow-500" : "bg-red-500"}`}
                        style={{ width: `${item.confidence * 100}%` }}
                      />
                    </div>

                    <div className="flex justify-end pt-1">
                      <button 
                        onClick={() => triggerFactRecheck(item.id)}
                        className="h-6 px-2 bg-slate-900 border border-slate-800 rounded text-[9px] font-bold text-slate-400 hover:text-purple-300 hover:border-purple-500/20 transition flex items-center gap-1"
                      >
                        <RefreshCw className="w-2.5 h-2.5" />
                        RE-ESTABLISHED SEED VERIFICATION
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}


// ==========================================
// SYSTEM 8 & 10 & 11: EVOLUTION LAB & TOOL EXECUTION FABRIC & MORNING BRIEF
// ==========================================
interface EvolutionLabProps {
  onAddAuditLog: (newLog: any) => void;
}

export function EvolutionLab({ onAddAuditLog }: EvolutionLabProps) {
  const [activeTab, setActiveTab] = useState<"evolution" | "fabric" | "morning">("evolution");
  
  // Morning priorities list
  const morningPriorities = [
    { target: "Refactor Lorentzian 3D Rings", state: "STABLE", icon: "emerald" },
    { target: "Review LLM Doubt analysis parity errors", state: "PENDING_VERIFY", icon: "amber" },
    { target: "Re-anchor L8 Wisdom Memory Ledger", state: "LOCK_AUTHORIZED", icon: "emerald" }
  ];

  // Tool trace triggers
  const [traceLogs, setTraceLogs] = useState([
    { step: "PLANNER_MATRIX", text: "Planner compiled tasks list into JSON schema.", status: "SUCCESS" },
    { step: "TOOL_SELECTOR", text: "Selected local VS Code folder mapping and terminal unseal.", status: "SUCCESS" },
    { step: "SANDBOX_EXEC", text: "Executed test run on mock files inside isolated Docker.", status: "SUCCESS" },
    { step: "CORE_VERIFIER", text: "Parsed syntax issues and memory parity checks.", status: "SUCCESS" }
  ]);

  const [isMutating, setIsMutating] = useState(false);
  const [currentMutationVer, setCurrentMutationVer] = useState("S-10.4.8");

  const startMutationAlgorithm = () => {
    setIsMutating(true);
    setTimeout(() => {
      onAddAuditLog({
        actor: "Evolution Compiler",
        action: "COMPILE_SELF_IMPROVEMENT_MUTATION",
        status: "AUTHORIZED",
        details: "Mutation pass succeeded validation testing on sandbox branches. Promoting S-10.4.9 master candidate."
      });
      setCurrentMutationVer("S-10.4.9");
      setIsMutating(false);
    }, 1800);
  };

  return (
    <div className="space-y-5 font-mono text-slate-300">
      
      {/* HUD DECK SELECTORS */}
      <div id="evolution-deck-subnavigation" className="flex items-center gap-2 bg-slate-900/30 p-2 border border-slate-850 rounded-xl justify-center md:justify-start">
        <button 
          onClick={() => setActiveTab("evolution")}
          className={`h-8 text-[10px] uppercase font-bold tracking-wide px-4 rounded-lg transition ${
            activeTab === "evolution" ? "bg-purple-600/15 text-purple-300 border border-purple-500/20" : "text-slate-500 hover:text-slate-300"
          }`}
        >
          System 8: Evolution Sandbox
        </button>
        <button 
          onClick={() => setActiveTab("fabric")}
          className={`h-8 text-[10px] uppercase font-bold tracking-wide px-4 rounded-lg transition ${
            activeTab === "fabric" ? "bg-purple-600/15 text-purple-300 border border-purple-500/20" : "text-slate-500 hover:text-slate-300"
          }`}
        >
          System 10: Tool Fabric Trace
        </button>
        <button 
          onClick={() => setActiveTab("morning")}
          className={`h-8 text-[10px] uppercase font-bold tracking-wide px-4 rounded-lg transition ${
            activeTab === "morning" ? "bg-purple-600/15 text-purple-300 border border-purple-500/20" : "text-slate-500 hover:text-slate-300"
          }`}
        >
          System 11: Morning Briefing
        </button>
      </div>

      {activeTab === "evolution" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-fadeIn">
          
          {/* GIT MUTATOR GRAPH */}
          <div className="lg:col-span-7 bg-slate-900/30 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-purple-400" />
                  SELF-IMPROVING COGNITIVE MUTATION LAB
                </span>
                <span className="text-[10px] text-slate-500">ACTIVE COMPILER</span>
              </div>

              <div className="bg-slate-950/70 border border-slate-850 p-4 rounded-xl mb-4 text-[11px] leading-relaxed">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-slate-400">Current Promoted Version:</span>
                  <span className="text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">{currentMutationVer}</span>
                </div>
                <p className="text-slate-500 mb-4 font-mono">
                  Solomon X refines its instructions and routing models automatically. System simulates a local git sandbox and compiles candidate configurations.
                </p>

                {/* Git-like mutation steps tree visualizer */}
                <div className="relative pl-6 space-y-4 border-l border-purple-500/30 ml-2">
                  <div className="relative">
                    <span className="absolute -left-[29px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
                    <span className="text-emerald-400 font-bold">Parent baseline (v1.4.2) promoted successfully</span>
                    <p className="text-[10px] text-slate-500 mt-0.5">Parity validations passed 100%.</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[29px] top-1 w-3.5 h-3.5 rounded-full bg-purple-500 border-2 border-slate-950 animate-pulse" />
                    <span className="text-purple-300 font-bold">Candidate mutation pass compiling (S-10.4.9)</span>
                    <p className="text-[10px] text-slate-500 mt-0.5">Evaluating utility function improvements (+0.32 margins).</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex gap-2">
              <button 
                onClick={startMutationAlgorithm}
                disabled={isMutating}
                className="w-full h-10 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                <span>{isMutating ? "SANDBOX MUTATIONS TESTING IN DOCKER..." : "TRIGGER SELF-EVOLUTION CYCLE"}</span>
              </button>
            </div>
          </div>

          {/* EXPERIMENTAL MUTATIONS SANDBOX DATA */}
          <div className="lg:col-span-5 bg-slate-900/30 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-200 block mb-3">CONCURRENT EXPERIMENT LEDGER</span>
              
              <div className="space-y-2.5">
                <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-3 text-[11px]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-300 font-bold">Exp #44: Prompt compression parameter shift</span>
                    <span className="text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded">Passed</span>
                  </div>
                  <p className="text-slate-500 font-mono leading-normal">Shaved token latencies by 4.2ms. Decoupled prompt matrix bounds correctly.</p>
                </div>

                <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-3 text-[11px]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-300 font-bold">Exp #45: Recursive doubt indexing on sub-propositions</span>
                    <span className="text-red-400 bg-red-400/10 px-1 py-0.2 rounded">Failed</span>
                  </div>
                  <p className="text-slate-500 font-mono leading-normal">Exceeded GPU latency budget by 42ms. Rollback trigger unsealed.</p>
                </div>
              </div>
            </div>
            
            <div className="pt-3 border-t border-slate-800/60 mt-3 text-center text-[10px] text-slate-500 leading-relaxed font-mono">
              SYSTEM SEEDS AN AUTOMATED TIMED SWEEP PASS EVERY 24 HOURS DURING IDLE LOAD PERIODS
            </div>
          </div>

        </div>
      )}

      {activeTab === "fabric" && (
        <div className="bg-slate-900/30 border border-slate-800 p-5 rounded-2xl animate-fadeIn space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              TOOL EXECUTION FABRIC TRACE LEDGER
            </span>
            <span className="text-[10px] text-cyan-400 font-semibold bg-cyan-500/5 px-2 py-0.5 rounded border border-cyan-500/25">
              Secure Sandbox Connected
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed max-w-xl">
            Tracing how tasks are planned, selected, executed, and verified inside the secure sandbox boundary. Every command goes through the sovereign validation loopback.
          </p>

          {/* Visual trace graph pipeline mapping */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-950/40 p-4 border border-slate-850 rounded-xl">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-center flex flex-col justify-between items-center gap-2">
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest block">STEP 01</span>
              <span className="text-xs font-semibold text-purple-300">Task Planner</span>
              <p className="text-[9px] text-slate-500">Formulates recursive plans</p>
              <div className="h-1 bg-purple-500 w-full rounded" />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-center flex flex-col justify-between items-center gap-2">
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest block">STEP 02</span>
              <span className="text-xs font-semibold text-purple-300">Tool Gater</span>
              <p className="text-[9px] text-slate-500">Examines filesystem constraints</p>
              <div className="h-1 bg-purple-500 w-full rounded" />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-center flex flex-col justify-between items-center gap-2">
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest block">STEP 03</span>
              <span className="text-xs font-semibold text-yellow-300">ECC Sandbox</span>
              <p className="text-[9px] text-slate-400">Executes command inside VM</p>
              <div className="h-1 bg-yellow-500 w-full rounded" />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-center flex flex-col justify-between items-center gap-2">
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest block">STEP 04</span>
              <span className="text-xs font-semibold text-emerald-300">Epistemic Verify</span>
              <p className="text-[9px] text-slate-500">Commits signature to memory</p>
              <div className="h-1 bg-emerald-500 w-full rounded" />
            </div>
          </div>

          {/* Trace debug logs visual console */}
          <div className="space-y-1.5 p-3.5 bg-slate-950 border border-slate-850 rounded-xl max-h-[180px] overflow-y-auto text-[10px] leading-relaxed">
            {traceLogs.map((log, index) => (
              <div key={index} className="flex justify-between items-start font-mono hover:bg-slate-900/40 p-1.5 rounded transition">
                <span className="text-[#a78bfa] font-bold">[{log.step}] <span className="text-slate-300 font-normal">{log.text}</span></span>
                <span className="text-emerald-400 font-extrabold uppercase bg-emerald-500/10 px-2 rounded">{log.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "morning" && (
        <div className="bg-slate-900/30 border border-slate-800 p-5 rounded-2xl animate-fadeIn space-y-4 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                MORNING COGNITIVE BRIEFING
              </span>
              <span className="text-[10px] font-bold text-emerald-400">STABLE CORE</span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
              Welcome back. Yesterday's training loops consolidated successfully. Here is today's suggested focus priority list based on pending system directives.
            </p>

            <div className="space-y-2.5">
              {morningPriorities.map((item, i) => (
                <div key={i} className="flex justify-between items-center bg-slate-950/40 border border-slate-850 p-2.5 rounded-xl hover:border-slate-800 transition">
                  <span className="text-xs font-medium text-slate-200">{item.target}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    item.state === "STABLE" ? "text-emerald-400 bg-emerald-500/10" : "text-yellow-400 bg-yellow-500/10"
                  }`}>{item.state}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">INTELLIGENT LEARNING GOALS METRICS</span>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Learn Lorentzian Graph structures</span>
                    <span className="text-purple-400 font-bold font-sans">92%</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full w-[92%]" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-300">
                    <span>Build Solomon OS Core Dashboard</span>
                    <span className="text-purple-400 font-bold font-sans">100%</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[100%]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-85 w-full pt-3 flex justify-between items-baseline">
              <span className="text-[10px] text-slate-500 font-semibold uppercase">ESTIMATED DAILY FOCUS SCORE:</span>
              <span className="text-xl font-bold text-emerald-400">94/100</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
