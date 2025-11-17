import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: audioId } = await params;

    if (!audioId) {
      return NextResponse.json({ error: "Missing audio ID" }, { status: 400 });
    }

    // Look for the file with different extensions
    const uploadsDir = join(process.cwd(), "uploads", "audio");
    const possibleExtensions = ["webm", "mp3", "wav", "ogg", "m4a"];

    let filepath: string | null = null;
    let extension: string | null = null;

    for (const ext of possibleExtensions) {
      const testPath = join(uploadsDir, `${audioId}.${ext}`);
      if (existsSync(testPath)) {
        filepath = testPath;
        extension = ext;
        break;
      }
    }

    if (!filepath || !extension) {
      return NextResponse.json({ error: "Audio file not found" }, { status: 404 });
    }

    // Read the file
    const fileBuffer = await readFile(filepath);

    // Determine MIME type
    const mimeTypes: Record<string, string> = {
      webm: "audio/webm",
      mp3: "audio/mpeg",
      wav: "audio/wav",
      ogg: "audio/ogg",
      m4a: "audio/mp4",
    };

    const mimeType = mimeTypes[extension] || "application/octet-stream";

    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Audio serve error:", error);
    return NextResponse.json({ error: "Failed to serve audio" }, { status: 500 });
  }
}
