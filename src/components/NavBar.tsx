import Link from "next/link";
import { cookies } from "next/headers";

type User = { id: string; username: string; avatar?: string | null };

export default async function NavBar({ user, currentPath }: { user?: User; currentPath?: string }) {
  if (!user) {
    try {
      const store = await cookies();
      const cookie = store.get("sp_session")?.value;
      if (cookie) {
        user = JSON.parse(cookie);
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

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-border bg-dark/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/">
            <img src="/images/logo.svg" alt="ShePlays" style={{ height: "48px" }} />
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-muted">
          <Link href="/how" className="hover:text-white transition">Fonctionnement</Link>
          <Link href="/games" className="hover:text-white transition">Jeux</Link>
          <Link href="/pricing" className="hover:text-white transition">Tarifs</Link>
        </div>

        {!user ? (
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="px-4 py-2 border border-border text-sm rounded hover:border-muted transition hover-lift">
              Se connecter
            </Link>
            <Link href="/start" className="px-5 py-2 bg-white text-dark text-sm font-medium rounded hover:bg-white/90 transition hover-lift">
              Rejoindre
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <img src={avatarUrl} alt={user.username} className="h-8 w-8 rounded-full border border-border" />
            <span className="text-sm text-muted">@{user.username}</span>
            {!isOnDashboard && (
              <Link href="/dashboard" className="px-4 py-2 border border-border text-sm rounded hover:border-muted transition hover-lift">Dashboard</Link>
            )}
            <Link href="/api/auth/logout" className="px-4 py-2 border border-border text-sm rounded hover:border-muted transition hover-lift">Se déconnecter</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
