import { sdkUsageSnippets } from '@/lib/docs/content';

import { CodeBlock } from './CodeBlock';
import { FeatureCard } from './FeatureCard';
import { SectionFrame } from './SectionFrame';

export function SdkUsageSection(): React.ReactNode {
  return (
    <SectionFrame
      id="sdk-usage"
      eyebrow="SDK Usage"
      title="Use the renderer or go headless"
      description="The React package supports drop-in usage, custom component registries, and iframe embedding."
    >
      <div className="ff-feature-grid ff-feature-grid-2">
        <FeatureCard
          title="Basic Usage"
          description="Render a complete flow in one component call."
          content={<CodeBlock code={sdkUsageSnippets.basic} language="tsx" />}
        />
        <FeatureCard
          title="Headless Hook"
          description="Use useFormFlow when building custom shells around the engine state machine."
          content={<CodeBlock code={sdkUsageSnippets.headless} language="tsx" />}
        />
        <FeatureCard
          title="Custom Components"
          description="Override specific field renderers while keeping engine behavior unchanged."
          content={<CodeBlock code={sdkUsageSnippets.customComponents} language="tsx" />}
        />
        <FeatureCard
          title="Iframe Embed"
          description="Load isolated flows with theme/layout overrides and postMessage submission events."
          content={<CodeBlock code={sdkUsageSnippets.iframe} language="html" />}
        />
      </div>
    </SectionFrame>
  );
}
