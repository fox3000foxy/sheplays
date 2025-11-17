import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    const [rows] = await pool.query("SELECT balance FROM user_balances WHERE user_id = ?", [userId]);
    const rowsAny = Array.isArray(rows) ? (rows as any[]) : [];
    const balance = rowsAny[0]?.balance ?? 0;
    return NextResponse.json({ balance });
  } catch {
    return NextResponse.json({ balance: 0 });
  }
}