import { useState } from 'react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import SignSequenceDisplay from '../components/signs/SignSequenceDisplay';
import { parseTextToSigns } from '../utils/textParsing';
import {
  SpeechRecognitionService,
  isSpeechRecognitionSupported,
} from '../services/speechRecognitionService';
import { useConversation } from '../context/ConversationContext';

const recognizer = new SpeechRecognitionService();

export default function TextToSign() {
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [listening, setListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const { addEntry } = useConversation();

  const words = parseTextToSigns(submitted);

  const handleSubmit = () => {
    if (!text.trim()) return;

    setSubmitted(text.trim());

    const parsed = parseTextToSigns(text.trim());

    addEntry(
      'HEARING_USER',
      text.trim(),
      parsed.map((w) => w.signId).filter(Boolean) as any
    );
  };

  const handleVoice = () => {
    setMicError(null);

    if (!isSpeechRecognitionSupported()) {
      setMicError(
        'Speech recognition is not supported in this browser. Please type your message instead.'
      );
      return;
    }

    setListening(true);

    recognizer.start(
      (transcript, isFinal) => {
        setText(transcript);

        if (isFinal) {
          setSubmitted(transcript.trim());

          const parsed = parseTextToSigns(transcript.trim());

          addEntry(
            'HEARING_USER',
            transcript.trim(),
            parsed.map((w) => w.signId).filter(Boolean) as any
          );
        }
      },
      (msg) => {
        setMicError(msg);
        setListening(false);
      },
      () => setListening(false)
    );
  };

  return (
    <div className="space-y-8 pb-10">
      {/* PAGE HEADER */}
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-semibold mb-2">
          Text / Voice → Sign
        </h1>

        <p className="text-mist max-w-2xl">
          Type or speak a message. SignBridge matches each word against the
          ISL vocabulary and plays the corresponding signs in sequence for the
          Deaf/non-speaking user.
        </p>
      </div>

      {/* MAIN DEMO AREA */}
      <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6 items-start">
        {/* LEFT — INPUT */}
        <Card className="p-6 space-y-5">
          <div>
            <p className="text-sm font-semibold text-mist">
              Message Input
            </p>

            <p className="text-xs text-mist mt-1">
              Type a message or use your voice.
            </p>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) =>
                e.key === 'Enter' && handleSubmit()
              }
              placeholder='e.g. "I need water"'
              className="focus-ring w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-base placeholder:text-mist/50"
            />

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleSubmit}>
                🤟 Show Signs
              </Button>

              <Button
                variant={listening ? 'danger' : 'secondary'}
                onClick={handleVoice}
                disabled={listening}
              >
                {listening
                  ? '🎙️ Listening…'
                  : '🎤 Speak'}
              </Button>
            </div>
          </div>

          {/* LIVE INPUT PREVIEW */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <p className="text-xs text-mist">
              Current message
            </p>

            <p className="text-lg font-semibold mt-1 break-words">
              {text.trim()
                ? `"${text.trim()}"`
                : 'Waiting for a message…'}
            </p>
          </div>

          {micError && (
            <div className="rounded-xl bg-warn/10 border border-warn/20 p-4">
              <p className="text-sm font-semibold text-warn">
                🎤 Microphone message
              </p>

              <p className="text-xs text-mist mt-1">
                {micError}
              </p>
            </div>
          )}

          <div className="rounded-xl bg-success/10 border border-success/20 p-4">
            <p className="text-sm font-semibold text-success">
              💡 Try this
            </p>

            <p className="text-xs text-mist mt-1">
              Type a simple phrase such as
              <span className="text-white font-medium">
                {' '}“yes”
              </span>
              {' '}or
              <span className="text-white font-medium">
                {' '}“I need water”
              </span>
              {' '}and press Show Signs.
            </p>
          </div>
        </Card>

        {/* RIGHT — SIGN OUTPUT */}
        <Card className="p-6 min-h-[420px]">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <p className="text-sm font-semibold text-mist">
                Sign Output
              </p>

              <p className="text-xs text-mist mt-1">
                The message is converted into the available ISL sign sequence.
              </p>
            </div>

            {submitted && (
              <span className="px-3 py-1 rounded-full bg-success/10 border border-success/20 text-success text-xs font-semibold">
                Ready
              </span>
            )}
          </div>

          {!submitted ? (
            <div className="min-h-[320px] rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 rounded-2xl bg-signal-500/10 border border-signal-500/20 flex items-center justify-center mb-5">
                <span className="text-5xl">🤟</span>
              </div>

              <p className="text-xl font-display font-semibold">
                Your sign will appear here
              </p>

              <p className="text-sm text-mist mt-2 max-w-sm">
                Enter a message on the left and select
                <span className="text-white font-medium">
                  {' '}Show Signs
                </span>
                {' '}to begin the demonstration.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* MESSAGE BEING SIGNED */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <p className="text-xs text-mist">
                  Signing message
                </p>

                <p className="text-2xl font-display font-bold mt-1 break-words">
                  "{submitted}"
                </p>
              </div>

              {/* SIGN SEQUENCE */}
              <div>
                <SignSequenceDisplay words={words} />
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* HOW IT WORKS — LESS IMPORTANT */}
      <Card className="p-6">
        <p className="font-display text-xl font-semibold">
          How Text → Sign works
        </p>

        <div className="grid md:grid-cols-3 gap-4 mt-5">
          <div className="rounded-xl bg-white/5 border border-white/10 p-5">
            <div className="text-2xl mb-3">📝</div>

            <p className="font-semibold">
              1. Enter a message
            </p>

            <p className="text-xs text-mist mt-2">
              The hearing user can type a message or use voice input.
            </p>
          </div>

          <div className="rounded-xl bg-white/5 border border-white/10 p-5">
            <div className="text-2xl mb-3">🧠</div>

            <p className="font-semibold">
              2. Match the vocabulary
            </p>

            <p className="text-xs text-mist mt-2">
              SignBridge checks the message against its available ISL
              vocabulary.
            </p>
          </div>

          <div className="rounded-xl bg-white/5 border border-white/10 p-5">
            <div className="text-2xl mb-3">🤟</div>

            <p className="font-semibold">
              3. Display the signs
            </p>

            <p className="text-xs text-mist mt-2">
              Matching signs are presented in sequence for the
              Deaf/non-speaking user.
            </p>
          </div>
        </div>
      </Card>

      {/* EXHIBITION NOTE */}
      <Card className="p-5 bg-success/10 border-success/20">
        <div className="flex items-start gap-3">
          <span className="text-xl">🎯</span>

          <div>
            <p className="font-semibold text-success">
              Exhibition demonstration
            </p>

            <p className="text-sm text-mist mt-1">
              For the live demonstration, keep the message short and use
              trained vocabulary so the sign output is easy for judges to
              understand.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}