import { useEffect } from 'react';
import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base-950/80 backdrop-blur-sm animate-rise"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div
        className="glass-strong w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin rounded-3xl p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <h2 id="modal-title" className="text-xl md:text-2xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="focus-ring rounded-full h-9 w-9 flex items-center justify-center bg-white/5 hover:bg-white/10 text-mist hover:text-white text-lg"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
