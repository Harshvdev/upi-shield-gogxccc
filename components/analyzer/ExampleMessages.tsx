'use client';

import React from 'react';
import { DEMO_SCENARIOS, DemoScenario } from '@/lib/demo/examples';

interface ExampleMessagesProps {
  onSelect: (scenario: DemoScenario) => void;
  disabled?: boolean;
}

// Map scenarios to concise, natural labels matching the paper notice metaphor
const SCENARIO_LABELS: Record<string, string> = {
  'electricity-disconnection': 'BESCOM disconnection notice',
  'refund-verification': '₹1 refund trap',
  'fake-bank-authority': 'SBI account block',
  'benign-utility-bill': 'Genuine electricity bill',
  'benign-refund-status': 'Genuine refund update',
  'kyc-expiry': 'UPI KYC expiry threat',
  'upi-intent-reversal': 'UPI intent refund trap',
  'cashback-lottery-trap': 'Diwali lottery fee',
};

export function ExampleMessages({ onSelect, disabled }: ExampleMessagesProps) {
  // Show the 4 primary examples first, followed by others if desired
  const displayScenarios = DEMO_SCENARIOS.slice(0, 5);

  return (
    <div className="examples">
      <span className="text-[var(--ink-faint)] font-normal">Try:</span>
      {displayScenarios.map((scenario) => (
        <button
          key={scenario.id}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(scenario)}
        >
          {SCENARIO_LABELS[scenario.id] || scenario.title}
        </button>
      ))}
    </div>
  );
}

