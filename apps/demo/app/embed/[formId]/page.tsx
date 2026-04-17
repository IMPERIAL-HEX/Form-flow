import type { FormSchema } from '@formflow/core';

import { loadFormSchema } from '@/lib/schemas/loadFormSchema';

import { EmbedClient } from './EmbedClient';

const layoutValues = new Set<FormSchema['layout']['template']>([
  'sidebar-left',
  'top-stepper',
  'centered',
]);

const borderRadiusValues = new Set<NonNullable<FormSchema['theme']>['borderRadius']>([
  'none',
  'sm',
  'md',
  'lg',
  'full',
]);

export default async function EmbedPage({
  params,
  searchParams,
}: {
  params: Promise<{ formId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}): Promise<React.ReactNode> {
  const { formId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const baseSchema = await loadFormSchema(formId);

  if (!baseSchema) {
    return (
      <main className="ff-embed-missing">
        <h1>Schema not found</h1>
        <p>Could not find a form schema for "{formId}".</p>
      </main>
    );
  }

  const schema = applyEmbedOverrides(baseSchema, resolvedSearchParams);

  return <EmbedClient formId={formId} schema={schema} />;
}

function applyEmbedOverrides(
  schema: Readonly<FormSchema>,
  searchParams?: Record<string, string | string[] | undefined>,
): FormSchema {
  const layoutValue = getSingleParam(searchParams?.layout);
  const primaryColor = getSingleParam(searchParams?.primaryColor);
  const borderRadius = getSingleParam(searchParams?.borderRadius);

  const nextLayout = layoutValues.has(layoutValue as FormSchema['layout']['template'])
    ? (layoutValue as FormSchema['layout']['template'])
    : schema.layout.template;

  const nextPrimaryColor = isHexColor(primaryColor) ? primaryColor : schema.theme?.primaryColor;
  const nextBorderRadius = borderRadiusValues.has(
    borderRadius as NonNullable<FormSchema['theme']>['borderRadius'],
  )
    ? (borderRadius as NonNullable<FormSchema['theme']>['borderRadius'])
    : schema.theme?.borderRadius;

  return {
    ...(schema as FormSchema),
    layout: {
      ...schema.layout,
      template: nextLayout,
    },
    theme: {
      ...schema.theme,
      primaryColor: nextPrimaryColor,
      borderRadius: nextBorderRadius,
    },
  };
}

function getSingleParam(value: string | string[] | undefined): string {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value) && value.length > 0) {
    return value[0] ?? '';
  }

  return '';
}

function isHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value) || /^#[0-9a-fA-F]{3}$/.test(value);
}
