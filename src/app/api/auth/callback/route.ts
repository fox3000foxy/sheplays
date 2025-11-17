import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

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
    const sessionData = { id: user.id, username: user.username, avatar: user.avatar };
    console.log("[AUTH CALLBACK] Setting session with data:", sessionData);

    // Utiliser iron-session pour gérer le cookie
    const session = await getSession();
    session.id = sessionData.id;
    session.username = sessionData.username;
    session.avatar = sessionData.avatar;
    await session.save();

    console.log("[AUTH CALLBACK] Session saved, redirecting to dashboard");
    return NextResponse.redirect(new URL("/dashboard", baseUrl));
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return NextResponse.redirect(new URL("/", baseUrl));
  }
}