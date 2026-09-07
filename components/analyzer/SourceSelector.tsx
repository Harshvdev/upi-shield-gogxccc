'use client';

import React from 'react';
import { MessageSource } from '@/lib/ai/types';
import { MessageSquare, MessageCircle, CreditCard, QrCode, Camera } from 'lucide-react';

interface SourceSelectorProps {
  selected: MessageSource;
  onChange: (source: MessageSource) => void;
  disabled?: boolean;
}

const SOURCES: {
  id: MessageSource;
  label: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  hint: string;
}[] = [
  {
    id: 'sms',
    label: 'SMS Message',
    badge: 'Telco / SMS',
    icon: MessageSquare,
    hint: 'Text message from sender headers (e.g., VM-SBIINB, VK-BESCOM)',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    badge: 'Instant Chat',
    icon: MessageCircle,
    hint: 'Chat message from unknown or forwarded business contacts',
  },
  {
    id: 'payment_note',
    label: 'Payment Note',
    badge: 'Remarks',
    icon: CreditCard,
    hint: 'UPI collect request remarks or transaction notes',
  },
  {
    id: 'upi_intent',
    label: 'UPI Intent',
    badge: 'upi://pay',
    icon: QrCode,
    hint: 'Raw UPI deep-link URI or QR payload parameters',
  },
  {
    id: 'screenshot',
    label: 'Screenshot',
    badge: 'Multimodal OCR',
    icon: Camera,
    hint: 'Upload mobile screenshot of suspicious SMS, WhatsApp, or UPI popup',
  },
];

export function SourceSelector({ selected, onChange, disabled }: SourceSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
        Message Channel / Source
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {SOURCES.map((source) => {
          const Icon = source.icon;
          const isSelected = selected === source.id;

          return (
            <button
              key={source.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(source.id)}
              className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-blue-600/15 border-blue-500/80 text-white shadow-lg shadow-blue-500/10'
                  : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 hover:border-slate-700'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div
                  className={`p-1.5 rounded-lg ${
                    isSelected ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/60 text-slate-400">
                  {source.badge}
                </span>
              </div>
              <div className="text-xs font-semibold leading-tight">{source.label}</div>
              <div className="text-[10px] text-slate-500 truncate w-full mt-0.5" title={source.hint}>
                {source.hint}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

