'use client';

import React from 'react';
import { TriggerDetail } from '@/lib/ai/types';
import { CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

interface TriggerListProps {
  triggers: TriggerDetail[];
}

export function TriggerList({ triggers }: TriggerListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Deceptive Trigger Analysis (Deterministic Weights)
        </h4>
        <span className="text-[11px] text-slate-500">6 Core Psychological Signals</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {triggers.map((trigger) => {
          const isDetected = trigger.detected;
          const confidencePct = Math.round(trigger.confidence * 100);

          return (
            <div
              key={trigger.key}
              className={`p-3 rounded-xl border transition-all ${
                isDetected
                  ? 'bg-rose-950/20 border-rose-500/40 shadow-sm shadow-rose-950/30'
                  : 'bg-slate-900/30 border-slate-800/80 opacity-75'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {isDetected ? (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-slate-600 shrink-0" />
                  )}
                  <span
                    className={`text-xs font-semibold truncate ${
                      isDetected ? 'text-rose-200' : 'text-slate-400'
                    }`}
                  >
                    {trigger.label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400">
                    wt: {trigger.weight}
                  </span>
                  <span
                    className={`text-xs font-mono font-bold ${
                      isDetected ? 'text-rose-400' : 'text-slate-500'
                    }`}
                  >
                    {confidencePct}%
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                {trigger.description}
              </p>

              {/* Confidence meter */}
              <div className="w-full bg-slate-800/60 h-1.5 rounded-full mt-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isDetected
                      ? trigger.confidence > 0.7
                        ? 'bg-rose-500'
                        : 'bg-amber-500'
                      : 'bg-slate-700'
                  }`}
                  style={{ width: `${Math.max(4, confidencePct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
