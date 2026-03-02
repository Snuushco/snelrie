import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const VARIANTS = ['a', 'b', 'c'] as const;
const COOKIE_NAME = 'ab-variant';
const COOKIE_MAX_AGE = 30 * 86400; // 30 days

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const existing = request.cookies.get(COOKIE_NAME)?.value;

  if (!existing || !VARIANTS.includes(existing as any)) {
    const variant = VARIANTS[Math.floor(Math.random() * VARIANTS.length)];
    response.cookies.set(COOKIE_NAME, variant, {
      maxAge: COOKIE_MAX_AGE,
      path: '/',
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  matcher: '/',
};
