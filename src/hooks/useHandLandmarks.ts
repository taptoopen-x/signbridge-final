import { useEffect, useRef, useState } from 'react';
import type { LandmarkPoint } from '../types';

interface UseHandLandmarksOptions {
  videoRef: React.RefObject<HTMLVideoElement>;
  active: boolean;
  onFrame?: (landmarks: LandmarkPoint[] | null) => void;
}

declare global {
  interface Window {
    Hands?: any;
  }
}

const BASE_URL = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

const MEDIAPIPE_BASE = `${BASE_URL}mediapipe/hands/`;

let handsScriptPromise: Promise<void> | null = null;

function loadHandsScript(): Promise<void> {
  if (window.Hands) {
    return Promise.resolve();
  }

  if (handsScriptPromise) {
    return handsScriptPromise;
  }

  handsScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(
      'script[data-mediapipe="Hands"]'
    ) as HTMLScriptElement | null;

    if (existing) {
      existing.addEventListener('load', () => resolve());

      existing.addEventListener('error', () =>
        reject(
          new Error(
            'Could not load MediaPipe Hands script.'
          )
        )
      );

      return;
    }

    const script = document.createElement('script');

    script.src = `${MEDIAPIPE_BASE}hands.js`;
    script.async = true;
    script.dataset.mediapipe = 'Hands';

    script.onload = () => {
      resolve();
    };

    script.onerror = () => {
      reject(
        new Error(
          `Could not load MediaPipe Hands from ${script.src}`
        )
      );
    };

    document.head.appendChild(script);
  });

  return handsScriptPromise;
}

