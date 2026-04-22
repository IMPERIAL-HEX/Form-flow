import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

import {
  createFormFlowEngine,
  parseFormSchema,
  type FormFlowEngine,
  type FormFlowState,
  type FormSchema,
  type StepSchema,
} from '@formflow/core';

export interface UseFormFlowOptions {
  schema: FormSchema;
  initialValues?: Record<string, unknown>;
  initialStepId?: string;
  onSubmit?: (data: Record<string, unknown>) => void | Promise<void>;
  onStepChange?: (stepId: string, direction: 'forward' | 'back') => void;
  onStateChange?: (state: FormFlowState) => void;
}

export interface UseFormFlowReturn {
  currentStep: StepSchema;
  currentStepIndex: number;
  visibleSteps: StepSchema[];
  values: Record<string, unknown>;
  errors: Record<string, string>;
  progress: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting: boolean;
  isSubmitted: boolean;
  setValue: (key: string, value: unknown) => void;
  next: () => Promise<void>;
  previous: () => void;
  goToStep: (stepId: string) => void;
  validateField: (key: string) => string | null;
  reset: () => void;
}

export function useFormFlow(options: UseFormFlowOptions): UseFormFlowReturn {
  const engine = useEngine(options.schema, options.initialValues, options.initialStepId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const state = useSyncExternalStore(
    useCallback((listener) => engine.subscribe(listener), [engine]),
    useCallback(() => engine.getState(), [engine]),
    useCallback(() => engine.getState(), [engine]),
  );

  const onStateChangeRef = useRef(options.onStateChange);
  useEffect(() => {
    onStateChangeRef.current = options.onStateChange;
  }, [options.onStateChange]);

  useEffect(() => {
    onStateChangeRef.current?.(state);
  }, [state]);

  const setValue = useCallback(
    (key: string, value: unknown) => {
      engine.setValue(key, value);
    },
    [engine],
  );

  const next = useCallback(async () => {
    const before = engine.getState();
    const result = engine.next();

    if (!result.success) {
      return;
    }

    if (before.isLastStep) {
      if (!options.onSubmit) {
        return;
      }

      setIsSubmitting(true);
      try {
        await options.onSubmit(engine.getSubmissionData());
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    options.onStepChange?.(result.state.currentStep.id, 'forward');
  }, [engine, options]);

  const previous = useCallback(() => {
    const nextState = engine.previous();
    options.onStepChange?.(nextState.currentStep.id, 'back');
  }, [engine, options]);

  const goToStep = useCallback(
    (stepId: string) => {
      engine.goToStep(stepId);
    },
    [engine],
  );

  const validateField = useCallback(
    (key: string) => {
      return engine.validateField(key);
    },
    [engine],
  );

  const reset = useCallback(() => {
    engine.reset();
  }, [engine]);

  return {
    currentStep: state.currentStep,
    currentStepIndex: state.currentStepIndex,
    visibleSteps: state.visibleSteps,
    values: state.values,
    errors: state.errors,
    progress: state.progress,
    isFirstStep: state.isFirstStep,
    isLastStep: state.isLastStep,
    isSubmitting,
    isSubmitted: state.submitted,
    setValue,
    next,
    previous,
    goToStep,
    validateField,
    reset,
  };
}

function useEngine(
  schema: FormSchema,
  initialValues?: Record<string, unknown>,
  initialStepId?: string,
): FormFlowEngine {
  const engineRef = useRef<FormFlowEngine | null>(null);
  const schemaRef = useRef<FormSchema | null>(null);

  if (!engineRef.current || schemaRef.current !== schema) {
    const parsedSchema = parseFormSchema(schema);
    const engine = createFormFlowEngine(parsedSchema, initialValues);
    if (initialStepId) {
      engine.goToStep(initialStepId);
    }
    engineRef.current = engine;
    schemaRef.current = schema;
  }

  return engineRef.current;
}
