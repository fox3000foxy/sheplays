import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";

export async function GET() {
  const store = await cookies();
  const token = store.get("sp_session")?.value;
  if (!token) return NextResponse.json({ error: "no_session" }, { status: 401 });
  const payload = verifyJwt(token, process.env.AUTH_JWT_SECRET || "dev-secret-change-me");
  if (!payload) return NextResponse.json({ error: "invalid_session" }, { status: 401 });
  return NextResponse.json({ id: String(payload.sub), username: String(payload.username || ""), avatar: payload.avatar });
}