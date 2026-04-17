import type { ZodTypeAny } from 'zod';

import type { FieldSchema, FormSchema, StepSchema } from '../schema/types';
import { buildFieldValidator } from '../validation/validator';
import { evaluateCondition } from './conditions';

/** State snapshot of a form flow session. */
export interface FormFlowState {
  currentStepIndex: number;
  values: Record<string, unknown>;
  errors: Record<string, string>;
  visited: Set<string>;
  completed: Set<string>;
  submitted: boolean;
  visibleSteps: StepSchema[];
  progress: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  currentStep: StepSchema;
}

/** Public API for operating a form flow state machine. */
export interface FormFlowEngine {
  getState(): FormFlowState;
  setValue(key: string, value: unknown): FormFlowState;
  setValues(values: Record<string, unknown>): FormFlowState;
  validateCurrentStep(): { valid: boolean; errors: Record<string, string> };
  validateField(key: string): string | null;
  next(): { success: boolean; state: FormFlowState };
  previous(): FormFlowState;
  goToStep(stepId: string): FormFlowState;
  getSubmissionData(): Record<string, unknown>;
  subscribe(listener: (state: FormFlowState) => void): () => void;
  reset(): FormFlowState;
}

interface InternalState {
  currentStepIndex: number;
  values: Record<string, unknown>;
  errors: Record<string, string>;
  visited: Set<string>;
  submitted: boolean;
}

/**
 * Creates a pure form flow engine from a schema and optional initial values.
 */