export function useHandLandmarks({
  videoRef,
  active,
  onFrame,
}: UseHandLandmarksOptions) {
  const [landmarks, setLandmarks] =
    useState<LandmarkPoint[] | null>(null);

  const [handDetected, setHandDetected] =
    useState(false);

  const [modelError, setModelError] =
    useState<string | null>(null);

  const [modelLoading, setModelLoading] =
    useState(false);

  const handsRef = useRef<any>(null);

  const animationFrameRef =
    useRef<number | null>(null);

  const processingRef =
    useRef(false);

  const stoppedRef =
    useRef(false);

  const onFrameRef =
    useRef(onFrame);

  onFrameRef.current = onFrame;

  useEffect(() => {
    if (!active) {
      stoppedRef.current = true;

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(
          animationFrameRef.current
        );

        animationFrameRef.current = null;
      }

      if (handsRef.current) {
        try {
          handsRef.current.close?.();
        } catch {}
      }

      handsRef.current = null;

      processingRef.current = false;

      setHandDetected(false);
      setLandmarks(null);
      setModelLoading(false);
      setModelError(null);

      return;
    }

    let cancelled = false;

    stoppedRef.current = false;

    setModelLoading(true);
    setModelError(null);
    setHandDetected(false);
    setLandmarks(null);

    const startTracking = async () => {
      try {
        // ==================================================
        // 1. Load LOCAL MediaPipe Hands
        // ==================================================
        await loadHandsScript();

        if (cancelled || !window.Hands) {
          throw new Error(
            'MediaPipe Hands JavaScript failed to load.'
          );
        }

        const Hands = window.Hands;

        // ==================================================
        // 2. Create MediaPipe Hands
        // ==================================================
        const hands = new Hands({
          locateFile: (file: string) =>
            `${MEDIAPIPE_BASE}${file}`,
        });

        hands.setOptions({
          maxNumHands: 2,

          // 1 = full model
          modelComplexity: 1,

          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.6,
        });

        // ==================================================
        // 3. Receive MediaPipe results
        // ==================================================
        hands.onResults((results: any) => {
          if (
            cancelled ||
            stoppedRef.current
          ) {
            return;
          }

          const detectedHands =
            results?.multiHandLandmarks ?? [];

          const hasHand =
            detectedHands.length > 0;

          setHandDetected(hasHand);

          // No hand
          if (!hasHand) {
            setLandmarks(null);
            onFrameRef.current?.(null);
            return;
          }

          // =================================================
          // Keep Left hand first if two hands are detected
          // =================================================
          const orderedHands =
            detectedHands
              .map((hand: any, index: number) => ({
                hand,
                label:
                  results?.multiHandedness?.[index]
                    ?.label ?? '',
              }))
              .sort(
                (
                  a: any,
                  b: any
                ) => {
                  if (
                    a.label === 'Left' &&
                    b.label !== 'Left'
                  ) {
                    return -1;
                  }

                  if (
                    b.label === 'Left' &&
                    a.label !== 'Left'
                  ) {
                    return 1;
                  }

                  return 0;
                }
              );

          // =================================================
          // Convert MediaPipe landmarks to our format
          // =================================================
          const points: LandmarkPoint[] =
            orderedHands.flatMap(
              ({ hand }: any) =>
                hand.map((point: any) => ({
                  x: point.x,
                  y: point.y,
                  z: point.z,
                }))
            );

          setLandmarks(points);

          onFrameRef.current?.(points);
        });

        handsRef.current = hands;

        // ==================================================
        // 4. IMPORTANT:
        // Actually initialize MediaPipe
        // ==================================================
        if (
          typeof hands.initialize ===
          'function'
        ) {
          await hands.initialize();
        }

        if (cancelled) {
          try {
            hands.close?.();
          } catch {}

          return;
        }

        // ==================================================
        // 5. AI is READY only after initialization succeeds
        // ==================================================
        setModelLoading(false);

        // ==================================================
        // 6. Process camera frames
        // ==================================================
        const processFrame = async () => {
          if (
            cancelled ||
            stoppedRef.current
          ) {
            return;
          }

          const video =
            videoRef.current;

          if (!video) {
            animationFrameRef.current =
              requestAnimationFrame(
                processFrame
              );

            return;
          }

          // =================================================
          // Make sure the video really contains frames
          // =================================================
          const videoReady =
            video.readyState >= 2 &&
            video.videoWidth > 0 &&
            video.videoHeight > 0;

          if (
            videoReady &&
            !processingRef.current
          ) {
            processingRef.current = true;

            try {
              await hands.send({
                image: video,
              });
            } catch (error: any) {
              console.error(
                'MediaPipe frame processing failed:',
                error
              );

              if (!cancelled) {
                const message =
                  error?.message ||
                  String(error) ||
                  'Unknown MediaPipe error';

                setModelError(
                  `MediaPipe could not process the camera frame: ${message}`
                );

                setHandDetected(false);
                setLandmarks(null);

                onFrameRef.current?.(
                  null
                );
              }
            } finally {
              processingRef.current =
                false;
            }
          }

          animationFrameRef.current =
            requestAnimationFrame(
              processFrame
            );
        };

        animationFrameRef.current =
          requestAnimationFrame(
            processFrame
          );

      } catch (error: any) {
        console.error(
          'MediaPipe initialization failed:',
          error
        );

        if (!cancelled) {
          const message =
            error?.message ||
            String(error) ||
            'Unknown MediaPipe error';

          setModelError(
            `Hand-tracking AI failed to initialize: ${message}`
          );

          setModelLoading(false);
          setHandDetected(false);
          setLandmarks(null);
        }
      }
    };

    startTracking();

    // ====================================================
    // Cleanup
    // ====================================================
    return () => {
      cancelled = true;
      stoppedRef.current = true;

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(
          animationFrameRef.current
        );

        animationFrameRef.current = null;
      }

      if (handsRef.current) {
        try {
          handsRef.current.close?.();
        } catch {}
      }

      handsRef.current = null;

      processingRef.current = false;
    };

    // Restart tracking whenever active changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return {
    landmarks,
    handDetected,
    modelError,
    modelLoading,
  };
}