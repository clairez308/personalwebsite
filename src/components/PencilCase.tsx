import { useEffect, useRef, useState, type KeyboardEvent } from "react";

// The pencil case: a small floating panel with two things to play with.
// Never opens by itself. Its button wiggles until it has been opened once.

const OPENED_KEY = "bj-pencilcase-opened";

const palette = [
  { name: "ink", color: "#2b2420" },
  { name: "tomato", color: "#e2483d" },
  { name: "washi pink", color: "#f2b8c6" },
  { name: "kraft", color: "#b98b5e" },
  { name: "sage", color: "#9aa67a" },
  { name: "butter", color: "#f5d867" },
  { name: "sky", color: "#6f8fa6" },
  { name: "paper deep", color: "#ede3d1" },
];

// The desk: each shape is a closed region you can fill.
const regions: { id: string; label: string; d: string }[] = [
  { id: "screen", label: "laptop screen", d: "M110 60 H230 V160 H110 Z" },
  { id: "base", label: "laptop base", d: "M95 160 H245 L255 180 H85 Z" },
  { id: "pot", label: "plant pot", d: "M290 190 H330 L325 240 H295 Z" },
  { id: "leaf-a", label: "plant leaf", d: "M310 190 C290 160 280 140 300 120 C320 140 330 160 310 190 Z" },
  { id: "leaf-b", label: "plant leaf", d: "M310 190 C330 165 350 150 352 128 C330 130 315 160 310 190 Z" },
  { id: "cup", label: "coffee cup", d: "M150 200 H190 V235 Q190 250 170 250 Q150 250 150 235 Z" },
  { id: "handle", label: "coffee cup handle", d: "M190 210 Q205 210 205 222 Q205 235 190 235 L190 228 Q196 228 196 222 Q196 216 190 216 Z" },
  { id: "note-a", label: "sticky note", d: "M40 60 H90 V105 H40 Z" },
  { id: "note-b", label: "sticky note", d: "M40 115 H80 V150 H40 Z" },
  { id: "sketchbook", label: "sketchbook", d: "M230 230 H370 L375 262 H225 Z" },
];

// Tape match: six pairs of little stickers.
const kinds = ["star", "heart", "tomato", "plane", "sun", "coffee"] as const;
type Kind = (typeof kinds)[number];

function TileArt({ kind }: { kind: Kind }) {
  switch (kind) {
    case "star":
      return <polygon points="20,3 25,15 38,15 28,23 32,36 20,29 8,36 12,23 2,15 15,15" fill="#f5d867" stroke="#2b2420" strokeWidth="1.2" />;
    case "heart":
      return <path d="M20 35 C4 24 2 14 8 8 C13 3 19 6 20 11 C21 6 27 3 32 8 C38 14 36 24 20 35Z" fill="#f2b8c6" stroke="#2b2420" strokeWidth="1.2" />;
    case "tomato":
      return (
        <g>
          <circle cx="20" cy="22" r="13" fill="#e2483d" stroke="#2b2420" strokeWidth="1.2" />
          <path d="M12 12 L20 8 L28 12 L24 14 L20 9 L16 14 Z" fill="#9aa67a" />
        </g>
      );
    case "plane":
      return <polygon points="2,20 38,6 26,36 20,24" fill="#e2483d" stroke="#2b2420" strokeWidth="1" />;
    case "sun":
      return (
        <g stroke="#f5d867" strokeWidth="3" strokeLinecap="round">
          <circle cx="20" cy="20" r="8" fill="#f5d867" />
          <path d="M20 2v5M20 33v5M2 20h5M33 20h5M7 7l3 3M30 30l3 3M7 33l3-3M30 10l3-3" />
        </g>
      );
    case "coffee":
      return (
        <g>
          <path d="M8 14 H30 V28 Q30 34 22 34 H16 Q8 34 8 28 Z" fill="#fbf7ef" stroke="#2b2420" strokeWidth="1.2" />
          <path d="M30 17 H34 Q36 17 36 21 Q36 25 30 25" fill="none" stroke="#2b2420" strokeWidth="1.2" />
        </g>
      );
  }
}

type Tile = { id: number; kind: Kind };

function shuffled(): Tile[] {
  const deck: Tile[] = kinds.flatMap((kind, i) => [
    { id: i * 2, kind },
    { id: i * 2 + 1, kind },
  ]);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function ColorMe() {
  const [fills, setFills] = useState<Record<string, string>>({});
  const [colour, setColour] = useState(palette[1].color);
  const svgRef = useRef<SVGSVGElement>(null);

  const fill = (id: string) => setFills((prev) => ({ ...prev, [id]: colour }));

  const done = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const url = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-desk.svg";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="colour">
      <div className="palette" role="radiogroup" aria-label="Colour">
        {palette.map((p) => (
          <button
            key={p.name}
            type="button"
            role="radio"
            aria-checked={colour === p.color}
            aria-label={p.name}
            className="swatch"
            style={{ background: p.color }}
            onClick={() => setColour(p.color)}
          />
        ))}
      </div>
      <svg ref={svgRef} viewBox="0 0 400 290" className="desk" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A desk to colour in">
        <rect x="0" y="262" width="400" height="28" fill="none" stroke="#2b2420" strokeWidth="1" opacity="0.4" />
        {regions.map((r) => (
          <path
            key={r.id}
            d={r.d}
            fill={fills[r.id] ?? "#fbf7ef"}
            stroke="#2b2420"
            strokeWidth="1.4"
            strokeLinejoin="round"
            role="button"
            tabIndex={0}
            aria-label={`${r.label}: fill with the chosen colour`}
            className="region"
            onClick={() => fill(r.id)}
            onKeyDown={(e: KeyboardEvent<SVGPathElement>) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fill(r.id);
              }
            }}
          />
        ))}
      </svg>
      <div className="colour-actions">
        <button type="button" className="tool-btn" onClick={() => setFills({})}>
          clear
        </button>
        <button type="button" className="tool-btn" onClick={done}>
          done: download
        </button>
      </div>
    </div>
  );
}

