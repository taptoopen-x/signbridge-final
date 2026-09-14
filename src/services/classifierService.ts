import type {
  Prediction,
  SignId,
  TrainingSample,
} from '../types';

import {
  euclideanDistance,
} from '../utils/landmarkFeatures';

import {
  loadTrainingSamples,
  saveTrainingSamples,
} from '../utils/storage';


/*
 * ---------------------------------------------------------
 * SETTINGS
 * ---------------------------------------------------------
 */

const K = 5;

const MIN_SAMPLES_TO_PREDICT = 3;

/*
 * Number of frames used to recognize a moving gesture.
 *
 * Example:
 * THANK YOU
 *
 * frame 1 → hand near face
 * frame 2 → starts moving
 * frame 3 → moving
 * ...
 * frame 8 → hand moved away
 */
export const SEQUENCE_LENGTH = 8;


/*
 * Minimum number of frames required for a
 * training session to be considered a gesture.
 */
const MIN_SEQUENCE_FRAMES = 4;


/*
 * Confidence settings.
 */
export const CONFIDENCE_THRESHOLD = 0.65;

const FRAME_DISTANCE_SCALE = 2.2;
const SEQUENCE_DISTANCE_SCALE = 2.8;


/*
 * ---------------------------------------------------------
 * HELPER TYPES
 * ---------------------------------------------------------
 */

interface TrainingSequence {
  signId: SignId;
  frames: number[][];
  capturedAt: number;
}


/*
 * ---------------------------------------------------------
 * CLASSIFIER
 * ---------------------------------------------------------
 */

export class SignClassifier {
  private samples: TrainingSample[] = [];

  constructor() {
    this.samples = loadTrainingSamples();
  }


  /*
   * Reload samples from localStorage.
   */
  reload() {
    this.samples = loadTrainingSamples();
  }


  /*
   * Add one training frame.
   *
   * sessionId + frameIndex are used by Auto Training
   * to group multiple frames into one gesture.
   */
  addSample(
    signId: SignId,
    features: number[],
    sessionId?: string,
    frameIndex?: number
  ) {
    if (!features.length) return;

    this.samples.push({
      signId,
      features,
      capturedAt: Date.now(),
      sessionId,
      frameIndex,
    });

    saveTrainingSamples(this.samples);
  }


  /*
   * Delete all samples belonging to one sign.
   */
  clearSign(signId: SignId) {
    this.samples = this.samples.filter(
      (s) => s.signId !== signId
    );

    saveTrainingSamples(this.samples);
  }


  /*
   * Delete every training sample.
   */
  clearAll() {
    this.samples = [];

    saveTrainingSamples(this.samples);
  }


  /*
   * Count samples.
   */
  sampleCount(signId?: SignId): number {
    if (!signId) {
      return this.samples.length;
    }

    return this.samples.filter(
      (s) => s.signId === signId
    ).length;
  }


  /*
   * Return signs which have training data.
   */
  trainedSigns(): SignId[] {
    return Array.from(
      new Set(
        this.samples.map((s) => s.signId)
      )
    );
  }


  /*
   * Check whether classifier has enough data.
   */
  isReady(): boolean {
    return (
      this.trainedSigns().length >= 1 &&
      this.samples.length >= MIN_SAMPLES_TO_PREDICT
    );
  }


  /*
   * -------------------------------------------------------
   * FRAME-BASED PREDICTION
   * -------------------------------------------------------
   *
   * Used for:
   * - static signs
   * - early recognition
   * - fallback when sequence is not ready
   */

  predict(features: number[]): Prediction {
    if (
      !features.length ||
      this.samples.length < MIN_SAMPLES_TO_PREDICT
    ) {
      return {
        signId: null,
        confidence: 0,
      };
    }


    /*
     * Ignore old samples whose feature length does not
     * match the current model.
     */
    const compatibleSamples =
      this.samples.filter(
        (s) =>
          s.features.length ===
          features.length
      );


    if (
      compatibleSamples.length <
      MIN_SAMPLES_TO_PREDICT
    ) {
      return {
        signId: null,
        confidence: 0,
      };
    }


    /*
     * Calculate distance from current frame
     * to every training frame.
     */
    const distances =
      compatibleSamples
        .map((s) => ({
          signId: s.signId,
          dist: euclideanDistance(
            features,
            s.features
          ),
        }))
        .sort(
          (a, b) =>
            a.dist - b.dist
        )
        .slice(
          0,
          Math.min(
            K,
            compatibleSamples.length
          )
        );


    /*
     * Count votes.
     */
    const votes: Record<
      string,
      {
        count: number;
        totalDist: number;
      }
    > = {};


    for (const d of distances) {
      if (!votes[d.signId]) {
        votes[d.signId] = {
          count: 0,
          totalDist: 0,
        };
      }

      votes[d.signId].count += 1;
      votes[d.signId].totalDist +=
        d.dist;
    }


    /*
     * Find best sign.
     */
    let bestSign: SignId | null = null;

    let bestCount = -1;

    let bestAvgDist = Infinity;


    for (
      const [signId, vote]
      of Object.entries(votes)
    ) {
      const avgDist =
        vote.totalDist /
        vote.count;


      if (
        vote.count > bestCount ||
        (
          vote.count === bestCount &&
          avgDist < bestAvgDist
        )
      ) {
        bestSign =
          signId as SignId;

        bestCount =
          vote.count;

        bestAvgDist =
          avgDist;
      }
    }


    /*
     * Convert distance into confidence.
     */
    const confidence =
      Math.max(
        0,
        Math.min(
          1,
          1 -
            bestAvgDist /
              FRAME_DISTANCE_SCALE
        )
      );


    return {
      signId: bestSign,
      confidence,
    };
  }


