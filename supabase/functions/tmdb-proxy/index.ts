// Deploy this as the `tmdb-proxy` Supabase Edge Function.
// Set TMDB_API_KEY as a Supabase Edge Function secret; never place it in the browser app.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const CACHE_TTL_MS = 5 * 60 * 1000;
const RATE_LIMIT = 60;
const cache = new Map<string, { body: string; status: number; expiresAt: number }>();
const usage = new Map<string, { count: number; resetAt: number }>();

const isAllowedEndpoint = (endpoint: string) => (
  /^\/trending\/(all|movie|tv)\/(day|week)(\?.*)?$/.test(endpoint) ||
  /^\/(movie\/(popular|upcoming)|tv\/(popular|on_the_air))(\?.*)?$/.test(endpoint) ||
  /^\/discover\/tv\?.*$/.test(endpoint) ||
  /^\/search\/multi\?.*$/.test(endpoint) ||
  /^\/(movie|tv)\/\d+(\?.*)?$/.test(endpoint) ||
  /^\/tv\/\d+\/season\/\d+(\?.*)?$/.test(endpoint)
);

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders });

  const caller = request.headers.get('Authorization') || 'anonymous';
  const now = Date.now();
  const record = usage.get(caller) || { count: 0, resetAt: now + 60_000 };
  if (now > record.resetAt) { record.count = 0; record.resetAt = now + 60_000; }
  record.count += 1;
  usage.set(caller, record);
  if (record.count > RATE_LIMIT) return Response.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429, headers: corsHeaders });

  try {
    const { endpoint } = await request.json();
    if (typeof endpoint !== 'string' || endpoint.length > 500 || !isAllowedEndpoint(endpoint)) {
      return Response.json({ error: 'Unsupported TMDB endpoint.' }, { status: 400, headers: corsHeaders });
    }

    const cached = cache.get(endpoint);
    if (cached && cached.expiresAt > now) return new Response(cached.body, { status: cached.status, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'HIT' } });

    const tmdbKey = Deno.env.get('TMDB_API_KEY');
    if (!tmdbKey) return Response.json({ error: 'TMDB proxy is not configured.' }, { status: 503, headers: corsHeaders });
    const target = new URL(`https://api.themoviedb.org/3${endpoint}`);
    target.searchParams.delete('api_key');
    target.searchParams.set('api_key', tmdbKey);
    const response = await fetch(target);
    const body = await response.text();
    if (response.ok) cache.set(endpoint, { body, status: response.status, expiresAt: now + CACHE_TTL_MS });
    return new Response(body, { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'MISS' } });
  } catch {
    return Response.json({ error: 'Unable to fetch TMDB data.' }, { status: 502, headers: corsHeaders });
  }
});
