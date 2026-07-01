import { useState } from "react";
import { TelemetryPoint } from "../types";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Activity, Zap, Play, Eye, Flame, ShieldAlert } from "lucide-react";

interface StateTrackerProps {
  telemetryData: TelemetryPoint[];
  onUpdateTelemetry: (newData: TelemetryPoint[]) => void;
  runtimeSnapshot?: {
    generatedAt: string;
    taskCounts: {
      total: number;
      pending: number;
      planning: number;
      running: number;
      completed: number;
      failed: number;
      cancelled: number;
    };
    learning: {
      totalTasks: number;
      successRate: number;
    };
  } | null;
  bloomThreshold: number;
  setBloomThreshold: (val: number) => void;
  bloomIntensity: number;
  setBloomIntensity: (val: number) => void;
  bloomEnabled: boolean;
  setBloomEnabled: (val: boolean) => void;
}

export default function StateTracker({ 
  telemetryData, 
  onUpdateTelemetry,
  runtimeSnapshot,
  bloomThreshold,
  setBloomThreshold,
  bloomIntensity,
  setBloomIntensity,
  bloomEnabled,
  setBloomEnabled
}: StateTrackerProps) {
  const [activeSimulationMode, setActiveSimulationMode] = useState<"Quiet" | "HeavyCode" | "Distracted">("Quiet");

  // Calculate current averages
  const latestPoint = telemetryData[telemetryData.length - 1] || { focusLevel: 80, cognitiveLoad: 40, momentum: 75 };
  
  const avgFocus = Math.round(
    telemetryData.reduce((acc, p) => acc + p.focusLevel, 0) / telemetryData.length
  );
  const avgLoad = Math.round(
    telemetryData.reduce((acc, p) => acc + p.cognitiveLoad, 0) / telemetryData.length
  );
  const avgMomentum = Math.round(
    telemetryData.reduce((acc, p) => acc + p.momentum, 0) / telemetryData.length
  );

  const triggerSimulation = (mode: "Quiet" | "HeavyCode" | "Distracted") => {
    setActiveSimulationMode(mode);

    const modeScale = mode === "Quiet" ? 0.92 : mode === "HeavyCode" ? 1.12 : 0.78;
    const loadScale = mode === "Quiet" ? 0.82 : mode === "HeavyCode" ? 1.18 : 0.68;
    const momentumScale = mode === "Quiet" ? 1.02 : mode === "HeavyCode" ? 1.08 : 0.74;

    const nextTelemetry = telemetryData.map((point, index) => ({
      ...point,
      timeIndex: index,
      focusLevel: Math.max(0, Math.min(100, Math.round(point.focusLevel * modeScale))),
      cognitiveLoad: Math.max(0, Math.min(100, Math.round(point.cognitiveLoad * loadScale))),
      momentum: Math.max(0, Math.min(100, Math.round(point.momentum * momentumScale))),
      geminiLatency: Math.max(100, Math.round((point.geminiLatency ?? 900) * (mode === "HeavyCode" ? 1.15 : mode === "Distracted" ? 0.92 : 0.98))),
    }));

    onUpdateTelemetry(nextTelemetry);
  };

  return (
    <div id="state-tracker-view" className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-slate-300 font-mono">
      
      {/* Simulation Selector and Live stats cards */}
      <div id="telemetry-sidebar" className="lg:col-span-4 space-y-4">
        {/* Simulation Selector */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-400" />
            <h3 className="text-sm font-bold text-slate-100 font-sans">Laptop I/O Feed</h3>
          </div>
          
          <p className="text-[11px] text-slate-400 leading-normal">
            Live runtime snapshot: {runtimeSnapshot ? `${runtimeSnapshot.taskCounts.total} tasks, ${runtimeSnapshot.taskCounts.running} running, ${Math.round(runtimeSnapshot.learning.successRate * 100)}% success.` : "waiting for backend snapshot"}
          </p>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => triggerSimulation("Quiet")}
              className={`w-full h-10 px-4 rounded-xl text-xs font-semibold flex items-center justify-between border transition ${
                activeSimulationMode === "Quiet"
                  ? "bg-purple-500/10 border-purple-500/40 text-purple-300"
                  : "bg-slate-950 border-slate-800/80 hover:border-slate-800 text-slate-400 hover:text-slate-300"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-purple-400" />
                Quiet Deep Flow
              </span>
              <Play className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onClick={() => triggerSimulation("HeavyCode")}
              className={`w-full h-10 px-4 rounded-xl text-xs font-semibold flex items-center justify-between border transition ${
                activeSimulationMode === "HeavyCode"
                  ? "bg-orange-500/10 border-orange-500/40 text-orange-300"
                  : "bg-slate-950 border-slate-800/80 hover:border-slate-800 text-slate-400 hover:text-slate-300"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
                Heavy Code Engineering
              </span>
              <Play className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onClick={() => triggerSimulation("Distracted")}
              className={`w-full h-10 px-4 rounded-xl text-xs font-semibold flex items-center justify-between border transition ${
                activeSimulationMode === "Distracted"
                  ? "bg-red-500/10 border-red-500/40 text-red-300"
                  : "bg-slate-950 border-slate-800/80 hover:border-slate-800 text-slate-400 hover:text-slate-300"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                Distracted Browsing
              </span>
              <Play className="w-3.5 h-3.5 opacity-60" />
            </button>
          </div>
        </div>

        {/* Solomon Ring Ethereal Glow Calibration Sliders */}
        <div id="glow-config-card" className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-purple-400 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-100 font-sans">Ethereal Glow Calibration</h3>
          </div>
          
          <p className="text-[11px] text-slate-400 leading-normal font-sans">
            Calibrate the real-time bloom processing filters of the Solomon rings to accommodate custom screen resolutions.
          </p>

          {/* Quick Toggle for Bloom Post-Processing */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5 text-left">
              <span className="text-slate-200 font-bold tracking-wide block font-sans">Unreal Bloom Filter</span>
              <span className="text-[9px] text-slate-500 block font-sans">Optimize FPS on lower-end devices</span>
            </div>
            <button
              onClick={() => setBloomEnabled(!bloomEnabled)}
              className={`px-3 py-1.5 rounded-lg font-bold uppercase transition-all tracking-wider text-[9px] border cursor-pointer ${
                bloomEnabled 
                  ? "bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30" 
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-300 hover:bg-slate-850"
              }`}
            >
              {bloomEnabled ? "ENABLED" : "DISABLED"}
            </button>
          </div>

          <div className={`space-y-4 pt-1 font-mono transition-opacity duration-300 ${bloomEnabled ? "" : "opacity-35 pointer-events-none"}`}>
            <div>
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1 font-mono">
                <span>Bloom Threshold</span>
                <span className="text-purple-400 font-mono">{(bloomThreshold).toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.01"
                value={bloomThreshold}
                onChange={(e) => setBloomThreshold(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-purple-500 border border-slate-800 focus:outline-none"
              />
              <div className="flex justify-between text-[8px] text-slate-500 mt-0.5 font-mono">
                <span>0.0 (Max glow)</span>
                <span>1.0 (Narrow keys)</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1 font-mono">
                <span>Bloom Intensity</span>
                <span className="text-purple-400 font-mono">{(bloomIntensity).toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="5.0"
                step="0.05"
                value={bloomIntensity}
                onChange={(e) => setBloomIntensity(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-purple-500 border border-slate-800 focus:outline-none"
              />
              <div className="flex justify-between text-[8px] text-slate-500 mt-0.5 font-mono">
                <span>0.0 (Off)</span>
                <span>5.0 (Extreme)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cognitive Twin Metrics Details */}
        <div className="grid grid-cols-3 lg:grid-cols-1 gap-3.5">
          <div className="bg-slate-900/20 border border-slate-800/60 rounded-xl p-4 flex flex-col justify-between h-[100px]">
            <span className="text-[10px] text-slate-500 font-bold uppercase">FOCUS ENTRAIN</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold text-slate-100">{latestPoint.focusLevel}%</span>
              <span className="text-[9px] text-purple-400">AVG: {avgFocus}%</span>
            </div>
          </div>

          <div className="bg-slate-900/20 border border-slate-800/60 rounded-xl p-4 flex flex-col justify-between h-[100px]">
            <span className="text-[10px] text-slate-500 font-bold uppercase">METRIC LOAD</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold text-slate-100">{latestPoint.cognitiveLoad}%</span>
              <span className="text-[9px] text-orange-400">AVG: {avgLoad}%</span>
            </div>
          </div>

          <div className="bg-slate-900/20 border border-slate-800/60 rounded-xl p-4 flex flex-col justify-between h-[100px]">
            <span className="text-[10px] text-slate-500 font-bold uppercase">WORK MASS</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold text-slate-100">{latestPoint.momentum}%</span>
              <span className="text-[9px] text-yellow-400">AVG: {avgMomentum}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recharts Graphical Pane Column */}
      <div className="lg:col-span-8 space-y-6 flex flex-col">
        {/* Main Telemetry Chart */}
        <div id="chart-panel" className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-6 border-b border-slate-900 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-[11px] font-bold text-slate-300">COGNITIVE MANIFOLD SEQUENCES (30m SLIDING)</span>
            </div>
            <span className="text-[9px] text-slate-500 font-mono">NODE ACTIVE STATUS: FEED VALIDATED</span>
          </div>

          {/* Telemetry charts */}
          <div className="flex-1 min-h-[260px] w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={telemetryData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c084fc" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#c084fc" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="loadGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="momentumGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                <XAxis 
                  dataKey="timeString" 
                  stroke="#64748b" 
                  tick={{ fontSize: 9 }}
                />
                <YAxis 
                  stroke="#64748b" 
                  tick={{ fontSize: 9 }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#02010c", 
                    borderColor: "#1e293b",
                    borderRadius: "12px",
                    fontSize: "10px",
                    color: "#f1f5f9"
                  }} 
                />
                <Legend verticalAlign="top" height={36} iconSize={8} iconType="circle" />
                <Area
                  name="Focus Depth"
                  type="monotone"
                  dataKey="focusLevel"
                  stroke="#c084fc"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#focusGrad)"
                />
                <Area
                  name="Cognitive Load"
                  type="monotone"
                  dataKey="cognitiveLoad"
                  stroke="#f97316"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#loadGrad)"
                />
                <Area
                  name="Work Momentum"
                  type="monotone"
                  dataKey="momentum"
                  stroke="#eab308"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#momentumGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Bottleneck diagnostics overlay chart */}
        <div id="bottleneck-overlay-panel" className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-slate-900 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-400" />
              <span className="text-[11px] font-bold text-slate-300 uppercase">System Latency Correlation & Cognitive Bottlenecks</span>
            </div>
            <span className="text-[8px] bg-orange-950/40 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full font-mono tracking-wider">
              LAST 60 MIN ANALYSIS
            </span>
          </div>

          <p className="text-[11px] text-slate-400 font-sans leading-normal mb-4">
            This live diagnostic overlay maps <span className="text-orange-400 font-semibold">User Cognitive Load</span> against <span className="text-purple-400 font-semibold">Gemini Response Latency</span> to isolate deep cognitive bottlenecks in high-frequency reasoning loops.
          </p>

          <div className="h-[210px] w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryData} margin={{ top: 10, right: -5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="latencyOverlayGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="loadOverlayGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                <XAxis dataKey="timeString" stroke="#64748b" tick={{ fontSize: 9 }} />
                
                {/* Left Y-Axis for Cognitive Load (%) */}
                <YAxis 
                  yAxisId="left" 
                  stroke="#f97316" 
                  tick={{ fontSize: 9 }} 
                  domain={[0, 100]}
                />
                
                {/* Right Y-Axis for Gemini Latency (ms) */}
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#a855f7" 
                  tick={{ fontSize: 9 }} 
                  domain={[0, 5000]}
                />

                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#02010c", 
                    borderColor: "#1e293b",
                    borderRadius: "12px",
                    fontSize: "10px",
                    color: "#f1f5f9"
                  }} 
                />
                <Legend verticalAlign="top" height={28} iconSize={8} iconType="circle" />
                
                <Area
                  yAxisId="left"
                  name="Cognitive Load (%)"
                  type="monotone"
                  dataKey="cognitiveLoad"
                  stroke="#f97316"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#loadOverlayGrad)"
                />
                
                <Area
                  yAxisId="right"
                  name="Gemini Latency (ms)"
                  type="monotone"
                  dataKey="geminiLatency"
                  stroke="#a855f7"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#latencyOverlayGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Diagnostic Metrics Correlation Row */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-900 text-center font-mono text-[9px]">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900">
              <span className="text-slate-500 uppercase block">Bottleneck Risk</span>
              <span className="text-orange-400 font-bold block mt-1 uppercase">
                {avgLoad > 70 ? "HIGH OVERLOAD" : avgLoad > 45 ? "MODERATE LAG" : "STABLE/OPTIMAL"}
              </span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900">
              <span className="text-slate-500 uppercase block">Avg Gemini Latency</span>
              <span className="text-purple-400 font-bold block mt-1">
                {Math.round(telemetryData.reduce((acc, p) => acc + (p.geminiLatency || 1200), 0) / telemetryData.length)} ms
              </span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900">
              <span className="text-slate-500 uppercase block">Latency Coupling Ratio</span>
              <span className="text-slate-200 font-bold block mt-1">
                {(0.82 + (avgLoad / 400)).toFixed(2)}x
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
