import { NextRequest, NextResponse } from "next/server";

/**
 * Récupère les informations d'un utilisateur Discord
 * GET /api/discord/user/[userId]
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "user_id_required" }, { status: 400 });
    }

    // Essayer de récupérer depuis Discord Bot API
    const botToken = process.env.DISCORD_BOT_TOKEN;

    if (!botToken) {
      return NextResponse.json({
        id: userId,
        username: `User#${userId.slice(0, 4)}`,
        discriminator: "0000"
      });
    }

    const response = await fetch(`https://discord.com/api/v10/users/${userId}`, {
      headers: {
        'Authorization': `Bot ${botToken}`
      }
    });

    if (!response.ok) {
      return NextResponse.json({
        id: userId,
        username: `User#${userId.slice(0, 4)}`,
        discriminator: "0000"
      });
    }

    const userData = await response.json();

    return NextResponse.json({
      id: userData.id,
      username: userData.username,
      discriminator: userData.discriminator,
      avatar: userData.avatar,
      global_name: userData.global_name
    });

  } catch (error) {
    console.error("Error fetching Discord user:", error);
    return NextResponse.json({
      error: "fetch_error",
      id: (await params).userId,
      username: "Unknown User"
    }, { status: 500 });
  }
}
