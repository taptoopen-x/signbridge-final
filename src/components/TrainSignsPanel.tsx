import { useEffect, useRef, useState } from 'react';
import Button from './ui/Button';
import Card from './ui/Card';
import { SIGN_LIST } from '../data/signDictionary';
import type { SignId } from '../types';
import type { SignClassifier } from '../services/classifierService';

interface TrainSignsPanelProps {
  classifier: SignClassifier;
  cameraActive: boolean;
  handDetected: boolean;

  /*
   * Optional sessionId + frameIndex allow Auto Training
   * to store a complete gesture as a sequence.
   */
  captureSample: (
    signId: SignId,
    sessionId?: string,
    frameIndex?: number
  ) => boolean;
}


/*
 * ---------------------------------------------------------
 * AUTO TRAINING SETTINGS
 * ---------------------------------------------------------
 */

const AUTO_SAMPLE_COUNT = 12;

const AUTO_CAPTURE_INTERVAL = 150;

const COUNTDOWN_SECONDS = 3;


/*
 * Create a unique ID for each training recording.
 *
 * crypto.randomUUID() is used when available.
 * The fallback works in normal browsers too.
 */

function createSessionId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}


/*
 * ---------------------------------------------------------
 * COMPONENT
 * ---------------------------------------------------------
 */

