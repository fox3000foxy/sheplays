"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function StartClient() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref");
  const [referrerInfo, setReferrerInfo] = useState<any>(null);
  const [isValidCode, setIsValidCode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (refCode) {
      checkReferralCode(refCode);
    }
  }, [refCode]);

  const checkReferralCode = async (code: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/referral/get-referrer/${code.toUpperCase()}`);
      const data = await res.json();

      if (res.ok) {
        setReferrerInfo(data);
        setIsValidCode(true);
        // Stocker le code dans le localStorage pour l'utiliser plus tard
        localStorage.setItem("referral_code", code.toUpperCase());
      } else {
        setIsValidCode(false);
      }
    } catch (error) {
      console.error("Error checking referral code:", error);
      setIsValidCode(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (!refCode) {
    return null; // Si pas de code, retourne rien (la page normale s'affichera)
  }

  return (
    <div className="mb-8">
      {isLoading ? (
        <div className="bg-surface border border-border rounded-lg p-6 text-center">
          <div className="text-muted">Vérification du code de parrainage...</div>
        </div>
      ) : isValidCode && referrerInfo ? (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-shrink-0">
              <img
                src={`/api/discord/avatar/${referrerInfo.referrer_user_id}`}
                alt="Parrain"
                className="w-16 h-16 rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://cdn.discordapp.com/embed/avatars/0.png';
                }}
              />
            </div>
            <div className="flex-1">
              <div className="text-sm text-blue-400 mb-1">✨ Invitation reçue</div>
              <div className="text-lg font-medium">Vous avez été parrainé!</div>
              <div className="text-sm text-muted">Code: <span className="font-mono font-bold">{refCode.toUpperCase()}</span></div>
            </div>
          </div>

          <div className="bg-dark/50 rounded p-4 text-sm text-muted">
            💡 Rejoignez Discord et créez votre profil de talent. Vous pourrez ensuite valider ce code de parrainage dans votre dashboard.
          </div>
        </div>
      ) : (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
          <div className="text-red-400 mb-2">Code de parrainage invalide</div>
          <div className="text-sm text-muted">Le code "{refCode}" n'existe pas ou a expiré.</div>
        </div>
      )}
    </div>
  );
}
