import type { LayoutProps } from './types';

export function TopStepperLayout({
  schema,
  flow,
  children,
  className,
}: LayoutProps): React.ReactNode {
  return (
    <div className={className} style={{ minHeight: '100vh', background: 'var(--ff-bg-page)' }}>
      <header
        style={{
          background: 'linear-gradient(135deg, var(--ff-primary), var(--ff-primary-dark))',
          color: '#fff',
          padding: '2rem 1rem',
          textAlign: 'center',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '1.75rem' }}>{schema.title}</h1>
        {schema.description ? (
          <p style={{ marginTop: '0.5rem', marginBottom: 0 }}>{schema.description}</p>
        ) : null}
      </header>

      <main style={{ maxWidth: '840px', margin: '0 auto', padding: '1.25rem 1rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span>
            Step {flow.currentStepIndex + 1} of {flow.visibleSteps.length}
          </span>
          <span>{flow.progress}% Complete</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={flow.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          style={{
            width: '100%',
            height: '8px',
            background: 'var(--ff-primary-light)',
            borderRadius: '9999px',
            overflow: 'hidden',
            marginBottom: '1rem',
          }}
        >
          <div
            style={{
              width: `${flow.progress}%`,
              height: '100%',
              background: 'var(--ff-primary)',
              transition: 'width 300ms ease',
            }}
          />
        </div>

        <div
          style={{
            background: 'var(--ff-bg-card)',
            border: '1px solid var(--ff-border)',
            borderRadius: 'var(--ff-radius-lg)',
            padding: '1.5rem',
          }}
        >
          <h2 style={{ marginTop: 0 }}>{flow.currentStep.heading ?? flow.currentStep.title}</h2>
          {flow.currentStep.description ? (
            <p style={{ marginTop: '0.5rem', color: 'var(--ff-text-muted)' }}>
              {flow.currentStep.description}
            </p>
          ) : null}

          {children}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={flow.previous}
              disabled={flow.isFirstStep}
              style={ghostButtonStyle}
            >
              {schema.layout.footer?.previousLabel ?? 'Previous'}
            </button>
            <button type="button" onClick={() => void flow.next()} style={primaryButtonStyle}>
              {flow.isLastStep
                ? (schema.layout.footer?.submitLabel ?? 'Submit Application')
                : (schema.layout.footer?.nextLabel ?? 'Next Step')}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

const primaryButtonStyle: React.CSSProperties = {
  background: 'var(--ff-primary)',
  color: '#fff',
  border: 'none',
  borderRadius: 'var(--ff-radius)',
  padding: '0.75rem 1.125rem',
  cursor: 'pointer',
};

const ghostButtonStyle: React.CSSProperties = {
  background: 'transparent',
  color: 'var(--ff-text)',
  border: '1px solid var(--ff-border)',
  borderRadius: 'var(--ff-radius)',
  padding: '0.75rem 1.125rem',
  cursor: 'pointer',
};
