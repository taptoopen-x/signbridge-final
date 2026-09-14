import type {
  TrainingSample,
  ConversationEntry,
} from '../types';

const KEYS = {
  TRAINING: 'signbridge_training_samples_v1',
  CONVERSATION: 'signbridge_conversation_v1',
};

/*
 * =========================================================
 * TRAINING DATA
 * =========================================================
 */

export function loadTrainingSamples(): TrainingSample[] {
  try {
    const raw =
      localStorage.getItem(KEYS.TRAINING);

    return raw
      ? (JSON.parse(raw) as TrainingSample[])
      : [];
  } catch {
    return [];
  }
}

export function saveTrainingSamples(
  samples: TrainingSample[]
): void {
  try {
    localStorage.setItem(
      KEYS.TRAINING,
      JSON.stringify(samples)
    );
  } catch {
    /*
     * Storage unavailable or full.
     */
  }
}


/*
 * =========================================================
 * EXPORT TRAINING DATA
 * =========================================================
 */

export function exportTrainingData(): void {
  const samples =
    loadTrainingSamples();

  if (samples.length === 0) {
    throw new Error(
      'There is no training data to export yet.'
    );
  }

  const backup = {
    app: 'SignBridge',
    type: 'training-data',
    version: 1,
    exportedAt:
      new Date().toISOString(),
    sampleCount:
      samples.length,
    samples,
  };

  const json =
    JSON.stringify(
      backup,
      null,
      2
    );

  const blob =
    new Blob(
      [json],
      {
        type: 'application/json',
      }
    );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement('a');

  link.href = url;

  link.download =
    `signbridge-training-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}


/*
 * =========================================================
 * IMPORT TRAINING DATA
 * =========================================================
 */

export async function importTrainingData(
  file: File
): Promise<TrainingSample[]> {

  const text =
    await file.text();

  let data: any;

  try {
    data =
      JSON.parse(text);
  } catch {
    throw new Error(
      'The selected file is not valid JSON.'
    );
  }

  /*
   * Accept both:
   *
   * 1. SignBridge backup files
   * 2. A plain TrainingSample[] file
   */
  const samples =
    Array.isArray(data)
      ? data
      : data?.samples;

  if (!Array.isArray(samples)) {
    throw new Error(
      'This is not a valid SignBridge training file.'
    );
  }

  /*
   * Basic validation.
   */
  const validSamples =
    samples.filter(
      (sample: any) =>
        sample &&
        typeof sample.signId === 'string' &&
        Array.isArray(sample.features) &&
        sample.features.length > 0
    ) as TrainingSample[];

  if (validSamples.length === 0) {
    throw new Error(
      'No valid training samples were found in this file.'
    );
  }

  return validSamples;
}


/*
 * Save imported samples into local storage.
 */
export function saveImportedTrainingData(
  samples: TrainingSample[]
): void {
  saveTrainingSamples(
    samples
  );
}


/*
 * =========================================================
 * CONVERSATION DATA
 * =========================================================
 */

export function loadConversation(): ConversationEntry[] {
  try {
    const raw =
      localStorage.getItem(
        KEYS.CONVERSATION
      );

    return raw
      ? (JSON.parse(raw) as ConversationEntry[])
      : [];
  } catch {
    return [];
  }
}

export function saveConversation(
  entries: ConversationEntry[]
): void {
  try {
    localStorage.setItem(
      KEYS.CONVERSATION,
      JSON.stringify(entries)
    );
  } catch {
    /* Ignore storage errors */
  }
}