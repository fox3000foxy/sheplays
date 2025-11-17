import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";
import NavBarClient from "./NavBarClient";

type User = { id: string; username: string; avatar?: string | null };

export default async function NavBar({ user, currentPath }: { user?: User; currentPath?: string }) {
  if (!user) {
    try {
      const store = await cookies();
      const cookie = store.get("sp_session")?.value;
      if (cookie) {
        const payload = verifyJwt(cookie, process.env.AUTH_JWT_SECRET || "dev-secret-change-me");
        if (payload) {
          user = { id: payload.sub, username: payload.username, avatar: payload.avatar };
        }
      }
    } catch {}
  }

  // Détecter si on est sur la page dashboard
  const isOnDashboard = currentPath?.startsWith("/dashboard") || false;

  const avatarUrl = user?.avatar
    ? (user.avatar.startsWith('http')
        ? user.avatar
        : `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`)
    : `https://cdn.discordapp.com/embed/avatars/0.png`;

  return <NavBarClient user={user} currentPath={currentPath} />;
}
