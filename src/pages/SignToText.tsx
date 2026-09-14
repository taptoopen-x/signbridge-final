import {
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

  /*
   * =====================================================
   * CAMERA
   * =====================================================
   */

  const videoRef =
    useRef<HTMLVideoElement>(null);


  /*
   * =====================================================
   * SIGN RECOGNITION
   * =====================================================
   */

  const rec =
    useSignRecognition(
      videoRef
    );


  /*
   * =====================================================
   * CONVERSATION
   * =====================================================
   */

  const {
    addEntry,
  } = useConversation();


  /*
   * =====================================================
   * SPEECH STATE
   * =====================================================
   */

  const [
    spokenSign,
    setSpokenSign,
  ] = useState<string | null>(
    null
  );


  /*
   * =====================================================
   * CURRENT RECOGNIZED SIGN
   * =====================================================
   */

  const confirmedSign =
    rec.confirmed.signId
      ? SIGN_DICTIONARY[
          rec.confirmed.signId
        ]
      : null;


  /*
   * =====================================================
   * LOW CONFIDENCE STATE
   * =====================================================
   */

  const lowConfidenceNoise =
    rec.handDetected &&
    !rec.confirmed.signId &&
    rec.liveFrame.signId === null;


  /*
   * =====================================================
   * SPEAK
   * =====================================================
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

      addEntry(
        'SIGN_USER',
        confirmedSign.displayName,
        [confirmedSign.id]
      );
    };


  return (

    <div className="space-y-8 pb-10">


      {/* =================================================
          HEADER
          ================================================= */}

      <div>

        <h1 className="font-display text-3xl md:text-4xl font-semibold mb-2">

          Sign → Text → Speech

        </h1>


        <p className="text-mist max-w-2xl">

          Perform a trained sign in front of the
          camera. SignBridge tracks your hand locally,
          recognizes the trained sign, displays the
          result, and can speak the meaning aloud.

        </p>

      </div>



      {/* =================================================
          MAIN AREA
          CAMERA + IMPORTANT INFORMATION
          ================================================= */}

      <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 items-start">


        {/* =================================================
            LEFT — CAMERA
            ================================================= */}

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



        {/* =================================================
            RIGHT — IMPORTANT INFORMATION
            ================================================= */}

        <div className="space-y-4">


          {/* =================================================
              RECOGNITION RESULT
              ================================================= */}

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


                {/* Sign */}

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



                {/* Confidence */}

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



                {/* Meaning */}

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

                    🔊 Spoken: "This is the sign for {confirmedSign.displayName}."

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



            {/* No training */}

            {!rec.classifierReady && (

              <p className="text-xs text-warn bg-warn/10 border border-warn/20 rounded-lg px-3 py-2">

                No signs have been trained on this device yet.
                The project team can train the required signs
                from the private AI Training Center.

              </p>

            )}

          </Card>



          {/* =================================================
              MAIN CONTROLS
              ================================================= */}

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

                🔊 Speak

              </Button>



              <Button
                variant="ghost"

                onClick={
                  rec.clearConfirmed
                }
              >

                Clear

              </Button>

            </div>

          </Card>



          {/* =================================================
              QUICK DEMO INFO
              ================================================= */}

          <Card className="p-5 bg-success/10 border-success/20">


            <p className="font-semibold text-success">

              💡 Demo tip

            </p>


            <p className="text-xs text-mist mt-2">

              Keep your hand inside the camera frame and
              perform a trained sign naturally. Once the
              sign is recognized, press Speak to hear:
              "This is the sign for [sign]."

            </p>

          </Card>

        </div>

      </div>



      {/* =================================================
          EXTRA INFORMATION — BELOW THE MAIN AREA
          ================================================= */}

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
              3. Communication
            </p>

            <p className="text-xs text-mist mt-1">
              The recognized sign is displayed and can
              be spoken clearly to the listener.
            </p>

          </div>

        </div>

      </Card>


    </div>
  );
}
