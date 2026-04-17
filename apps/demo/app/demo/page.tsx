import type { FormSchema } from '@formflow/core';
import { notFound } from 'next/navigation';

import { loadFormSchema } from '@/lib/schemas/loadFormSchema';
import { DemoClient } from './DemoClient';

export default function DemoPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}): Promise<React.ReactNode> {
  return renderDemoPage(searchParams);
}

async function renderDemoPage(
  searchParams?: Record<string, string | string[] | undefined>,
): Promise<React.ReactNode> {
  const schema = await loadFormSchema('education-loan');

  if (!schema) {
    notFound();
  }

  const selectedLayout =
    typeof searchParams?.layout === 'string' &&
    ['sidebar-left', 'top-stepper', 'centered'].includes(searchParams.layout)
      ? searchParams.layout
      : schema.layout.template;

  const demoSchema: FormSchema = {
    ...schema,
    layout: {
      ...schema.layout,
      template: selectedLayout as FormSchema['layout']['template'],
    },
  };

  return <DemoClient schema={demoSchema} />;
}
