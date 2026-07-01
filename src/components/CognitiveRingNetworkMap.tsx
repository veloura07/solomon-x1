import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { AgentSpec } from "../types";
import { Network, Activity, Info } from "lucide-react";

interface CognitiveRingNetworkMapProps {
  agents: AgentSpec[];
  selectedAgentIndex: number;
  onSelectAgent: (index: number) => void;
}

interface NetworkNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  index: number;
  color: string;
  reputation: number;
  tokens: number;
  domain: string;
}

interface NetworkLink extends d3.SimulationLinkDatum<NetworkNode> {
  source: string | NetworkNode;
  target: string | NetworkNode;
  value: number;
}

export function CognitiveRingNetworkMap({
  agents,
  selectedAgentIndex,
  onSelectAgent,
}: CognitiveRingNetworkMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    const container = containerRef.current;
    const width = container.clientWidth || 600;
    const height = 300;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("style", "max-width: 100%; height: auto;");

    // Prepare Node & Link dataset
    const nodes: NetworkNode[] = agents.map((ag) => ({
      id: ag.name,
      name: ag.name,
      index: ag.index,
      color: `#${ag.bandColor.toString(16).padStart(6, "0")}`,
      reputation: ag.reputationScore,
      tokens: ag.tokenPool,
      domain: ag.domainName || "COGNITIVE",
    }));

    const links: NetworkLink[] = [
      // Ring structure connections (0-1-2-3-4-5-6-7-8-9-0)
      { source: "Ars Almadel", target: "Ars Notoria", value: 3 },
      { source: "Ars Notoria", target: "Ars Paulina", value: 3 },
      { source: "Ars Paulina", target: "Ars Goetia", value: 3 },
      { source: "Ars Goetia", target: "Ars Theurgia", value: 3 },
      { source: "Ars Theurgia", target: "Ars Almiras", value: 3 },
      { source: "Ars Almiras", target: "Ars Verum", value: 3 },
      { source: "Ars Verum", target: "Ars Ephesia", value: 3 },
      { source: "Ars Ephesia", target: "Ars Fulcanelli", value: 3 },
      { source: "Ars Fulcanelli", target: "Ars Regalis", value: 3 },
      { source: "Ars Regalis", target: "Ars Almadel", value: 3 },

      // Cross-cognitive flows representing high-level synergy pathways
      { source: "Ars Almadel", target: "Ars Verum", value: 5 }, // origin -> evolution
      { source: "Ars Notoria", target: "Ars Ephesia", value: 4 }, // memory -> harmony
      { source: "Ars Paulina", target: "Ars Fulcanelli", value: 4 }, // doubt -> temporal
      { source: "Ars Goetia", target: "Ars Regalis", value: 5 }, // execution -> core
      { source: "Ars Theurgia", target: "Ars Almiras", value: 4 }, // creation -> simulation
    ];

    // Add SVG patterns/definitions for glow effect
    const defs = svg.append("defs");
    
    // Glowing filter
    const glowFilter = defs
      .append("filter")
      .attr("id", "glow")
      .attr("x", "-20%")
      .attr("y", "-20%")
      .attr("width", "140%")
      .attr("height", "140%");

    glowFilter
      .append("feGaussianBlur")
      .attr("stdDeviation", "4")
      .attr("result", "blur");

    glowFilter
      .append("feMerge")
      .selectAll("feMergeNode")
      .data(["blur", "SourceGraphic"])
      .enter()
      .append("feMergeNode")
      .attr("in", (d) => d);

    // Initialize D3 Force Simulation
    const simulation = d3
      .forceSimulation<NetworkNode>(nodes)
      .force(
        "link",
        d3
          .forceLink<NetworkNode, NetworkLink>(links)
          .id((d) => d.id)
          .distance(110)
      )
      .force("charge", d3.forceManyBody().strength(-220))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(32));

    // Render Connections (Links)
    const linkGroup = svg
      .append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "rgba(139, 92, 246, 0.25)")
      .attr("stroke-width", (d) => Math.sqrt(d.value) * 1.5)
      .attr("stroke-dasharray", "4, 4")
      .attr("class", "reputation-flow-line")
      .style("animation", "flow 25s linear infinite");

    // Add CSS stylesheet inside SVG for hardware-accelerated flow animations
    svg.append("style").text(`
      @keyframes flow {
        from { stroke-dashoffset: 200; }
        to { stroke-dashoffset: 0; }
      }
      .reputation-flow-line {
        stroke-dasharray: 6, 4;
        animation: flow 12s linear infinite;
      }
      .pulse-node {
        transition: r 0.2s ease-out, stroke-width 0.2s ease-out;
      }
      .node-text {
        font-family: monospace;
        font-size: 8px;
        fill: #94a3b8;
        pointer-events: none;
        user-select: none;
      }
    `);

    // Drag-and-drop helpers
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Render Nodes Group
    const nodeGroup = svg
      .append("g")
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        onSelectAgent(d.index);
      })
      .call(
        d3
          .drag<any, any>()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    // Node outer glowing/active ring
    nodeGroup
      .append("circle")
      .attr("r", (d) => (d.index === selectedAgentIndex ? 22 : 18))
      .attr("fill", "transparent")
      .attr("stroke", (d) => d.color)
      .attr("stroke-width", (d) => (d.index === selectedAgentIndex ? 2.5 : 1))
      .attr("stroke-opacity", (d) => (d.index === selectedAgentIndex ? 0.9 : 0.4))
      .attr("filter", (d) => (d.index === selectedAgentIndex ? "url(#glow)" : null))
      .attr("class", "pulse-node");

    // Node inner solid core
    nodeGroup
      .append("circle")
      .attr("r", (d) => (d.index === selectedAgentIndex ? 12 : 9))
      .attr("fill", (d) => d.color)
      .attr("fill-opacity", (d) => (d.index === selectedAgentIndex ? 0.95 : 0.7));

    // Dynamic label for Domain/Reputation
    nodeGroup
      .append("text")
      .attr("dy", -26)
      .attr("text-anchor", "middle")
      .attr("class", "node-text font-bold")
      .text((d) => d.name.replace("Ars ", ""));

    nodeGroup
      .append("text")
      .attr("dy", 26)
      .attr("text-anchor", "middle")
      .attr("class", "node-text")
      .text((d) => `${d.reputation.toFixed(1)}%`);

    // Bind simulation update ticks to render coordinates
    simulation.on("tick", () => {
      linkGroup
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      nodeGroup.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    // Cleanup simulation on component unmount
    return () => {
      simulation.stop();
    };
  }, [agents, selectedAgentIndex, onSelectAgent]);

  return (
    <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 space-y-3 relative overflow-hidden animate-fadeIn">
      <div className="flex items-center justify-between border-b border-slate-900 pb-2">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
          <Network className="w-3.5 h-3.5 text-purple-400" />
          Interactive Cognitive Ring Network Map
        </span>
        <span className="text-[8px] text-slate-500 uppercase tracking-widest flex items-center gap-1">
          <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
          D3 force simulation online
        </span>
      </div>

      <div ref={containerRef} className="w-full bg-slate-950/80 rounded-lg overflow-hidden border border-slate-950 flex justify-center items-center relative h-[300px]">
        <svg ref={svgRef} className="w-full h-full block" />
        
        {/* Helper overlay */}
        <div className="absolute bottom-2.5 right-2.5 bg-slate-950/90 border border-slate-900 px-2 py-1 rounded text-[8px] text-slate-500 font-mono pointer-events-none flex items-center gap-1.5 uppercase">
          <Info className="w-3 h-3 text-purple-400" />
          Drag nodes to disrupt force • Click to focus ring
        </div>
      </div>
    </div>
  );
}
