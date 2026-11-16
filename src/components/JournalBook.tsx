import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";

export interface BookBlock {
  html: string;
  words: number;
}

export interface BookEntry {
  id: string;
  period: string;
  tag: string | null;
  title: string;
  photos: string[];
  keyLearning: string | null;
  blocks: BookBlock[];
}

// One sheet of paper: the photo page, or a right-hand text page.
type Spread = {
  key: string;
  left:
    | { kind: "photo"; entry: BookEntry }
    | { kind: "cont"; entry: BookEntry; page: number }
    | { kind: "end" };
  right:
    | { kind: "text"; entry: BookEntry; page: number; blocks: BookBlock[]; first: boolean; last: boolean }
    | { kind: "end"; linkedin: string };
};

const PAGE_WORDS = 150;

// Split a body into pages of roughly PAGE_WORDS, at block (paragraph) boundaries.
function paginate(blocks: BookBlock[]): BookBlock[][] {
  const pages: BookBlock[][] = [];
  let current: BookBlock[] = [];
  let count = 0;
  for (const block of blocks) {
    if (count > 0 && count + block.words > PAGE_WORDS) {
      pages.push(current);
      current = [];
      count = 0;
    }
    current.push(block);
    count += block.words;
  }
  if (current.length || pages.length === 0) pages.push(current);
  return pages;
}

function buildSpreads(entries: BookEntry[], linkedin: string): Spread[] {
  const spreads: Spread[] = [];
  for (const entry of entries) {
    const pages = paginate(entry.blocks);
    pages.forEach((blocks, page) => {
      const last = page === pages.length - 1;
      spreads.push({
        key: `${entry.id}-${page}`,
        left:
          page === 0
            ? { kind: "photo", entry }
            : { kind: "cont", entry, page },
        right: { kind: "text", entry, page, blocks, first: page === 0, last },
      });
    });
  }
  spreads.push({ key: "end", left: { kind: "end" }, right: { kind: "end", linkedin } });
  return spreads;
}

function KeyLearning({ text }: { text: string }) {
  return (
    <p className="mt-5 font-hand text-2xl leading-snug">
      <mark className="highlight">{text}</mark>
    </p>
  );
}

function LeftPage({ page }: { page: Spread["left"] }) {
  if (page.kind === "photo") {
    const { entry } = page;
    return (
      <div className="book-page book-page--left">
        <p className="font-hand text-2xl text-tomato">{entry.period}</p>
        {entry.tag && <p className="font-mono text-xs text-ink-soft">{entry.tag}</p>}
        <div className="mt-4 space-y-5">
          {entry.photos.map((src) => (
            <img key={src} src={src} alt="" loading="lazy" decoding="async" className="washi-photo" />
          ))}
        </div>
      </div>
    );
  }
  if (page.kind === "cont") {
    return (
      <div className="book-page book-page--left">
        <p className="font-mono text-xs text-ink-soft">(cont.)</p>
        <p className="font-display mt-2 text-xl text-ink-soft">{page.entry.title}</p>
      </div>
    );
  }
  return (
    <div className="book-page book-page--left">
      <p className="font-hand text-3xl">to be continued...</p>
    </div>
  );
}

function RightPage({ page, entry }: { page: Spread["right"]; entry: BookEntry | null }) {
  if (page.kind === "end") {
    return (
      <div className="book-page">
        <p className="font-display text-2xl">More soon.</p>
        <p className="mt-3 text-ink-soft">New notes get written when there's something worth remembering.</p>
        <a href={page.linkedin} target="_blank" rel="noopener" className="stamp mt-6 inline-block">
          follow along on LinkedIn ↗
        </a>
      </div>
    );
  }
  return (
    <div className="book-page">
      {page.first && <h3 className="font-display text-2xl leading-tight">{page.entry.title}</h3>}
      {!page.first && <p className="font-mono text-xs text-ink-soft">(cont.)</p>}
      <div className="mt-3 space-y-4 text-[1.02rem] leading-relaxed" dangerouslySetInnerHTML={{ __html: page.blocks.map((b) => b.html).join("") }} />
      {page.last && entry?.keyLearning && <KeyLearning text={entry.keyLearning} />}
    </div>
  );
}

export default function JournalBook({ entries, linkedin }: { entries: BookEntry[]; linkedin: string }) {
  const spreads = useMemo(() => buildSpreads(entries, linkedin), [entries, linkedin]);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Closed-book intro: the cover opens once the book has scrolled into view.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (reduce) {
      setOpen(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          window.setTimeout(() => setOpen(true), 500);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  // One sheet per spread. On mobile the two pages stack, so the same step applies.
  const go = (delta: number) => setIndex((i) => Math.min(spreads.length - 1, Math.max(0, i + delta)));
  const spread = spreads[index];
  const counter = `p. ${index + 1} / ${spreads.length}`;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    }
  };

  const entryFor = (s: Spread) => (s.left.kind === "photo" || s.left.kind === "cont" ? s.left.entry : null);

  return (
    <div ref={rootRef} className="book-root" tabIndex={0} role="region" aria-label="Reflections book. Use the arrow keys to turn pages." onKeyDown={onKeyDown}>
      <div className={`book ${open ? "is-open" : "is-closed"}`}>
        <div className="book-cover" aria-hidden={open}>
          <span className="book-cover-label font-hand">notes to self</span>
          <span className="book-band" aria-hidden="true" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={spread.key}
            className="spread"
            initial={reduce ? false : { rotateY: -12, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { rotateY: 12, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <LeftPage page={spread.left} />
            <RightPage page={spread.right} entry={entryFor(spread)} />
          </motion.div>
        </AnimatePresence>
      </div>

      <nav className="book-nav" aria-label="Turn pages">
        <button type="button" className="hand-arrow" onClick={() => go(-1)} disabled={index === 0} aria-label="Previous page">
          ←
        </button>
        <span className="font-mono text-xs text-ink-soft" aria-live="polite">
          {counter}
        </span>
        <button type="button" className="hand-arrow" onClick={() => go(1)} disabled={index >= spreads.length - 1} aria-label="Next page">
          →
        </button>
      </nav>
    </div>
  );
}
