import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

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

  // Détruire la session iron-session
  const session = await getSession();
  session.destroy();

  return NextResponse.redirect(new URL("/", baseUrl));
}