import { NextRequest, NextResponse } from "next/server";
import { mkdir } from "fs/promises";
import { join } from "path";
import { pool } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    const userId = formData.get("userId") as string;

    if (!audioFile || !userId) {
      return NextResponse.json({ error: "Missing audio or userId" }, { status: 400 });
    }

    // Check if user is a talent
    const [rows] = await pool.query<any[]>("SELECT id FROM talents WHERE discord_id = ?", [userId]);
    const talentId = Array.isArray(rows) && (rows as any[])[0]?.id;
    if (!talentId) {
      return NextResponse.json({ error: "no_talent" }, { status: 400 });
    }

    // Create private uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "uploads", "audio");
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (e) {
      // Directory might already exist
    }

    // Generate unique ID for the file
    const audioId = uuidv4();
    const ext = audioFile.name.split(".").pop() || "webm";
    const filename = `${audioId}.${ext}`;
    const filepath = join(uploadsDir, filename);

    // Save file
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fs = require("fs").promises;
    await fs.writeFile(filepath, buffer);

    // Update talent profile with audio ID (not full path)
    await pool.query("UPDATE talents SET audio_sample_url = ?, updated_at = ? WHERE id = ?", [
      audioId,
      Date.now(),
      talentId,
    ]);

    return NextResponse.json({ ok: true, audioId: audioId });
  } catch (error) {
    console.error("Audio upload error:", error);
    return NextResponse.json({ error: "upload_failed", details: String(error) }, { status: 500 });
  }
}
