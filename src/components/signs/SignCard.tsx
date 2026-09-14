import { useState } from 'react';
import type { SignEntry } from '../../types';
import Card from '../ui/Card';

interface SignCardProps {
  sign: SignEntry;
  active?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function SignCard({ sign, active = false, size = 'md' }: SignCardProps) {
  const [videoFailed, setVideoFailed] = useState(false);
  const dims = size === 'lg' ? 'h-56' : size === 'sm' ? 'h-28' : 'h-40';

  return (
    <Card
      className={`p-4 flex flex-col gap-3 transition-all duration-300 ${
        active ? 'ring-2 ring-signal-400 shadow-glow scale-[1.02]' : ''
      }`}
    >
      <div className={`relative ${dims} rounded-xl overflow-hidden bg-base-800 flex items-center justify-center`}>
        {!videoFailed && sign.video ? (
          <video
            key={sign.video}
            src={sign.video}
            className="h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            onError={() => setVideoFailed(true)}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-center px-3">
            <span className="text-4xl">{sign.emoji}</span>
            <span className="text-[11px] text-mist leading-snug">
              Demo clip not yet added — see public/signs/README.md
            </span>
          </div>
        )}
      </div>
      <div>
        <p className="font-display font-semibold text-lg">{sign.displayName}</p>
        <p className="text-mist text-sm">{sign.meaning}</p>
      </div>
    </Card>
  );
}
