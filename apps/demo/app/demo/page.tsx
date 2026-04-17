import type { FormSchema } from '@formflow/core';
import { notFound } from 'next/navigation';

import { loadFormSchema } from '@/lib/schemas/loadFormSchema';
import { DemoClient } from './DemoClient';

const LAYOUT_VALUES = ['sidebar-left', 'top-stepper', 'centered'] as const;

export default async function DemoPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}): Promise<React.ReactNode> {
  const resolved = searchParams ? await searchParams : undefined;
  const schema = await loadFormSchema('education-loan');

  if (!schema) {
    notFound();
  }

  const layoutParam = resolved?.layout;
  const template = LAYOUT_VALUES.find((value) => value === layoutParam) ?? schema.layout.template;

  const demoSchema: FormSchema = {
    ...schema,
    layout: {
      ...schema.layout,
      template,
    },
  };

  return <DemoClient schema={demoSchema} />;
}
