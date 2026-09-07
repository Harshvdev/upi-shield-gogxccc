'use client';

import React, { useMemo } from 'react';
import { MessageSource } from '@/lib/ai/types';
import { ScreenshotUploader, ScreenshotData } from './ScreenshotUploader';
import { UPIIntentCard } from './UPIIntentCard';
import { parseUPIIntent } from '@/lib/upi/intent';

interface MessageInputProps {
  value: string;
  source: MessageSource;
  onChange: (val: string) => void;
  onClear: () => void;
  onSubmit: () => void;
  disabled?: boolean;
  screenshot?: ScreenshotData | null;
  onScreenshotChange?: (data: ScreenshotData | null) => void;
  onSourceChange?: (source: MessageSource) => void;
}

const PLACEHOLDERS: Record<MessageSource, string> = {
  sms: 'Paste the SMS message here…',
  whatsapp: 'Paste the WhatsApp message or chat text here…',
  payment_note: 'Paste the UPI collect note or transaction remarks…',
  upi_intent: 'Paste raw UPI deep-link URI (upi://pay?...) or QR string…',
  screenshot: 'Optional: add context or notes from the screenshot (or leave blank if image contains all details)…',
};

export function MessageInput({
  value,
  source,
  onChange,
  onClear,
  onSubmit,
  disabled,
  screenshot,
  onScreenshotChange,
  onSourceChange,
}: MessageInputProps) {
  const maxLength = 4000;
  const charCount = value.length;

  // Real-time parsed UPI intent if URI is present
  const parsedIntent = useMemo(() => {
    if (source === 'upi_intent' || value.toLowerCase().includes('upi://pay')) {
      const parsed = parseUPIIntent(value);
      return parsed.isUPIUri ? parsed : null;
    }
    return null;
  }, [value, source]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        if (text.trim().toLowerCase().startsWith('upi://pay') && onSourceChange) {
          onSourceChange('upi_intent');
        }
        onChange(text);
      }
    } catch {
      // Browser permissions fallback
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      const hasContent = value.trim().length >= 3 || (source === 'screenshot' && screenshot);
      if (hasContent && !disabled) {
        onSubmit();
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* If in Screenshot mode, display Screenshot Uploader */}
      {source === 'screenshot' && onScreenshotChange && (
        <div className="mb-4">
          <ScreenshotUploader
            image={screenshot || null}
            onImageSelected={onScreenshotChange}
            onImageRemoved={() => onScreenshotChange(null)}
            disabled={disabled}
          />
        </div>
      )}

      {/* Text Area Input */}
      <div className="relative">
        <textarea
          id="msg"
          rows={source === 'screenshot' ? 3 : 5}
          disabled={disabled}
          value={value}
          onChange={(e) => {
            const val = e.target.value;
            if (val.trim().toLowerCase().startsWith('upi://pay') && source !== 'upi_intent' && onSourceChange) {
              onSourceChange('upi_intent');
            }
            onChange(val);
          }}
          onKeyDown={handleKeyDown}
          placeholder={PLACEHOLDERS[source]}
          maxLength={maxLength}
          className="w-full min-h-[120px] bg-white border border-[var(--line)] rounded-[6px] p-3.5 sm:p-4 text-[15px] text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none focus:border-[var(--navy)] focus:ring-3 focus:ring-[rgba(30,58,95,0.08)] resize-y leading-relaxed transition-colors"
        />

        <div className="flex items-center justify-between pt-1.5 text-[12px] text-[var(--ink-faint)]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={disabled}
              onClick={handlePaste}
              className="text-[var(--ink-soft)] hover:text-[var(--navy)] underline underline-offset-2 transition-colors cursor-pointer"
            >
              Paste from clipboard
            </button>
            {value.length > 0 && (
              <button
                type="button"
                disabled={disabled}
                onClick={onClear}
                className="text-[var(--ink-faint)] hover:text-[var(--stamp)] underline underline-offset-2 transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">Ctrl + Enter to check</span>
            <span className="font-mono">{charCount}/{maxLength}</span>
          </div>
        </div>
      </div>

      {/* Real-time parsed UPI Intent Preview */}
      {parsedIntent && (
        <div className="pt-2">
          <UPIIntentCard intent={parsedIntent} />
        </div>
      )}
    </div>
  );
}
