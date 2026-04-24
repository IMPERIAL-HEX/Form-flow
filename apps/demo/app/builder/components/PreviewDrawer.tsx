'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { FormSchema } from '@formflow/core';
import { FormFlowRenderer } from '@formflow/react';

interface PreviewDrawerProps {
  open: boolean;
  onClose: () => void;
  schema: FormSchema | null;
  error: string | null;
}

const MIN_WIDTH = 360;
const DEFAULT_WIDTH = 720;
const STORAGE_KEY = 'ff-builder-preview-width';

function clampWidth(value: number, viewport: number): number {
  const max = Math.max(MIN_WIDTH, viewport - 80);
  return Math.min(Math.max(value, MIN_WIDTH), max);
}

function readStoredWidth(): number | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export function PreviewDrawer({ open, onClose, schema, error }: PreviewDrawerProps): React.ReactNode {
  const [width, setWidth] = useState<number>(DEFAULT_WIDTH);
  const dragStateRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const stored = readStoredWidth();
    const viewport = typeof window !== 'undefined' ? window.innerWidth : DEFAULT_WIDTH * 2;
    setWidth(clampWidth(stored ?? DEFAULT_WIDTH, viewport));
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (event: MouseEvent): void => {
      const state = dragStateRef.current;
      if (!state) return;
      const delta = state.startX - event.clientX;
      const viewport = window.innerWidth;
      setWidth(clampWidth(state.startWidth + delta, viewport));
    };
    const handleUp = (): void => {
      setDragging(false);
      dragStateRef.current = null;
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [dragging]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (dragging) return;
    window.localStorage.setItem(STORAGE_KEY, String(width));
  }, [dragging, width]);

  const handleDragStart = useCallback(
    (event: React.MouseEvent<HTMLDivElement>): void => {
      event.preventDefault();
      dragStateRef.current = { startX: event.clientX, startWidth: width };
      setDragging(true);
    },
    [width],
  );

  const handleDoubleClick = useCallback((): void => {
    const viewport = typeof window !== 'undefined' ? window.innerWidth : DEFAULT_WIDTH * 2;
    setWidth(clampWidth(viewport - 80, viewport));
  }, []);

  if (!open) return null;

  return (
    <div
      className="ff-builder-preview-overlay"
      role="dialog"
      aria-label="Form preview"
      aria-modal="true"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={`ff-builder-preview-shell${dragging ? ' ff-builder-preview-shell-dragging' : ''}`}
        style={{ width: `${width}px` }}
      >
        <div
          className="ff-builder-preview-resizer"
          role="separator"
          aria-label="Resize preview. Drag to adjust, double click to maximise."
          aria-orientation="vertical"
          onMouseDown={handleDragStart}
          onDoubleClick={handleDoubleClick}
        />
        <header className="ff-builder-preview-header">
          <h2>Preview</h2>
          <button
            type="button"
            className="ff-builder-button"
            onClick={onClose}
            aria-label="Close preview"
          >
            Close
          </button>
        </header>
        <div className="ff-builder-preview-body">
          {error ? (
            <div className="ff-builder-preview-error">
              <strong>Schema error</strong>
              <p>{error}</p>
            </div>
          ) : schema ? (
            <FormFlowRenderer schema={schema} onSubmit={() => undefined} />
          ) : (
            <div className="ff-builder-empty">Nothing to preview yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
