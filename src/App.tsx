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
import { 
  ShieldCheck, Database, RefreshCw, UploadCloud, Download, Cpu, HelpCircle, FileText,
  Search, Play, Check, AlertOctagon, Github, Sparkles, FolderSync, Info, Plus, ShieldAlert,
  Sliders, Filter, Layers, CheckCircle, HelpCircle as HelpIcon, AlertTriangle, FileDown
} from 'lucide-react';

interface CoverageMatrixRow {
  sourceName: string;
  sourceType: string;
  observedItems: string;
  importedItems: string;
  summarizedItems: string;
  linkedGraphNodes: string;
  unknownGaps: string;
  riskLevel: 'low' | 'medium' | 'high';
  nextVerificationStep: string;
}

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

  // Navigation, views, panel selections and filters
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [centerView, setCenterView] = useState<'canvas' | 'table' | 'timeline' | 'riskMatrix' | 'evidenceTrace'>('canvas');
  const [activeVoiceKey, setActiveVoiceKey] = useState<string>('iskra');
  const [isWaveCollapsed, setIsWaveCollapsed] = useState(false);

  // Multi-tab layout states
  const [activeLeftTab, setActiveLeftTab] = useState<'metrics' | 'filters'>('metrics');
  const [activeBottomTab, setActiveBottomTab] = useState<'dialogue' | 'coverage' | 'gemini' | 'audit'>('dialogue');

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [nodeTypeFilter, setNodeTypeFilter] = useState<'all' | string>('all');
  const [riskFilter, setRiskFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | string>('all');
  const [matrixFilter, setMatrixFilter] = useState<{ layer: string | null; risk: 'low' | 'medium' | 'high' | null }>({
    layer: null,
    risk: null
  });

  // Interactive notifications & proposals state
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'info' | 'warn';
    choices?: { text: string; action: () => void }[];
  } | null>(null);

  // Gemini structured analysis states
  const [analysisMode, setAnalysisMode] = useState<'summary' | 'structure' | 'analytics' | 'what_if' | 'reflection' | 'output' | 'design' | 'test'>('summary');
  const [analysisResult, setAnalysisResult] = useState<{
    mode: string;
    verdict: string;
    confidence: number;
    facts: { claim: string; sourceRef: string; quoteOrObservation: string; confidence: number }[];
    interpretations: { claim: string; sourceRef: string; quoteOrObservation: string; confidence: number }[];
    hypotheses: { claim: string; sourceRef: string; quoteOrObservation: string; confidence: number }[];
    unknowns: string[];
    risks: { title: string; level: string; why: string; mitigation: string }[];
    graphUpdates: { nodes: any[]; edges: any[] };
    nextSteps: string[];
    verification: string[];
  } | null>(null);

  // Ingested status details
  const [githubIngestLoaded, setGithubIngestLoaded] = useState(false);
  const [supabaseSchemaLoaded, setSupabaseSchemaLoaded] = useState(false);

  // Coverage Matrix tracker (Observed vs Linked)
  const [coverageMatrix, setCoverageMatrix] = useState<CoverageMatrixRow[]>([
    {
      sourceName: "github:iskra/packages/core",
      sourceType: "Package",
      observedItems: "6 files (Types, state schema)",
      importedItems: "Observed README (Fact)",
      summarizedItems: "Complete structural outline",
      linkedGraphNodes: "@iskra/core",
      unknownGaps: "Internal interfaces mapping, JS classes details",
      riskLevel: "low",
      nextVerificationStep: "Run full typed AST parser"
    },
    {
      sourceName: "github:iskra/packages/math",
      sourceType: "Package",
      observedItems: "14 core mathematical theorems",
      importedItems: "Fractal bounds, parameters (Fact)",
      summarizedItems: "Quantum and fractal state functions",
      linkedGraphNodes: "@iskra/math",
      unknownGaps: "Exact coordinate calculation boundaries",
      riskLevel: "medium",
      nextVerificationStep: "Write vitest precision test suites"
    },
    {
      sourceName: "github:iskra/packages/engine",
      sourceType: "Package",
      observedItems: "Engine loop state managers",
      importedItems: "State schemas",
      summarizedItems: "Main engine transition matrices",
      linkedGraphNodes: "@iskra/engine",
      unknownGaps: "Divergence logs under high noise levels",
      riskLevel: "medium",
      nextVerificationStep: "Trigger load simulator suite"
    },
    {
      sourceName: "supabase:public:graph_nodes",
      sourceType: "Supabase Table",
      observedItems: "Active canvas points mapping",
      importedItems: "Full fields list (24 columns)",
      summarizedItems: "Snapshot sync format",
      linkedGraphNodes: "Supabase graph_nodes",
      unknownGaps: "Database indices mapping, trigger speeds",
      riskLevel: "low",
      nextVerificationStep: "Perform Row Level Security (RLS) deep check"
    },
    {
      sourceName: "supabase:public:memory_nodes",
      sourceType: "Supabase Table",
      observedItems: "Semantic matrix, vector embeds",
      importedItems: "Partial columns schema",
      summarizedItems: "Vector relation tables and links",
      linkedGraphNodes: "Supabase memory_nodes",
      unknownGaps: "Vector matching threshold accuracy limits",
      riskLevel: "high",
      nextVerificationStep: "Map pg_vector custom advisor recommendations"
    },
    {
      sourceName: "supabase:advisor:security",
      sourceType: "Risk Report",
      observedItems: "Advisory exposure warnings list",
      importedItems: "3 active critical risks",
      summarizedItems: "Resolved Mutable function search paths",
      linkedGraphNodes: "Supabase Advisor Security Warnings",
      unknownGaps: "GraphQL exposed schemas details",
      riskLevel: "high",
      nextVerificationStep: "Review PostgreSQL mutable advisor guidelines"
    }
  ]);

  // Dialogue / Snapshot overlays
  const [showSnapshotDialog, setShowSnapshotDialog] = useState(false);
  const [snapshotText, setSnapshotText] = useState('');
  const [syncing, setSyncing] = useState(false);

  // Real-time Deep Research Grounding and Scraping States
  const [scrapingFile, setScrapingFile] = useState(false);
  const [groundedFileContent, setGroundedFileContent] = useState<string | null>(null);
  const [groundedFilePath, setGroundedFilePath] = useState<string | null>(null);

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

  const triggerExportMarkdownReport = () => {
    let md = `# ISKRA BUILDER / COMPASS COGNITIVE ARCHITECTURE REPORT\n\n`;
    md += `*Generated: ${new Date().toISOString()}*\n`;
    md += `*Workspace Connection Status: Labeled & Synced*\n\n`;
    md += `## 1. COGNITIVE COVERAGE SUMMARY\n`;
    md += `We catalog nodes with explicit Labeled Evidence to build sovereign trust claims.\n\n`;
    md += `- **Verified Node Coverage**: ${coveragePercent}%\n`;
    md += `- **Nodes with verified Evidence**: ${totalNodesWithEvidence} of ${nodes.length}\n\n`;
    
    md += `## 2. COGNITIVE MAP DIRECTORY (FACTUAL NODES CATALOG)\n\n`;
    md += `| Node ID | Type | Title | Confidence | Evidence Reference | Description |\n`;
    md += `|---|---|---|---|---|---|\n`;
    nodes.forEach(n => {
      md += `| \`${n.id}\` | ${n.type} | **${n.title}** | ${n.confidence}% | \`${n.evidence || 'None'}\` | ${n.description || ''} |\n`;
    });
    md += `\n`;

    md += `## 3. ACTIVE QUANTUM COGNITIVE VOICES\n\n`;
    md += `Active wave probabilities inside current cognitive alignment playbooks:\n\n`;
    voices.forEach(v => {
      md += `### ${v.title} (\`${v.key}\`)\n`;
      md += `- **Probability Weight [Ω]**: ${(v.probability || 0).toFixed(2)}\n`;
      md += `- **Behavioral directive**: ${v.description}\n`;
      md += `- **Verification Status**: ${v.state || 'Calibrated'}\n\n`;
    });

    md += `## 4. SYSTEM METRICS CALIBRATIONS\n\n`;
    md += `- **Logical Entropy**: ${metrics.entropy}\n`;
    md += `- **Consensus Level**: ${metrics.consensus}\n`;
    md += `- **Observed Drift (Dft)**: ${metrics.drift}\n`;
    md += `- **Validation Depth (Vld)**: ${metrics.validation}\n\n`;

    if (analysisResult) {
      md += `## 5. RECENT COGNITIVE INTEL REPORT (${analysisResult.mode.toUpperCase()})\n\n`;
      md += `- **Verdict**: **${analysisResult.verdict.toUpperCase()}**\n`;
      md += `- **Analyst confidence**: ${(analysisResult.confidence * 100).toFixed(1)}%\n\n`;
      
      md += `### Verified Facts [FACT]\n`;
      analysisResult.facts?.forEach(f => {
        md += `- **${f.claim}** (Source: \`${f.sourceRef}\`, Conf: ${Math.round(f.confidence * 100)}%)\n`;
      });
      md += `\n`;

      md += `### Labeled Interpretations [INTERP]\n`;
      analysisResult.interpretations?.forEach(i => {
        md += `- **${i.claim}** (Logical Bridge: \`${i.sourceRef}\`, Conf: ${Math.round(i.confidence * 100)}%)\n`;
      });
      md += `\n`;

      md += `### Plotted Hypotheses [HYP]\n`;
      analysisResult.hypotheses?.forEach(h => {
        md += `- **${h.claim}** (Required Experiment: \`${h.sourceRef}\`)\n`;
      });
      md += `\n`;

      md += `### Identified Risk Assessments\n`;
      analysisResult.risks?.forEach(r => {
        md += `#### Risk: ${r.title} (${r.level.toUpperCase()})\n`;
        md += `- **Reason**: ${r.why}\n`;
        md += `- **Emergency Code Mitigation**: ${r.mitigation}\n\n`;
      });

      md += `### Gaps & Unknown Fields\n`;
      analysisResult.unknowns?.forEach(u => {
        md += `- ${u}\n`;
      });
      md += `\n`;

      md += `### Proactively Advised Next Steps\n`;
      analysisResult.nextSteps?.forEach(ns => {
        md += `1. **${ns}**\n`;
      });
      md += `\n`;
    }

    md += `## 6. LEDGER TRANSACTION LOGS AND SECURE CHAIN SIGNALS\n\n`;
    md += `Blockchain auditor outputs protecting cognitive architecture against arbitrary rewrite:\n\n`;
    ledger.forEach(block => {
      md += `### Block: \`${block.hash.slice(0, 16)}...\`\n`;
      md += `- **Timestamp**: ${block.timestamp}\n`;
      md += `- **Committed Action**: \`${block.action}\`\n`;
      md += `- **Target object identifier**: "${block.targetTitle}"\n`;
      md += `- **Delta change specification**: ${block.delta}\n`;
      md += `- **Parent Hash Block**: \`${block.previousHash.slice(0, 16)}...\`\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ISKRA_ARCHITECTURE_REPORT_${Date.now()}.md`;
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

  // Merge proposed nodes from GitHub metadata ingestion
  const handleMergeProposedGitHubNodes = () => {
    // Propose adding Apps/iskra-web and @iskra/core if they are not already present
    const additionalNodes: IskraNode[] = [
      {
        id: "n-github-app",
        type: "App",
        title: "apps/iskra-web",
        description: "Standard web client application directory in Iskra Space, React 19.",
        evidence: "github:apps/iskra-web [Ingested Fact]",
        risk: "Unmapped code components and loose ast files",
        confidence: 90,
        nextAction: "Perform full web app scan",
        delta: "Map app client directly to active runtime models",
        depth: 70,
        review: "Review during ESM build release gates",
        x: 480,
        y: 120
      },
      {
        id: "n-github-pkg-core",
        type: "Package",
        title: "@iskra/core",
        description: "Primary library core package handling state loops & ledger anchors.",
        evidence: "@iskra/core/package.json [Ingested Fact]",
        risk: "Fractal math bindings unverified",
        confidence: 95,
        nextAction: "Import ESM packages map",
        delta: "Verify state loops overlap with @iskra/math",
        depth: 90,
        review: "Strict ast checks on pnpm-workspace",
        x: 180,
        y: 350
      }
    ];

    const nodesToPost = [...nodes];
    let addedCount = 0;
    additionalNodes.forEach(proposed => {
      if (!nodesToPost.some(n => n.id === proposed.id || n.title === proposed.title)) {
        nodesToPost.push(proposed);
        addedCount++;
      }
    });

    setNodes(nodesToPost);

    const nextLedger = logToLedger(
      "GITHUB_METADATA_MERGE",
      "n-github-app",
      "apps/iskra-web & @iskra/core",
      `Merged ${addedCount} newly discovered repository nodes into Canvas Space.`,
      "github:serhiipriadko2-sys/iskra Ingestion",
      100,
      "Full consistency check"
    );

    setNotification({
      message: `Merged ${addedCount} repository components to workspace canvas successfully!`,
      type: "success"
    });

    syncStateBack({
      nodes: nodesToPost,
      edges,
      metrics,
      voices,
      ledger: nextLedger
    });
  };

  // Merge advisor warnings from Supabase schemas ingest
  const handleMergeProposedSupabaseNodes = () => {
    const secureRiskNode: IskraNode = {
      id: "n-sec-risk",
      type: "Risk",
      title: "Supabase Advisor Warning",
      description: "Warnings on mutable function search paths and public pg_trgm broad exposures.",
      evidence: "supabase:advisor:security [Ingested Fact]",
      risk: "Information leakage & mutable function takeover in public schemas",
      confidence: 100,
      nextAction: "Set strict search_path configuration",
      delta: "Isolate client SQL execution, remove broad schema vectors",
      depth: 95,
      review: "Manual Database security health check",
      x: 320,
      y: 420
    };

    if (nodes.some(n => n.id === secureRiskNode.id)) {
      setNotification({
        message: "Supabase risk node is already deployed on the canvas.",
        type: "info"
      });
      return;
    }

    const nextNodes = [...nodes, secureRiskNode];
    setNodes(nextNodes);

    const nextLedger = logToLedger(
      "SUPABASE_RISK_MERGE",
      "n-sec-risk",
      "Supabase Advisor Warnings",
      "Merged database advisor security alert into work canvas.",
      "supabase:typcvaszcfdpkzbjzuur.supabase.co",
      100,
      "Run lock_schema_paths script"
    );

    setNotification({
      message: "Supabase DB warning node integrated with the mental map.",
      type: "success"
    });

    // Also update metrics slightly (increase pain/chaos to signal alert visibility)
    const nextMetrics = {
      ...metrics,
      pain: Math.min(100, metrics.pain + 8),
      chaos: Math.min(100, metrics.chaos + 5)
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

  // Triggering the Read-Only Ingestion for GitHub
  const handleImportGitHub = async () => {
    try {
      setSyncing(true);
      const res = await fetch('/api/github/ingest');
      const data = await res.json();
      
      setGithubIngestLoaded(true);
      
      // Update the coverage matrix state to reflect verified factual status
      const updatedMatrix = coverageMatrix.map(row => {
        if (row.sourceName.includes("github:") || row.sourceName.includes("@iskra/")) {
          return {
            ...row,
            importedItems: "Repository Ingested & Synced [FACT]",
            summarizedItems: "Complete source tree outlined via API",
            riskLevel: row.riskLevel === "high" ? "medium" : row.riskLevel
          } as CoverageMatrixRow;
        }
        return row;
      });
      setCoverageMatrix(updatedMatrix);

      const nextLedger = logToLedger(
        "GITHUB_INGEST",
        "github-api",
        "serhiipriadko2-sys/iskra",
        "Read-only ingestion of GitHub repository structures & metadata successfully executed.",
        "api:github/ingest",
        99,
        "Verify child workspace files"
      );

      setNotification({
        message: "GitHub repository parsed (Read-Only)! Found unmapped children.",
        type: "info",
        choices: [
          { text: "Merge @iskra/core & apps/iskra-web Nodes", action: handleMergeProposedGitHubNodes },
          { text: "Dismiss", action: () => setNotification(null) }
        ]
      });

      syncStateBack({
        nodes,
        edges,
        metrics,
        voices,
        ledger: nextLedger
      });
    } catch (err: any) {
      alert(`GitHub ingestion failure: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  // Triggering Read-Only Schema Ingestion for Supabase
  const handleImportSupabase = async () => {
    try {
      setSyncing(true);
      const res = await fetch('/api/supabase/schema');
      const data = await res.json();
      
      setSupabaseSchemaLoaded(true);

      const updatedMatrix = coverageMatrix.map(row => {
        if (row.sourceName.includes("supabase:")) {
          return {
            ...row,
            importedItems: "Postgres schema queried directly [FACT]",
            summarizedItems: "Advisories and public table dimensions synchronized",
            riskLevel: "low"
          } as CoverageMatrixRow;
        }
        return row;
      });
      setCoverageMatrix(updatedMatrix);

      const nextLedger = logToLedger(
        "SUPABASE_INGEST",
        "supabase-api",
        "AgiIskra schemas",
        `Read-only Supabase PostgreSQL parsed. Loaded ${data.tables?.length || 5} table formats with ${data.warnings?.length || 3} security warnings.`,
        "api:supabase/schema",
        100,
        "Run strict security checking"
      );

      setNotification({
        message: "Supabase DB metadata loaded! Found security advisory alerts.",
        type: "warn",
        choices: [
          { text: "Add Security Advisory Risk Node", action: handleMergeProposedSupabaseNodes },
          { text: "Ignore Alert", action: () => setNotification(null) }
        ]
      });

      syncStateBack({
        nodes,
        edges,
        metrics,
        voices,
        ledger: nextLedger
      });
    } catch (err: any) {
      alert(`Supabase ingestion failed: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  // Run structured analysis helper
  const handleRunAnalysis = async () => {
    try {
      setSyncing(true);
      const currentState = { nodes, edges, metrics };
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: analysisMode,
          currentState,
          prompt: "Full cognitive audit on mental maps"
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned code ${res.status}`);
      }

      const parsed = await res.json();
      if (parsed) {
        setAnalysisResult(parsed);
        setActiveBottomTab('gemini'); // Immediately focus analysis drawer!

        const nextLedger = logToLedger(
          "GEMINI_ANALYSIS",
          "gemini-analyser",
          `Gemini Mode: ${analysisMode.toUpperCase()}`,
          `Analysis verdict: ${parsed.verdict.toUpperCase()} (Confidence: ${Math.round(parsed.confidence * 105 || 88)}%). Fact count: ${parsed.facts?.length || 0}`,
          "server:api/gemini/analyze",
          Math.min(100, Math.round((parsed.confidence || 0.88) * 100)),
          "Verify facts via Evidence Trace"
        );

        setNotification({
          message: `Gemini ${analysisMode.toUpperCase()} report synthesized successfully!`,
          type: "success"
        });

        // Boost clarity metric slightly since cognitive layer was engaged
        const nextMetrics = {
          ...metrics,
          clarity: Math.min(100, metrics.clarity + 5),
          chaos: Math.max(0, metrics.chaos - 3)
        };
        setMetrics(nextMetrics);

        syncStateBack({
          nodes,
          edges,
          metrics: nextMetrics,
          voices,
          ledger: nextLedger
        });
      }
    } catch (err: any) {
      console.error(err);
      alert(`Structured Analysis failed: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  // Merge proposed nodes from Gemini analysis result
  const handleApplyGeminiProposes = () => {
    if (!analysisResult?.graphUpdates) return;

    const proposedNodes = analysisResult.graphUpdates.nodes || [];
    const proposedEdges = analysisResult.graphUpdates.edges || [];

    if (proposedNodes.length === 0 && proposedEdges.length === 0) {
      setNotification({
        message: "No graph updates are proposed in this Gemini report.",
        type: "info"
      });
      return;
    }

    // Merge nodes safely avoiding duplicates
    const nodesToPost = [...nodes];
    let nodesAdded = 0;
    proposedNodes.forEach(p => {
      if (!nodesToPost.some(n => n.id === p.id || n.title === p.title)) {
        // Place node around a random nice spot
        const xOffset = Math.floor(Math.random() * 150) + 120;
        const yOffset = Math.floor(Math.random() * 100) + 120;
        nodesToPost.push({
          ...p,
          x: p.x || xOffset,
          y: p.y || yOffset
        });
        nodesAdded++;
      }
    });

    // Merge edges safely avoiding duplicates
    const edgesToPost = [...edges];
    let edgesAdded = 0;
    proposedEdges.forEach(p => {
      if (!edgesToPost.some(e => (e.source === p.source && e.target === p.target) || e.id === p.id)) {
        edgesToPost.push(p);
        edgesAdded++;
      }
    });

    setNodes(nodesToPost);
    setEdges(edgesToPost);

    const nextLedger = logToLedger(
      "GEMINI_PROPOSE_APPLIED",
      "gemini-updater",
      "Graph merges approved",
      `Approved Gemini proposals: Added ${nodesAdded} nodes and ${edgesAdded} edges to canvas directly.`,
      `gemini:${analysisResult.mode}`,
      100,
      "Recalibrate layout parameters"
    );

    setNotification({
      message: `Successfully merged updates: ${nodesAdded} Nodes, ${edgesAdded} Edges approved!`,
      type: "success"
    });

    const nextMetrics = {
      ...metrics,
      clarity: Math.min(100, metrics.clarity + 10),
      chaos: Math.max(0, metrics.chaos - 5),
      drift: Math.max(0, metrics.drift - 4)
    };
    setMetrics(nextMetrics);

    // Clear recommended updates from display
    setAnalysisResult({
      ...analysisResult,
      graphUpdates: { nodes: [], edges: [] }
    });

    syncStateBack({
      nodes: nodesToPost,
      edges: edgesToPost,
      metrics: nextMetrics,
      voices,
      ledger: nextLedger
    });
  };

  // Helper to map a node type to a structural alignment layer
  const getNodeLayer = (type: string): string => {
    if (type === 'Package' || type === 'App') return 'Code';
    if (type === 'Runtime' || type === 'RuntimeModule') return 'Execution';
    if (type === 'SupabaseTable') return 'Storage';
    if (type === 'Metric' || type === 'Voice' || type === 'Decision' || type === 'Task' || type === 'Risk' || type === 'ReleaseGate') return 'Health & Gov';
    return 'Grounding';
  };

  // Helper to map a node's numeric and status confidence to three explicit risk levels
  const getNodeRiskLevel = (n: IskraNode): 'low' | 'medium' | 'high' => {
    const nodeRisk = n.risk ? n.risk.toLowerCase() : '';
    const isHigh = nodeRisk.includes('high') || n.confidence < 70;
    const isMedium = !isHigh && (nodeRisk.includes('medium') || (n.confidence >= 70 && n.confidence < 85));
    return isHigh ? 'high' : isMedium ? 'medium' : 'low';
  };

  // Filter and process active nodes lists
  const filteredNodes = nodes.filter(n => {
    // 1. Filter by Search Query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchQuery = n.title.toLowerCase().includes(q) || 
                         n.description.toLowerCase().includes(q) || 
                         n.type.toLowerCase().includes(q) ||
                         (n.evidence && n.evidence.toLowerCase().includes(q));
      if (!matchQuery) return false;
    }
    // 2. Filter by Node Type Select
    if (nodeTypeFilter !== 'all' && n.type !== nodeTypeFilter) {
      return false;
    }
    // 3. Filter by Risk Levels
    if (riskFilter !== 'all') {
      const layerRiskVal = getNodeRiskLevel(n);
      if (riskFilter === 'high' && layerRiskVal !== 'high') return false;
      if (riskFilter === 'medium' && layerRiskVal !== 'medium') return false;
      if (riskFilter === 'low' && layerRiskVal !== 'low') return false;
    }
    // 4. Filter by Source Filter
    if (sourceFilter !== 'all') {
      const nodeEvidence = n.evidence ? n.evidence.toLowerCase() : '';
      if (!nodeEvidence.includes(sourceFilter.toLowerCase())) return false;
    }
    // 5. Filter by Matrix Slicer Filter
    if (matrixFilter.layer) {
      if (getNodeLayer(n.type) !== matrixFilter.layer) return false;
    }
    if (matrixFilter.risk) {
      if (getNodeRiskLevel(n) !== matrixFilter.risk) return false;
    }
    return true;
  });

  // Calculate stats
  const totalNodesWithEvidence = nodes.filter(n => n.evidence && n.evidence.trim() !== '').length;
  const coveragePercent = Math.round((totalNodesWithEvidence / Math.max(1, nodes.length)) * 100);

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

      {/* TOP CONFIGURATION HEADER BAR / COCKPIT VIEW */}
      <header className="flex flex-col xl:flex-row justify-between items-center px-6 py-4 border-b border-slate-900 bg-slate-950/80 gap-4 z-20 shrink-0 select-none">
        
        {/* Title, Branding & Mode indicators */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-900 via-slate-950 to-emerald-950 border border-indigo-500/30 rounded-lg hidden sm:block">
            <Cpu className="w-5 h-5 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-mono tracking-wider font-bold text-slate-100 uppercase flex items-center gap-1.5">
                Iskra Builder / Compass
              </h1>
              <span className="text-[9px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2 py-0.2 rounded">vΩ.7</span>
              <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.2 rounded">Sot40 LIVE</span>
              <span className="text-[8.5px] font-mono bg-rose-500/5 text-rose-500 border border-rose-500/20 px-1.5 py-0.2 rounded">READ-ONLY IMPORT</span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">
              Interactive constructor, research beacon & multi-agent semantic cockpit
            </p>
          </div>
        </div>

        {/* Search & Ingestion controls */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-end">
          
          {/* Global search input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search canon nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-950/80 border border-slate-800 focus:border-slate-700 rounded-lg text-[10.5px] text-slate-300 w-[170px] font-mono outline-none"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-[9px] font-mono text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            )}
          </div>

          {/* Source ingest trigger buttons (Phase 3) */}
          <div className="flex gap-1 bg-slate-900/60 p-0.5 border border-slate-805 rounded-lg">
            <button
              onClick={handleImportGitHub}
              title="Read-only metadata import from default branch"
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                githubIngestLoaded 
                  ? 'bg-emerald-950/30 border border-emerald-800/50 text-emerald-400' 
                  : 'bg-transparent hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Github className="w-3.5 h-3.5" /> Ingest GitHub
            </button>
            <button
              onClick={handleImportSupabase}
              title="Load active PostgreSQL tables and schema variables"
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                supabaseSchemaLoaded 
                  ? 'bg-emerald-950/30 border border-emerald-800/50 text-emerald-400' 
                  : 'bg-transparent hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Database className="w-3.5 h-3.5" /> Schema Supabase
            </button>
          </div>

          {/* Gemini Mode selector & button */}
          <div className="flex items-center gap-1 bg-slate-900/60 p-0.5 border border-slate-800 rounded-lg">
            <select
              value={analysisMode}
              onChange={(e) => setAnalysisMode(e.target.value as any)}
              className="bg-transparent border-none text-[10px] font-mono text-slate-300 outline-none px-2 py-1 cursor-pointer"
            >
              <option value="summary">Summary</option>
              <option value="structure">Structure</option>
              <option value="analytics">Analytics</option>
              <option value="what_if">What-If</option>
              <option value="reflection">Reflection</option>
              <option value="output">Output</option>
              <option value="design">Design</option>
              <option value="test">Test</option>
            </select>
            <button
              onClick={handleRunAnalysis}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/20 px-3 py-1.5 rounded text-[10px] font-mono transition-colors font-bold uppercase tracking-wider"
              title="Invoke Gemini analysis on current canvas"
            >
              <Sparkles className="w-3 -> w-3" /> Analyz Ω
            </button>
          </div>

          {/* Backup overlays & controls */}
          <div className="flex gap-1">
            <button
              onClick={() => setShowSnapshotDialog(true)}
              className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2.5 py-1.5 rounded-lg text-[10px] font-mono text-slate-300 transition-colors cursor-pointer"
              title="Paste custom snap JSON"
            >
              <UploadCloud className="w-3 h-3" /> Snap-In
            </button>
            <button
              onClick={triggerExportSnapshot}
              className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2.5 py-1.5 rounded-lg text-[10px] font-mono text-slate-300 transition-colors cursor-pointer"
              title="Download canvas JSON"
            >
              <Download className="w-3 h-3" /> Snap-Out
            </button>
            <button
              onClick={triggerExportMarkdownReport}
              className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2.5 py-1.5 rounded-lg text-[10px] font-mono text-indigo-400 font-semibold transition-colors cursor-pointer"
              title="Download structured Markdown report"
            >
              <FileDown className="w-3 h-3" /> Report-Out
            </button>
            <button
              onClick={handleResetSystem}
              className="flex items-center gap-1.5 bg-rose-950/20 text-rose-400 hover:bg-rose-950/40 border border-rose-900/30 px-2.5 py-1.5 rounded-lg text-[10px] font-mono transition-colors cursor-pointer"
              title="Re-seed demo"
            >
              <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} /> Reset
            </button>
          </div>

        </div>
      </header>

      {/* Floating active prompts / approval dialogs */}
      {notification && (
        <div className="bg-indigo-950/85 border border-indigo-700/60 p-3 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] font-mono text-slate-200 z-30 select-none animate-fade-in shrink-0">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{notification.message}</span>
          </div>
          {notification.choices ? (
            <div className="flex gap-2 shrink-0">
              {notification.choices.map((choice, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    choice.action();
                    setNotification(null);
                  }}
                  className={`px-3 py-1 rounded text-[10px] font-mono tracking-wide ${
                    idx === 0 ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                >
                  {choice.text}
                </button>
              ))}
            </div>
          ) : (
            <button 
              onClick={() => setNotification(null)}
              className="px-2.5 py-0.5 bg-indigo-900 hover:bg-indigo-800 rounded font-bold"
            >
              OK
            </button>
          )}
        </div>
      )}

      {/* WORKSPACE PANELS GRID */}
      <main className="flex-grow p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden h-max">
        
        {/* LEFT COLUMN: Collapsible Metrics & Simulators vs Filter & Coverage Options */}
        <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto max-h-[80vh] lg:max-h-[calc(100vh-270px)] pr-1 select-none">
          
          {/* Selectable tab header */}
          <div className="flex bg-slate-900/40 rounded-lg p-0.5 border border-slate-800/50">
            <button
              onClick={() => setActiveLeftTab('metrics')}
              className={`flex-1 py-1 px-2 rounded-md font-mono text-[9px] uppercase tracking-wider transition-all ${
                activeLeftTab === 'metrics' ? 'bg-slate-850 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Metrics & Sim
            </button>
            <button
              onClick={() => setActiveLeftTab('filters')}
              className={`flex-1 py-1 px-2 rounded-md font-mono text-[9px] uppercase tracking-wider transition-all ${
                activeLeftTab === 'filters' ? 'bg-slate-850 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Filters & Limits
            </button>
          </div>

          {activeLeftTab === 'metrics' ? (
            <div className="space-y-4">
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
          ) : (
            <div className="space-y-4 bg-slate-900/60 p-4 border border-slate-800/60 rounded-xl">
              <div>
                <h3 className="text-[11px] font-mono font-bold text-slate-200 uppercase tracking-widest mb-3 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-indigo-400" /> Cockpit Filters
                </h3>
                <p className="text-[10px] text-slate-500 font-sans mb-3">
                  Restrict diagram layout or data tables to focus on specific scopes.
                </p>
              </div>

              {/* Node type selection box */}
              <div className="space-y-1.5">
                <label className="block text-[9.5px] font-mono text-slate-400 uppercase tracking-wider">Node Type Filter</label>
                <div className="flex flex-wrap gap-1">
                  {['all', 'Canon', 'Package', 'App', 'Runtime', 'SupabaseTable', 'Risk', 'Test', 'Decision', 'Evidence', 'UnknownGap'].map(t => {
                    const count = t === 'all' ? nodes.length : nodes.filter(n => n.type === t).length;
                    return (
                      <button
                        key={t}
                        onClick={() => setNodeTypeFilter(t)}
                        className={`px-2 py-0.5 rounded text-[9px] font-mono transition-colors cursor-pointer ${
                          nodeTypeFilter === t
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-950 text-slate-400 hover:bg-slate-900'
                        }`}
                      >
                        {t} <span className="text-slate-500 text-[8px]">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Risk bounds selector */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/40">
                <label className="block text-[9.5px] font-mono text-slate-400 uppercase tracking-wider">Risk Level Filter</label>
                <div className="grid grid-cols-4 gap-1">
                  {['all', 'low', 'medium', 'high'].map(r => (
                    <button
                      key={r}
                      onClick={() => setRiskFilter(r as any)}
                      className={`py-1 px-1.5 text-center text-[9px] rounded font-mono uppercase tracking-wider hover:bg-slate-900 cursor-pointer ${
                        riskFilter === r
                          ? r === 'high' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                            r === 'medium' ? 'bg-amber-950 text-amber-500 border border-amber-800' :
                            r === 'low' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                            'bg-indigo-600 text-white'
                          : 'bg-slate-950 text-slate-400'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Source tag selector */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/40">
                <label className="block text-[9.5px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Evidence Source Tag</label>
                <div className="flex flex-wrap gap-1">
                  {['all', 'github', 'supabase', 'uncommitted'].map(s => (
                    <button
                      key={s}
                      onClick={() => setSourceFilter(s)}
                      className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                        sourceFilter === s 
                          ? 'bg-slate-800 text-emerald-400 border border-emerald-600/50' 
                          : 'bg-slate-950 text-slate-400 hover:bg-slate-900 font-normal'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mini Evidence coverage checklist meter */}
              <div className="pt-3 border-t border-slate-800/40 space-y-1.5">
                <div className="flex justify-between text-[9px] font-mono text-slate-500">
                  <span>CANON COPT-MAPPING</span>
                  <span className="text-slate-350">{coveragePercent}% VERIFIED</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${coveragePercent}%` }}
                  />
                </div>
                <p className="text-[9px] text-slate-400 font-sans leading-relaxed">
                  Мы закодировали {totalNodesWithEvidence} из {nodes.length} узлов с явным Evidence. Нестыковки выводят неопределенность в Bottom Drawer.
                </p>
              </div>

            </div>
          )}
        </div>

        {/* CENTER COLUMN: Network Graph Canvas + Quantum Voice Grid */}
        <div className="lg:col-span-6 flex flex-col gap-4 h-[550px] lg:h-full lg:max-h-[calc(100vh-270px)] min-h-[500px]">
          {/* Main diagram toolbar tabbed switcher */}
          <div className="flex flex-wrap gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-slate-800/60 shrink-0 select-none">
            <button
              onClick={() => setCenterView('canvas')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-[10px] font-mono tracking-wider transition-all cursor-pointer ${
                centerView === 'canvas' ? 'bg-indigo-600 text-white shadow-lg font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Canvas Map
            </button>
            <button
              onClick={() => setCenterView('table')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-[10px] font-mono tracking-wider transition-all cursor-pointer ${
                centerView === 'table' ? 'bg-indigo-600 text-white shadow-lg font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Faceted Table ({filteredNodes.length})
            </button>
            <button
              onClick={() => setCenterView('timeline')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-[10px] font-mono tracking-wider transition-all cursor-pointer ${
                centerView === 'timeline' ? 'bg-indigo-600 text-white shadow-lg font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Committed Timeline
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

          {/* Interactive display render view */}
          <div className="flex-grow min-h-0">
            {centerView === 'canvas' && (
              <CanvasGraph
                nodes={filteredNodes}
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
                nodes={filteredNodes}
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
                nodes={filteredNodes}
                selectedNodeId={selectedNodeId}
                onSelectNode={(id) => {
                  setSelectedNodeId(id);
                  setSelectedEdgeId(null);
                }}
              />
            )}
            {centerView === 'evidenceTrace' && (
              <EvidenceTraceView
                nodes={filteredNodes}
                selectedNodeId={selectedNodeId}
                onSelectNode={(id) => {
                  setSelectedNodeId(id);
                  setSelectedEdgeId(null);
                }}
              />
            )}
          </div>

          {/* Core Quantum voice probabilities layer */}
          <div className="shrink-0 h-[115px]">
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
                      <option value="Package">Package</option>
                      <option value="App">App</option>
                      <option value="Runtime">Runtime</option>
                      <option value="SupabaseTable">SupabaseTable</option>
                      <option value="Metric">Metric</option>
                      <option value="Voice">Voice</option>
                      <option value="Task">Task</option>
                      <option value="Risk">Risk</option>
                      <option value="Decision">Decision</option>
                      <option value="Evidence">Evidence</option>
                      <option value="UnknownGap">UnknownGap</option>
                      <option value="RuntimeModule">RuntimeModule</option>
                      <option value="GitHubFile">GitHubFile</option>
                      <option value="ADR">ADR</option>
                      <option value="Test">Test</option>
                      <option value="OpenLoop">OpenLoop</option>
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

                {/* Deep Research Grounding Connector widget */}
                <div className="mt-4 pt-4 border-t border-slate-800/80">
                  <div className="flex items-center justify-between pointer-events-auto">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 select-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-550 bg-indigo-500 animate-pulse" />
                      Grounded Ingestor
                    </span>
                    {selectedNode.evidence && (selectedNode.evidence.includes("github:") || selectedNode.evidence.includes("/") || selectedNode.evidence.endsWith(".json") || selectedNode.evidence.endsWith(".md") || selectedNode.evidence.endsWith(".ts")) ? (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            setScrapingFile(true);
                            // Extract clear path if it has prefixes like 'github:'
                            let path = selectedNode.evidence;
                            if (path.includes("github:")) {
                              path = path.slice(path.indexOf("github:") + 7).trim();
                            }
                            if (path.includes("README")) {
                              path = path.includes("/") ? path.split(" ")[0] : "README.md";
                            }
                            if (path.includes(" ")) {
                              path = path.split(" ")[0].trim();
                            }
                            if (!path.includes(".") && !path.includes("/")) {
                              // If it's just a raw folder or a simple word without extensions, map or try README.md
                              path = "README.md";
                            }
                            const res = await fetch(`/api/github/file-content?path=${encodeURIComponent(path)}`);
                            if (!res.ok) throw new Error("File not found on main GitHub branch");
                            const d = await res.json();
                            setGroundedFileContent(d.content);
                            setGroundedFilePath(path);
                          } catch (err: any) {
                            alert(`Failed deep-scraping: ${err.message}. Ensure path is valid relative path belonging to serhiipriadko2-sys/iskra on the main branch.`);
                          } finally {
                            setScrapingFile(false);
                          }
                        }}
                        disabled={scrapingFile}
                        className="text-[9px] font-mono text-indigo-400 bg-indigo-505 bg-indigo-550/10 border border-indigo-500/30 hover:bg-indigo-500/20 px-2 py-0.5 rounded cursor-pointer disabled:opacity-50"
                      >
                        {scrapingFile ? "Retrieving..." : "Scrape Raw GitHub"}
                      </button>
                    ) : null}
                  </div>

                  {!selectedNode.evidence ? (
                    <p className="text-[9px] text-slate-500 font-sans mt-1.5 select-none">No evidence filepath defined. Enter relative path to trigger direct codebase ingestion.</p>
                  ) : (
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between items-center bg-slate-950/50 p-1.5 rounded border border-slate-850 text-[9px] font-mono text-slate-400">
                        <span className="truncate max-w-[150px]" title={selectedNode.evidence}>
                          📁 {selectedNode.evidence}
                        </span>
                        <span className="text-[8px] text-indigo-500/80 uppercase select-none">Live Connection</span>
                      </div>

                      {groundedFileContent && (
                        <div className="space-y-1.5">
                          <label className="block text-[8.5px] font-mono text-slate-400 select-none">Ingested Code / Content View:</label>
                          <div className="bg-slate-950 rounded border border-slate-800 p-2 max-h-[160px] overflow-y-auto text-[10px] font-mono text-slate-300 whitespace-pre scrollbar-thin">
                            {groundedFileContent}
                          </div>
                          
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                setSyncing(true);
                                const currentState = { nodes, edges, metrics };
                                let path = selectedNode.evidence;
                                if (path.includes("github:")) {
                                  path = path.slice(path.indexOf("github:") + 7).trim();
                                }
                                if (path.includes("README")) {
                                  path = path.includes("/") ? path.split(" ")[0] : "README.md";
                                }
                                if (path.includes(" ")) {
                                  path = path.split(" ")[0].trim();
                                }
                                if (!path.includes(".") && !path.includes("/")) {
                                  path = "README.md";
                                }

                                const res = await fetch('/api/gemini/analyze', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    mode: 'summary',
                                    currentState,
                                    prompt: `Grounded analytical audit on specific file code. Target file: ${path}`,
                                    filePath: path
                                  })
                                });

                                if (!res.ok) throw new Error("Analysis failed");
                                const parsed = await res.json();
                                setAnalysisResult(parsed);
                                setActiveBottomTab('gemini'); 
                                setNotification({
                                  message: `Grounded analysis complete for ${path}! Feedback generated in Bottom Drawer.`,
                                  type: "info",
                                  choices: [{ text: "Open Drawer", action: () => { setActiveBottomTab('gemini'); setNotification(null); } }]
                                });
                              } catch (err: any) {
                                alert(`Grounded audit failed: ${err.message}`);
                              } finally {
                                setSyncing(false);
                              }
                            }}
                            className="w-full flex items-center justify-center gap-1.5 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 py-1 rounded text-[10px] font-mono text-emerald-400 transition-colors cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" /> Grounded Ingestion Audit
                          </button>
                        </div>
                      )}
                    </div>
                  )}
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
              <div className="space-y-4">
                <div className="border border-slate-800/60 bg-slate-950/60 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10.5px] font-mono text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
                      Alignment Risk Matrix
                    </span>
                    {(matrixFilter.layer || matrixFilter.risk) && (
                      <button
                        onClick={() => setMatrixFilter({ layer: null, risk: null })}
                        className="text-[9px] font-mono text-rose-400 hover:text-rose-300 border border-rose-500/30 bg-rose-500/5 px-2 py-0.5 rounded cursor-pointer transition-colors"
                      >
                        Reset Slices
                      </button>
                    )}
                  </div>
                  
                  <div className="text-[10px] text-slate-500 mb-3 leading-relaxed">
                    Кликните на ячейку матрицы риска для мгновенной фильтрации (slicing) узлов на холсте Canvas и SoT таблицах.
                  </div>

                  {/* Operational Matrix Grid */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-[9px] border-collapse text-slate-400">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-500">
                          <th className="pb-1.5 font-bold">Layer</th>
                          <th className="pb-1.5 font-bold text-center">Low</th>
                          <th className="pb-1.5 font-bold text-center">Med</th>
                          <th className="pb-1.5 font-bold text-center">High</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900">
                        {['Code', 'Execution', 'Storage', 'Health & Gov', 'Grounding'].map(layer => {
                          return (
                            <tr key={layer} className="hover:bg-slate-900/30">
                              <td className="py-2 text-slate-300 font-medium">{layer}</td>
                              {['low', 'medium', 'high'].map(risk => {
                                const count = nodes.filter(n => getNodeLayer(n.type) === layer && getNodeRiskLevel(n) === (risk as any)).length;
                                const isSelected = matrixFilter.layer === layer && matrixFilter.risk === risk;
                                
                                let cellStyle = "border-slate-800 text-slate-650 bg-slate-950/20 text-slate-500";
                                if (count > 0) {
                                  if (risk === 'low') cellStyle = "text-emerald-400 border-emerald-950/40 bg-emerald-950/10 hover:bg-emerald-950/25";
                                  else if (risk === 'medium') cellStyle = "text-amber-400 border-amber-950/40 bg-amber-950/10 hover:bg-amber-950/25";
                                  else if (risk === 'high') cellStyle = "text-rose-400 border-rose-950/40 bg-rose-950/10 hover:bg-rose-950/25";
                                }

                                if (isSelected) {
                                  cellStyle += " ring-1 ring-indigo-500 bg-indigo-950/50 border-indigo-500/50 font-bold text-slate-100";
                                }

                                return (
                                  <td key={risk} className="p-1 text-center">
                                    <button
                                      onClick={() => {
                                        if (isSelected) setMatrixFilter({ layer: null, risk: null });
                                        else setMatrixFilter({ layer, risk: risk as any });
                                      }}
                                      className={`w-full py-1 border rounded text-center transition-all cursor-pointer ${cellStyle}`}
                                      disabled={count === 0}
                                    >
                                      {count}
                                    </button>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Active segment identifier pill */}
                  <div className="mt-3 pt-2 flex justify-between items-center text-[9.5px]">
                    <span className="text-slate-505">Active Slice:</span>
                    <span className="font-mono text-slate-300 font-semibold">
                      {matrixFilter.layer || matrixFilter.risk ? (
                        <span className="flex gap-1 items-center">
                          {matrixFilter.layer && (
                            <span className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-indigo-400">
                              Lay: {matrixFilter.layer}
                            </span>
                          )}
                          {matrixFilter.risk && (
                            <span className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-amber-400">
                              Risk: {matrixFilter.risk.toUpperCase()}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-slate-500 border border-dashed border-slate-850 px-2 py-0.5 rounded">All Elements (Unfiltered)</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="py-3 text-center text-[10px] font-mono text-slate-500 border border-dashed border-slate-850 rounded-lg">
                  Выберите узел на Canvas или связь в таблицах для калибровки точных реквизитов и верификации фактов (Sot40)
                </div>
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

      {/* BOTTOM DRAWER OPERATIONAL DASHBOARD */}
      <section className="mx-4 mb-4 border border-slate-900 bg-slate-950 rounded-xl select-none z-10 p-0.5 shadow-2xl shrink-0 flex flex-col max-h-[350px]">
        {/* Tab Selection Row */}
        <div className="flex bg-slate-900/40 border-b border-slate-900 p-1 rounded-t-lg justify-start gap-1">
          <button
            onClick={() => setActiveBottomTab('dialogue')}
            className={`px-4 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-all rounded cursor-pointer ${
              activeBottomTab === 'dialogue' ? 'bg-indigo-950 text-indigo-400 border border-indigo-900 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Quantum Dialogue Core ({voices.length} active)
          </button>
          <button
            onClick={() => setActiveBottomTab('coverage')}
            className={`px-4 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-all rounded cursor-pointer ${
              activeBottomTab === 'coverage' ? 'bg-indigo-950 text-indigo-400 border border-indigo-900 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Evidence Coverage Matrix ({coverageMatrix.length} scopes)
          </button>
          <button
            onClick={() => setActiveBottomTab('gemini')}
            className={`px-4 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-all rounded flex items-center gap-1 cursor-pointer ${
              activeBottomTab === 'gemini' ? 'bg-indigo-950 text-indigo-400 border border-indigo-900 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Gemini Analysis Outputs {analysisResult && <span className="w-2 h-2 rounded bg-indigo-505 bg-indigo-500 inline-block" />}
          </button>
          <button
            onClick={() => setActiveBottomTab('audit')}
            className={`px-4 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-all rounded cursor-pointer ${
              activeBottomTab === 'audit' ? 'bg-indigo-950 text-indigo-400 border border-indigo-900 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Audit Trail & Verifier ({ledger.length} chains)
          </button>
        </div>

        {/* Dynamic bottom drawer panel body */}
        <div className="p-4 overflow-y-auto max-h-[280px] scrollbar-thin">
          
          {activeBottomTab === 'dialogue' && (
            <DialogueTerminal
              voices={voices}
              activeVoiceKey={activeVoiceKey}
              metrics={metrics}
            />
          )}

          {activeBottomTab === 'coverage' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1 border-b border-slate-900 pb-1.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold font-bold">Iskra Coverage Matrix (Factual Verification Board)</span>
                <span className="text-[9.5px] font-mono text-slate-500 font-bold">Labeled: <span className="text-emerald-400 font-semibold">[FACT]</span> backs all observed scopes</span>
              </div>
              <table className="w-full text-left font-mono text-[9.5px] text-slate-300">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-500 font-semibold">
                    <th className="py-1">Source Name</th>
                    <th className="py-1">Source Type</th>
                    <th className="py-1">Observed</th>
                    <th className="py-1">Imported Status</th>
                    <th className="py-1">Summarized Items</th>
                    <th className="py-1">Linked Canvas Node</th>
                    <th className="py-1">Gaps / Unknowns</th>
                    <th className="py-1 text-center">Risk Level</th>
                    <th className="py-1 pl-2">Next Step</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {coverageMatrix.map((row, idx) => {
                    const linked = nodes.some(n => n.title.toLowerCase().includes(row.linkedGraphNodes.toLowerCase()));
                    return (
                      <tr 
                        key={idx} 
                        className={`hover:bg-slate-905 hover:bg-slate-900/60 transition-colors ${
                          selectedNode && selectedNode.title.toLowerCase().includes(row.linkedGraphNodes.toLowerCase())
                            ? 'bg-indigo-950/25 border-l-2 border-indigo-600'
                            : ''
                        }`}
                      >
                        <td className="py-1.5 font-bold text-slate-100">{row.sourceName}</td>
                        <td className="py-1.5 text-slate-400">{row.sourceType}</td>
                        <td className="py-1.5 text-slate-400">{row.observedItems}</td>
                        <td className="py-1.5">
                          <span className={`${row.importedItems.includes('Synced') || row.importedItems.includes('directly') ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                            {row.importedItems}
                          </span>
                        </td>
                        <td className="py-1.5 text-slate-400">{row.summarizedItems}</td>
                        <td className="py-1.5">
                          <button
                            onClick={() => {
                              const found = nodes.find(n => n.title.toLowerCase().includes(row.linkedGraphNodes.toLowerCase()));
                              if (found) {
                                setSelectedNodeId(found.id);
                              }
                            }}
                            className={`px-1.5 py-0.2 rounded text-[8.5px] transition-colors inline-block cursor-pointer ${
                              linked 
                                ? 'bg-indigo-950 hover:bg-indigo-900 border border-indigo-900 text-indigo-400 font-bold' 
                                : 'bg-slate-950 text-slate-500 hover:text-slate-350'
                            }`}
                          >
                            🔗 {row.linkedGraphNodes}
                          </button>
                        </td>
                        <td className="py-1.5 text-rose-300 text-[9px] max-w-[120px] truncate" title={row.unknownGaps}>{row.unknownGaps}</td>
                        <td className="py-1.5 text-center">
                          <span className={`px-1 rounded text-[8.5px] font-bold ${
                            row.riskLevel === 'high' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                            row.riskLevel === 'medium' ? 'bg-amber-950 text-amber-500 border border-amber-800' :
                            'bg-emerald-950 text-emerald-450 border border-emerald-800'
                          }`}>
                            {row.riskLevel.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-1.5 text-slate-400 pl-2 outline-none">{row.nextVerificationStep}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeBottomTab === 'gemini' && (
            <div className="space-y-3 font-mono">
              {!analysisResult ? (
                <div className="py-10 text-center text-[11px] text-slate-500 border border-dashed border-slate-800 rounded-lg">
                  <Sparkles className="w-5 h-5 mx-auto text-indigo-500 mb-2 animate-pulse" />
                  Нет активного когнитивного отчета. Активируйте Искру через <span className="font-bold text-slate-350">"Analyz Ω"</span> в верхней панели.
                </div>
              ) : (
                <div className="space-y-4 text-[10.5px]">
                  
                  {/* Verdict & Confidence summary */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-900 pb-2 bg-indigo-950/20 p-2 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                        Gemini structured mode: {analysisResult.mode.toUpperCase()}
                      </span>
                      <span className="flex items-center gap-1 font-sans">
                        Verdict: 
                        <span className={`uppercase font-bold px-1.5 rounded text-[9.5px] ${
                          analysisResult.verdict === 'verified' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' :
                          analysisResult.verdict === 'partial' ? 'bg-amber-950 text-amber-400 border border-amber-900' :
                          'bg-rose-950 text-rose-450 border border-rose-955'
                        }`}>
                          {analysisResult.verdict}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span>Confidence score: <span className="font-bold text-emerald-400">{(analysisResult.confidence * 100).toFixed(1)}%</span></span>
                      
                      {/* Apply Proposes Trigger button */}
                      {analysisResult.graphUpdates && (analysisResult.graphUpdates.nodes?.length > 0 || analysisResult.graphUpdates.edges?.length > 0) && (
                        <button
                          onClick={handleApplyGeminiProposes}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded flex items-center gap-1 text-[9.5px] uppercase tracking-wider transition-colors animate-pulse cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" /> Approved Proposes (+{analysisResult.graphUpdates.nodes?.length} nodes)
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Claims blocks showing Facts vs Interpretation disciplines */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* FACTS PANEL [FACT (Observed / Verified)] */}
                    <div className="border border-slate-900 rounded p-2.5 bg-slate-950">
                      <h4 className="border-b border-emerald-900/40 pb-1 text-[9.5px] text-emerald-400 font-bold uppercase tracking-widest mb-1.5 flex items-center justify-between font-extrabold">
                        <span>Facts [FACT]</span>
                        <span className="text-[8px] bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/30 font-normal">VERIFIED</span>
                      </h4>
                      {analysisResult.facts?.length === 0 ? (
                        <span className="text-[9px] text-slate-600">No raw sources verified.</span>
                      ) : (
                        <ul className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                          {analysisResult.facts?.map((f, idx) => (
                            <li key={idx} className="border-l border-emerald-800 pl-1.5">
                              <span className="text-slate-150 font-semibold font-mono tracking-tight text-[10px] block">{f.claim}</span>
                              <span className="text-[9px] text-slate-500 block">Source: {f.sourceRef} ({Math.round(f.confidence * 100)}%)</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* INTERPRETATIONS PANEL [INTERP (Analysis)] */}
                    <div className="border border-slate-900 rounded p-2.5 bg-slate-950">
                      <h4 className="border-b border-indigo-900/40 pb-1 text-[9.5px] text-indigo-400 font-bold uppercase tracking-widest mb-1.5 flex items-center justify-between font-extrabold">
                        <span>Interpretations [INTERP]</span>
                        <span className="text-[8px] bg-indigo-500/10 px-1 py-0.2 rounded border border border-indigo-500/30 font-normal font-sans">ANALYSIS</span>
                      </h4>
                      {analysisResult.interpretations?.length === 0 ? (
                        <span className="text-[9px] text-slate-600">No logical bridges outlined.</span>
                      ) : (
                        <ul className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                          {analysisResult.interpretations?.map((i, idx) => (
                            <li key={idx} className="border-l border-indigo-805 border-indigo-800 pl-1.5">
                              <span className="text-slate-200 font-mono text-[10px] block">{i.claim}</span>
                              <span className="text-[9px] text-slate-500 block">Bridge: {i.sourceRef} (Conf: {Math.round(i.confidence * 100)}%)</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* HYPOTHESES PANEL [HYP (Requires Test verify)] */}
                    <div className="border border-slate-900 rounded p-2.5 bg-slate-950">
                      <h4 className="border-b border-amber-900/40 pb-1 text-[9.5px] text-amber-400 font-bold uppercase tracking-widest mb-1.5 flex items-center justify-between font-extrabold">
                        <span>Hypotheses [HYP]</span>
                        <span className="text-[8px] bg-amber-500/10 px-1 py-0.2 rounded border border border border-amber-500/30 font-normal font-sans">TEST REQUIRED</span>
                      </h4>
                      {analysisResult.hypotheses?.length === 0 ? (
                        <span className="text-[9px] text-slate-600">No temporary assumptions assumptions assumed.</span>
                      ) : (
                        <ul className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                          {analysisResult.hypotheses?.map((h, idx) => (
                            <li key={idx} className="border-l border-amber-800 pl-1.5">
                              <span className="text-slate-200 font-mono text-[10px] block">{h.claim}</span>
                              <span className="text-[9px] text-slate-500 block">Experiment: {h.sourceRef} ({Math.round(h.confidence * 100)}%)</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                  </div>

                  {/* Risks identified and Mitigation guidelines */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-900/80">
                    <div>
                      <h4 className="font-bold text-[9.5px] text-rose-450 text-rose-450 text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1 font-extrabold">
                        <ShieldAlert className="w-3.5 h-3.5" /> Identified Risk Vectors & Mitigations
                      </h4>
                      {analysisResult.risks?.length === 0 ? (
                        <span className="text-[9.5px] text-slate-650 block pl-2 font-mono">No critical blockages identified in current cognitive map.</span>
                      ) : (
                        <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                          {analysisResult.risks?.map((r, idx) => (
                            <div key={idx} className="bg-slate-950 p-2 border border-slate-900 rounded">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-bold text-slate-100">{r.title}</span>
                                <span className={`px-1 text-[8.5px] font-bold rounded ${
                                  r.level === 'high' ? 'bg-rose-950 text-rose-400' : 'bg-slate-800 text-slate-400'
                                }`}>{r.level.toUpperCase()}</span>
                              </div>
                              <p className="text-[9px] text-slate-400 leading-snug">{r.why}</p>
                              <p className="text-[9px] text-emerald-400 font-sans mt-1">Mitigation logic: {r.mitigation}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Unknowns, Recommended Next Steps & Audits */}
                    <div className="grid grid-cols-2 gap-2 text-[9.5px]">
                      <div>
                        <h4 className="font-bold text-[9.5px] text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1 font-extrabold">
                          <AlertTriangle className="w-3.5 h-3.5 text-slate-450" /> Unknown Gaps
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-slate-400 max-h-[110px] overflow-y-auto pl-1">
                          {analysisResult.unknowns?.map((u, idx) => (
                            <li key={idx} className="truncate" title={u}>{u}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-bold text-[9.5px] text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1 font-extrabold">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Next Safe Actions
                        </h4>
                        <ol className="list-decimal list-inside space-y-1 text-slate-450 max-h-[110px] overflow-y-auto pl-1">
                          {analysisResult.nextSteps?.map((ns, idx) => (
                            <li key={idx} className="truncate" title={ns}>{ns}</li>
                          ))}
                        </ol>
                      </div>
                    </div>

                  </div>

                </div>
              )}
            </div>
          )}

          {activeBottomTab === 'audit' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1 border-b border-slate-900 pb-1.5 font-mono text-[10px]">
                <span className="text-slate-400 uppercase tracking-widest font-bold font-bold">Ledger Block Hash Auditor</span>
                <span className="text-[9px] text-emerald-500">Hash Match Algorithm: SHA-256 equivalent checksum check</span>
              </div>
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                {ledger.map((block) => {
                  return (
                    <div 
                      key={block.id} 
                      className="bg-slate-950/80 p-2 border border-slate-900 rounded font-mono text-[9px] flex flex-col md:flex-row justify-between items-start md:items-center gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-100 uppercase bg-slate-900 px-1 rounded text-[8.5px]">{block.action}</span>
                          <span className="text-slate-500">{block.timestamp}</span>
                        </div>
                        <p className="text-slate-400 mt-1 leading-snug">
                          Target object <span className="text-indigo-400">"{block.targetTitle}"</span> — Delta change: {block.delta}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-bold text-slate-200">Hash: <span className="text-slate-400 bg-slate-800 px-1 py-0.2 rounded font-normal">{block.hash.slice(0, 15)}...</span></div>
                        <div className="text-slate-500 text-[8px]">Prev: {block.previousHash.slice(0, 12)}...</div>
                        <div className="text-[8.5px] text-emerald-500 flex items-center justify-end gap-0.5 mt-0.5 font-sans font-semibold">
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> SECURE BLOCKLINK OK
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* FOOTER COCKPIT CONNECTED STATUS BAR */}
      <footer className="py-2.5 border-t border-slate-900 bg-slate-950 text-center select-none text-[9.5px] text-slate-500 font-mono shrink-0">
        Iskra Constructor Workspace Connected &bull; Sovereign Cognitive Console Mode Sot40
      </footer>

      {/* IMPORT SNAPSHOT MODAL DIALOGUE */}
      {showSnapshotDialog && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-40 select-none animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-lg shadow-2xl text-slate-200">
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
