"use client";
import CookieConsent from "react-cookie-consent";
import Link from "next/link";

export default function CookieConsentBanner() {
  return (
    <CookieConsent
      location="bottom"
      buttonText="Accepter"
      declineButtonText="Refuser"
      enableDeclineButton
      cookieName="sheplays-cookie-consent"
      style={{
        background: "var(--color-surface)",
        color: "#ffffff",
        borderTop: "1px solid var(--color-border)",
        fontFamily: "var(--font-family-sans)",
      }}
      buttonStyle={{
        backgroundImage: "linear-gradient(135deg, var(--color-cyan), var(--color-pink))",
        color: "#000000",
        fontWeight: 600,
        borderRadius: 9999,
        padding: "8px 16px",
      }}
      declineButtonStyle={{
        backgroundColor: "transparent",
        color: "#ffffff",
        border: "1px solid var(--color-border)",
        borderRadius: 9999,
        padding: "8px 16px",
      }}
      overlay
      overlayStyle={{ backgroundColor: "rgba(10,10,10,0.5)" }}
      expires={365}
    >
      <span className="text-muted">
        Ce site utilise des cookies techniques et analytiques pour améliorer l’expérience.
      </span>{" "}
      <Link href="/mentions-legales" className="underline">En savoir plus</Link>.
    </CookieConsent>
  );
}