  /*
   * -------------------------------------------------------
   * BUILD TRAINING SEQUENCES
   * -------------------------------------------------------
   *
   * Auto Training stores:
   *
   * session A
   *   frame 0
   *   frame 1
   *   frame 2
   *   ...
   *
   * This function groups them back together.
   */

  private getTrainingSequences():
    TrainingSequence[] {

    const groups =
      new Map<
        string,
        TrainingSample[]
      >();


    for (const sample of this.samples) {

      /*
       * Samples without sessionId are manual
       * single-frame samples.
       *
       * They cannot form a moving sequence.
       */
      if (!sample.sessionId) {
        continue;
      }


      if (!groups.has(sample.sessionId)) {
        groups.set(
          sample.sessionId,
          []
        );
      }


      groups
        .get(sample.sessionId)!
        .push(sample);
    }


    const sequences:
      TrainingSequence[] = [];


    for (
      const [
        sessionId,
        samples
      ] of groups
    ) {

      if (
        samples.length <
        MIN_SEQUENCE_FRAMES
      ) {
        continue;
      }


      /*
       * Sort frames in the correct order.
       */
      samples.sort(
        (a, b) => {
          if (
            a.frameIndex !== undefined &&
            b.frameIndex !== undefined
          ) {
            return (
              a.frameIndex -
              b.frameIndex
            );
          }

          return (
            a.capturedAt -
            b.capturedAt
          );
        }
      );


      /*
       * All frames must have the same
       * feature size.
       */
      const featureLength =
        samples[0].features.length;


      const validSamples =
        samples.filter(
          (s) =>
            s.features.length ===
            featureLength
        );


      if (
        validSamples.length <
        MIN_SEQUENCE_FRAMES
      ) {
        continue;
      }


      sequences.push({
        signId:
          validSamples[0].signId,

        frames:
          validSamples.map(
            (s) => s.features
          ),

        capturedAt:
          validSamples[0].capturedAt,
      });
    }


    return sequences;
  }


  /*
   * -------------------------------------------------------
   * RESAMPLE SEQUENCE
   * -------------------------------------------------------
   *
   * Different recordings may contain different
   * numbers of frames.
   *
   * Example:
   *
   * Training = 12 frames
   * Current gesture = 8 frames
   *
   * We convert both to exactly 8 frames.
   */

  private resampleSequence(
    frames: number[][]
  ): number[][] {

    if (!frames.length) {
      return [];
    }


    if (
      frames.length ===
      SEQUENCE_LENGTH
    ) {
      return frames;
    }


    const result:
      number[][] = [];


    for (
      let i = 0;
      i < SEQUENCE_LENGTH;
      i++
    ) {

      const position =
        (
          i /
          (SEQUENCE_LENGTH - 1)
        ) *
        (frames.length - 1);


      const left =
        Math.floor(position);

      const right =
        Math.ceil(position);


      if (left === right) {
        result.push(
          frames[left]
        );

        continue;
      }


      const ratio =
        position - left;


      const a =
        frames[left];

      const b =
        frames[right];


      if (
        a.length !==
        b.length
      ) {
        result.push(a);
        continue;
      }


      const interpolated =
        a.map(
          (value, index) =>
            value +
            (
              b[index] -
              value
            ) *
              ratio
        );


      result.push(
        interpolated
      );
    }


    return result;
  }


  /*
   * -------------------------------------------------------
   * SEQUENCE DISTANCE
   * -------------------------------------------------------
   *
   * Compare frame 1 with frame 1,
   * frame 2 with frame 2,
   * etc.
   *
   * This means movement direction and shape
   * both influence recognition.
   */

