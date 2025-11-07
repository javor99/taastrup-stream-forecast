const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const API_BASE_URL = 'https://aquamonitor.eu/api';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { path, method = 'GET', data, headers: requestHeaders } = await req.json();
    
    console.log(`[auth-proxy] ${method} ${path}`);
    
    // Construct the upstream URL
    const upstreamUrl = `${API_BASE_URL}/${path}`;
    
    // Prepare headers for upstream request
    const upstreamHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add any additional headers from the request
    if (requestHeaders) {
      Object.assign(upstreamHeaders, requestHeaders);
    }

    // Make the upstream request
    const upstreamResponse = await fetch(upstreamUrl, {
      method,
      headers: upstreamHeaders,
      body: data ? JSON.stringify(data) : undefined,
    });

    // Get the response data
    let responseData;
    const contentType = upstreamResponse.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await upstreamResponse.json();
    } else {
      const textResponse = await upstreamResponse.text();
      // Try to parse as JSON, fallback to error object
      try {
        responseData = JSON.parse(textResponse);
      } catch {
        responseData = {
          success: false,
          error: 'Upstream returned non-JSON response',
          status: upstreamResponse.status,
          bodyPreview: textResponse.substring(0, 200)
        };
      }
    }

    // Return the response with CORS headers
    return new Response(JSON.stringify(responseData), {
      status: upstreamResponse.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Auth proxy error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Proxy request failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
});