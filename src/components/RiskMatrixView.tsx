import React from 'react';
import { IskraNode } from '../types';
import { ShieldAlert, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface RiskMatrixViewProps {
  nodes: IskraNode[];
  onSelectNode: (nodeId: string | null) => void;
  selectedNodeId: string | null;
}

export default function RiskMatrixView({ nodes, onSelectNode, selectedNodeId }: RiskMatrixViewProps) {
  // Convert Node risk rating to Low, Medium, High:
  // Low: No risk described in text, or simple words
  // Medium: Contains standard issues
  // High: Strong risk terms like "Сбой", "Крит", "latency", "drift", "угроза", "огрех"
  const getNodeRiskLevel = (node: IskraNode): 'low' | 'medium' | 'high' => {
    const text = (node.risk || '').toLowerCase();
    if (text.includes('крит') || text.includes('high') || text.includes('severe') || text.includes('опасность') || text.includes('сбой') || text.includes('разсинхр') || text.includes('дрейф')) {
      return 'high';
    }
    if (text.includes('none') || text.includes('нет') || text.includes('stable')) {
      return 'low';
    }
    return 'medium'; // Default
  };

  const getNodeConfidenceLevel = (node: IskraNode): 'low' | 'medium' | 'high' => {
    const val = node.confidence;
    if (val < 50) return 'low';
    if (val < 85) return 'medium';
    return 'high';
  };

  // Classify nodes into a 3x3 array
  const matrixCells: Record<string, IskraNode[]> = {
    'high-low': [], 'high-medium': [], 'high-high': [],
    'medium-low': [], 'medium-medium': [], 'medium-high': [],
    'low-low': [], 'low-medium': [], 'low-high': []
  };

  nodes.forEach(node => {
    const r = getNodeRiskLevel(node);
    const c = getNodeConfidenceLevel(node);
    const key = `${r}-${c}`;
    if (matrixCells[key]) {
      matrixCells[key].push(node);
    }
  });

  const highDriftVulnerabilities = nodes.filter(
    n => getNodeRiskLevel(n) === 'high' && getNodeConfidenceLevel(n) === 'low'
  );

  return (
    <div className="flex flex-col h-full bg-slate-900/60 rounded-xl border border-slate-800/60 overflow-hidden font-mono text-xs">
      <div className="p-3 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center select-none shrink-0">
        <div>
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-500" /> Iskra Canon Risk Matrix
          </h2>
          <span className="text-[10px] text-slate-500">Mapping Hazard Density vs Omega Assurance score</span>
        </div>
        <div className="text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
          Active: {nodes.length} Nodes audited
        </div>
      </div>

      {/* Grid space */}
      <div className="p-4 flex-grow grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-950/20 overflow-y-auto max-h-[480px]">
        {/* Risk Grid mapping: 9 Cells */}
        <div className="md:col-span-8 flex flex-col gap-2">
          {/* Row Headers inside grid */}
          <div className="grid grid-cols-4 text-center text-[9px] font-bold text-slate-500 mb-1">
            <div>Risk Hazard / Confidence</div>
            <div>LOW CONFIDENCE (&lt;50%)</div>
            <div>MED CONFIDENCE (50-85%)</div>
            <div>HIGH CONFIDENCE (&gt;85%)</div>
          </div>

          {/* HIGH RISK ROW */}
          <div className="grid grid-cols-4 gap-2 min-h-[90px]">
            <div className="flex items-center justify-center bg-rose-950/20 text-rose-400 border border-rose-900/30 rounded p-2 text-center text-[9px] font-semibold">
              HIGH RISK / DRASTIC DRIFT
            </div>
            {/* CELL: HIGH - LOW */}
            <div className="bg-red-500/10 hover:bg-red-500/15 border border-red-500/30 rounded p-1.5 overflow-y-auto max-h-[100px] space-y-1">
              {matrixCells['high-low'].map(node => (
                <div
                  key={node.id}
                  onClick={() => onSelectNode(node.id)}
                  className={`p-1 rounded text-[9.5px] truncate cursor-pointer tracking-tight font-sans text-rose-200 border ${
                    selectedNodeId === node.id ? 'bg-red-950 border-red-500' : 'bg-slate-950/80 border-slate-900 hover:border-slate-800'
                  }`}
                >
                  ⚠ {node.title}
                </div>
              ))}
              {matrixCells['high-low'].length === 0 && <span className="text-[9px] text-slate-600 block text-center mt-6">Stable</span>}
            </div>
            {/* CELL: HIGH - MEDIUM */}
            <div className="bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 rounded p-1.5 overflow-y-auto max-h-[100px] space-y-1">
              {matrixCells['high-medium'].map(node => (
                <div
                  key={node.id}
                  onClick={() => onSelectNode(node.id)}
                  className={`p-1 rounded text-[9.5px] truncate cursor-pointer tracking-tight font-sans text-amber-200 border ${
                    selectedNodeId === node.id ? 'bg-amber-950 border-amber-500' : 'bg-slate-950/80 border-slate-900 hover:border-slate-800'
                  }`}
                >
                  {node.title}
                </div>
              ))}
              {matrixCells['high-medium'].length === 0 && <span className="text-[9px] text-slate-600 block text-center mt-6">Empty</span>}
            </div>
            {/* CELL: HIGH - HIGH */}
            <div className="bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded p-1.5 overflow-y-auto max-h-[100px] space-y-1">
              {matrixCells['high-high'].map(node => (
                <div
                  key={node.id}
                  onClick={() => onSelectNode(node.id)}
                  className={`p-1 rounded text-[9.5px] truncate cursor-pointer tracking-tight font-sans text-slate-300 border ${
                    selectedNodeId === node.id ? 'bg-indigo-950 border-indigo-500' : 'bg-slate-950/80 border-slate-900 hover:border-slate-800'
                  }`}
                >
                  {node.title}
                </div>
              ))}
              {matrixCells['high-high'].length === 0 && <span className="text-[9px] text-slate-600 block text-center mt-6">Empty</span>}
            </div>
          </div>

          {/* MEDIUM RISK ROW */}
          <div className="grid grid-cols-4 gap-2 min-h-[90px]">
            <div className="flex items-center justify-center bg-amber-950/15 text-amber-400 border border-amber-900/20 rounded p-2 text-center text-[9px] font-semibold">
              MEDIUM RISK / POTENTIAL DRIFT
            </div>
            {/* CELL: MEDIUM - LOW */}
            <div className="bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 rounded p-1.5 overflow-y-auto max-h-[100px] space-y-1">
              {matrixCells['medium-low'].map(node => (
                <div
                  key={node.id}
                  onClick={() => onSelectNode(node.id)}
                  className={`p-1 rounded text-[9.5px] truncate cursor-pointer tracking-tight font-sans text-slate-300 border ${
                    selectedNodeId === node.id ? 'bg-indigo-950 border-indigo-500' : 'bg-slate-950/80 border-slate-900 hover:border-slate-800'
                  }`}
                >
                  {node.title}
                </div>
              ))}
              {matrixCells['medium-low'].length === 0 && <span className="text-[9px] text-slate-600 block text-center mt-6">Empty</span>}
            </div>
            {/* CELL: MEDIUM - MEDIUM */}
            <div className="bg-slate-900/60 hover:bg-slate-900 border border-slate-850 rounded p-1.5 overflow-y-auto max-h-[100px] space-y-1">
              {matrixCells['medium-medium'].map(node => (
                <div
                  key={node.id}
                  onClick={() => onSelectNode(node.id)}
                  className={`p-1 rounded text-[9.5px] truncate cursor-pointer tracking-tight font-sans text-slate-300 border ${
                    selectedNodeId === node.id ? 'bg-indigo-950 border-indigo-500' : 'bg-slate-950/80 border-slate-900 hover:border-slate-800'
                  }`}
                >
                  {node.title}
                </div>
              ))}
              {matrixCells['medium-medium'].length === 0 && <span className="text-[9px] text-slate-600 block text-center mt-6">Empty</span>}
            </div>
            {/* CELL: MEDIUM - HIGH */}
            <div className="bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded p-1.5 overflow-y-auto max-h-[100px] space-y-1">
              {matrixCells['medium-high'].map(node => (
                <div
                  key={node.id}
                  onClick={() => onSelectNode(node.id)}
                  className={`p-1 rounded text-[9.5px] truncate cursor-pointer tracking-tight font-sans text-slate-400 border ${
                    selectedNodeId === node.id ? 'bg-indigo-950 border-indigo-500' : 'bg-slate-950/80 border-slate-900 hover:border-slate-800'
                  }`}
                >
                  {node.title}
                </div>
              ))}
              {matrixCells['medium-high'].length === 0 && <span className="text-[9px] text-slate-600 block text-center mt-6">Empty</span>}
            </div>
          </div>

          {/* LOW RISK ROW */}
          <div className="grid grid-cols-4 gap-2 min-h-[90px]">
            <div className="flex items-center justify-center bg-emerald-950/10 text-emerald-400 border border-emerald-900/20 rounded p-2 text-center text-[9px] font-semibold">
              LOW RISK / SAFE HAVEN
            </div>
            {/* CELL: LOW - LOW */}
            <div className="bg-slate-900/60 hover:bg-slate-900 border border-slate-850 rounded p-1.5 overflow-y-auto max-h-[100px] space-y-1">
              {matrixCells['low-low'].map(node => (
                <div
                  key={node.id}
                  onClick={() => onSelectNode(node.id)}
                  className={`p-1 rounded text-[9.5px] truncate cursor-pointer tracking-tight font-sans text-slate-400 border ${
                    selectedNodeId === node.id ? 'bg-indigo-950 border-indigo-500' : 'bg-slate-950/80 border-slate-900 hover:border-slate-800'
                  }`}
                >
                  {node.title}
                </div>
              ))}
              {matrixCells['low-low'].length === 0 && <span className="text-[9px] text-slate-600 block text-center mt-6">Empty</span>}
            </div>
            {/* CELL: LOW - MEDIUM */}
            <div className="bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded p-1.5 overflow-y-auto max-h-[100px] space-y-1">
              {matrixCells['low-medium'].map(node => (
                <div
                  key={node.id}
                  onClick={() => onSelectNode(node.id)}
                  className={`p-1 rounded text-[9.5px] truncate cursor-pointer tracking-tight font-sans text-slate-350 border ${
                    selectedNodeId === node.id ? 'bg-indigo-950 border-indigo-500' : 'bg-slate-950/80 border-slate-900 hover:border-slate-800'
                  }`}
                >
                  {node.title}
                </div>
              ))}
              {matrixCells['low-medium'].length === 0 && <span className="text-[9px] text-slate-600 block text-center mt-6">Empty</span>}
            </div>
            {/* CELL: LOW - HIGH */}
            <div className="bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 rounded p-1.5 overflow-y-auto max-h-[100px] space-y-1">
              {matrixCells['low-high'].map(node => (
                <div
                  key={node.id}
                  onClick={() => onSelectNode(node.id)}
                  className={`p-1 rounded text-[9.5px] truncate cursor-pointer tracking-tight font-sans text-slate-200 border ${
                    selectedNodeId === node.id ? 'bg-indigo-950 border-indigo-500' : 'bg-slate-950/80 border-slate-900 hover:border-slate-800'
                  }`}
                >
                  ✔ {node.title}
                </div>
              ))}
              {matrixCells['low-high'].length === 0 && <span className="text-[9px] text-slate-600 block text-center mt-6">Empty</span>}
            </div>
          </div>
        </div>

        {/* Diagnostic side card */}
        <div className="md:col-span-4 bg-slate-950/65 border border-slate-900 rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <span className="text-[9.5px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1">
              <Info className="w-3.5 h-3.5" /> Risk Audit Report
            </span>

            <div className="mt-4 space-y-3.5">
              <div className="bg-slate-900 p-2.5 rounded border border-slate-850">
                <div className="text-[10px] text-slate-500">CRITICAL VULNERABILITIES (Low Confidence + High Risk):</div>
                <div className="text-sm font-bold text-rose-400 mt-1">{highDriftVulnerabilities.length} Nodes detected</div>
                {highDriftVulnerabilities.length > 0 && (
                  <p className="text-[9.5px] text-slate-400 mt-1.5 font-sans leading-relaxed">
                    Эти узлы несут высокий риск рассогласования при низком уровне доверия Ω.7. Рекомендуется поднять их Confidence в инспекторе!
                  </p>
                )}
              </div>

              <div className="bg-slate-900 p-2.5 rounded border border-slate-850">
                <div className="text-[10px] text-slate-500">DRIFT DRILL DIAGNOSIS:</div>
                <p className="text-[9.5px] text-slate-350 mt-1.5 font-sans leading-relaxed">
                  Постоянно увязывайте крайние связи (Edges) между узлами высокой неопределенности и ADR. Так мы снизим общий когнитивный дрейф Искры.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 text-[9.5px] text-slate-600 border-t border-slate-900 pt-3 flex items-center gap-1 leading-snug">
            <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" /> Evaluated automatically vΩ.7.
          </div>
        </div>
      </div>
    </div>
  );
}
