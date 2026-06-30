import React from "react";
import { AgentSpec } from "../../types";

interface SenatePerformanceHeatmapProps {
  agents: AgentSpec[];
  consumptionRates: number[];
}

export function SenatePerformanceHeatmap({ agents, consumptionRates }: SenatePerformanceHeatmapProps) {
  return (
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
  );
}
