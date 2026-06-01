import React from 'react';
import { IskraNode } from '../types';
import { HelpCircle, FolderOpen, ExternalLink, Link2, BookOpen } from 'lucide-react';

interface EvidenceTraceViewProps {
  nodes: IskraNode[];
  onSelectNode: (nodeId: string | null) => void;
  selectedNodeId: string | null;
}

export default function EvidenceTraceView({ nodes, onSelectNode, selectedNodeId }: EvidenceTraceViewProps) {
  // Group nodes by their evidence file
  const evidenceGroups: Record<string, IskraNode[]> = {};

  nodes.forEach(node => {
    let rawEv = node.evidence || 'Unknown / General Workspace';
    
    // Clean up or categorize evidence
    let category = 'Local / Unknown';
    if (rawEv.toLowerCase().includes('agents.md') || rawEv.toLowerCase().includes('agents')) {
      category = 'AGENTS.md (Kernel Prompt)';
    } else if (rawEv.toLowerCase().includes('github') || rawEv.toLowerCase().includes('iskra.git')) {
      category = 'GitHub Core Repository (SOT40)';
    } else if (rawEv.toLowerCase().includes('supabase') || rawEv.toLowerCase().includes('database') || rawEv.toLowerCase().includes('live')) {
      category = 'Supabase Cloud Database/Engine';
    } else if (rawEv.toLowerCase().includes('package.json') || rawEv.toLowerCase().includes('server.ts') || rawEv.toLowerCase().includes('manifest')) {
      category = 'Workspace Runtime Config / Manifest';
    } else if (rawEv.toLowerCase().includes('adr')) {
      category = 'ADR Architectural Records';
    } else {
      category = rawEv;
    }

    if (!evidenceGroups[category]) {
      evidenceGroups[category] = [];
    }
    evidenceGroups[category].push(node);
  });

  return (
    <div className="flex flex-col h-full bg-slate-900/60 rounded-xl border border-slate-800/60 overflow-hidden font-mono text-xs">
      <div className="p-3 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center select-none shrink-0">
        <div>
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-cyan-400" /> VΩ Evidence Source Trace
          </h2>
          <span className="text-[10px] text-slate-500">Tracing nodes back to GitHub SOT40 and Supabase Schema manifests</span>
        </div>
        <div className="text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
          {Object.keys(evidenceGroups).length} Sources tracked
        </div>
      </div>

      {/* Main trace layout list */}
      <div className="p-4 flex-grow bg-slate-950/20 overflow-y-auto max-h-[480px] space-y-4">
        {Object.keys(evidenceGroups).map((category, idx) => {
          const associatedNodes = evidenceGroups[category];

          return (
            <div key={idx} className="bg-slate-950/45 border border-slate-900/80 rounded-lg p-3.5 hover:border-slate-800/60 transition-all">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-3 select-none">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-cyan-500" />
                  <span className="text-xs font-bold text-slate-200">{category}</span>
                </div>
                <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 border border-slate-800 rounded font-semibold">
                  {associatedNodes.length} Linked Items
                </span>
              </div>

              {/* Grid child nodes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {associatedNodes.map(node => {
                  const isSelected = selectedNodeId === node.id;
                  return (
                    <div
                      key={node.id}
                      onClick={() => onSelectNode(node.id)}
                      className={`p-3 rounded-md border text-left cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected 
                          ? 'bg-indigo-950/35 border-indigo-500/80' 
                          : 'bg-slate-950/60 border-slate-900 hover:border-slate-800 hover:bg-slate-950/90'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[11px] font-bold text-slate-200">{node.title}</span>
                          <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-1 rounded">
                            Ω:{node.depth}
                          </span>
                        </div>
                        <p className="text-[10px] font-sans text-slate-400 leading-snug mb-2 line-clamp-2">
                          {node.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[8px] font-mono text-slate-500 mt-2 pt-2 border-t border-slate-900/60 leading-tight">
                        <span className="truncate max-w-[120px]" title={node.evidence}>
                          Ref: {node.evidence}
                        </span>
                        <span>Confidence: {node.confidence}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {Object.keys(evidenceGroups).length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No tracked evidence paths. Populate the active Canvas with canonical Node data.
          </div>
        )}
      </div>
    </div>
  );
}
