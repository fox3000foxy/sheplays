import Footer from "../../components/Footer";
import NavBar from "../../components/NavBar";

export default function GamesPage() {
  return (
    <div className="bg-dark text-white font-sans">
      <NavBar />

      <main className="pt-20 px-6">
        <section className="py-32 max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-12 gap-4">
            <h2 className="text-4xl md:text-5xl font-bold animate-in">Jeux disponibles</h2>
            <span className="text-muted text-sm md:text-base animate-in delay-1">Mis à jour mensuellement</span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-8 bg-surface rounded-lg hover:bg-surface/80 transition cursor-pointer hover-lift animate-in delay-1">
              <h3 className="text-2xl font-bold mb-2">Valorant</h3>
              <p className="text-muted mb-4">Ranked • Tryhard • Chill</p>
              <div className="text-sm text-muted">12 joueuses disponibles</div>
            </div>

            <div className="p-8 bg-surface rounded-lg hover:bg-surface/80 transition cursor-pointer hover-lift animate-in delay-2">
              <h3 className="text-2xl font-bold mb-2">Fortnite</h3>
              <p className="text-muted mb-4">Battle Royale • Creative • Ranked</p>
              <div className="text-sm text-muted">8 joueuses disponibles</div>
            </div>

            <div className="p-8 bg-surface rounded-lg hover:bg-surface/80 transition cursor-pointer hover-lift animate-in delay-3">
              <h3 className="text-2xl font-bold mb-2">Call of Duty</h3>
              <p className="text-muted mb-4">Multiplayer • Warzone</p>
              <div className="text-sm text-muted">6 joueuses disponibles</div>
            </div>

            <div className="p-8 bg-surface rounded-lg hover:bg-surface/80 transition cursor-pointer hover-lift animate-in delay-4">
              <h3 className="text-2xl font-bold mb-2">Genshin Impact</h3>
              <p className="text-muted mb-4">Co-op • Exploration</p>
              <div className="text-sm text-muted">4 joueuses disponibles</div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
