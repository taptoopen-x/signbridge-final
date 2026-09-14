import { useState } from 'react';
import QuickPhraseGrid from '../components/QuickPhraseGrid';
import SignSequenceDisplay from '../components/signs/SignSequenceDisplay';
import Card from '../components/ui/Card';
import { speak } from '../services/speechService';
import { useConversation } from '../context/ConversationContext';
import type { QuickPhrase } from '../types';

export default function QuickPhrases() {
  const [active, setActive] = useState<QuickPhrase | null>(null);
  const { addEntry } = useConversation();

  const handleSelect = (phrase: QuickPhrase) => {
    setActive(phrase);
    speak(phrase.text);
    addEntry('SIGN_USER', phrase.text, phrase.signSequence);
  };

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-semibold mb-2">Quick Phrases</h1>
        <p className="text-mist max-w-2xl">
          One tap for common needs — speaks the phrase aloud, shows its ISL signs, and logs it to the
          conversation.
        </p>
      </div>

      <QuickPhraseGrid onSelect={handleSelect} selectedId={active?.id} />

      {active && (
        <Card className="p-6">
          <p className="text-sm text-mist mb-4">
            Showing signs for: <span className="text-white font-medium">"{active.text}"</span>
          </p>
          <SignSequenceDisplay words={active.signSequence.map((id) => ({ raw: id.replace('_', ' '), signId: id }))} />
        </Card>
      )}
    </div>
  );
}
