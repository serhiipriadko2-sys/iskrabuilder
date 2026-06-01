import React, { useRef, useState, useEffect } from 'react';
import { IskraNode, IskraEdge } from '../types';
import { PlusCircle, Trash2, Link, Unlink } from 'lucide-react';

interface CanvasGraphProps {
  nodes: IskraNode[];
  edges: IskraEdge[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onUpdateNodeCoordinates: (nodeId: string, x: number, y: number) => void;
  onAddNode: (node: Partial<IskraNode>) => void;
  onAddEdge: (source: string, target: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
}

const TYPE_COLORS: Record<string, { border: string, bg: string, text: string, textBadge: string }> = {
  Canon: { border: 'border-emerald-500/80', bg: 'bg-emerald-950/20', text: 'text-emerald-400', textBadge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/35' },
  RuntimeModule: { border: 'border-cyan-500/80', bg: 'bg-cyan-950/20', text: 'text-cyan-400', textBadge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/35' },
  SupabaseTable: { border: 'border-purple-500/80', bg: 'bg-purple-950/20', text: 'text-purple-400', textBadge: 'bg-purple-500/10 text-purple-400 border-purple-500/35' },
  GitHubFile: { border: 'border-slate-500/80', bg: 'bg-slate-950/20', text: 'text-slate-400', textBadge: 'bg-slate-500/10 text-slate-400 border-slate-500/35' },
  ADR: { border: 'border-amber-500/80', bg: 'bg-amber-950/20', text: 'text-amber-400', textBadge: 'bg-amber-500/10 text-amber-400 border-amber-500/35' },
  Test: { border: 'border-green-500/80', bg: 'bg-green-950/20', text: 'text-green-400', textBadge: 'bg-green-500/10 text-green-400 border-green-500/35' },
  Risk: { border: 'border-rose-500/80', bg: 'bg-rose-950/20', text: 'text-rose-400', textBadge: 'bg-rose-500/10 text-rose-400 border-rose-500/35' },
  OpenLoop: { border: 'border-yellow-500/80', bg: 'bg-yellow-950/20', text: 'text-yellow-400', textBadge: 'bg-yellow-500/10 text-yellow-500/30' },
  Metric: { border: 'border-teal-500/80', bg: 'bg-teal-950/20', text: 'text-teal-400', textBadge: 'bg-teal-500/10 text-teal-400 border-teal-500/35' },
  Voice: { border: 'border-fuchsia-500/80', bg: 'bg-fuchsia-950/20', text: 'text-fuchsia-400', textBadge: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/35' },
  MemoryNode: { border: 'border-indigo-500/80', bg: 'bg-indigo-950/20', text: 'text-indigo-400', textBadge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/35' },
  WhatIf: { border: 'border-violet-500/80', bg: 'bg-violet-950/20', text: 'text-violet-400', textBadge: 'bg-violet-500/10 text-violet-400 border-violet-500/35' },
  ReleaseGate: { border: 'border-pink-500/80', bg: 'bg-pink-950/20', text: 'text-pink-400', textBadge: 'bg-pink-500/10 text-pink-400 border-pink-500/35' },
};

export default function CanvasGraph({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  onUpdateNodeCoordinates,
  onAddNode,
  onAddEdge,
  onDeleteNode,
  onDeleteEdge
}: CanvasGraphProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Adding edge creation state
  const [linkSourceId, setLinkSourceId] = useState<string | null>(null);

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    onSelectNode(nodeId);
    setDraggedNodeId(nodeId);

    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setOffset({
        x: e.clientX - rect.left - node.x,
        y: e.clientY - rect.top - node.y
      });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!draggedNodeId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = Math.round(e.clientX - rect.left - offset.x);
    const newY = Math.round(e.clientY - rect.top - offset.y);

    // Bound coordinates
    const boundedX = Math.max(20, Math.min(rect.width - 210, newX));
    const boundedY = Math.max(20, Math.min(rect.height - 110, newY));

    onUpdateNodeCoordinates(draggedNodeId, boundedX, boundedY);
  };

  const handleCanvasMouseUp = () => {
    setDraggedNodeId(null);
  };

  const handleCanvasDoubleClick = (e: React.MouseEvent) => {
    if (e.target !== canvasRef.current && e.target !== canvasRef.current?.querySelector('svg')) return;
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left - 100);
    const y = Math.round(e.clientY - rect.top - 40);

    // Spark node generation dialogue
    onAddNode({
      title: "New Custom Node",
      type: "Canon",
      description: "Дважды кликните по узлу для редактирования его канонических параметров.",
      x,
      y
    });
  };

  // Helper to draw connecting paths between nodes
  const calculateEdgePath = (sourceId: string, targetId: string) => {
    const s = nodes.find(n => n.id === sourceId);
    const t = nodes.find(n => n.id === targetId);
    if (!s || !t) return { path: '', midX: 0, midY: 0 };

    // Approximation of card center positions
    const sX = s.x + 100;
    const sY = s.y + 45;
    const tX = t.x + 100;
    const tY = t.y + 45;

    const midX = (sX + tX) / 2;
    const midY = (sY + tY) / 2;

    // Elegant curve
    const controlX = midX;
    const controlY = midY;

    return {
      path: `M ${sX} ${sY} Q ${controlX} ${controlY} ${tX} ${tY}`,
      midX,
      midY
    };
  };

  const startCreatingLink = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (linkSourceId === nodeId) {
      setLinkSourceId(null);
    } else if (linkSourceId === null) {
      setLinkSourceId(nodeId);
    } else {
      // Connect
      onAddEdge(linkSourceId, nodeId);
      setLinkSourceId(null);
    }
  };

  return (
    <div id="interactive-diagram-canvas" className="flex flex-col h-full bg-slate-900/60 rounded-xl border border-slate-800/60 overflow-hidden relative">
      {/* Top Controls Overlay */}
      <div className="flex justify-between items-center p-3 border-b border-slate-800/60 bg-slate-950/40 select-none z-10">
        <div>
          <h2 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Iskra Canon Space (Canvas Mode)
          </h2>
          <span className="text-[10px] text-slate-500 font-sans">Double click empty space to deploy customized Node</span>
        </div>

        <div className="flex gap-2 items-center">
          {linkSourceId && (
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded animate-pulse">
              Selecting target to link with...
            </span>
          )}
          <button
            onClick={() => onAddNode({
              title: "What-If Scenario Node",
              type: "WhatIf",
              description: "Оцените влияние нового события на стабильность канона.",
              x: Math.floor(Math.random() * 200) + 150,
              y: Math.floor(Math.random() * 150) + 100
            })}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1 rounded text-[10px] font-mono text-slate-300 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" /> + Node
          </button>
        </div>
      </div>

      {/* Main Draggable Area */}
      <div
        ref={canvasRef}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onDoubleClick={handleCanvasDoubleClick}
        className="flex-grow overflow-hidden relative bg-slate-950/80 cursor-grab active:cursor-grabbing"
        style={{ backgroundImage: 'radial-gradient(ellipse at center, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.9) 100%)' }}
      >
        {/* Cyber technical mesh lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* SVG connectors layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="15" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
            </marker>
          </defs>

          {edges.map((edge) => {
            const { path, midX, midY } = calculateEdgePath(edge.source, edge.target);
            if (!path) return null;

            return (
              <g key={edge.id} className="pointer-events-auto">
                <path
                  d={path}
                  fill="none"
                  stroke="#475569/60"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                  className="hover:stroke-indigo-500/80 hover:stroke-2 cursor-pointer transition-colors"
                  markerEnd="url(#arrow)"
                />
                
                {/* Clickable middle element to view edge or destroy it */}
                <foreignObject x={midX - 35} y={midY - 14} width="70" height="28">
                  <div className="flex items-center justify-center h-full">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteEdge(edge.id);
                      }}
                      title={`Remove link: ${edge.summary}`}
                      className="opacity-20 hover:opacity-150 scale-90 px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-[9px] font-mono text-rose-500 transition-opacity hover:border-rose-900"
                    >
                      Unlink
                    </button>
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>

        {/* Dynamic Absolute positioned Node Elements */}
        {nodes.map((node) => {
          const blockStyle = TYPE_COLORS[node.type] || TYPE_COLORS.Canon;
          const isSelected = selectedNodeId === node.id;

          return (
            <div
              key={node.id}
              style={{ left: `${node.x}px`, top: `${node.y}px` }}
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
              className={`absolute w-[200px] bg-slate-900 border rounded-lg p-2.5 shadow-lg select-none cursor-grab active:cursor-grabbing transition-shadow z-10 ${
                isSelected ? 'ring-2 ring-indigo-500/70 shadow-indigo-500/10 scale-[1.02]' : 'hover:shadow-slate-950/50'
              } ${blockStyle.border}`}
            >
              {/* Header metadata */}
              <div className="flex justify-between items-center mb-1.5">
                <span className={`text-[8.5px] font-mono border px-1.5 py-0.2 rounded ${blockStyle.textBadge}`}>
                  {node.type}
                </span>

                <div className="flex items-center gap-1 opacity-0 hover:opacity-100 duration-200">
                  <button
                    onClick={(e) => startCreatingLink(e, node.id)}
                    title={linkSourceId === node.id ? "Cancel link setup" : "Draw link to other node"}
                    className={`p-0.5 rounded hover:bg-slate-800 ${linkSourceId === node.id ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400'}`}
                  >
                    <Link className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNode(node.id);
                    }}
                    title="Remove this node from canon"
                    className="p-0.5 rounded text-rose-500 hover:bg-slate-800"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Title & description */}
              <h4 className="text-[11px] font-mono font-bold tracking-tight text-slate-100 line-clamp-1">
                {node.title}
              </h4>
              <p className="text-[9.5px] font-sans text-slate-400 mt-1 leading-snug line-clamp-2">
                {node.description}
              </p>

              {/* Visual signature indicators */}
              <div className="flex justify-between items-center mt-2.5 pt-1 border-t border-slate-800/65 text-[8.5px] font-mono text-slate-500">
                <span className="flex items-center gap-0.5 text-emerald-500/80">
                  Ω:{node.depth}
                </span>
                <span className="text-slate-400">
                  {node.confidence}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
