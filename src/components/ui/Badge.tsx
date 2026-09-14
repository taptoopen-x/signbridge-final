interface BadgeProps {
  tone: 'success' | 'warn' | 'error' | 'idle';
  children: React.ReactNode;
}

const dot: Record<string, string> = {
  success: 'bg-success',
  warn: 'bg-warn',
  error: 'bg-coral-500',
  idle: 'bg-mist/50',
};

const text: Record<string, string> = {
  success: 'text-success',
  warn: 'text-warn',
  error: 'text-coral-400',
  idle: 'text-mist',
};

export default function Badge({ tone, children }: BadgeProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-semibold">
      <span className={`h-2 w-2 rounded-full ${dot[tone]} ${tone !== 'idle' ? 'animate-pulseDot' : ''}`} />
      <span className={text[tone]}>{children}</span>
    </span>
  );
}
