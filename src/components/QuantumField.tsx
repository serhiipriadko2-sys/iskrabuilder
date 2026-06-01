import React from 'react';
import { IskraVoice } from '../types';
import { Cpu, Zap, RotateCcw } from 'lucide-react';

interface QuantumFieldProps {
  voices: IskraVoice[];
  activeVoiceKey: string;
  onSelectVoice: (key: string) => void;
  onResetProbabilities: () => void;
  metricsState: {
    clarity: number;
    pain: number;
    chaos: number;
    drift: number;
    trust: number;
  };
}

export default function QuantumField({
  voices,
  activeVoiceKey,
  onSelectVoice,
  onResetProbabilities,
  metricsState
}: QuantumFieldProps) {

  // Dynamic probabilities calculations based on current metrics to represent true live state flow!
  // If chaos is high, huyndun probability rises.
  // If pain/drift is high, kain and iskriv rise.
  // If trust is low, kain/anhantra rise.
  // Else, main Iskra and Сэм retain primacy.
  const calculateDynamicProbability = (voice: IskraVoice): number => {
    let base = voice.probability;
    if (voice.key === 'huyndun') {
      base += Math.round(metricsState.chaos * 0.4);
    }
    if (voice.key === 'kain') {
      base += Math.round(metricsState.pain * 0.4);
    }
    if (voice.key === 'iskriv') {
      base += Math.round(metricsState.drift * 0.5);
    }
    if (voice.key === 'anhantra') {
      base += Math.round((100 - metricsState.clarity) * 0.25);
    }
    if (voice.key === 'sam') {
      base += Math.round(metricsState.clarity * 0.2);
    }
    if (voice.key === 'iskra') {
      base += Math.round((metricsState.clarity + metricsState.trust) * 0.15);
    }
    return Math.min(100, Math.max(0, base));
  };

  return (
    <div id="quantum-field-container" className="flex flex-col gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800/60 h-full">
      <div className="flex justify-between items-center mb-1">
        <div>
          <h3 className="text-xs font-mono text-slate-300 tracking-wider uppercase flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" /> Quantum Voice Field
          </h3>
          <p className="text-[10px] text-slate-500 font-sans mt-0.5">Click to collapse probability wave into a single Voice</p>
        </div>
        <button
          onClick={onResetProbabilities}
          title="Сбросить коллапс волны к вероятностному распределению"
          className="p-1 px-2 hover:bg-slate-800 border border-slate-800 hover:border-slate-700/80 rounded flex items-center gap-1 text-[10px] font-mono text-slate-400 transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> Reset Wave
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-grow overflow-y-auto pr-1">
        {voices.map((voice) => {
          const dynamicProb = calculateDynamicProbability(voice);
          const isActive = activeVoiceKey === voice.key;

          return (
            <div
              key={voice.id}
              onClick={() => onSelectVoice(voice.key)}
              className={`p-3 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between select-none relative overflow-hidden ${
                isActive
                  ? 'bg-slate-950 border-emerald-500/80 shadow-emerald-500/10'
                  : 'bg-slate-950/40 border-slate-900 hover:border-slate-800/80 hover:bg-slate-950/60'
              }`}
            >
              {/* Highlight background element */}
              {isActive && (
                <div className="absolute top-0 right-0 w-2 h-2 rounded-bl-lg" style={{ backgroundColor: voice.color }} />
              )}

              <div>
                <div className="flex justify-between items-start mb-1.5">
                  <span className="text-xs font-mono font-bold tracking-tight text-slate-200 duration-200" style={{ color: isActive ? voice.color : '#e2e8f0' }}>
                    {voice.name}
                  </span>
                  <div className="flex items-center gap-1">
                    {isActive && <Zap className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />}
                    <span className="text-[10px] font-mono text-slate-400 font-semibold">
                      {isActive ? 'COLLAPSED (100%)' : `${dynamicProb}%`}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] font-sans text-slate-300 leading-snug line-clamp-2">
                  {voice.character}
                </p>
              </div>

              <div className="mt-2.5 pt-1.5 border-t border-slate-900/40 text-[9px] font-mono italic text-slate-500 line-clamp-1">
                "{voice.phrase}"
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
