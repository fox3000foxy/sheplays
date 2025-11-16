import Footer from "../../components/Footer";
import NavBar from "../../components/NavBar";

export default function CguPage() {
  return (
    <div className="bg-dark text-white font-sans">
      <NavBar />

      <main className="pt-20 px-6">
        <section className="py-16 max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 animate-in">CONDITIONS GÉNÉRALES D’UTILISATION (CGU) — SHEPLAYS</h1>
          <p className="text-muted mb-2">Dernière mise à jour : 2025</p>

          <div className="space-y-6 text-muted leading-relaxed animate-in delay-1">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">1. OBJET</h2>
              <p>
                Les présentes Conditions Générales d’Utilisation (CGU) encadrent l’accès et l’utilisation du site ShePlays et des services associés (bot Discord, panels, catalogue de talents, système de sessions vocales, gestion de crédits).
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">2. ACCEPTATION DES CGU</h2>
              <p>
                En accédant au site ou en utilisant ShePlays (site, bot Discord, serveur Discord associé), l’utilisateur reconnaît avoir lu, compris et accepté les présentes CGU sans réserve.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">3. DESCRIPTION DU SERVICE</h2>
              <p>
                ShePlays est une plateforme de mise en relation entre :
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>des “talents” (joueuses majeures, vérifiées, indépendantes)</li>
                <li>des utilisateurs souhaitant réserver des sessions vocales de jeu vidéo.</li>
              </ul>
              <p className="mt-2">
                ShePlays n’est pas un service de dating, de webcam, ni un service à caractère sexuel. Le service est strictement orienté sur le jeu vidéo et l’accompagnement en ligne.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">4. COMPTE UTILISATEUR</h2>
              <p>
                Pour utiliser certains services, l’utilisateur doit disposer d’un compte Discord et rejoindre le serveur ShePlays. L’utilisateur est responsable de la sécurité de son compte et de toute activité effectuée via celui-ci.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">5. COMPORTEMENT ET RÈGLES D’UTILISATION</h2>
              <p>
                L’utilisateur s’engage à :
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>respecter les talents et les autres utilisateurs</li>
                <li>ne pas tenir de propos haineux, discriminatoires, diffamatoires, harcelants ou sexuels</li>
                <li>ne pas solliciter de services autres que le jeu vidéo</li>
                <li>respecter les règles du serveur Discord et les consignes de modération.</li>
              </ul>
              <p className="mt-2">
                Tout manquement peut entraîner : un avertissement, une suspension ou un bannissement définitif de la plateforme.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">6. TALENTS</h2>
              <p>
                Les talents sont des prestataires indépendants, majeurs, vérifiés par ShePlays. Ils gèrent leurs disponibilités et leur participation à la plateforme. ShePlays agit comme intermédiaire et ne constitue pas l’employeur des talents. Aucune relation de subordination n’existe entre ShePlays et les talents.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">7. PAIEMENTS ET CRÉDITS</h2>
              <p>
                L’accès à certains services est payant. Les paiements sont réalisés via des prestataires de paiement tiers (ex : Stripe). Des crédits peuvent être achetés et utilisés pour réserver des sessions. Les modalités de paiement et de remboursement sont précisées dans les CGV.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">8. SÉCURITÉ ET LOGS VOCAUX</h2>
              <p>
                Les sessions vocales peuvent être enregistrées (logs, enregistrements techniques ou partiels) à des fins de sécurité, de preuve en cas de litige et de lutte contre le harcèlement. L’utilisateur en est informé et accepte cet usage.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">9. SUSPENSION ET RÉSILIATION</h2>
              <p>
                ShePlays se réserve le droit de suspendre ou de résilier l’accès d’un utilisateur en cas de non-respect des CGU, de comportement inapproprié ou de risque pour la sécurité de la communauté.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">10. MODIFICATION DES CGU</h2>
              <p>
                ShePlays peut modifier les présentes CGU à tout moment. En cas de modification, la date de mise à jour sera actualisée. L’utilisation du service après modification vaut acceptation des nouvelles CGU.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">11. LOI APPLICABLE</h2>
              <p>
                Les présentes CGU sont soumises au droit français. En cas de litige, les tribunaux du ressort de Bourg-en-Bresse seront compétents.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}