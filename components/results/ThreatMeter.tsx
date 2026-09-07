'use client';

import React, { useEffect, useState } from 'react';
import { RiskLevel } from '@/lib/ai/types';

interface ThreatMeterProps {
  score: number;
  level: RiskLevel;
}

export function ThreatMeter({ score, level }: ThreatMeterProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Smooth score animation on mount or change
    const duration = 900;
    const start = performance.now();
    const target = score;

    function step(timestamp: number) {
      const progress = Math.min(1, (timestamp - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * target));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }, [score]);

  // Styling based on risk level
  const colorMap = {
    LOW: {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500',
      border: 'border-emerald-500/30',
      glow: 'shadow-emerald-500/20',
      barGradient: 'from-emerald-600 to-teal-400',
      ringColor: '#10b981',
      description: 'Low probability of deceptive manipulation.',
    },
    MEDIUM: {
      text: 'text-amber-400',
      bg: 'bg-amber-500',
      border: 'border-amber-500/30',
      glow: 'shadow-amber-500/20',
      barGradient: 'from-amber-600 to-yellow-400',
      ringColor: '#f59e0b',
      description: 'Suspicious traits detected. Proceed with caution.',
    },
    HIGH: {
      text: 'text-rose-400',
      bg: 'bg-rose-500',
      border: 'border-rose-500/30',
      glow: 'shadow-rose-500/30',
      barGradient: 'from-rose-600 to-red-400',
      ringColor: '#ef4444',
      description: 'High social-engineering threat! Do not transfer funds.',
    },
  };

  const currentTheme = colorMap[level];

  // SVG circular meter calculation
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  // Arc spans 260 degrees (leaving 100 degrees open at bottom)
  const arcFraction = 0.72;
  const strokeDashoffset = circumference * (1 - (animatedScore / 100) * arcFraction);

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-130" viewBox="0 0 160 160">
          {/* Background Track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="transparent"
            stroke="#1e293b"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference * arcFraction}
            style={{
              strokeDashoffset: 0,
            }}
          />
          {/* Active Score Arc */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="transparent"
            stroke={currentTheme.ringColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference * arcFraction}
            style={{
              strokeDashoffset: strokeDashoffset,
              transition: 'stroke-dashoffset 0.1s ease',
              filter: `drop-shadow(0 0 8px ${currentTheme.ringColor})`,
            }}
          />
        </svg>

        {/* Center Score Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-extrabold tracking-tight font-mono text-white">
            {animatedScore}
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Out of 100
          </div>
          <div className={`text-xs font-bold uppercase tracking-wider mt-1 ${currentTheme.text}`}>
            {level} RISK
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400 mt-2 max-w-[260px]">
        {currentTheme.description}
      </p>
    </div>
  );
}