export function createFormFlowEngine(
  schema: FormSchema,
  initialValues: Record<string, unknown> = {},
): FormFlowEngine {
  const fieldMap = buildFieldMap(schema);
  const validators = buildValidatorMap(fieldMap);
  const listeners = new Set<(state: FormFlowState) => void>();

  const initialVisibleSteps = computeVisibleSteps(schema.steps, initialValues);
  const initialCurrentStep = resolveCurrentStep(initialVisibleSteps, 0);

  let internalState: InternalState = {
    currentStepIndex: initialCurrentStep.index,
    values: { ...initialValues },
    errors: {},
    visited: new Set([initialCurrentStep.step.id]),
    submitted: false,
  };

  let state = createSnapshot(schema, internalState, validators);

  function setInternalState(nextState: InternalState): FormFlowState {
    internalState = nextState;
    state = createSnapshot(schema, internalState, validators);

    for (const listener of listeners) {
      listener(state);
    }

    return state;
  }

  return {
    getState: () => state,

    setValue: (key: string, value: unknown) => {
      const nextValues = { ...internalState.values, [key]: value };
      const nextErrors = { ...internalState.errors };
      delete nextErrors[key];

      return setInternalState({
        ...internalState,
        values: nextValues,
        errors: nextErrors,
      });
    },

    setValues: (values: Record<string, unknown>) => {
      const nextValues = { ...internalState.values, ...values };
      const nextErrors = { ...internalState.errors };

      for (const key of Object.keys(values)) {
        delete nextErrors[key];
      }

      return setInternalState({
        ...internalState,
        values: nextValues,
        errors: nextErrors,
      });
    },

    validateCurrentStep: () => {
      const currentSnapshot = createSnapshot(schema, internalState, validators);
      const step = currentSnapshot.currentStep;
      const nextErrors = { ...internalState.errors };
      const stepErrors: Record<string, string> = {};

      for (const field of step.fields) {
        if (!isFieldVisible(field, internalState.values)) {
          delete nextErrors[field.key];
          continue;
        }

        const error = validateFieldValue(
          field,
          internalState.values[field.key],
          validators[field.key],
        );

        if (error) {
          nextErrors[field.key] = error;
          stepErrors[field.key] = error;
        } else {
          delete nextErrors[field.key];
        }
      }

      internalState = {
        ...internalState,
        errors: nextErrors,
      };
      state = createSnapshot(schema, internalState, validators);

      for (const listener of listeners) {
        listener(state);
      }

      return {
        valid: Object.keys(stepErrors).length === 0,
        errors: stepErrors,
      };
    },

    validateField: (key: string) => {
      const field = fieldMap[key];
      if (!field) {
        return null;
      }

      if (!isFieldVisible(field, internalState.values)) {
        const nextErrors = { ...internalState.errors };
        delete nextErrors[key];
        setInternalState({
          ...internalState,
          errors: nextErrors,
        });
        return null;
      }

      const error = validateFieldValue(field, internalState.values[key], validators[key]);
      const nextErrors = { ...internalState.errors };

      if (error) {
        nextErrors[key] = error;
      } else {
        delete nextErrors[key];
      }

      setInternalState({
        ...internalState,
        errors: nextErrors,
      });

      return error;
    },

    next: () => {
      const result = stateMachineValidateCurrentStep(schema, internalState, validators);

      if (!result.valid) {
        return { success: false, state: setInternalState(result.state) };
      }

      const currentSnapshot = createSnapshot(schema, result.state, validators);
      if (currentSnapshot.isLastStep) {
        const submittedState: InternalState = {
          ...result.state,
          submitted: true,
        };

        return { success: true, state: setInternalState(submittedState) };
      }

      const nextIndex = currentSnapshot.currentStepIndex + 1;
      const nextStep = currentSnapshot.visibleSteps[nextIndex];

      if (!nextStep) {
        return { success: true, state: setInternalState(result.state) };
      }

      const navigatedState: InternalState = {
        ...result.state,
        currentStepIndex: nextIndex,
        visited: new Set([...result.state.visited, nextStep.id]),
      };

      return { success: true, state: setInternalState(navigatedState) };
    },

    previous: () => {
      const currentSnapshot = createSnapshot(schema, internalState, validators);
      if (currentSnapshot.isFirstStep) {
        return state;
      }

      const nextIndex = Math.max(0, currentSnapshot.currentStepIndex - 1);
      const step = currentSnapshot.visibleSteps[nextIndex];

      if (!step) {
        return state;
      }

      return setInternalState({
        ...internalState,
        currentStepIndex: nextIndex,
        visited: new Set([...internalState.visited, step.id]),
      });
    },

    goToStep: (stepId: string) => {
      const currentSnapshot = createSnapshot(schema, internalState, validators);
      if (!internalState.visited.has(stepId)) {
        return state;
      }

      const targetIndex = currentSnapshot.visibleSteps.findIndex((step) => step.id === stepId);
      if (targetIndex === -1) {
        return state;
      }

      return setInternalState({
        ...internalState,
        currentStepIndex: targetIndex,
      });
    },

    getSubmissionData: () => {
      const visibleKeySet = collectVisibleSubmissionKeys(schema, internalState.values);
      const filteredValues: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(internalState.values)) {
        if (visibleKeySet.has(key)) {
          filteredValues[key] = value;
        }
      }

      if (schema.submission.transformKeys) {
        return transformDotPathKeys(filteredValues);
      }

      return filteredValues;
    },

    subscribe: (listener: (nextState: FormFlowState) => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    reset: () => {
      const resetVisibleSteps = computeVisibleSteps(schema.steps, initialValues);
      const resetStep = resolveCurrentStep(resetVisibleSteps, 0);

      return setInternalState({
        currentStepIndex: resetStep.index,
        values: { ...initialValues },
        errors: {},
        visited: new Set([resetStep.step.id]),
        submitted: false,
      });
    },
  };
}

function createSnapshot(
  schema: FormSchema,
  internalState: InternalState,
  validators: Record<string, ZodTypeAny>,
): FormFlowState {
  const visibleSteps = computeVisibleSteps(schema.steps, internalState.values);
  const currentStep = resolveCurrentStep(visibleSteps, internalState.currentStepIndex);

  const completed = computeCompletedSteps(visibleSteps, internalState.values, validators);
  const progress =
    visibleSteps.length === 0 ? 0 : Math.round((completed.size / visibleSteps.length) * 100);

  return {
    currentStepIndex: currentStep.index,
    values: { ...internalState.values },
    errors: { ...internalState.errors },
    visited: new Set(internalState.visited),
    completed: new Set(completed),
    submitted: internalState.submitted,
    visibleSteps: [...visibleSteps],
    progress,
    isFirstStep: currentStep.index === 0,
    isLastStep: currentStep.index === visibleSteps.length - 1,
    currentStep: currentStep.step,
  };
}

