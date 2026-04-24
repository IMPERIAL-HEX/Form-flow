import { listSchemas } from '@/lib/builder/schemaStore';

import { BuilderListClient } from './BuilderListClient';

export const metadata = {
  title: 'FormFlow — Visual Builder',
  description: 'Save, open, and manage form schemas.',
};

export const dynamic = 'force-dynamic';

export default function BuilderPage(): React.ReactNode {
  const summaries = listSchemas();
  return <BuilderListClient initialSummaries={summaries} />;
}
