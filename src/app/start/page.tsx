import Link from "next/link";
import { Suspense } from "react";
import Footer from "../../components/Footer";
import NavBar from "../../components/NavBar";
import StartClient from "./StartClient";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export default async function StartPage() {
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
        <section className="py-32 max-w-4xl mx-auto text-center space-y-8">
          {/* Affichage du code de parrainage si présent */}
          <Suspense fallback={null}>
            <StartClient />
          </Suspense>
        </section>
      </main>

      <Footer />
    </div>
  );
}