function stateMachineValidateCurrentStep(
  schema: FormSchema,
  internalState: InternalState,
  validators: Record<string, ZodTypeAny>,
): { valid: boolean; state: InternalState } {
  const snapshot = createSnapshot(schema, internalState, validators);
  const nextErrors = { ...internalState.errors };
  let valid = true;

  for (const field of snapshot.currentStep.fields) {
    if (!isFieldVisible(field, internalState.values)) {
      delete nextErrors[field.key];
      continue;
    }

    const error = validateFieldValue(field, internalState.values[field.key], validators[field.key]);

    if (error) {
      nextErrors[field.key] = error;
      valid = false;
    } else {
      delete nextErrors[field.key];
    }
  }

  return {
    valid,
    state: {
      ...internalState,
      errors: nextErrors,
    },
  };
}

function buildFieldMap(schema: FormSchema): Record<string, FieldSchema> {
  const map: Record<string, FieldSchema> = {};

  for (const step of schema.steps) {
    for (const field of step.fields) {
      map[field.key] = field;
    }
  }

  return map;
}

function buildValidatorMap(fieldMap: Record<string, FieldSchema>): Record<string, ZodTypeAny> {
  return Object.fromEntries(
    Object.entries(fieldMap).map(([key, field]) => [key, buildFieldValidator(field)]),
  );
}

function validateFieldValue(
  field: FieldSchema,
  value: unknown,
  validator: ZodTypeAny | undefined,
): string | null {
  if (field.type === 'info') {
    return null;
  }

  if (!validator) {
    return null;
  }

  const result = validator.safeParse(value);
  if (result.success) {
    return null;
  }

  return result.error.issues[0]?.message ?? `${field.label} is invalid`;
}

function computeVisibleSteps(steps: StepSchema[], values: Record<string, unknown>): StepSchema[] {
  const visible = steps.filter((step) => isStepVisible(step, values));

  if (visible.length > 0) {
    return visible;
  }

  const firstStep = steps[0];
  if (firstStep) {
    return [firstStep];
  }

  return [];
}

function isStepVisible(step: StepSchema, values: Record<string, unknown>): boolean {
  if (!step.showIf) {
    return true;
  }

  return evaluateCondition(step.showIf, values);
}

function isFieldVisible(field: FieldSchema, values: Record<string, unknown>): boolean {
  if (!field.showIf) {
    return true;
  }

  return evaluateCondition(field.showIf, values);
}

function resolveCurrentStep(
  visibleSteps: StepSchema[],
  currentStepIndex: number,
): { step: StepSchema; index: number } {
  if (visibleSteps.length === 0) {
    throw new Error('Form schema must provide at least one visible step.');
  }

  const clampedIndex = Math.max(0, Math.min(currentStepIndex, visibleSteps.length - 1));
  const step = visibleSteps[clampedIndex];

  if (!step) {
    throw new Error('Failed to resolve current step from visible steps.');
  }

  return {
    step,
    index: clampedIndex,
  };
}

function computeCompletedSteps(
  visibleSteps: StepSchema[],
  values: Record<string, unknown>,
  validators: Record<string, ZodTypeAny>,
): Set<string> {
  const completed = new Set<string>();

  for (const step of visibleSteps) {
    const valid = step.fields
      .filter((field) => isFieldVisible(field, values))
      .every(
        (field) => validateFieldValue(field, values[field.key], validators[field.key]) === null,
      );

    if (valid) {
      completed.add(step.id);
    }
  }

  return completed;
}

function collectVisibleSubmissionKeys(
  schema: FormSchema,
  values: Record<string, unknown>,
): Set<string> {
  const keys = new Set<string>();

  for (const step of schema.steps) {
    if (!isStepVisible(step, values)) {
      continue;
    }

    for (const field of step.fields) {
      if (field.type === 'info') {
        continue;
      }

      if (!isFieldVisible(field, values)) {
        continue;
      }

      keys.add(field.key);
    }
  }

  return keys;
}

function transformDotPathKeys(values: Record<string, unknown>): Record<string, unknown> {
  const output: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(values)) {
    setPath(output, key, value);
  }

  return output;
}

function setPath(target: Record<string, unknown>, path: string, value: unknown): void {
  const segments = path.split('.');
  let cursor: Record<string, unknown> = target;

  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    if (!segment) {
      continue;
    }

    const isLast = index === segments.length - 1;

    if (isLast) {
      cursor[segment] = value;
      continue;
    }

    const nextValue = cursor[segment];
    if (!nextValue || typeof nextValue !== 'object' || Array.isArray(nextValue)) {
      cursor[segment] = {};
    }

    cursor = cursor[segment] as Record<string, unknown>;
  }
}
