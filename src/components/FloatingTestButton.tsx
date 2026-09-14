interface FloatingTestButtonProps {
  onClick: () => void;
}

export default function FloatingTestButton({ onClick }: FloatingTestButtonProps) {
  return (
    <button
      onClick={onClick}
      className="focus-ring fixed z-30 bottom-6 right-5 md:bottom-8 md:right-8 flex items-center gap-2
        rounded-full bg-coral-500 hover:bg-coral-400 text-white font-semibold pl-4 pr-5 py-3.5
        shadow-[0_10px_40px_rgba(255,107,93,0.35)] transition-transform hover:scale-105 active:scale-95"
      aria-label="Open Test A Sign"
    >
      <span className="text-xl">🎯</span>
      <span className="hidden sm:inline text-sm">Test A Sign</span>
    </button>
  );
}
