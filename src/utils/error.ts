// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2025 Your Name
// Part of AquaMonitor/InnoTech-TaskForce. See LICENSE for license terms.

// Utility to extract meaningful error messages from Supabase Edge Function errors
// Always return the most helpful text we can find so UI can render it to users
export function getEdgeFunctionErrorMessage(err: unknown, fallback = 'Request failed'): string {
  try {
    const e = err as any;
    const status = e?.status ?? e?.code ?? e?.context?.status;
    const statusText = e?.statusText ?? e?.context?.statusText;

    // Supabase Functions errors often include a `context` object
    const ctx = e?.context ?? {};

    // Try to extract a body from common locations
    let body: any = ctx?.body ?? ctx?.response?.body ?? ctx ?? null;

    // If body is a string, try to parse JSON
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        // keep as string
      }
    }

    // Sometimes the SDK puts the parsed body directly as `e.message`
    if (!body && typeof e?.message === 'string') {
      // Last resort: if message itself contains JSON
      try {
        const parsed = JSON.parse(e.message);
        body = parsed;
      } catch {
        // ignore
      }
    }

    const bodyPreview: string | undefined = ctx?.bodyPreview;
    const ctxError: string | undefined = ctx?.error;

    // Prefer common fields returned by our Edge Functions
    let msg: string | undefined =
      body?.error?.message ??
      body?.error_description ??
      body?.error ??
      body?.details ??
      body?.message ??
      ctxError ??
      (typeof bodyPreview === 'string' ? bodyPreview : undefined) ??
      (typeof body === 'string' ? body : undefined) ??
      (typeof e?.message === 'string' ? e.message : undefined) ??
      undefined;

    // If the message is raw HTML, replace with a friendly upstream message
    const isHtml = typeof msg === 'string' && /<\/?(html|head|body)[^>]*>/i.test(msg);
    if (isHtml) {
      msg = ctxError || 'Upstream returned non-JSON response';
      if (bodyPreview) {
        const first = bodyPreview.replace(/\s+/g, ' ').trim().slice(0, 160);
        msg = `${msg} - ${first}`;
      }
    }

    // If we only got the generic SDK message, but we have better context, prefer that
    if (msg && /non-2xx status code/i.test(msg)) {
      const better = ctxError ?? (typeof body === 'object' ? (body?.error || body?.message) : undefined) ?? bodyPreview;
      if (better) msg = String(better);
    }

    const parts: string[] = [];
    if (status) parts.push(String(status));
    if (statusText) parts.push(String(statusText));
    if (msg) parts.push(String(msg));

    const text = parts.join(' ').trim();

    // Avoid returning extremely long HTML/error blobs
    const clean = text.replace(/\s+/g, ' ').slice(0, 220);
    return clean.length > 0 ? clean : fallback;
  } catch {
    return fallback;
  }
}
