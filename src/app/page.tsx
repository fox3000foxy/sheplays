/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import Footer from "../components/Footer";
import NavBar from "../components/NavBar";
import { getSession } from "@/lib/session";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Check if cookie exists in request
  const cookieStore = await cookies();
  const rawCookie = cookieStore.get("sheplays_auth");
  console.log("[HOME PAGE] Raw cookie exists?", rawCookie ? "YES" : "NO");
  console.log("[HOME PAGE] Raw cookie value:", rawCookie?.value?.substring(0, 50));

  const session = await getSession();
  const user = session.id ? { id: session.id, username: session.username, avatar: session.avatar } : undefined;

  console.log("[HOME PAGE] Session user:", user ? "FOUND" : "NOT FOUND", user);
  return (
    <div className="bg-dark text-white font-sans min-h-screen flex flex-col">
      <NavBar user={user} />

      {/* HERO */}
      <section className="pt-20 pb-0 px-6 relative flex-1">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-end">
          <div className="max-w-3xl space-y-8 pb-10 md:pb-16">
            <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-tight animate-in">
              Trouve ta coéquipière.<br />
              <span className="gradient-text">Joue mieux. Rage moins. Kiffe plus.</span>
            </h1>

            <p className="text-base md:text-xl text-muted max-w-2xl leading-relaxed animate-in delay-1">
              ShePlays connecte des joueuses vérifiées pour des sessions courtes et qualitatives.
              Pas de drague. Pas de toxicité. Juste du gaming.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 animate-in delay-2">
              <Link href="/games" className="px-6 md:px-8 py-3 md:py-4 bg-white text-dark font-semibold rounded hover:bg-white/90 transition hover-lift text-center">
                Découvrir les joueuses
              </Link>

              <Link href="/how" className="px-6 md:px-8 py-3 md:py-4 border border-border hover:border-muted font-semibold rounded transition hover-lift text-center">
                Comment ça marche
              </Link>
            </div>
          </div>

          {/* Image alignée en bas */}
          <div className="relative animate-in delay-3 flex justify-center mt-8 md:mt-0">
            <img
              src="/images/hero-new.png"
              alt="Joueuse ShePlays"
              className="w-full max-w-[520px] md:max-w-lg drop-shadow-2xl select-none pointer-events-none h-auto"
            />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="pt-2 pb-0 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 animate-in delay-3 text-center md:text-left">
            <div className="flex flex-col justify-center min-h-[120px]">
              <div className="text-3xl font-bold mb-2">15–60 min</div>
              <div className="text-muted">Sessions courtes et flexibles</div>
            </div>

            <div className="flex flex-col justify-center min-h-[120px]">
              <div className="text-3xl font-bold mb-2">100%</div>
              <div className="text-muted">Profils vérifiés manuellement</div>
            </div>

            <div className="flex flex-col justify-center min-h-[120px]">
              <div className="text-3xl font-bold mb-2">4 jeux</div>
              <div className="text-muted">Valorant, Fortnite, CoD, Genshin</div>
            </div>
          </div>
        </div>
      </section>

      {/* Links: sections moved to dedicated routes: /how, /games, /pricing, /start */}

      {/* SAFETY */}
      <section className="py-20 md:py-32 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold">Sécurité et respect</h2>

          <p className="text-base md:text-xl text-muted leading-relaxed max-w-2xl mx-auto">
            Chaque profil est vérifié manuellement. Les vocaux sont enregistrés.
            Le harcèlement est banni définitivement. ShePlays est un espace safe, point final.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 pt-8 md:pt-12">
            <div className="space-y-2">
              <div className="font-bold text-lg">Vérification ID</div>
              <div className="text-muted text-sm">Check manuel avant activation</div>
            </div>
            <div className="space-y-2">
              <div className="font-bold text-lg">Modération active</div>
              <div className="text-muted text-sm">Équipe dédiée 24/7</div>
            </div>
            <div className="space-y-2">
              <div className="font-bold text-lg">Logs vocaux</div>
              <div className="text-muted text-sm">Toutes les sessions enregistrées</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Games / How / Start moved to their own routes to allow multipage navigation */}

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
