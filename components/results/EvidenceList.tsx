'use client';

import React from 'react';
import { Quote, AlertOctagon } from 'lucide-react';

interface EvidenceListProps {
  evidence: string[];
}

export function EvidenceList({ evidence }: EvidenceListProps) {
  if (!evidence || evidence.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <AlertOctagon className="w-4 h-4 text-amber-400" />
        <h4 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Key Deceptive Evidence & Quotes
        </h4>
      </div>

      <div className="space-y-2">
        {evidence.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-300 text-xs sm:text-sm leading-relaxed"
          >
            <Quote className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-1 opacity-70" />
            <span className="flex-1">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
