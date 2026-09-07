'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, X, AlertCircle } from 'lucide-react';

export interface ScreenshotData {
  base64: string;
  mimeType: string;
  previewUrl: string;
  fileName: string;
  fileSizeKb: number;
}

interface ScreenshotUploaderProps {
  image: ScreenshotData | null;
  onImageSelected: (data: ScreenshotData) => void;
  onImageRemoved: () => void;
  disabled?: boolean;
}

export function ScreenshotUploader({
  image,
  onImageSelected,
  onImageRemoved,
  disabled,
}: ScreenshotUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Global paste handler for quick Ctrl+V of screenshots
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            processFile(file);
            e.preventDefault();
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [disabled]);

  const processFile = (file: File) => {
    setUploadError(null);

    // Validate mime type
    const validMimes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validMimes.includes(file.type)) {
      setUploadError('Please upload a PNG, JPEG, or WEBP image.');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const [header, base64] = result.split(',');
      const mimeType = header.match(/:(.*?);/)?.[1] || file.type;

      onImageSelected({
        base64,
        mimeType,
        previewUrl: result,
        fileName: file.name || 'Pasted Screenshot',
        fileSizeKb: Math.round(file.size / 1024),
      });
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
          }
        }}
      />

      {!image ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-900/40'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="p-3 rounded-full bg-slate-900 border border-slate-800 text-blue-400 shadow-inner">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">
                Click to upload screenshot or drag & drop
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                PNG, JPEG, WEBP up to 5MB • Or simply press{' '}
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                  Ctrl
                </kbd>{' '}
                +{' '}
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                  V
                </kbd>{' '}
                to paste
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative rounded-2xl border border-slate-800 bg-slate-950/70 p-3 flex items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shrink-0">
              <img
                src={image.previewUrl}
                alt="Screenshot Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-slate-200 truncate flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">{image.fileName}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {image.fileSizeKb} KB • Ready for Multimodal OCR
              </p>
              <span className="inline-block text-[10px] px-2 py-0.5 mt-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Screenshot Loaded
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              onImageRemoved();
            }}
            className="p-2 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            title="Remove screenshot"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {uploadError && (
        <div className="flex items-center gap-2 p-3 rounded-xl border border-rose-500/30 bg-rose-950/20 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  );
}
