import { getKycEvents } from '@/lib/kyc/verificationService';

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const requestedLimit = Number(url.searchParams.get('limit') ?? '25');

  return Response.json({
    events: getKycEvents(requestedLimit),
  });
}
