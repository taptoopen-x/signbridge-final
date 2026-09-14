import { QUICK_PHRASES } from '../data/quickPhrases';
import type { QuickPhrase } from '../types';

interface QuickPhraseGridProps {
  onSelect: (phrase: QuickPhrase) => void;
  selectedId?: string | null;
}

export default function QuickPhraseGrid({ onSelect, selectedId }: QuickPhraseGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {QUICK_PHRASES.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect(p)}
          className={`focus-ring glass rounded-2xl p-5 flex flex-col items-center gap-2 text-center
            transition-all duration-200 hover:bg-white/[0.08] hover:-translate-y-0.5 active:scale-95
            ${selectedId === p.id ? 'ring-2 ring-signal-400 shadow-glow' : ''}`}
        >
          <span className="text-3xl">{p.icon}</span>
          <span className="text-sm font-medium leading-snug">{p.label}</span>
        </button>
      ))}
    </div>
  );
}
