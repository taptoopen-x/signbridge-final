import { useEffect, useRef, useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Badge from './ui/Badge';
import CameraView from './camera/CameraView';
import { SIGN_LIST } from '../data/signDictionary';
import { useSignRecognition } from '../hooks/useSignRecognition';
import { speak } from '../services/speechService';
import type { SignEntry } from '../types';

interface TestASignModalProps {
  open: boolean;
  onClose: () => void;
  initialSignId?: SignEntry['id'];
}

export default function TestASignModal({ open, onClose, initialSignId }: TestASignModalProps) {
  const [target, setTarget] = useState<SignEntry>(
    SIGN_LIST.find((s) => s.id === initialSignId) ?? SIGN_LIST[0]
  );
  const [stage, setStage] = useState<'learn' | 'try'>('learn');
  const videoRef = useRef<HTMLVideoElement>(null);
  const rec = useSignRecognition(videoRef);

  const pickRandom = () => {
    const others = SIGN_LIST.filter((s) => s.id !== target.id);
    const pick = others[Math.floor(Math.random() * others.length)] ?? SIGN_LIST[0];
    setTarget(pick);
    setStage('learn');
    rec.clearConfirmed();
  };

  useEffect(() => {
    if (!open) {
      rec.camera.stop();
      setStage('learn');
      return;
    }
    if (initialSignId) {
      const s = SIGN_LIST.find((x) => x.id === initialSignId);
      if (s) setTarget(s);
    }
    rec.clearConfirmed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialSignId]);

  const matched = rec.confirmed.signId === target.id;
  const trainedForTarget = rec.classifier.sampleCount(target.id) >= 3;

  useEffect(() => {
    if (matched) speak(`Correct! That is the sign for ${target.displayName}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matched]);

  return (
    <Modal open={open} onClose={onClose} title="🎯 Test A Sign">
      <div className="space-y-6">
        <p className="text-mist text-sm">
          Don't know sign language? We'll show you one. Copy the sign and let our AI recognize it.
        </p>

        <div className="flex items-center justify-between flex-wrap gap-2">
          <Badge tone="idle">DEMO MODE · Learning step</Badge>
          <div className="flex gap-2">
            <select
              value={target.id}
              onChange={(e) => {
                const s = SIGN_LIST.find((x) => x.id === e.target.value);
                if (s) { setTarget(s); setStage('learn'); rec.clearConfirmed(); }
              }}
              className="focus-ring bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
            >
              {SIGN_LIST.map((s) => (
                <option key={s.id} value={s.id} className="bg-base-800">{s.displayName}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="rounded-2xl overflow-hidden bg-base-800 border border-white/10 aspect-[4/3] flex flex-col items-center justify-center gap-3 p-6 text-center">
            <span className="text-6xl">{target.emoji}</span>
            <p className="font-display text-xl font-semibold">{target.displayName}</p>
            <p className="text-mist text-sm">{target.meaning}</p>
            <p className="text-xs text-mist/70">
              {target.video ? 'Verified demo clip plays here once added to public/signs/.' : 'Demo animation placeholder.'}
            </p>
          </div>

          <div className="space-y-3">
            <Badge tone="success">LIVE AI MODE · Your turn</Badge>
            <p className="text-sm text-mist">Your turn! Copy the sign in front of the camera.</p>
            <CameraView
              videoRef={videoRef}
              isActive={rec.camera.isActive}
              error={rec.camera.error}
              landmarks={rec.landmarks}
              onStart={() => { rec.camera.start(); setStage('try'); }}
            />
            {rec.camera.isActive && !trainedForTarget && (
              <p className="text-xs text-warn bg-warn/10 border border-warn/20 rounded-lg px-3 py-2">
                This sign hasn't been trained yet on this device. Visit Sign → Text → Train / Manage Signs to
                capture a few samples first, then judges can test it live here.
              </p>
            )}

            {rec.camera.isActive && (
              <div className="glass rounded-xl p-4 space-y-2">
                {matched ? (
                  <>
                    <p className="text-success font-semibold flex items-center gap-2">✓ SIGN RECOGNIZED</p>
                    <p className="text-2xl font-display font-bold">{target.displayName}</p>
                    <p className="text-mist text-sm">Confidence: {(rec.confirmed.confidence * 100).toFixed(1)}%</p>
                  </>
                ) : rec.liveFrame.signId ? (
                  <>
                    <p className="text-sm text-mist">Detecting…</p>
                    <p className="font-display text-lg">{rec.liveFrame.signId.replace('_', ' ')}</p>
                    <p className="text-xs text-mist">Confidence: {(rec.liveFrame.confidence * 100).toFixed(1)}%</p>
                  </>
                ) : (
                  <p className="text-sm text-mist">
                    {rec.handDetected ? 'Hold the sign steady…' : 'Show your hand to the camera.'}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button onClick={pickRandom}>Try Another</Button>
        </div>
      </div>
    </Modal>
  );
}
