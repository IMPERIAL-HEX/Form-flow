import {
  createSchema,
  listSchemas,
  validateSchemaPayload,
} from '@/lib/builder/schemaStore';

export async function GET(): Promise<Response> {
  return Response.json({ schemas: listSchemas() });
}

export async function POST(request: Request): Promise<Response> {
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

  const stored = createSchema(validation.schema);
  return Response.json({ success: true, stored }, { status: 201 });
}
