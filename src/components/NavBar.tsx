import Link from "next/link";

export default function NavBar() {
    return (
        <nav className="fixed top-0 w-full z-50 border-b border-border bg-dark/80 backdrop-blur-xl">
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/">
                        <img src="/images/logo.svg" alt="ShePlays" style={{ height: "48px" }} />
                    </Link>
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm text-muted">
                    <Link href="/how" className="hover:text-white transition">Fonctionnement</Link>
                    <Link href="/games" className="hover:text-white transition">Jeux</Link>
                    <Link href="/pricing" className="hover:text-white transition">Tarifs</Link>
                </div>

                <Link href="/start" className="px-5 py-2 bg-white text-dark text-sm font-medium rounded hover:bg-white/90 transition hover-lift">
                    Rejoindre
                </Link>
            </div>
        </nav>
    );
}
