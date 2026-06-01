import React, { useState } from 'react';
import { IskraMetrics } from '../types';
import { Sparkles, Play, ShieldAlert, Cpu } from 'lucide-react';

interface WhatIfSimulatorProps {
  metrics: IskraMetrics;
  onCommitShiftedMetrics: (shiftedMetrics: IskraMetrics, scenario: string, impact: string) => void;
}

export default function WhatIfSimulator({ metrics, onCommitShiftedMetrics }: WhatIfSimulatorProps) {
  const [scenario, setScenario] = useState('');
  const [loading, setLoading] = useState(false);
  const [outcome, setOutcome] = useState<{
    impactText: string;
    metrics: IskraMetrics;
    playbook: string;
    delta: string;
    evidenceChain: string;
  } | null>(null);

  const PRESETS = [
    { title: "Сбой Supabase", text: "Что если основная база Supabase упадет и нарушится Mirror Sync?" },
    { title: "Утеря Канона", text: "Что если Семён случайно перезапишет AGENTS.md пустой заглушкой?" },
    { title: "Тестовая атака", text: "Что если в коде случится циклическое переключение контекста (Ctx Switch)?" }
  ];

  const handleSimulate = async (inputText = scenario) => {
    if (!inputText.trim()) return;
    setLoading(true);
    setOutcome(null);

    try {
      const response = await fetch('/api/gemini/simulate-whatif', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioText: inputText,
          metricsState: metrics
        })
      });
      const data = await response.json();
      setOutcome(data);
    } catch (err) {
      console.error("Simulation error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!outcome) return;
    onCommitShiftedMetrics(outcome.metrics, scenario || "Preset Simulation Run", outcome.impactText);
    setOutcome(null);
    setScenario('');
  };

  return (
    <div id="whatif-simulator-container" className="flex flex-col gap-3.5 bg-slate-900/60 p-4 rounded-xl border border-slate-800/60 select-none">
      <div>
        <h3 className="text-xs font-mono text-slate-300 tracking-wider uppercase flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-rose-500" /> Risk What-if Simulator
        </h3>
        <p className="text-[10px] text-slate-500 font-sans mt-0.5">Simulate system impact on 11 IskraMetrics</p>
      </div>

      <div className="flex gap-2.5">
        {PRESETS.map((p, i) => (
          <button
            key={i}
            onClick={() => {
              setScenario(p.text);
              handleSimulate(p.text);
            }}
            className="p-1 px-2 hover:bg-slate-800 border border-slate-850 rounded text-[9.5px] font-mono text-slate-300 transition-colors"
          >
            {p.title}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <textarea
          placeholder="Опишите гипотетический риск (например: Полное ручное изменение файлов на сервере)..."
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
          rows={2}
          className="flex-grow bg-slate-950/60 border border-slate-800 p-2.5 rounded-lg text-xs font-sans text-slate-200 outline-none focus:border-slate-700/80 resize-none"
        />
        <button
          onClick={() => handleSimulate()}
          disabled={loading || !scenario.trim()}
          className="p-3 bg-rose-900 hover:bg-rose-800 border-rose-800/40 text-rose-100 disabled:opacity-40 rounded-lg flex items-center justify-center transition-colors shrink-0"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
        </button>
      </div>

      {outcome && (
        <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg animate-fadeIn text-xs font-sans leading-relaxed">
          <div className="flex items-center gap-1.5 text-rose-400 font-bold font-mono text-[10px] mb-1">
            <ShieldAlert className="w-3.5 h-3.5" /> SIMULATED AUDIT OUTCOME
          </div>
          <p className="text-slate-300 text-xs mb-3">{outcome.impactText}</p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-slate-900/40 border border-slate-900 p-2 rounded mb-3">
            <div>
              <span className="text-[10px] font-mono text-slate-500">Clarity:</span>
              <span className="text-xs font-mono text-slate-300 ml-1 font-semibold">{outcome.metrics.clarity}%</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-500">Pain:</span>
              <span className="text-xs font-mono text-rose-400 ml-1 font-semibold">{outcome.metrics.pain}%</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-500">Chaos:</span>
              <span className="text-xs font-mono text-amber-400 ml-1 font-semibold">{outcome.metrics.chaos}%</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-500">Drift:</span>
              <span className="text-xs font-mono text-slate-300 ml-1 font-semibold">{outcome.metrics.drift}%</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-500">Trust:</span>
              <span className="text-xs font-mono text-emerald-400 ml-1 font-semibold">{outcome.metrics.trust}%</span>
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-slate-850/60 pt-2.5">
            <span className="text-[10px] font-mono text-slate-500">Recommended: <span className="text-rose-400 font-bold">{outcome.playbook}</span></span>
            <button
              onClick={handleApply}
              className="px-3 py-1 bg-rose-700 hover:bg-rose-600 text-white font-mono text-[10px] rounded transition-all"
            >
              Commit & Refract Live
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
