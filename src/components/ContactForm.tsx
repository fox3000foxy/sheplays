"use client";

import { useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Merci de remplir tous les champs.");
      return;
    }

    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Erreur serveur");
      }

      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err: any) {
      setStatus("error");
      setError(err?.message || "Une erreur est survenue.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4 text-left">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex flex-col">
          <span className="text-sm font-medium">Nom</span>
          <input
            className="mt-2 p-3 rounded bg-surface border border-border"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Ton nom"
          />
        </label>

        <label className="flex flex-col">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            className="mt-2 p-3 rounded bg-surface border border-border"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="email@exemple.com"
          />
        </label>
      </div>

      <label className="flex flex-col">
        <span className="text-sm font-medium">Message</span>
        <textarea
          className="mt-2 p-3 rounded bg-surface border border-border min-h-[120px]"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          placeholder="Dis-nous tout..."
        />
      </label>

      {error && <div className="text-sm text-red-400">{error}</div>}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          className="px-6 py-3 bg-white text-dark font-semibold rounded hover:bg-white/90 transition"
          disabled={status === "sending"}
        >
          {status === "sending" ? "Envoi..." : "Envoyer"}
        </button>

        {status === "success" && <div className="text-sm text-green-400">Message envoyé — merci !</div>}
        {status === "error" && <div className="text-sm text-red-400">Échec de l'envoi.</div>}
      </div>
    </form>
  );
}
