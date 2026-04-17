import type { FormSchema } from '@formflow/core';
import { notFound } from 'next/navigation';

import { loadFormSchema } from '@/lib/schemas/loadFormSchema';
import { DemoClient } from './DemoClient';

export default function DemoPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}): Promise<React.ReactNode> {
  return renderDemoPage(searchParams);
}

async function renderDemoPage(
  searchParams?: Promise<Record<string, string | string[] | undefined>>,
): Promise<React.ReactNode> {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const schema = await loadFormSchema('education-loan');

  if (!schema) {
    notFound();
  }

  const selectedLayout =
    typeof resolvedSearchParams?.layout === 'string' &&
    ['sidebar-left', 'top-stepper', 'centered'].includes(resolvedSearchParams.layout)
      ? resolvedSearchParams.layout
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
