import type { FieldSchema } from '@formflow/core';

export interface FieldComponentProps {
  field: FieldSchema;
  value: unknown;
  error: string | null;
  onChange: (value: unknown) => void;
  onBlur: () => void;
}

export interface FieldChromeProps {
  field: FieldSchema;
  error: string | null;
  children: (ids: { inputId: string; descriptionId: string; errorId: string }) => React.ReactNode;
}
