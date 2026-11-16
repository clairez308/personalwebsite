import type { APIRoute } from "astro";
import { validateContact, type ContactInput } from "../../lib/contact";

// Runs on the server only (Vercel function). Keys come from env vars, never the client.
export const prerender = false;

// Per-IP limit. The counter lives in this function instance, so it resets when
// Vercel starts a new instance. It slows casual spam; it's not a real guarantee.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, { count: number; start: number }>();

function overLimit(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now - entry.start > WINDOW_MS) {
    hits.set(ip, { count: 1, start: now });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

export const POST: APIRoute = async ({ request }) => {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (overLimit(ip)) {
    return json({ ok: false, error: "that's a lot of postcards at once. try again in a few minutes." }, 429);
  }

  let input: ContactInput;
  try {
    input = (await request.json()) as ContactInput;
  } catch {
    return json({ ok: false, error: "something got garbled on the way. try sending again." }, 400);
  }

  // Honeypot: pretend it worked, send nothing.
  if (input.website) return json({ ok: true });

  const errors = validateContact(input);
  if (Object.keys(errors).length) return json({ ok: false, errors }, 400);

  const apiKey = import.meta.env.RESEND_API_KEY;
  const to = import.meta.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) {
    return json({ ok: false, error: "the postbox isn't set up yet. email me directly for now." }, 503);
  }

  const name = input.name.trim();
  const email = input.email.trim();
  const message = input.message.trim();

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Build Journal <onboarding@resend.dev>",
        to: [to],
        reply_to: email,
        subject: `postcard from ${name}`,
        text: `${message}\n\n— ${name} <${email}>\nstamp: ${input.stamp}`,
      }),
    });
    if (!res.ok) {
      return json({ ok: false, error: "the postcard didn't go through. your message is still here, try again." }, 502);
    }
  } catch {
    return json({ ok: false, error: "the postcard didn't go through. your message is still here, try again." }, 502);
  }

  return json({ ok: true });
};
