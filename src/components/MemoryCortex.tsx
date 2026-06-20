import { useState, FormEvent } from "react";
import { MemoryItem } from "../types";
import { Brain, HelpCircle, Archive, Search, PlusCircle, Sparkles, AlertCircle, ArrowRight } from "lucide-react";

interface MemoryCortexProps {
  memoryItems: MemoryItem[];
  onAddMemory: (newItem: Omit<MemoryItem, "id" | "timestamp">) => void;
}

export default function MemoryCortex({ memoryItems, onAddMemory }: MemoryCortexProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeHorizon, setActiveHorizon] = useState<'All' | 'L1_Sensory' | 'L2_Conversational' | 'L3_Episodic'>('All');
  
  // States for new memory creation form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSummary, setNewSummary] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("Information");
  const [newHorizon, setNewHorizon] = useState<'L1_Sensory' | 'L2_Conversational' | 'L3_Episodic'>('L1_Sensory');
  const [newTagsStr, setNewTagsStr] = useState("");
  
  // States for HOOD prediction
  const [timelineTags, setTimelineTags] = useState<string[]>(["active_coding", "test_failure"]);
  const [newTagInput, setNewTagInput] = useState("");
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [predictionError, setPredictionError] = useState("");

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

    // Reset Form
    setNewSummary("");
    setNewContent("");
    setNewTagsStr("");
    setShowAddForm(false);
  };

  const runHoodPrediction = async () => {
    if (timelineTags.length === 0) return;
    setLoadingPrediction(true);
    setPredictionError("");
    setPredictionResult(null);

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeline: timelineTags }),
      });

      if (!response.ok) {
        throw new Error("Prediction request failed.");
      }

      const data = await response.json();
      setPredictionResult(data);
    } catch (err: any) {
      setPredictionError(err.message || "Neurons failed to connect.");
    } finally {
      setLoadingPrediction(false);
    }
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

  return (
    <div id="memory-cortex-view" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT PORTION: Horizon Explorer (3-tier storage + indexing) */}
      <div id="cortex-left-explorer" className="lg:col-span-8 flex flex-col h-full bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-sans text-slate-100">MemoryOS Indexer</h2>
              <p className="text-xs text-slate-400 font-mono">ADAPTIVE HORIZON ARCHETYPE L1 - L3</p>
            </div>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 h-9 bg-purple-600 hover:bg-purple-500 text-xs text-white font-medium rounded-lg transition"
          >
            <PlusCircle className="w-4 h-4" />
            Add Memory Horizon Data
          </button>
        </div>

        {/* Create Memory Data Form Overlay */}
        {showAddForm && (
          <form onSubmit={handleCreateMemory} className="bg-slate-900 border border-purple-500/30 rounded-xl p-5 mb-6 animate-fadeIn space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Write To Cognitive Horizon
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Horizon Tier</label>
                <select
                  value={newHorizon}
                  onChange={(e) => setNewHorizon(e.target.value as any)}
                  className="w-full h-9 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 outline-none focus:border-purple-500/50 font-mono"
                >
                  <option value="L1_Sensory">L1: Local Volatile Ram (Sensory)</option>
                  <option value="L2_Conversational">L2: In-Memory (Conversational Keys)</option>
                  <option value="L3_Episodic">L3: Sliding DB Shards (Episodic Timeline)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full h-9 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 outline-none focus:border-purple-500/50 font-mono"
                >
                  <option value="Information">Information</option>
                  <option value="Goal Gravity">Goal Gravity</option>
                  <option value="Invariants">System Invariants</option>
                  <option value="Telemetry">Task Telemetry</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-slate-400 uppercase">Memory Summary</label>
              <input
                type="text"
                required
                placeholder="e.g., Connected active sandbox executing thread."
                value={newSummary}
                onChange={(e) => setNewSummary(e.target.value)}
                className="w-full h-9 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 outline-none focus:border-purple-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-slate-400 uppercase">Detailed Context</label>
              <textarea
                placeholder="Cryptographic metadata constraints or conversational logs..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full h-20 p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 outline-none focus:border-purple-500/50 resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-slate-400 uppercase">Tags (comma-separated)</label>
              <input
                type="text"
                placeholder="tpm, secure, build, code"
                value={newTagsStr}
                onChange={(e) => setNewTagsStr(e.target.value)}
                className="w-full h-9 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 outline-none focus:border-purple-500/50 font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800/60">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 h-8 text-xs text-slate-400 hover:text-slate-200 font-mono"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-4 h-8 bg-purple-600 hover:bg-purple-500 text-xs text-white font-mono rounded-md"
              >
                COMMIT TO CORTEZ
              </button>
            </div>
          </form>
        )}

        {/* Filter / Search tabs */}
        <div id="cortex-search" className="flex flex-col md:flex-row gap-3 mb-6 bg-slate-950/40 border border-slate-800/60 rounded-xl p-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search keys, categories, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-slate-950 border border-slate-800/60 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-purple-500/40"
            />
          </div>

          <div id="horizon-filter-tabs" className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveHorizon("All")}
              className={`h-8 font-mono text-[10px] px-3.5 rounded-md border transition ${
                activeHorizon === "All"
                  ? "bg-purple-500/20 text-purple-300 border-purple-500/40 font-semibold"
                  : "bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-300"
              }`}
            >
              All Horizons
            </button>
            <button
              onClick={() => setActiveHorizon("L1_Sensory")}
              className={`h-8 font-mono text-[10px] px-3.5 rounded-md border transition ${
                activeHorizon === "L1_Sensory"
                  ? "bg-purple-500/20 text-purple-300 border-purple-500/40 font-semibold"
                  : "bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-300"
              }`}
            >
              L1 volatile Sensory
            </button>
            <button
              onClick={() => setActiveHorizon("L2_Conversational")}
              className={`h-8 font-mono text-[10px] px-3.5 rounded-md border transition ${
                activeHorizon === "L2_Conversational"
                  ? "bg-purple-500/20 text-purple-300 border-purple-500/40 font-semibold"
                  : "bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-300"
              }`}
            >
              L2 Conversational Context
            </button>
            <button
              onClick={() => setActiveHorizon("L3_Episodic")}
              className={`h-8 font-mono text-[10px] px-3.5 rounded-md border transition ${
                activeHorizon === "L3_Episodic"
                  ? "bg-purple-500/20 text-purple-300 border-purple-500/40 font-semibold"
                  : "bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-300"
              }`}
            >
              L3 Episodic LanceDB
            </button>
          </div>
        </div>

        {/* Memory Items Stack */}
        <div id="cortex-memories-stack" className="flex-1 overflow-y-auto max-h-[440px] space-y-4 pr-1">
          {filteredMemories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border border-dashed border-slate-800 rounded-xl text-center">
              <Archive className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-xs text-slate-400 font-mono font-medium">NO ACTIVE MEMORIES IN THIS SEGMENT</p>
              <p className="text-[10px] text-slate-500 max-w-xs mt-1">
                Insert a memory sequence using the form above or start a conversation to seed the logs automatically.
              </p>
            </div>
          ) : (
            filteredMemories.map((item) => (
              <div
                key={item.id}
                className="group border border-slate-800 hover:border-purple-500/30 bg-slate-950/50 hover:bg-slate-950/80 rounded-xl p-4 transition duration-200"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded ${
                        item.horizon === "L1_Sensory"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : item.horizon === "L2_Conversational"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      {item.horizon.replace("_", " ")}
                    </span>
                    <span className="text-[9px] font-semibold text-purple-400/80 bg-purple-500/5 px-2 py-0.5 rounded uppercase font-mono">
                      {item.category}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">{new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>

                <h4 className="text-xs font-semibold text-slate-200 group-hover:text-purple-300 transition mb-1">{item.summary}</h4>
                {item.detailedContent && (
                  <p className="text-[11px] text-slate-400 leading-relaxed font-mono bg-slate-950/80 p-2 rounded-lg border border-slate-900 mb-2">
                    {item.detailedContent}
                  </p>
                )}

                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag) => (
                      <span key={tag} className="text-[9px] text-slate-500 font-mono bg-slate-900 border border-slate-800 px-1.5 py-0.2 rounded hover:text-slate-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT PORTION: HOOD Anticipatory Forecast Sequencer */}
      <div id="cortex-right-hood" className="lg:col-span-4 flex flex-col bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <HelpCircle className="w-5 h-5 text-orange-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-100 font-sans">HOOD Predictor</h3>
            <p className="text-[10px] text-slate-400 font-mono">ANTICIPATORY PATTERN FORECAST</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-4 leading-normal">
          The <span className="text-orange-400 font-mono font-semibold">Cognitive Twin</span> tracks user-action tags over a sliding time index to forecast impending offloading needs before they trigger bottlenecks.
        </p>

        {/* Sequence Vector Tags list */}
        <div id="hood-sequence-builder" className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 mb-4 space-y-3">
          <label className="block text-[10px] font-mono text-slate-400 uppercase">Context Sequence Timeline</label>
          
          <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-950 border border-slate-900 rounded-lg min-h-[44px]">
            {timelineTags.length === 0 ? (
              <span className="text-[10px] text-slate-600 font-mono italic">Timeline empty. Add state tags.</span>
            ) : (
              timelineTags.map((tag, idx) => (
                <div key={idx} className="flex items-center gap-1 text-[10px] bg-orange-500/10 border border-orange-500/20 text-orange-400 px-2 py-0.5 rounded-md font-mono">
                  <span>{tag}</span>
                  <button onClick={() => removeTimelineTag(idx)} className="hover:text-red-400 font-bold ml-0.5">×</button>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. read_docs, compilation_fail"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTimelineTag()}
              className="flex-1 h-8 px-3 bg-slate-900 border border-slate-800 rounded-md text-xs text-slate-200 outline-none"
            />
            <button
              onClick={addTimelineTag}
              className="px-3 h-8 bg-slate-800 text-xs text-slate-200 hover:bg-slate-700 font-mono rounded-md border border-slate-750"
            >
              ADD
            </button>
          </div>
        </div>

        <button
          onClick={runHoodPrediction}
          disabled={loadingPrediction || timelineTags.length === 0}
          className="w-full flex items-center justify-center gap-2 px-4 h-10 bg-orange-600 hover:bg-orange-500 text-xs text-white font-mono font-medium rounded-xl transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingPrediction ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              COGNITIVE PATH SEQUENCING...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-200" />
              RUN FORECAST PIPELINE
            </>
          )}
        </button>

        {predictionError && (
          <div className="flex items-center gap-2 mt-4 p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-xs font-mono">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{predictionError}</span>
          </div>
        )}

        {/* Prediction Outputs */}
        {predictionResult ? (
          <div className="mt-4 bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-3.5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Forecast Result</span>
              <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                predictionResult.cognitiveOverloadRisk === "High"
                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                  : predictionResult.cognitiveOverloadRisk === "Medium"
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              }`}>
                RISK: {predictionResult.cognitiveOverloadRisk}
              </span>
            </div>

            <div className="space-y-1">
              <span className="block text-[9px] font-mono text-slate-500 uppercase">ANTICIPATED USER NEEDS:</span>
              <ul className="space-y-1">
                {predictionResult.predictedNeeds?.map((need: string, i: number) => (
                  <li key={i} className="flex items-center gap-1.5 text-xs text-slate-200 font-mono">
                    <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
                    <span>{need}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-1">
              <span className="block text-[9px] font-mono text-slate-500 uppercase">RECOMMENDED OFF-LOAD TRICK:</span>
              <p className="text-xs text-slate-300 font-mono italic leading-relaxed pt-1 bg-slate-950 p-2 rounded-lg border border-slate-900">
                "{predictionResult.recommendedPreparation}"
              </p>
            </div>

            <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 border-t border-slate-900 pt-2">
              <span>PATTERN PROBABILITY</span>
              <span className="text-orange-400 font-semibold font-mono">{(predictionResult.probabilityScore * 100).toFixed(0)}% Certainty</span>
            </div>
          </div>
        ) : (
          !loadingPrediction && (
            <div className="flex-1 flex flex-col items-center justify-center py-10 border border-dashed border-slate-800 rounded-xl mt-4 text-center">
              <Sparkles className="w-6 h-6 text-slate-700 mb-2" />
              <p className="text-[10px] text-slate-500 font-mono uppercase">Timeline Ready</p>
              <p className="text-[10px] text-slate-600 max-w-[200px] mt-1 pr-2">Build a chronological focus sequence above and hit forecast.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
