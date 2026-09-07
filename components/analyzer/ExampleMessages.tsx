'use client';

import React from 'react';
import { DEMO_SCENARIOS, DemoScenario } from '@/lib/demo/examples';
import { ShieldAlert, ShieldCheck, Sparkles } from 'lucide-react';

interface ExampleMessagesProps {
  onSelect: (scenario: DemoScenario) => void;
  disabled?: boolean;
}

export function ExampleMessages({ onSelect, disabled }: ExampleMessagesProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-400 uppercase">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Demo Scenarios (Instant 90s Testing)</span>
        </div>
        <span className="text-[11px] text-slate-500">Click to load test case</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {DEMO_SCENARIOS.map((scenario) => {
          const isHigh = scenario.category === 'high_risk';

          return (
            <button
              key={scenario.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(scenario)}
              className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-800/80 bg-slate-900/30 hover:bg-slate-800/60 hover:border-slate-700 text-left transition-all duration-150 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div
                className={`p-1.5 rounded-lg mt-0.5 shrink-0 ${
                  isHigh
                    ? 'bg-rose-500/10 text-rose-400 group-hover:bg-rose-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20'
                }`}
              >
                {isHigh ? (
                  <ShieldAlert className="w-3.5 h-3.5" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-slate-200 truncate group-hover:text-white">
                    {scenario.title}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">
                  {scenario.source.toUpperCase()} • {scenario.expectedRisk} RISK
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
