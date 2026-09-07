'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Upload, AlertCircle } from 'lucide-react';

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

  const processFile = React.useCallback(
    (file: File) => {
      setUploadError(null);

      const validMimes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!validMimes.includes(file.type)) {
        setUploadError('Please upload a PNG, JPEG, or WEBP image.');
        return;
      }

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
    },
    [onImageSelected]
  );

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
  }, [disabled, processFile]);

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
    <div className="space-y-2">
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
          className={`border border-dashed rounded-[6px] p-6 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-[var(--navy)] bg-white'
              : 'border-[var(--line)] hover:border-[var(--navy)] bg-white'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex flex-col items-center justify-center space-y-1.5">
            <Upload className="w-5 h-5 text-[var(--ink-faint)]" />
            <p className="text-[14px] text-[var(--ink)] font-medium">
              Click to attach screenshot or drag & drop
            </p>
            <p className="text-[12px] text-[var(--ink-faint)]">
              PNG, JPG, WEBP up to 5MB • or paste with Ctrl+V
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-[6px] border border-[var(--line)] bg-white p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-[4px] overflow-hidden border border-[var(--line)] bg-[var(--paper)] shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.previewUrl}
                alt="Screenshot Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium text-[var(--ink)] truncate">
                {image.fileName}
              </div>
              <p className="text-[11px] text-[var(--ink-faint)]">
                {image.fileSizeKb} KB • Ready for examination
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              onImageRemoved();
            }}
            className="text-[12px] text-[var(--ink-soft)] hover:text-[var(--stamp)] underline underline-offset-2 p-1 transition-colors cursor-pointer"
          >
            Remove
          </button>
        </div>
      )}

      {uploadError && (
        <div className="flex items-center gap-2 p-2.5 rounded-[6px] border border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--stamp)] text-[12px]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  );
}
