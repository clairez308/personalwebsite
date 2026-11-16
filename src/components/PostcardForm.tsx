import { useEffect, useState, type FormEvent } from "react";
import { stamps, validateContact, type ContactErrors, type Stamp } from "../lib/contact";

// The postcard: a front to flip, and a back that is the real form.
// The form works as a plain form; the flip and the send animation are extras.

const DRAFT_KEY = "bj-postcard-draft";

interface Draft {
  name: string;
  email: string;
  message: string;
  stamp: Stamp;
}

const emptyDraft: Draft = { name: "", email: "", message: "", stamp: "tomato" };

function readDraft(): Draft {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return emptyDraft;
    const d = JSON.parse(raw) as Partial<Draft>;
    return {
      name: d.name ?? "",
      email: d.email ?? "",
      message: d.message ?? "",
      stamp: stamps.includes(d.stamp as Stamp) ? (d.stamp as Stamp) : "tomato",
    };
  } catch {
    return emptyDraft;
  }
}

function writeDraft(d: Draft) {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d));
  } catch {
    // Storage blocked: the form still works, the draft just isn't kept.
  }
}

// Small stamp artwork for the picker and the stamp box.
function StampArt({ kind }: { kind: Stamp }) {
  switch (kind) {
    case "tomato":
      return (
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <circle cx="20" cy="22" r="13" fill="#e2483d" stroke="#2b2420" strokeWidth="1.2" />
          <path d="M12 12 L20 8 L28 12 L24 14 L20 9 L16 14 Z" fill="#9aa67a" />
        </svg>
      );
    case "snowboard":
      return (
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <rect x="16" y="3" width="8" height="34" rx="4" fill="#2b2420" transform="rotate(30 20 20)" />
        </svg>
      );
    case "paint":
      return (
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <path d="M20 4 C32 4 36 13 34 20 C32 28 24 26 22 30 C20 34 14 36 10 30 C6 24 6 4 20 4Z" fill="#fbf7ef" stroke="#2b2420" strokeWidth="1.2" />
          <circle cx="14" cy="14" r="3" fill="#e2483d" />
          <circle cx="22" cy="11" r="3" fill="#f5d867" />
          <circle cx="28" cy="18" r="3" fill="#9aa67a" />
          <circle cx="12" cy="24" r="3" fill="#2b2420" />
        </svg>
      );
    case "ubc":
      return (
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <rect x="4" y="10" width="32" height="20" fill="#1b4a7a" />
          <text x="20" y="25" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fontWeight="700" fill="#fbf7ef">
            UBC
          </text>
        </svg>
      );
  }
}

const stampLabel: Record<Stamp, string> = {
  tomato: "tomato",
  snowboard: "snowboard",
  paint: "paint palette",
  ubc: "UBC",
};

const SEND_ERROR = "the postcard didn't go through. your message is still here, try again.";

