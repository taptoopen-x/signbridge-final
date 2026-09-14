import type { SignEntry, SignId } from '../types';

/**
 * SIGN DICTIONARY
 * ----------------
 * Single source of truth for the supported ISL vocabulary.
 * To add a new sign:
 *   1. Add an entry below with a unique id.
 *   2. Drop a verified demo clip at public/signs/<id-lowercase>.mp4
 *      (optional — a placeholder card is shown automatically if missing).
 *   3. Train the live classifier for it from the "Train / Manage Signs"
 *      panel inside Sign → Text (captures live webcam samples).
 *   4. It will automatically appear in Learn ISL, Test A Sign, and
 *      Text → Sign matching.
 */
export const SIGN_DICTIONARY: Record<SignId, SignEntry> = {
  HELLO: {
    id: 'HELLO', displayName: 'Hello', gloss: 'HELLO', emoji: '👋',
    meaning: 'A friendly greeting.', video: '/signs/hello.mp4',
    keywords: ['hello', 'hi', 'hey'],
  },
  THANK_YOU: {
    id: 'THANK_YOU', displayName: 'Thank You', gloss: 'THANK-YOU', emoji: '🙏',
    meaning: 'Expressing gratitude.', video: '/signs/thankyou.mp4',
    keywords: ['thank', 'thanks', 'thankyou'],
  },
  YES: {
    id: 'YES', displayName: 'Yes', gloss: 'YES', emoji: '👍',
    meaning: 'Affirmative response.', video: '/signs/yes.mp4',
    keywords: ['yes', 'yeah', 'yep'],
  },
  NO: {
    id: 'NO', displayName: 'No', gloss: 'NO', emoji: '✋',
    meaning: 'Negative response.', video: '/signs/no.mp4',
    keywords: ['no', 'nope', 'not'],
  },
  WATER: {
    id: 'WATER', displayName: 'Water', gloss: 'WATER', emoji: '💧',
    meaning: 'Drinking water.', video: '/signs/water.mp4',
    keywords: ['water', 'thirsty', 'drink'],
  },
  FOOD: {
    id: 'FOOD', displayName: 'Food', gloss: 'FOOD', emoji: '🍴',
    meaning: 'Something to eat.', video: '/signs/food.mp4',
    keywords: ['food', 'eat', 'hungry', 'meal'],
  },
  HELP: {
    id: 'HELP', displayName: 'Help', gloss: 'HELP', emoji: '🆘',
    meaning: 'Requesting assistance.', video: '/signs/help.mp4',
    keywords: ['help', 'assist', 'assistance'],
  },
  DOCTOR: {
    id: 'DOCTOR', displayName: 'Doctor', gloss: 'DOCTOR', emoji: '🏥',
    meaning: 'A medical professional.', video: '/signs/doctor.mp4',
    keywords: ['doctor', 'medic', 'physician'],
  },
  BATHROOM: {
    id: 'BATHROOM', displayName: 'Bathroom', gloss: 'BATHROOM', emoji: '🚻',
    meaning: 'The restroom / washroom.', video: '/signs/bathroom.mp4',
    keywords: ['bathroom', 'toilet', 'restroom', 'washroom'],
  },
  STOP: {
    id: 'STOP', displayName: 'Stop', gloss: 'STOP', emoji: '🛑',
    meaning: 'Halt an action.', video: '/signs/stop.mp4',
    keywords: ['stop', 'halt', 'wait'],
  },
  COME: {
    id: 'COME', displayName: 'Come', gloss: 'COME', emoji: '👉',
    meaning: 'Come here / approach.', video: '/signs/come.mp4',
    keywords: ['come', 'here'],
  },
  GO: {
    id: 'GO', displayName: 'Go', gloss: 'GO', emoji: '🚶',
    meaning: 'Go / leave / move.', video: '/signs/go.mp4',
    keywords: ['go', 'leave', 'move'],
  },
  GOOD_MORNING: {
    id: 'GOOD_MORNING', displayName: 'Good Morning', gloss: 'GOOD-MORNING', emoji: '🌅',
    meaning: 'Morning greeting.', video: '/signs/goodmorning.mp4',
    keywords: ['morning', 'goodmorning'],
  },
  GOODBYE: {
    id: 'GOODBYE', displayName: 'Goodbye', gloss: 'GOODBYE', emoji: '👋',
    meaning: 'Farewell greeting.', video: '/signs/goodbye.mp4',
    keywords: ['goodbye', 'bye', 'farewell'],
  },
};

export const SIGN_LIST: SignEntry[] = Object.values(SIGN_DICTIONARY);

/** Words treated as "connective" — matched but rendered as text, not a sign lookup miss. */
export const CONNECTIVE_WORDS = new Set(['i', 'am', 'is', 'are', 'a', 'the', 'to', 'need', 'my']);

export function findSignForWord(word: string): SignEntry | null {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return null;
  return SIGN_LIST.find((s) => s.keywords.includes(w)) ?? null;
}
