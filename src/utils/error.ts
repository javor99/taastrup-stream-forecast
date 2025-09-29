// Utility to extract meaningful error messages from Supabase Edge Function errors
// Always return the most helpful text we can find so UI can render it to users
export function getEdgeFunctionErrorMessage(err: unknown, fallback = 'Request failed'): string {
  try {
    const e = err as any;
    const status = e?.status ?? e?.code;

    // Supabase Functions errors often include a `context` with the response body
    // Try to drill into it and find an error message
    let body: any = e?.context?.body ?? e?.context ?? null;

    // If body is a string, try to parse JSON
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        // keep as string
      }
    }

    // Sometimes the SDK puts the parsed body directly as `e.context`
    if (!body && typeof e?.message === 'string') {
      // Last resort: if message itself contains JSON
      try {
        const parsed = JSON.parse(e.message);
        body = parsed;
      } catch {
        // ignore
      }
    }

    const parts: string[] = [];

    if (status) parts.push(String(status));

    // Prefer common fields returned by our Edge Functions
    const msg =
      body?.error?.message ??
      body?.error_description ??
      body?.error ??
      body?.details ??
      body?.message ??
      (typeof body === 'string' ? body : undefined) ??
      (typeof e?.message === 'string' ? e.message : undefined) ??
      undefined;

    if (msg) parts.push(String(msg));

    const text = parts.join(' ').trim();
    return text.length > 0 ? text : fallback;
  } catch {
    return fallback;
  }
}
