'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { FormFlowState, FormSchema } from '@formflow/core';
import { FormFlowRenderer } from '@formflow/react';

import type { SessionDraft } from '@/lib/sessions/sessionStore';

interface DemoClientProps {
  schema: FormSchema;
  initialDraft: SessionDraft | null;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function DemoClient({ schema, initialDraft }: DemoClientProps): React.ReactNode {
  const method = schema.submission.method ?? 'POST';

  const [token, setToken] = useState<string | null>(initialDraft?.token ?? null);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [copied, setCopied] = useState(false);
  const latestStateRef = useRef<FormFlowState | null>(null);
  const tokenRef = useRef<string | null>(initialDraft?.token ?? null);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  const handleStateChange = useCallback((state: FormFlowState) => {
    latestStateRef.current = state;
  }, []);

  const persistDraft = useCallback(async (): Promise<void> => {
    const state = latestStateRef.current;
    if (!state) return;
    setStatus('saving');
    const payload = {
      formId: schema.id,
      stepId: state.currentStep.id,
      values: state.values,
    };
    try {
      const existingToken = tokenRef.current;
      const response = existingToken
        ? await fetch(`/api/sessions/${existingToken}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stepId: payload.stepId, values: payload.values }),
          })
        : await fetch('/api/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

      if (!response.ok) {
        setStatus('error');
        return;
      }

      const body = (await response.json()) as { draft?: SessionDraft };
      const draft = body.draft;
      if (draft && draft.token !== tokenRef.current) {
        tokenRef.current = draft.token;
        setToken(draft.token);
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.set('session', draft.token);
          window.history.replaceState({}, '', url);
        }
      }
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  }, [schema.id]);

  const handleStepChange = useCallback(() => {
    void persistDraft();
  }, [persistDraft]);

  const handleSaveClick = useCallback(() => {
    void persistDraft();
  }, [persistDraft]);

  const handleCopyLink = useCallback(async () => {
    const current = tokenRef.current;
    if (!current || typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set('session', current);
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }, []);

  const handleSubmit = useCallback(
    async (payload: Record<string, unknown>): Promise<void> => {
      await fetch(schema.submission.endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(schema.submission.headers ?? {}),
        },
        body: JSON.stringify({ formId: schema.id, source: 'demo', payload }),
      });
      const currentToken = tokenRef.current;
      if (currentToken) {
        try {
          await fetch(`/api/sessions/${currentToken}`, { method: 'DELETE' });
        } catch {
          // best-effort cleanup
        }
        tokenRef.current = null;
        setToken(null);
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.delete('session');
          window.history.replaceState({}, '', url);
        }
      }
    },
    [method, schema.id, schema.submission.endpoint, schema.submission.headers],
  );

  return (
    <div className="ff-demo-shell" data-session={token ?? ''}>
      <div className="ff-demo-resume-bar" aria-live="polite">
        <div className="ff-demo-resume-status">
          {initialDraft ? <span>Progress restored from your saved draft.</span> : null}
          {status === 'saving' ? <span>Saving…</span> : null}
          {status === 'saved' ? <span>Draft saved.</span> : null}
          {status === 'error' ? (
            <span className="ff-demo-resume-error">Could not save draft.</span>
          ) : null}
        </div>
        <div className="ff-demo-resume-actions">
          <button
            type="button"
            className="ff-demo-resume-button"
            onClick={handleSaveClick}
            aria-label="Save draft for later"
          >
            Save for later
          </button>
          {token ? (
            <button
              type="button"
              className="ff-demo-resume-button ff-demo-resume-button-primary"
              onClick={handleCopyLink}
              aria-label="Copy resume link"
            >
              {copied ? 'Copied!' : 'Copy resume link'}
            </button>
          ) : null}
        </div>
      </div>
      <FormFlowRenderer
        schema={schema}
        initialValues={initialDraft?.values}
        initialStepId={initialDraft?.stepId}
        onStateChange={handleStateChange}
        onStepChange={handleStepChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
