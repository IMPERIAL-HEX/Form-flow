import type { LayoutProps } from './types';

export function SidebarLayout({ schema, flow, children, className }: LayoutProps): React.ReactNode {
  return (
    <div
      className={className}
      style={{
        minHeight: '100vh',
        background: 'var(--ff-bg-page)',
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
      }}
    >
      <aside
        style={{
          borderRight: '1px solid var(--ff-border)',
          background: 'var(--ff-bg-card)',
          padding: '1.25rem',
        }}
      >
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Progress</div>
          <div
            style={{
              width: '100%',
              height: '8px',
              background: 'var(--ff-primary-light)',
              borderRadius: '9999px',
            }}
          >
            <div
              style={{
                width: `${flow.progress}%`,
                height: '100%',
                borderRadius: '9999px',
                background: 'var(--ff-primary)',
              }}
            />
          </div>
          <div style={{ marginTop: '0.5rem', color: 'var(--ff-text-muted)', fontSize: '0.875rem' }}>
            Step {flow.currentStepIndex + 1} of {flow.visibleSteps.length}
          </div>
        </div>

        <nav>
          {flow.visibleSteps.map((step, index) => {
            const isActive = step.id === flow.currentStep.id;
            const isCompleted = index < flow.currentStepIndex;
            const isVisited = index <= flow.currentStepIndex;

            return (
              <button
                key={step.id}
                type="button"
                aria-current={isActive ? 'step' : undefined}
                onClick={() => {
                  if (isVisited) {
                    flow.goToStep(step.id);
                  }
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.75rem',
                  borderRadius: 'var(--ff-radius)',
                  border: `1px solid ${isActive ? 'var(--ff-primary)' : 'var(--ff-border)'}`,
                  background: isActive ? 'var(--ff-primary-light)' : 'transparent',
                  marginBottom: '0.5rem',
                  cursor: isVisited ? 'pointer' : 'not-allowed',
                  opacity: isVisited || isActive ? 1 : 0.65,
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--ff-text-muted)' }}>
                  Step {index + 1}
                </div>
                <div style={{ fontWeight: 600 }}>{step.title}</div>
                {isCompleted ? <div>Complete</div> : null}
              </button>
            );
          })}
        </nav>
      </aside>

      <main style={{ padding: '1.5rem' }}>
        <div
          style={{
            background: 'var(--ff-bg-card)',
            border: '1px solid var(--ff-border)',
            borderRadius: 'var(--ff-radius-lg)',
            padding: '1.5rem',
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: '0.5rem', color: 'var(--ff-text-muted)' }}>
            {flow.currentStep.title}
          </h2>
          <h1 style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            {flow.currentStep.heading ?? flow.currentStep.title}
          </h1>
          {flow.currentStep.description ? (
            <p style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--ff-text-muted)' }}>
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
                : (schema.layout.footer?.nextLabel ?? 'Continue')}
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
