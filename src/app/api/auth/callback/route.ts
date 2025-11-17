import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function getBaseUrl(req: NextRequest): string {
  // En priorité, utiliser la variable d'environnement
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // Sinon, détecter depuis les headers (pour reverse proxy)
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto') || 'https';

  if (host) {
    return `${proto}://${host}`;
  }

  // Fallback sur l'URL de la requête
  return new URL(req.url).origin;
}

export async function GET(req: NextRequest) {
  try {
    const baseUrl = getBaseUrl(req);
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    if (!code) return NextResponse.redirect(new URL("/", baseUrl));

    const clientId = process.env.DISCORD_CLIENT_ID || "1439769458137763880";
    const clientSecret = process.env.DISCORD_CLIENT_SECRET || "JzaxKV5N4tmdSUPjA2j-N1lowm3HIJcw";
    const redirectUri = `${baseUrl}/api/auth/callback`;

    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });
    if (!tokenRes.ok) return NextResponse.redirect(new URL("/", baseUrl));

    const token = await tokenRes.json();
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `${token.token_type} ${token.access_token}` },
    });
    if (!userRes.ok) return NextResponse.redirect(new URL("/", baseUrl));

    const user = await userRes.json();
    const avatarUrl = user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`
      : `https://cdn.discordapp.com/embed/avatars/0.png`;

    const header = { alg: "HS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      sub: String(user.id),
      username: String(user.username || ""),
      avatar: avatarUrl,
      iat: now,
      exp: now + 60 * 60 * 24 * 365,
    };
    const base64url = (obj: any) => Buffer.from(JSON.stringify(obj))
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
    const data = `${base64url(header)}.${base64url(payload)}`;
    const secret = process.env.AUTH_JWT_SECRET || "dev-secret-change-me";
    const signature = crypto
      .createHmac("sha256", secret)
      .update(data)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
    const jwt = `${data}.${signature}`;

    const res = NextResponse.redirect(new URL("/dashboard", baseUrl));
    res.cookies.set("sp_session", jwt, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      domain: process.env.AUTH_COOKIE_DOMAIN || ".sheplays.wtf",
    });
    return res;
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return NextResponse.redirect(new URL("/", baseUrl));
  }
}