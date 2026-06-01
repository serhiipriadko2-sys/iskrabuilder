import React, { useState } from 'react';
import { LedgerBlock } from '../types';
import { ShieldCheck, ServerCrash, Search, Globe, ShieldAlert, Cpu } from 'lucide-react';

interface LedgerPanelProps {
  ledger: LedgerBlock[];
  onVerifyChain: () => void;
}

export default function LedgerPanel({ ledger, onVerifyChain }: LedgerPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    status: 'idle' | 'success' | 'failed';
    message: string;
  }>({ status: 'idle', message: '' });

  const handleVerify = () => {
    // Audit the chain integrity:
    // Every block hash must match next block's previousHash (if any).
    let intact = true;
    for (let i = 1; i < ledger.length; i++) {
      if (ledger[i].previousHash !== ledger[i - 1].hash) {
        intact = false;
        break;
      }
    }

    if (intact) {
      setVerificationResult({
        status: 'success',
        message: `Ledger SECURE: Все ${ledger.length} блоков верифицированы. Хэш-цепочка целостна, дрейф не обнаружен.`
      });
    } else {
      setVerificationResult({
        status: 'failed',
        message: "CHAIN COMPROMISED: Выявлено несоответствие хэшей в истории Ledger! Требуется сброс канона."
      });
    }
    onVerifyChain();
  };

  const filteredLedger = ledger.filter(
    (block) =>
      block.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.targetTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.delta.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="ledger-history-container" className="flex flex-col h-full bg-slate-900/60 p-4 rounded-xl border border-slate-800/60">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h2 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Delta-D-Omega-Lambda Ledger
          </h2>
          <p className="text-[10px] text-slate-500 font-sans mt-0.5">Cryptometa chronological logs of Iskra state actions</p>
        </div>

        <button
          onClick={handleVerify}
          className="px-2.5 py-1 bg-emerald-700/80 hover:bg-emerald-600 font-mono text-[10px] text-emerald-100 border border-emerald-600/40 rounded transition-all"
        >
          Verify Chain
        </button>
      </div>

      {/* Verification alerts */}
      {verificationResult.status !== 'idle' && (
        <div className={`p-2.5 rounded-lg border text-xs font-sans mb-3 flex items-start gap-2 ${
          verificationResult.status === 'success'
            ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
            : 'bg-rose-950/40 border-rose-800 text-rose-200'
        }`}>
          {verificationResult.status === 'success' ? (
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-semibold">{verificationResult.status === 'success' ? 'Каноническая целостность подтверждена' : 'Нарушение канона!'}</p>
            <p className="text-[10px] opacity-90 mt-0.5 leading-relaxed">{verificationResult.message}</p>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative mb-3.5 select-none">
        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Фильтровать транзакции..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-950/60 text-xs font-mono pl-8 pr-3 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-slate-700/80 text-slate-200"
        />
      </div>

      {/* Blocks list */}
      <div className="flex-grow overflow-y-auto pr-1 space-y-3 max-h-[380px]">
        {filteredLedger.length === 0 ? (
          <div className="text-center py-6 text-[11px] font-mono text-slate-500">
            Нет транзакций, удовлетворяющих поиску
          </div>
        ) : (
          [...filteredLedger].reverse().map((block, idx) => {
            return (
              <div
                key={block.id}
                className="bg-slate-950/50 hover:bg-slate-950/80 rounded-lg p-3 border border-slate-900 duration-200 relative overflow-hidden group"
              >
                {/* Ledger Index element */}
                <span className="absolute top-2 right-2 text-[9px] font-mono text-slate-600 group-hover:text-slate-500 transition-colors">
                  #{block.id.split('-').pop()}
                </span>

                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[8.5px] font-mono px-1.5 py-0.5 rounded border ${
                    block.action === 'GENESIS'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : block.action.includes('CREATED')
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : block.action.includes('DELETED')
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                  }`}>
                    {block.action}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">
                    {new Date(block.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="mb-2">
                  <h4 className="text-[11px] font-mono text-slate-100 font-bold">
                    {block.targetTitle}
                  </h4>
                </div>

                {/* Delta / Depth Details */}
                <div className="grid grid-cols-1 gap-1.5 bg-slate-950 p-2 rounded border border-slate-900 text-[10px] font-mono text-slate-300">
                  <div>
                    <span className="text-emerald-400 font-bold mr-1">Δ (Delta):</span>
                    <span className="text-slate-200">{block.delta}</span>
                  </div>
                  <div>
                    <span className="text-blue-400 font-bold mr-1">D (Depth):</span>
                    <span className="text-slate-400 italic text-[9.5px]">{block.depth}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-900 text-[9px]">
                    <div>
                      <span className="text-purple-400 font-bold mr-1">Ω (Omega):</span>
                      <span className="font-semibold text-slate-300 bg-purple-500/10 px-1 rounded">{block.omega}% Alignment</span>
                    </div>
                    <div className="text-right">
                      <span className="text-pink-400 font-bold mr-1">Λ (Lambda):</span>
                      <span className="text-slate-400 truncate max-w-[100px] inline-block align-bottom">{block.lambda}</span>
                    </div>
                  </div>
                </div>

                {/* Hash block signatures */}
                <div className="mt-2.5 pt-1.5 border-t border-slate-900 text-[8.5px] font-mono text-slate-600 flex flex-col gap-0.5">
                  <div className="truncate" title={`Hash: ${block.hash}`}>
                    <span className="text-slate-500">HASH:</span> {block.hash}
                  </div>
                  <div className="truncate" title={`Prev: ${block.previousHash}`}>
                    <span className="text-slate-500">PREV:</span> {block.previousHash}
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
