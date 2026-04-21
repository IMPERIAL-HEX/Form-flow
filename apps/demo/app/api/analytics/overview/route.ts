import { getAnalyticsOverview } from '@/lib/analytics/submissionsStore';

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);

  return Response.json(
    getAnalyticsOverview({
      formId: url.searchParams.get('formId') ?? undefined,
      source: url.searchParams.get('source') ?? undefined,
      window: url.searchParams.get('window') ?? undefined,
      kycDecision: url.searchParams.get('kycDecision') ?? undefined,
      kycProvider: url.searchParams.get('kycProvider') ?? undefined,
    }),
  );
}
