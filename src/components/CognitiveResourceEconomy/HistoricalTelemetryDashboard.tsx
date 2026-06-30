import React from "react";
import { Award } from "lucide-react";
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
import { AgentSpec } from "../../types";

interface HistoricalTelemetryDashboardProps {
  dashboardTab: "compare" | "historical";
  setDashboardTab: (tab: "compare" | "historical") => void;
  aggregateData: any[];
  agents: AgentSpec[];
  selectedAgentChartIndex: number;
  setSelectedAgentChartIndex: (index: number) => void;
  agentHistory: any[];
}

export function HistoricalTelemetryDashboard({
  dashboardTab,
  setDashboardTab,
  aggregateData,
  agents,
  selectedAgentChartIndex,
  setSelectedAgentChartIndex,
  agentHistory
}: HistoricalTelemetryDashboardProps) {
  const currentAgent = agents[selectedAgentChartIndex] || agents[0];
  const reputation = currentAgent?.reputationScore || 90;
  const tokens = currentAgent?.tokenPool || 1000;
  const uScore = ((reputation / 10) * 1.15).toFixed(2);

  return (
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
        </div>
      </div>

      {dashboardTab === "compare" ? (
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
      ) : (
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
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#" + ag.bandColor.toString(16) }} />
                  <span className="font-bold">{ag.name}</span>
                </div>
                <span className="font-mono text-slate-500">#{ag.index}</span>
              </button>
            ))}
          </div>

          {/* Right detailed plots */}
          <div className="lg:col-span-8 bg-slate-950/40 border border-slate-900 p-4 rounded-xl space-y-4">
            <div className="flex justify-between items-end border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#" + currentAgent?.bandColor.toString(16) }} />
                  {currentAgent?.name}
                  <span className="text-[10px] text-slate-500 font-mono tracking-wider ml-1">PROFILE</span>
                </h4>
                <p className="text-[9px] text-slate-400 mt-1 max-w-sm truncate">{currentAgent?.roleDescription}</p>
              </div>
              <div className="text-right">
                <span className="block text-xl font-bold text-emerald-400 font-sans">U={uScore}</span>
                <span className="text-[8px] text-slate-500 font-mono">UTILITY FACTOR</span>
              </div>
            </div>

            <div className="h-48 w-full text-[10px] font-sans">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={agentHistory} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRep" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c084fc" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#c084fc" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#101827" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" tickLine={false} />
                  <YAxis yAxisId="left" stroke="#eab308" tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#c084fc" tickLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", borderRadius: "12px", color: "#f1f5f9" }}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="tokens" stroke="#eab308" fillOpacity={1} fill="url(#colorTokens)" name="Token Balance" />
                  <Area yAxisId="right" type="monotone" dataKey="rep" stroke="#c084fc" fillOpacity={1} fill="url(#colorRep)" name="Reputation" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
