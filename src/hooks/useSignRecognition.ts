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

import {
  landmarksToFeatures,
} from '../utils/landmarkFeatures';

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


const SEQUENCE_SAMPLE_INTERVAL = 120;

const TRAINING_FILE =
  `${import.meta.env.BASE_URL}signbridge-training-2026-09-14.json`;


export function useSignRecognition(
  videoRef: React.RefObject<HTMLVideoElement>
) {

  const camera =
    useCamera(videoRef);


  const classifierRef =
    useRef<SignClassifier>(
      new SignClassifier()
    );


  const smootherRef =
    useRef<TemporalSmoother>(
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


  const [paused, setPaused] =
    useState(false);


  const pausedRef =
    useRef(paused);

  pausedRef.current =
    paused;


  const featureHistoryRef =
    useRef<number[][]>([]);


  const lastSequenceSampleTimeRef =
    useRef(0);


  /*
   * ---------------------------------------------------------
   * LOAD DEFAULT TRAINING DATA
   * ---------------------------------------------------------
   *
   * The exported training JSON is stored inside public/.
   *
   * This means every visitor can receive the same
   * trained signs instead of starting with an empty
   * localStorage.
   */

  useEffect(() => {

    let cancelled = false;

    const loadDefaultTraining =
      async () => {

        try {

          const existing =
            loadTrainingSamples();

          /*
           * If this browser already has training data,
           * keep it.
           */
          if (existing.length > 0) {
            return;
          }


          const response =
            await fetch(TRAINING_FILE);


          if (!response.ok) {
            throw new Error(
              `Training file could not be loaded (${response.status})`
            );
          }


          const data =
            await response.json();


          const samples =
            Array.isArray(data)
              ? data
              : data?.samples;


          if (
            !Array.isArray(samples) ||
            samples.length === 0
          ) {
            throw new Error(
              'No training samples found.'
            );
          }


          const validSamples =
            samples.filter(
              (sample: any) =>
                sample &&
                typeof sample.signId === 'string' &&
                Array.isArray(sample.features) &&
                sample.features.length > 0
            ) as TrainingSample[];


          if (
            cancelled ||
            validSamples.length === 0
          ) {
            return;
          }


          saveTrainingSamples(
            validSamples
          );


          /*
           * Reload the classifier so it uses
           * the newly imported samples.
           */
          classifierRef.current.reload();

          console.log(
            `SignBridge: loaded ${validSamples.length} default training samples.`
          );

        } catch (error) {

          console.warn(
            'SignBridge default training data was not loaded:',
            error
          );

        }

      };


    loadDefaultTraining();


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

      if (pausedRef.current) {
        return;
      }


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


      const features =
        landmarksToFeatures(
          landmarks
        );


      if (!features.length) {
        return;
      }


      const framePrediction =
        classifierRef.current.predict(
          features
        );


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


        if (
          featureHistoryRef.current.length >
          SEQUENCE_LENGTH
        ) {
          featureHistoryRef.current.shift();
        }

      }


      let prediction =
        framePrediction;


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


      setLiveFrame(
        prediction
      );


      const smoothed =
        smootherRef.current.push(
          prediction
        );


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

      if (!landmarks) {
        return false;
      }


      const features =
        landmarksToFeatures(
          landmarks
        );


      if (!features.length) {
        return false;
      }


      classifierRef.current.addSample(
        signId,
        features,
        sessionId,
        frameIndex
      );


      return true;

    };


  /*
   * ---------------------------------------------------------
   * CLEAR RESULT
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
      [landmarks]
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