export default function PostcardForm() {
  const [flipped, setFlipped] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [serverError, setServerError] = useState("");
  const [sentOn, setSentOn] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  // Hidden-state attributes are only applied after mount, so the form is usable without JavaScript.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDraft(readDraft());
    setReady(true);
  }, []);

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((prev) => {
      const next = { ...prev, [key]: value };
      writeDraft(next);
      return next;
    });
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validateContact({ ...draft, website });
    setErrors(found);
    if (Object.keys(found).length) {
      // Focus the first field with a problem.
      const first = (["name", "email", "message", "stamp"] as const).find((k) => found[k]);
      document.getElementById(first === "stamp" ? "pc-stamp" : `pc-${first}`)?.focus();
      return;
    }

    setStatus("sending");
    setServerError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, website }),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; errors?: ContactErrors };
      if (!res.ok || !body.ok) {
        if (body.errors) setErrors(body.errors);
        setServerError(body.error ?? SEND_ERROR);
        setStatus("error");
        return;
      }
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        // nothing to clear
      }
      setSentOn(new Date().toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" }));
      setStatus("sent");
    } catch {
      setServerError(SEND_ERROR);
      setStatus("error");
    }
  }

  const sent = status === "sent";

  return (
    <div className="postcard-wrap">
      <div className={`postcard ${flipped ? "is-flipped" : ""} ${sent ? "is-sent" : ""}`}>
        {/* Front */}
        <div className="postcard-face postcard-front" aria-hidden={ready && flipped} inert={ready && flipped ? true : undefined}>
          <svg className="postcard-art" viewBox="0 0 400 260" role="img" aria-label="A postcard: Greetings from Vancouver, with mountains and the ocean">
            <rect width="400" height="260" fill="#f6e7c8" />
            <circle cx="310" cy="70" r="26" fill="#f5d867" />
            <path d="M0 170 L70 100 L120 150 L180 80 L250 160 L300 120 L400 180 L400 260 L0 260 Z" fill="#9aa67a" />
            <path d="M0 200 L90 170 L160 205 L240 175 L320 205 L400 190 L400 260 L0 260 Z" fill="#6f8fa6" />
            <path d="M180 80 L168 102 L192 102 Z M70 100 L58 120 L82 120 Z" fill="#fbf7ef" />
            <text x="24" y="52" fontFamily="Caveat, cursive" fontSize="34" fill="#2b2420">
              Greetings from
            </text>
            <text x="24" y="96" fontFamily="Fraunces, Georgia, serif" fontSize="40" fill="#e2483d">
              Vancouver
            </text>
          </svg>
          <button type="button" className="postcard-sticky font-hand" onClick={() => setFlipped(true)}>
            write me →
          </button>
        </div>

        {/* Back: the form, styled as a real postcard */}
        <div className="postcard-face postcard-back" aria-hidden={ready ? !flipped : undefined} inert={ready && !flipped ? true : undefined}>
          <form onSubmit={onSubmit} noValidate className="postcard-form" aria-label="Write me a postcard">
            <div className="postcard-message">
              <label htmlFor="pc-message" className="sr-only">
                Your message
              </label>
              <textarea
                id="pc-message"
                name="message"
                className="font-hand"
                placeholder="dear claire, ..."
                rows={6}
                value={draft.message}
                onChange={(e) => update("message", e.target.value)}
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "pc-message-err" : undefined}
              />
              {errors.message && (
                <p id="pc-message-err" className="pc-error">
                  {errors.message}
                </p>
              )}
            </div>

            <div className="postcard-address">
              <div className="field">
                <label htmlFor="pc-name">From</label>
                <input
                  id="pc-name"
                  name="name"
                  autoComplete="name"
                  value={draft.name}
                  onChange={(e) => update("name", e.target.value)}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "pc-name-err" : undefined}
                />
                {errors.name && (
                  <p id="pc-name-err" className="pc-error">
                    {errors.name}
                  </p>
                )}
              </div>
              <div className="field">
                <label htmlFor="pc-email">Email</label>
                <input
                  id="pc-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={draft.email}
                  onChange={(e) => update("email", e.target.value)}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "pc-email-err" : undefined}
                />
                {errors.email && (
                  <p id="pc-email-err" className="pc-error">
                    {errors.email}
                  </p>
                )}
              </div>

              <fieldset className="stamp-picker" id="pc-stamp">
                <legend>stamp</legend>
                <div className="stamp-options">
                  {stamps.map((s) => (
                    <label key={s} className={`stamp-option ${draft.stamp === s ? "is-picked" : ""}`}>
                      <input type="radio" name="stamp" value={s} checked={draft.stamp === s} onChange={() => update("stamp", s)} />
                      <span className="stamp-art">
                        <StampArt kind={s} />
                      </span>
                      <span className="sr-only">{stampLabel[s]}</span>
                    </label>
                  ))}
                </div>
                {errors.stamp && <p className="pc-error">{errors.stamp}</p>}
              </fieldset>

              {/* Honeypot: hidden from people and screen readers. Bots fill it in. */}
              <div className="honeypot" aria-hidden="true">
                <label>
                  leave this empty
                  <input name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
                </label>
              </div>

              <div className="postcard-actions">
                <button type="button" className="flip-back" onClick={() => setFlipped(false)}>
                  ← front
                </button>
                <button type="submit" className="send" disabled={status === "sending" || sent}>
                  {status === "sending" ? "sending…" : "send postcard"}
                </button>
              </div>
              {status === "error" && (
                <p role="alert" className="pc-error">
                  {serverError}
                </p>
              )}
            </div>

            <div className="postmark" aria-hidden="true">
              VANCOUVER BC · {sentOn}
            </div>
          </form>
        </div>
      </div>
      {sent && (
            <p className="thanks font-hand" role="status">
              got it! I'll write back soon ♡
            </p>
      )}
    </div>
  );
}