  private sequenceDistance(
    current: number[][],
    training: number[][]
  ): number {

    if (
      current.length !==
      training.length
    ) {
      return Infinity;
    }


    let total = 0;

    let count = 0;


    for (
      let i = 0;
      i < current.length;
      i++
    ) {

      const a =
        current[i];

      const b =
        training[i];


      if (
        a.length !==
        b.length
      ) {
        return Infinity;
      }


      total +=
        euclideanDistance(
          a,
          b
        );

      count++;
    }


    if (!count) {
      return Infinity;
    }


    return (
      total / count
    );
  }


  /*
   * -------------------------------------------------------
   * SEQUENCE PREDICTION
   * -------------------------------------------------------
   *
   * Main method for moving gestures.
   */

  predictSequence(
    sequence: number[][]
  ): Prediction {

    if (
      sequence.length <
      SEQUENCE_LENGTH
    ) {
      return {
        signId: null,
        confidence: 0,
      };
    }


    const trainingSequences =
      this.getTrainingSequences();


    if (
      !trainingSequences.length
    ) {
      return {
        signId: null,
        confidence: 0,
      };
    }


    /*
     * Resample current gesture.
     */
    const current =
      this.resampleSequence(
        sequence
      );


    /*
     * Compare current gesture
     * against every recorded gesture.
     */
    const distances =
      trainingSequences
        .map((training) => {

          const frames =
            this.resampleSequence(
              training.frames
            );


          const dist =
            this.sequenceDistance(
              current,
              frames
            );


          return {
            signId:
              training.signId,

            dist,
          };
        })
        .filter(
          (x) =>
            Number.isFinite(
              x.dist
            )
        )
        .sort(
          (a, b) =>
            a.dist -
            b.dist
        )
        .slice(
          0,
          K
        );


    if (!distances.length) {
      return {
        signId: null,
        confidence: 0,
      };
    }


    /*
     * Vote between the closest gesture recordings.
     */
    const votes: Record<
      string,
      {
        count: number;
        totalDist: number;
      }
    > = {};


    for (
      const item of distances
    ) {

      if (
        !votes[item.signId]
      ) {
        votes[item.signId] = {
          count: 0,
          totalDist: 0,
        };
      }


      votes[item.signId]
        .count++;


      votes[item.signId]
        .totalDist +=
          item.dist;
    }


    let bestSign:
      SignId | null = null;

    let bestCount = -1;

    let bestDistance =
      Infinity;


    for (
      const [signId, vote]
      of Object.entries(votes)
    ) {

      const avgDistance =
        vote.totalDist /
        vote.count;


      if (
        vote.count >
          bestCount ||
        (
          vote.count ===
            bestCount &&
          avgDistance <
            bestDistance
        )
      ) {

        bestSign =
          signId as SignId;

        bestCount =
          vote.count;

        bestDistance =
          avgDistance;
      }
    }


    /*
     * Convert sequence distance
     * into confidence.
     */
    const confidence =
      Math.max(
        0,
        Math.min(
          1,
          1 -
            bestDistance /
              SEQUENCE_DISTANCE_SCALE
        )
      );


    return {
      signId: bestSign,
      confidence,
    };
  }
}


/*
 * ---------------------------------------------------------
 * TEMPORAL SMOOTHER
 * ---------------------------------------------------------
 *
 * Prevents one bad frame from immediately changing
 * the displayed result.
 */

export class TemporalSmoother {

  private window:
    Prediction[] = [];

  private readonly windowSize:
    number;

  private readonly requiredMajority:
    number;


  constructor(
    windowSize = 5,
    requiredMajority = 3
  ) {
    this.windowSize =
      windowSize;

    this.requiredMajority =
      requiredMajority;
  }


  push(
    prediction: Prediction
  ): Prediction {

    this.window.push(
      prediction
    );


    if (
      this.window.length >
      this.windowSize
    ) {
      this.window.shift();
    }


    const counts:
      Record<
        string,
        {
          count: number;
          confSum: number;
        }
      > = {};


    for (
      const p of this.window
    ) {

      if (
        !p.signId ||
        p.confidence <
          CONFIDENCE_THRESHOLD
      ) {
        continue;
      }


      if (
        !counts[p.signId]
      ) {
        counts[p.signId] = {
          count: 0,
          confSum: 0,
        };
      }


      counts[p.signId]
        .count++;


      counts[p.signId]
        .confSum +=
          p.confidence;
    }


    let winner:
      SignId | null = null;

    let winnerCount = 0;

    let winnerConf = 0;


    for (
      const [
        signId,
        vote
      ] of Object.entries(counts)
    ) {

      if (
        vote.count >
        winnerCount
      ) {

        winner =
          signId as SignId;

        winnerCount =
          vote.count;

        winnerConf =
          vote.confSum /
          vote.count;
      }
    }


    if (
      winner &&
      winnerCount >=
        this.requiredMajority
    ) {

      return {
        signId: winner,
        confidence:
          winnerConf,
      };
    }


    return {
      signId: null,
      confidence: 0,
    };
  }


  reset() {
    this.window = [];
  }
}