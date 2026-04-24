'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

import { createBlankSchema } from '@/lib/builder/schemaMutations';
import type { SchemaSummary } from '@/lib/builder/schemaStore';

interface BuilderListClientProps {
  initialSummaries: SchemaSummary[];
}

export function BuilderListClient({ initialSummaries }: BuilderListClientProps): React.ReactNode {
  const router = useRouter();
  const [summaries, setSummaries] = useState<SchemaSummary[]>(initialSummaries);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = useCallback(async (): Promise<void> => {
    setError(null);
    setPendingId('__new');
    try {
      const response = await fetch('/api/builder-schemas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createBlankSchema()),
      });
      if (!response.ok) {
        setError('Could not create form. Please try again.');
        return;
      }
      const body = (await response.json()) as { stored: { id: string } };
      router.push(`/builder/${body.stored.id}`);
    } catch {
      setError('Could not create form. Please try again.');
    } finally {
      setPendingId(null);
    }
  }, [router]);

  const handleDelete = useCallback(async (id: string): Promise<void> => {
    setError(null);
    setPendingId(id);
    try {
      const response = await fetch(`/api/builder-schemas/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        setError('Could not delete form.');
        return;
      }
      setSummaries((prev) => prev.filter((entry) => entry.id !== id));
    } catch {
      setError('Could not delete form.');
    } finally {
      setPendingId(null);
    }
  }, []);

  return (
    <main className="ff-builder-list">
      <header className="ff-builder-list-header">
        <div>
          <h1>My forms</h1>
          <p className="ff-builder-list-subtitle">
            Saved schemas run live at /demo?form=&lt;id&gt; and /embed/&lt;id&gt;.
          </p>
        </div>
        <button
          type="button"
          className="ff-builder-button ff-builder-button-primary"
          onClick={() => void handleCreate()}
          disabled={pendingId !== null}
        >
          {pendingId === '__new' ? 'Creating…' : 'New form'}
        </button>
      </header>

      {error ? <div className="ff-builder-list-error">{error}</div> : null}

      {summaries.length === 0 ? (
        <div className="ff-builder-list-empty">
          <p>No saved forms yet.</p>
          <p>Click "New form" to start building one. Your schema is stored on the server and can be opened from any tab until the dev server restarts.</p>
        </div>
      ) : (
        <ul className="ff-builder-list-items">
          {summaries.map((summary) => (
            <li key={summary.id} className="ff-builder-list-item">
              <div className="ff-builder-list-main">
                <a className="ff-builder-list-title" href={`/builder/${summary.id}`}>
                  {summary.title}
                </a>
                <p className="ff-builder-list-meta">
                  id: <code>{summary.id}</code> · {summary.stepCount} step{summary.stepCount === 1 ? '' : 's'} ·{' '}
                  {summary.fieldCount} field{summary.fieldCount === 1 ? '' : 's'} · updated{' '}
                  {new Date(summary.updatedAt).toLocaleString()}
                </p>
              </div>
              <div className="ff-builder-list-actions">
                <a
                  className="ff-builder-button"
                  href={`/demo?form=${encodeURIComponent(summary.id)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open demo
                </a>
                <a
                  className="ff-builder-button"
                  href={`/embed/${encodeURIComponent(summary.id)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Embed
                </a>
                <button
                  type="button"
                  className="ff-builder-button ff-builder-button-danger"
                  onClick={() => void handleDelete(summary.id)}
                  disabled={pendingId === summary.id}
                >
                  {pendingId === summary.id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
