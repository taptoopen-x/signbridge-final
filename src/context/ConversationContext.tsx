import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { ConversationEntry, Speaker, SignId } from '../types';
import { loadConversation, saveConversation } from '../utils/storage';

interface ConversationContextValue {
  entries: ConversationEntry[];
  addEntry: (speaker: Speaker, text: string, signSequence?: SignId[]) => void;
  clear: () => void;
}

const ConversationContext = createContext<ConversationContextValue | null>(null);

export function ConversationProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<ConversationEntry[]>([]);

  useEffect(() => {
    setEntries(loadConversation());
  }, []);

  const addEntry: ConversationContextValue['addEntry'] = (speaker, text, signSequence) => {
    setEntries((prev) => {
      const next = [
        ...prev,
        { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, speaker, text, signSequence, timestamp: Date.now() },
      ];
      saveConversation(next);
      return next;
    });
  };

  const clear = () => {
    setEntries([]);
    saveConversation([]);
  };

  return (
    <ConversationContext.Provider value={{ entries, addEntry, clear }}>
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversation() {
  const ctx = useContext(ConversationContext);
  if (!ctx) throw new Error('useConversation must be used within ConversationProvider');
  return ctx;
}
