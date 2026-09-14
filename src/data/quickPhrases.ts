import type { QuickPhrase } from '../types';

export const QUICK_PHRASES: QuickPhrase[] = [
  { id: 'need-help', label: 'I need help', icon: '🆘', text: 'I need help', signSequence: ['HELP'] },
  { id: 'need-water', label: 'I need water', icon: '💧', text: 'I need water', signSequence: ['WATER'] },
  { id: 'need-food', label: 'I need food', icon: '🍴', text: 'I need food', signSequence: ['FOOD'] },
  { id: 'need-doctor', label: 'I need a doctor', icon: '🏥', text: 'I need a doctor', signSequence: ['DOCTOR'] },
  { id: 'where-bathroom', label: 'Where is the bathroom?', icon: '🚻', text: 'Where is the bathroom?', signSequence: ['BATHROOM'] },
  { id: 'call-family', label: 'Please call my family', icon: '📞', text: 'Please call my family', signSequence: ['HELP'] },
  { id: 'yes', label: 'Yes', icon: '👍', text: 'Yes', signSequence: ['YES'] },
  { id: 'no', label: 'No', icon: '✋', text: 'No', signSequence: ['NO'] },
  { id: 'stop', label: 'Stop', icon: '🛑', text: 'Stop', signSequence: ['STOP'] },
  { id: 'come-here', label: 'Come here', icon: '👉', text: 'Come here', signSequence: ['COME'] },
  { id: 'thank-you', label: 'Thank you', icon: '🙏', text: 'Thank you', signSequence: ['THANK_YOU'] },
  { id: 'hello', label: 'Hello', icon: '👋', text: 'Hello', signSequence: ['HELLO'] },
  { id: 'good-morning', label: 'Good morning', icon: '🌅', text: 'Good morning', signSequence: ['GOOD_MORNING'] },
  { id: 'goodbye', label: 'Goodbye', icon: '👋', text: 'Goodbye', signSequence: ['GOODBYE'] },
];
