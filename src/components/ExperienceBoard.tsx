import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "motion/react";

export interface Experience {
  id: string;
  org: string;
  role: string;
  dates: string;
  category: "work" | "leadership" | "community";
  summary: string;
  bullets: string[];
  logo: string;
  image?: string;
  url?: string;
  current?: boolean;
  incoming?: boolean;
}

type Filter = "all" | Experience["category"];
const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "all" },
  { value: "work", label: "work" },
  { value: "leadership", label: "leadership" },
  { value: "community", label: "community" },
];

const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

// "2027.01–2027.08" -> "coming jan 2027", for the incoming stamp.
function startStamp(dates: string): string {
  const m = dates.match(/^(\d{4})\.(\d{2})/);
  if (!m) return "coming soon";
  return `coming ${months[Number(m[2]) - 1]} ${m[1]}`;
}

// A stable small tilt per card so the shuffle looks like paper on a desk.
function tiltFor(id: string): number {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) | 0;
  return (Math.abs(h) % 5) - 2;
}

export default function ExperienceBoard({ entries }: { entries: Experience[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Experience | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const visible = filter === "all" ? entries : entries.filter((e) => e.category === filter);

  // Open the letter as a real modal dialog (focus trap and Esc come from the browser).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (selected && !dialog.open) dialog.showModal();
  }, [selected]);

  const close = () => dialogRef.current?.close();

  return (
    <div className="board">
      <div role="tablist" aria-label="Filter experiences" className="tabs">
        {filters.map((f) => {
          const selectedTab = f.value === filter;
          return (
            <button
              key={f.value}
              type="button"
              role="tab"
              aria-selected={selectedTab}
              tabIndex={selectedTab ? 0 : -1}
              data-active={selectedTab}
              className="tape-tab"
              onClick={() => setFilter(f.value)}
              onKeyDown={(e) => {
                const i = filters.findIndex((x) => x.value === filter);
                if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                  e.preventDefault();
                  const next = filters[(i + (e.key === "ArrowRight" ? 1 : filters.length - 1)) % filters.length];
                  setFilter(next.value);
                  requestAnimationFrame(() => (document.getElementById(`tab-${next.value}`) as HTMLElement | null)?.focus());
                }
              }}
              id={`tab-${f.value}`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <motion.ul layout className="envelopes">
        <AnimatePresence mode="popLayout">
          {visible.map((e, i) => (
            <motion.li
              key={e.id}
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, scale: 0.94, rotate: tiltFor(e.id) - 4 }}
              animate={{ opacity: 1, scale: 1, rotate: tiltFor(e.id) }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 22, delay: i * 0.04 }}
              style={{ "--rot": `${tiltFor(e.id)}deg` } as CSSProperties}
            >
              <button
                type="button"
                className="envelope"
                aria-haspopup="dialog"
                onClick={(event) => {
                  openerRef.current = event.currentTarget;
                  setSelected(e);
                }}
              >
                <span className="envelope-logo">
                  <img src={e.logo} alt="" width="56" height="56" loading="lazy" decoding="async" />
                </span>
                <span className="envelope-body">
                  <span className="font-display text-xl leading-tight">{e.org}</span>
                  <span className="block text-[0.98rem] text-ink">{e.role}</span>
                  <span className="font-mono text-xs text-ink-soft">
                    {e.dates}
                    {e.current && <span className="ml-2 text-tomato">[current]</span>}
                  </span>
                </span>
                <span className={`stamp-corner stamp-${e.category}`}>{e.category}</span>
                {e.incoming && <span className="incoming-stamp">{startStamp(e.dates)}</span>}
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      <dialog
        ref={dialogRef}
        className="letter-dialog"
        aria-labelledby="letter-title"
        onClose={() => {
          setSelected(null);
          openerRef.current?.focus();
        }}
        onClick={(event) => {
          // A click on the backdrop (outside the letter) closes it.
          if (event.target === dialogRef.current) close();
        }}
      >
        {selected && (
          <motion.article
            key={selected.id}
            className="letter"
            initial={reduce ? false : { y: 48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 24 }}
          >
            <button type="button" className="letter-close" onClick={close} aria-label="Close">
              ×
            </button>
            <p className="font-mono text-xs text-ink-soft">
              {selected.dates}
              {selected.current && <span className="ml-2 text-tomato">[current]</span>}
            </p>
            <h2 id="letter-title" className="font-display mt-1 text-3xl leading-tight">
              {selected.org}
            </h2>
            <p className="text-lg">{selected.role}</p>
            {selected.image ? (
              <img src={selected.image} alt={`${selected.org}`} className="letter-photo" />
            ) : (
              <img src={selected.logo} alt="" className="letter-logo" />
            )}
            <p className="mt-4 text-ink-soft">{selected.summary}</p>
            {selected.bullets.length > 0 && (
              <ul className="mt-3 list-disc space-y-1 pl-5">
                {selected.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            )}
            {selected.url && (
              <a href={selected.url} target="_blank" rel="noopener" className="stamp mt-5 inline-block">
                visit site ↗
              </a>
            )}
          </motion.article>
        )}
      </dialog>
    </div>
  );
}
