export async function POST(request: Request): Promise<Response> {
  const payload = await request.json();

  console.log('[FormFlow Submission]', JSON.stringify(payload, null, 2));

  return Response.json({
    success: true,
    id: crypto.randomUUID(),
  });
}
