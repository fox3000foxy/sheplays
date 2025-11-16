import Footer from "../../components/Footer";
import NavBar from "../../components/NavBar";

export default function PricingPage() {
  return (
    <div className="bg-dark text-white font-sans">
      <NavBar />

      <main className="pt-20 px-6">
        <section className="py-32 max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-20 text-center animate-in">Tarifs simples</h2>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-8 bg-surface rounded-lg border border-border hover:border-muted transition animate-in delay-1">
              <div className="text-3xl font-bold mb-2">5€</div>
              <div className="text-muted mb-6">15 minutes</div>
              <div className="text-sm text-muted">Idéal pour tester<br />ou match rapide</div>
            </div>

            <div className="p-8 bg-surface rounded-lg border-gradient animate-in delay-2">
              <div className="relative">
                <div className="text-3xl font-bold mb-2 mt-2">10€</div>
                <div className="text-muted mb-6">30 minutes</div>
                <div className="text-sm text-muted">Session standard<br />2-3 games</div>
              </div>
            </div>

            <div className="p-8 bg-surface rounded-lg border border-border hover:border-muted transition animate-in delay-3">
              <div className="text-3xl font-bold mb-2">18€</div>
              <div className="text-muted mb-6">60 minutes</div>
              <div className="text-sm text-muted">Session longue<br />4-5 games</div>
            </div>
          </div>

          <p className="text-center text-muted mt-12 animate-in delay-4">Paiement sécurisé Stripe • Remboursement 24h en cas de problème</p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
