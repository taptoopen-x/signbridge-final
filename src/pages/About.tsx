import Card from '../components/ui/Card';

const TECH = ['Computer Vision', 'MediaPipe Hands', 'Machine Learning (k-NN)', 'Web Speech Recognition', 'Speech Synthesis (TTS)', 'Progressive Web App'];
const FUTURE = [
  'Larger ISL vocabulary sourced from verified datasets',
  'Continuous sentence-level recognition (not just isolated signs)',
  'Higher-quality, larger training datasets per sign',
  'Offline-capable AI model bundling',
  '3D signing avatar for Text → Sign output',
  'Native mobile app',
  'Personalized, adaptive recognition per user',
  'Broader accessibility: fingerspelling, regional ISL dialects',
];

export default function About() {
  return (
    <div className="space-y-10 pb-10 max-w-3xl">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-semibold mb-2">About SignBridge</h1>
        <p className="text-mist">AI-Powered Two-Way Indian Sign Language Communication System.</p>
      </div>

      <Card className="p-6">
        <p className="text-coral-400 text-sm font-semibold mb-2">Problem</p>
        <p className="text-mist leading-relaxed">
          People who communicate through sign language may face communication barriers when interacting
          with people who don't understand sign language — in everyday situations like healthcare, travel,
          or public services.
        </p>
      </Card>

      <Card className="p-6">
        <p className="text-signal-400 text-sm font-semibold mb-2">Solution</p>
        <p className="text-mist leading-relaxed">
          SignBridge provides AI-assisted two-way communication using computer vision, machine learning,
          speech technology, and ISL visual resources — recognizing a live sign through a webcam and
          converting speech or text back into sign visuals, entirely in the browser.
        </p>
      </Card>

      <Card className="p-6">
        <p className="text-sm font-semibold text-mist mb-3">Technology</p>
        <div className="flex flex-wrap gap-2">
          {TECH.map((t) => (
            <span key={t} className="rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-sm">{t}</span>
          ))}
        </div>
      </Card>

      <Card className="p-6 border-warn/20">
        <p className="text-warn text-sm font-semibold mb-2">Limitations</p>
        <p className="text-mist leading-relaxed">
          This prototype recognizes a selected vocabulary of Indian Sign Language, trained live on-device.
          Accuracy depends on training samples, lighting, camera quality, and signing style. SignBridge does
          not claim 100% accuracy, does not cover all sign languages, does not provide complete human-level
          translation, and is not a replacement for professional interpreters.
        </p>
      </Card>

      <Card className="p-6">
        <p className="text-sm font-semibold text-mist mb-3">Future Scope</p>
        <ul className="space-y-2">
          {FUTURE.map((f) => (
            <li key={f} className="text-mist text-sm flex gap-2">
              <span className="text-signal-400">•</span>{f}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