function TapeMatch() {
  const [deck, setDeck] = useState<Tile[]>([]);
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const lock = useRef(false);

  const reset = () => {
    setDeck(shuffled());
    setOpen([]);
    setMatched([]);
    setMoves(0);
    setSeconds(0);
    setRunning(false);
    lock.current = false;
  };

  useEffect(() => {
    reset();
  }, []);

  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [running]);

  const won = matched.length === deck.length && deck.length > 0;
  useEffect(() => {
    if (won) setRunning(false);
  }, [won]);

  const flip = (tile: Tile) => {
    if (lock.current || won || open.includes(tile.id) || matched.includes(tile.id)) return;
    if (!running) setRunning(true);
    const next = [...open, tile.id];
    setOpen(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next.map((id) => deck.find((t) => t.id === id)!);
      if (a.kind === b.kind) {
        setMatched((m) => [...m, a.id, b.id]);
        setOpen([]);
      } else {
        lock.current = true;
        window.setTimeout(() => {
          setOpen([]);
          lock.current = false;
        }, 700);
      }
    }
  };

  const mins = Math.floor(seconds / 60);
  const secs = String(seconds % 60).padStart(2, "0");

  return (
    <div className="match">
      <div className="match-status font-mono text-xs">
        <span>moves {moves}</span>
        <span>
          {mins}:{secs}
        </span>
        <button type="button" className="tool-btn" onClick={reset}>
          new deck
        </button>
      </div>
      <ul className="tiles" aria-label="Tape match tiles">
        {deck.map((tile) => {
          const isOpen = open.includes(tile.id) || matched.includes(tile.id);
          return (
            <li key={tile.id}>
              <button
                type="button"
                className={`tile ${isOpen ? "is-open" : ""} ${matched.includes(tile.id) ? "is-matched" : ""}`}
                onClick={() => flip(tile)}
                aria-label={isOpen ? `${tile.kind}` : "face-down tile"}
                aria-pressed={isOpen}
              >
                <span className="tile-back font-hand" aria-hidden="true">?</span>
                <svg className="tile-front" viewBox="0 0 40 40" aria-hidden="true">
                  <TileArt kind={tile.kind} />
                </svg>
              </button>
            </li>
          );
        })}
      </ul>
      {won && (
        <div className="win" role="status">
          <p className="font-hand text-2xl">you'd be great at QA!</p>
          <p className="font-mono text-xs">
            {moves} moves in {mins}:{secs}
          </p>
          <span className="confetti" aria-hidden="true">
            {Array.from({ length: 28 }).map((_, i) => (
              <i
                key={i}
                style={{
                  left: `${(i * 37) % 100}%`,
                  background: palette[(i % 6) + 1].color,
                  animationDelay: `${(i % 7) * 0.08}s`,
                  transform: `rotate(${(i * 53) % 360}deg)`,
                }}
              />
            ))}
          </span>
        </div>
      )}
    </div>
  );
}

export default function PencilCase() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"colour" | "match">("colour");
  const [wiggle, setWiggle] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Wiggle every 20s until it has been opened once.
  useEffect(() => {
    let opened = false;
    try {
      opened = localStorage.getItem(OPENED_KEY) === "1";
    } catch {
      opened = false;
    }
    if (opened) return;
    const t = window.setInterval(() => {
      setWiggle(true);
      window.setTimeout(() => setWiggle(false), 900);
    }, 20000);
    return () => window.clearInterval(t);
  }, []);

  const toggle = () => {
    setOpen((o) => {
      const next = !o;
      if (next) {
        try {
          localStorage.setItem(OPENED_KEY, "1");
        } catch {
          // not remembered
        }
      }
      return next;
    });
  };

  const close = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="pencil-case-root">
      <button
        ref={buttonRef}
        type="button"
        className={`pencil-case-btn ${wiggle ? "is-wiggle" : ""}`}
        aria-expanded={open}
        aria-controls="pencil-case-panel"
        onClick={toggle}
      >
        <svg viewBox="0 0 48 36" width="48" height="36" aria-hidden="true">
          <rect x="2" y="8" width="44" height="24" rx="5" fill="#9aa67a" stroke="#2b2420" strokeWidth="1.6" />
          <path d="M2 16 H46" stroke="#2b2420" strokeWidth="1.2" />
          <rect x="16" y="2" width="16" height="8" rx="2" fill="#f2b8c6" stroke="#2b2420" strokeWidth="1.2" />
          <rect x="18" y="20" width="12" height="6" rx="1" fill="#fbf7ef" stroke="#2b2420" strokeWidth="1" />
        </svg>
        <span className="sr-only">pencil case</span>
      </button>

      {open && (
        <div id="pencil-case-panel" ref={panelRef} className="pencil-panel" role="dialog" aria-label="Pencil case">
          <div className="panel-head">
            <div role="tablist" aria-label="Pencil case games" className="panel-tabs">
              <button type="button" role="tab" aria-selected={tab === "colour"} className="panel-tab" onClick={() => setTab("colour")}>
                color me in
              </button>
              <button type="button" role="tab" aria-selected={tab === "match"} className="panel-tab" onClick={() => setTab("match")}>
                tape match
              </button>
            </div>
            <button type="button" className="close" onClick={close} aria-label="Close pencil case">
              ×
            </button>
          </div>
          {tab === "colour" ? <ColorMe /> : <TapeMatch />}
        </div>
      )}
    </div>
  );
}
