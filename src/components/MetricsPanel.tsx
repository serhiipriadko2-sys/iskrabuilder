import React from 'react';
import { IskraMetrics, PlaybookType } from '../types';
import { Shield, AlertTriangle, Play, HelpCircle, CheckCircle2 } from 'lucide-react';

interface MetricsPanelProps {
  metrics: IskraMetrics;
  onUpdateMetric: (key: keyof IskraMetrics, value: number) => void;
}

export function calculatePlaybook(metrics: IskraMetrics): {
  playbook: PlaybookType;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  temperature: number;
} {
  if (metrics.trust < 30) {
    return {
      playbook: 'CLOSE_HONESTLY',
      title: 'CLOSE_HONESTLY (Предел доверия)',
      description: 'Доверие критически снижено. Требуется искренний останов и деконструкция ожиданий.',
      color: 'text-red-400',
      bgColor: 'bg-red-950/40',
      borderColor: 'border-red-800/60',
      temperature: 0.1
    };
  }
  if (metrics.pain > 60 || metrics.chaos > 70) {
    return {
      playbook: 'FORCE_CRISIS',
      title: 'FORCE_CRISIS (Острый кризис)',
      description: 'Высокая энтропия. Форсирован Каин для размягчения иллюзий и фиксации границы.',
      color: 'text-rose-500',
      bgColor: 'bg-rose-950/30',
      borderColor: 'border-rose-800/50',
      temperature: 0.3
    };
  }
  if (metrics.drift > 50) {
    return {
      playbook: 'FORCE_ISKRIV_1',
      title: 'FORCE_ISKRIV_1 (Кэш-аудит дрейфа)',
      description: 'Выявлен дрейф между каноном и деплоем. Форсирован Искрив для сверки SoT.',
      color: 'text-amber-500',
      bgColor: 'bg-amber-950/30',
      borderColor: 'border-amber-800/50',
      temperature: 0.4
    };
  }
  if (metrics.clarity < 45) {
    return {
      playbook: 'FORCE_SHADOW',
      title: 'FORCE_SHADOW (Сумеречное удержание)',
      description: 'Низкая ясность канона. Активатор Анхантры для замедления и снижения шума.',
      color: 'text-purple-400',
      bgColor: 'bg-purple-950/30',
      borderColor: 'border-purple-800/50',
      temperature: 0.6
    };
  }
  return {
    playbook: 'PROCEED',
    title: 'PROCEED (Континуальное развитие)',
    description: 'Система полностью стабильна. Равновесие удерживается.',
    color: 'text-emerald-400',
    bgColor: 'bg-slate-900/60',
    borderColor: 'border-emerald-800/40',
    temperature: 0.7
  };
}

export default function MetricsPanel({ metrics, onUpdateMetric }: MetricsPanelProps) {
  const currentLevel = calculatePlaybook(metrics);

  const getMetricStyle = (key: keyof IskraMetrics, val: number) => {
    if (['pain', 'chaos', 'drift', 'interrupt', 'ctxSwitch'].includes(key)) {
      if (val > 60) return { text: 'text-rose-400', bar: 'bg-rose-500' };
      if (val > 35) return { text: 'text-amber-400', bar: 'bg-amber-500' };
      return { text: 'text-emerald-500', bar: 'bg-emerald-600' };
    } else {
      if (val < 40) return { text: 'text-rose-400', bar: 'bg-rose-500' };
      if (val < 65) return { text: 'text-amber-400', bar: 'bg-amber-500' };
      return { text: 'text-emerald-400', bar: 'bg-emerald-500' };
    }
  };

  const metricMeta: Record<keyof IskraMetrics, { label: string; desc: string }> = {
    clarity: { label: 'Clarity (Ясность)', desc: 'Точность понимания канонических рамок' },
    trust: { label: 'Trust (Доверие)', desc: 'Связующая прочность между Семёном и контуром Искры' },
    pain: { label: 'Pain (Порог боли)', desc: 'Реакция верификации на нестыковки интерфейса' },
    chaos: { label: 'Chaos (Хаос)', desc: 'Общая неопределенность и когнитивный шум в системе' },
    drift: { label: 'Drift (Дрейф)', desc: 'Расхождение между репозиторием и живой ОЗУ-памятью' },
    echo: { label: 'Echo (Эхо)', desc: 'Степень застревания в зеркальном самообмане' },
    rhythm: { label: 'Rhythm (Такт)', desc: 'Регулярность транзакций и коммитов в Ledger' },
    silence_mass: { label: 'Silence Mass (Вес тишины)', desc: 'Амортизатор шума и поспешных выводов' },
    mirror_sync: { label: 'Mirror Sync (Синхронность)', desc: 'Консенсус рантайма и Supabase live snapshot' },
    interrupt: { label: 'Interrupts (Прерывания)', desc: 'Доля абортированных или упавших шагов' },
    ctxSwitch: { label: 'Ctx Switch (Переключения)', desc: 'Скорость метания приоритетов' }
  };

  return (
    <div id="metrics-panel-container" className="flex flex-col gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800/60">
      {/* SLO-GUARD HEADER */}
      <div className={`p-3.5 rounded-lg border ${currentLevel.bgColor} ${currentLevel.borderColor} relative overflow-hidden`}>
        <div className="absolute top-1 right-1 opacity-10">
          <Shield className="w-12 h-12" />
        </div>
        <div className="flex items-center gap-2 mb-1.5">
          <Shield className={`w-4 h-4 ${currentLevel.color}`} />
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">SLO-GUARD LEVEL</span>
        </div>
        <h2 className={`text-sm font-mono font-bold ${currentLevel.color}`}>{currentLevel.title}</h2>
        <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">{currentLevel.description}</p>
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mt-2.5 pt-2 border-t border-slate-800/40">
          <span>Active Temp: {currentLevel.temperature}</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Auto-Protective
          </span>
        </div>
      </div>

      {/* METRIC CHIPS LIST */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-mono text-slate-400 tracking-wider uppercase">IskraMetrics Complex (11 Ω-Layers)</h3>
          <span className="text-[10px] font-mono text-slate-500">Live Calibration</span>
        </div>

        <div className="space-y-3 max-h-[290px] overflow-y-auto pr-1">
          {(Object.keys(metrics) as Array<keyof IskraMetrics>).map((key) => {
            const val = metrics[key];
            const meta = metricMeta[key] || { label: key, desc: '' };
            const style = getMetricStyle(key, val);

            return (
              <div key={key} className="group relative bg-slate-950/40 border border-slate-900 hover:border-slate-800/80 p-2 rounded-lg transition-all">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-mono text-slate-200">{meta.label}</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={val}
                      onChange={(e) => onUpdateMetric(key, Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-10 bg-slate-900 border border-slate-800 text-[10px] text-center font-mono py-0.5 rounded focus:outline-none focus:border-slate-700"
                    />
                    <span className={`text-xs font-mono font-semibold ${style.text}`}>{val}%</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800/40 rounded-full h-1 overflow-hidden">
                  <div className={`h-full ${style.bar} transition-all duration-300`} style={{ width: `${val}%` }} />
                </div>

                {/* Tooltip on hover */}
                <div className="text-[9px] text-slate-400 mt-1 opacity-80 font-sans group-hover:opacity-100 transition-opacity">
                  {meta.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
