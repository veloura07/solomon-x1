import React, { useState, useEffect } from "react";
import { 
  Cpu, 
  ShieldCheck, 
  Flame, 
  Lock, 
  AlertTriangle, 
  RefreshCw, 
  GitBranch, 
  GitMerge, 
  Play, 
  FileText, 
  Terminal, 
  ExternalLink,
  Sparkles,
  Zap,
  ShieldAlert,
  Plus,
  Trash
} from "lucide-react";

import { AgentSpec, AuditLog } from "../types";

// ==========================================
// SYSTEM 1 & 2: COGNITIVE RESOURCE ECONOMY & AGENT SENATE
// ==========================================
export { CognitiveResourceEconomy } from "./CognitiveResourceEconomy";

// ==========================================
// SYSTEM 3 & 4: LAYER 0 FIREWALL & DOUBT ENGINE
// ==========================================
interface Layer0FirewallProps {
  onAddAuditLog: (newLog: any) => void;
}

export function Layer0Firewall({ onAddAuditLog }: Layer0FirewallProps) {
  const [isHardening, setIsHardening] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  
  // Real active counters
  const [greenChecked, setGreenChecked] = useState(921);
  const [yellowGated, setYellowGated] = useState(14);
  const [redHalted, setRedHalted] = useState(0);

  // Violations feed
  const [violations, setViolations] = useState([
    { id: "violation_1", timestamp: "32m ago", agent: "Ars Paulina Sandbox", action: "ATTEMPTED_FS_WRITE_OUTOFBOUND", severity: "WARN_GATED", ruleMatched: "RULE_02_RESTRICTED_DISK" },
    { id: "violation_2", timestamp: "1h ago", agent: "L1 Network Enclave", action: "NON_ECC_HANDSHAKE_P2P", severity: "CLEARED_AUTOMATICALLY", ruleMatched: "RULE_09_CORRECT_PARITY" }
  ]);

  // Predefined or custom rules matrix
  const [rules, setRules] = useState([
    { id: "rule_1", code: "RULE_02_RESTRICTED_DISK", agent: "Ars Paulina Sandbox", action: "BLOCK_&_WARN", active: true },
    { id: "rule_2", code: "RULE_09_CORRECT_PARITY", agent: "L1 Network Enclave", action: "RESOLVE_ECC", active: true },
    { id: "rule_3", code: "RULE_04_SOCKET_SHIELD", agent: "Verum Trust Hub", action: "SILENT_DROP", active: true }
  ]);

  // Custom Rule Form states
  const [newRuleCode, setNewRuleCode] = useState("");
  const [newRuleAgent, setNewRuleAgent] = useState("Almadel Core Layer");
  const [newRuleAction, setNewRuleAction] = useState("QUARANTINE_PROCESS");

  // Doubt Engine State tracking
  const [doubtItems, setDoubtItems] = useState([
    { id: "f_1", claim: "DuckDB local cache indices are completely validated", confidence: 0.94, verAge: "12m", contradictionVelocity: "Low", index: 0.12, status: "GREEN" as const },
    { id: "f_2", claim: "Biometric sensor telemetry packet parities match sovereign master seed", confidence: 0.54, verAge: "1m", contradictionVelocity: "High", index: 0.62, status: "YELLOW" as const },
    { id: "f_3", claim: "External server webhook is certified secure SSL key exchange", confidence: 0.22, verAge: "5s", contradictionVelocity: "Critical", index: 0.88, status: "RED" as const }
  ]);

  // Submission of new custom claim
  const [newClaim, setNewClaim] = useState("");
  const [evalStep, setEvalStep] = useState("");
  const [isEvaluatingClaim, setIsEvaluatingClaim] = useState(false);

  // Trigger shield hardening
  const triggerShieldHardening = () => {
    setIsHardening(true);
    setTimeout(() => {
      onAddAuditLog({
        actor: "Layer 0 Sentinel",
        action: "HARDEN_COMPLIANCE_PARAMETERS",
        status: "AUTHORIZED",
        details: "Refreshed live enclave rules blocklist. Isolated red pipelines."
      });
      setGreenChecked(c => c + Math.floor(Math.random() * 30 + 15));
      setIsHardening(false);
    }, 1500);
  };

  // Recheck fact
  const triggerFactRecheck = (id: string) => {
    setDoubtItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          verAge: "Just now",
          confidence: Math.min(0.99, item.confidence + 0.15),
          index: Math.max(0.04, item.index - 0.18),
          status: (item.index - 0.18) <= 0.35 ? ("GREEN" as const) : ("YELLOW" as const)
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

  // Submit custom claim simulation
  const handleAddClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClaim.trim()) return;

    setIsEvaluatingClaim(true);
    setEvalStep("DESTRUCTURING HEURISTIC SIGNATURES...");

    setTimeout(() => {
      setEvalStep("CROSS-COMPILING AMBIGUITIES...");
      setTimeout(() => {
        setEvalStep("CALCULATING CONTRADICTION DENSITY...");
        setTimeout(() => {
          // Absolute word penalty mapping
          const hasAbsolute = /\b(always|never|absolute|perfect|100%|infinite|all|nothing|flawless|completely)\b/i.test(newClaim);
          const calculatedIndex = hasAbsolute 
            ? 0.70 + Math.random() * 0.25 
            : 0.15 + Math.random() * 0.45;
          const confidence = 1 - calculatedIndex;
          
          let statusVal: "GREEN" | "YELLOW" | "RED" = "GREEN";
          if (calculatedIndex > 0.65) statusVal = "RED";
          else if (calculatedIndex > 0.35) statusVal = "YELLOW";

          const contradictionVelocity = calculatedIndex > 0.65 ? "Critical" : calculatedIndex > 0.35 ? "High" : "Low";

          const addedItem = {
            id: `f_user_${Date.now().toString().slice(-4)}`,
            claim: newClaim,
            confidence: Math.round(confidence * 100) / 100,
            verAge: "1s ago",
            contradictionVelocity,
            index: Math.round(calculatedIndex * 100) / 100,
            status: statusVal
          };

          setDoubtItems(prev => [addedItem, ...prev]);
          
          onAddAuditLog({
            actor: "Epistemic Core",
            action: "RESOLVE_PROPOSITION_TRUST",
            status: statusVal === "RED" ? "BLOCKED_HALLUCINATION" : "AUTHORIZED",
            details: `Constructed Epistemic disbelief profile for user contention. EDI evaluated to ${addedItem.index.toFixed(2)}.`
          });

          setNewClaim("");
          setIsEvaluatingClaim(false);
          setEvalStep("");
        }, 600);
      }, 600);
    }, 600);
  };

  // Rule creation helper
  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    const candidateCode = newRuleCode.trim().toUpperCase().replace(/\s+/g, "_");
    if (!candidateCode) return;

    const newRule = {
      id: `rule_${Date.now()}`,
      code: candidateCode.startsWith("RULE_") ? candidateCode : `RULE_MX_${candidateCode}`,
      agent: newRuleAgent,
      action: newRuleAction,
      active: true
    };

    setRules(prev => [...prev, newRule]);
    onAddAuditLog({
      actor: "Constitution Root",
      action: "REGISTER_ENCLAVE_RULE",
      status: "SEALED",
      details: `Injected custom state policy ${newRule.code} into ${newRule.agent} dynamic gater.`
    });

    setNewRuleCode("");
  };

  // Toggle rule status helper
  const toggleRule = (id: string, code: string, active: boolean) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
    onAddAuditLog({
      actor: "Constitution Root",
      action: active ? "DEACTIVATE_POLICY_CLAMP" : "ENGAGE_POLICY_CLAMP",
      status: "AUTHORIZED",
      details: `User unsealed policy rule ${code}. Replaced dynamic routing parameters.`
    });
  };

  // Simulate threat run
  const triggerManualThreatSimulation = () => {
    setIsGlitching(true);
    onAddAuditLog({
      actor: "Sovereign Intrusion Monitor",
      action: "DETECT_ANOMALY_IP_BURST",
      status: "MITIGATED",
      details: "Detected recursive non-cryptographic peer handshake packets on port 443."
    });

    setTimeout(() => {
      // Find a random active rule to trigger violation
      const activeRules = rules.filter(r => r.active);
      const ruleToMatch = activeRules[Math.floor(Math.random() * activeRules.length)] || rules[0];

      const newViolation = {
        id: `violation_user_${Date.now()}`,
        timestamp: "Just now",
        agent: ruleToMatch.agent,
        action: "SUSPICIOUS_PROBING_DETECTED",
        severity: ruleToMatch.action === "SILENT_DROP" ? "BLOCKED_SILENT" : "QUARANTINED",
        ruleMatched: ruleToMatch.code
      };

      setViolations(prev => [newViolation, ...prev]);
      setYellowGated(y => y + 1);
      setRedHalted(r => r + 1);

      setIsGlitching(false);
    }, 1200);
  };

  return (
    <div className={`space-y-6 font-mono text-slate-300 relative transition-all duration-300 ${isGlitching ? 'ring-2 ring-red-500/50 bg-red-950/10' : ''}`}>
      
      {/* GLITCH OVERLAY INDICATOR */}
      {isGlitching && (
        <div className="absolute inset-0 z-50 bg-red-950/40 backdrop-blur-[2px] flex flex-col items-center justify-center border-2 border-red-500 border-dashed animate-pulse text-red-400 p-8">
          <ShieldAlert className="w-12 h-12 text-red-500 animate-bounce mb-3" />
          <span className="text-sm font-extrabold tracking-widest uppercase">SIMULATING LIVE COMPLIANCE THREAT</span>
          <p className="text-[10px] text-red-400/80 mt-1 max-w-sm text-center uppercase tracking-wider">
            Sovereign sentinel injecting non-parity test load to evaluate containment matrices.
          </p>
        </div>
      )}

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
          <p className="text-xl font-bold font-sans text-slate-100 mt-2">{redHalted} Red Breaches</p>
          <span className="text-[9px] text-slate-500 block mt-1">EVALUATING SYSTEM TRACE STREAM</span>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase">DOUBT COEFFICIENT</span>
            <span className="text-[9px] text-orange-400 font-bold font-sans">
              EDI Targets: {doubtItems.length}
            </span>
          </div>
          <p className="text-xl font-bold font-sans text-orange-400 mt-2">
            {(doubtItems.reduce((acc, i) => acc + i.index, 0) / doubtItems.length).toFixed(3)} EDI
          </p>
          <span className="text-[9px] text-slate-500 block mt-1">VERIFYING EXTERNAL SEED TRUSTS</span>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl grid grid-cols-1 gap-2 border-dashed">
          <button 
            type="button"
            onClick={triggerShieldHardening}
            disabled={isHardening || isGlitching}
            className="w-full bg-purple-900/30 hover:bg-purple-900/40 border border-purple-500/20 hover:border-purple-500/45 rounded-xl text-center flex flex-col items-center justify-center p-2 text-purple-300 font-bold gap-1 transition active:scale-[0.98] cursor-pointer"
          >
            <ShieldCheck className={`w-4 h-4 text-purple-400 ${isHardening ? 'animate-spin' : ''}`} />
            <span className="text-[9px] uppercase tracking-wider">{isHardening ? "HARDENING..." : "FORCE COGNITIVE SHIELD"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* FIREWALL RULE TABLE & ALERTS */}
        <div id="enclave-actions-list" className="lg:col-span-6 bg-slate-900/30 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                CONSTITUTIONAL FIREWALL RULE MATRIX
              </span>
              <span className="text-[9px] text-orange-400 font-bold uppercase bg-orange-400/5 px-2 py-0.5 rounded border border-orange-500/20 animate-pulse">
                Live monitoring
              </span>
            </div>

            <div className="space-y-3">
              {/* Green Yellow Red indicator strip */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-2.5 text-center">
                  <span className="text-[9px] text-slate-500 font-bold block uppercase mb-1">GREEN LIGHT</span>
                  <span className="text-xs font-bold text-emerald-400">{greenChecked} Checked</span>
                </div>
                <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-2.5 text-center">
                  <span className="text-[9px] text-slate-500 font-bold block uppercase mb-1">YELLOW WARN</span>
                  <span className="text-xs font-bold text-yellow-400">{yellowGated} Gated</span>
                </div>
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-2.5 text-center">
                  <span className="text-[9px] text-slate-500 font-bold block uppercase mb-1">RED HALTED</span>
                  <span className="text-xs font-bold text-red-500">{redHalted} Halted</span>
                </div>
              </div>

              {/* Dynamic Interactive Active Rules Matrix */}
              <div className="border-t border-slate-850 pt-3 space-y-2">
                <span className="text-[9px] text-slate-500 font-semibold block uppercase">Active Security Assertions ({rules.length})</span>
                <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
                  {rules.map((rule) => (
                    <div key={rule.id} className="p-2 bg-slate-950/60 border border-slate-850 rounded-lg flex items-center justify-between text-[11px]">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`w-1.5 h-1.5 rounded-full ${rule.active ? "bg-emerald-400" : "bg-slate-600"}`} />
                          <span className={`font-mono text-[9px] font-bold ${rule.active ? "text-purple-300" : "text-slate-500 line-through"}`}>{rule.code}</span>
                        </div>
                        <span className="text-[8px] text-slate-500 block">Agent: {rule.agent} • Policy: {rule.action}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleRule(rule.id, rule.code, rule.active)}
                        className={`px-2 h-5.5 rounded text-[8px] font-bold transition flex items-center gap-0.5 cursor-pointer ${
                          rule.active 
                            ? "bg-emerald-950/40 hover:bg-emerald-950 border border-emerald-500/20 text-emerald-400" 
                            : "bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-500"
                        }`}
                      >
                        {rule.active ? "CLAMPED" : "UNCLAMPED"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rule Addition Block */}
              <form onSubmit={handleCreateRule} className="p-3 bg-slate-950/80 border border-slate-850 rounded-xl space-y-2 text-[10px]">
                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wide">ADD CONSTITUTIONAL RULE ENCLAVE</span>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[8px] text-slate-500 font-bold block">TARGET AGENT</label>
                    <select
                      value={newRuleAgent}
                      onChange={(e) => setNewRuleAgent(e.target.value)}
                      className="w-full h-7 bg-slate-900 border border-slate-800 rounded px-1.5 text-[9px] text-slate-300 outline-none"
                    >
                      <option value="Almadel Core Layer">Almadel Core</option>
                      <option value="Ars Paulina Sandbox">Ars Paulina</option>
                      <option value="Notoria Crypt Layer">Ars Notoria</option>
                      <option value="Goetia Daemon Ring">Ars Goetia</option>
                      <option value="Fulcanelli Alch Core">Fulcanelli</option>
                      <option value="Verum Trust Hub">Verum Trust Hub</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] text-slate-500 font-bold block">PENALTY ACTION</label>
                    <select
                      value={newRuleAction}
                      onChange={(e) => setNewRuleAction(e.target.value)}
                      className="w-full h-7 bg-slate-900 border border-slate-800 rounded px-1.5 text-[9px] text-slate-300 outline-none"
                    >
                      <option value="QUARANTINE_PROCESS">QUARANTINE PROCESS</option>
                      <option value="BLOCK_&_WARN">BLOCK & WARN</option>
                      <option value="SILENT_DROP">SILENT DROP</option>
                      <option value="REDUCE_ACCURACY">REDUCE ACCURACY</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. RULE_MAX_MEMORY_PRESSURE"
                    value={newRuleCode}
                    onChange={(e) => setNewRuleCode(e.target.value)}
                    className="flex-1 h-7 bg-slate-900 border border-slate-800 rounded px-2 text-[9px] text-slate-300 outline-none focus:border-purple-500/45"
                  />
                  <button 
                    type="submit"
                    className="h-7 px-3 bg-purple-600 hover:bg-purple-500 text-[10px] font-bold text-slate-100 rounded flex items-center gap-1 cursor-pointer transition active:scale-[0.98]"
                  >
                    <Plus className="w-3 h-3" />
                    INJECT
                  </button>
                </div>
              </form>

              <div className="border-t border-slate-850 pt-3">
                <span className="text-[9px] text-slate-500 font-semibold block uppercase mb-2">INTEGRITY THREAT VIOLATIONS FEED ({violations.length})</span>
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {violations.map((v) => (
                    <div key={v.id} className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-850 text-[10px] leading-normal animate-fadeIn">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-orange-400 font-bold tracking-wide font-mono text-[9px] uppercase">{v.action}</span>
                        <span className="text-[8px] text-slate-500 font-mono">{v.timestamp}</span>
                      </div>
                      <p className="text-slate-400 text-[9px]">Source Agent: <span className="text-slate-200">{v.agent}</span> matched rule <span className="text-purple-400">{v.ruleMatched}</span></p>
                      <span className="mt-1 inline-block text-[8px] font-bold px-1.5 py-0.2 rounded bg-orange-400/10 text-orange-400 font-sans">{v.severity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-850">
            <button
              type="button"
              onClick={triggerManualThreatSimulation}
              disabled={isGlitching || isHardening}
              className="w-full h-8.5 bg-red-950/20 border border-red-500/40 hover:bg-red-950/30 text-red-450 text-[9px] font-bold rounded-xl transition flex items-center justify-center gap-1.5 tracking-wider uppercase font-mono cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              INJECT TEST INTRUSION FAULT LOAD
            </button>
          </div>
        </div>

        {/* DOUBT ENGINE COGNITIVE CONSOLE */}
        <div id="doubt-engine-chamber" className="lg:col-span-6 bg-slate-900/30 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                EPISTEMIC DOUBT ENGINE CORE
              </span>
              <span className="text-[8px] text-slate-500 font-mono tracking-widest uppercase">DISBELIEF MONITOR</span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
              The Doubt Engine computes an <span className="text-slate-200 font-semibold">Epistemic Disbelief Index (EDI)</span> to evaluate logic validity. Absolute generalizations decrease belief density.
            </p>

            {/* Claim input box */}
            <form onSubmit={handleAddClaim} className="p-3.5 bg-slate-950/70 border border-slate-850 rounded-xl space-y-2.5 text-[10px]">
              <span className="text-[9px] text-purple-400 font-bold block uppercase tracking-wide">SUBMIT CONTENTION FOR HEURISTIC REVIEW</span>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  disabled={isEvaluatingClaim}
                  placeholder="e.g. Always fallback to local cache when network is offline..."
                  value={newClaim}
                  onChange={(e) => setNewClaim(e.target.value)}
                  className="flex-1 h-8 bg-slate-900 border border-slate-800 rounded px-2.5 text-[10px] text-slate-300 outline-none focus:border-purple-500/40 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isEvaluatingClaim || !newClaim.trim()}
                  className="h-8 px-3.5 bg-purple-600 hover:bg-purple-500 text-slate-100 rounded text-[9px] font-bold text-center tracking-wider transition font-mono uppercase cursor-pointer disabled:opacity-40"
                >
                  AUDIT
                </button>
              </div>

              {isEvaluatingClaim && (
                <div className="pt-2 flex items-center gap-2 animate-fadeIn">
                  <RefreshCw className="w-3.5 h-3.5 text-purple-400 animate-spin flex-shrink-0" />
                  <span className="text-[8px] uppercase font-bold text-purple-400 animate-pulse tracking-wide font-mono">
                    {evalStep}
                  </span>
                </div>
              )}
            </form>

            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {doubtItems.map((item) => {
                const isGreen = item.status === "GREEN";
                const isYellow = item.status === "YELLOW";
                return (
                  <div key={item.id} className="p-3 bg-slate-950/70 border border-slate-850 rounded-xl hover:border-slate-800 transition text-[11px] space-y-2 relative overflow-hidden animate-fadeIn">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-slate-900/5 rotate-45 pointer-events-none" />
                    
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold text-slate-200 text-xs leading-normal">{item.claim}</p>
                      <div className="text-right flex-shrink-0">
                        <span className={`inline-block text-[9px] font-extrabold px-1.5 py-0.5 rounded font-mono ${
                          isGreen ? "bg-emerald-500/10 text-emerald-400" : isYellow ? "bg-yellow-500/10 text-yellow-400" : "bg-red-500/10 text-red-500"
                        }`}>
                          EDI: {item.index.toFixed(2)}
                        </span>
                        <span className="block text-[7px] text-slate-500 mt-0.5 uppercase tracking-tight">{item.id}</span>
                      </div>
                    </div>

                    <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                      <span>VERIFIED: {item.verAge}</span>
                      <span>CONTRADICT VELOCITY: <span className={item.contradictionVelocity === "Low" ? "text-slate-400" : "text-orange-400"}>{item.contradictionVelocity}</span></span>
                    </div>

                    {/* Progress tracking bar */}
                    <div className="h-1 bg-slate-850 rounded-full overflow-hidden flex">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${isGreen ? "bg-emerald-500" : isYellow ? "bg-yellow-500" : "bg-red-550"}`}
                        style={{ width: `${item.confidence * 100}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <span className="text-[8px] text-slate-500 font-bold uppercase font-mono">Confidence Level: {Math.round(item.confidence * 100)}%</span>
                      <button 
                        type="button"
                        onClick={() => triggerFactRecheck(item.id)}
                        className="h-6 px-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded text-[9px] font-bold text-slate-400 hover:text-purple-300 hover:border-purple-500/25 transition flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-2.5 h-2.5" />
                        RE-ESTABLISH VERIFICATION
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
