// Supabase Edge Function: stream-proxy
// Proxies requests to the external Water Level Predictions API with proper CORS

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const BASE_URL = 'https://d7efeab34df7.ngrok-free.app';

// deno-lint-ignore no-explicit-any
function jsonResponse(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ success: false, error: 'Method not allowed' }, 405);
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    let path = '';

    if (contentType.includes('application/json')) {
      const body = await req.json().catch(() => ({}));
      path = body?.path || '';
    }

    if (!path) {
      // Try query param fallback
      const url = new URL(req.url);
      path = url.searchParams.get('path') || '';
    }

    const allowed = new Set(['stations', 'water-levels', 'predictions', 'summary']);
    if (!allowed.has(path)) {
      return jsonResponse({ success: false, error: 'Invalid or missing path' }, 400);
    }

    console.log('[stream-proxy] Fetching', path);
    const upstream = await fetch(`${BASE_URL}/${path}`, {
      headers: { 'Accept': 'application/json' }
    });

    const upstreamText = await upstream.text();
    let parsed;
    try {
      parsed = JSON.parse(upstreamText);
    } catch (_e) {
      console.error('[stream-proxy] Upstream non-JSON', upstream.status, upstreamText.slice(0, 200));
      return jsonResponse({
        success: false,
        error: 'Upstream returned non-JSON response',
        status: upstream.status,
        bodyPreview: upstreamText.slice(0, 500)
      }, 502);
    }

    return jsonResponse(parsed, upstream.status);
  } catch (e) {
    console.error('[stream-proxy] Error', e);
    return jsonResponse({ success: false, error: String(e) }, 500);
  }
});