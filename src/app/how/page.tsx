import Footer from "../../components/Footer";
import NavBar from "../../components/NavBar";

export default function HowPage() {
  return (
    <div className="bg-dark text-white font-sans">
      <NavBar />

      <main className="pt-20 px-6">
        <section className="py-32 max-w-6xl mx-auto">
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
        </section>
      </main>

      <Footer />
    </div>
  );
}
