import { verifySubmissionKyc } from '@/lib/kyc/verificationService';

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

  const verification = verifySubmissionKyc(payload);

  return Response.json({
    success: true,
    verification,
  });
}
