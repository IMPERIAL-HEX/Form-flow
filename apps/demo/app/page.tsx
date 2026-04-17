import Link from 'next/link';

export default function HomePage(): React.ReactNode {
  return (
    <main style={{ maxWidth: '960px', margin: '0 auto', padding: '3rem 1rem' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
        Multi-step application forms, defined as data.
      </h1>
      <p style={{ color: '#4b5563', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
        FormFlow is a schema-driven form engine for lending and financial onboarding.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Link href="/demo" style={primaryLinkStyle}>
          See Demo
        </Link>
      </div>
    </main>
  );
}

const primaryLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '2.75rem',
  padding: '0 1rem',
  borderRadius: '0.5rem',
  textDecoration: 'none',
  background: '#0d9488',
  color: '#ffffff',
  fontWeight: 600,
};
