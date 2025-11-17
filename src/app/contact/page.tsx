import ContactForm from "../../components/ContactForm";
import Footer from "../../components/Footer";
import NavBar from "../../components/NavBar";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export default async function ContactPage() {
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
        <section className="py-24 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 animate-in">Contact</h2>
          <p className="text-muted mb-8 animate-in delay-1">Une question, un partenariat ou un bug ? Envoie-nous un message — on te répond sur Discord.</p>
          <div className="animate-in delay-2"><ContactForm /></div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
