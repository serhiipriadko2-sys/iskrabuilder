import React from 'react';
import { LedgerBlock, IskraNode } from '../types';
import { ShieldCheck, Calendar, Clock, Activity, CornerDownRight } from 'lucide-react';

interface TimelineViewProps {
  ledger: LedgerBlock[];
  nodes: IskraNode[];
  onSelectNode: (nodeId: string | null) => void;
}

export default function TimelineView({ ledger, nodes, onSelectNode }: TimelineViewProps) {
  return (
    <div className="flex flex-col h-full bg-slate-900/60 rounded-xl border border-slate-800/60 overflow-hidden font-mono text-xs">
      {/* Top Header Overlay */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center select-none shrink-0">
        <div>
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            VΩ Canonical Log Timeline
          </h2>
          <span className="text-[10px] text-slate-500">Unveiling sequential delta D-Ω-Λ transformations</span>
        </div>
        <div className="text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
          Logs: {ledger.length} Transactions
        </div>
      </div>

      {/* Timeline Scroll Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-6 bg-slate-950/20 max-h-[450px]">
        {ledger.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            Ledger log remains empty. Initialize app state.
          </div>
        ) : (
          [...ledger].reverse().map((block, index) => {
            const dateObj = new Date(block.timestamp);
            const formattedTime = dateObj.toLocaleTimeString();
            const formattedDate = dateObj.toLocaleDateString();

            // Check if this action corresponds to a node that still exists
            const associatedNode = nodes.find(n => n.id === block.targetId);

            return (
              <div key={block.id} className="relative pl-6 border-l-2 border-slate-800">
                {/* Visual Circle Indicator */}
                <span className="absolute -left-1.5 top-0.5 w-3.5 h-3.5 rounded-full bg-slate-950 border-2 border-emerald-500/80 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </span>

                {/* Cyber Card layout */}
                <div className="bg-slate-950/60 border border-slate-900 rounded-lg p-3 hover:border-slate-800 transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-bold">
                        {block.action}
                      </span>
                      <span className="text-slate-500 text-[10px] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-600" /> {formattedTime} ({formattedDate})
                      </span>
                    </div>

                    <span className="text-[9px] text-slate-600 font-mono tracking-wider">
                      INDEX #{block.id.split('-').pop()}
                    </span>
                  </div>

                  <h4 className="text-[11.5px] font-bold text-slate-100 flex items-center gap-1">
                    {block.targetTitle}
                  </h4>

                  <p className="text-[10px] text-slate-300 bg-slate-950 p-2 border border-slate-900/60 rounded mt-2 leading-relaxed">
                    <span className="text-emerald-500 font-bold mr-1.5">Δ:</span> {block.delta}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-900/40 text-[9.5px] text-slate-400">
                    <div>
                      <span className="text-blue-500 font-bold">Evidence:</span> <span className="italic block truncate text-slate-500">{block.depth}</span>
                    </div>
                    {associatedNode && (
                      <div className="text-right flex items-end justify-end">
                        <button
                          onClick={() => onSelectNode(associatedNode.id)}
                          className="flex items-center gap-1 hover:text-indigo-400 text-slate-400 text-[9px] hover:bg-slate-900 px-1.5 py-0.5 border border-slate-800 rounded transition-colors"
                        >
                          <CornerDownRight className="w-2.5 h-2.5" /> Select Node
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Cryptographic hash chain signatures */}
                  <div className="mt-2 text-[8.5px] font-mono text-slate-600 border-t border-slate-950 pt-1 flex flex-col gap-0.5">
                    <span className="truncate">BLOCK HASH: {block.hash}</span>
                    <span className="truncate">PREV HASH: {block.previousHash}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
