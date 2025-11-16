import { NextResponse } from "next/server";

type Body = {
  name?: string;
  email?: string;
  message?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const name = (body.name || "").toString().trim();
    const email = (body.email || "").toString().trim();
    const message = (body.message || "").toString().trim();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    const webhook = process.env.DISCORD_WEBHOOK_URL || "https://ptb.discord.com/api/webhooks/1439589129313845308/Dxiho88GAjPdTjYc7IeqvYo4meYDay_YIYltY5uIvm1qSTr3eu8rBOpyO8qO_3LyxN6P";
    if (!webhook) {
      return NextResponse.json({ error: "Webhook non configuré" }, { status: 500 });
    }

    const embed = {
      title: "Nouveau message de contact",
      fields: [
        { name: "Nom", value: name, inline: true },
        { name: "Email", value: email, inline: true },
        { name: "Message", value: message },
      ],
      timestamp: new Date().toISOString(),
    } as const;

    const payload = { embeds: [embed] };

    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json({ error: "Erreur webhook", detail: text }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Erreur inconnue" }, { status: 500 });
  }
}
