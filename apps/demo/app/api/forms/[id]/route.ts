import { loadFormSchema } from '@/lib/schemas/loadFormSchema';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await context.params;
  const schema = await loadFormSchema(id);

  if (!schema) {
    return Response.json({ error: 'Form not found' }, { status: 404 });
  }

  return Response.json(schema);
}
