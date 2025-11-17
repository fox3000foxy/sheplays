import DashboardClient from "./DashboardClient";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";
import { redirect } from "next/navigation";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default async function DashboardPage() {
  const store = await cookies();
  const token = store.get("sp_session")?.value;
  const secret = process.env.AUTH_JWT_SECRET || "dev-secret-change-me";
  if (!token) {
    redirect("/api/auth/login");
  }
  const payload = verifyJwt(token!, secret);
  if (!payload) {
    redirect("/api/auth/login");
  }
  const user = { id: String(payload.sub), username: String(payload.username || ""), avatar: payload.avatar };
  return (
    <div className="bg-dark text-white font-sans min-h-screen flex flex-col">
      <NavBar user={user as any} currentPath="/dashboard" />
      <DashboardClient user={user as any} currentPath="/dashboard" />
      <Footer />
    </div>
  );
}