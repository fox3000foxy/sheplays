import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      displayName,
      bio,
      age,
      games,
      languages,
      style,
      audioSampleUrl,
      price15min,
      price30min,
      price60min,
      availableStatus,
      status
    } = body as {
      userId: string;
      displayName?: string;
      bio?: string;
      age?: number;
      games?: string[];
      languages?: string[];
      style?: string;
      audioSampleUrl?: string;
      price15min?: number;
      price30min?: number;
      price60min?: number;
      availableStatus?: boolean;
      status?: string;
    };

    if (!userId) {
      return NextResponse.json({ error: "userId_required" }, { status: 400 });
    }

    const [rows] = await pool.query<any[]>("SELECT id FROM talents WHERE discord_id = ?", [userId]);
    const talentId = Array.isArray(rows) && (rows as any[])[0]?.id;
    if (!talentId) {
      return NextResponse.json({ error: "no_talent" }, { status: 400 });
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (typeof displayName === "string") {
      updates.push("display_name = ?");
      values.push(displayName);
    }
    if (typeof bio === "string") {
      updates.push("bio = ?");
      values.push(bio);
    }
    if (typeof age === "number") {
      updates.push("age = ?");
      values.push(age);
    }
    if (Array.isArray(games)) {
      updates.push("games = ?");
      values.push(JSON.stringify(games));
    }
    if (Array.isArray(languages)) {
      updates.push("languages = ?");
      values.push(JSON.stringify(languages));
    }
    if (typeof style === "string") {
      updates.push("style = ?");
      values.push(style);
    }
    if (typeof audioSampleUrl === "string") {
      updates.push("audio_sample_url = ?");
      values.push(audioSampleUrl);
    }
    if (typeof price15min === "number") {
      updates.push("price_15min = ?");
      values.push(price15min);
    }
    if (typeof price30min === "number") {
      updates.push("price_30min = ?");
      values.push(price30min);
    }
    if (typeof price60min === "number") {
      updates.push("price_60min = ?");
      values.push(price60min);
    }
    if (typeof availableStatus === "boolean") {
      updates.push("available_status = ?");
      values.push(availableStatus ? 1 : 0);
    }
    if (typeof status === "string") {
      updates.push("status = ?");
      values.push(status);
    }

    if (updates.length > 0) {
      updates.push("updated_at = ?");
      values.push(Date.now());
      values.push(talentId);

      const query = `UPDATE talents SET ${updates.join(", ")} WHERE id = ?`;
      await pool.query(query, values);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Profile update error:", e);
    return NextResponse.json({ error: "profile_update_error" }, { status: 500 });
  }
}