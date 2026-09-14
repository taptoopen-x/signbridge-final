import Badge from '../ui/Badge';

interface StatusBadgesProps {
  aiReady: boolean;
  cameraActive: boolean;
  cameraError: boolean;
  handDetected: boolean;
  processing?: boolean;
}

export default function StatusBadges({ aiReady, cameraActive, cameraError, handDetected, processing }: StatusBadgesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge tone={cameraError ? 'error' : aiReady ? 'success' : 'idle'}>
        {cameraError ? '🔴 AI Error' : aiReady ? '🟢 AI Ready' : '⚪ AI Idle'}
      </Badge>
      <Badge tone={cameraError ? 'error' : cameraActive ? 'success' : 'idle'}>
        {cameraError ? '🔴 Camera Error' : cameraActive ? '🟢 Camera Active' : '⚪ Camera Off'}
      </Badge>
      <Badge tone={handDetected ? 'success' : 'idle'}>
        {handDetected ? '🟢 Hand Detected' : '⚪ No Hand'}
      </Badge>
      {processing && <Badge tone="warn">🟡 Processing</Badge>}
    </div>
  );
}
