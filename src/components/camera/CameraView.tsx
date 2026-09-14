import type { RefObject } from 'react';
import type { CameraErrorKind, LandmarkPoint } from '../../types';
import LandmarkOverlay from './LandmarkOverlay';
import Button from '../ui/Button';

interface CameraViewProps {
  videoRef: RefObject<HTMLVideoElement>;
  isActive: boolean;
  error: CameraErrorKind;
  landmarks: LandmarkPoint[] | null;
  onStart: () => void;
}

const ERROR_COPY: Record<string, string> = {
  PERMISSION_DENIED: 'Camera access was denied. Allow camera permission in your browser settings and try again.',
  NO_CAMERA: 'No camera was found on this device. Connect a webcam and try again.',
  UNAVAILABLE: 'The camera could not be started. It may be in use by another app.',
  UNSUPPORTED_BROWSER: 'This browser does not support camera access. Try Chrome, Edge, or Firefox.',
};

export default function CameraView({ videoRef, isActive, error, landmarks, onStart }: CameraViewProps) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-base-950 border border-white/10">
      <video
        ref={videoRef}
        className="h-full w-full object-cover scale-x-[-1]"
        muted
        playsInline
      />
      {isActive && (
        <div className="scale-x-[-1] absolute inset-0">
          <LandmarkOverlay landmarks={landmarks} width={640} height={480} />
        </div>
      )}

      {!isActive && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-6">
          <div className="text-5xl">📷</div>
          <p className="text-mist text-sm max-w-xs">
            Camera processing is performed locally where supported. Nothing is uploaded.
          </p>
          <Button onClick={onStart}>Start Camera</Button>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-8 bg-base-950/95">
          <div className="text-4xl">⚠️</div>
          <p className="text-coral-400 font-semibold">Camera unavailable</p>
          <p className="text-mist text-sm max-w-sm">{ERROR_COPY[error]}</p>
          <Button onClick={onStart} variant="secondary">Try Again</Button>
        </div>
      )}
    </div>
  );
}
