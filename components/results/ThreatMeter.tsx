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
    const duration = 600;
    const start = performance.now();
    const target = score;

    function step(timestamp: number) {
      const progress = Math.min(1, (timestamp - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * target));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }, [score]);

  const sealClass =
    level === 'LOW'
      ? 'seal seal-safe'
      : level === 'MEDIUM'
      ? 'seal seal-warn'
      : 'seal';

  const sealWord = level === 'LOW' ? 'SAFE' : level === 'MEDIUM' ? 'WARN' : 'HIGH';

  return (
    <div className={sealClass} aria-label={`Verdict: ${sealWord}, Threat Score ${animatedScore}`}>
      <span className="word">{sealWord}</span>
      <span className="num">{animatedScore}</span>
    </div>
  );
}
