import { predict, validateRatings } from './forest.js';
const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
export async function handlePrediction(request) {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return Response.json({ error: 'Please send the seven ratings as JSON.' }, { status: 415, headers });
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return Response.json({ error: 'Please submit your ratings from this website.' }, { status: 403, headers });
  if (Number(request.headers.get('content-length') || 0) > 4096) return Response.json({ error: 'The request is too large.' }, { status: 413, headers });
  let ratings;
  try {
    const text = await request.text();
    if (text.length > 4096) return Response.json({ error: 'The request is too large.' }, { status: 413, headers });
    ratings = validateRatings(JSON.parse(text));
  } catch (error) {
    return Response.json({ error: error instanceof SyntaxError ? 'Please send valid rating data.' : error instanceof Error ? error.message : 'Please check your ratings.' }, { status: 400, headers });
  }
  try { const result = predict(ratings); return Response.json({ recommendation: result.recommendation }, { headers }); }
  catch { return Response.json({ error: 'Your result is temporarily unavailable. Please try again.' }, { status: 503, headers }); }
}
