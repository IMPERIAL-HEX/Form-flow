import { promises as fs } from 'node:fs';
import path from 'node:path';

export async function GET(
  _request: Request,
  context: { params: { id: string } },
): Promise<Response> {
  const id = sanitizeId(context.params.id);
  const schemaPath = path.join(process.cwd(), 'schemas', `${id}.json`);

  try {
    const file = await fs.readFile(schemaPath, 'utf8');
    return Response.json(JSON.parse(file));
  } catch {
    return Response.json({ error: 'Form not found' }, { status: 404 });
  }
}

function sanitizeId(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9-]/g, '');
}
