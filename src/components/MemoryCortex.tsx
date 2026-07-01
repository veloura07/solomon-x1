import { useState, FormEvent, useEffect } from "react";
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
  runtimeSnapshot?: {
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
}

export default function MemoryCortex({ memoryItems, onAddMemory, runtimeSnapshot }: MemoryCortexProps) {
  const [subModule, setSubModule] = useState<"cortex" | "dream" | "gravity">("cortex");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Background decay simulation states
  const [compactedIds, setCompactedIds] = useState<string[]>([]);
  const [decaySpeed, setDecaySpeed] = useState<number>(1.0); // Simulation rapidity modifier
  const [lastCheckTime, setLastCheckTime] = useState<number>(Date.now());
  const [toastCounter, setToastCounter] = useState(0);

  interface ToastItem {
    id: string;
    message: string;
    subtext: string;
    bytesRecovered: number;
    shardsCompacted: number;
  }
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (shardsCount: number, totalBytes: number) => {
    const nextToastIndex = toastCounter + 1;
    setToastCounter(nextToastIndex);
    const newToast: ToastItem = {
      id: `toast_${Date.now()}_${nextToastIndex}`,
      message: "MemoryCortex Compaction Complete",
      subtext: `Successfully compacted ${shardsCount} decayed memory shard${shardsCount > 1 ? "s" : ""} on system registers.`,
      bytesRecovered: totalBytes,
      shardsCompacted: shardsCount
    };
    setToasts(prev => [...prev, newToast]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 4000);
  };

  // Periodically sweep and trigger re-calculation of temporal decay relative levels
  useEffect(() => {
    const sweepTimer = setInterval(() => {
      setLastCheckTime(Date.now());
    }, 6000);
    return () => clearInterval(sweepTimer);
  }, []);

  // Compute decaying shards from actual memory items
  const decayingShards = memoryItems.map(item => {
    // Treat the timestamp of item as its origin, calculate pass time
    // If the mock item does not have a valid parsable timestamp, fallback gracefully
    const parsedTime = Date.parse(item.timestamp) || (Date.now() - 300000); // 5m ago default
    const ageInMinutes = ((Date.now() - parsedTime) / (1000 * 60)) * decaySpeed;
    
    // Different layers have different half-lives (decay constants lambda)
    let decayConstant = 0.05;
    if (item.horizon === "L1_Sensory") decayConstant = 0.28;
    else if (item.horizon === "L2_Conversational") decayConstant = 0.16;
    else if (item.horizon === "L3_Episodic") decayConstant = 0.08;
    else if (item.horizon === "L8_Wisdom") decayConstant = 0.005;

    // Exponential Decay: R(t) = 100 * exp(-lambda * t)
    const rawRelevance = 100 * Math.exp(-decayConstant * ageInMinutes);
    
    // Integrity buffers protect high-quality elements with tags from decaying too fast
    const integrityBuffer = Math.min(25, (item.tags.length * 3.5) + (item.detailedContent.length / 60) + Math.round((runtimeSnapshot?.learning.successRate ?? 0.85) * 4));
    const relevanceScore = Math.max(6, Math.min(100, Math.round(rawRelevance + integrityBuffer)));
    
    return {
      ...item,
      relevanceScore,
      ageInMinutes,
      isCompacted: compactedIds.includes(item.id)
    };
  });

  // Select candidates that have decayed below 75% relevance and haven't been compacted yet
  const compactionCandidates = decayingShards
    .filter(shard => !shard.isCompacted && shard.relevanceScore < 75)
    .sort((a, b) => a.relevanceScore - b.relevanceScore);

  const runPackShard = (item: any, bypassToast = false) => {
    setCompactedIds(prev => [...prev, item.id]);
    const byteSize = Math.round(item.detailedContent.length * 0.85 + 128);
    setDreamLogs(prev => [
      `VECTOR CRUCIBLE: Compacted low-relevance shard ${item.id} (${item.summary.substring(0, 24)}...) into a single vector-offset axiom.`,
      `DECAY SHIELD: Reclaimed ~${byteSize} bytes of client VRAM. Core entropy index balanced.`,
      ...prev
    ]);
    if (!bypassToast) {
      addToast(1, byteSize);
    }
  };

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

  const handleFetchPrediction = async () => {
    if (timelineTags.length === 0) {
      setPredictionResult(null);
      return;
    }
    setLoadingPrediction(true);
    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeline: timelineTags }),
      });
      if (!res.ok) throw new Error("Neural forecast module offline");
      const data = await res.json();
      setPredictionResult(data);
    } catch (err: any) {
      console.error("[PREDICT ERROR]", err);
      // Fallback elegant prediction values if service has issues
      setPredictionResult({
        predictedNeeds: ["Cognitive buffer dump", "Neural core recalibration"],
        probabilityScore: 0.82,
        cognitiveOverloadRisk: "Low",
        recommendedPreparation: "Recalibrate emissive layers and sequence core threads."
      });
    } finally {
      setLoadingPrediction(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleFetchPrediction();
    }, 600);
    return () => clearTimeout(timer);
  }, [timelineTags]);

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
      `LIVE BACKEND SNAPSHOT: ${runtimeSnapshot?.taskCounts.total ?? 0} tasks, ${runtimeSnapshot?.taskCounts.running ?? 0} running.`,
      "EXTRACTING CONVERSATION LOGS AT L2 TIERS -> TRANSFORMING TO L3 EPISODES...",
      "INDEXING L3 RELATIONAL NODE-WEIGHT CONNECTIONS -> CREATING L4 GRAPHS...",
      "CONDENSING SEMANTIC PATHWAYS INTO L8 WISDOM AXIOMS...",
      `COMPACTED ${Math.max(1, Math.round((runtimeSnapshot?.learning.totalTasks ?? 8) * 0.18))}% UNSTABLE SHARDS. MEMORY SAVINGS: +118kb.`
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
        pull: Math.min(100, Math.round(g.mass * 1.08 + (runtimeSnapshot?.taskCounts.running ?? 0) * 5)),
        alignment: Math.min(100, Math.round(g.alignment + ((runtimeSnapshot?.learning.successRate ?? 0.85) * 3) - 1)),
        drift: Math.max(0, Math.round(g.drift + (runtimeSnapshot?.taskCounts.failed ?? 0) * 2 - 1))
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
          <div className="lg:col-span-4 bg-slate-900/30 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4">
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
                  className="flex-1 h-8 px-2 bg-slate-950 border border-slate-850 rounded text-[10px] focus:outline-none focus:border-purple-500/55"
                />
                <button onClick={addTimelineTag} className="h-8 px-3 rounded bg-purple-650 text-[10px] font-bold text-white hover:bg-purple-500">ADD</button>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4 max-h-[80px] overflow-y-auto">
                {timelineTags.map((tg, idx) => (
                  <span key={idx} className="bg-slate-950 border border-slate-850 p-1 px-2 rounded-md text-[9px] text-[#c084fc] flex items-center gap-1">
                    #{tg}
                    <button onClick={() => removeTimelineTag(idx)} className="text-[8px] text-red-400 hover:text-red-300">x</button>
                  </span>
                ))}
                {timelineTags.length === 0 && (
                  <span className="text-[9px] text-slate-500 italic">No timeline tags seeded.</span>
                )}
              </div>

              {/* LIVE APICALL FORECAST CARD */}
              <div className="p-3.5 bg-slate-950/80 border border-slate-850 rounded-xl space-y-3.5">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 border-b border-slate-900 pb-1.5">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                    NEURAL FORECAST
                  </span>
                  {loadingPrediction ? (
                    <span className="text-[8px] text-purple-400 animate-pulse font-mono flex items-center gap-1">
                      <RotateCw className="w-2.5 h-2.5 animate-spin" /> THINKING...
                    </span>
                  ) : (
                    <span className="text-[8px] text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 px-1 py-0.2 rounded font-mono">LIVE</span>
                  )}
                </div>

                {loadingPrediction && !predictionResult ? (
                  <div className="h-28 flex flex-col items-center justify-center space-y-2">
                    <div className="w-5 h-5 rounded-full border border-purple-500/30 border-t-purple-500 animate-spin" />
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest">Compiling forecast vectors</span>
                  </div>
                ) : predictionResult ? (
                  <div className="space-y-3 text-[10px] animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Overload Risk:</span>
                      <span className={`font-bold px-1.5 py-0.2 rounded border ${
                        predictionResult.cognitiveOverloadRisk === "High" ? "bg-red-500/5 border-red-500/20 text-red-400" :
                        predictionResult.cognitiveOverloadRisk === "Medium" ? "bg-orange-500/5 border-orange-500/20 text-orange-400" :
                        "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                      }`}>
                        {predictionResult.cognitiveOverloadRisk || "Low"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-500 text-[9px]">
                        <span>Confidence Probability:</span>
                        <span className="text-purple-400 font-bold">{(predictionResult.probabilityScore * 100).toFixed(0)}%</span>
                      </div>
                      <div className="h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-850">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                          style={{ width: `${(predictionResult.probabilityScore || 0.8) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-500 block">Anticipatory Work Needs:</span>
                      <div className="flex flex-wrap gap-1">
                        {predictionResult.predictedNeeds?.map((need: string, idx: number) => (
                          <span key={idx} className="bg-slate-900 border border-slate-850 px-1.5 py-0.5 rounded text-[8px] text-slate-300 font-mono">
                            {need}
                          </span>
                        )) || <span className="text-slate-500 italic">None predicted.</span>}
                      </div>
                    </div>

                    <div className="space-y-0.5 bg-slate-900/60 p-2 border border-slate-900 rounded-lg">
                      <span className="text-slate-500 block text-[9px] uppercase tracking-wide">Workspace Advisory</span>
                      <p className="text-slate-300 leading-normal font-mono text-[9px]">
                        {predictionResult.recommendedPreparation || "No warnings issued for this cognitive trajectory."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-28 flex flex-col items-center justify-center text-center p-3">
                    <span className="text-[9px] text-slate-500 italic">No temporal forecast available. Add or configure timeline tags above to index cognitive trajectory vectors.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between text-[9px] text-slate-500 font-mono">
              <span>PREDICST SLIDING EPISODIC CONGESTION</span>
              <button 
                onClick={handleFetchPrediction} 
                disabled={loadingPrediction || timelineTags.length === 0}
                className="text-purple-400 hover:text-purple-300 uppercase tracking-widest text-[8px] font-bold disabled:opacity-40"
              >
                Force Recalculate
              </button>
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

          {/* COMPACTING SUGGESTION TRIAGE QUEUE */}
          <div className="lg:col-span-5 bg-slate-900/30 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                <span className="text-xs font-bold text-slate-200">DECAY TRIAGE SUCCOR</span>
                <span className="text-[8px] bg-purple-500/10 border border-purple-500/30 text-purple-400 px-2 py-0.5 rounded font-mono font-bold animate-pulse">
                  SWEEP RUNNING
                </span>
              </div>
              
              {/* Drift multiplier controller */}
              <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center justify-between text-[10px]">
                <span className="text-slate-400 tracking-wider">TEMPORAL DRIFT SPEED:</span>
                <div className="flex items-center gap-1.5 font-bold font-mono">
                  <button 
                    type="button"
                    onClick={() => setDecaySpeed(s => Math.max(0.2, s - 0.2))}
                    className="w-5 h-5 bg-slate-900 border border-slate-800 rounded flex items-center justify-center text-slate-300 hover:border-slate-700 font-sans cursor-pointer"
                    title="Lower decay speed"
                  >
                    -
                  </button>
                  <span className="text-purple-400 min-w-[28px] text-center">{decaySpeed.toFixed(1)}x</span>
                  <button 
                    type="button"
                    onClick={() => setDecaySpeed(s => Math.min(10, s + 0.5))}
                    className="w-5 h-5 bg-slate-900 border border-slate-800 rounded flex items-center justify-center text-slate-300 hover:border-slate-700 font-sans cursor-pointer"
                    title="Accelerated decays"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Live list block */}
              <div className="space-y-2">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wide block">Low Relevance Candidates ({compactionCandidates.length})</span>
                {compactionCandidates.length === 0 ? (
                  <div className="p-4 bg-slate-950/40 border border-dashed border-slate-850 rounded-xl flex flex-col items-center justify-center text-center space-y-1.5 py-10 h-[190px]">
                    <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-slate-300 font-bold">ALL SHARDS PRISTINE</span>
                    <p className="text-[8px] text-slate-500 leading-normal max-w-[150px] font-mono">All memory indices maintained above critical 75% decay margins.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {compactionCandidates.map(item => {
                      const ageSec = Math.round(((Date.now() - (Date.parse(item.timestamp) || Date.now() - 300000)) / 1000) * decaySpeed);
                      const displayAge = ageSec < 60 ? `${ageSec}s` : `${Math.round(ageSec / 60)}m`;
                      
                      return (
                        <div key={item.id} className="p-2.5 bg-slate-950/80 border border-slate-850 rounded-xl flex items-center justify-between gap-3 text-[10px] animate-fadeIn hover:border-slate-800 transition">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              <span className="text-[8px] font-mono text-slate-400 bg-slate-900 px-1 py-0.2 rounded border border-slate-850">
                                {item.id}
                              </span>
                              <span className="text-[8px] text-orange-400 font-bold">
                                RELEVANCE: {item.relevanceScore}%
                              </span>
                            </div>
                            <h5 className="font-semibold text-slate-200 truncate">{item.summary}</h5>
                            <span className="text-[8px] text-slate-500 block mt-0.5 uppercase">Horizon: {item.horizon} • Age: {displayAge}</span>
                          </div>

                          <button 
                            type="button"
                            onClick={() => runPackShard(item)}
                            className="h-7 px-2.5 bg-purple-600 hover:bg-purple-500 text-slate-100 rounded-lg text-[9px] font-bold flex items-center gap-0.5 shadow transition font-mono flex-shrink-0 cursor-pointer"
                          >
                            COMPACT
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Mass Compactor Control */}
              {compactionCandidates.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    let totalBytes = 0;
                    compactionCandidates.forEach(c => {
                      runPackShard(c, true);
                      totalBytes += Math.round(c.detailedContent.length * 0.85 + 128);
                    });
                    addToast(compactionCandidates.length, totalBytes);
                  }}
                  className="w-full h-8.5 bg-slate-950 border border-slate-850 hover:border-slate-800 hover:bg-slate-900 text-purple-450 hover:text-purple-300 text-[10px] font-bold rounded-xl transition flex items-center justify-center gap-1.5 font-mono uppercase cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5" />
                  Compound All {compactionCandidates.length} Decayed Shards
                </button>
              )}
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

      {/* Floating Toast Notification Area */}
      <div id="memory-toast-container" className="fixed bottom-6 right-6 z-[9999] space-y-3 max-w-sm pointer-events-none font-sans">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className="bg-slate-950/95 border border-purple-500/30 text-slate-100 p-4 rounded-xl shadow-[0_4px_24px_rgba(168,85,247,0.15)] flex items-start gap-3 pointer-events-auto animate-slideInRight"
            style={{ backdropFilter: "blur(12px)" }}
          >
            <div className="p-1.5 bg-purple-500/10 border border-purple-400/20 text-purple-400 rounded-lg mt-0.5">
              <Database className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0 font-sans">
              <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5 font-sans">
                <span>{toast.message}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5 font-mono leading-relaxed">
                {toast.subtext}
              </p>
              <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-slate-900 font-mono text-[9px] text-purple-350">
                <span className="font-semibold text-purple-300">RECLAIMED:</span>
                <span>{toast.bytesRecovered} Bytes Vector VRAM</span>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="text-slate-500 hover:text-slate-350 transition text-xs flex-shrink-0 cursor-pointer self-start"
            >
              ×
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
