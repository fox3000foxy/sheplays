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

  return <NavBarClient user={user} currentPath={currentPath} />;
}
