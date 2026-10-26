/* Sends one RSVP to the Apps Script web app in apps-script/Code.gs.

   The URL comes from VITE_REGISTRATION_ENDPOINT (see .env.example). It is
   posted as text/plain so the browser sends it without a CORS preflight,
   which Apps Script web apps do not answer. The script replies 200 even
   when it rejects a row, so the JSON body's `result` is the real signal. */
const ENDPOINT = import.meta.env.VITE_REGISTRATION_ENDPOINT || "";

export const registrationConfigured = () => Boolean(ENDPOINT);

export async function sendRegistration(payload) {
  if (!ENDPOINT) throw new Error("Registration endpoint is not configured");

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Registration endpoint returned " + res.status);

  const result = await res.json().catch(() => ({}));
  if (result.result !== "success") {
    throw new Error(result.error || "Unrecognised response from the registration endpoint");
  }
  return result;
}

/* Where the visitor came from, for the sheet's Source column:
   ?src=linkedin, or utm_source, else the referring site, else "direct". */
export function getLeadSource() {
  try {
    const params = new URLSearchParams(window.location.search);
    const tagged = params.get("src") || params.get("utm_source");
    if (tagged) return tagged.trim().toLowerCase();
    if (document.referrer) return new URL(document.referrer).hostname.replace(/^www\./, "");
  } catch {
    /* fall through */
  }
  return "direct";
}
