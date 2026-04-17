import type { FormSchema } from '@formflow/core';

import { SectionFrame } from './SectionFrame';
import { LiveDemoClient } from './LiveDemoClient';

interface LiveDemoSectionProps {
  schema: FormSchema;
}

export function LiveDemoSection({ schema }: LiveDemoSectionProps): React.ReactNode {
  return (
    <SectionFrame
      id="live-demo"
      eyebrow="Live Demo"
      title="Interact with a production-like education loan journey"
      description="This is the same schema-driven renderer used in the standalone demo and embed mode."
    >
      <LiveDemoClient schema={schema} />
    </SectionFrame>
  );
}
