import Link from 'next/link';

import { getAnalyticsOverview } from '@/lib/analytics/submissionsStore';

export const dynamic = 'force-dynamic';

const WINDOW_OPTIONS = [
  { value: 'all', label: 'All time' },
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
] as const;

type SearchParamValue = string | string[] | undefined;

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

function formatKycDecision(decision: string): string {
  return decision.replace('-', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function getSingleSearchParam(value: SearchParamValue): string | undefined {
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }

  return undefined;
}

function toPercent(value: number, maxValue: number): number {
  if (maxValue <= 0) {
    return 0;
  }

  return Math.round((value / maxValue) * 100);
}

function buildAnalyticsHref(filters: {
  formId: string;
  source: string;
  window: string;
  kycDecision: string;
}): string {
  const params = new URLSearchParams();

  if (filters.formId !== 'all') {
    params.set('formId', filters.formId);
  }

  if (filters.source !== 'all') {
    params.set('source', filters.source);
  }

  if (filters.window !== 'all') {
    params.set('window', filters.window);
  }

  if (filters.kycDecision !== 'all') {
    params.set('kycDecision', filters.kycDecision);
  }

  const query = params.toString();
  return query.length > 0 ? `/analytics?${query}` : '/analytics';
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, SearchParamValue>>;
}): Promise<React.ReactNode> {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const overview = getAnalyticsOverview({
    formId: getSingleSearchParam(resolvedSearchParams?.formId),
    source: getSingleSearchParam(resolvedSearchParams?.source),
    window: getSingleSearchParam(resolvedSearchParams?.window),
    kycDecision: getSingleSearchParam(resolvedSearchParams?.kycDecision),
  });
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

      <section className="ff-analytics-filters" aria-label="Analytics filters">
        <div className="ff-analytics-filter-window-row">
          {WINDOW_OPTIONS.map((option) => (
            <Link
              key={option.value}
              href={buildAnalyticsHref({
                formId: overview.filters.formId,
                source: overview.filters.source,
                window: option.value,
                kycDecision: overview.filters.kycDecision,
              })}
              className={`ff-analytics-filter-chip ${
                overview.filters.window === option.value ? 'ff-analytics-filter-chip-active' : ''
              }`}
            >
              {option.label}
            </Link>
          ))}
        </div>

        <form method="get" className="ff-analytics-filter-form">
          <label className="ff-analytics-filter-field" htmlFor="analytics-form-filter">
            Form
            <select
              id="analytics-form-filter"
              name="formId"
              defaultValue={overview.filters.formId}
              className="ff-analytics-filter-select"
            >
              <option value="all">All forms</option>
              {overview.formCatalog.map((form) => (
                <option key={form.formId} value={form.formId}>
                  {form.title} ({form.formId})
                </option>
              ))}
            </select>
          </label>

          <label className="ff-analytics-filter-field" htmlFor="analytics-source-filter">
            Source
            <select
              id="analytics-source-filter"
              name="source"
              defaultValue={overview.filters.source}
              className="ff-analytics-filter-select"
            >
              <option value="all">All sources</option>
              {overview.sources.map((source) => (
                <option key={source.source} value={source.source}>
                  {formatSource(source.source)}
                </option>
              ))}
            </select>
          </label>

          <label className="ff-analytics-filter-field" htmlFor="analytics-kyc-filter">
            KYC Decision
            <select
              id="analytics-kyc-filter"
              name="kycDecision"
              defaultValue={overview.filters.kycDecision}
              className="ff-analytics-filter-select"
            >
              <option value="all">All KYC outcomes</option>
              {overview.kycDecisions.map((entry) => (
                <option key={entry.decision} value={entry.decision}>
                  {formatKycDecision(entry.decision)}
                </option>
              ))}
            </select>
          </label>

          <input type="hidden" name="window" value={overview.filters.window} />

          <button type="submit" className="ff-analytics-filter-submit">
            Apply filters
          </button>

          <Link href="/analytics" className="ff-analytics-filter-reset">
            Reset
          </Link>
        </form>
      </section>

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
                <div className="ff-analytics-source-content">
                  <div className="ff-analytics-source-row">
                    <span>{formatSource(metric.source)}</span>
                    <strong>{metric.count}</strong>
                  </div>
                  <div className="ff-analytics-meter" aria-hidden="true">
                    <span
                      className="ff-analytics-meter-fill"
                      style={{ width: `${toPercent(metric.count, overview.maxSourceCount)}%` }}
                    />
                  </div>
                </div>
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
                  <div className="ff-analytics-meter" aria-hidden="true">
                    <span
                      className="ff-analytics-meter-fill"
                      style={{ width: `${toPercent(form.count, overview.maxFormCount)}%` }}
                    />
                  </div>
                </div>
                <div className="ff-analytics-form-metrics">
                  <strong>{form.count}</strong>
                  <span>{formatTimestamp(form.lastSubmissionAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="ff-analytics-panel" aria-label="KYC decisions">
          <header className="ff-analytics-panel-header">
            <h2>KYC decisions</h2>
            <p>Distribution of verification outcomes for the active filters.</p>
          </header>
          <ul className="ff-analytics-source-list">
            {overview.kycDecisions.map((metric) => (
              <li key={metric.decision} className="ff-analytics-source-item">
                <div className="ff-analytics-source-content">
                  <div className="ff-analytics-source-row">
                    <span>{formatKycDecision(metric.decision)}</span>
                    <strong>{metric.count}</strong>
                  </div>
                  <div className="ff-analytics-meter" aria-hidden="true">
                    <span
                      className="ff-analytics-meter-fill"
                      style={{ width: `${toPercent(metric.count, overview.maxKycDecisionCount)}%` }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="ff-analytics-panel" aria-label="Recent submissions">
        <header className="ff-analytics-panel-header">
          <h2>Recent submissions</h2>
          <p>Most recent 10 payload events.</p>
        </header>

        {overview.recentSubmissions.length === 0 ? (
          <p className="ff-analytics-empty">
            No submissions yet. Submit a form to populate this table.
          </p>
        ) : (
          <div className="ff-analytics-table-wrap">
            <table className="ff-analytics-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Form</th>
                  <th>Source</th>
                  <th>KYC</th>
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
                    <td>{formatKycDecision(entry.kycDecision)}</td>
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
