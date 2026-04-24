import {
  deleteSchema,
  getSchema,
  updateSchema,
  validateSchemaPayload,
} from '@/lib/builder/schemaStore';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  const { id } = await context.params;
  const stored = getSchema(id);
  if (!stored) {
    return Response.json({ error: 'Schema not found.' }, { status: 404 });
  }
  return Response.json({ stored });
}

export async function PUT(request: Request, context: RouteContext): Promise<Response> {
  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const validation = validateSchemaPayload(body);
  if (!validation.ok) {
    return Response.json(
      { error: validation.error.message, field: validation.error.field },
      { status: 400 },
    );
  }

  const result = updateSchema(id, validation.schema);
  if (!result.ok) {
    if (result.reason === 'not-found') {
      return Response.json({ error: 'Schema not found.' }, { status: 404 });
    }
    return Response.json(
      { error: 'Schema id in body does not match route id.' },
      { status: 400 },
    );
  }

  return Response.json({ success: true, stored: result.stored });
}

export async function DELETE(_request: Request, context: RouteContext): Promise<Response> {
  const { id } = await context.params;
  const removed = deleteSchema(id);
  if (!removed) {
    return Response.json({ error: 'Schema not found.' }, { status: 404 });
  }
  return Response.json({ success: true });
}
