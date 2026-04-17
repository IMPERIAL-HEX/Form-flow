import { useCallback, useSyncExternalStore } from 'react';

import type { FormFlowEngine } from '@formflow/core';

export function useFieldValidation(
  engine: FormFlowEngine,
  key: string,
): {
  error: string | null;
  validate: () => void;
  clearError: () => void;
} {
  const state = useSyncExternalStore(
    useCallback((listener) => engine.subscribe(listener), [engine]),
    useCallback(() => engine.getState(), [engine]),
    useCallback(() => engine.getState(), [engine]),
  );

  const validate = useCallback(() => {
    engine.validateField(key);
  }, [engine, key]);

  const clearError = useCallback(() => {
    const currentValue = engine.getState().values[key];
    engine.setValue(key, currentValue);
  }, [engine, key]);

  return {
    error: state.errors[key] ?? null,
    validate,
    clearError,
  };
}
