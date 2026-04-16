import { describe, expect, it } from 'vitest';

import { createFormFlowEngine } from '../src/engine/engine';
import { parseFormSchema } from '../src/schema/parser';
import { baseSchema } from './fixtures/schema';

describe('createFormFlowEngine', () => {
  it('hides conditional steps until conditions are met', () => {
    const schema = parseFormSchema(structuredClone(baseSchema));
    const engine = createFormFlowEngine(schema);

    expect(engine.getState().visibleSteps.map((step) => step.id)).toEqual([
      'amount',
      'employment-status',
    ]);

    engine.setValue('employment.status', 'employed');

    expect(engine.getState().visibleSteps.map((step) => step.id)).toEqual([
      'amount',
      'employment-status',
      'employment-details',
    ]);
  });

  it('blocks next step when current step is invalid', () => {
    const schema = parseFormSchema(structuredClone(baseSchema));
    const engine = createFormFlowEngine(schema);

    const result = engine.next();

    expect(result.success).toBe(false);
    expect(result.state.errors['loan.amount']).toBeTruthy();
    expect(engine.getState().currentStep.id).toBe('amount');
  });

  it('navigates through valid steps and marks submission', () => {
    const schema = parseFormSchema(structuredClone(baseSchema));
    const engine = createFormFlowEngine(schema);

    engine.setValues({
      'loan.amount': 5000,
      'loan.purpose': 'medical',
      'employment.status': 'student',
    });

    expect(engine.next().success).toBe(true);
    expect(engine.getState().currentStep.id).toBe('employment-status');

    const submitResult = engine.next();
    expect(submitResult.success).toBe(true);
    expect(engine.getState().submitted).toBe(true);
  });

  it('strips hidden conditional values from submission payload and transforms keys', () => {
    const schema = parseFormSchema(structuredClone(baseSchema));
    const engine = createFormFlowEngine(schema, {
      'loan.amount': 5000,
      'loan.purpose': 'medical',
      'employment.status': 'student',
      'employment.employerName': 'Acme Corp',
    });

    const payload = engine.getSubmissionData() as {
      employment?: { status?: string; employerName?: string };
      loan?: { amount?: number; purpose?: string };
    };

    expect(payload.loan?.amount).toBe(5000);
    expect(payload.employment?.status).toBe('student');
    expect(payload.employment?.employerName).toBeUndefined();
  });

  it('supports previous navigation and reset behavior', () => {
    const schema = parseFormSchema(structuredClone(baseSchema));
    const engine = createFormFlowEngine(schema, {
      'loan.amount': 5000,
      'loan.purpose': 'medical',
      'employment.status': 'student',
    });

    engine.next();
    expect(engine.getState().currentStep.id).toBe('employment-status');

    engine.previous();
    expect(engine.getState().currentStep.id).toBe('amount');

    engine.reset();
    expect(engine.getState().currentStep.id).toBe('amount');
    expect(engine.getState().submitted).toBe(false);
  });

  it('allows goToStep only for visited visible steps', () => {
    const schema = parseFormSchema(structuredClone(baseSchema));
    const engine = createFormFlowEngine(schema, {
      'loan.amount': 5000,
      'loan.purpose': 'medical',
      'employment.status': 'employed',
      'employment.employerName': 'Acme Corp',
    });

    engine.next();
    engine.next();

    expect(engine.getState().currentStep.id).toBe('employment-details');
    engine.goToStep('amount');
    expect(engine.getState().currentStep.id).toBe('amount');

    engine.goToStep('non-existent');
    expect(engine.getState().currentStep.id).toBe('amount');
  });

  it('notifies subscribers on state changes', () => {
    const schema = parseFormSchema(structuredClone(baseSchema));
    const engine = createFormFlowEngine(schema);

    const snapshots: string[] = [];
    const unsubscribe = engine.subscribe((state) => {
      snapshots.push(state.currentStep.id);
    });

    engine.setValue('loan.amount', 5000);
    engine.setValue('loan.purpose', 'medical');
    unsubscribe();
    engine.setValue('employment.status', 'student');

    expect(snapshots.length).toBeGreaterThan(0);
    expect(snapshots.at(-1)).toBe('amount');
  });

  it('exposes validateCurrentStep and validateField edge behavior', () => {
    const schema = parseFormSchema(structuredClone(baseSchema));
    const engine = createFormFlowEngine(schema);

    expect(engine.validateField('missing.key')).toBeNull();

    const initialValidation = engine.validateCurrentStep();
    expect(initialValidation.valid).toBe(false);
    expect(initialValidation.errors['loan.amount']).toBeTruthy();

    engine.setValues({
      'loan.amount': 5000,
      'loan.purpose': 'medical',
      'employment.status': 'student',
    });

    expect(engine.validateField('loan.amount')).toBeNull();
    const validStep = engine.validateCurrentStep();
    expect(validStep.valid).toBe(true);
  });

  it('falls back to first step when all conditional steps are hidden', () => {
    const schema = {
      id: 'all-hidden',
      version: '1.0.0',
      title: 'All Hidden',
      layout: { template: 'centered' as const },
      submission: { endpoint: '/api/submissions', transformKeys: true },
      steps: [
        {
          id: 'hidden-start',
          title: 'Hidden Start',
          showIf: { field: 'never.set', operator: 'eq' as const, value: true },
          fields: [
            {
              type: 'text' as const,
              key: 'hidden.field',
              label: 'Weird Path',
              required: false,
            },
          ],
        },
      ],
    };

    const engine = createFormFlowEngine(schema);
    expect(engine.getState().currentStep.id).toBe('hidden-start');
  });

  it('handles malformed dot-path segments when transforming submission keys', () => {
    const schema = {
      id: 'weird-paths',
      version: '1.0.0',
      title: 'Weird Paths',
      layout: { template: 'centered' as const },
      submission: { endpoint: '/api/submissions', transformKeys: true },
      steps: [
        {
          id: 'single',
          title: 'Single',
          fields: [
            {
              type: 'text' as const,
              key: 'weird..path',
              label: 'Weird Path',
              required: false,
            },
          ],
        },
      ],
    };

    const engine = createFormFlowEngine(schema);

    engine.setValue('weird..path', 'value');
    const payload = engine.getSubmissionData() as { weird?: { path?: string } };
    expect(payload.weird?.path).toBe('value');
  });
});
