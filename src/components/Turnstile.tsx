"use client";
import Script from "next/script";

/** Widget de Cloudflare Turnstile. Afegeix el camp `cf-turnstile-response` al formulari. */
export function Turnstile() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (!siteKey) return null;
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      <div className="cf-turnstile mt-4" data-sitekey={siteKey} data-language="ca" />
    </>
  );
}
