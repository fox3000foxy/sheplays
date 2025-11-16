/* eslint-disable @typescript-eslint/no-explicit-any */
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

    const webhook = process.env.DISCORD_WEBHOOK_URL;
    if (!webhook) {
      return NextResponse.json({ error: "Webhook non configuré" }, { status: 500 });
    }

    const truncate = (s: string, n = 1000) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

    const embed = {
      title: "Nouveau message de contact",
      fields: [
        { name: "Nom", value: truncate(name, 256), inline: true },
        { name: "Email", value: truncate(email, 256), inline: true },
        { name: "Message", value: truncate(message, 1000) },
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
