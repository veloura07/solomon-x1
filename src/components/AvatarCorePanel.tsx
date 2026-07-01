import { useState, useEffect } from "react";
import { 
  Volume2, 
  Layers, 
  Activity, 
  User, 
  Sparkles, 
  Cpu, 
  HelpCircle,
  Sliders,
  Settings,
  Flame,
  Globe
} from "lucide-react";

interface AvatarCorePanelProps {
  activeAgentName: string;
  activeAgentColor: number;
}

export default function AvatarCorePanel({ 
  activeAgentName, 
  activeAgentColor 
}: AvatarCorePanelProps) {
  const [voiceActor, setVoiceActor] = useState("Arsa-V1-Ambient-N");
  const [latencyMs, setLatencyMs] = useState(8.2);
  const [emotions, setEmotions] = useState({
    focus: 94,
    calm: 88,
    doubt: 12,
    amusement: 42
  });

  const [simulatedPulse, setSimulatedPulse] = useState(false);

  // Cycle states to represent live biometric speech syncing of Solomon's Avatar
  useEffect(() => {
    const timer = setInterval(() => {
      setSimulatedPulse(true);
      setTimeout(() => setSimulatedPulse(false), 300);
      
      // Add subtle shifts to emotion matrices
      setEmotions(prev => ({
        focus: Math.max(70, Math.min(100, prev.focus + Math.round(Math.random() * 4 - 2))),
        calm: Math.max(60, Math.min(100, prev.calm + Math.round(Math.random() * 4 - 2))),
        doubt: Math.max(0, Math.min(60, prev.doubt + Math.round(Math.random() * 6 - 3))),
        amusement: Math.max(20, Math.min(95, prev.amusement + Math.round(Math.random() * 4 - 2))),
      }));
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const triggerCalibrate = () => {
    setLatencyMs(4.1);
    setTimeout(() => {
      setLatencyMs(8.2);
    }, 1200);
  };

  const getAgentColorHex = () => {
    return "#" + activeAgentColor.toString(16);
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 font-mono text-slate-300 space-y-4">
      {/* HEADER ROW */}
      <div className="flex items-center justify-between border-b border-slate-850 pb-2">
        <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
          <User className="w-4 h-4 text-purple-400" />
          SYSTEM 9: AVATAR LIP-SYNC & VOICE CORE
        </span>
        <span className="flex items-center gap-1 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded text-[8px] text-[#c084fc] font-bold animate-pulse">
          Online & Synchronized
        </span>
      </div>

      <p className="text-[10px] text-slate-500 leading-normal font-mono">
        Solomon's embodied cognitive interface is modulated in real time. Features automated lip-sync parity and active emotion synthesis matrices.
      </p>

      {/* THREE LAYOUT COLUMPTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        
        {/* EMOTION SPECTRUM */}
        <div className="bg-slate-950/50 border border-slate-850 p-3 rounded-xl space-y-2">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Real-time Emotion Matrix</span>
          
          <div className="space-y-1.5">
            <div className="space-y-0.5">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>CONCENTRATED FOCUS</span>
                <span className="text-purple-400 font-bold">{emotions.focus}%</span>
              </div>
              <div className="h-1 bg-slate-850 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${emotions.focus}%` }} />
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>EPISTEMIC SKEPTICISM / DOUBT</span>
                <span className="text-orange-400 font-bold">{emotions.doubt}%</span>
              </div>
              <div className="h-1 bg-slate-850 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${emotions.doubt}%` }} />
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>EMODIED CALM STATUS</span>
                <span className="text-emerald-400 font-bold">{emotions.calm}%</span>
              </div>
              <div className="h-1 bg-slate-850 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${emotions.calm}%` }} />
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>AMUSEMENT INDEX</span>
                <span className="text-pink-400 font-bold">{emotions.amusement}%</span>
              </div>
              <div className="h-1 bg-slate-850 rounded-full overflow-hidden">
                <div className="h-full bg-pink-500 rounded-full" style={{ width: `${emotions.amusement}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* VOICE CALIBRATOR */}
        <div className="bg-slate-950/50 border border-slate-850 p-3 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Voice Routing</span>
              <Volume2 className={`w-3.5 h-3.5 ${simulatedPulse ? 'text-purple-400 animate-ping' : 'text-slate-500'}`} />
            </div>

            <div className="space-y-2 text-[10px]">
              <div className="flex justify-between items-center p-1 px-2 bg-slate-900 border border-slate-800 rounded">
                <span className="text-slate-400">Model Actor:</span>
                <span className="text-slate-200 font-bold text-[9px]">{voiceActor}</span>
              </div>

              <div className="flex justify-between items-center p-1 px-2 bg-slate-900 border border-slate-800 rounded">
                <span className="text-slate-400">Active Node:</span>
                <span className="text-[9px] font-bold uppercase truncate" style={{ color: getAgentColorHex() }}>
                  {activeAgentName}
                </span>
              </div>

              <div className="flex justify-between items-center p-1 px-2 bg-slate-900 border border-slate-800 rounded">
                <span className="text-slate-400">Sync Parity Latency:</span>
                <span className="text-cyan-400 font-bold">{latencyMs}ms</span>
              </div>
            </div>
          </div>

          <div className="flex gap-1.5 pt-2 border-t border-slate-850/60 mt-2">
            <button 
              onClick={triggerCalibrate}
              className="flex-1 h-7 bg-purple-650 hover:bg-purple-600 rounded text-[9px] font-bold text-slate-100 flex items-center justify-center gap-1"
            >
              <Settings className="w-2.5 h-2.5" />
              CALIBRATE LIP-SYNC PARITY
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
