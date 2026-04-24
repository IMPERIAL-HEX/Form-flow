import Link from 'next/link';

export function HeroSection(): React.ReactNode {
  return (
    <section className="ff-home-hero">
      <p className="ff-eyebrow">Schema-driven Form Runtime</p>
      <h1>Multi-step application forms, defined as data.</h1>
      <p>
        FormFlow is a headless TypeScript engine and React SDK for any multi-step data-collection
        flow — intake forms, surveys, onboarding, applications, or anything else you define in JSON.
      </p>
      <div className="ff-home-actions">
        <Link href="#live-demo" className="ff-button ff-button-primary">
          See It Live
        </Link>
        <Link href="#delivery-status" className="ff-button ff-button-secondary">
          View Delivery Status
        </Link>
        <Link href="/demo" className="ff-button ff-button-secondary">
          Open Full Demo
        </Link>
        <Link href="/playground" className="ff-button ff-button-secondary">
          Open Playground
        </Link>
        <Link href="/builder" className="ff-button ff-button-secondary">
          Open Builder
        </Link>
      </div>
    </section>
  );
}
