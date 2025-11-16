import Footer from "../../components/Footer";
import NavBar from "../../components/NavBar";

export default function DisclaimerMineursPage() {
  return (
    <div className="bg-dark text-white font-sans">
      <NavBar />

      <main className="pt-20 px-6">
        <section className="py-16 max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 animate-in">DISCLAMER MINEURS — SHEPLAYS</h1>
          <p className="text-muted mb-2">Dernière mise à jour : 2025</p>

          <div className="space-y-6 text-muted leading-relaxed animate-in delay-1">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">1. INTERDICTION AUX MINEURS EN TANT QUE TALENTS</h2>
              <p>
                Le service ShePlays est strictement réservé aux personnes majeures (18 ans révolus) pour toute activité de talent (prestataire). Aucun profil talent mineur n’est accepté. Une vérification de l’âge peut être demandée, notamment via un document d’identité.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">2. UTILISATION DU SERVICE PAR DES MINEURS</h2>
              <p>
                L’accès au site ou au serveur Discord ShePlays par des personnes mineures est possible uniquement en lecture/visite libre, et sous la responsabilité de leurs parents ou représentants légaux. En revanche, les mineurs ne peuvent pas :
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>s’inscrire en tant que talents</li>
                <li>proposer des services</li>
                <li>percevoir des rémunérations via ShePlays.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">3. CONTENUS ET INTERACTIONS</h2>
              <p>
                ShePlays est un service orienté gaming, non sexuel, non romantique et non destiné au dating. Tout comportement inapproprié, en particulier envers des personnes mineures, est strictement interdit et peut donner lieu à une suspension définitive et, le cas échéant, à un signalement aux autorités compétentes.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">4. RESPONSABILITÉ PARENTALE</h2>
              <p>
                Les parents ou tuteurs légaux sont responsables de l’usage d’Internet et des services en ligne par leurs enfants. ShePlays recommande aux parents de surveiller l’utilisation des services Discord et de sensibiliser les mineurs aux risques en ligne.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">5. SIGNALER UN CONTENU OU COMPORTEMENT</h2>
              <p>
                Tout contenu ou comportement suspect impliquant un mineur peut être signalé à : <a href="mailto:support@sheplays.wtf" className="underline">support@sheplays.wtf</a>. ShePlays pourra prendre les mesures nécessaires (ban, collecte de logs, signalement éventuel).
              </p>
            </div>

            <p className="italic">FIN DU DISCLAMER MINEURS</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}