import { createSession, validateSessionInput } from '@/lib/sessions/sessionStore';

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, error: 'Invalid JSON payload.' }, { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return Response.json({ success: false, error: 'Body must be an object.' }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const validation = validateSessionInput({
    formId: input.formId,
    stepId: input.stepId,
    values: input.values,
  });

  if (!validation.ok) {
    return Response.json(
      { success: false, error: validation.error.message, field: validation.error.field },
      { status: 400 },
    );
  }

  const draft = createSession(validation.data);
  return Response.json({ success: true, draft }, { status: 201 });
}
