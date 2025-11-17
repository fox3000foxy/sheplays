import Footer from "../../components/Footer";
import NavBar from "../../components/NavBar";
import { cookies } from "next/headers";

export default async function PrivacyPolicyPage() {
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
          <h1 className="text-3xl md:text-4xl font-bold mb-6 animate-in">POLITIQUE DE CONFIDENTIALITÉ — SHEPLAYS</h1>
          <p className="text-muted mb-2">Dernière mise à jour : 17/11/2025</p>

          <div className="space-y-6 text-muted leading-relaxed animate-in delay-1">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">1. Responsable du traitement</h2>
              <p>Marquez Thomas</p>
              <p>
                Email : <a href="mailto:contact@sheplays.wtf" className="underline">contact@sheplays.wtf</a>
              </p>
              <p>
                Site : <a href="https://sheplays.wtf" target="_blank" rel="noopener noreferrer" className="underline">https://sheplays.wtf</a>
              </p>
              <p className="mt-2">ShePlays (propriété de ONEFIX / Marquez Thomas)</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">2. Données collectées</h2>
              <h3 className="text-lg font-semibold text-white mt-4">2.1. Données fournies volontairement</h3>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Adresse email</li>
                <li>Identifiant Discord (ID, pseudo, avatar)</li>
                <li>Informations de paiement (via Stripe)</li>
                <li>Historique de réservations</li>
                <li>Messages envoyés au support</li>
                <li>Avis et évaluations des talents</li>
                <li>Préférences de jeux et informations de profil</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mt-4">2.2. Données collectées automatiquement</h3>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Adresse IP</li>
                <li>Type d’appareil et navigateur</li>
                <li>Cookies techniques</li>
                <li>Logs serveur (sécurité, performance)</li>
                <li>Informations de connexion Discord lors de l’authentification OAuth2</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mt-4">2.3. Données collectées via des services tiers</h3>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Stripe : informations de transactions (aucune carte bancaire n’est stockée par ShePlays)</li>
                <li>Discord : ID, pseudo, avatar, serveurs communs</li>
                <li>Analytics (si activé) : données anonymisées de navigation</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">3. Finalités de traitement</h2>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Fonctionnement du service</li>
                <li>Création et gestion du compte</li>
                <li>Gestion des réservations et sessions vocales</li>
                <li>Connexion automatique via Discord OAuth2</li>
                <li>Notifications (Discord DM, emails, rappels de session)</li>
                <li>Paiements</li>
                <li>Ajout de crédits</li>
                <li>Paiements sécurisés via Stripe</li>
                <li>Prévention de la fraude</li>
                <li>Sécurité</li>
                <li>Lutte contre les abus et comportements interdits</li>
                <li>Vérification manuelle des profils talents</li>
                <li>Amélioration du service</li>
                <li>Analyse des performances</li>
                <li>Statistiques internes anonymisées</li>
                <li>Support client</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">4. Base légale (RGPD)</h2>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Article 6(1)(b) : exécution du contrat (fonctionnement de ShePlays)</li>
                <li>Article 6(1)(c) : obligations légales (comptabilité, lutte contre la fraude)</li>
                <li>Article 6(1)(f) : intérêt légitime (sécurité, prévention d’abus)</li>
                <li>Article 6(1)(a) : consentement (marketing, cookies non essentiels)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">5. Conservation des données</h2>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Comptes utilisateurs : tant que le compte est actif</li>
                <li>Logs de sécurité : 12 mois</li>
                <li>Données de paiement (Stripe) : selon obligation légale (5 à 10 ans)</li>
                <li>Conversations Discord automatiques : non stockées en dehors des logs du bot</li>
                <li>Demandes support : 12 mois</li>
              </ul>
              <p className="mt-2">Vous pouvez demander suppression ou anonymisation (voir section 9).</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">6. Partage des données</h2>
              <p>ShePlays ne vend jamais vos données.</p>
              <p className="mt-2">Les données peuvent être partagées avec :</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Stripe (paiements sécurisés)</li>
                <li>Discord (authentification, messages automatiques du bot)</li>
                <li>Hébergeur (OVH / VPS)</li>
                <li>Partenaires techniques strictement nécessaires au fonctionnement de ShePlays</li>
              </ul>
              <p className="mt-2">Aucun partage commercial.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">7. Sécurité des données</h2>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Mot de passe chiffré (bcrypt) si applicable</li>
                <li>HTTPS obligatoire</li>
                <li>Protection contre injections SQL, XSS et CSRF</li>
                <li>Isolation des données talents/clients</li>
                <li>Accès admin restreint et journalisé</li>
                <li>Sauvegardes régulières chiffrées</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">8. Cookies</h2>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Cookies techniques indispensables</li>
                <li>Cookies de session</li>
                <li>Éventuels cookies analytiques (consentement requis)</li>
              </ul>
              <p className="mt-2">Pas de cookies publicitaires.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">9. Vos droits (RGPD / CNIL)</h2>
              <p>Vous pouvez nous contacter pour exercer vos droits :</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Droit d’accès</li>
                <li>Droit de rectification</li>
                <li>Droit à l’effacement (droit à l’oubli)</li>
                <li>Droit d’opposition</li>
                <li>Droit à la limitation</li>
                <li>Droit à la portabilité</li>
              </ul>
              <p className="mt-2">
                Contact : <a href="mailto:privacy@sheplays.wtf" className="underline">privacy@sheplays.wtf</a>
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">10. Mineurs</h2>
              <p>
                ShePlays est strictement réservé aux personnes majeures (18+). Toute tentative d’utilisation par un mineur entraîne suppression immédiate du compte.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">11. Modifications de la politique</h2>
              <p>
                Cette politique peut être mise à jour. En cas de modifications importantes, une notification sera envoyée via Discord ou email.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">12. Contact</h2>
              <p>
                Pour toute question : <a href="mailto:privacy@sheplays.wtf" className="underline">privacy@sheplays.wtf</a>
              </p>
              <p className="mt-2">
                Site : <a href="https://sheplays.wtf" target="_blank" rel="noopener noreferrer" className="underline">https://sheplays.wtf</a>
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}