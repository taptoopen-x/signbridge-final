type ResultCallback = (transcript: string, isFinal: boolean) => void;
type ErrorCallback = (message: string) => void;

export const isSpeechRecognitionSupported = (): boolean =>
  typeof window !== 'undefined' &&
  Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

export class SpeechRecognitionService {
  private recognition: any = null;
  private active = false;

  start(onResult: ResultCallback, onError: ErrorCallback, onEnd?: () => void) {
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      onError('Speech recognition is not supported in this browser. Please use text input instead.');
      return;
    }
    try {
      this.recognition = new SpeechRecognitionCtor();
      this.recognition.lang = 'en-IN';
      this.recognition.continuous = false;
      this.recognition.interimResults = true;

      this.recognition.onresult = (event: any) => {
        let transcript = '';
        let isFinal = false;
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
          if (event.results[i].isFinal) isFinal = true;
        }
        onResult(transcript, isFinal);
      };
      this.recognition.onerror = (event: any) => {
        onError(`Microphone error: ${event.error}. You can still type your message.`);
        this.active = false;
      };
      this.recognition.onend = () => {
        this.active = false;
        onEnd?.();
      };
      this.recognition.start();
      this.active = true;
    } catch {
      onError('Could not access the microphone. Please check permissions.');
    }
  }

  stop() {
    if (this.recognition && this.active) this.recognition.stop();
  }

  isActive() {
    return this.active;
  }
}
