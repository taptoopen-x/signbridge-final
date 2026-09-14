import type { LandmarkPoint } from '../types';

const HAND_FEATURES = 65;

function oneHandToFeatures(
  landmarks: LandmarkPoint[]
): number[] {
  if (!landmarks || landmarks.length < 21) {
    return Array(HAND_FEATURES).fill(0);
  }

  const wrist = landmarks[0];
  const ref = landmarks[9];

  const scale =
    Math.hypot(
      ref.x - wrist.x,
      ref.y - wrist.y,
      ref.z - wrist.z
    ) || 1e-6;

  const features: number[] = [];

  // Hand shape
  for (const p of landmarks) {
    features.push(
      (p.x - wrist.x) / scale,
      (p.y - wrist.y) / scale,
      (p.z - wrist.z) / scale
    );
  }

  // Keep wrist position so moving gestures
  // such as THANK YOU can be recognized.
  features.push(
    wrist.x,
    wrist.y
  );

  return features;
}

export function landmarksToFeatures(
  landmarks: LandmarkPoint[]
): number[] {
  if (!landmarks || landmarks.length < 21) {
    return [];
  }

  // First hand
  const hand1 = oneHandToFeatures(
    landmarks.slice(0, 21)
  );

  // Second hand
  let hand2: number[];

  if (landmarks.length >= 42) {
    hand2 = oneHandToFeatures(
      landmarks.slice(21, 42)
    );
  } else {
    hand2 = Array(HAND_FEATURES).fill(0);
  }

  // 65 + 65 = 130 features
  return [
    ...hand1,
    ...hand2
  ];
}

export function euclideanDistance(
  a: number[],
  b: number[]
): number {
  // Never compare different feature formats.
  if (a.length !== b.length) {
    return Infinity;
  }

  let sum = 0;

  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }

  return Math.sqrt(sum);
}