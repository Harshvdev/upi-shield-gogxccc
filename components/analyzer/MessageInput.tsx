'use client';

import React, { useMemo } from 'react';
import { MessageSource } from '@/lib/ai/types';
import { Clipboard, Trash2, Camera, QrCode } from 'lucide-react';
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
  sms: 'e.g., "Dear customer, your electricity power connection will be disconnected today. Pay ₹50 immediately using this UPI ID..."',
  whatsapp: 'e.g., "Your refund verification failed. Send ₹1 now to UPI ID: refund.verify@paytm to receive your pending ₹5,000 refund..."',
  payment_note: 'e.g., "Verification fee for instant cashback claim. Pay ₹25 to release prize amount. Note: Non-refundable."',
  upi_intent: 'e.g., "upi://pay?pa=refund.verification@paytm&pn=RefundDesk&am=1.00&tn=Verification+fee"',
  screenshot: 'Optional: add context or notes from the screenshot (or leave blank if image contains all details)...',
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
        // Auto-switch to UPI Intent if pasted text starts with upi://pay
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
    <div className="space-y-4">
      {/* If in Screenshot mode, display Screenshot Uploader */}
      {source === 'screenshot' && onScreenshotChange && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-blue-400" />
              <span>Upload Mobile Screenshot</span>
            </label>
            <span className="text-[11px] text-slate-500">Gemini 3.8 Flash Multimodal OCR</span>
          </div>
          <ScreenshotUploader
            image={screenshot || null}
            onImageSelected={onScreenshotChange}
            onImageRemoved={() => onScreenshotChange(null)}
            disabled={disabled}
          />
        </div>
      )}

      {/* Text Area Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
            {source === 'upi_intent' && <QrCode className="w-3.5 h-3.5 text-blue-400" />}
            <span>
              {source === 'screenshot'
                ? 'Additional Message Context (Optional)'
                : source === 'upi_intent'
                ? 'UPI Intent Link / QR Code URI'
                : 'Suspicious Message Content'}
            </span>
          </label>
          <div className="flex items-center gap-3 text-xs">
            {value.length > 0 && (
              <button
                type="button"
                disabled={disabled}
                onClick={onClear}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
            <button
              type="button"
              disabled={disabled}
              onClick={handlePaste}
              className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>Paste</span>
            </button>
          </div>
        </div>

        <div className="relative rounded-2xl border border-slate-800 bg-slate-950/60 p-1 shadow-inner focus-within:border-blue-500/80 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
          <textarea
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
            className="w-full bg-transparent p-4 text-slate-100 placeholder:text-slate-600 focus:outline-none resize-y text-sm sm:text-base leading-relaxed"
          />

          <div className="flex items-center justify-between px-3 py-2 border-t border-slate-900 text-xs text-slate-500">
            <span className="hidden sm:inline">
              Press{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                Ctrl
              </kbd>{' '}
              +{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                Enter
              </kbd>{' '}
              to analyze
            </span>
            <span className="sm:hidden text-[11px]">Max {maxLength} chars</span>
            <span
              className={`font-mono text-xs ${
                charCount > 3500 ? 'text-amber-400' : 'text-slate-500'
              }`}
            >
              {charCount} / {maxLength}
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic UPI Intent Card Preview */}
      {parsedIntent && (
        <div className="pt-1">
          <UPIIntentCard intent={parsedIntent} />
        </div>
      )}
    </div>
  );
}
