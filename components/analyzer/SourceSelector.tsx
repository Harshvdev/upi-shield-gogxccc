'use client';

import React from 'react';
import { MessageSource } from '@/lib/ai/types';

interface SourceSelectorProps {
  selected: MessageSource;
  onChange: (source: MessageSource) => void;
  disabled?: boolean;
}

const SOURCES: {
  id: MessageSource;
  label: string;
}[] = [
  { id: 'sms', label: 'SMS' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'payment_note', label: 'Payment note' },
  { id: 'upi_intent', label: 'UPI link' },
  { id: 'screenshot', label: 'Screenshot' },
];

export function SourceSelector({ selected, onChange, disabled }: SourceSelectorProps) {
  return (
    <div className="tabs" role="tablist" aria-label="Message source channel">
      {SOURCES.map((source) => {
        const isActive = selected === source.id;

        return (
          <button
            key={source.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={disabled}
            onClick={() => onChange(source.id)}
            className={`tab ${isActive ? 'active' : ''} ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {source.label}
          </button>
        );
      })}
    </div>
  );
}


