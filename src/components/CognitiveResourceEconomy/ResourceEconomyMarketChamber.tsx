import React from "react";
import { Coins, RefreshCw } from "lucide-react";
import { AgentSpec } from "../../types";

interface ResourceEconomyMarketChamberProps {
  agents: AgentSpec[];
  allocationMode: "equilibrium" | "hyperfocus" | "idle";
  setAllocationMode: (mode: "equilibrium" | "hyperfocus" | "idle") => void;
  triggerEconomyBalancing: () => void;
  isTransferring: boolean;
  globalRingSync: boolean;
  toggleRingSync: () => void;
  transferMessage: string;
}

export function ResourceEconomyMarketChamber({
  agents,
  allocationMode,
  setAllocationMode,
  triggerEconomyBalancing,
  isTransferring,
  globalRingSync,
  toggleRingSync,
  transferMessage
}: ResourceEconomyMarketChamberProps) {
  return (
    <div className="lg:col-span-7 bg-slate-900/30 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
            <Coins className="w-4 h-4 text-yellow-500" />
            RESOURCE ECONOMY MARKET CHAMBER
          </span>
          <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-850">
            {["equilibrium", "hyperfocus", "idle"].map((mode) => (
              <button
                key={mode}
                onClick={() => setAllocationMode(mode as any)}
                className={`px-3 py-1 text-[9px] font-bold uppercase rounded-md transition ${
                  allocationMode === mode
                    ? "bg-purple-600/20 text-purple-300"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={triggerEconomyBalancing}
            disabled={isTransferring}
            className="flex-1 h-9 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
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
  );
}
