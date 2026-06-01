import React, { useState } from 'react';
import { IskraNode, IskraEdge } from '../types';
import { Search, Filter, ShieldAlert, Edit2, ArrowUpDown } from 'lucide-react';

interface TableViewProps {
  nodes: IskraNode[];
  edges: IskraEdge[];
  onSelectNode: (id: string | null) => void;
  onSelectEdge?: (id: string | null) => void;
  selectedNodeId: string | null;
  selectedEdgeId?: string | null;
  onDeleteNode: (id: string) => void;
}

export default function TableView({
  nodes,
  edges,
  onSelectNode,
  onSelectEdge,
  selectedNodeId,
  selectedEdgeId,
  onDeleteNode
}: TableViewProps) {
  const [activeTab, setActiveTab] = useState<'nodes' | 'edges'>('nodes');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<string>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const nodeTypes = ['ALL', ...Array.from(new Set(nodes.map(n => n.type)))];

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredNodes = nodes
    .filter(node => {
      const matchesSearch = node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.evidence.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = typeFilter === 'ALL' || node.type === typeFilter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let aVal: any = a[sortField as keyof IskraNode] || '';
      let bVal: any = b[sortField as keyof IskraNode] || '';

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const filteredEdges = edges.filter(edge => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    const text = `${edge.summary} ${edge.evidence} ${edge.risk} ${sourceNode?.title || ''} ${targetNode?.title || ''}`;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full bg-slate-900/60 rounded-xl border border-slate-800/60 overflow-hidden font-mono text-xs">
      {/* Controls Bar */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/40 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('nodes')}
            className={`px-3 py-1 rounded-md text-[10.5px] transition-all cursor-pointer ${
              activeTab === 'nodes' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Nodes ({nodes.length})
          </button>
          <button
            onClick={() => setActiveTab('edges')}
            className={`px-3 py-1 rounded-md text-[10.5px] transition-all cursor-pointer ${
              activeTab === 'edges' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Edges ({edges.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="flex flex-grow max-w-md w-full gap-2 items-center">
          <div className="relative flex-grow">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/60 text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-slate-700 text-slate-200"
            />
          </div>

          {activeTab === 'nodes' && (
            <div className="flex items-center gap-1.5 shrink-0 bg-slate-950/40 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-transparent text-[10.5px] outline-none text-slate-300 font-semibold cursor-pointer border-none"
              >
                {nodeTypes.map(t => (
                  <option key={t} value={t} className="bg-slate-950 text-slate-300">{t}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Structured data table */}
      <div className="flex-grow overflow-auto p-2 bg-slate-950/25">
        {activeTab === 'nodes' ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase tracking-wider bg-slate-950/50">
                <th className="p-2.5 cursor-pointer hover:text-slate-300" onClick={() => handleSort('title')}>
                  <div className="flex items-center gap-1">Title <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="p-2.5 cursor-pointer hover:text-slate-300" onClick={() => handleSort('type')}>
                  <div className="flex items-center gap-1">Type <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="p-2.5 cursor-pointer hover:text-slate-300 text-right" onClick={() => handleSort('confidence')}>
                  <div className="flex items-center gap-1 justify-end">Confidence <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="p-2.5">Evidence (D)</th>
                <th className="p-2.5">Next Step</th>
                <th className="p-2.5 text-right">Recall</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {filteredNodes.map(node => {
                const isSelected = selectedNodeId === node.id;
                return (
                  <tr
                    key={node.id}
                    onClick={() => onSelectNode(node.id)}
                    className={`hover:bg-slate-900/40 cursor-pointer transition-colors ${
                      isSelected ? 'bg-indigo-505/10 bg-indigo-950/40 border-l border-indigo-500' : ''
                    }`}
                  >
                    <td className="p-2.5 font-bold text-slate-200">{node.title}</td>
                    <td className="p-2.5">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                        {node.type}
                      </span>
                    </td>
                    <td className="p-2.5 text-right font-bold text-emerald-400">{node.confidence}%</td>
                    <td className="p-2.5 text-slate-400 italic max-w-[150px] truncate">{node.evidence}</td>
                    <td className="p-2.5 text-slate-300 max-w-[180px] truncate">{node.nextAction}</td>
                    <td className="p-2.5 text-right select-none">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Remove node "${node.title}"?`)) {
                            onDeleteNode(node.id);
                          }
                        }}
                        className="text-rose-500 hover:text-rose-400 font-bold hover:bg-slate-900 p-1.5 rounded transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredNodes.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    No nodes match current filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase tracking-wider bg-slate-950/50">
                <th className="p-2.5">Relationship Summary</th>
                <th className="p-2.5">Source Node</th>
                <th className="p-2.5">Target Node</th>
                <th className="p-2.5 text-right">Confidence</th>
                <th className="p-2.5">Evidence (D)</th>
                <th className="p-2.5">Risk Limit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-slate-300">
              {filteredEdges.map(edge => {
                const sourceNode = nodes.find(n => n.id === edge.source);
                const targetNode = nodes.find(n => n.id === edge.target);
                const isSelected = selectedEdgeId === edge.id;

                return (
                  <tr
                    key={edge.id}
                    onClick={() => {
                      if (onSelectEdge) onSelectEdge(edge.id);
                    }}
                    className={`hover:bg-slate-900/40 cursor-pointer transition-colors ${
                      isSelected ? 'bg-indigo-950/40 border-l border-indigo-500 text-indigo-200' : ''
                    }`}
                  >
                    <td className="p-2.5 font-bold text-slate-200">{edge.summary}</td>
                    <td className="p-2.5 text-slate-400">{sourceNode?.title || 'Unknown Source'}</td>
                    <td className="p-2.5 text-slate-400">{targetNode?.title || 'Unknown Target'}</td>
                    <td className="p-2.5 text-right font-bold text-emerald-400">{edge.confidence}%</td>
                    <td className="p-2.5 text-slate-400 italic max-w-[150px] truncate">{edge.evidence}</td>
                    <td className="p-2.5 text-rose-400 max-w-[150px] truncate flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 flex-shrink-0" />
                      {edge.risk}
                    </td>
                  </tr>
                );
              })}
              {filteredEdges.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    No edges listed
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
