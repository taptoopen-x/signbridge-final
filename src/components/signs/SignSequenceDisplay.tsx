import { useEffect, useState } from 'react';
import { SIGN_DICTIONARY } from '../../data/signDictionary';
import type { SignId } from '../../types';
import SignCard from './SignCard';

interface ParsedWord {
  raw: string;
  signId: SignId | null;
}

interface SignSequenceDisplayProps {
  words: ParsedWord[];
  autoPlay?: boolean;
}

export default function SignSequenceDisplay({ words, autoPlay = true }: SignSequenceDisplayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const matchedWords = words.filter((w) => w.signId);

  useEffect(() => {
    setCurrentIndex(0);
    if (!autoPlay || matchedWords.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % matchedWords.length);
    }, 1800);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words.map((w) => w.raw).join(' '), autoPlay]);

  if (words.length === 0) return null;

  const unsupported = words.filter((w) => !w.signId);
  const currentSignId = matchedWords[currentIndex]?.signId;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {words.map((w, i) => {
          const isCurrent = w.signId && w.signId === currentSignId;
          return (
            <span
              key={i}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium border transition-colors ${
                isCurrent
                  ? 'bg-signal-500/20 border-signal-400 text-signal-400'
                  : w.signId
                  ? 'bg-white/5 border-white/10 text-white'
                  : 'bg-coral-500/10 border-coral-500/20 text-coral-400/80'
              }`}
            >
              {w.raw}
            </span>
          );
        })}
      </div>

      {unsupported.length > 0 && (
        <p className="text-sm text-warn bg-warn/10 border border-warn/20 rounded-lg px-4 py-2">
          Some words are not currently supported by this prototype: {unsupported.map((w) => w.raw).join(', ')}
        </p>
      )}

      {matchedWords.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {matchedWords.map((w, i) => (
            <SignCard key={i} sign={SIGN_DICTIONARY[w.signId as SignId]} active={i === currentIndex} size="sm" />
          ))}
        </div>
      ) : (
        <p className="text-mist text-sm">No supported signs found for this text yet.</p>
      )}
    </div>
  );
}
