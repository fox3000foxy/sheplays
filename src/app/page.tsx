import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-dark text-white font-sans">
      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 border-b border-border bg-dark/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/images/logo.svg" alt="ShePlays" style={{ height: "48px" }} />
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-muted">
            <Link href="#how" className="hover:text-white transition">Fonctionnement</Link>
            <Link href="#games" className="hover:text-white transition">Jeux</Link>
            <Link href="#pricing" className="hover:text-white transition">Tarifs</Link>
          </div>

          <Link href="#start" className="px-5 py-2 bg-white text-dark text-sm font-medium rounded hover:bg-white/90 transition hover-lift">
            Rejoindre
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-20 pb-0 px-6 relative">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-end">
          <div className="max-w-3xl space-y-8 pb-10 md:pb-16">
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none animate-in">
              Trouve ta coéquipière.<br />
              <span className="gradient-text">Joue mieux. Rage moins. Kiffe plus.</span>
            </h1>

            <p className="text-xl text-muted max-w-2xl leading-relaxed animate-in delay-1">
              ShePlays connecte des joueuses vérifiées pour des sessions courtes et qualitatives.
              Pas de drague. Pas de toxicité. Juste du gaming.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-in delay-2">
              <Link href="#start" className="px-8 py-4 bg-white text-dark font-semibold rounded hover:bg-white/90 transition hover-lift text-center">
                Découvrir les joueuses
              </Link>

              <Link href="#how" className="px-8 py-4 border border-border hover:border-muted font-semibold rounded transition hover-lift text-center">
                Comment ça marche
              </Link>
            </div>
          </div>

          {/* Image alignée en bas */}
          <div className="relative animate-in delay-3 flex justify-center">
            <img
              src="/images/hero.png"
              alt="Joueuse ShePlays"
              style={{height: 700, width: 700, minWidth: 700}}

              className="w-full max-w-lg drop-shadow-2xl select-none pointer-events-none"
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

      {/* HOW IT WORKS */}
      <section id="how" className="py-32 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-20">Comment ça marche</h2>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-surface rounded flex items-center justify-center font-bold text-xl">1</div>
              <h3 className="text-2xl font-bold">Choisis une joueuse</h3>
              <p className="text-muted leading-relaxed">
                Parcours les profils disponibles. Niveau, jeu, style de jeu, langue.
                Tout est transparent.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-surface rounded flex items-center justify-center font-bold text-xl">2</div>
              <h3 className="text-2xl font-bold">Réserve ta session</h3>
              <p className="text-muted leading-relaxed">
                15, 30 ou 60 minutes. Paiement sécurisé Stripe.
                Confirmation instantanée sur Discord.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-surface rounded flex items-center justify-center font-bold text-xl">3</div>
              <h3 className="text-2xl font-bold">Joue et déconnecte</h3>
              <p className="text-muted leading-relaxed">
                Rejoins le vocal privé. Joue ta session. Terminé.
                Pas de follow-up, pas de pression.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* GAMES GRID */}
      <section id="games" className="py-32 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-12 gap-4">
            <h2 className="text-4xl md:text-5xl font-bold">Jeux disponibles</h2>
            <span className="text-muted text-sm md:text-base">Mis à jour mensuellement</span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-8 bg-surface rounded-lg hover:bg-surface/80 transition cursor-pointer hover-lift">
              <h3 className="text-2xl font-bold mb-2">Valorant</h3>
              <p className="text-muted mb-4">Ranked • Tryhard • Chill</p>
              <div className="text-sm text-muted">12 joueuses disponibles</div>
            </div>

            <div className="p-8 bg-surface rounded-lg hover:bg-surface/80 transition cursor-pointer hover-lift">
              <h3 className="text-2xl font-bold mb-2">Fortnite</h3>
              <p className="text-muted mb-4">Battle Royale • Creative • Ranked</p>
              <div className="text-sm text-muted">8 joueuses disponibles</div>
            </div>

            <div className="p-8 bg-surface rounded-lg hover:bg-surface/80 transition cursor-pointer hover-lift">
              <h3 className="text-2xl font-bold mb-2">Call of Duty</h3>
              <p className="text-muted mb-4">Multiplayer • Warzone</p>
              <div className="text-sm text-muted">6 joueuses disponibles</div>
            </div>

            <div className="p-8 bg-surface rounded-lg hover:bg-surface/80 transition cursor-pointer hover-lift">
              <h3 className="text-2xl font-bold mb-2">Genshin Impact</h3>
              <p className="text-muted mb-4">Co-op • Exploration</p>
              <div className="text-sm text-muted">4 joueuses disponibles</div>
            </div>
          </div>
        </div>
      </section>

      {/* SAFETY */}
      <section className="py-32 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">Sécurité et respect</h2>

          <p className="text-xl text-muted leading-relaxed max-w-2xl mx-auto">
            Chaque profil est vérifié manuellement. Les vocaux sont enregistrés.
            Le harcèlement est banni définitivement. ShePlays est un espace safe, point final.
          </p>

          <div className="grid md:grid-cols-3 gap-8 pt-12">
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

      {/* PRICING */}
      <section id="pricing" className="py-32 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-20 text-center">Tarifs simples</h2>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-8 bg-surface rounded-lg border border-border hover:border-muted transition">
              <div className="text-3xl font-bold mb-2">5€</div>
              <div className="text-muted mb-6">15 minutes</div>
              <div className="text-sm text-muted">
                Idéal pour tester<br />
                ou match rapide
              </div>
            </div>

            <div className="p-8 bg-surface rounded-lg border-gradient">
              <div className="relative">
                <div className="text-3xl font-bold mb-2 mt-2">10€</div>
                <div className="text-muted mb-6">30 minutes</div>
                <div className="text-sm text-muted">
                  Session standard<br />
                  2-3 games
                </div>
              </div>
            </div>

            <div className="p-8 bg-surface rounded-lg border border-border hover:border-muted transition">
              <div className="text-3xl font-bold mb-2">18€</div>
              <div className="text-muted mb-6">60 minutes</div>
              <div className="text-sm text-muted">
                Session longue<br />
                4-5 games
              </div>
            </div>
          </div>

          <p className="text-center text-muted mt-12">
            Paiement sécurisé Stripe • Remboursement 24h en cas de problème
          </p>
        </div>
      </section>

      {/* CTA */}
      <section id="start" className="py-32 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-5xl md:text-6xl font-bold">
            Prête à jouer<br />
            sans les conneries ?
          </h2>

          <p className="text-xl text-muted max-w-2xl mx-auto">
            Rejoins la bêta privée. Accès Discord instantané.
            Profils vérifiés. Sessions dispo maintenant.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link href="https://discord.gg/sheplays" className="px-12 py-5 bg-white text-dark font-bold text-lg rounded hover:bg-white/90 transition hover-lift">
              Rejoindre sur Discord
            </Link>
            <span className="text-sm text-muted">Bêta privée • Places limitées</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <img src="/images/logo.svg" alt="ShePlays" style={{ height: "48px" }} />
            </div>

            <div className="flex gap-8 text-sm text-muted">
              <Link href="#" className="hover:text-white transition">Discord</Link>
              <Link href="#" className="hover:text-white transition">Twitter</Link>
              <Link href="#" className="hover:text-white transition">Conditions</Link>
              <Link href="#" className="hover:text-white transition">Confidentialité</Link>
            </div>

            <div className="text-sm text-muted">
              © 2025 ShePlays
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
