import { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import TestASignModal from '../components/TestASignModal';
import { SIGN_LIST } from '../data/signDictionary';
import type { SignId } from '../types';

export default function LearnISL() {
  const [testSign, setTestSign] = useState<SignId | null>(null);

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-semibold mb-2">Learn ISL</h1>
        <p className="text-mist max-w-2xl">
          Browse the supported vocabulary, see what each sign means, and try it yourself — the AI will
          attempt to recognize your live attempt through the camera.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {SIGN_LIST.map((s) => (
          <Card key={s.id} className="p-5 flex flex-col gap-3">
            <div className="h-32 rounded-xl bg-base-800 flex items-center justify-center text-5xl">
              {s.emoji}
            </div>
            <div>
              <p className="font-display font-semibold text-lg">{s.displayName}</p>
              <p className="text-mist text-sm mt-1">{s.meaning}</p>
              <p className="text-xs text-mist/60 mt-1">Gloss: {s.gloss}</p>
            </div>
            <Button variant="secondary" onClick={() => setTestSign(s.id)}>Try Yourself</Button>
          </Card>
        ))}
      </div>

      <TestASignModal
        open={testSign !== null}
        onClose={() => setTestSign(null)}
        initialSignId={testSign ?? undefined}
      />
    </div>
  );
}
