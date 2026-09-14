import { findSignForWord } from '../data/signDictionary';
import type { SignId } from '../types';

export interface ParsedWord {
  raw: string;
  signId: SignId | null;
}

export function parseTextToSigns(text: string): ParsedWord[] {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((raw) => ({ raw, signId: findSignForWord(raw)?.id ?? null }));
}
