import { loadFormSchema } from '@/lib/schemas/loadFormSchema';

export async function GET(
  _request: Request,
  context: { params: { id: string } },
): Promise<Response> {
  const schema = await loadFormSchema(context.params.id);

  if (!schema) {
    return Response.json({ error: 'Form not found' }, { status: 404 });
  }

  return Response.json(schema);
}
