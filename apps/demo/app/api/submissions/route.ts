import { recordSubmission } from '@/lib/analytics/submissionsStore';

export async function POST(request: Request): Promise<Response> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json(
      {
        success: false,
        error: 'Invalid JSON payload.',
      },
      { status: 400 },
    );
  }

  console.log('[FormFlow Submission]', JSON.stringify(payload, null, 2));

  const record = recordSubmission(payload);

  return Response.json({
    success: true,
    id: record.id,
    receivedAt: record.receivedAt,
  });
}
