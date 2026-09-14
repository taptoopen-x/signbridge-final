import type { ConversationEntry } from '../types';
import { speak } from '../services/speechService';
import { SIGN_DICTIONARY } from '../data/signDictionary';

interface ConversationTimelineProps {
  entries: ConversationEntry[];
}

export default function ConversationTimeline({ entries }: ConversationTimelineProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-16 text-mist">
        <p className="text-4xl mb-3">💬</p>
        <p>No messages yet. Use the panels below to start the conversation.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((e) => {
        const isSignUser = e.speaker === 'SIGN_USER';
        return (
          <div key={e.id} className={`flex ${isSignUser ? 'justify-start' : 'justify-end'}`}>
            <div
              className={`max-w-[85%] md:max-w-md rounded-2xl px-4 py-3 ${
                isSignUser ? 'glass rounded-tl-sm' : 'bg-signal-500/15 border border-signal-500/25 rounded-tr-sm'
              }`}
            >
              <p className="text-xs text-mist mb-1 flex items-center gap-1.5">
                {isSignUser ? '🤟 Sign Language User' : '🗣 Hearing User'}
              </p>
              <p className="font-medium">{e.text}</p>
              {e.signSequence && e.signSequence.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {e.signSequence.map((sid, i) => (
                    <span key={i} className="text-lg" title={SIGN_DICTIONARY[sid]?.displayName}>
                      {SIGN_DICTIONARY[sid]?.emoji}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => speak(e.text)}
                  className="focus-ring text-xs text-signal-400 hover:text-signal-300 font-medium"
                >
                  🔊 Replay speech
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
