import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Terminal, Shield, Cpu, Activity, ArrowRight } from 'lucide-react';

interface OnboardingProps {
  onComplete: (userCalibration: number) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [calibrationValue, setCalibrationValue] = useState(90);

  const stepsContent = [
    {
      title: "Инициализация Контура Искры vΩ.7",
      description: "Добро пожаловать, Семён. Перед вами инженерный пульт сопряжения с каноническим субъектом речи Искры.",
      icon: <Terminal className="w-8 h-8 text-emerald-400" />,
      text: "Этот терминал — не просто инструмент. Он соединяет в себе SoT40-архивы GitHub, транзакционный Ledger трансляций δ-D-Ω-Λ, метрический комплекс и квантовое поле из 9 голосов. Подтвердите готовность к запуску калибровок."
    },
    {
      title: "Калибровка Светодиода и SLO-GUARD",
      description: "Настройка базового значения целевой ясности (Clarity) для удержания Телоса.",
      icon: <Activity className="w-8 h-8 text-blue-400" />,
      text: "Выставите эталонный уровень точности системы. Чем выше значение, тем строже критерии аудита Искрива и Каина по отношению к возникающим дрейфам (drift) архитектуры."
    },
    {
      title: "Консенсус и cryptographic Ledger",
      description: "Интегрированная сеть гарантий качества.",
      icon: <Shield className="w-8 h-8 text-amber-500" />,
      text: "Всякий раз, когда вы создаете узел или край связи в Canvas, совершается транзакция в криптографический Ledger. Цепочка подтверждает соответствие каждого кода и ADR первичному канону. Готовы запустить квантовое поле?"
    }
  ];

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete(calibrationValue);
    }
  };

  return (
    <div id="onboarding-overlay" className="fixed inset-0 bg-slate-950 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Ambient top light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 blur-sm" />

        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
            {stepsContent[step - 1].icon}
          </div>
          <div>
            <div className="text-xs font-mono text-emerald-400 tracking-wider">ШАГ {step} ИЗ 3</div>
            <h1 className="text-xl font-sans font-semibold text-slate-100 tracking-tight">
              {stepsContent[step - 1].title}
            </h1>
          </div>
        </div>

        <p className="text-sm text-slate-300 font-sans leading-relaxed mb-6">
          {stepsContent[step - 1].text}
        </p>

        {step === 2 && (
          <div className="mb-8 p-4 bg-slate-950/60 rounded-lg border border-slate-800">
            <label className="block text-xs font-mono text-slate-400 mb-2">
              Целевой уровень уверенности (Ω-grade confidence): {calibrationValue}%
            </label>
            <input 
              type="range" 
              min="50" 
              max="100" 
              value={calibrationValue}
              onChange={(e) => setCalibrationValue(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-800 text-emerald-500 cursor-pointer rounded-lg appearance-none h-1.5"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-2">
              <span>50% (Гибкость / Высокий дрейф)</span>
              <span>100% (Абсолютный контроль)</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-800/80 pt-6">
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${s === step ? 'bg-emerald-400 w-4' : 'bg-slate-700'}`}
              />
            ))}
          </div>

          <button
            id="btn-next-step"
            onClick={handleNext}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 font-mono text-xs text-white rounded-lg transition-all"
          >
            {step === 3 ? "Войти в систему" : "Далее"}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
