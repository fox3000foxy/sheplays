import Link from "next/link";
import Footer from "../../components/Footer";
import NavBar from "../../components/NavBar";

export default function StartPage() {
  return (
    <div className="bg-dark text-white font-sans">
      <NavBar />

      <main className="pt-20 px-6">
        <section className="py-32 max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-5xl md:text-6xl font-bold animate-in">Prête à jouer<br />sans les conneries ?</h2>

          <p className="text-xl text-muted max-w-2xl mx-auto animate-in delay-1">Rejoins la bêta privée. Accès Discord instantané. Profils vérifiés. Sessions dispo maintenant.</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link href="https://discord.gg/sheplays" className="px-12 py-5 bg-white text-dark font-bold text-lg rounded hover:bg-white/90 transition hover-lift animate-in delay-2">Rejoindre sur Discord</Link>
            <span className="text-sm text-muted animate-in delay-3">Bêta privée • Places limitées</span>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
