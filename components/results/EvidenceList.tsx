'use client';

import React from 'react';

interface EvidenceListProps {
  evidence: string[];
}

export function EvidenceList({ evidence }: EvidenceListProps) {
  if (!evidence || evidence.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h3 className="text-[15px] font-semibold text-[var(--ink)] m-0">
        Quoted from the message
      </h3>

      <div className="space-y-2">
        {evidence.map((item, idx) => {
          const cleanItem = item.startsWith('"') && item.endsWith('"') ? item : `"${item}"`;
          return (
            <div key={idx} className="evidence">
              {cleanItem}
            </div>
          );
        })}
      </div>
    </section>
  );
}
