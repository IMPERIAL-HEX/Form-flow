import type { FormSchema } from '@formflow/core';
import { notFound } from 'next/navigation';

import { loadFormSchema } from '@/lib/schemas/loadFormSchema';
import { getSession, type SessionDraft } from '@/lib/sessions/sessionStore';
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

  const sessionParam = resolved?.session;
  const sessionToken = typeof sessionParam === 'string' ? sessionParam : undefined;
  let initialDraft: SessionDraft | null = null;
  if (sessionToken) {
    const draft = getSession(sessionToken);
    if (draft && draft.formId === schema.id) {
      initialDraft = draft;
    }
  }

  return <DemoClient schema={demoSchema} initialDraft={initialDraft} />;
}
