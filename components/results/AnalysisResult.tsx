'use client';

import React from 'react';
import { AnalysisResponseDTO } from '@/lib/ai/types';
import { ThreatMeter } from './ThreatMeter';
import { RiskBadge } from './RiskBadge';
import { TriggerList } from './TriggerList';
import { EvidenceList } from './EvidenceList';
import { SafetyCard } from './SafetyCard';
import { RotateCcw, Cpu, ShieldAlert, CheckCircle, Camera } from 'lucide-react';
import { UPIIntentCard } from '../analyzer/UPIIntentCard';

interface AnalysisResultProps {
  result: AnalysisResponseDTO;
  onReset: () => void;
}

export function AnalysisResult({ result, onReset }: AnalysisResultProps) {
  const isHigh = result.riskLevel === 'HIGH';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Top Banner & Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <RiskBadge
          level={result.riskLevel}
          scamType={result.scamType}
          scamDetected={result.scamDetected}
        />

        <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-400">
          {result.imageAnalyzed && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950/60 border border-blue-500/40 font-mono text-[11px] text-blue-300">
              <Camera className="w-3.5 h-3.5 text-blue-400" />
              <span>Multimodal Screenshot OCR</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 font-mono text-[11px]">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI: {result.providerUsed === 'gemini' ? 'Gemini 3.8 Flash' : 'Groq Qwen 3.8 27B'}</span>
          </div>

          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>New Check</span>
          </button>
        </div>
      </div>

      {/* Render Parsed UPI Intent Card if present */}
      {result.upiDetails && (
        <UPIIntentCard intent={result.upiDetails} />
      )}


      {/* Main Grid: Threat Meter & Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Threat Meter Card */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl p-4 flex flex-col justify-center items-center">
          <ThreatMeter score={result.riskScore} level={result.riskLevel} />
          
          <div className="w-full mt-2 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/60">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Threat Score</span>
              <span className="font-mono font-bold text-base text-white">{result.riskScore} / 100</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/60">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Scam Detected</span>
              <span className={`font-mono font-bold text-base ${result.scamDetected ? 'text-rose-400' : 'text-emerald-400'}`}>
                {result.scamDetected ? 'YES' : 'NO'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Deceptive Triggers Matrix */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl p-5 sm:p-6">
          <TriggerList triggers={result.triggerDetails} />
        </div>
      </div>

      {/* Deterministic Safety Overrides / Rules Log */}
      {result.appliedRules && result.appliedRules.length > 0 && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/15 text-amber-300 text-xs">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[11px] mb-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Deterministic Risk Policy Safeguards Applied:</span>
          </div>
          <ul className="space-y-1 list-disc list-inside text-amber-200/90 pl-1">
            {result.appliedRules.map((rule, idx) => (
              <li key={idx}>{rule}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Quoted Evidence */}
      {result.evidence && result.evidence.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl p-5">
          <EvidenceList evidence={result.evidence} />
        </div>
      )}

      {/* Bilingual Safety Warning Card */}
      <SafetyCard
        englishWarning={result.englishWarning}
        hindiWarning={result.hindiWarning}
        recommendedAction={result.recommendedAction}
        riskLevel={result.riskLevel}
      />
    </div>
  );
}
