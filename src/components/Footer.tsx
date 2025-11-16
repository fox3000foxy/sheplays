import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <img src="/images/logo.svg" alt="ShePlays" style={{ height: "48px" }} />
          </div>

          <div className="flex gap-8 text-sm text-muted">
            <Link href="#" className="hover:text-white transition">Discord</Link>
            <Link href="#" className="hover:text-white transition">Twitter</Link>
            <Link href="#" className="hover:text-white transition">Conditions</Link>
            <Link href="#" className="hover:text-white transition">Confidentialité</Link>
          </div>

          <div className="text-sm text-muted">© 2025 ShePlays</div>
        </div>
      </div>
    </footer>
  );
}
