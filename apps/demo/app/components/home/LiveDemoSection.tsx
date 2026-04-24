import type { SchemaPreset } from '@/lib/schemas/presetSchemas';

import { LiveDemoClient } from './LiveDemoClient';
import { SectionFrame } from './SectionFrame';

interface LiveDemoSectionProps {
  presets: SchemaPreset[];
  initialPresetId: string;
}

export function LiveDemoSection({ presets, initialPresetId }: LiveDemoSectionProps): React.ReactNode {
  return (
    <SectionFrame
      id="live-demo"
      eyebrow="Live Demo"
      title="Try it with any example flow"
      description="Pick an example schema and interact with the same renderer used in the standalone demo and embed mode."
    >
      <LiveDemoClient presets={presets} initialPresetId={initialPresetId} />
    </SectionFrame>
  );
}
