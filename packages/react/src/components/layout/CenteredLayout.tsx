import type { LayoutProps } from './types';

export function CenteredLayout({
  schema,
  flow,
  children,
  className,
}: LayoutProps): React.ReactNode {
  return (
    <div
      className={className}
      style={{ minHeight: '100vh', background: 'var(--ff-bg-page)', padding: '1.5rem' }}
    >
      <div
        style={{
          maxWidth: '640px',
          margin: '0 auto',
          background: 'var(--ff-bg-card)',
          border: '1px solid var(--ff-border)',
          borderRadius: 'var(--ff-radius-lg)',
          padding: '1.5rem',
        }}
      >
        <h1 style={{ marginTop: 0 }}>{flow.currentStep.heading ?? flow.currentStep.title}</h1>
        {flow.currentStep.description ? (
          <p style={{ color: 'var(--ff-text-muted)' }}>{flow.currentStep.description}</p>
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
