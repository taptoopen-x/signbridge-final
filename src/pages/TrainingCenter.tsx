import {
  useRef,
  useState,
  type ChangeEvent,
} from 'react';

import Card from '../components/ui/Card';
import CameraView from '../components/camera/CameraView';
import StatusBadges from '../components/camera/StatusBadges';
import TrainSignsPanel from '../components/TrainSignsPanel';
import Button from '../components/ui/Button';

import { useSignRecognition } from '../hooks/useSignRecognition';

import {
  exportTrainingData,
  importTrainingData,
  saveImportedTrainingData,
} from '../utils/storage';


export default function TrainingCenter() {

  /*
   * =====================================================
   * CAMERA
   * =====================================================
   */

  const videoRef =
    useRef<HTMLVideoElement>(null);


  /*
   * Hidden file input for importing
   * training data.
   */

  const fileInputRef =
    useRef<HTMLInputElement>(null);


  /*
   * =====================================================
   * BACKUP MESSAGE
   * =====================================================
   */

  const [
    backupMessage,
    setBackupMessage,
  ] = useState('');


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
   * EXPORT TRAINING DATA
   * =====================================================
   */

  const handleExport =
    () => {

      try {

        exportTrainingData();

        setBackupMessage(
          '✅ Training data exported successfully.'
        );

      } catch (error) {

        setBackupMessage(
          error instanceof Error
            ? error.message
            : 'Could not export training data.'
        );

      }
    };


  /*
   * =====================================================
   * IMPORT TRAINING DATA
   * =====================================================
   */

  const handleImport =
    async (
      event: ChangeEvent<HTMLInputElement>
    ) => {

      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      try {

        const samples =
          await importTrainingData(
            file
          );

        saveImportedTrainingData(
          samples
        );

        setBackupMessage(
          `✅ ${samples.length} training samples imported successfully. Reloading...`
        );


        /*
         * Reload so the classifier reads
         * the imported samples.
         */

        setTimeout(() => {

          window.location.reload();

        }, 1000);


      } catch (error) {

        setBackupMessage(
          error instanceof Error
            ? error.message
            : 'Could not import training data.'
        );

      }


      /*
       * Allow selecting the same file again.
       */

      event.target.value = '';
    };


  return (

    <div className="space-y-8 pb-10">


      {/* =================================================
          HEADER
          ================================================= */}

      <div>

        <div className="flex items-center gap-3 mb-2">

          <span className="text-3xl">
            🔒
          </span>


          <h1 className="font-display text-3xl md:text-4xl font-semibold">
            AI Training Center
          </h1>

        </div>


        <p className="text-mist max-w-2xl">

          Train SignBridge to recognize the signs
          required for your demonstration. Your
          training data is stored locally on this device.

        </p>

      </div>



      {/* =================================================
          MAIN TRAINING AREA
          CAMERA + CONTROLS SIDE BY SIDE
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


          {/* Camera controls */}

          <div className="flex flex-wrap gap-3">

            <Button
              onClick={
                rec.camera.start
              }

              disabled={
                rec.camera.isActive
              }
            >
              Start Training Camera
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
                ? 'Resume'
                : 'Pause'}

            </Button>

          </div>

        </div>



        {/* =================================================
            RIGHT — TRAINING CONTROLS
            ================================================= */}

        <div className="space-y-4">


          {/* Current training status */}

          <Card className="p-5 space-y-4">


            <div>

              <p className="text-sm font-semibold text-mist">
                Training Status
              </p>


              <p className="text-2xl font-display font-bold mt-1">

                {rec.classifierReady
                  ? 'Model Ready'
                  : 'Training Required'}

              </p>

            </div>


            {/* Counters */}

            <div className="grid grid-cols-2 gap-3">


              <div className="rounded-xl bg-white/5 border border-white/10 p-4">

                <p className="text-xs text-mist">
                  Trained Signs
                </p>


                <p className="text-2xl font-bold mt-1">

                  {
                    rec.classifier
                      .trainedSigns()
                      .length
                  }

                </p>

              </div>


              <div className="rounded-xl bg-white/5 border border-white/10 p-4">

                <p className="text-xs text-mist">
                  Total Samples
                </p>


                <p className="text-2xl font-bold mt-1">

                  {
                    rec.classifier
                      .sampleCount()
                  }

                </p>

              </div>

            </div>


            {/* Live status */}

            <div className="rounded-xl bg-white/5 border border-white/10 p-4">

              <p className="text-xs text-mist">
                Camera status
              </p>


              <p className="text-sm font-semibold mt-1">

                {rec.camera.isActive
                  ? rec.handDetected
                    ? '🟢 Hand detected — ready'
                    : '🟡 Show your hand'
                  : '⚪ Camera not started'}

              </p>

            </div>

          </Card>



          {/* =================================================
              ACTUAL TRAINING PANEL
              ================================================= */}

          <TrainSignsPanel
            classifier={
              rec.classifier
            }

            cameraActive={
              rec.camera.isActive
            }

            handDetected={
              rec.handDetected
            }

            captureSample={
              rec.captureSample
            }
          />

        </div>

      </div>



      {/* =================================================
          EXHIBITION TIP
          ================================================= */}

      <Card className="p-5 bg-success/10 border-success/20">

        <div className="flex items-start gap-3">

          <span className="text-xl">
            💡
          </span>


          <div>

            <p className="font-semibold text-success">

              Recommended exhibition setup

            </p>


            <p className="text-sm text-mist mt-1">

              Train approximately 7–9 reliable signs
              for the live demonstration. You can add
              more signs later using the same training
              system.

            </p>

          </div>

        </div>

      </Card>



      {/* =================================================
          TRAINING DATA BACKUP
          ================================================= */}

      <Card className="p-6">


        <div className="flex items-center gap-3 mb-2">

          <span className="text-2xl">
            💾
          </span>


          <div>

            <h2 className="font-display text-xl font-semibold">

              Training Data Backup

            </h2>


            <p className="text-sm text-mist">

              Save or restore your trained signs.

            </p>

          </div>

        </div>



        <div className="flex flex-wrap gap-3 mt-5">


          {/* Export */}

          <Button
            onClick={
              handleExport
            }

            disabled={
              rec.classifier
                .sampleCount() === 0
            }
          >

            📤 Export Training Data

          </Button>



          {/* Import */}

          <Button
            variant="secondary"

            onClick={() =>
              fileInputRef.current?.click()
            }
          >

            📥 Import Training Data

          </Button>

        </div>



        {/* Hidden file input */}

        <input
          ref={
            fileInputRef
          }

          type="file"

          accept=".json,application/json"

          className="hidden"

          onChange={
            handleImport
          }
        />



        {backupMessage && (

          <p className="text-sm text-mist mt-4">

            {backupMessage}

          </p>

        )}



        <div className="mt-5 rounded-xl bg-white/5 border border-white/10 p-4">

          <p className="text-sm font-semibold">

            Keep your backup safe

          </p>


          <p className="text-xs text-mist mt-1">

            Export your training data after completing
            your exhibition training. Keep the JSON file
            on your computer or USB drive so the trained
            signs can be restored later.

          </p>

        </div>

      </Card>



      {/* =================================================
          HOW TRAINING WORKS
          ================================================= */}

      <Card className="p-6">

        <p className="text-lg font-display font-semibold">

          How training works

        </p>


        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-3 mt-4">


          <div className="rounded-xl bg-white/5 border border-white/10 p-4">

            <p className="text-lg">
              1️⃣
            </p>

            <p className="text-sm font-semibold mt-2">
              Select a sign
            </p>

            <p className="text-xs text-mist mt-1">
              Choose the sign you want to teach.
            </p>

          </div>


          <div className="rounded-xl bg-white/5 border border-white/10 p-4">

            <p className="text-lg">
              2️⃣
            </p>

            <p className="text-sm font-semibold mt-2">
              Start training
            </p>

            <p className="text-xs text-mist mt-1">
              Start Auto Training when your hand is visible.
            </p>

          </div>


          <div className="rounded-xl bg-white/5 border border-white/10 p-4">

            <p className="text-lg">
              3️⃣
            </p>

            <p className="text-sm font-semibold mt-2">
              Perform the gesture
            </p>

            <p className="text-xs text-mist mt-1">
              Perform the complete sign naturally.
            </p>

          </div>


          <div className="rounded-xl bg-white/5 border border-white/10 p-4">

            <p className="text-lg">
              4️⃣
            </p>

            <p className="text-sm font-semibold mt-2">
              AI learns
            </p>

            <p className="text-xs text-mist mt-1">
              Multiple frames are stored as training examples.
            </p>

          </div>


          <div className="rounded-xl bg-white/5 border border-white/10 p-4">

            <p className="text-lg">
              5️⃣
            </p>

            <p className="text-sm font-semibold mt-2">
              Test the sign
            </p>

            <p className="text-xs text-mist mt-1">
              Use Sign → Text to test recognition.
            </p>

          </div>


        </div>

      </Card>



      {/* =================================================
          DEVELOPER NOTE
          ================================================= */}

      <Card className="p-5 border-warn/20 bg-warn/5">

        <p className="font-semibold text-warn">

          ⚠ Training / Developer Area

        </p>


        <p className="text-sm text-mist mt-1">

          This section is intended for the project
          team. It should not be displayed during
          the normal judge-facing demonstration.

        </p>

      </Card>


    </div>
  );
}