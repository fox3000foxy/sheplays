import Footer from "../../components/Footer";
import NavBar from "../../components/NavBar";

export default function MentionsLegalesPage() {
  return (
    <div className="bg-dark text-white font-sans">
      <NavBar />

      <main className="pt-20 px-6">
        <section className="py-16 max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 animate-in">MENTIONS LÉGALES — SHEPLAYS</h1>
          <p className="text-muted mb-2">Dernière mise à jour : 2025</p>

          <div className="space-y-6 text-muted leading-relaxed animate-in delay-1">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">ÉDITEUR DU SITE</h2>
              <p>
                Marquez Thomas (ONEFIX) — Entreprise Individuelle – Micro-entreprise
              </p>
              <p>SIREN : 947 804 001</p>
              <p>SIRET : 947 804 001 00024</p>
              <p>RCS : 947 804 001 R.C.S. Bourg-en-Bresse</p>
              <p>Numéro de TVA intracommunautaire : FR90947804001</p>
              <p>Code APE : 62.02A (Conseil en systèmes et logiciels informatiques)</p>
              <p>Adresse professionnelle : Adresse disponible sur demande légale</p>
              <p>Forme d’exercice : Entrepreneur individuel</p>
              <p>Email de contact : <a href="mailto:support@sheplays.wtf" className="underline">support@sheplays.wtf</a></p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">DIRECTEUR DE LA PUBLICATION</h2>
              <p>Marquez Thomas</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">HÉBERGEMENT</h2>
              <p>OVH SAS</p>
              <p>2 rue Kellermann, 59100 Roubaix, France</p>
              <p>
                Site : <a href="https://www.ovh.com" target="_blank" rel="noopener noreferrer" className="underline">https://www.ovh.com</a>
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">RESPONSABILITÉ</h2>
              <p>
                L’éditeur s’efforce d’assurer l’exactitude et la mise à jour des informations diffusées sur le site. Cependant, aucune garantie n’est fournie quant à l’exactitude, la précision ou l’exhaustivité des informations. L’éditeur décline toute responsabilité en cas d’interruption du site, de survenance de bugs, d’erreurs ou d’omissions, ou de dommages résultant d’une intrusion frauduleuse d’un tiers.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">PROPRIÉTÉ INTELLECTUELLE</h2>
              <p>
                Le contenu du site (textes, images, vidéos, logos, marques, interface, etc.) est protégé par le droit d’auteur et les lois en vigueur. Toute reproduction, représentation, modification ou exploitation non autorisée est interdite sauf accord préalable et écrit de l’éditeur.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">DONNÉES PERSONNELLES (RGPD)</h2>
              <p>
                Le site ShePlays peut collecter certaines données personnelles dans le cadre de son fonctionnement (identité, adresse email, données de session Discord, vérification d’âge pour les talents, informations de transaction Stripe, etc.). Ces informations sont utilisées pour : la gestion des comptes utilisateurs, la mise en relation entre talents et utilisateurs, la facturation et les paiements, la modération et la sécurité.
              </p>
              <p className="mt-2">
                Les données ne sont conservées que le temps nécessaire à leur traitement. Conformément au RGPD, tout utilisateur peut exercer son droit d’accès, de rectification, de suppression et d’opposition en écrivant à : <a href="mailto:support@sheplays.wtf" className="underline">support@sheplays.wtf</a>.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">COOKIES</h2>
              <p>
                Le site peut utiliser des cookies techniques et analytiques pour améliorer l’expérience utilisateur. L’utilisateur peut refuser l’utilisation des cookies via les paramètres de son navigateur.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">LITIGES</h2>
              <p>
                En cas de litige, la loi française est applicable. Le tribunal compétent sera celui du ressort de Bourg-en-Bresse.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}