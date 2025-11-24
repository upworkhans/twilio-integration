import { NextRequest, NextResponse } from 'next/server';

export function json(data: unknown, init?: number | ResponseInit) {
  const status = typeof init === 'number' ? init : undefined;
  const initObj = typeof init === 'object' ? init : undefined;
  return NextResponse.json(data as any, { status: status ?? 200, ...(initObj ?? {}) });
}

export function getRequestIp(req: NextRequest): string {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.ip || 'unknown';
  return ip;
}

export function badRequest(message: string) {
  return json({ error: message }, 400);
}

export function unauthorized(message = 'Unauthorized') {
  return json({ error: message }, 401);
}

export function tooManyRequests() {
  return json({ error: 'Too many requests' }, 429);
}


