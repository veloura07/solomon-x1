import React, { useState, useEffect } from "react";
import { Coins } from "lucide-react";


import { AgentSpec } from "../../types";
import { MarketOverview } from "./MarketOverview";
import { SenateActiveDebate } from "./SenateActiveDebate";
import { SenatePerformanceHeatmap } from "./SenatePerformanceHeatmap";
import { HistoricalTelemetryDashboard } from "./HistoricalTelemetryDashboard";
import { ResourceEconomyMarketChamber } from "./ResourceEconomyMarketChamber";

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
  const [dashboardTab, setDashboardTab] = useState<"compare" | "historical">("compare");

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
      <MarketOverview totalStakedTokens={totalStakedTokens} />

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
      <HistoricalTelemetryDashboard dashboardTab={dashboardTab} setDashboardTab={setDashboardTab} aggregateData={aggregateData} agents={agents} selectedAgentChartIndex={selectedAgentChartIndex} setSelectedAgentChartIndex={setSelectedAgentChartIndex} agentHistory={agentHistory} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

        <ResourceEconomyMarketChamber agents={agents} allocationMode={allocationMode} setAllocationMode={setAllocationMode} triggerEconomyBalancing={triggerEconomyBalancing} isTransferring={isTransferring} globalRingSync={globalRingSync} toggleRingSync={toggleRingSync} transferMessage={transferMessage} />

        {/* AGENT SENATE VIEW */}
        <SenateActiveDebate activeProposal={activeProposal} castSenateYay={castSenateYay} />

      </div>

      {/* SENATE PERFORMANCE TOKENS HEATMAP */}
      <SenatePerformanceHeatmap agents={agents} consumptionRates={consumptionRates} />

    </div>
  );
}
