import { NextRequest, NextResponse } from "next/server";

function getBaseUrl(req: NextRequest): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  if (host) {
    return `${proto}://${host}`;
  }
  return new URL(req.url).origin;
}

export async function GET(req: NextRequest) {
  const baseUrl = getBaseUrl(req);
  const res = NextResponse.redirect(new URL("/", baseUrl));

  // Supprimer le cookie sp_session
  res.cookies.delete({
    name: "sp_session",
    path: "/",
    domain: process.env.AUTH_COOKIE_DOMAIN || ".sheplays.wtf",
  });

  // Alternative: set avec maxAge négatif pour être sûr
  res.cookies.set("sp_session", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: -1,
    expires: new Date(0),
    domain: process.env.AUTH_COOKIE_DOMAIN || ".sheplays.wtf",
  });

  return res;
}