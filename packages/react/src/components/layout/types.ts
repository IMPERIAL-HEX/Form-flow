import type { FormSchema } from '@formflow/core';

import type { UseFormFlowReturn } from '../../hooks/useFormFlow';

export interface LayoutProps {
  schema: FormSchema;
  flow: UseFormFlowReturn;
  children: React.ReactNode;
  className?: string;
}
