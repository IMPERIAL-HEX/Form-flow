import type { FormSchema } from '@formflow/core';

import schema from '@/schemas/education-loan.json';

import {
  DeliveryStatusSection,
  HeroSection,
  HowItWorksSection,
  LiveDemoSection,
  SchemaReferenceSection,
  SdkUsageSection,
} from './components/home';

export default function HomePage(): React.ReactNode {
  const demoSchema = schema as FormSchema;

  return (
    <main id="home-main" className="ff-home">
      <HeroSection />
      <HowItWorksSection />
      <LiveDemoSection schema={demoSchema} />
      <SdkUsageSection />
      <SchemaReferenceSection />
      <DeliveryStatusSection />
    </main>
  );
}
