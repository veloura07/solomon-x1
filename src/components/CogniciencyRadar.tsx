import React from "react";
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Tooltip 
} from "recharts";
import { brainScores } from "../utils/proficiencies";

interface CognitiveProficiencyRadarProps {
  activeAgentIndex: number;
  agentName: string;
  agentAccentColor: string; 
}

export function CognitiveProficiencyRadar({ 
  activeAgentIndex, 
  agentName,
  agentAccentColor 
}: CognitiveProficiencyRadarProps) {
  
  // Dimensions 
  const dimensions = [
    { key: "logicalInference", label: "Logical Inference" },
    { key: "creativeSynthesis", label: "Creative Synthesis" },
    { key: "securityGuarding", label: "Security Guarding" },
    { key: "memoryRetrieval", label: "Memory Retrieval" },
    { key: "temporalAuditing", label: "Temporal Auditing" }
  ];

  // Helper to get score
  const getScore = (agentIdx: number, dimKey: string): number => {
    const defaultScores: Record<string, number> = {
      logicalInference: 75,
      creativeSynthesis: 70,
      securityGuarding: 70,
      memoryRetrieval: 70,
      temporalAuditing: 70
    };
    const agentScores = brainScores[agentIdx] || defaultScores;
    return agentScores[dimKey] || 70;
  };

  // Senate Average
  const getSenateAverage = (dimKey: string): number => {
    let total = 0;
    for (let i = 0; i < 10; i++) {
      total += getScore(i, dimKey);
    }
    return Math.round(total / 10);
  };

  const data = dimensions.map(d => ({
    subject: d.label,
    activeAgent: getScore(activeAgentIndex === -1 ? 9 : activeAgentIndex, d.key),
    senateAverage: getSenateAverage(d.key),
    fullMark: 100
  }));

  const activeColor = agentAccentColor || "#c084fc";

  return (
    <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-4 flex flex-col gap-3 font-mono">
      <div className="flex items-center justify-between border-b border-slate-900 pb-2">
        <div>
          <h4 className="text-[10px] text-slate-200 font-bold uppercase tracking-wider">
            Cognitive Proficiency Radar
          </h4>
          <p className="text-[8px] text-slate-500 uppercase mt-0.5">
            Balanced model profile mapping against the average Senate benchmark
          </p>
        </div>
        <div className="flex gap-2.5 items-center text-[7px] font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeColor }} />
            <span className="text-slate-300 uppercase">{activeAgentIndex === -1 ? "Senate Hub" : agentName.replace("Ars ", "")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            <span className="text-slate-500 uppercase">Average Senate</span>
          </div>
        </div>
      </div>

      <div className="h-56 sm:h-64 w-full flex items-center justify-center text-[9px] font-mono text-slate-400">
        <ResponsiveContainer width="95%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="#1e293b" />
            <PolarAngleAxis 
              dataKey="subject" 
              stroke="#64748b"
              tick={{ fill: "#94a3b8", fontSize: 8, fontWeight: "bold" }}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              stroke="#334155" 
              tick={{ fill: "#475569", fontSize: 7 }}
            />
            
            {/* Senate Average Area */}
            <Radar
              name="Senate Benchmark"
              dataKey="senateAverage"
              stroke="#475569"
              fill="#1e293b"
              fillOpacity={0.35}
            />

            {/* Selected Active Agent */}
            <Radar
              name={agentName}
              dataKey="activeAgent"
              stroke={activeColor}
              fill={activeColor}
              fillOpacity={0.15}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", borderRadius: "10px" }}
              itemStyle={{ fontSize: "10px", fontFamily: "monospace", color: "#f1f5f9" }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
