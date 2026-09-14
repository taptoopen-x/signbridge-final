import {
  useEffect,
  useRef,
  useState,
} from 'react';

import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

import CameraView from '../components/camera/CameraView';
import StatusBadges from '../components/camera/StatusBadges';

import {
  useSignRecognition,
} from '../hooks/useSignRecognition';

import {
  SIGN_DICTIONARY,
} from '../data/signDictionary';

import {
  speak,
} from '../services/speechService';

import {
  useConversation,
} from '../context/ConversationContext';


export default function SignToText() {

  const videoRef =
    useRef<HTMLVideoElement>(null);

  const rec =
    useSignRecognition(
      videoRef
    );

  const {
    addEntry,
  } = useConversation();

  const [
    spokenSign,
    setSpokenSign,
  ] = useState<string | null>(
    null
  );

  const lastAutomaticallySpokenSign =
    useRef<string | null>(null);

  const confirmedSign =
    rec.confirmed.signId
      ? SIGN_DICTIONARY[
          rec.confirmed.signId
        ]
      : null;

  const lowConfidenceNoise =
    rec.handDetected &&
    !rec.confirmed.signId &&
    rec.liveFrame.signId === null;


  /*
   * Automatically speak when a NEW sign is confirmed.
   *
   * The same sign is not repeated continuously.
   * Speech happens again only after another sign
   * is recognized.
   */

  useEffect(() => {

    if (!confirmedSign) {
      return;
    }

    if (
      lastAutomaticallySpokenSign.current ===
      confirmedSign.id
    ) {
      return;
    }

    lastAutomaticallySpokenSign.current =
      confirmedSign.id;

    const speechText =
      `This is the sign for ${confirmedSign.displayName}.`;

    speak(
      speechText
    );

    setSpokenSign(
      confirmedSign.displayName
    );

    addEntry(
      'SIGN_USER',
      confirmedSign.displayName,
      [confirmedSign.id]
    );

  }, [
    confirmedSign,
    addEntry,
  ]);


  /*
   * Speak button:
   * The user can press this to hear the
   * currently recognized sign again.
   */

  const handleSpeak =
    () => {

      if (!confirmedSign) {
        return;
      }

      const speechText =
        `This is the sign for ${confirmedSign.displayName}.`;

      speak(
        speechText
      );

      setSpokenSign(
        confirmedSign.displayName
      );

    };


  /*
   * Clear the current sign and allow the
   * same sign to be spoken automatically again.
   */

  const handleClear =
    () => {

      lastAutomaticallySpokenSign.current =
        null;

      setSpokenSign(
        null
      );

      rec.clearConfirmed();

    };


  return (

    <div className="space-y-8 pb-10">

      <div>

        <h1 className="font-display text-3xl md:text-4xl font-semibold mb-2">

          Sign → Text → Speech

        </h1>

        <p className="text-mist max-w-2xl">

          Perform a trained sign in front of the
          camera. SignBridge recognizes the sign,
          displays the result, and automatically
          speaks the meaning aloud.

        </p>

      </div>


      <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 items-start">


        <div className="space-y-4">

          <StatusBadges
            aiReady={
              rec.classifierReady
            }

            cameraActive={
              rec.camera.isActive
            }

            cameraError={
              !!rec.camera.error
            }

            handDetected={
              rec.handDetected
            }

            processing={
              rec.modelLoading
            }
          />


          <CameraView
            videoRef={
              videoRef
            }

            isActive={
              rec.camera.isActive
            }

            error={
              rec.camera.error
            }

            landmarks={
              rec.landmarks
            }

            onStart={
              rec.camera.start
            }
          />


          {rec.modelError && (

            <p className="text-sm text-coral-400 bg-coral-500/10 border border-coral-500/20 rounded-lg px-4 py-2">

              {rec.modelError}

            </p>

          )}

        </div>


        <div className="space-y-4">


          <Card className="p-6 space-y-5">

            <div>

              <p className="text-sm font-semibold text-mist">

                Recognition Result

              </p>

              <p className="text-xs text-mist mt-1">

                The most recent confirmed sign appears here.

              </p>

            </div>


            {confirmedSign ? (

              <div className="space-y-4 animate-rise">


                <div className="flex items-center gap-4">

                  <div className="w-16 h-16 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center">

                    <span className="text-4xl">

                      {confirmedSign.emoji}

                    </span>

                  </div>


                  <div>

                    <p className="text-3xl font-display font-bold">

                      {confirmedSign.displayName}

                    </p>

                    <p className="text-mist text-sm">

                      Detected Sign

                    </p>

                  </div>

                </div>


                <div>

                  <div className="flex items-center justify-between mb-2">

                    <p className="text-xs text-mist">

                      Confidence

                    </p>

                    <p className="text-sm text-success font-semibold">

                      {(
                        rec.confirmed
                          .confidence *
                        100
                      ).toFixed(1)}
                      %

                    </p>

                  </div>


                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">

                    <div
                      className="h-full bg-success transition-all duration-300"

                      style={{
                        width: `${
                          (
                            rec.confirmed
                              .confidence *
                            100
                          ).toFixed(0)
                        }%`,
                      }}
                    />

                  </div>

                </div>


                {confirmedSign.meaning && (

                  <div className="rounded-xl bg-white/5 border border-white/10 p-4">

                    <p className="text-xs text-mist">

                      Meaning

                    </p>

                    <p className="text-sm font-medium mt-1">

                      {confirmedSign.meaning}

                    </p>

                  </div>

                )}


                {spokenSign ===
                  confirmedSign.displayName && (

                  <p className="text-xs text-success">

                    🔊 Automatically spoken:
                    "This is the sign for {confirmedSign.displayName}."

                  </p>

                )}

              </div>


            ) : lowConfidenceNoise ? (

              <div className="rounded-xl bg-warn/10 border border-warn/20 p-4">

                <p className="text-sm font-semibold text-warn">

                  Sign not recognized clearly

                </p>

                <p className="text-xs text-mist mt-1">

                  Try performing the trained gesture again
                  and keep your hand clearly visible.

                </p>

              </div>


            ) : (

              <div className="rounded-xl bg-white/5 border border-white/10 p-5">

                <p className="text-mist text-sm">

                  {rec.camera.isActive
                    ? '👋 Show a trained sign to the camera…'
                    : '🎥 Start the camera to begin.'}

                </p>

              </div>

            )}


            {!rec.classifierReady && (

              <p className="text-xs text-warn bg-warn/10 border border-warn/20 rounded-lg px-3 py-2">

                No signs have been trained on this device yet.
                The project team can train the required signs
                from the private AI Training Center.

              </p>

            )}

          </Card>


          <Card className="p-5">

            <p className="text-sm font-semibold mb-3">

              Controls

            </p>


            <div className="flex flex-wrap gap-3">

              <Button
                onClick={
                  rec.camera.start
                }

                disabled={
                  rec.camera.isActive
                }
              >

                🎥 Start Camera

              </Button>


              <Button
                variant="secondary"

                onClick={() =>
                  rec.setPaused(
                    (p) => !p
                  )
                }

                disabled={
                  !rec.camera.isActive
                }
              >

                {rec.paused
                  ? '▶ Resume'
                  : '⏸ Pause'}

              </Button>


              <Button
                variant="secondary"

                onClick={
                  handleSpeak
                }

                disabled={
                  !confirmedSign
                }
              >

                🔊 Speak Again

              </Button>


              <Button
                variant="ghost"

                onClick={
                  handleClear
                }
              >

                Clear

              </Button>

            </div>

          </Card>


          <Card className="p-5 bg-success/10 border-success/20">

            <p className="font-semibold text-success">

              💡 Demo tip

            </p>

            <p className="text-xs text-mist mt-2">

              Show a trained sign and wait for the
              recognition result. SignBridge will
              automatically speak the sentence.
              Use "Speak Again" if you want to hear it
              one more time.

            </p>

          </Card>

        </div>

      </div>


      <Card className="p-6">

        <p className="font-display text-xl font-semibold">

          How Sign → Text works

        </p>


        <div className="grid md:grid-cols-3 gap-4 mt-4">

          <div className="rounded-xl bg-white/5 border border-white/10 p-4">

            <p className="text-lg">
              📷
            </p>

            <p className="text-sm font-semibold mt-2">

              1. Camera

            </p>

            <p className="text-xs text-mist mt-1">

              The camera observes your hand gesture.

            </p>

          </div>


          <div className="rounded-xl bg-white/5 border border-white/10 p-4">

            <p className="text-lg">
              🧠
            </p>

            <p className="text-sm font-semibold mt-2">

              2. Recognition

            </p>

            <p className="text-xs text-mist mt-1">

              SignBridge compares the gesture with
              locally trained examples.

            </p>

          </div>


          <div className="rounded-xl bg-white/5 border border-white/10 p-4">

            <p className="text-lg">
              🔊
            </p>

            <p className="text-sm font-semibold mt-2">

              3. Automatic Communication

            </p>

            <p className="text-xs text-mist mt-1">

              The recognized sign is displayed and
              automatically spoken aloud.

            </p>

          </div>

        </div>

      </Card>

    </div>
  );
}
