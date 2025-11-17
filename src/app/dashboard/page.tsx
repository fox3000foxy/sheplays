import { redirect } from "next/navigation";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import { getSession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await getSession();
  console.log("[DASHBOARD] Session data:", { id: session.id, username: session.username });

  if (!session.id) {
    console.log("[DASHBOARD] No session ID, redirecting to login");
    redirect("/api/auth/login");
  }

  const api = process.env.NEXT_PUBLIC_BOT_API_URL || "";
  let hasPlaymateRole = false;
  let balance = 0;
  try {
    if (api) {
      const headers: Record<string, string> = {};
      if (process.env.NEXT_PUBLIC_DASHBOARD_API_KEY) {
        headers["x-api-key"] = process.env.NEXT_PUBLIC_DASHBOARD_API_KEY as string;
      }
      const [rolesRes, balanceRes] = await Promise.all([
        fetch(`${api}/api/roles/${session!.id}`, { headers, cache: "no-store" }),
        fetch(`${api}/api/balance/${session!.id}`, { headers, cache: "no-store" }),
      ]);
      const rolesJson = await rolesRes.json();
      const balanceJson = await balanceRes.json();
      hasPlaymateRole = !!rolesJson.hasPlaymateRole;
      balance = typeof balanceJson.balance === "number" ? balanceJson.balance : 0;
    }
  } catch {}

  if (hasPlaymateRole) {
    return (
      <div className="bg-dark text-white font-sans min-h-screen flex flex-col">
        <NavBar user={{ id: session.id!, username: session.username!, avatar: session.avatar }} currentPath="/dashboard" />
        <div className="max-w-6xl mx-auto px-6 pt-24 flex-1">
          <h1 className="text-2xl font-semibold">Espace Playmate</h1>
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <section className="p-4 border border-border rounded">
              <h2 className="text-lg font-medium mb-3">Profil</h2>
              <p className="text-sm text-muted">Gère ton pseudo, bio, jeux, langues et style.</p>
            </section>
            <section className="p-4 border border-border rounded">
              <h2 className="text-lg font-medium mb-3">Calendrier</h2>
              <p className="text-sm text-muted">Définis tes disponibilités via un calendrier clair.</p>
            </section>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  async function createCheckout() {
    "use server";
    const apiUrl = process.env.NEXT_PUBLIC_BOT_API_URL || "";
    const apiKey = process.env.NEXT_PUBLIC_DASHBOARD_API_KEY || "";
    if (!apiUrl) redirect("/");
    const res = await fetch(`${apiUrl}/api/checkout/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(apiKey ? { "x-api-key": apiKey } : {}) },
      body: JSON.stringify({ userId: session!.id, amount: 1000 }),
    });
    const json = await res.json();
    redirect(json.url);
  }

  return (
    <div className="bg-dark text-white font-sans min-h-screen flex flex-col">
      <NavBar user={{ id: session.id!, username: session.username!, avatar: session.avatar }} currentPath="/dashboard" />
      <div className="max-w-6xl mx-auto px-6 pt-24 flex-1">
        <h1 className="text-2xl font-semibold">Ton compte</h1>
        <div className="mt-4 p-4 border border-border rounded">
          <p className="text-sm">Balance: <strong>{(balance / 100).toFixed(2)}€</strong></p>
          <form action={createCheckout}>
            <button className="mt-3 px-4 py-2 bg-white text-dark text-sm rounded hover:bg-white/90">Ajouter des crédits</button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}