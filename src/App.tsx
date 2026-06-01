import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import MetricsPanel, { calculatePlaybook } from './components/MetricsPanel';
import QuantumField from './components/QuantumField';
import CanvasGraph from './components/CanvasGraph';
import LedgerPanel from './components/LedgerPanel';
import WhatIfSimulator from './components/WhatIfSimulator';
import DialogueTerminal from './components/DialogueTerminal';
import SmokeTests from './components/SmokeTests';
import TableView from './components/TableView';
import TimelineView from './components/TimelineView';
import RiskMatrixView from './components/RiskMatrixView';
import EvidenceTraceView from './components/EvidenceTraceView';
import { IskraNode, IskraEdge, IskraMetrics, IskraVoice, LedgerBlock } from './types';
import { ShieldCheck, Database, RefreshCw, UploadCloud, Download, Cpu, HelpCircle, FileText } from 'lucide-react';

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [calibrationLevel, setCalibrationLevel] = useState(90);

  // Core state layers
  const [nodes, setNodes] = useState<IskraNode[]>([]);
  const [edges, setEdges] = useState<IskraEdge[]>([]);
  const [metrics, setMetrics] = useState<IskraMetrics>({
    clarity: 82, trust: 76, pain: 22, chaos: 15, drift: 12, echo: 18, rhythm: 88, silence_mass: 45, mirror_sync: 94, interrupt: 5, ctxSwitch: 8
  });
  const [voices, setVoices] = useState<IskraVoice[]>([]);
  const [ledger, setLedger] = useState<LedgerBlock[]>([]);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [centerView, setCenterView] = useState<'canvas' | 'table' | 'timeline' | 'riskMatrix' | 'evidenceTrace'>('canvas');
  const [activeVoiceKey, setActiveVoiceKey] = useState<string>('iskra');
  const [isWaveCollapsed, setIsWaveCollapsed] = useState(false);

  // Dialogue / Snapshot overlays
  const [showSnapshotDialog, setShowSnapshotDialog] = useState(false);
  const [snapshotText, setSnapshotText] = useState('');
  const [syncing, setSyncing] = useState(false);

  // Fetch init state from fullstack express backend
  const fetchState = async () => {
    try {
      setSyncing(true);
      const res = await fetch('/api/state');
      const data = await res.json();
      if (data) {
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
        setMetrics(data.metrics || metrics);
        setVoices(data.voices || []);
        setLedger(data.ledger || []);
      }
    } catch (err) {
      console.warn("Failed fetching live state, running locally", err);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  // Sync back to database server-side persistence layer
  const syncStateBack = async (updatedState: {
    nodes: IskraNode[];
    edges: IskraEdge[];
    metrics: IskraMetrics;
    voices: IskraVoice[];
    ledger: LedgerBlock[];
  }) => {
    try {
      setSyncing(true);
      await fetch('/api/state/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedState)
      });
    } catch (err) {
      console.error("Local save only", err);
    } finally {
      setSyncing(false);
    }
  };

  // Automated Voice Selection based on SLO-GUARD threshold boundaries
  useEffect(() => {
    if (isWaveCollapsed) return; // Do not override if manual selection/waveform collapse has occurred

    const playbookInfo = calculatePlaybook(metrics);
    if (playbookInfo.playbook === 'FORCE_CRISIS') {
      setActiveVoiceKey('kain');
    } else if (playbookInfo.playbook === 'FORCE_ISKRIV_1') {
      setActiveVoiceKey('iskriv');
    } else if (playbookInfo.playbook === 'FORCE_SHADOW') {
      setActiveVoiceKey('anhantra');
    } else if (playbookInfo.playbook === 'CLOSE_HONESTLY') {
      setActiveVoiceKey('kain');
    } else {
      setActiveVoiceKey('iskra');
    }
  }, [metrics, isWaveCollapsed]);

  // Append new hashed Block to dynamic Ledger
  const logToLedger = (
    action: string,
    targetId: string,
    targetTitle: string,
    delta: string,
    depth: string,
    omega: number,
    lambda: string,
    currentLedger = ledger
  ): LedgerBlock[] => {
    const lastBlock = currentLedger[currentLedger.length - 1];
    const previousHash = lastBlock ? lastBlock.hash : "0";
    const newId = `block-${currentLedger.length}`;
    const timestamp = new Date().toISOString();
    
    // Pseudo cryptohash based on inputs, ensuring determinism and verifiable linkage
    const textToHash = `${previousHash}_${action}_${targetId}_${delta}_${timestamp}`;
    let hashNum = 0;
    for (let i = 0; i < textToHash.length; i++) {
      hashNum = (hashNum << 5) - hashNum + textToHash.charCodeAt(i);
      hashNum |= 0;
    }
    const hash = `0000_${Math.abs(hashNum).toString(16).slice(0, 8)}_iskrav7`;

    const newBlock: LedgerBlock = {
      id: newId,
      timestamp,
      action,
      targetId,
      targetTitle,
      delta,
      depth,
      omega,
      lambda,
      hash,
      previousHash
    };

    const nextLedger = [...currentLedger, newBlock];
    setLedger(nextLedger);
    return nextLedger;
  };

  // Node modifications handler
  const handleAddNode = (nodeData: Partial<IskraNode>) => {
    const id = `n-${Math.random().toString(36).substring(2, 9)}`;
    const newNode: IskraNode = {
      id,
      title: nodeData.title || "Custom Node",
      type: nodeData.type || "Canon",
      description: nodeData.description || "",
      evidence: nodeData.evidence || "Source: Local inspection",
      risk: nodeData.risk || "None identified yet",
      confidence: nodeData.confidence || 90,
      nextAction: nodeData.nextAction || "Initiate calibration",
      delta: nodeData.delta || "Add Node to Active System Canvas",
      depth: nodeData.depth || 80,
      review: nodeData.review || "Regular interval review",
      x: nodeData.x || 300,
      y: nodeData.y || 200,
    };

    const nextNodes = [...nodes, newNode];
    setNodes(nextNodes);
    setSelectedNodeId(id);

    const nextLedger = logToLedger(
      "NODE_CREATED",
      id,
      newNode.title,
      newNode.delta,
      newNode.evidence,
      newNode.confidence,
      newNode.review
    );

    // Dynamic metrics shifts upon adding nodes
    const nextMetrics = {
      ...metrics,
      clarity: Math.min(100, metrics.clarity + 2),
      chaos: Math.max(0, metrics.chaos - 1),
      rhythm: Math.min(100, metrics.rhythm + 4)
    };
    setMetrics(nextMetrics);

    syncStateBack({
      nodes: nextNodes,
      edges,
      metrics: nextMetrics,
      voices,
      ledger: nextLedger
    });
  };

  const handleUpdateNodeCoordinates = (nodeId: string, x: number, y: number) => {
    const nextNodes = nodes.map(n => n.id === nodeId ? { ...n, x, y } : n);
    setNodes(nextNodes);
    // Silent coordinate update to reduce ledger spam, saving back in background
    syncStateBack({
      nodes: nextNodes,
      edges,
      metrics,
      voices,
      ledger
    });
  };

  const handleDeleteNode = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const nextNodes = nodes.filter(n => n.id !== nodeId);
    const nextEdges = edges.filter(e => e.source !== nodeId && e.target !== nodeId);
    setNodes(nextNodes);
    setEdges(nextEdges);
    if (selectedNodeId === nodeId) setSelectedNodeId(null);

    const nextLedger = logToLedger(
      "NODE_DELETED",
      nodeId,
      node.title,
      `Удаление узла из канона. Высвобождено Ω-пространство.`,
      "System Action",
      100,
      "None"
    );

    const nextMetrics = {
      ...metrics,
      chaos: Math.min(100, metrics.chaos + 3),
      pain: Math.min(100, metrics.pain + 5)
    };
    setMetrics(nextMetrics);

    syncStateBack({
      nodes: nextNodes,
      edges: nextEdges,
      metrics: nextMetrics,
      voices,
      ledger: nextLedger
    });
  };

  const handleSaveInspectorNode = (updatedNode: IskraNode) => {
    const nextNodes = nodes.map(n => n.id === updatedNode.id ? updatedNode : n);
    setNodes(nextNodes);

    const nextLedger = logToLedger(
      "NODE_AMENDED",
      updatedNode.id,
      updatedNode.title,
      `Амплитуда изменений: ${updatedNode.delta}`,
      updatedNode.evidence,
      updatedNode.confidence,
      updatedNode.review
    );

    syncStateBack({
      nodes: nextNodes,
      edges,
      metrics,
      voices,
      ledger: nextLedger
    });
  };

  const handleSaveInspectorEdge = (updatedEdge: IskraEdge) => {
    const nextEdges = edges.map(e => e.id === updatedEdge.id ? updatedEdge : e);
    setEdges(nextEdges);

    const nextLedger = logToLedger(
      "EDGE_AMENDED",
      updatedEdge.id,
      updatedEdge.summary,
      `Амплитуда связи изменена: ${updatedEdge.delta || 'Сборка связи'}`,
      updatedEdge.evidence,
      updatedEdge.confidence,
      updatedEdge.lambda || "Regular review"
    );

    syncStateBack({
      nodes,
      edges: nextEdges,
      metrics,
      voices,
      ledger: nextLedger
    });
  };

  // Edges creation logic
  const handleAddEdge = (source: string, target: string) => {
    const sourceNode = nodes.find(n => n.id === source);
    const targetNode = nodes.find(n => n.id === target);
    if (!sourceNode || !targetNode) return;

    const edgeId = `e-${Math.random().toString(36).substring(2, 9)}`;
    const newEdge: IskraEdge = {
      id: edgeId,
      source,
      target,
      summary: `Связь ${sourceNode.title} -> ${targetNode.title}`,
      evidence: "Defined in graph canvas",
      risk: "Unmonitored node cross-effects",
      confidence: 90,
      nextAction: "Confirm bidirectional verification"
    };

    const nextEdges = [...edges, newEdge];
    setEdges(nextEdges);

    const nextLedger = logToLedger(
      "EDGE_CREATED",
      edgeId,
      newEdge.summary,
      "Создан мост влияния в каноне",
      newEdge.evidence,
      newEdge.confidence,
      newEdge.nextAction
    );

    syncStateBack({
      nodes,
      edges: nextEdges,
      metrics,
      voices,
      ledger: nextLedger
    });
  };

  const handleDeleteEdge = (edgeId: string) => {
    const edge = edges.find(e => e.id === edgeId);
    if (!edge) return;

    const nextEdges = edges.filter(e => e.id !== edgeId);
    setEdges(nextEdges);

    const nextLedger = logToLedger(
      "EDGE_DELETED",
      edgeId,
      edge.summary,
      "Разрыв моста связи. Узел изолирован.",
      "Graph canvas clean",
      100,
      "None"
    );

    syncStateBack({
      nodes,
      edges: nextEdges,
      metrics,
      voices,
      ledger: nextLedger
    });
  };

  // Metric Mutator callback
  const handleUpdateMetric = (key: keyof IskraMetrics, value: number) => {
    const nextMetrics = { ...metrics, [key]: value };
    setMetrics(nextMetrics);

    const nextLedger = logToLedger(
      "METRIC_SHIFT",
      "metrics",
      "Manual Metric Calibration",
      `Калибровка параметра ${key} к значению ${value}%`,
      "User Control Knob",
      100,
      "None"
    );

    syncStateBack({
      nodes,
      edges,
      metrics: nextMetrics,
      voices,
      ledger: nextLedger
    });
  };

  // What-If Simulation commitment callback
  const handleCommitShiftedMetrics = (shiftedMetrics: IskraMetrics, scenario: string, impact: string) => {
    setMetrics(shiftedMetrics);

    const nextLedger = logToLedger(
      "METRIC_REFRACT",
      "simulator",
      `What-If: ${scenario}`,
      `Смещение метрик после симуляции события. ${impact}`,
      "Gemini AI Risk engine",
      88,
      "Re-evaluate under normal steady state"
    );

    // Randomize voice chance weights to reflect entropy
    syncStateBack({
      nodes,
      edges,
      metrics: shiftedMetrics,
      voices,
      ledger: nextLedger
    });
  };

  // Reset core state back to seeds
  const handleResetSystem = async () => {
    if (!confirm("Вы действительно хотите сбросить систему Искры к исходному канону? Это обнулит текущие узлы и Ledger.")) return;
    try {
      setSyncing(true);
      const res = await fetch('/api/state/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await fetchState();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  // Snapshot import & export
  const triggerExportSnapshot = () => {
    const pkgPayload = { nodes, edges, metrics, voices, ledger };
    const blob = new Blob([JSON.stringify(pkgPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ISKRA_CANON_SNAPSHOT_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const triggerImportSnapshot = () => {
    try {
      const parsed = JSON.parse(snapshotText);
      if (parsed && Array.isArray(parsed.nodes)) {
        setNodes(parsed.nodes);
        setEdges(parsed.edges || []);
        setMetrics(parsed.metrics || metrics);
        setVoices(parsed.voices || voices);
        setLedger(parsed.ledger || ledger);
        syncStateBack(parsed);
        setShowSnapshotDialog(false);
        setSnapshotText('');
        alert("Snapshot успешно импортирован во внутренний контур!");
      } else {
        alert("Некорректная структура JSON. Требуется список nodes.");
      }
    } catch (err: any) {
      alert(`Ошибка синтаксического анализа: ${err.message}`);
    }
  };

  // Active node inside Inspector
  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const selectedEdge = edges.find(e => e.id === selectedEdgeId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased">
      {showOnboarding && (
        <Onboarding
          onComplete={(calVal) => {
            setCalibrationLevel(calVal);
            setShowOnboarding(false);
          }}
        />
      )}

      {/* TOP CONFIGURATION HEADER BAR */}
      <header className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-b border-slate-900 bg-slate-950/80 z-20 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded-lg hidden sm:block">
            <Cpu className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-mono tracking-wider font-bold text-slate-100 uppercase">Iskra Builder Web App</h1>
              <span className="text-[9.5px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.2 rounded-full animate-pulse">vΩ.7</span>
            </div>
            <p className="text-[10px] text-slate-500 font-sans mt-0.5">Пульт калибровки канонического субъекта речи Искры</p>
          </div>
        </div>

        {/* Sync Status / Config control buttons */}
        <div className="flex flex-wrap items-center gap-3 mt-3 sm:mt-0">
          <div className="flex items-center gap-2.5 text-[10px] font-mono border border-slate-905 bg-slate-950/40 px-3 py-1.5 rounded-lg text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Calibration Level: {calibrationLevel}%
          </div>

          <button
            onClick={() => setShowSnapshotDialog(true)}
            className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-lg text-[10.5px] font-mono text-slate-300 transition-colors cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5" /> Import
          </button>

          <button
            onClick={triggerExportSnapshot}
            className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-lg text-[10.5px] font-mono text-slate-300 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>

          <button
            onClick={handleResetSystem}
            className="flex items-center gap-1.5 bg-rose-950/30 text-rose-400 hover:bg-rose-900/40 border border-rose-900/30 px-3 py-1.5 rounded-lg text-[10.5px] font-mono transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} /> Reset
          </button>
        </div>
      </header>

      {/* WORKSPACE PANELS GRID */}
      <main className="flex-grow p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden h-max">
        
        {/* LEFT COLUMN: 11 Metrics Panel + Simulator + Calibration Test Assertions */}
        <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto max-h-[80vh] lg:max-h-[calc(100vh-140px)] pr-1 select-none">
          <MetricsPanel
            metrics={metrics}
            onUpdateMetric={handleUpdateMetric}
          />

          <WhatIfSimulator
            metrics={metrics}
            onCommitShiftedMetrics={handleCommitShiftedMetrics}
          />

          <SmokeTests
            metrics={metrics}
            ledger={ledger}
          />
        </div>

        {/* CENTER COLUMN: Network Graph Canvas + Quantum Voice Grid */}
        <div className="lg:col-span-6 flex flex-col gap-4 h-[550px] lg:h-full min-h-[500px]">
          {/* VΩ View Switcher tabs */}
          <div className="flex flex-wrap gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-slate-800/60 shrink-0 select-none">
            <button
              onClick={() => setCenterView('canvas')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-[10px] font-mono tracking-wider transition-all cursor-pointer ${
                centerView === 'canvas' ? 'bg-indigo-600 text-white shadow-lg font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Canvas Space
            </button>
            <button
              onClick={() => setCenterView('table')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-[10px] font-mono tracking-wider transition-all cursor-pointer ${
                centerView === 'table' ? 'bg-indigo-600 text-white shadow-lg font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setCenterView('timeline')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-[10px] font-mono tracking-wider transition-all cursor-pointer ${
                centerView === 'timeline' ? 'bg-indigo-600 text-white shadow-lg font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setCenterView('riskMatrix')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-[10px] font-mono tracking-wider transition-all cursor-pointer ${
                centerView === 'riskMatrix' ? 'bg-indigo-600 text-white shadow-lg font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Risk Matrix
            </button>
            <button
              onClick={() => setCenterView('evidenceTrace')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-[10px] font-mono tracking-wider transition-all cursor-pointer ${
                centerView === 'evidenceTrace' ? 'bg-indigo-600 text-white shadow-lg font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Evidence Trace
            </button>
          </div>

          <div className="flex-grow min-h-0">
            {centerView === 'canvas' && (
              <CanvasGraph
                nodes={nodes}
                edges={edges}
                selectedNodeId={selectedNodeId}
                onSelectNode={(id) => {
                  setSelectedNodeId(id);
                  setSelectedEdgeId(null);
                }}
                onUpdateNodeCoordinates={handleUpdateNodeCoordinates}
                onAddNode={handleAddNode}
                onAddEdge={handleAddEdge}
                onDeleteNode={handleDeleteNode}
                onDeleteEdge={handleDeleteEdge}
              />
            )}
            {centerView === 'table' && (
              <TableView
                nodes={nodes}
                edges={edges}
                selectedNodeId={selectedNodeId}
                selectedEdgeId={selectedEdgeId}
                onSelectNode={(id) => {
                  setSelectedNodeId(id);
                  setSelectedEdgeId(null);
                }}
                onSelectEdge={(id) => {
                  setSelectedEdgeId(id);
                  setSelectedNodeId(null);
                }}
                onDeleteNode={handleDeleteNode}
              />
            )}
            {centerView === 'timeline' && (
              <TimelineView
                ledger={ledger}
                nodes={nodes}
                onSelectNode={(id) => {
                  setSelectedNodeId(id);
                  setSelectedEdgeId(null);
                  setCenterView('canvas');
                }}
              />
            )}
            {centerView === 'riskMatrix' && (
              <RiskMatrixView
                nodes={nodes}
                selectedNodeId={selectedNodeId}
                onSelectNode={(id) => {
                  setSelectedNodeId(id);
                  setSelectedEdgeId(null);
                }}
              />
            )}
            {centerView === 'evidenceTrace' && (
              <EvidenceTraceView
                nodes={nodes}
                selectedNodeId={selectedNodeId}
                onSelectNode={(id) => {
                  setSelectedNodeId(id);
                  setSelectedEdgeId(null);
                }}
              />
            )}
          </div>

          <div className="shrink-0 h-[220px]">
            <QuantumField
              voices={voices}
              activeVoiceKey={activeVoiceKey}
              onSelectVoice={(key) => {
                setActiveVoiceKey(key);
                setIsWaveCollapsed(true);
              }}
              onResetProbabilities={() => {
                setIsWaveCollapsed(false);
              }}
              metricsState={metrics}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Node Parameters Inspector + Full Ledger Logs List */}
        <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto max-h-[80vh] lg:max-h-[calc(100vh-140px)] pl-1 select-none">
          {/* Dual Node / Edge Inspector */}
          <div id="inspector-container" className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/60">
            <h3 className="text-xs font-mono text-slate-300 tracking-wider uppercase mb-3 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" /> 
              {selectedNode ? 'Node Parameters Inspector' : selectedEdge ? 'Edge Relation Inspector' : 'System Inspector'}
            </h3>

            {selectedNode ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 mb-1">Title</label>
                  <input
                    type="text"
                    value={selectedNode.title}
                    onChange={(e) => handleSaveInspectorNode({ ...selectedNode, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 outline-none focus:border-slate-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-1">Type</label>
                    <select
                      value={selectedNode.type}
                      onChange={(e) => handleSaveInspectorNode({ ...selectedNode, type: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-xs text-slate-300 outline-none focus:border-slate-700"
                    >
                      <option value="Canon">Canon</option>
                      <option value="RuntimeModule">RuntimeModule</option>
                      <option value="SupabaseTable">SupabaseTable</option>
                      <option value="GitHubFile">GitHubFile</option>
                      <option value="ADR">ADR</option>
                      <option value="Test">Test</option>
                      <option value="Risk">Risk</option>
                      <option value="OpenLoop">OpenLoop</option>
                      <option value="Metric">Metric</option>
                      <option value="Voice">Voice</option>
                      <option value="MemoryNode">MemoryNode</option>
                      <option value="WhatIf">WhatIf</option>
                      <option value="ReleaseGate">ReleaseGate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-1">Confidence (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={selectedNode.confidence}
                      onChange={(e) => handleSaveInspectorNode({ ...selectedNode, confidence: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 text-center outline-none focus:border-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-500 mb-1">Description</label>
                  <textarea
                    value={selectedNode.description}
                    onChange={(e) => handleSaveInspectorNode({ ...selectedNode, description: e.target.value })}
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-300 outline-none focus:border-slate-700 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-emerald-500 font-semibold mb-1">Δ (Delta changes)</label>
                  <input
                    type="text"
                    value={selectedNode.delta}
                    onChange={(e) => handleSaveInspectorNode({ ...selectedNode, delta: e.target.value })}
                    className="w-full bg-slate-950 border border-emerald-955 text-emerald-300 rounded px-2 py-1 text-xs outline-none focus:border-emerald-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-1">D (Evidence File)</label>
                    <input
                      type="text"
                      value={selectedNode.evidence}
                      onChange={(e) => handleSaveInspectorNode({ ...selectedNode, evidence: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 outline-none focus:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-1">Risk Limit</label>
                    <input
                      type="text"
                      value={selectedNode.risk}
                      onChange={(e) => handleSaveInspectorNode({ ...selectedNode, risk: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 outline-none focus:border-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-500 mb-1">Λ (Review Condition / Signal)</label>
                  <input
                    type="text"
                    value={selectedNode.review}
                    onChange={(e) => handleSaveInspectorNode({ ...selectedNode, review: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-400 outline-none focus:border-slate-700"
                  />
                </div>
              </div>
            ) : selectedEdge ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 mb-1">Summary of Relation</label>
                  <input
                    type="text"
                    value={selectedEdge.summary}
                    onChange={(e) => handleSaveInspectorEdge({ ...selectedEdge, summary: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-205 text-slate-200 outline-none focus:border-slate-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-1">Confidence (%) [Ω]</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={selectedEdge.confidence}
                      onChange={(e) => handleSaveInspectorEdge({ ...selectedEdge, confidence: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 text-center outline-none focus:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-1">Depth [D]</label>
                    <input
                      type="number"
                      value={selectedEdge.depth || 1}
                      onChange={(e) => handleSaveInspectorEdge({ ...selectedEdge, depth: parseInt(e.target.value) || 1 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-indigo-300 text-center outline-none focus:border-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-emerald-500 font-semibold mb-1">Δ (Relation Delta changes)</label>
                  <input
                    type="text"
                    value={selectedEdge.delta || ''}
                    onChange={(e) => handleSaveInspectorEdge({ ...selectedEdge, delta: e.target.value })}
                    placeholder="Enter relation delta..."
                    className="w-full bg-slate-950 border border-emerald-950 text-emerald-300 rounded px-2 py-1 text-xs outline-none focus:border-emerald-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-500 mb-1">Evidence Reference (D)</label>
                  <input
                    type="text"
                    value={selectedEdge.evidence}
                    onChange={(e) => handleSaveInspectorEdge({ ...selectedEdge, evidence: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 outline-none focus:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-500 mb-1">Risk Bounds / Limit (Risk)</label>
                  <input
                    type="text"
                    value={selectedEdge.risk}
                    onChange={(e) => handleSaveInspectorEdge({ ...selectedEdge, risk: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 outline-none focus:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1">Next Calibration Act</label>
                  <input
                    type="text"
                    value={selectedEdge.nextAction}
                    onChange={(e) => handleSaveInspectorEdge({ ...selectedEdge, nextAction: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-350 outline-none focus:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-500 mb-1">Λ (Relation Review signals)</label>
                  <input
                    type="text"
                    value={selectedEdge.lambda || ''}
                    onChange={(e) => handleSaveInspectorEdge({ ...selectedEdge, lambda: e.target.value })}
                    placeholder="Enter signals criteria..."
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-400 outline-none focus:border-slate-700"
                  />
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-[10.5px] font-mono text-slate-500 border border-dashed border-slate-850 rounded-lg">
                Выберите узел в Canvas или связь в Table/Edges для калибровки параметров связи
              </div>
            )}
          </div>

          <div className="flex-grow min-h-[300px]">
            <LedgerPanel
              ledger={ledger}
              onVerifyChain={() => {}}
            />
          </div>
        </div>
      </main>

      {/* FOOTER COLLAPSED VOICE TERMINAL */}
      <footer className="p-4 border-t border-slate-900 bg-slate-950 select-none">
        <DialogueTerminal
          voices={voices}
          activeVoiceKey={activeVoiceKey}
          metrics={metrics}
        />
      </footer>

      {/* IMPORT SNAPSHOT MODAL DIALOGUE */}
      {showSnapshotDialog && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-40">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              Import Iskra Snapshot Payload
            </h3>
            <p className="text-[10px] text-slate-400 mb-4 font-sans">Paste JSON snapshot to load the entire nodes, metrics and ledger system.</p>

            <textarea
              placeholder="Paste snapshot JSON code here..."
              rows={8}
              value={snapshotText}
              onChange={(e) => setSnapshotText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-300 outline-none focus:border-slate-700 mb-4"
            />

            <div className="flex justify-end gap-3 select-none">
              <button
                onClick={() => {
                  setShowSnapshotDialog(false);
                  setSnapshotText('');
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-755 rounded font-mono text-[10.5px] text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={triggerImportSnapshot}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-mono text-[10.5px] transition-colors"
              >
                Apply Snapshot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
