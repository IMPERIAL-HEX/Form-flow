'use client';

import { useEffect, useMemo, useState } from 'react';

import type { FormSchema } from '@formflow/core';

import {
  applyShowIf,
  compileCondition,
  createEmptyRow,
  decodeCondition,
  findTarget,
  listFields,
  listTargets,
  targetRefFromId,
  targetRefToId,
  type BuilderState,
  type MatchMode,
  type RowDraft,
  type TargetRef,
} from '@/lib/schemas/conditionBuilderUtils';

import { ConditionRow } from './ConditionRow';

interface ConditionBuilderProps {
  schema: FormSchema | null;
  onApply: (nextSchema: FormSchema) => void;
}

export function ConditionBuilder({ schema, onApply }: ConditionBuilderProps): React.ReactNode {
  if (!schema) {
    return (
      <section className="ff-cb-panel" aria-label="Condition builder">
        <header className="ff-cb-header">
          <h2>Condition Builder</h2>
          <p>Fix schema errors to start building conditions.</p>
        </header>
      </section>
    );
  }

  return <ConditionBuilderInner schema={schema} onApply={onApply} />;
}

interface InnerProps {
  schema: FormSchema;
  onApply: (nextSchema: FormSchema) => void;
}

function ConditionBuilderInner({ schema, onApply }: InnerProps): React.ReactNode {
  const targets = useMemo(() => listTargets(schema), [schema]);
  const fields = useMemo(() => listFields(schema), [schema]);

  const [targetRef, setTargetRef] = useState<TargetRef | null>(() => firstTargetRef(targets));
  const currentTarget = findTarget(targets, targetRef);

  const [state, setState] = useState<BuilderState>(() =>
    decodeCondition(currentTarget?.currentShowIf),
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const nextTarget = findTarget(targets, targetRef);
    setState(decodeCondition(nextTarget?.currentShowIf));
    setFeedback(null);
  }, [targetRef, targets]);

  useEffect(() => {
    if (!currentTarget && targets.length > 0) {
      setTargetRef(firstTargetRef(targets));
    }
  }, [currentTarget, targets]);

  const compiled = useMemo(() => compileCondition(state, schema), [state, schema]);

  const handleTargetChange = (value: string): void => {
    const next = targetRefFromId(value);
    setTargetRef(next);
  };

  const handleRowChange = (index: number, next: RowDraft): void => {
    setState((prev) => ({
      ...prev,
      rows: prev.rows.map((entry, i) => (i === index ? next : entry)),
    }));
  };

  const handleRowRemove = (index: number): void => {
    setState((prev) => ({
      ...prev,
      rows: prev.rows.length > 1 ? prev.rows.filter((_, i) => i !== index) : prev.rows,
    }));
  };

  const handleAddRow = (): void => {
    setState((prev) => ({ ...prev, rows: [...prev.rows, createEmptyRow()] }));
  };

  const handleModeChange = (mode: MatchMode): void => {
    setState((prev) => ({ ...prev, mode }));
  };

  const handleApply = (): void => {
    if (!targetRef) return;
    if (compiled.error) {
      setFeedback(compiled.error);
      return;
    }
    const nextSchema = applyShowIf(schema, targetRef, compiled.condition);
    onApply(nextSchema);
    setFeedback(
      compiled.condition
        ? 'showIf applied to the selected target.'
        : 'Removed showIf from the selected target.',
    );
  };

  const handleClear = (): void => {
    setState({ mode: 'all', rows: [createEmptyRow()] });
  };

  const handleRemoveShowIf = (): void => {
    if (!targetRef) return;
    const nextSchema = applyShowIf(schema, targetRef, null);
    onApply(nextSchema);
    setState({ mode: 'all', rows: [createEmptyRow()] });
    setFeedback('Removed showIf from the selected target.');
  };

  const targetId = targetRef ? targetRefToId(targetRef) : '';
  const showModeSelector = state.rows.length > 1;
  const previewText = previewJson(compiled.condition);
  const hasExisting = Boolean(currentTarget?.currentShowIf);

  return (
    <section className="ff-cb-panel" aria-label="Condition builder">
      <header className="ff-cb-header">
        <h2>Condition Builder</h2>
        <p>Attach a showIf to any step or field, then apply to update the schema JSON.</p>
      </header>

      <div className="ff-cb-target">
        <label className="ff-cb-cell-label" htmlFor="ff-cb-target">
          Target
        </label>
        <select
          id="ff-cb-target"
          className="ff-cb-input"
          value={targetId}
          onChange={(event) => handleTargetChange(event.target.value)}
        >
          {targets.map((target) => (
            <option key={targetRefToId(target.ref)} value={targetRefToId(target.ref)}>
              {target.label}
              {target.currentShowIf ? ' • has showIf' : ''}
            </option>
          ))}
        </select>
      </div>

      {showModeSelector ? (
        <div className="ff-cb-mode" role="radiogroup" aria-label="Match mode">
          <label className={`ff-cb-mode-option ${state.mode === 'all' ? 'ff-cb-mode-active' : ''}`}>
            <input
              type="radio"
              name="ff-cb-mode"
              value="all"
              checked={state.mode === 'all'}
              onChange={() => handleModeChange('all')}
            />
            Match all (AND)
          </label>
          <label className={`ff-cb-mode-option ${state.mode === 'any' ? 'ff-cb-mode-active' : ''}`}>
            <input
              type="radio"
              name="ff-cb-mode"
              value="any"
              checked={state.mode === 'any'}
              onChange={() => handleModeChange('any')}
            />
            Match any (OR)
          </label>
        </div>
      ) : null}

      <div className="ff-cb-rows">
        {state.rows.map((row, index) => (
          <ConditionRow
            key={row.id}
            row={row}
            fields={fields}
            index={index}
            canRemove={state.rows.length > 1}
            onChange={(next) => handleRowChange(index, next)}
            onRemove={() => handleRowRemove(index)}
          />
        ))}
      </div>

      <div className="ff-cb-actions">
        <button type="button" className="ff-cb-add" onClick={handleAddRow}>
          + Add row
        </button>
        <button type="button" className="ff-cb-reset" onClick={handleClear}>
          Reset rows
        </button>
        <div className="ff-cb-actions-spacer" />
        {hasExisting ? (
          <button type="button" className="ff-cb-remove-existing" onClick={handleRemoveShowIf}>
            Remove showIf
          </button>
        ) : null}
        <button type="button" className="ff-cb-apply" onClick={handleApply}>
          Apply to schema
        </button>
      </div>

      {compiled.error ? (
        <div className="ff-cb-feedback ff-cb-feedback-error" role="alert">
          {compiled.error}
        </div>
      ) : feedback ? (
        <div className="ff-cb-feedback ff-cb-feedback-ok" role="status">
          {feedback}
        </div>
      ) : null}

      <details className="ff-cb-preview">
        <summary>Preview compiled condition</summary>
        <pre>{previewText}</pre>
      </details>
    </section>
  );
}

function firstTargetRef(
  targets: ReturnType<typeof listTargets>,
): TargetRef | null {
  return targets[0]?.ref ?? null;
}

function previewJson(condition: unknown): string {
  if (!condition) return '// no condition — applying will clear showIf on the target';
  return JSON.stringify(condition, null, 2);
}
