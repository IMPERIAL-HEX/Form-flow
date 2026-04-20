import { getAnalyticsOverview } from '@/lib/analytics/submissionsStore';

export async function GET(): Promise<Response> {
  return Response.json(getAnalyticsOverview());
}
