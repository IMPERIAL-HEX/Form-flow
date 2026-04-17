import { valueProps } from '@/lib/docs/content';

import { FeatureCard } from './FeatureCard';
import { SectionFrame } from './SectionFrame';

export function ValuePropsSection(): React.ReactNode {
  return (
    <SectionFrame
      id="value-props"
      eyebrow="Why FormFlow"
      title="Engineering choices optimized for real product delivery"
      description="The stack is intentionally designed for maintainability, predictability, and integration speed."
    >
      <div className="ff-feature-grid ff-feature-grid-2">
        {valueProps.map((item) => (
          <FeatureCard key={item.title} title={item.title} description={item.description} />
        ))}
      </div>
    </SectionFrame>
  );
}
