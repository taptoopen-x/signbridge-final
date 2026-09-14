import { useCallback, useEffect, useRef, useState } from 'react';
import type { CameraErrorKind } from '../types';

export function useCamera(videoRef: React.RefObject<HTMLVideoElement>) {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<CameraErrorKind>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const start = useCallback(async () => {
    setError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('UNSUPPORTED_BROWSER');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsActive(true);
    } catch (err: any) {
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setError('PERMISSION_DENIED');
      } else if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
        setError('NO_CAMERA');
      } else {
        setError('UNAVAILABLE');
      }
      setIsActive(false);
    }
  }, [videoRef]);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsActive(false);
  }, [videoRef]);

  useEffect(() => () => stop(), [stop]);

  return { isActive, error, start, stop };
}
