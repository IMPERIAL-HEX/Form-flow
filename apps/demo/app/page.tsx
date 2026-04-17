import Link from 'next/link';

export default function HomePage(): React.ReactNode {
  return (
    <main className="ff-home">
      <section className="ff-home-hero">
        <p className="ff-eyebrow">FormFlow</p>
        <h1>Multi-step application forms, defined as data.</h1>
        <p>
          Schema-driven engine for lending, onboarding, and regulated financial workflows. Build
          once, render anywhere.
        </p>
        <div className="ff-home-actions">
          <Link href="/demo" className="ff-button ff-button-primary">
            Open Full Demo
          </Link>
          <Link href="/playground" className="ff-button ff-button-secondary">
            Open Playground
          </Link>
          <Link href="/embed/education-loan" className="ff-button ff-button-secondary">
            Open Embed View
          </Link>
        </div>
      </section>

      <section className="ff-home-grid">
        <article className="ff-home-card">
          <h2>Demo App</h2>
          <p>
            Run a production-like education loan application with conditional steps and runtime
            validation.
          </p>
          <Link href="/demo?layout=sidebar-left">Launch /demo</Link>
        </article>

        <article className="ff-home-card">
          <h2>Schema Playground</h2>
          <p>
            Edit JSON in real time, validate with the parser, and preview rendering side-by-side.
          </p>
          <Link href="/playground">Launch /playground</Link>
        </article>

        <article className="ff-home-card">
          <h2>Embeddable Renderer</h2>
          <p>Serve forms in an iframe and receive submission events through postMessage.</p>
          <Link href="/embed/education-loan?layout=centered&borderRadius=md">
            Launch /embed/[formId]
          </Link>
        </article>
      </section>

      <section className="ff-home-code">
        <h2>Quick Embed Snippet</h2>
        <pre>
          <code>{`<iframe\n  src="https://your-domain/embed/education-loan?primaryColor=%230d9488"\n  width="100%"\n  height="840"\n  style="border:0;"\n/>`}</code>
        </pre>
      </section>
    </main>
  );
}
