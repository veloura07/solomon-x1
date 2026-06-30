import React from "react";
import { TrendingUp } from "lucide-react";

interface MarketOverviewProps {
  totalStakedTokens: number;
}

export function MarketOverview({ totalStakedTokens }: MarketOverviewProps) {
  return (
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
  );
}
