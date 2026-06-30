import React from "react";
import { Sliders, CheckCircle } from "lucide-react";

interface SenateActiveDebateProps {
  activeProposal: {
    id: string;
    title: string;
    author: string;
    status: string;
    yayCount: number;
    nayCount: number;
    objections: string[];
    urgencyScore: number;
    votes: { name: string; vote: string; role: string }[];
  };
  castSenateYay: () => void;
}

export function SenateActiveDebate({ activeProposal, castSenateYay }: SenateActiveDebateProps) {
  return (
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

      <div className="flex gap-2 pt-4 border-t border-slate-800">
        <button
          onClick={castSenateYay}
          className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-slate-100 rounded-xl transition flex items-center justify-center gap-1.5"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          CONFIRM MASTER APPROVAL (YAY)
        </button>
      </div>
    </div>
  );
}
