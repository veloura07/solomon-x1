import { useState, FormEvent } from "react";
import { MemoryItem } from "../types";
import { 
  Brain, 
  Search, 
  PlusCircle, 
  Sparkles, 
  Database, 
  GitBranch, 
  Flame, 
  HelpCircle, 
  RotateCw,
  Compass,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";

interface MemoryCortexProps {
  memoryItems: MemoryItem[];
  onAddMemory: (newItem: Omit<MemoryItem, "id" | "timestamp">) => void;
}

export default function MemoryCortex({ memoryItems, onAddMemory }: MemoryCortexProps) {
  const [subModule, setSubModule] = useState<"cortex" | "dream" | "gravity">("cortex");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Tab selector for 9 horizons
  const [activeHorizon, setActiveHorizon] = useState<"All" | MemoryItem["horizon"]>("All");
  
  // State for new memory form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSummary, setNewSummary] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("Information");
  const [newHorizon, setNewHorizon] = useState<MemoryItem["horizon"]>("L1_Sensory");
  const [newTagsStr, setNewTagsStr] = useState("");

  // Cognitive tags for predictive patterns
  const [timelineTags, setTimelineTags] = useState<string[]>(["active_coding", "test_failure"]);
  const [newTagInput, setNewTagInput] = useState("");
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  // System 5: Goal Gravity Engine states
  const [goals, setGoals] = useState([
    { id: "g1", title: "Build Solomon X Core Engine", mass: 85, alignment: 94, pull: 72, drift: 8 },
    { id: "g2", title: "Master Generative AI Architecture", mass: 60, alignment: 88, pull: 44, drift: 12 },
    { id: "g3", title: "Launch CogOS Ventures Studio", mass: 45, alignment: 74, pull: 22, drift: 28 },
    { id: "g4", title: "Personal Fashion Aesthetics Brand", mass: 35, alignment: 65, pull: 15, drift: 35 }
  ]);
  const [isSimulatingGravity, setIsSimulatingGravity] = useState(false);

  // System 7: Dream Engine indicators
  const [dreamSchedule, setDreamSchedule] = useState("04:00 AM UTC (Daily)");
  const [pruningRate, setPruningRate] = useState("14.8% Memory Shards Purged / Period");
  const [activeDreamSequence, setActiveDreamSequence] = useState(false);
  const [dreamLogs, setDreamLogs] = useState<string[]>([
    "IDLE: Ready for night-cycle memory compaction.",
    "L1 index verified successfully.",
    "Axioms correctly mapped to L8 Wisdom indexes."
  ]);

  const handleCreateMemory = (e: FormEvent) => {
    e.preventDefault();
    if (!newSummary.trim()) return;

    onAddMemory({
      horizon: newHorizon,
      summary: newSummary,
      detailedContent: newContent,
      category: newCategory,
      tags: newTagsStr.split(",").map(t => t.trim()).filter(Boolean),
    });

    setNewSummary("");
    setNewContent("");
    setNewTagsStr("");
    setShowAddForm(false);
  };

  const runDreamCondense = () => {
    setActiveDreamSequence(true);
    setDreamLogs([
      "DREAM CYCLE ACTIVATED: TRIGGERING CONCURRENT RE-INDEXING...",
      "EXTRACTING CONVERSATION LOGS AT L2 TIERS -> TRANSFORMING TO L3 EPISODES...",
      "INDEXING L3 RELATIONAL NODE-WEIGHT CONNECTIONS -> CREATING L4 GRAPHS...",
      "CONDENSING SEMANTIC PATHWAYS INTO L8 WISDOM AXIOMS...",
      "COMPACTED 14.8% UNSTABLE SHARDS. MEMORY SAVINGS: +118kb."
    ]);

    setTimeout(() => {
      setActiveDreamSequence(false);
    }, 3000);
  };

  const runGravityRecalculate = () => {
    setIsSimulatingGravity(true);
    setTimeout(() => {
      setGoals(prev => prev.map(g => ({
        ...g,
        pull: Math.min(100, Math.round(g.mass * 1.15 + (Math.random() * 8 - 4))),
        alignment: Math.min(100, Math.round(g.alignment + (Math.random() * 6 - 3))),
        drift: Math.max(0, Math.round(g.drift + (Math.random() * 4 - 2)))
      })));
      setIsSimulatingGravity(false);
    }, 1500);
  };

  const addTimelineTag = () => {
    if (!newTagInput.trim()) return;
    setTimelineTags([...timelineTags, newTagInput.trim().toLowerCase()]);
    setNewTagInput("");
  };

  const removeTimelineTag = (idx: number) => {
    setTimelineTags(timelineTags.filter((_, i) => i !== idx));
  };

  const filteredMemories = memoryItems.filter(item => {
    const matchesSearch = 
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.detailedContent.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesHorizon = activeHorizon === "All" || item.horizon === activeHorizon;

    return matchesSearch && matchesHorizon;
  });

  // Dynamic colors for memory tiers
  const getHorizonBadgeColor = (h: MemoryItem["horizon"]) => {
    switch (h) {
      case "L1_Sensory": return "bg-[#b45309]/10 text-amber-400 border border-amber-500/25";
      case "L2_Conversational": return "bg-[#1d4ed8]/10 text-blue-400 border border-blue-500/25";
      case "L3_Episodic": return "bg-[#047857]/10 text-emerald-400 border border-emerald-500/25";
      case "L4_Relational": return "bg-pink-500/10 text-pink-400 border border-pink-500/25";
      case "L5_Semantic": return "bg-purple-500/10 text-purple-400 border border-purple-500/25";
      case "L6_Procedural": return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/25";
      case "L7_IntentScheduler": return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/25";
      case "L8_Wisdom": return "bg-rose-500/10 text-rose-400 border border-rose-500/25";
      case "L9_LegacyLedger": return "bg-teal-500/10 text-teal-300 border border-teal-500/25";
      default: return "bg-slate-800 text-slate-400 border border-slate-700";
    }
  };

  return (
    <div className="space-y-6 font-mono text-slate-300">
      
      {/* SECTION TABS SUB-HEADER */}
      <div id="memory-cortex-subnavigation" className="flex flex-wrap items-center gap-2 bg-slate-900/30 p-2 border border-slate-850 rounded-xl justify-center md:justify-start">
        <button 
          onClick={() => setSubModule("cortex")}
          className={`h-8 text-[10px] uppercase font-bold tracking-wide px-4 rounded-lg transition ${
            subModule === "cortex" ? "bg-purple-600/15 text-purple-300 border border-purple-500/20" : "text-slate-500 hover:text-slate-300"
          }`}
        >
          System 6: 9-Horizon Memory Indexer
        </button>
        <button 
          onClick={() => setSubModule("dream")}
          className={`h-8 text-[10px] uppercase font-bold tracking-wide px-4 rounded-lg transition ${
            subModule === "dream" ? "bg-purple-600/15 text-purple-300 border border-purple-500/20" : "text-slate-500 hover:text-slate-300"
          }`}
        >
          System 7: Dream Compaction Engine
        </button>
        <button 
          onClick={() => setSubModule("gravity")}
          className={`h-8 text-[10px] uppercase font-bold tracking-wide px-4 rounded-lg transition ${
            subModule === "gravity" ? "bg-purple-600/15 text-purple-300 border border-purple-500/20" : "text-slate-500 hover:text-slate-300"
          }`}
        >
          System 5: Goal Gravity Engine
        </button>
      </div>

      {subModule === "cortex" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-fadeIn">
          
          {/* CORTEX LEFT: HORIZONS INDEX TABLE */}
          <div className="lg:col-span-8 bg-slate-900/30 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-400" />
                  9-HORIZON COGNITIVE ARCHIVE
                </span>
                <button 
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="h-8 px-3 rounded-lg bg-purple-650 hover:bg-purple-500 text-[10px] font-bold text-slate-100 flex items-center gap-1 transition"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  ADD MEMORY HORIZON DATA
                </button>
              </div>

              {showAddForm && (
                <form onSubmit={handleCreateMemory} className="bg-slate-950/80 border border-purple-500/20 p-4 rounded-xl space-y-3 mb-4 text-[11px] animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] text-slate-500 uppercase mb-1">Horizon Tier</label>
                      <select 
                        value={newHorizon} 
                        onChange={(e) => setNewHorizon(e.target.value as any)}
                        className="w-full h-8 px-2 bg-slate-900 border border-slate-800 rounded font-mono text-slate-200 focus:outline-none"
                      >
                        <option value="L1_Sensory">L1: Volatile Sensory</option>
                        <option value="L2_Conversational">L2: Conversational Key</option>
                        <option value="L3_Episodic">L3: Episodic DB</option>
                        <option value="L4_Relational">L4: Relational Graph</option>
                        <option value="L5_Semantic">L5: Semantic long-term</option>
                        <option value="L6_Procedural">L6: Tool Procedural</option>
                        <option value="L7_IntentScheduler">L7: Intent Scheduler</option>
                        <option value="L8_Wisdom">L8: Wisdom Axioms</option>
                        <option value="L9_LegacyLedger">L9: Legacy Crypt Ledger</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] text-slate-500 uppercase mb-1">Category</label>
                      <select 
                        value={newCategory} 
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full h-8 px-2 bg-slate-900 border border-slate-800 rounded font-mono text-slate-200 focus:outline-none"
                      >
                        <option value="Information">Information</option>
                        <option value="Aspiration">Aspiration</option>
                        <option value="ECC Rule">ECC Code Parity</option>
                        <option value="Trust Key">Verifiable Certificate</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] text-slate-500 uppercase">Core Summary</label>
                    <input 
                      type="text" 
                      required 
                      value={newSummary} 
                      onChange={(e) => setNewSummary(e.target.value)}
                      placeholder="e.g., Connected active sandbox executing thread."
                      className="w-full h-8 px-3 bg-slate-900 border border-slate-800 rounded focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] text-slate-500 uppercase">Detailed Content</label>
                    <textarea 
                      value={newContent} 
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="Context details..."
                      className="w-full h-12 p-2 bg-slate-900 border border-slate-800 rounded focus:outline-none resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] text-slate-500 uppercase">Tags (comma separated)</label>
                    <input 
                      type="text" 
                      value={newTagsStr} 
                      onChange={(e) => setNewTagsStr(e.target.value)}
                      placeholder="epistemic, cryptography, baseline"
                      className="w-full h-8 px-3 bg-slate-900 border border-slate-800 rounded focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-850">
                    <button type="button" onClick={() => setShowAddForm(false)} className="px-3 h-7 text-[10px] text-slate-500 hover:text-slate-300">CANCEL</button>
                    <button type="submit" className="px-4 h-7 bg-purple-600 rounded text-[10px] font-bold text-slate-100">COMMIT MEMBER</button>
                  </div>
                </form>
              )}

              {/* SEARCH & HORIZON HORIZONTAL FILTER */}
              <div className="flex flex-col md:flex-row gap-2 bg-slate-950/40 p-2 border border-slate-850 rounded-xl mb-4 text-[10px]">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-500" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search memory arrays..."
                    className="w-full h-7 pl-8 pr-3 bg-slate-900 border border-slate-850 rounded focus:outline-none text-slate-200"
                  />
                </div>

                <div className="flex flex-wrap gap-1 items-center max-h-[80px] overflow-y-auto pr-1">
                  {["All", "L1_Sensory", "L2_Conversational", "L3_Episodic", "L4_Relational", "L5_Semantic", "L6_Procedural", "L7_IntentScheduler", "L8_Wisdom", "L9_LegacyLedger"].map((hz) => (
                    <button 
                      key={hz} 
                      onClick={() => setActiveHorizon(hz as any)}
                      className={`h-6 px-2 rounded text-[8px] border transition ${
                        activeHorizon === hz ? "bg-purple-600/15 text-purple-300 border-purple-500/35" : "bg-slate-900 border-slate-850 text-slate-500"
                      }`}
                    >
                      {hz.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* MEMORIES LEDGER STACK */}
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {filteredMemories.map((item) => (
                  <div key={item.id} className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl hover:border-slate-800 transition text-[11px] space-y-1.5">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-2">
                        <span className={`text-[8px] uppercase font-extrabold px-1.5 py-0.2 rounded ${getHorizonBadgeColor(item.horizon)}`}>
                          {item.horizon.replace("_", " ")}
                        </span>
                        <span className="text-[8px] bg-purple-500/10 text-purple-400 border border-purple-500/15 px-1.5 rounded uppercase font-bold text-center">
                          {item.category}
                        </span>
                      </div>
                      <span className="text-[8px] text-slate-500">{new Date(item.timestamp).toLocaleTimeString()}</span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-200">{item.summary}</h4>
                    <p className="text-slate-400 leading-normal font-mono">{item.detailedContent}</p>
                    
                    <div className="flex gap-1.5 pt-1">
                      {item.tags.map((tg, i) => (
                        <span key={i} className="text-[8px] bg-slate-900 text-slate-500 border border-slate-850 px-1.5 py-0.2 rounded">
                          #{tg}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CORTEX RIGHT: COGNITIVE TAG PREDICTIONS */}
          <div className="lg:col-span-4 bg-slate-900/30 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-200 block mb-2">HOOD TEMPORAL PREDICTORS</span>
              <p className="text-[10px] text-slate-400 leading-normal mb-4">
                Seed active memory keys to predict system alignment states based on sliding task histories.
              </p>

              <div className="flex gap-1.5 mb-4">
                <input 
                  type="text" 
                  value={newTagInput} 
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="pattern tag..." 
                  className="flex-1 h-8 px-2 bg-slate-950 border border-slate-850 rounded text-[10px] focus:outline-none"
                />
                <button onClick={addTimelineTag} className="h-8 px-3 rounded bg-purple-650 text-[10px] font-bold text-white hover:bg-purple-500">ADD</button>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {timelineTags.map((tg, idx) => (
                  <span key={idx} className="bg-slate-950 border border-slate-850 p-1 px-2 rounded-md text-[9px] text-[#c084fc] flex items-center gap-1">
                    #{tg}
                    <button onClick={() => removeTimelineTag(idx)} className="text-[8px] text-red-400">x</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/60 text-center text-[10px] text-slate-500 font-mono">
              PREDICTS SLIDING EPISODIC PATTERN CONGESTIONS
            </div>
          </div>

        </div>
      )}

      {subModule === "dream" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-fadeIn">
          
          {/* DREAM STABILIZATION STATUS */}
          <div className="lg:col-span-7 bg-slate-900/30 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
                  DREAM CONSOLIDATION MATRIX
                </span>
                <span className="text-[9px] text-orange-400 bg-orange-400/5 px-2 py-0.5 rounded border border-orange-500/25">
                  L3 ➔ L8 COMPRESSION PASS
                </span>
              </div>

              <p className="text-[11px] text-slate-400 mb-4 leading-normal">
                During sleep or idle phases, the Solomon OS Dream Engine prunes raw chat buffers, extracts relational concepts, and writes axioms to L8 (Wisdom) and L9 (Legacy Ledger).
              </p>

              <div className="grid grid-cols-2 gap-3 bg-slate-950/40 p-3.5 border border-slate-850 rounded-xl mb-4 text-[10px] leading-relaxed">
                <div className="space-y-1">
                  <span className="text-slate-500 block">NIGHTLY TRIGGER TIMELINES</span>
                  <span className="text-slate-200 font-bold block bg-slate-900 border border-slate-850 p-1.5 rounded">{dreamSchedule}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 block">AXIOMS PRUNING COMPRESSION RATIO</span>
                  <span className="text-slate-200 font-bold block bg-slate-900 border border-slate-850 p-1.5 rounded">{pruningRate}</span>
                </div>
              </div>

              {/* Dream Flowing trace block */}
              <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl max-h-[140px] overflow-y-auto text-[9px] font-mono leading-relaxed text-[#c084fc]">
                {dreamLogs.map((lg, i) => (
                  <p key={i} className="mb-1 leading-normal border-b border-slate-900 pb-1">• {lg}</p>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex gap-2">
              <button 
                onClick={runDreamCondense}
                disabled={activeDreamSequence}
                className="w-full h-10 bg-purple-650 hover:bg-purple-500 text-slate-100 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{activeDreamSequence ? "CONDENSING EPISODES INTO WISDOM..." : "ACTIVATE DREAM AXIAL EXTRACTION"}</span>
              </button>
            </div>
          </div>

          {/* COMPACTING VISUAL MAP */}
          <div className="lg:col-span-5 bg-slate-900/30 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-200 block mb-3">COGNITIVE PATHWAY COMPACTION MAP</span>
              
              <div className="p-4 bg-slate-950/80 border border-slate-850 rounded-xl flex flex-col items-center justify-center gap-2 relative overflow-hidden h-[190px]">
                {/* Simulated spinning particle orbital dots */}
                <div className="absolute w-32 h-32 rounded-full border border-dashed border-purple-500/20 animate-spin" style={{ animationDuration: '10s' }} />
                <div className="absolute w-20 h-20 rounded-full border border-dashed border-orange-500/20 animate-spin" style={{ animationDuration: '6s' }} />

                <div className="z-10 text-center space-y-1">
                  <span className="text-xs font-bold text-slate-100 uppercase tracking-widest block font-mono">CONSOLIDATING</span>
                  <div className="flex items-center gap-2 justify-center text-xs font-bold font-mono">
                    <span className="text-purple-400">L3 Episodic</span>
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                    <span className="text-[#f43f5e]">L8 Wisdom Axioms</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-85 mt-3 text-[10px] text-slate-500 text-center font-mono uppercase">
              REDUCING SEMANTIC ENTROPY CONSTANTS
            </div>
          </div>

        </div>
      )}

      {subModule === "gravity" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-fadeIn">
          
          {/* GOAL GRAVITY METRICS */}
          <div className="lg:col-span-7 bg-slate-900/30 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  GOAL GRAVITY ORBITAL ENGINE
                </span>
                <span className="text-[9px] text-emerald-400 bg-emerald-400/5 px-2 py-0.5 rounded border border-emerald-500/25">
                  Geodesics
                </span>
              </div>

              <p className="text-[11px] text-slate-400 mb-4 leading-normal">
                Long-term intents distort the trajectories of adjacent specialized agents. In Solomon X, goals operate as gravitational masses pulling learning attention flow along Lorentzian geodesics.
              </p>

              <div className="space-y-3">
                {goals.map((gl) => (
                  <div key={gl.id} className="p-3 bg-slate-950/70 border border-slate-850 rounded-xl space-y-1.5 text-[11px]">
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-slate-200">{gl.title}</span>
                      <span className="text-[#a78bfa] font-bold font-sans">Mass: {gl.mass}M</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[9px] text-slate-400 bg-slate-900 p-2 rounded">
                      <div>
                        <span>ALIGNMENT</span>
                        <span className="block text-emerald-400 font-bold block mt-0.5">{gl.alignment}%</span>
                      </div>
                      <div>
                        <span>ATTENTION PULL</span>
                        <span className="block text-purple-400 font-bold block mt-0.5">{gl.pull}%</span>
                      </div>
                      <div>
                        <span>COGNITIVE DRIFT</span>
                        <span className="block text-orange-400 font-bold block mt-0.5">{gl.drift}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex gap-2">
              <button 
                onClick={runGravityRecalculate}
                disabled={isSimulatingGravity}
                className="w-full h-10 bg-purple-650 hover:bg-purple-500 text-slate-100 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isSimulatingGravity ? 'animate-spin' : ''}`} />
                <span>{isSimulatingGravity ? "RE-ROUTING KNOWLEDGE GEODESICS..." : "RE-CALCULATE GRAVITATIONAL ALIGNMENTS"}</span>
              </button>
            </div>
          </div>

          {/* GEODESIC ATTENTION FLOW VISUALIZATION */}
          <div className="lg:col-span-5 bg-slate-900/30 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-200 block mb-3">LORENTZIAN GEODESIC ATTRACTION MAP</span>
              
              <div className="p-4 bg-slate-950/80 border border-slate-850 rounded-xl flex flex-col items-center justify-center gap-2 relative overflow-hidden h-[240px]">
                {/* Simulated Geodesic orbits */}
                <div className="absolute w-36 h-36 rounded-full border border-purple-500/10" />
                <div className="absolute w-24 h-24 rounded-full border border-purple-500/15" />
                <div className="absolute w-12 h-12 rounded-full border border-[#f43f5e]/30 bg-[#f43f5e]/5 flex items-center justify-center animate-pulse">
                  <span className="w-1.5 h-1.5 bg-[#f43f5e] rounded-full animate-ping" />
                </div>

                <span className="absolute top-2 left-3 text-[8px] text-slate-500">M1 CORE MASS BOUND</span>
                <span className="absolute bottom-2 right-3 text-[8px] text-purple-400">GEODESIC DRIFT FLOW</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-85 mt-3 text-[10px] text-slate-500 text-center font-mono uppercase">
              GRAVITY VECTORS BIAS ATTENTION PREDICTIONS
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
