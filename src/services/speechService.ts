export const isSpeechSynthesisSupported = (): boolean =>
  typeof window !== 'undefined' && 'speechSynthesis' in window;

export function speak(text: string, opts?: { rate?: number; pitch?: number }): void {
  if (!isSpeechSynthesisSupported() || !text.trim()) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = opts?.rate ?? 0.95;
  utterance.pitch = opts?.pitch ?? 1;
  utterance.lang = 'en-IN';
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) window.speechSynthesis.cancel();
}
