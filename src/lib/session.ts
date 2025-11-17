import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export type SessionData = {
  id: string;
  username: string;
  avatar?: string | null;
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, {
    password: process.env.SESSION_SECRET || "complex_password_at_least_32_characters_long_for_security",
    cookieName: "sheplays_auth",
    cookieOptions: {
      secure: true, // Toujours en HTTPS
      httpOnly: false, // Désactivé pour contourner Cloudflare
      sameSite: "lax", // Lax fonctionne mieux avec navigations same-site
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: "/",
    },
  });
}
