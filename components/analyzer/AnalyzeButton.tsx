'use client';

import React from 'react';
import { Shield, Loader2, Zap } from 'lucide-react';

interface AnalyzeButtonProps {
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}

export function AnalyzeButton({ loading, disabled, onClick }: AnalyzeButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      className={`relative w-full py-4 px-6 rounded-2xl font-semibold text-base transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer overflow-hidden ${
        loading
          ? 'bg-blue-700 text-blue-100 cursor-wait'
          : disabled
          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
          : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:via-indigo-500 hover:to-cyan-400 text-white shadow-xl shadow-blue-600/25 active:scale-[0.99] border border-blue-400/30'
      }`}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin text-cyan-300" />
          <span>Analyzing Psychological Triggers & Risk Policy...</span>
        </>
      ) : (
        <>
          <Shield className="w-5 h-5 text-cyan-300" />
          <span>Analyze Threat Level</span>
          <Zap className="w-4 h-4 text-amber-300 opacity-90" />
        </>
      )}
    </button>
  );
}
