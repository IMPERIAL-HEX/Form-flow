import { schemaPresets } from '@/lib/schemas/presetSchemas';

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
  return (
    <main id="home-main" className="ff-home">
      <HeroSection />
      <QuickLinksSection />
      <HowItWorksSection />
      <LiveDemoSection presets={schemaPresets} initialPresetId="contact-form" />
      <ValuePropsSection />
      <SdkUsageSection />
      <SchemaReferenceSection />
      <FaqSection />
      <DeliveryStatusSection />
    </main>
  );
}
