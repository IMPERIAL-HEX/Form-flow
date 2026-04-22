import { deleteSession, getSession, updateSession } from '@/lib/sessions/sessionStore';

const TOKEN_PATTERN = /^[a-f0-9]{32}$/;

interface RouteContext {
  params: Promise<{ token: string }>;
}

function assertToken(token: string): Response | null {
  if (!TOKEN_PATTERN.test(token)) {
    return Response.json({ success: false, error: 'Invalid session token.' }, { status: 400 });
  }
  return null;
}

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  const { token } = await context.params;
  const invalid = assertToken(token);
  if (invalid) return invalid;

  const draft = getSession(token);
  if (!draft) {
    return Response.json({ success: false, error: 'Session not found.' }, { status: 404 });
  }
  return Response.json({ success: true, draft });
}

export async function PUT(request: Request, context: RouteContext): Promise<Response> {
  const { token } = await context.params;
  const invalid = assertToken(token);
  if (invalid) return invalid;

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
  const result = updateSession(token, { stepId: input.stepId, values: input.values });
  if (!result.ok) {
    if (result.reason === 'not-found') {
      return Response.json({ success: false, error: 'Session not found.' }, { status: 404 });
    }
    return Response.json(
      { success: false, error: result.error?.message ?? 'Invalid session input.' },
      { status: 400 },
    );
  }

  return Response.json({ success: true, draft: result.draft });
}

export async function DELETE(_request: Request, context: RouteContext): Promise<Response> {
  const { token } = await context.params;
  const invalid = assertToken(token);
  if (invalid) return invalid;

  const removed = deleteSession(token);
  if (!removed) {
    return Response.json({ success: false, error: 'Session not found.' }, { status: 404 });
  }
  return Response.json({ success: true });
}
