import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";

// The reflections as a real book: a hardcover that opens, then pages that turn
// with a 3D flip. The pages are server-rendered too, so the first spread is in
// the HTML before the island hydrates.

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

// One sheet: a left page and a right page.
type Page =
  | { kind: "photo"; entry: BookEntry }
  | { kind: "text"; entry: BookEntry; page: number; blocks: BookBlock[]; first: boolean; last: boolean }
  | { kind: "cont"; entry: BookEntry; page: number }
  | { kind: "end"; linkedin: string };
type Spread = { key: string; left: Page; right: Page };

const PAGE_WORDS = 150;

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
        left: page === 0 ? { kind: "photo", entry } : { kind: "cont", entry, page },
        right: { kind: "text", entry, page, blocks, first: page === 0, last },
      });
    });
  }
  spreads.push({ key: "end", left: { kind: "end", linkedin }, right: { kind: "end", linkedin } });
  return spreads;
}

function PageView({ page }: { page: Page }) {
  if (page.kind === "photo") {
    const { entry } = page;
    return (
      <div className="page page--left">
        <p className="font-hand text-2xl text-tomato">{entry.period}</p>
        {entry.tag && <p className="font-mono text-xs text-ink-soft">{entry.tag}</p>}
        <div className="page-photos">
          {entry.photos.map((src) => (
            <img key={src} src={src} alt="" loading="lazy" decoding="async" />
          ))}
        </div>
      </div>
    );
  }
  if (page.kind === "cont") {
    return (
      <div className="page page--left">
        <p className="font-mono text-xs text-ink-soft">(cont.)</p>
        <p className="font-display mt-2 text-xl text-ink-soft">{page.entry.title}</p>
      </div>
    );
  }
  if (page.kind === "end") {
    return (
      <div className="page">
        <p className="font-hand text-3xl">to be continued...</p>
        <a href={page.linkedin} target="_blank" rel="noopener" className="stamp mt-6 inline-block">
          follow along on LinkedIn ↗
        </a>
      </div>
    );
  }
  // Right-hand text page.
  return (
    <div className="page">
      {page.first ? (
        <h3 className="font-display text-2xl leading-tight">{page.entry.title}</h3>
      ) : (
        <p className="font-mono text-xs text-ink-soft">(cont.)</p>
      )}
      <div className="page-body" dangerouslySetInnerHTML={{ __html: page.blocks.map((b) => b.html).join("") }} />
      {page.last && page.entry.keyLearning && (
        <p className="key-learning font-hand">
          <mark className="highlight">{page.entry.keyLearning}</mark>
        </p>
      )}
    </div>
  );
}

export default function JournalBook({ entries, linkedin }: { entries: BookEntry[]; linkedin: string }) {
  const spreads = useMemo(() => buildSpreads(entries, linkedin), [entries, linkedin]);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  // A turning leaf: direction and the spread it's turning from/to.
  const [turn, setTurn] = useState<null | { dir: 1 | -1; from: number; to: number }>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // The cover opens once the book has scrolled into view.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (reduce) {
      setOpen(true);
      return;
    }
    const io = new IntersectionObserver(
      (list) => {
        if (list.some((e) => e.isIntersecting)) {
          window.setTimeout(() => setOpen(true), 400);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  const go = (dir: 1 | -1) => {
    if (turn) return;
    const to = index + dir;
    if (to < 0 || to >= spreads.length) return;
    if (!open) setOpen(true);
    // Reduced motion and small screens (one page at a time) switch without the turn.
    const small = window.matchMedia("(max-width: 767px)").matches;
    if (reduce || small) {
      setIndex(to);
      return;
    }
    setTurn({ dir, from: index, to });
  };

  const finishTurn = () => {
    if (!turn) return;
    setIndex(turn.to);
    setTurn(null);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    }
  };

  const spread = spreads[index];
  // While a leaf turns, the static sheet underneath shows the spread it's landing on.
  const under = turn ? (turn.dir === 1 ? { left: spread.left, right: spreads[turn.to].right } : { left: spreads[turn.to].left, right: spread.right }) : spread;
  const leafFront = turn ? (turn.dir === 1 ? spread.right : spread.left) : null;
  const leafBack = turn ? (turn.dir === 1 ? spreads[turn.to].left : spreads[turn.to].right) : null;

  return (
    <div ref={rootRef} className="book-root" tabIndex={0} role="region" aria-label="Reflections book. Use the arrow keys to turn pages." onKeyDown={onKeyDown}>
      <div className={`book ${open ? "is-open" : "is-closed"}`}>
        {/* The sheet underneath: the two pages that are showing. */}
        <div className="sheet" aria-live={turn ? "off" : "polite"}>
          <PageView page={under.left} />
          <PageView page={under.right} />
          <div className="spine" aria-hidden="true" />
        </div>

        {/* The leaf that turns over the spine. */}
        {turn && leafFront && leafBack && (
          <div
            className={`leaf ${turn.dir === 1 ? "leaf--forward" : "leaf--back"}`}
            onAnimationEnd={finishTurn}
            aria-hidden="true"
          >
            <div className="leaf-face leaf-front">
              <PageView page={leafFront} />
            </div>
            <div className="leaf-face leaf-back">
              <PageView page={leafBack} />
            </div>
          </div>
        )}

        {/* The hardcover. Opening it rotates the cover away from the spine. */}
        <button
          type="button"
          className="cover"
          onClick={() => setOpen(true)}
          aria-label="Open the book"
          tabIndex={open ? -1 : 0}
          aria-hidden={open}
        >
          <span className="cover-title font-hand">notes to self</span>
          <span className="cover-sub font-mono">reflections</span>
        </button>
      </div>

      <nav className="book-nav" aria-label="Turn pages">
        <button type="button" className="hand-arrow" onClick={() => go(-1)} disabled={index === 0 || !!turn} aria-label="Previous page">
          ←
        </button>
        <span className="font-mono text-xs text-ink-soft" aria-live="polite">
          p. {index + 1} / {spreads.length}
        </span>
        <button type="button" className="hand-arrow" onClick={() => go(1)} disabled={index >= spreads.length - 1 || !!turn} aria-label="Next page">
          →
        </button>
      </nav>
    </div>
  );
}
