import type { FormSchema } from '@formflow/core';

import schema from '@/schemas/education-loan.json';

import {
  HeroSection,
  HowItWorksSection,
  LiveDemoSection,
  SchemaReferenceSection,
  SdkUsageSection,
} from './components/home';

export default function HomePage(): React.ReactNode {
  const demoSchema = schema as FormSchema;

  return (
    <main className="ff-home">
      <HeroSection />
      <HowItWorksSection />
      <LiveDemoSection schema={demoSchema} />
      <SdkUsageSection />
      <SchemaReferenceSection />
    </main>
  );
}
