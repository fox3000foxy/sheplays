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
  const clientId = process.env.DISCORD_CLIENT_ID || "1439769458137763880";
  const siteUrl = getBaseUrl(req);
  const redirectUri = encodeURIComponent(`${siteUrl}/api/auth/callback`);
  const scope = "identify";
  const authUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
  return NextResponse.redirect(authUrl);
}