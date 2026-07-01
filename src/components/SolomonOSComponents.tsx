import React, { useState, useEffect } from "react";
import gsap from "gsap";
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
  Award,
  ShieldAlert,
  Plus,
  Trash,
  Scale
} from "lucide-react";
import { CognitiveRingNetworkMap } from "./CognitiveRingNetworkMap";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
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

  // Real-time Token Consumption Rates for Senate Performance Heatmap
  const [consumptionRates, setConsumptionRates] = useState<number[]>([
    124, 452, 612, 98, 188, 275, 820, 145, 340, 510
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setConsumptionRates(prev => prev.map(rate => {
        const change = Math.round((Math.random() - 0.5) * 80);
        return Math.max(30, Math.min(950, rate + change));
      }));
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // States & helper data structures for Recharts Visual Telemetry Dashboard
  const [selectedAgentChartIndex, setSelectedAgentChartIndex] = useState<number>(0);
  const [dashboardTab, setDashboardTab] = useState<"compare" | "historical" | "diagnostics" | "network">("compare");

  // Real-time diagnostics state for the 10 cognitive rings
  const [diagnostics, setDiagnostics] = useState<Array<{
    index: number;
    latency: number;
    throughput: number;
    handshakeStatus: "SECURE_CONNECTED" | "SYNCHRONIZED" | "IDLE_STANDBY" | "FAULT_ISOLATED";
    errors: number;
    lastChecked: string;
    diagnosticLog: string;
  }>>(() => agents.map(ag => ({
    index: ag.index,
    latency: Math.round(45 + Math.random() * 80),
    throughput: Math.round(15 + Math.random() * 40),
    handshakeStatus: ag.index === 9 ? "SYNCHRONIZED" : "SECURE_CONNECTED",
    errors: Math.floor(Math.random() * 2),
    lastChecked: "JUST NOW",
    diagnosticLog: "All registers validated against hardware TPM seed-hash."
  })));

  useEffect(() => {
    const interval = setInterval(() => {
      setDiagnostics(prev => prev.map(d => {
        const ag = agents[d.index];
        const rep = ag ? ag.reputationScore : 100;
        
        let status = d.handshakeStatus;
        let errors = d.errors;
        let log = d.diagnosticLog;
        
        if (rep < 50.0) {
          status = "FAULT_ISOLATED";
          if (Math.random() < 0.25) {
            errors += 1;
            log = `Stagnation fault detected. Latency breached 500ms threshold.`;
          }
        } else {
          status = d.index === 9 ? "SYNCHRONIZED" : (Math.random() < 0.9 ? "SECURE_CONNECTED" : "IDLE_STANDBY");
          if (errors > 0 && Math.random() < 0.1) {
            errors = Math.max(0, errors - 1);
            log = `Self-healing protocol resolved previous stagnation index fault.`;
          }
        }

        return {
          ...d,
          latency: rep < 50.0 ? Math.round(450 + Math.random() * 120) : Math.round(45 + Math.random() * 50),
          throughput: rep < 50.0 ? Math.round(2 + Math.random() * 8) : Math.round(20 + Math.random() * 30),
          handshakeStatus: status,
          errors,
          lastChecked: new Date().toLocaleTimeString(),
          diagnosticLog: log
        };
      }));
    }, 3500);
    return () => clearInterval(interval);
  }, [agents]);

  const handleTriggerDiagnosticPing = (idx: number) => {
    const agent = agents[idx];
    if (!agent) return;
    
    // Trigger GSAP pulse animation on the specific diagnostic row/card
    const rowEl = document.getElementById(`diag-row-${idx}`);
    if (rowEl) {
      gsap.timeline()
        .to(rowEl, { scale: 1.015, backgroundColor: "rgba(168, 85, 247, 0.12)", borderColor: "#a855f7", duration: 0.15, ease: "power1.out" })
        .to(rowEl, { scale: 1, backgroundColor: "rgba(15, 23, 42, 0.2)", borderColor: "rgba(30, 41, 59, 0.4)", duration: 0.3, ease: "power1.inOut" });
    }

    setDiagnostics(prev => prev.map(d => {
      if (d.index === idx) {
        return {
          ...d,
          latency: Math.round(15 + Math.random() * 15),
          throughput: Math.round(55 + Math.random() * 15),
          handshakeStatus: "SYNCHRONIZED",
          errors: 0,
          lastChecked: "FORCE_VERIFIED",
          diagnosticLog: "Sovereign master bypass triggered. Cryptographic checksums fully unsealed and validated."
        };
      }
      return d;
    }));

    onAddAuditLog({
      actor: "Sovereign Human",
      action: "MANUAL_RING_DIAGNOSTIC",
      status: "AUTHORIZED",
      details: `Manual diagnostic ping routed to ${agent.name} (Ring #${idx}). Communicational baseline restored and error count reset.`
    });
  };
  
  const currentAgent = agents[selectedAgentChartIndex] || agents[0];
  const reputation = currentAgent?.reputationScore || 90;
  const tokens = currentAgent?.tokenPool || 1000;
  
  const agentHistory = [
    { time: "30m ago", tokens: Math.round(tokens * 0.92), rep: Math.max(70, reputation - 1.8) },
    { time: "25m ago", tokens: Math.round(tokens * 0.97), rep: Math.max(70, reputation - 1.4) },
    { time: "20m ago", tokens: Math.round(tokens * 1.04), rep: Math.max(70, reputation - 1.0) },
    { time: "15m ago", tokens: Math.round(tokens * 0.98), rep: Math.max(70, reputation - 0.5) },
    { time: "10m ago", tokens: Math.round(tokens * 1.02), rep: Math.max(70, reputation - 0.2) },
    { time: "05m ago", tokens: Math.round(tokens * 0.95), rep: reputation - 0.1 },
    { time: "Active", tokens: tokens, rep: reputation }
  ];

  const aggregateData = [
    { name: "Almadel", tokens: agents[0]?.tokenPool || 1200, rep: agents[0]?.reputationScore || 98 },
    { name: "Notoria", tokens: agents[1]?.tokenPool || 900, rep: agents[1]?.reputationScore || 92 },
    { name: "Paulina", tokens: agents[2]?.tokenPool || 800, rep: agents[2]?.reputationScore || 89 },
    { name: "Goetia", tokens: agents[3]?.tokenPool || 1100, rep: agents[3]?.reputationScore || 95 },
    { name: "Theurgia", tokens: agents[4]?.tokenPool || 750, rep: agents[4]?.reputationScore || 87 },
    { name: "Almiras", tokens: agents[5]?.tokenPool || 950, rep: agents[5]?.reputationScore || 94 },
    { name: "Verum", tokens: agents[6]?.tokenPool || 1300, rep: agents[6]?.reputationScore || 99 },
    { name: "Ephesia", tokens: agents[7]?.tokenPool || 850, rep: agents[7]?.reputationScore || 90 },
    { name: "Fulcanelli", tokens: agents[8]?.tokenPool || 1050, rep: agents[8]?.reputationScore || 96 },
    { name: "Regalis", tokens: agents[9]?.tokenPool || 1260, rep: agents[9]?.reputationScore || 98 }
  ];

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

  // Algorithmic redistribution of token pools from high-reputation rings to lower-reputation rings
  const triggerEconomyBalancing = () => {
    setIsTransferring(true);
    setTransferMessage("CALCULATING COGNITIVE REPUTATION-FLOW RATES & REDISTRIBUTING TOKENS...");
    
    setTimeout(() => {
      // Sort agents by reputation score to identify donors and recipients
      const sortedByRep = [...agents].sort((a, b) => b.reputationScore - a.reputationScore);
      
      // Donors: Top 4 high reputation agents
      const donors = sortedByRep.slice(0, 4);
      // Recipients: Bottom 4 lower reputation agents
      const recipients = sortedByRep.slice(6);

      // We will shift 150 tokens from each of the high-reputation donor pools,
      // and add 150 tokens to each of the underfunded lower-reputation recipient pools.
      let redistributedCount = 0;
      donors.forEach(donor => {
        if (donor.tokenPool > 400) {
          onUpdateAgentPool(donor.index, -150);
          redistributedCount += 150;
        }
      });

      // Distribute the total collected pool evenly among recipients
      if (recipients.length > 0) {
        const share = Math.floor(redistributedCount / recipients.length);
        recipients.forEach(recipient => {
          onUpdateAgentPool(recipient.index, share);
        });
      }

      onAddAuditLog({
        actor: "CRE Governor",
        action: "REBALANCE_COGNITIVE_ECONOMY",
        status: "AUTHORIZED",
        details: `Cognitive resource pools balanced dynamically. Shifted total of ${redistributedCount} tokens from high-reputation donors (${donors.map(d => d.name.replace("Ars ", "")).join(", ")}) to lower-reputation anchors (${recipients.map(r => r.name.replace("Ars ", "")).join(", ")}).`
      });
      
      setTransferMessage(`COGNITIVE EQUILIBRIUM COMPLETED: ${redistributedCount} TOKENS NORMALIZED ACROSS SENATE.`);
      setTimeout(() => setIsTransferring(false), 2200);
    }, 1800);
  };

  const handleDownloadReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      system_status: diagnostics.filter(d => d.handshakeStatus === "FAULT_ISOLATED").length > 0 ? "WARNING" : "STABLE_SECURE",
      average_latency: parseFloat((diagnostics.reduce((sum, d) => sum + d.latency, 0) / diagnostics.length).toFixed(2)),
      average_throughput: parseFloat((diagnostics.reduce((sum, d) => sum + d.throughput, 0) / diagnostics.length).toFixed(2)),
      total_errors: diagnostics.reduce((sum, d) => sum + d.errors, 0),
      cognitive_rings: diagnostics.map(d => {
        const ag = agents[d.index];
        return {
          ring_index: d.index,
          name: ag ? ag.name : `Ring #${d.index}`,
          reputation: ag ? ag.reputationScore : null,
          token_pool: ag ? ag.tokenPool : null,
          latency_rtt_ms: d.latency,
          throughput_tps: d.throughput,
          handshake_status: d.handshakeStatus,
          errors: d.errors,
          proof_hash: `sha_0x${((ag ? ag.bandColor : 0x0) ^ 0xabcdef).toString(16).slice(0, 8)}`,
          diagnostic_log: d.diagnosticLog,
          last_checked: d.lastChecked
        };
      })
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `solomon_cognitive_ring_report_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    onAddAuditLog({
      actor: "Sovereign Human",
      action: "DOWNLOAD_RING_REPORT",
      status: "AUTHORIZED",
      details: "Compiled and downloaded active cognitive audit diagnostics log to local environment disk."
    });
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

      {/* COGNITIVE DECAY ACTIVE STATUS BANNER */}
      <div className="bg-slate-900/60 border border-purple-500/20 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex gap-3 items-center">
          <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-lg">
            <Coins className="w-5 h-5 animate-spin" style={{ animationDuration: "12s" }} />
          </div>
          <div className="text-left">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">IDLE REPUTATION DECAY CALIBRATOR ACTIVE</h4>
            <p className="text-[10px] text-slate-500 mt-1 leading-normal uppercase font-sans">
              Specialized ring agents unselected lose <span className="text-purple-300 font-bold">-0.08 fractional points</span> every 4.5s. Rotate focus to restore alignment stability.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[8px] px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-extrabold uppercase animate-pulse">
            ROTATORY LOAD PRESSURE: BALANCED
          </span>
        </div>
      </div>

      {/* HISTORICAL RECHARTS TELEMETRY DASHBOARD */}
      <div id="economy-historical-charts" className="bg-slate-950/80 border border-slate-800/80 p-5 rounded-2xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-900 pb-4">
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
              <Award className="w-4 h-4 text-purple-400" />
              Senate & Resource Telemetry Dashboard
            </h3>
            <p className="text-[10px] text-slate-500 mt-1 leading-normal uppercase">
              Dynamic historical token drift and system-wide reputation audits
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDashboardTab("compare")}
              className={`h-7 px-3 rounded-lg text-[9px] font-bold font-mono transition-all ${
                dashboardTab === "compare" 
                  ? "bg-purple-600/20 border border-purple-500/40 text-purple-300"
                  : "bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-400"
              }`}
            >
              System Comparison
            </button>
            <button
              onClick={() => setDashboardTab("historical")}
              className={`h-7 px-3 rounded-lg text-[9px] font-bold font-mono transition-all ${
                dashboardTab === "historical" 
                  ? "bg-purple-600/20 border border-purple-500/40 text-purple-300"
                  : "bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-400"
              }`}
            >
              Agent Micro-Audit
            </button>
            <button
              onClick={() => setDashboardTab("diagnostics")}
              className={`h-7 px-3 rounded-lg text-[9px] font-bold font-mono transition-all ${
                dashboardTab === "diagnostics" 
                  ? "bg-purple-600/20 border border-purple-500/40 text-purple-300"
                  : "bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-400"
              }`}
            >
              Ring Diagnostics
            </button>
            <button
              onClick={() => setDashboardTab("network")}
              className={`h-7 px-3 rounded-lg text-[9px] font-bold font-mono transition-all ${
                dashboardTab === "network" 
                  ? "bg-purple-600/20 border border-purple-500/40 text-purple-300"
                  : "bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-400"
              }`}
            >
              Cognitive Network Map
            </button>
          </div>
        </div>

        {dashboardTab === "compare" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="h-64 sm:h-72 w-full text-[10px] font-sans">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aggregateData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#101827" />
                  <XAxis dataKey="name" stroke="#64748b" tickLine={false} />
                  <YAxis yAxisId="left" stroke="#eab308" tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#c084fc" tickLine={false} domain={[60, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", borderRadius: "12px", color: "#f1f5f9" }}
                    itemStyle={{ fontSize: "11px", fontFamily: "monospace" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "10px", paddingBottom: "5px" }} />
                  <Bar yAxisId="left" dataKey="tokens" name="Allocated Tokens" fill="#eab308" radius={[4, 4, 0, 0]} opacity={0.8} />
                  <Bar yAxisId="right" dataKey="rep" name="Reputation Score %" fill="#c084fc" radius={[4, 4, 0, 0]} opacity={0.65} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[9px] text-slate-500 font-mono text-center uppercase tracking-wide">
              * Real-time comparison showing token allocation (left scale, gold) against current reputation parameters (right scale, purple)
            </p>
          </div>
        )}

        {dashboardTab === "historical" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center animate-fadeIn">
            {/* Left controller: list of ring agents */}
            <div className="lg:col-span-4 space-y-2 max-h-[220px] overflow-y-auto pr-1">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wide block mb-1">Select Ring Agent to Audit</span>
              {agents.map((ag) => (
                <button
                  key={ag.index}
                  onClick={() => setSelectedAgentChartIndex(ag.index)}
                  className={`w-full p-2.5 text-left border rounded-xl transition-all flex items-center justify-between text-[10px] ${
                    selectedAgentChartIndex === ag.index
                      ? "bg-purple-950/25 border-purple-500/40 text-purple-200"
                      : "bg-slate-900/40 border-slate-900 hover:border-slate-800 text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#" + ag.bandColor.toString(16) }} />
                    <span className="font-semibold">{ag.name}</span>
                  </div>
                  <span className="font-mono">{ag.tokenPool} T</span>
                </button>
              ))}
            </div>

            {/* Right detailed plots */}
            <div className="lg:col-span-8 space-y-3">
              <div className="flex justify-between items-center bg-slate-950/60 p-2.5 px-3.5 border border-slate-850 rounded-xl">
                <span className="text-[10px] font-bold text-slate-200 uppercase">{currentAgent?.name} - {currentAgent?.roleDescription}</span>
                <span className="text-[9px] text-[#eab308] font-mono">Current Pool: {currentAgent?.tokenPool} Tokens</span>
              </div>

              <div className="h-44 sm:h-48 w-full text-[10px] font-sans">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={agentHistory} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#eab308" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRep" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#101827" />
                    <XAxis dataKey="time" stroke="#64748b" tickLine={false} />
                    <YAxis yAxisId="t" stroke="#eab308" tickLine={false} />
                    <YAxis yAxisId="r" orientation="right" stroke="#22c55e" tickLine={false} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", borderRadius: "12px", color: "#f1f5f9" }} />
                    <Area yAxisId="t" type="monotone" dataKey="tokens" name="Allocated tokens" stroke="#eab308" fillOpacity={1} fill="url(#colorTokens)" />
                    <Area yAxisId="r" type="monotone" dataKey="rep" name="Reputation Drift" stroke="#22c55e" fillOpacity={1} fill="url(#colorRep)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {dashboardTab === "diagnostics" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950/40 p-4 border border-slate-900 rounded-xl">
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest">Active Enclave Diagnostics & Auditing</h4>
                <p className="text-[10px] text-slate-500 mt-1 uppercase">Download secure JSON audits representing network telemetry, latency indices, and consensus status logs.</p>
              </div>
              <button
                onClick={handleDownloadReport}
                className="h-8 px-3 rounded-lg bg-cyan-600/10 border border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-400/40 text-cyan-300 text-[10px] font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0"
              >
                <FileText className="w-3.5 h-3.5" />
                DOWNLOAD COGNITIVE AUDIT REPORT (JSON)
              </button>
            </div>

            <div className="bg-slate-900/10 border border-slate-900/65 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-900 bg-slate-950/40 text-slate-500 text-[9px] uppercase tracking-wider">
                      <th className="py-2.5 px-4 font-bold">Ring</th>
                      <th className="py-2.5 px-4 font-bold">Status</th>
                      <th className="py-2.5 px-4 font-bold">Latency (RTT)</th>
                      <th className="py-2.5 px-4 font-bold">Throughput</th>
                      <th className="py-2.5 px-4 font-bold">Errors</th>
                      <th className="py-2.5 px-4 font-bold hidden md:table-cell">Enclave Proof</th>
                      <th className="py-2.5 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diagnostics.map((diag) => {
                      const agent = agents[diag.index];
                      if (!agent) return null;

                      // Status Badge classes
                      let statusBadge = "";
                      let statusText = diag.handshakeStatus;
                      if (diag.handshakeStatus === "SYNCHRONIZED") {
                        statusBadge = "bg-cyan-500/10 border-cyan-500/20 text-cyan-400";
                      } else if (diag.handshakeStatus === "SECURE_CONNECTED") {
                        statusBadge = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
                      } else if (diag.handshakeStatus === "IDLE_STANDBY") {
                        statusBadge = "bg-amber-500/10 border-amber-500/20 text-amber-400";
                      } else if (diag.handshakeStatus === "FAULT_ISOLATED") {
                        statusBadge = "bg-red-500/10 border border-red-500/30 text-red-400 animate-pulse";
                      }

                      // Latency Color
                      let latencyColor = "text-slate-300";
                      if (diag.latency > 300) latencyColor = "text-red-400 font-bold";
                      else if (diag.latency > 100) latencyColor = "text-amber-400";
                      else latencyColor = "text-emerald-400";

                      // Error badge color
                      const hasErrors = diag.errors > 0;

                      // Create a synthetic sha code for mock-integrity verification
                      const shaCode = `sha_0x${(agent.bandColor ^ 0xabcdef).toString(16).slice(0, 8)}`;

                      return (
                        <tr 
                          key={diag.index}
                          id={`diag-row-${diag.index}`}
                          className="border-b border-slate-900/60 hover:bg-slate-900/20 transition-all"
                        >
                          {/* Ring Index & Name */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <span 
                                className="w-2.5 h-2.5 rounded-full ring-2 ring-slate-950 flex-shrink-0" 
                                style={{ backgroundColor: `#${agent.bandColor.toString(16).padStart(6, "0")}` }} 
                              />
                              <div>
                                <span className="font-bold text-slate-200 block">{agent.name}</span>
                                <span className="text-[9px] text-slate-500 uppercase">{agent.domainName}</span>
                              </div>
                            </div>
                          </td>

                          {/* Handshake Status */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {diag.handshakeStatus === "SYNCHRONIZED" && (
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                              )}
                              {diag.handshakeStatus === "FAULT_ISOLATED" && (
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                              )}
                              <span className={`px-2 py-0.5 rounded-full border text-[9px] font-semibold tracking-wider ${statusBadge}`}>
                                {statusText}
                              </span>
                            </div>
                          </td>

                          {/* Latency (RTT) */}
                          <td className="py-3 px-4 font-mono">
                            <div className="space-y-1">
                              <span className={`${latencyColor}`}>{diag.latency} ms</span>
                              <div className="w-16 h-1 bg-slate-900 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${diag.latency > 300 ? 'bg-red-500' : diag.latency > 100 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                  style={{ width: `${Math.min(100, (diag.latency / 500) * 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Throughput */}
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <span className="text-slate-200">{diag.throughput} T/s</span>
                              <div className="w-16 h-1 bg-slate-900 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-cyan-400"
                                  style={{ width: `${Math.min(100, (diag.throughput / 60) * 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Error Counts */}
                          <td className="py-3 px-4">
                            <span className={`px-1.5 py-0.5 rounded font-bold ${
                              hasErrors 
                                ? "bg-red-500/10 border border-red-500/25 text-red-400 font-extrabold animate-pulse" 
                                : "text-slate-500"
                            }`}>
                              {diag.errors}
                            </span>
                          </td>

                          {/* Cryptographic Enclave Proof */}
                          <td className="py-3 px-4 hidden md:table-cell text-slate-600">
                            <span className="font-mono text-[9px] bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-900/65">
                              {shaCode}
                            </span>
                          </td>

                          {/* Manual actions */}
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleTriggerDiagnosticPing(diag.index)}
                              className="h-6 px-2.5 rounded bg-purple-600/15 border border-purple-500/20 hover:bg-purple-500/25 hover:border-purple-400/30 text-purple-300 hover:text-purple-100 text-[9px] font-bold tracking-wider transition-all uppercase cursor-pointer"
                              title="Force full diagnostic unseal"
                            >
                              Ping Handshake
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Real-time Logger stream overlaying diagnostic operations */}
            <div className="p-4 bg-slate-950/90 border border-slate-900/85 rounded-xl space-y-2">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  Live Cognitive Link Diagnostic Logger
                </span>
                <span className="text-[8px] text-slate-600 uppercase">SYS_LOG_DAEMON_ACTIVE</span>
              </div>
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto font-mono text-[9px] leading-relaxed">
                {diagnostics.map((diag, idx) => {
                  const agent = agents[diag.index];
                  if (!agent) return null;
                  const isFault = diag.handshakeStatus === "FAULT_ISOLATED";
                  return (
                    <div key={idx} className="flex items-start gap-2 bg-slate-900/20 p-1.5 rounded border border-slate-950">
                      <span className="text-slate-600">[{diag.lastChecked}]</span>
                      <span className="text-slate-400">({agent.name}):</span>
                      <span className={`flex-1 ${isFault ? 'text-red-400 font-bold' : 'text-slate-350'}`}>
                        {diag.diagnosticLog}
                      </span>
                      <span className={`text-[8px] px-1 py-0.2 rounded font-extrabold ${isFault ? 'bg-red-500/10 text-red-400' : 'bg-slate-950 text-slate-500'}`}>
                        {diag.handshakeStatus}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {dashboardTab === "network" && (
          <CognitiveRingNetworkMap 
            agents={agents}
            selectedAgentIndex={selectedAgentChartIndex}
            onSelectAgent={(index) => setSelectedAgentChartIndex(index)}
          />
        )}
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

          <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-slate-800">
            <button 
              onClick={castSenateYay}
              className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-500 text-[10px] font-bold text-slate-100 rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              CONFIRM MASTER APPROVAL (YAY)
            </button>
            <button 
              onClick={triggerEconomyBalancing}
              disabled={isTransferring}
              className="flex-1 h-9 bg-purple-600 hover:bg-purple-500 text-[10px] font-bold text-slate-100 rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Scale className={`w-3.5 h-3.5 ${isTransferring ? 'animate-spin' : ''}`} />
              BALANCE COGNITIVE ECONOMY
            </button>
          </div>
        </div>

      </div>

      {/* SENATE PERFORMANCE TOKENS HEATMAP */}
      <div id="senate-performance-heatmap" className="bg-slate-950/80 border border-slate-800/80 p-5 rounded-2xl space-y-4 shadow-xl mt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-900 pb-4">
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              Senate Performance Heatmap (Real-time Token Load)
            </h3>
            <p className="text-[10px] text-slate-500 mt-1 uppercase">
              Grid-intensity tracking showing real-time token ingestion rates per specialized agent
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-slate-500 text-[9px]">LEGEND:</span>
            <div className="flex items-center gap-1.5 font-bold">
              <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 text-[8px]">CRITICAL (&gt;600 T/s)</span>
              <span className="px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[8px]">HIGH (&gt;400 T/s)</span>
              <span className="px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-[8px]">MODERATE (&gt;200 T/s)</span>
              <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[8px]">LOW (IDLE)</span>
            </div>
          </div>
        </div>

        {/* Intensity grid representing the 10 senate agents */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3">
          {agents.map((ag) => {
            const rate = consumptionRates[ag.index] || 150;
            
            // Determine heat styling
            let intensityBg = "bg-cyan-950/20 border-cyan-500/20 text-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.03)]";
            let statusLabel = "LOW LOAD";
            if (rate > 600) {
              intensityBg = "bg-red-950/45 border-red-500/40 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.12)] animate-pulse";
              statusLabel = "CRITICAL SPURT";
            } else if (rate > 400) {
              intensityBg = "bg-orange-950/30 border-orange-500/35 text-orange-300 shadow-[0_0_12px_rgba(249,115,22,0.08)]";
              statusLabel = "HEAVY RUN";
            } else if (rate > 200) {
              intensityBg = "bg-yellow-950/25 border-yellow-500/30 text-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.06)]";
              statusLabel = "STABLE COMPUTE";
            }

            return (
              <div 
                key={ag.index}
                className={`p-3 border rounded-xl flex flex-col justify-between h-28 transition-all duration-300 hover:scale-[1.02] cursor-pointer group ${intensityBg}`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider truncate uppercase">{ag.name.replace("Ars ", "")}</span>
                    <span className="text-[7px] px-1 py-0.2 rounded bg-black/40 border border-slate-900 group-hover:border-slate-800 transition">
                      #{ag.index}
                    </span>
                  </div>
                  <span className="text-[8px] text-slate-400/85 block truncate leading-tight font-sans">
                    {ag.roleDescription}
                  </span>
                </div>

                <div className="space-y-1 pt-1.5 border-t border-slate-900/40">
                  <div className="flex items-baseline justify-between select-none">
                    <span className="text-xs font-black tracking-tight">{rate}</span>
                    <span className="text-[7px] text-slate-500">T/s</span>
                  </div>
                  <div className="flex items-center justify-between text-[6px] font-bold">
                    <span className="text-slate-500">STATUS:</span>
                    <span className="font-mono tracking-wider">{statusLabel}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Aggregated load stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-[10px] items-center text-slate-400 font-mono">
          <div className="flex items-center gap-2 bg-slate-950/30 border border-slate-900 px-3.5 py-2 rounded-xl">
            <span className="text-slate-500">SENATE INGESTION RATE:</span>
            <span className="text-yellow-400 font-bold">{consumptionRates.reduce((a, b) => a + b, 0)} Tokens / sec</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-950/30 border border-slate-900 px-3.5 py-2 rounded-xl">
            <span className="text-slate-500">MOST ACTIVE ENCLAVE:</span>
            <span className="text-red-400 font-bold">
              {agents[consumptionRates.indexOf(Math.max(...consumptionRates))]?.name || "Verum"}
            </span>
          </div>
          <p className="text-[9px] text-slate-500 text-right uppercase font-sans font-medium">
            Tiles adjust dynamically based on active telemetry clock and current models workload.
          </p>
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