export default function TrainSignsPanel({
  classifier,
  cameraActive,
  handDetected,
  captureSample,
}: TrainSignsPanelProps) {

  const [selected, setSelected] =
    useState<SignId>(
      SIGN_LIST[0].id
    );


  const [, forceRerender] =
    useState(0);


  const [autoTraining, setAutoTraining] =
    useState(false);


  const [countdown, setCountdown] =
    useState<number | null>(null);


  const [autoCount, setAutoCount] =
    useState(0);


  /*
   * -------------------------------------------------------
   * REFS
   * -------------------------------------------------------
   *
   * Refs make sure the timer always gets
   * the latest camera/sign state.
   */

  const handDetectedRef =
    useRef(handDetected);

  const selectedRef =
    useRef(selected);

  const captureSampleRef =
    useRef(captureSample);


  handDetectedRef.current =
    handDetected;

  selectedRef.current =
    selected;

  captureSampleRef.current =
    captureSample;


  /*
   * Timer references.
   */

  const intervalRef =
    useRef<number | null>(null);

  const countdownRef =
    useRef<number | null>(null);


  /*
   * Current Auto Training session.
   *
   * One session = one complete gesture.
   */
  const sessionIdRef =
    useRef<string | null>(null);


  /*
   * Current frame number inside the gesture.
   *
   * 0 → first frame
   * 1 → second frame
   * ...
   * 11 → final frame
   */
  const frameIndexRef =
    useRef(0);


  /*
   * -------------------------------------------------------
   * MANUAL CAPTURE
   * -------------------------------------------------------
   */

  const handleCapture = () => {

    const ok =
      captureSampleRef.current(
        selectedRef.current
      );


    if (ok) {
      forceRerender(
        (n) => n + 1
      );
    }
  };


  /*
   * -------------------------------------------------------
   * STOP AUTO TRAINING
   * -------------------------------------------------------
   */

  const stopAutoTraining = () => {

    if (
      intervalRef.current !== null
    ) {
      window.clearInterval(
        intervalRef.current
      );

      intervalRef.current = null;
    }


    if (
      countdownRef.current !== null
    ) {
      window.clearInterval(
        countdownRef.current
      );

      countdownRef.current = null;
    }


    setAutoTraining(false);

    setCountdown(null);

    setAutoCount(0);


    /*
     * Finish the current session.
     */
    sessionIdRef.current =
      null;

    frameIndexRef.current =
      0;
  };


  /*
   * -------------------------------------------------------
   * START AUTO TRAINING
   * -------------------------------------------------------
   */

  const startAutoTraining = () => {

    if (
      !cameraActive ||
      !handDetected
    ) {
      return;
    }


    /*
     * Create a completely new gesture session.
     */
    const sessionId =
      createSessionId();


    sessionIdRef.current =
      sessionId;


    frameIndexRef.current =
      0;


    setAutoTraining(true);

    setAutoCount(0);

    setCountdown(
      COUNTDOWN_SECONDS
    );


    let remaining =
      COUNTDOWN_SECONDS;


    /*
     * 3...
     * 2...
     * 1...
     * START
     */

    countdownRef.current =
      window.setInterval(() => {

        remaining -= 1;


        if (
          remaining <= 0
        ) {

          if (
            countdownRef.current !==
            null
          ) {
            window.clearInterval(
              countdownRef.current
            );

            countdownRef.current =
              null;
          }


          setCountdown(null);


          let captured = 0;


          /*
           * Capture 12 frames.
           */
          intervalRef.current =
            window.setInterval(() => {

              /*
               * If hand temporarily disappears,
               * wait instead of recording an
               * empty frame.
               */
              if (
                !handDetectedRef.current
              ) {
                return;
              }


              const currentSession =
                sessionIdRef.current;


              if (!currentSession) {
                return;
              }


              const currentFrame =
                frameIndexRef.current;


              /*
               * Store this frame as part of
               * the current gesture session.
               */
              const ok =
                captureSampleRef.current(
                  selectedRef.current,
                  currentSession,
                  currentFrame
                );


              if (ok) {

                captured += 1;


                frameIndexRef.current +=
                  1;


                setAutoCount(
                  captured
                );


                forceRerender(
                  (n) => n + 1
                );
              }


              /*
               * Finished 12 frames.
               */
              if (
                captured >=
                AUTO_SAMPLE_COUNT
              ) {
                stopAutoTraining();
              }

            }, AUTO_CAPTURE_INTERVAL);
        } else {

          setCountdown(
            remaining
          );
        }

      }, 1000);
  };


  /*
   * -------------------------------------------------------
   * CLEAR SELECTED SIGN
   * -------------------------------------------------------
   */

  const handleClear = () => {

    stopAutoTraining();

    classifier.clearSign(
      selected
    );

    forceRerender(
      (n) => n + 1
    );
  };


  /*
   * -------------------------------------------------------
   * STOP WHEN SIGN CHANGES
   * -------------------------------------------------------
   */

  useEffect(() => {

    if (autoTraining) {
      stopAutoTraining();
    }

  }, [selected]);


  /*
   * -------------------------------------------------------
   * STOP WHEN CAMERA STOPS
   * -------------------------------------------------------
   */

  useEffect(() => {

    if (!cameraActive) {
      stopAutoTraining();
    }

  }, [cameraActive]);


  /*
   * -------------------------------------------------------
   * CLEANUP
   * -------------------------------------------------------
   */

  useEffect(() => {

    return () => {

      if (
        intervalRef.current !== null
      ) {
        window.clearInterval(
          intervalRef.current
        );
      }


      if (
        countdownRef.current !== null
      ) {
        window.clearInterval(
          countdownRef.current
        );
      }
    };

  }, []);


  /*
   * -------------------------------------------------------
   * CURRENT SIGN
   * -------------------------------------------------------
   */

  const selectedSign =
    SIGN_LIST.find(
      (s) =>
        s.id === selected
    );


  const sampleCount =
    classifier.sampleCount(
      selected
    );


  /*
   * -------------------------------------------------------
   * UI
   * -------------------------------------------------------
   */

  return (
    <Card className="p-5 space-y-4">

      <div>

        <p className="font-display font-semibold">
          Train / Manage Signs
        </p>


        <p className="text-mist text-sm mt-1">
          Automatically capture examples of each
          sign. Moving gestures are stored as a
          short sequence instead of a single pose.
        </p>

      </div>


      <div className="flex flex-wrap gap-2">

        <select
          value={selected}
          onChange={(e) =>
            setSelected(
              e.target.value as SignId
            )
          }
          disabled={autoTraining}
          className="focus-ring bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
        >

          {SIGN_LIST.map((s) => (

            <option
              key={s.id}
              value={s.id}
              className="bg-base-800"
            >
              {s.displayName} —{' '}
              {classifier.sampleCount(
                s.id
              )}{' '}
              samples
            </option>

          ))}

        </select>


        {!autoTraining ? (

          <Button
            size="md"
            onClick={
              startAutoTraining
            }
            disabled={
              !cameraActive ||
              !handDetected
            }
          >
            ▶ Start Auto Training
          </Button>

        ) : (

          <Button
            size="md"
            variant="secondary"
            onClick={
              stopAutoTraining
            }
          >
            ⏹ Stop Training
          </Button>

        )}


        <Button
          size="md"
          variant="secondary"
          onClick={
            handleCapture
          }
          disabled={
            !cameraActive ||
            !handDetected ||
            autoTraining
          }
        >
          📸 Capture Sample
        </Button>


        <Button
          size="md"
          variant="ghost"
          onClick={
            handleClear
          }
          disabled={
            autoTraining
          }
        >
          Clear samples
        </Button>

      </div>


      {autoTraining && (

        <div className="rounded-xl border border-success/25 bg-success/10 p-4 space-y-3">

          <div className="flex items-center justify-between">

            <p className="font-semibold text-success">

              {countdown !== null
                ? `Get ready... ${countdown}`
                : `Recording gesture ${autoCount}/${AUTO_SAMPLE_COUNT}`}

            </p>


            <span className="text-sm text-mist">
              {selectedSign?.displayName}
            </span>

          </div>


          {countdown !== null ? (

            <p className="text-sm text-mist">
              Get ready. Perform the complete sign
              naturally when recording starts.
            </p>

          ) : (

            <p className="text-sm text-mist">
              Perform the complete gesture naturally.
              Keep moving until recording finishes.
            </p>

          )}


          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">

            <div
              className="h-full bg-success transition-all duration-150"
              style={{
                width: `${
                  (
                    autoCount /
                    AUTO_SAMPLE_COUNT
                  ) *
                  100
                }%`,
              }}
            />

          </div>

        </div>

      )}


      {!cameraActive && (

        <p className="text-xs text-mist">
          Start the camera above, show your hand,
          then start Auto Training.
        </p>

      )}


      {cameraActive &&
        !handDetected && (

          <p className="text-xs text-warn">
            Show your hand to the camera to enable
            training.
          </p>

        )}


      {cameraActive &&
        handDetected &&
        !autoTraining && (

          <p className="text-xs text-mist">
            Select a sign and start Auto Training.
            For moving signs, perform the whole
            movement during recording.
          </p>

        )}


      <div className="flex flex-wrap gap-2 pt-1">

        {SIGN_LIST.map((s) => {

          const count =
            classifier.sampleCount(
              s.id
            );


          return (

            <span
              key={s.id}
              className={`text-xs rounded-full px-2.5 py-1 border ${
                count >= 8
                  ? 'bg-success/10 border-success/25 text-success'
                  : count > 0
                  ? 'bg-warn/10 border-warn/25 text-warn'
                  : 'bg-white/5 border-white/10 text-mist'
              }`}
            >
              {s.emoji}{' '}
              {s.displayName}:{' '}
              {count}
            </span>

          );
        })}

      </div>


      <div className="text-xs text-mist border-t border-white/10 pt-3">

        Selected sign:{' '}

        <span className="font-semibold text-white">
          {selectedSign?.displayName}
        </span>


        {' • '}


        Samples:{' '}

        <span className="font-semibold text-white">
          {sampleCount}
        </span>

      </div>


      <div className="text-xs text-mist bg-white/5 border border-white/10 rounded-lg p-3">

        <span className="font-semibold text-white">
          Sequence training:
        </span>{' '}

        Each Auto Training recording captures{' '}
        <span className="font-semibold text-white">
          {AUTO_SAMPLE_COUNT} frames
        </span>{' '}
        as one gesture session. This helps the
        recognizer learn both hand position and
        movement.

      </div>

    </Card>
  );
}