import Link from 'next/link';

export function HeroSection(): React.ReactNode {
  return (
    <section className="ff-home-hero">
      <p className="ff-eyebrow">Schema-driven Form Runtime</p>
      <h1>Multi-step application forms, defined as data.</h1>
      <p>
        FormFlow ships a headless TypeScript engine and React SDK for lending flows, onboarding, and
        regulated financial journeys.
      </p>
      <div className="ff-home-actions">
        <Link href="#live-demo" className="ff-button ff-button-primary">
          See It Live
        </Link>
        <Link href="/demo" className="ff-button ff-button-secondary">
          Open Full Demo
        </Link>
        <Link href="/playground" className="ff-button ff-button-secondary">
          Open Playground
        </Link>
      </div>
    </section>
  );
}
