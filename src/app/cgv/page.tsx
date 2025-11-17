import Footer from "../../components/Footer";
import NavBar from "../../components/NavBar";
import { cookies } from "next/headers";

export default async function CgvPage() {
  let user: { id: string; username: string; avatar?: string | null } | undefined;
  try {
    const store = await cookies();
    const cookie = store.get("sp_session")?.value;
    if (cookie) user = JSON.parse(cookie);
  } catch {}
  return (
    <div className="bg-dark text-white font-sans">
      <NavBar user={user} />

      <main className="pt-20 px-6">
        <section className="py-16 max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 animate-in">CONDITIONS GÉNÉRALES DE VENTE (CGV) — SHEPLAYS</h1>
          <p className="text-muted mb-2">Dernière mise à jour : 2025</p>

          <div className="space-y-6 text-muted leading-relaxed animate-in delay-1">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">1. OBJET</h2>
              <p>
                Les présentes Conditions Générales de Vente (CGV) définissent les modalités de vente des services proposés par ShePlays aux utilisateurs : achat de crédits, réservation de sessions de jeu vidéo avec des talents.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">2. PRIX</h2>
              <p>
                Les prix des services (par exemple : sessions de 15, 30 ou 60 minutes) sont indiqués en euros, toutes taxes comprises (TTC), sauf indication contraire. ShePlays se réserve le droit de modifier les prix à tout moment, mais les sessions seront facturées sur la base des tarifs en vigueur au moment de la validation de la commande.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">3. MOYENS DE PAIEMENT</h2>
              <p>
                Les paiements sont effectués via des prestataires de paiement tiers sécurisés (ex : Stripe). L’utilisateur peut être amené à accepter les conditions du prestataire de paiement concerné.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">4. CRÉDITS</h2>
              <p>
                Les utilisateurs peuvent acheter des crédits, qui sont ensuite utilisés pour réserver des sessions avec des talents. Les crédits ne constituent pas un moyen de paiement autonome et ne sont pas une monnaie électronique. Ils représentent un droit d’usage sur la plateforme ShePlays.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">5. VALIDITÉ ET NON-REMBOURSEMENT DES CRÉDITS</h2>
              <p>
                Sauf indication contraire, les crédits achetés ne sont ni remboursables ni convertibles en argent. En cas de fermeture du compte pour non-respect des CGU, les crédits restants ne donnent droit à aucun remboursement.
              </p>
              <p className="mt-2">
                En cas de problème technique avéré, d’annulation de session par un talent ou de défaut de prestation, ShePlays pourra, à sa discrétion, proposer :
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>un remboursement partiel ou total</li>
                <li>un avoir sous forme de crédits</li>
                <li>une reprogrammation de session.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">6. PROCESSUS DE RÉSERVATION</h2>
              <p>
                La réservation d’une session se fait via le bot Discord ou l’interface fournie par ShePlays. L’utilisateur choisit un talent, une durée et une plage horaire. La réservation est confirmée lorsque :
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>les crédits nécessaires sont disponibles</li>
                <li>la session est validée par la plateforme.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">7. ANNULATION</h2>
              <p>
                Les conditions d’annulation (par l’utilisateur ou par le talent) peuvent être précisées dans un document complémentaire ou une page dédiée. À défaut :
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>si l’utilisateur annule tardivement, les crédits peuvent être partiellement ou totalement perdus</li>
                <li>si le talent annule, ShePlays pourra proposer un remboursement en crédits ou une reprogrammation.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">8. RÉMUNÉRATION DES TALENTS</h2>
              <p>
                Une partie du prix de la session est reversée au talent conformément au modèle économique de la plateforme (par exemple 55 % talent / 45 % ShePlays). Les modalités exactes de reversement aux talents sont définies dans leurs contrats de collaboration et ne concernent pas directement l’utilisateur final.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">9. RÉCLAMATIONS</h2>
              <p>
                Toute réclamation liée à une session (comportement, qualité, problème technique) doit être adressée à : <a href="mailto:support@sheplays.wtf" className="underline">support@sheplays.wtf</a> dans un délai raisonnable après la session. ShePlays examinera la réclamation et proposera, le cas échéant, une solution adaptée.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">10. RESPONSABILITÉ</h2>
              <p>
                ShePlays agit en qualité d’intermédiaire de mise en relation. La responsabilité de ShePlays ne saurait être engagée pour les dommages résultant directement d’un comportement entre utilisateurs et talents, sauf faute avérée ou manquement grave aux obligations de sécurité.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">11. LOI APPLICABLE</h2>
              <p>
                Les présentes CGV sont soumises au droit français. Tout litige sera soumis aux tribunaux compétents du ressort de Bourg-en-Bresse.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">12. ABSENCE DU CLIENT ET FRAIS DE COMPENSATION</h2>
              <p>
                En cas d’absence du client au rendez-vous réservé (no-show) et lorsqu’un remboursement est accordé, une retenue forfaitaire de 10% est appliquée sur le montant remboursé. Cette retenue constitue un frais de compensation visant à dédommager le talent pour le temps bloqué et préparé.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}