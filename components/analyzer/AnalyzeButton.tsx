'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

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
      className="check-btn"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-white" />
          <span>Examining message…</span>
        </>
      ) : (
        <span>Check this message</span>
      )}
    </button>
  );
}
