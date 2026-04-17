import type { FormSchema } from '@formflow/core';

import schema from '@/schemas/education-loan.json';

import {
  DeliveryStatusSection,
  FaqSection,
  HeroSection,
  HowItWorksSection,
  LiveDemoSection,
  QuickLinksSection,
  SchemaReferenceSection,
  SdkUsageSection,
  ValuePropsSection,
} from './components/home';

export default function HomePage(): React.ReactNode {
  const demoSchema = schema as FormSchema;

  return (
    <main id="home-main" className="ff-home">
      <HeroSection />
      <QuickLinksSection />
      <HowItWorksSection />
      <LiveDemoSection schema={demoSchema} />
      <ValuePropsSection />
      <SdkUsageSection />
      <SchemaReferenceSection />
      <FaqSection />
      <DeliveryStatusSection />
    </main>
  );
}
