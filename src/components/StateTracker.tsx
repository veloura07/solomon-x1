import { useState } from "react";
import { TelemetryPoint } from "../types";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Activity, Zap, Play, Eye, Flame, ShieldAlert } from "lucide-react";

interface StateTrackerProps {
  telemetryData: TelemetryPoint[];
  onUpdateTelemetry: (newData: TelemetryPoint[]) => void;
  bloomThreshold: number;
  setBloomThreshold: (val: number) => void;
  bloomIntensity: number;
  setBloomIntensity: (val: number) => void;
}

export default function StateTracker({ 
  telemetryData, 
  onUpdateTelemetry,
  bloomThreshold,
  setBloomThreshold,
  bloomIntensity,
  setBloomIntensity
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

    // Re-seed telemetry points based on selected activity type
    const baseData = [] as TelemetryPoint[];
    let focus = 80;
    let load = 30;
    let momentum = 70;

    for (let i = 0; i < 10; i++) {
      const minutesAgo = (9 - i) * 5;
      const timeString = `${minutesAgo}m ago`;

      if (mode === "Quiet") {
        focus = Math.max(70, Math.min(100, 85 + Math.random() * 12 - 5));
        load = Math.max(15, Math.min(60, 25 + Math.random() * 15 - 5));
        momentum = Math.max(50, Math.min(95, 75 + Math.random() * 10 - 5));
      } else if (mode === "HeavyCode") {
        focus = Math.max(80, Math.min(100, 92 + Math.random() * 8 - 4));
        load = Math.max(55, Math.min(98, 82 + Math.random() * 14 - 7));
        momentum = Math.max(80, Math.min(100, 90 + Math.random() * 10 - 4));
      } else {
        focus = Math.max(20, Math.min(65, 42 + Math.random() * 20 - 10));
        load = Math.max(10, Math.min(50, 20 + Math.random() * 10 - 5));
        momentum = Math.max(15, Math.min(55, 30 + Math.random() * 15 - 10));
      }

      baseData.push({
        timeIndex: i,
        timeString,
        focusLevel: Math.round(focus),
        cognitiveLoad: Math.round(load),
        momentum: Math.round(momentum),
      });
    }

    onUpdateTelemetry(baseData);
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
            Interact with your local application workspace layout to simulate real physical input/focus streams automatically.
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

          <div className="space-y-4 pt-1 font-mono">
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

      {/* Recharts Graphical Pane */}
      <div id="chart-panel" className="lg:col-span-8 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col">
        <div className="flex items-center justify-between mb-6 border-b border-slate-900 pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-[11px] font-bold text-slate-300">COGNITIVE MANIFOLD SEQUENCES (30m SLIDING)</span>
          </div>
          <span className="text-[9px] text-slate-500 font-mono">NODE ACTIVE STATUS: FEED VALIDATED</span>
        </div>

        {/* Telemetry charts */}
        <div className="flex-1 min-h-[300px] w-full text-xs font-mono">
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

    </div>
  );
}
