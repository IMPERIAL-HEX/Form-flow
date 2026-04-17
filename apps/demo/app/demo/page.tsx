import type { FormSchema } from '@formflow/core';

import schema from '@/schemas/education-loan.json';
import { DemoClient } from './DemoClient';

export default function DemoPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}): React.ReactNode {
  const selectedLayout =
    typeof searchParams?.layout === 'string' &&
    ['sidebar-left', 'top-stepper', 'centered'].includes(searchParams.layout)
      ? searchParams.layout
      : schema.layout.template;

  const demoSchema: FormSchema = {
    ...(schema as FormSchema),
    layout: {
      ...(schema as FormSchema).layout,
      template: selectedLayout as FormSchema['layout']['template'],
    },
  };

  return <DemoClient schema={demoSchema} />;
}
