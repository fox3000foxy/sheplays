import { NextRequest, NextResponse } from "next/server";

const DISCORD_BOT_TOKEN = "MTQzOTc2OTQ1ODEzNzc2Mzg4MA.Gh4SmD.IXWujrSo2KM-T-dYxGGhFrnT6ERJh5bMWWPEwU";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: discordId } = await params;

    if (!discordId) {
      return NextResponse.json({ error: "Discord ID required" }, { status: 400 });
    }

    // Fetch user data from Discord API
    const userResponse = await fetch(`https://discord.com/api/v10/users/${discordId}`, {
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
      },
    });

    if (!userResponse.ok) {
      console.error("Discord API error:", await userResponse.text());
      return NextResponse.json({ error: "Failed to fetch user from Discord" }, { status: userResponse.status });
    }

    const userData = await userResponse.json();

    // Construct avatar URL
    let avatarUrl: string;
    if (userData.avatar) {
      // User has a custom avatar
      const extension = userData.avatar.startsWith("a_") ? "gif" : "png";
      avatarUrl = `https://cdn.discordapp.com/avatars/${discordId}/${userData.avatar}.${extension}?size=256`;
    } else {
      // User has default avatar
      const defaultAvatarNumber = parseInt(userData.discriminator) % 5;
      avatarUrl = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`;
    }

    // Fetch the avatar image
    const avatarResponse = await fetch(avatarUrl);

    if (!avatarResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch avatar image" }, { status: 500 });
    }

    const imageBuffer = await avatarResponse.arrayBuffer();
    const contentType = avatarResponse.headers.get("content-type") || "image/png";

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error fetching Discord avatar:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
