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

  /*
   * Stores the last sign that was
   * automatically spoken.
   *
   * This prevents the same sign from
   * speaking continuously on every frame.
   */
  const lastAutomaticallySpokenSign =
    useRef<string | null>(null);


  /*
   * Current confirmed sign
   */
  const confirmedSign =
    rec.confirmed.signId
      ? SIGN_DICTIONARY[
          rec.confirmed.signId
        ]
      : null;


  /*
   * Detect low-confidence/no-sign state
   */
  const lowConfidenceNoise =
    rec.handDetected &&
    !rec.confirmed.signId &&
    rec.liveFrame.signId === null;


  /*
   * =====================================================
   * AUTOMATIC SPEECH
   * =====================================================
   *
   * When a NEW sign is confirmed:
   *
   * HELLO
   * ↓
   * "This is the sign for Hello."
   *
   * Then if the user changes sign:
   *
   * THANK YOU
   * ↓
   * "This is the sign for Thank You."
   *
   * The same sign will NOT be spoken repeatedly.
   */

  useEffect(() => {

    if (!confirmedSign) {
      return;
    }

    /*
     * Do not speak the same confirmed sign again.
     */
    if (
      lastAutomaticallySpokenSign.current ===
      confirmedSign.id
    ) {
      return;
    }

    /*
     * Remember this sign.
     */
    lastAutomaticallySpokenSign.current =
      confirmedSign.id;


    /*
     * Sentence that will be spoken.
     */
    const speechText =
      `This is the sign for ${confirmedSign.displayName}.`;


    /*
     * Speak automatically.
     */
    speak(
      speechText
    );


    /*
     * Update UI.
     */
    setSpokenSign(
      confirmedSign.displayName
    );


    /*
     * Add recognized sign to conversation history.
     */
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
   * =====================================================
   * SPEAK AGAIN BUTTON
   * =====================================================
   *
   * This is ONLY used when the user wants
   * to hear the current sign again.
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
   * =====================================================
   * CLEAR
   * =====================================================
   *
   * Clearing also allows the same sign to
   * be automatically spoken again.
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


      {/* =================================================
          HEADER
          ================================================= */}

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



      {/* =================================================
          MAIN AREA
          ================================================= */}

      <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 items-start">


        {/* =================================================
            CAMERA
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
            RECOGNITION SIDE
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


                {/* SIGN NAME */}

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



                {/* CONFIDENCE */}

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



                {/* MEANING */}

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



                {/* AUTOMATIC SPEECH STATUS */}

                {spokenSign ===
                  confirmedSign.displayName && (

                  <div className="rounded-xl bg-success/10 border border-success/20 p-3">

                    <p className="text-xs text-success font-medium">

                      🔊 Automatically spoken

                    </p>


                    <p className="text-xs text-mist mt-1">

                      "This is the sign for {confirmedSign.displayName}."

                    </p>

                  </div>

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



            {/* NO TRAINING */}

            {!rec.classifierReady && (

              <p className="text-xs text-warn bg-warn/10 border border-warn/20 rounded-lg px-3 py-2">

                No signs have been trained on this device yet.
                The project team can train the required signs
                from the private AI Training Center.

              </p>

            )}

          </Card>



          {/* =================================================
              CONTROLS
              ================================================= */}

          <Card className="p-5">


            <p className="text-sm font-semibold mb-3">

              Controls

            </p>


            <div className="flex flex-wrap gap-3">


              {/* START CAMERA */}

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



              {/* PAUSE */}

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



              {/* SPEAK AGAIN */}

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



              {/* CLEAR */}

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



          {/* =================================================
              DEMO TIP
              ================================================= */}

          <Card className="p-5 bg-success/10 border-success/20">


            <p className="font-semibold text-success">

              💡 Demo tip

            </p>


            <p className="text-xs text-mist mt-2">

              Show a trained sign and wait for the
              recognition result. SignBridge will
              automatically speak the sentence.
              Use "Speak Again" only if you want to
              hear the current sign one more time.

            </p>

          </Card>

        </div>

      </div>



      {/* =================================================
          HOW IT WORKS
          ================================================= */}

      <Card className="p-6">


        <p className="font-display text-xl font-semibold">

          How Sign → Text works

        </p>


        <div className="grid md:grid-cols-3 gap-4 mt-4">


          {/* CAMERA */}

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



          {/* RECOGNITION */}

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



          {/* SPEECH */}

          <div className="rounded-xl bg-white/5 border border-white/10 p-4">

            <p className="text-lg">

              🔊

            </p>


            <p className="text-sm font-semibold mt-2">

              3. Automatic Speech

            </p>


            <p className="text-xs text-mist mt-1">

              Once a new sign is confirmed, SignBridge
              automatically speaks the recognized sign.

            </p>

          </div>

        </div>

      </Card>


    </div>

  );
}
