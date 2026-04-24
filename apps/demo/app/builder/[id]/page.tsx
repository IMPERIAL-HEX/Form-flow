import { notFound } from 'next/navigation';

import { getSchema } from '@/lib/builder/schemaStore';

import { BuilderClient } from '../BuilderClient';

export const dynamic = 'force-dynamic';

export default async function BuilderEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const { id } = await params;
  const stored = getSchema(id);
  if (!stored) {
    notFound();
  }
  return <BuilderClient initialSchema={stored.schema} schemaId={stored.id} />;
}
