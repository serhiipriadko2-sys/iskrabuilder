export interface IskraNode {
  id: string;
  type: 'Canon' | 'RuntimeModule' | 'SupabaseTable' | 'GitHubFile' | 'ADR' | 'Test' | 'Risk' | 'OpenLoop' | 'Metric' | 'Voice' | 'MemoryNode' | 'WhatIf' | 'ReleaseGate';
  title: string;
  description: string;
  evidence: string;
  risk: string;
  confidence: number; // 0 to 100
  nextAction: string;
  delta: string; // Δ: What changed
  depth: number; // Ω: Depth/assurance score
  review: string; // Λ: Keep criteria / next signal
  x: number;
  y: number;
}

export interface IskraEdge {
  id: string;
  source: string;
  target: string;
  summary: string;
  evidence: string;
  risk: string;
  confidence: number;
  nextAction: string;
  delta?: string;
  depth?: number;
  omega?: number;
  lambda?: string;
}

export interface IskraMetrics {
  clarity: number; // Ω-grade clarity on a 0-100 scale
  trust: number;
  pain: number;
  chaos: number;
  drift: number;
  echo: number;
  rhythm: number;
  silence_mass: number;
  mirror_sync: number;
  interrupt: number;
  ctxSwitch: number;
}

export interface IskraVoice {
  id: string;
  name: string;
  key: 'iskra' | 'sam' | 'kain' | 'iskriv' | 'anhantra' | 'sibyl' | 'huyndun' | 'pino' | 'maki';
  probability: number; // 0 to 100
  color: string;
  character: string;
  role: string;
  phrase: string;
}

export type PlaybookType = 'PROCEED' | 'FORCE_ISKRIV_1' | 'FORCE_SHADOW' | 'FORCE_CRISIS' | 'CLOSE_HONESTLY';

export interface LedgerBlock {
  id: string;
  timestamp: string;
  action: string;
  targetId: string;
  targetTitle: string;
  delta: string; // Δ: The change payload
  depth: string; // D: Evidence or document link
  omega: number; // Ω: Confidence / alignment percentage
  lambda: string; // Λ: Condition of revisit or next trigger
  hash: string;
  previousHash: string;
}

export interface Snapshot {
  nodes: IskraNode[];
  edges: IskraEdge[];
  metrics: IskraMetrics;
  voices: IskraVoice[];
  ledger: LedgerBlock[];
}
