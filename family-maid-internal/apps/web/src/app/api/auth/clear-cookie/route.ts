// POST /api/auth/clear-cookie — xóa refresh_token cookie phía Next.js
// Dùng khi API logout fail (token hết hạn) để tránh middleware redirect loop

import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('refresh_token', '', {
    path: '/',
    maxAge: 0,
    httpOnly: true,
    sameSite: 'lax',
  });
  return res;
}
