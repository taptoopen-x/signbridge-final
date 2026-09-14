import { useMemo, useRef, useState } from 'react';
import { useCamera } from './useCamera';
import { useHandLandmarks } from './useHandLandmarks';
import {
  SignClassifier,
  TemporalSmoother,
  CONFIDENCE_THRESHOLD,
} from '../services/classifierService';
import { landmarksToFeatures } from '../utils/landmarkFeatures';
import type {
  LandmarkPoint,
  Prediction,
  SignId,
} from '../types';

export function useSignRecognition(
  videoRef: React.RefObject<HTMLVideoElement>
) {
  const camera = useCamera(videoRef);

  const classifierRef = useRef<SignClassifier>(
    new SignClassifier()
  );

  const smootherRef = useRef<TemporalSmoother>(
    new TemporalSmoother(5, 3)
  );

  const [confirmed, setConfirmed] =
    useState<Prediction>({
      signId: null,
      confidence: 0,
    });

  const [liveFrame, setLiveFrame] =
    useState<Prediction>({
      signId: null,
      confidence: 0,
    });

  const [paused, setPaused] = useState(false);

  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  /*
   * Called whenever MediaPipe detects the hands.
   */
  const handleFrame = (
    landmarks: LandmarkPoint[] | null
  ) => {
    if (pausedRef.current) return;

    // No hand detected
    if (!landmarks) {
      setLiveFrame({
        signId: null,
        confidence: 0,
      });

      smootherRef.current.push({
        signId: null,
        confidence: 0,
      });

      return;
    }

    // Convert 1 or 2 hands into our feature vector.
    const features =
      landmarksToFeatures(landmarks);

    if (!features.length) {
      return;
    }

    // Fast local k-NN prediction.
    const prediction =
      classifierRef.current.predict(features);

    setLiveFrame(prediction);

    // Temporal smoothing prevents random frame flicker.
    const smoothed =
      smootherRef.current.push(prediction);

    if (smoothed.signId) {
      setConfirmed(smoothed);
    }
  };

  const {
    landmarks,
    handDetected,
    modelError,
    modelLoading,
  } = useHandLandmarks({
    videoRef,
    active: camera.isActive,
    onFrame: handleFrame,
  });

  /*
   * Capture one training frame.
   *
   * The automatic training panel will call this
   * repeatedly while the student performs a sign.
   */
  const captureSample = (
    signId: SignId
  ): boolean => {
    if (!landmarks) {
      return false;
    }

    const features =
      landmarksToFeatures(landmarks);

    if (!features.length) {
      return false;
    }

    classifierRef.current.addSample(
      signId,
      features
    );

    return true;
  };

  /*
   * Clear the currently displayed recognition.
   */
  const clearConfirmed = () => {
    setConfirmed({
      signId: null,
      confidence: 0,
    });

    setLiveFrame({
      signId: null,
      confidence: 0,
    });

    smootherRef.current.reset();
  };

  /*
   * Check whether enough training samples exist.
   */
  const classifierReady = useMemo(
    () => classifierRef.current.isReady(),
    [landmarks]
  );

  return {
    camera,

    landmarks,
    handDetected,

    modelError,
    modelLoading,

    confirmed,
    liveFrame,

    paused,
    setPaused,

    captureSample,
    clearConfirmed,

    classifier: classifierRef.current,
    classifierReady,

    CONFIDENCE_THRESHOLD,
  };
}