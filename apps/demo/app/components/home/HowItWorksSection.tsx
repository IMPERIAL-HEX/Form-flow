import { howItWorksItems } from '@/lib/docs/content';

import { CodeBlock } from './CodeBlock';
import { FeatureCard } from './FeatureCard';
import { SectionFrame } from './SectionFrame';

export function HowItWorksSection(): React.ReactNode {
  return (
    <SectionFrame
      id="how-it-works"
      eyebrow="How It Works"
      title="Define, render, and submit in three steps"
      description="Use a single schema format across your hosted demo, playground, and embedded runtime."
    >
      <div className="ff-feature-grid ff-feature-grid-3">
        {howItWorksItems.map((item) => (
          <FeatureCard
            key={item.title}
            title={item.title}
            description={item.description}
            content={<CodeBlock code={item.code} />}
          />
        ))}
      </div>
    </SectionFrame>
  );
}
