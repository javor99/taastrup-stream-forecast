// Supabase Edge Function: stream-proxy
// Proxies requests to the external Water Level Predictions API with proper CORS

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const BASE_URL = 'https://unfluctuating-kayleigh-retractively.ngrok-free.dev/api';

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
    let method = 'GET';
    let postData = null;
    let extraHeaders: Record<string, string> | null = null;

    if (contentType.includes('application/json')) {
      const body = await req.json().catch(() => ({}));
      path = body?.path || '';
      method = body?.method || 'GET';
      postData = body?.data || null;
      extraHeaders = body?.headers || null;
    }

    if (!path) {
      // Try query param fallback
      const url = new URL(req.url);
      path = url.searchParams.get('path') || '';
    }

    // Allow dynamic paths for station updates and auth endpoints
    const pathSegments = path.split('/');
    const isStationMinMaxPath = pathSegments.length === 3 && pathSegments[0] === 'stations' && pathSegments[2] === 'minmax';
    const isAuthPath = pathSegments[0] === 'auth';
    const allowed = new Set(['stations', 'water-levels', 'predictions', 'summary', 'municipalities', 'auth']);
    
    if (!allowed.has(pathSegments[0]) && !isStationMinMaxPath && !isAuthPath) {
      return jsonResponse({ success: false, error: 'Invalid or missing path' }, 400);
    }

    console.log(`[stream-proxy] ${method} ${path}`);
    
    const fetchOptions: RequestInit = {
      method: method,
      headers: { 
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        ...(extraHeaders || {})
      }
    };

    if (method !== 'GET' && postData) {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        'Content-Type': 'application/json'
      };
      fetchOptions.body = JSON.stringify(postData);
    }

    const upstream = await fetch(`${BASE_URL}/${path}`, fetchOptions);

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