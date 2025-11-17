"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SessionUser = { id: string; username: string; avatar?: string | null };

interface DashboardClientProps {
  user: SessionUser;
  currentPath?: string;
}

export default function DashboardClient({ user: initialUser }: DashboardClientProps) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(initialUser);
  const [balance, setBalance] = useState<number>(0);
  const [availability, setAvailability] = useState<Record<number, string[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [isTalent, setIsTalent] = useState<boolean>(false);
  const [creditAmount, setCreditAmount] = useState<number>(5);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    if (!initialUser) {
      router.push("/api/auth/login");
      return;
    }

    (async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (!res.ok) {
          router.push("/api/auth/login");
          return;
        }
        const u = await res.json();
        setUser(u);

        // Vérifier si l'utilisateur est un talent
        const talentCheckRes = await fetch(`/api/db/talent/check/${u.id}`);
        const talentCheck = await talentCheckRes.json();
        setIsTalent(talentCheck.isTalent || false);

        const bRes = await fetch(`/api/db/balance/${u.id}`);
        const b = await bRes.json();
        setBalance(b.balance || 0);

        // Charger les disponibilités uniquement si c'est un talent
        if (talentCheck.isTalent) {
          const calRes = await fetch(`/api/db/playmate/calendar/${u.id}`);
          const cal = await calRes.json();
          setAvailability(cal.availability || {});
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        router.push("/api/auth/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [initialUser, router]);

  const handleBuyCredits = async () => {
    if (creditAmount < 5) {
      alert("Le montant minimum est de 5€");
      return;
    }

    setIsProcessing(true);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: creditAmount }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la création de la session");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error("Error creating checkout:", error);
      alert(error.message || "Une erreur est survenue");
      setIsProcessing(false);
    }
  };

  const calculateCredits = () => {
    return creditAmount * 100; // 1€ = 100 crédits
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 pt-24 flex-1">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      {loading ? (
        <p className="mt-4 text-sm text-muted">Chargement...</p>
      ) : !user ? (
        <p className="mt-4 text-sm text-muted">Redirection vers la connexion...</p>
      ) : (
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-3">
            <img src={user.avatar || `https://cdn.discordapp.com/embed/avatars/0.png`} alt={user.username} className="h-10 w-10 rounded-full border border-border" />
            <div>
              <div className="text-sm">@{user.username}</div>
              <div className="text-xs text-muted">ID: {user.id}</div>
              {isTalent && (
                <div className="text-xs text-green-400 font-medium mt-1">✓ Talent</div>
              )}
            </div>
          </div>
          <div className="border border-border rounded p-4">
            <div className="text-sm">Crédits</div>
            <div className="text-xl font-medium">{balance}</div>
          </div>

          {/* Section d'achat de crédits - uniquement pour les non-talents */}
          {!isTalent && (
            <div className="border border-border rounded p-4">
              <div className="text-sm font-medium mb-3">Acheter des crédits</div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="amount" className="block text-xs text-muted mb-2">
                    Montant (minimum 5€)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="amount"
                      type="number"
                      min="5"
                      step="1"
                      value={creditAmount}
                      onChange={(e) => setCreditAmount(Math.max(5, parseInt(e.target.value) || 5))}
                      className="flex-1 px-3 py-2 bg-dark border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                    />
                    <span className="text-sm text-muted">€</span>
                  </div>
                  <div className="mt-2 text-xs text-muted">
                    = {calculateCredits()} crédits (1€ = 100 crédits)
                  </div>
                </div>
                <button
                  onClick={handleBuyCredits}
                  disabled={isProcessing || creditAmount < 5}
                  className="w-full px-4 py-2 bg-white text-dark font-medium rounded hover:bg-white/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? "Redirection..." : "Acheter"}
                </button>
              </div>
            </div>
          )}

          {isTalent && (
            <div className="border border-border rounded p-4">
              <div className="text-sm mb-2">Disponibilités</div>
              {Object.keys(availability).length === 0 ? (
                <div className="text-xs text-muted">Aucune disponibilité définie</div>
              ) : (
                <div className="text-xs grid grid-cols-1 gap-2">
                  {Object.entries(availability).map(([w, slots]) => (
                    <div key={w} className="flex gap-2">
                      <span className="min-w-8">{w}</span>
                      <span>{(slots as string[]).join(", ")}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}