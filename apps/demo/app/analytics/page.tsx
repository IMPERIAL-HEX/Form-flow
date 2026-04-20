import Link from 'next/link';

import { getAnalyticsOverview } from '@/lib/analytics/submissionsStore';

export const dynamic = 'force-dynamic';

function formatTimestamp(value: string | null): string {
  if (!value) {
    return 'No submissions yet';
  }

  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatSource(source: string): string {
  return source.replace('-', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function AnalyticsPage(): React.ReactNode {
  const overview = getAnalyticsOverview();
  const activeForms = overview.forms.filter((form) => form.count > 0).length;

  return (
    <main className="ff-analytics-page">
      <header className="ff-analytics-header">
        <p className="ff-eyebrow">Analytics Dashboard</p>
        <h1>Live submission telemetry for demo forms</h1>
        <p>
          This dashboard is fed by <code>/api/submissions</code> and updates as users submit from
          demo, embed, and playground surfaces.
        </p>
        <div className="ff-analytics-actions">
          <Link href="/demo" className="ff-button ff-button-primary">
            Open Demo Flow
          </Link>
          <Link href="/embed/education-loan" className="ff-button ff-button-secondary">
            Open Embed Flow
          </Link>
          <Link href="/playground" className="ff-button ff-button-secondary">
            Open Playground
          </Link>
        </div>
      </header>

      <section className="ff-analytics-kpi-grid" aria-label="Analytics overview">
        <article className="ff-analytics-kpi-card">
          <p>Total submissions</p>
          <strong>{overview.totalSubmissions}</strong>
        </article>
        <article className="ff-analytics-kpi-card">
          <p>Active forms</p>
          <strong>{activeForms}</strong>
        </article>
        <article className="ff-analytics-kpi-card">
          <p>Last submission</p>
          <strong>{formatTimestamp(overview.lastSubmissionAt)}</strong>
        </article>
        <article className="ff-analytics-kpi-card">
          <p>Snapshot generated</p>
          <strong>{formatTimestamp(overview.generatedAt)}</strong>
        </article>
      </section>

      <section className="ff-analytics-grid">
        <article className="ff-analytics-panel" aria-label="Submissions by source">
          <header className="ff-analytics-panel-header">
            <h2>Submissions by source</h2>
            <p>Tracks where each payload originated.</p>
          </header>
          <ul className="ff-analytics-source-list">
            {overview.sources.map((metric) => (
              <li key={metric.source} className="ff-analytics-source-item">
                <span>{formatSource(metric.source)}</span>
                <strong>{metric.count}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="ff-analytics-panel" aria-label="Submissions by form">
          <header className="ff-analytics-panel-header">
            <h2>Submissions by form</h2>
            <p>Preset schemas plus any custom IDs seen in payloads.</p>
          </header>
          <div className="ff-analytics-form-list">
            {overview.forms.map((form) => (
              <div key={form.formId} className="ff-analytics-form-row">
                <div>
                  <p className="ff-analytics-form-title">{form.title}</p>
                  <p className="ff-analytics-form-id">{form.formId}</p>
                </div>
                <div className="ff-analytics-form-metrics">
                  <strong>{form.count}</strong>
                  <span>{formatTimestamp(form.lastSubmissionAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="ff-analytics-panel" aria-label="Recent submissions">
        <header className="ff-analytics-panel-header">
          <h2>Recent submissions</h2>
          <p>Most recent 10 payload events.</p>
        </header>

        {overview.recentSubmissions.length === 0 ? (
          <p className="ff-analytics-empty">No submissions yet. Submit a form to populate this table.</p>
        ) : (
          <div className="ff-analytics-table-wrap">
            <table className="ff-analytics-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Form</th>
                  <th>Source</th>
                  <th>Fields</th>
                  <th>Bytes</th>
                </tr>
              </thead>
              <tbody>
                {overview.recentSubmissions.map((entry) => (
                  <tr key={entry.id}>
                    <td>{formatTimestamp(entry.receivedAt)}</td>
                    <td>{entry.formId}</td>
                    <td>{formatSource(entry.source)}</td>
                    <td>{entry.payloadFieldCount}</td>
                    <td>{entry.payloadBytes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
