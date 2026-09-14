import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useCamera } from './useCamera';
import { useHandLandmarks } from './useHandLandmarks';

import {
  SignClassifier,
  TemporalSmoother,
  CONFIDENCE_THRESHOLD,
  SEQUENCE_LENGTH,
} from '../services/classifierService';

import { landmarksToFeatures } from '../utils/landmarkFeatures';

import {
  loadTrainingSamples,
  saveTrainingSamples,
} from '../utils/storage';

import type {
  LandmarkPoint,
  Prediction,
  SignId,
  TrainingSample,
} from '../types';


/*
 * ---------------------------------------------------------
 * SETTINGS
 * ---------------------------------------------------------
 */

const SEQUENCE_SAMPLE_INTERVAL = 120;

const TRAINING_FILE =
  `${import.meta.env.BASE_URL}signbridge-training-2026-09-14.json`;


/*
 * ---------------------------------------------------------
 * HOOK
 * ---------------------------------------------------------
 */

export function useSignRecognition(
  videoRef: React.RefObject<HTMLVideoElement>
) {

  /*
   * -------------------------------------------------------
   * CAMERA
   * -------------------------------------------------------
   */

  const camera =
    useCamera(videoRef);


  /*
   * -------------------------------------------------------
   * CLASSIFIER
   * -------------------------------------------------------
   */

  const classifierRef =
    useRef<SignClassifier>(
      new SignClassifier()
    );


  /*
   * -------------------------------------------------------
   * TEMPORAL SMOOTHER
   * -------------------------------------------------------
   */

  const smootherRef =
    useRef<TemporalSmoother>(
      new TemporalSmoother(5, 3)
    );


  /*
   * -------------------------------------------------------
   * RECOGNITION STATE
   * -------------------------------------------------------
   */

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


  const [paused, setPaused] =
    useState(false);


  const pausedRef =
    useRef(paused);

  pausedRef.current =
    paused;


  /*
   * -------------------------------------------------------
   * SEQUENCE HISTORY
   * -------------------------------------------------------
   */

  const featureHistoryRef =
    useRef<number[][]>([]);


  const lastSequenceSampleTimeRef =
    useRef(0);


  /*
   * -------------------------------------------------------
   * TRAINING VERSION
   * -------------------------------------------------------
   *
   * This forces React to update the "trained signs"
   * display after the bundled JSON is loaded.
   */

  const [trainingVersion, setTrainingVersion] =
    useState(0);


  /*
   * -------------------------------------------------------
   * LOAD BUNDLED TRAINING DATA
   * -------------------------------------------------------
   *
   * The file is:
   *
   * public/
   *   signbridge-training-2026-09-14.json
   *
   * If the visitor already has training data,
   * we keep their existing data.
   */

  useEffect(() => {

    let cancelled = false;


    const loadBundledTraining =
      async () => {

        try {

          /*
           * Check existing browser training.
           */
          const existing =
            loadTrainingSamples();


          /*
           * If training already exists,
           * don't overwrite it.
           */
          if (existing.length > 0) {

            classifierRef.current.reload();

            if (!cancelled) {
              setTrainingVersion(
                (value) => value + 1
              );
            }

            return;
          }


          /*
           * Download the bundled JSON file.
           */
          const response =
            await fetch(
              TRAINING_FILE,
              {
                cache: 'no-store',
              }
            );


          if (!response.ok) {

            throw new Error(
              `Training file could not be loaded: ${response.status}`
            );

          }


          /*
           * Read JSON.
           */
          const data =
            await response.json();


          /*
           * Support both:
           *
           * TrainingSample[]
           *
           * and:
           *
           * { samples: [...] }
           */
          const samples =
            Array.isArray(data)
              ? data
              : data?.samples;


          if (
            !Array.isArray(samples) ||
            samples.length === 0
          ) {

            throw new Error(
              'No training samples found in bundled file.'
            );

          }


          /*
           * Validate samples.
           */
          const validSamples =
            samples.filter(
              (sample: any) =>
                sample &&
                typeof sample.signId === 'string' &&
                Array.isArray(sample.features) &&
                sample.features.length > 0
            ) as TrainingSample[];


          if (
            validSamples.length === 0
          ) {

            throw new Error(
              'No valid training samples found.'
            );

          }


          /*
           * Component may have unmounted.
           */
          if (cancelled) {
            return;
          }


          /*
           * Save training data into localStorage.
           */
          saveTrainingSamples(
            validSamples
          );


          /*
           * Reload classifier.
           */
          classifierRef.current.reload();


          /*
           * Tell React that training is ready.
           */
          setTrainingVersion(
            (value) => value + 1
          );


          console.log(
            `SignBridge: loaded ${validSamples.length} training samples.`
          );


        } catch (error) {

          console.warn(
            'SignBridge training data loading failed:',
            error
          );

        }

      };


    loadBundledTraining();


    return () => {

      cancelled = true;

    };

  }, []);


  /*
   * ---------------------------------------------------------
   * RESET RECOGNITION
   * ---------------------------------------------------------
   */

  const resetRecognition =
    () => {

      featureHistoryRef.current =
        [];

      lastSequenceSampleTimeRef.current =
        0;

      smootherRef.current.reset();


      setLiveFrame({
        signId: null,
        confidence: 0,
      });


      setConfirmed({
        signId: null,
        confidence: 0,
      });

    };


  /*
   * ---------------------------------------------------------
   * FRAME HANDLER
   * ---------------------------------------------------------
   */

  const handleFrame =
    (
      landmarks:
        LandmarkPoint[] | null
    ) => {

      /*
       * Don't process while paused.
       */
      if (pausedRef.current) {
        return;
      }


      /*
       * No hand detected.
       */
      if (!landmarks) {

        featureHistoryRef.current =
          [];

        lastSequenceSampleTimeRef.current =
          0;


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


      /*
       * Convert landmarks into features.
       */
      const features =
        landmarksToFeatures(
          landmarks
        );


      if (!features.length) {
        return;
      }


      /*
       * -----------------------------------------------------
       * FRAME PREDICTION
       * -----------------------------------------------------
       */

      const framePrediction =
        classifierRef.current.predict(
          features
        );


      /*
       * -----------------------------------------------------
       * SEQUENCE SAMPLING
       * -----------------------------------------------------
       */

      const now =
        performance.now();


      const enoughTimePassed =
        now -
        lastSequenceSampleTimeRef.current >=
        SEQUENCE_SAMPLE_INTERVAL;


      if (enoughTimePassed) {

        lastSequenceSampleTimeRef.current =
          now;


        featureHistoryRef.current.push(
          features
        );


        /*
         * Keep only the latest frames.
         */
        if (
          featureHistoryRef.current.length >
          SEQUENCE_LENGTH
        ) {

          featureHistoryRef.current.shift();

        }

      }


      /*
       * -----------------------------------------------------
       * CHOOSE PREDICTION
       * -----------------------------------------------------
       */

      let prediction =
        framePrediction;


      /*
       * Use sequence prediction when enough
       * frames are available.
       */
      if (
        featureHistoryRef.current.length >=
        SEQUENCE_LENGTH
      ) {

        const sequencePrediction =
          classifierRef.current.predictSequence(
            featureHistoryRef.current
          );


        if (
          sequencePrediction.signId &&
          sequencePrediction.confidence >=
          CONFIDENCE_THRESHOLD
        ) {

          prediction =
            sequencePrediction;

        }

      }


      /*
       * Show live prediction.
       */
      setLiveFrame(
        prediction
      );


      /*
       * Smooth prediction.
       */
      const smoothed =
        smootherRef.current.push(
          prediction
        );


      /*
       * Confirm stable prediction.
       */
      if (smoothed.signId) {

        setConfirmed(
          smoothed
        );

      }

    };


  /*
   * ---------------------------------------------------------
   * MEDIAPIPE
   * ---------------------------------------------------------
   */

  const {
    landmarks,
    handDetected,
    modelError,
    modelLoading,
  } =
    useHandLandmarks({
      videoRef,
      active:
        camera.isActive,
      onFrame:
        handleFrame,
    });


  /*
   * ---------------------------------------------------------
   * CAPTURE TRAINING SAMPLE
   * ---------------------------------------------------------
   */

  const captureSample =
    (
      signId: SignId,
      sessionId?: string,
      frameIndex?: number
    ): boolean => {

      /*
       * No hand detected.
       */
      if (!landmarks) {
        return false;
      }


      /*
       * Convert landmarks.
       */
      const features =
        landmarksToFeatures(
          landmarks
        );


      if (!features.length) {
        return false;
      }


      /*
       * Save sample.
       */
      classifierRef.current.addSample(
        signId,
        features,
        sessionId,
        frameIndex
      );


      /*
       * Update UI.
       */
      setTrainingVersion(
        (value) => value + 1
      );


      return true;

    };


  /*
   * ---------------------------------------------------------
   * CLEAR RECOGNITION
   * ---------------------------------------------------------
   */

  const clearConfirmed =
    () => {

      resetRecognition();

    };


  /*
   * ---------------------------------------------------------
   * CLASSIFIER READY
   * ---------------------------------------------------------
   */

  const classifierReady =
    useMemo(
      () =>
        classifierRef.current.isReady(),
      [
        landmarks,
        trainingVersion,
      ]
    );


  /*
   * ---------------------------------------------------------
   * RETURN
   * ---------------------------------------------------------
   */

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

    classifier:
      classifierRef.current,

    classifierReady,

    CONFIDENCE_THRESHOLD,

  };

}
