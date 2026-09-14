export type SignId =
  | 'HELLO'
  | 'THANK_YOU'
  | 'YES'
  | 'NO'
  | 'WATER'
  | 'FOOD'
  | 'HELP'
  | 'DOCTOR'
  | 'BATHROOM'
  | 'STOP'
  | 'COME'
  | 'GO'
  | 'GOOD_MORNING'
  | 'GOODBYE';

export interface SignEntry {
  id: SignId;
  displayName: string;
  gloss: string;
  emoji: string;
  meaning: string;
  video?: string;

  /** words that map to this sign when parsing free text */
  keywords: string[];
}

export interface QuickPhrase {
  id: string;
  label: string;
  icon: string;
  text: string;

  /** ordered sign ids used to visualize this phrase */
  signSequence: SignId[];
}

export interface LandmarkPoint {
  x: number;
  y: number;
  z: number;
}


/*
 * Training data for the local sign recognizer.
 *
 * Each sample represents one camera frame.
 *
 * Auto Training groups multiple frames together using:
 *   sessionId  → identifies one complete gesture recording
 *   frameIndex → position of the frame inside that gesture
 *
 * Example:
 *
 * sessionId = ABC123
 *
 * frame 0 → hand starts near face
 * frame 1 → hand begins moving
 * frame 2 → hand moves outward
 * frame 3 → hand moves outward
 * ...
 *
 * This allows moving signs such as THANK YOU
 * to be recognized as a short sequence instead
 * of only looking at one frame.
 */
export interface TrainingSample {
  signId: SignId;

  /*
   * Normalized hand landmark features.
   *
   * Current feature system:
   * 65 features per hand
   * 130 features for two hands
   */
  features: number[];

  /** Time when this sample was captured */
  capturedAt: number;

  /*
   * Identifies the Auto Training recording
   * this frame belongs to.
   */
  sessionId?: string;

  /*
   * Position of this frame inside the recording.
   *
   * Example:
   * 0 → first frame
   * 1 → second frame
   * 2 → third frame
   * ...
   */
  frameIndex?: number;
}


export interface Prediction {
  signId: SignId | null;
  confidence: number;
}


export type Speaker =
  | 'SIGN_USER'
  | 'HEARING_USER';


export interface ConversationEntry {
  id: string;
  speaker: Speaker;
  text: string;
  signSequence?: SignId[];
  timestamp: number;
}


export type AiStatus =
  | 'READY'
  | 'CAMERA_ACTIVE'
  | 'HAND_DETECTED'
  | 'PROCESSING'
  | 'ERROR'
  | 'IDLE';


export type CameraErrorKind =
  | 'PERMISSION_DENIED'
  | 'NO_CAMERA'
  | 'UNAVAILABLE'
  | 'UNSUPPORTED_BROWSER'
  | null;