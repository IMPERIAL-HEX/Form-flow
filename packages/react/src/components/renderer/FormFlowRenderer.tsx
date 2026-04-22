import { AnimatePresence } from 'framer-motion';

import type { FormFlowState, FormSchema } from '@formflow/core';

import { useFormFlow } from '../../hooks/useFormFlow';
import type { FieldComponentMap } from '../../registry/registry';
import { ThemeProvider } from '../../theme';
import { LayoutShell } from '../layout';
import { StepRenderer } from './StepRenderer';

export interface FormFlowRendererProps {
  schema: FormSchema;
  initialValues?: Record<string, unknown>;
  initialStepId?: string;
  onSubmit?: (data: Record<string, unknown>) => void | Promise<void>;
  onStepChange?: (stepId: string, direction: 'forward' | 'back') => void;
  onStateChange?: (state: FormFlowState) => void;
  customComponents?: Partial<FieldComponentMap>;
  className?: string;
}

export function FormFlowRenderer(props: FormFlowRendererProps): React.ReactNode {
  const flow = useFormFlow({
    schema: props.schema,
    initialValues: props.initialValues,
    initialStepId: props.initialStepId,
    onSubmit: props.onSubmit,
    onStepChange: props.onStepChange,
    onStateChange: props.onStateChange,
  });

  return (
    <ThemeProvider theme={props.schema.theme}>
      <LayoutShell schema={props.schema} flow={flow} className={props.className}>
        <AnimatePresence mode="wait">
          <StepRenderer
            key={flow.currentStep.id}
            step={flow.currentStep}
            values={flow.values}
            errors={flow.errors}
            onChange={flow.setValue}
            onBlur={flow.validateField}
            registry={props.customComponents}
          />
        </AnimatePresence>
      </LayoutShell>
    </ThemeProvider>
  );
}
