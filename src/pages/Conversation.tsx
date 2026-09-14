import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ConversationTimeline from '../components/ConversationTimeline';
import { useConversation } from '../context/ConversationContext';
import { parseTextToSigns } from '../utils/textParsing';
import { speak } from '../services/speechService';

export default function Conversation() {
  const { entries, addEntry, clear } = useConversation();
  const [hearingText, setHearingText] = useState('');

  const sendHearingReply = () => {
    if (!hearingText.trim()) return;
    const parsed = parseTextToSigns(hearingText.trim());
    addEntry('HEARING_USER', hearingText.trim(), parsed.map((w) => w.signId).filter(Boolean) as any);
    speak(hearingText.trim());
    setHearingText('');
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold mb-2">Two-Way Conversation Mode</h1>
          <p className="text-mist max-w-2xl">
            🤟 Sign Language User on the left, 🗣 Hearing User on the right — a shared timeline of the
            conversation as it happens.
          </p>
        </div>
        <Button variant="ghost" onClick={clear}>Clear Conversation</Button>
      </div>

      <Card className="p-6">
        <ConversationTimeline entries={entries} />
      </Card>

      <Card className="p-6 space-y-3">
        <p className="text-sm font-semibold text-mist">🗣 Hearing User — reply with text or voice</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={hearingText}
            onChange={(e) => setHearingText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendHearingReply()}
            placeholder="Type a reply…"
            className="focus-ring flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 placeholder:text-mist/50"
          />
          <Button onClick={sendHearingReply}>Send</Button>
        </div>
        <p className="text-xs text-mist">
          🤟 To reply as the sign-language user, use <Link to="/sign-to-text" className="text-signal-400 underline">Sign → Text</Link> or <Link to="/quick-phrases" className="text-signal-400 underline">Quick Phrases</Link> — both log directly to this conversation.
        </p>
      </Card>
    </div>
  );
}
