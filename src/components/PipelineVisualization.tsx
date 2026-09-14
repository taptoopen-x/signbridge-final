const SIGN_TO_SPEECH = ['Camera', 'Hand Detection', 'Hand Landmarks', 'Feature Extraction', 'ML Classification', 'ISL Sign', 'Text', 'Speech'];
const TEXT_TO_SIGN = ['Voice / Text', 'Text Processing', 'ISL Sign Mapping', 'Sign Visualization'];

function PipelineColumn({ title, steps, reverse = false }: { title: string; steps: string[]; reverse?: boolean }) {
  return (
    <div className="glass rounded-2xl p-6">
      <p className="text-sm font-semibold text-signal-400 mb-5">{title}</p>
      <div className="flex flex-col">
        {steps.map((step, i) => (
          <div key={step} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <span className="h-8 w-8 rounded-full bg-white/5 border border-white/15 flex items-center justify-center text-xs font-semibold text-mist">
                {i + 1}
              </span>
              {i < steps.length - 1 && <span className="w-px flex-1 min-h-[24px] bg-white/15" />}
            </div>
            <p className={`pt-1 pb-5 font-medium ${i === steps.length - 1 ? 'text-signal-400' : 'text-white'}`}>
              {step}
            </p>
          </div>
        ))}
      </div>
      {reverse && null}
    </div>
  );
}

export default function PipelineVisualization() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <PipelineColumn title="Sign → Speech" steps={SIGN_TO_SPEECH} />
      <PipelineColumn title="Voice / Text → Sign" steps={TEXT_TO_SIGN} reverse />
    </div>
  );
}
