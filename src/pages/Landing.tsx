import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PipelineVisualization from '../components/PipelineVisualization';
import { SIGN_LIST } from '../data/signDictionary';

export default function Landing() {
  return (
    <div className="space-y-24 pb-10">
      {/* Hero */}
      <section className="pt-14 md:pt-20 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
        <div className="animate-rise">
          <p className="text-signal-400 font-medium text-sm mb-4">AI-Powered Two-Way ISL Communication</p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.05] mb-6">
            SignBridge
          </h1>
          <p className="text-xl md:text-2xl text-mist font-display mb-8 max-w-xl">
            Breaking communication barriers with AI.
          </p>
          <p className="text-mist mb-10 max-w-lg leading-relaxed">
            SignBridge turns a laptop's webcam and microphone into a real-time bridge between Indian Sign
            Language and spoken/written language — recognizing signs with computer vision, and converting
            speech or text back into sign visuals.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/sign-to-text"><Button size="lg">Start Communication</Button></Link>
            <Link to="/learn"><Button size="lg" variant="secondary">Try Demo</Button></Link>
            <Link to="/quick-phrases"><Button size="lg" variant="ghost">Quick Phrases</Button></Link>
            <Link to="/about"><Button size="lg" variant="ghost">About Project</Button></Link>
          </div>
        </div>

        <Card className="p-6 animate-rise">
          <p className="text-sm text-mist mb-4">Live pipeline preview</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-base-800 rounded-xl px-4 py-3">
              <span className="text-sm text-mist">Detected Sign</span>
              <span className="font-display font-semibold text-signal-400">WATER</span>
            </div>
            <div className="flex items-center justify-between bg-base-800 rounded-xl px-4 py-3">
              <span className="text-sm text-mist">Confidence</span>
              <span className="font-semibold text-success">95.7%</span>
            </div>
            <div className="flex items-center justify-between bg-base-800 rounded-xl px-4 py-3">
              <span className="text-sm text-mist">Spoken Output</span>
              <span className="font-semibold">🔊 "Water"</span>
            </div>
          </div>
        </Card>
      </section>

      {/* Problem / Solution */}
      <section className="grid md:grid-cols-3 gap-5">
        <Card className="p-6">
          <p className="text-coral-400 text-sm font-semibold mb-2">The Problem</p>
          <p className="text-mist leading-relaxed">
            People who communicate through sign language often face barriers when interacting with people
            who don't understand it — in hospitals, offices, and everyday life.
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-signal-400 text-sm font-semibold mb-2">The Solution</p>
          <p className="text-mist leading-relaxed">
            SignBridge provides AI-assisted two-way communication using computer vision, machine learning,
            speech technology, and ISL visual resources — running entirely in the browser.
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-success text-sm font-semibold mb-2">How AI Helps</p>
          <p className="text-mist leading-relaxed">
            Hand landmarks are tracked live, matched against a trained sign vocabulary, and converted to
            speech — and spoken words are mapped back to ISL sign visuals.
          </p>
        </Card>
      </section>

      {/* Pipeline */}
      <section>
        <h2 className="font-display text-2xl md:text-3xl font-semibold mb-6">How AI Works</h2>
        <PipelineVisualization />
      </section>

      {/* Vocabulary */}
      <section>
        <h2 className="font-display text-2xl md:text-3xl font-semibold mb-6">Supported Vocabulary</h2>
        <div className="flex flex-wrap gap-2">
          {SIGN_LIST.map((s) => (
            <span key={s.id} className="glass rounded-full px-4 py-2 text-sm flex items-center gap-2">
              <span>{s.emoji}</span>{s.displayName}
            </span>
          ))}
        </div>
        <p className="text-mist text-sm mt-4 max-w-xl">
          This prototype demonstrates a focused, reliable vocabulary rather than claiming universal sign
          language translation — the architecture is built to expand, including toward A–Z fingerspelling.
        </p>
      </section>
    </div>
  );
}
