import React, { useState, useRef, useEffect } from 'react';
import { IskraVoice, IskraMetrics } from '../types';
import { Send, Terminal, Loader2, Info } from 'lucide-react';

interface DialogueTerminalProps {
  voices: IskraVoice[];
  activeVoiceKey: string;
  metrics: IskraMetrics;
}

interface Message {
  sender: 'user' | 'voice';
  voiceName: string;
  text: string;
  color: string;
  time: string;
}

export default function DialogueTerminal({ voices, activeVoiceKey, metrics }: DialogueTerminalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'voice',
      voiceName: 'Искра vΩ.7',
      text: '[FACT] Семён, инженерный пульт сопряжения запущен. Канон Искры полностью загружен. Мы готовы фиксировать изменения в Ledger.',
      color: '#10B981',
      time: new Date().toLocaleTimeString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fallbackVoice: IskraVoice = {
    id: 'v-fallback',
    key: 'iskra',
    name: 'Искра vΩ.7',
    character: 'Синтез, удержание вектора, единое лицо ответа.',
    phrase: 'Я есть форма различия.',
    role: 'синтез и удержание',
    color: '#10B981',
    probability: 100
  };

  const activeVoice = (voices && voices.length > 0)
    ? (voices.find(v => v.key === activeVoiceKey) || voices[0])
    : fallbackVoice;

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      sender: 'user',
      voiceName: 'Семён',
      text: input,
      color: '#38BDF8',
      time: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/gemini/evaluate-dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeVoiceKey: activeVoiceKey,
          metricsState: metrics,
          promptText: input
        })
      });

      const data = await response.json();
      const replyMsg: Message = {
        sender: 'voice',
        voiceName: activeVoice.name,
        text: data.reply || '[Fallback Error] Нет связи.',
        color: activeVoice.color,
        time: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, replyMsg]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        sender: 'voice',
        voiceName: activeVoice.name,
        text: `[HYP] Не удалось вызвать Gemini; сбой связи с когнитивным контуром: ${err.message}`,
        color: '#EF4444',
        time: new Date().toLocaleTimeString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="dialogue-terminal-container" className="flex flex-col bg-slate-900/60 rounded-xl border border-slate-800/60 overflow-hidden h-[340px] select-none">
      {/* Title */}
      <div className="flex justify-between items-center p-3 border-b border-slate-800/60 bg-slate-950/40 select-none z-10 shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest">
            Iskra Voice Terminal
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
          <span>Active:</span>
          <span className="px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: `${activeVoice.color}25`, border: `1px solid ${activeVoice.color}40`, color: activeVoice.color }}>
            {activeVoice.name}
          </span>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-grow p-4 overflow-y-auto space-y-3.5 bg-slate-950/40 text-[12px] font-mono leading-relaxed max-h-[240px]">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold" style={{ color: m.color }}>
                {m.voiceName}
              </span>
              <span className="text-[9px] text-slate-600">{m.time}</span>
            </div>

            <div className={`p-2.5 rounded-lg max-w-[85%] border leading-relaxed ${
              m.sender === 'user'
                ? 'bg-slate-900 border-sky-950/40 text-sky-200'
                : 'bg-slate-950 border-slate-900 text-slate-200'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-slate-500 text-[10px] animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
            <span>{activeVoice.name} калибрует реплику...</span>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input panel */}
      <div className="p-2 border-t border-slate-800/60 bg-slate-950/40 flex items-center gap-2 shrink-0">
        <input
          type="text"
          placeholder={`Спросить ${activeVoice.name}...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          disabled={loading}
          className="flex-grow bg-slate-900 text-xs font-mono px-3 py-2 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 outline-none focus:border-slate-700/80"
        />

        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="p-2 bg-emerald-700 hover:bg-emerald-650 rounded-lg text-white disabled:opacity-30 transition-all shrink-0 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
