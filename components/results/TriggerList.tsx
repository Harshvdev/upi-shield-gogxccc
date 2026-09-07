'use client';

import React from 'react';
import { TriggerDetail } from '@/lib/ai/types';

interface TriggerListProps {
  triggers: TriggerDetail[];
}

export function TriggerList({ triggers }: TriggerListProps) {
  if (!triggers || triggers.length === 0) return null;

  // Split into detected and absent triggers so detected appear first, followed by clean/absent ones
  const detectedTriggers = triggers.filter((t) => t.detected);
  const absentTriggers = triggers.filter((t) => !t.detected);

  // If there are many absent triggers, show up to 2-3 key absent ones to prove the system isn't just flagging blindly
  const displayedAbsent = absentTriggers.slice(0, 3);
  const allToDisplay = [...detectedTriggers, ...displayedAbsent];

  return (
    <section className="space-y-3">
      <h3 className="text-[15px] font-semibold text-[var(--ink)] m-0">
        Why was this flagged?
      </h3>

      <ul className="triggers">
        {allToDisplay.map((trigger) => {
          const isDetected = trigger.detected;

          return (
            <li key={trigger.key} className={!isDetected ? 'off' : ''}>
              <div className={`trigger-mark ${!isDetected ? 'off' : ''}`} />
              <div className="trigger-body">
                <strong>{trigger.label}</strong>
                <span>
                  {isDetected
                    ? trigger.description
                    : 'Not present in this message.'}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
