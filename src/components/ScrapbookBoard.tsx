import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { motion } from "motion/react";
import { getStroke } from "perfect-freehand";

// The scrapbook: a corkboard you can arrange. Everything is stored in board
// units (1000 x 800) so it scales with the page and the pen strokes stay true.

export interface HobbyPhoto {
  id: string;
  name: string;
  src: string;
  caption: string | null;
}

type StickerKind = "star" | "heart" | "tomato" | "snowboard" | "brush" | "mat" | "pm" | "coffee" | "plane" | "book" | "sun" | "flower" | "ticket";
type Mode = "select" | "tape" | "pen" | "eraser" | "sticker";
type Ink = "#2b2420" | "#e2483d" | "#f2b8c6" | "#9aa67a";
const inks: Ink[] = ["#2b2420", "#e2483d", "#f2b8c6", "#9aa67a"];
type TapePattern = "dots" | "gingham" | "stripe" | "solid";
const tapePatterns: TapePattern[] = ["dots", "gingham", "stripe", "solid"];

type Item =
  | { kind: "polaroid"; id: string; x: number; y: number; rot: number; src: string; name: string; caption: string | null }
  | { kind: "sticker"; id: string; x: number; y: number; rot: number; sticker: StickerKind }
  | { kind: "tape"; id: string; x: number; y: number; rot: number; len: number; angle: number; pattern: TapePattern };

interface Stroke {
  id: string;
  color: Ink;
  size: number;
  points: [number, number][];
}

interface Saved {
  v: 1;
  items: Item[];
  strokes: Stroke[];
}

const STORAGE_KEY = "bj-scrapbook";
const W = 1000;
const H = 800;

// Stable small tilt per id, so a reload doesn't reshuffle anything.
function tiltFor(id: string): number {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) | 0;
  return (Math.abs(h) % 9) - 4;
}

function defaultItems(photos: HobbyPhoto[]): Item[] {
  const polaroids: Item[] = photos.map((p, i) => ({
    kind: "polaroid",
    id: `p-${p.id}`,
    x: 4 + (i % 3) * 31 + (i % 2) * 2,
    y: 5 + Math.floor(i / 3) * 31,
    rot: tiltFor(p.id),
    src: p.src,
    name: p.name,
    caption: p.caption,
  }));
  return [
    ...polaroids,
    { kind: "sticker", id: "s-ticket", x: 70, y: 74, rot: -8, sticker: "ticket" },
    { kind: "sticker", id: "s-flower", x: 5, y: 76, rot: 10, sticker: "flower" },
  ];
}

// Stickers are tiny inline SVGs on a 40 x 40 grid.
const stickerArt: Record<StickerKind, { label: string; svg: ReactNode }> = {
  star: {
    label: "star",
    svg: <polygon points="20,2 25,15 39,15 28,24 32,38 20,30 8,38 12,24 1,15 15,15" fill="#f5d867" stroke="#2b2420" strokeWidth="1.2" />,
  },
  heart: {
    label: "heart",
    svg: <path d="M20 35 C4 24 2 14 8 8 C13 3 19 6 20 11 C21 6 27 3 32 8 C38 14 36 24 20 35Z" fill="#f2b8c6" stroke="#2b2420" strokeWidth="1.2" />,
  },
  tomato: {
    label: "tomato",
    svg: (
      <g>
        <circle cx="20" cy="22" r="14" fill="#e2483d" stroke="#2b2420" strokeWidth="1.2" />
        <path d="M12 12 L20 8 L28 12 L24 14 L20 9 L16 14 Z" fill="#9aa67a" />
      </g>
    ),
  },
  snowboard: {
    label: "snowboard",
    svg: <rect x="15" y="2" width="10" height="36" rx="5" fill="#2b2420" transform="rotate(35 20 20)" />,
  },
  brush: {
    label: "paintbrush",
    svg: (
      <g>
        <rect x="18" y="4" width="4" height="22" fill="#b98b5e" />
        <path d="M14 26 Q20 40 26 26 Z" fill="#e2483d" stroke="#2b2420" strokeWidth="1" />
      </g>
    ),
  },
  mat: {
    label: "yoga mat",
    svg: (
      <g>
        <rect x="2" y="12" width="36" height="16" rx="4" fill="#9aa67a" stroke="#2b2420" strokeWidth="1.2" />
        <path d="M2 20 H38 M2 24 H38" stroke="#fbf7ef" strokeOpacity="0.5" />
      </g>
    ),
  },
  pm: {
    label: "PM in progress",
    svg: <text x="20" y="25" textAnchor="middle" fontFamily="Caveat, cursive" fontSize="9" fill="#2b2420">PM in progress</text>,
  },
  coffee: {
    label: "coffee",
    svg: (
      <g>
        <path d="M8 14 H30 V28 Q30 34 22 34 H16 Q8 34 8 28 Z" fill="#fbf7ef" stroke="#2b2420" strokeWidth="1.2" />
        <path d="M30 17 H34 Q36 17 36 21 Q36 25 30 25" fill="none" stroke="#2b2420" strokeWidth="1.2" />
      </g>
    ),
  },
  plane: {
    label: "paper plane",
    svg: <polygon points="2,20 38,6 26,36 20,24" fill="#e2483d" stroke="#2b2420" strokeWidth="1" />,
  },
  book: {
    label: "book",
    svg: (
      <g>
        <rect x="6" y="6" width="28" height="30" rx="2" fill="#9aa67a" stroke="#2b2420" strokeWidth="1.2" />
        <line x1="12" y1="6" x2="12" y2="36" stroke="#2b2420" strokeWidth="1" />
      </g>
    ),
  },
  sun: {
    label: "sun",
    svg: (
      <g stroke="#f5d867" strokeWidth="3" strokeLinecap="round">
        <circle cx="20" cy="20" r="8" fill="#f5d867" />
        <path d="M20 2v5M20 33v5M2 20h5M33 20h5M7 7l3 3M30 30l3 3M7 33l3-3M30 10l3-3" />
      </g>
    ),
  },
  flower: {
    label: "pressed flower",
    svg: (
      <g fill="#f2b8c6" stroke="#2b2420" strokeWidth="0.8">
        <circle cx="20" cy="10" r="7" />
        <circle cx="30" cy="18" r="7" />
        <circle cx="26" cy="30" r="7" />
        <circle cx="14" cy="30" r="7" />
        <circle cx="10" cy="18" r="7" />
        <circle cx="20" cy="20" r="5" fill="#f5d867" />
      </g>
    ),
  },
  ticket: {
    label: "ticket stub",
    svg: (
      <g>
        <rect x="2" y="12" width="36" height="16" rx="2" fill="#fbf7ef" stroke="#2b2420" strokeWidth="1" />
        <line x1="27" y1="12" x2="27" y2="28" stroke="#2b2420" strokeDasharray="2 2" />
        <text x="13" y="23" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="5" fill="#e2483d">ADMIT</text>
      </g>
    ),
  },
};
const stickerKinds = Object.keys(stickerArt) as StickerKind[];

const tapeBg: Record<TapePattern, string> = {
  dots: "radial-gradient(circle, rgba(255,255,255,0.8) 3px, transparent 3.5px) 0 0 / 14px 14px, #f2b8c6",
  gingham: "linear-gradient(90deg, rgba(226,72,61,0.35) 50%, transparent 50%) 0 0 / 14px 14px, linear-gradient(rgba(226,72,61,0.35) 50%, transparent 50%) 0 0 / 14px 14px, #f3e6d6",
  stripe: "repeating-linear-gradient(90deg, rgba(255,255,255,0.55) 0 8px, transparent 8px 16px), #9aa67a",
  solid: "#f5d867",
};

// Stroke outline from perfect-freehand, as an SVG path.
function strokePath(points: [number, number][], size: number): string {
  const outline = getStroke(points, { size, thinning: 0.5, smoothing: 0.5, streamline: 0.5 });
  if (outline.length < 2) return "";
  const [sx, sy] = outline[0];
  let d = `M${sx.toFixed(1)},${sy.toFixed(1)}`;
  for (let i = 1; i < outline.length; i++) {
    const [x0, y0] = outline[i];
    const [x1, y1] = outline[(i + 1) % outline.length];
    d += ` Q${x0.toFixed(1)},${y0.toFixed(1)} ${((x0 + x1) / 2).toFixed(1)},${((y0 + y1) / 2).toFixed(1)}`;
  }
  return d + " Z";
}

function readSaved(): Saved | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Saved;
    return data && data.v === 1 && Array.isArray(data.items) && Array.isArray(data.strokes) ? data : null;
  } catch {
    return null;
  }
}

function writeSaved(data: Saved) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or blocked: the board still works, it just won't persist.
  }
}

export default function ScrapbookBoard({ photos }: { photos: HobbyPhoto[] }) {
  const boardRef = useRef<HTMLDivElement>(null);
  const defaults = useRef(defaultItems(photos));
  const [items, setItems] = useState<Item[]>(defaults.current);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [mode, setMode] = useState<Mode>("select");
  const [ink, setInk] = useState<Ink>("#2b2420");
  const [penSize, setPenSize] = useState<number>(6);
  const [tapePattern, setTapePattern] = useState<TapePattern>("dots");
  const [sticker, setSticker] = useState<StickerKind>("star");
  const [live, setLive] = useState<[number, number][] | null>(null);
  const [liveTape, setLiveTape] = useState<{ x: number; y: number; x2: number; y2: number } | null>(null);
  const [message, setMessage] = useState("");

  // Restore the visitor's board after mount (no SSR mismatch).
  useEffect(() => {
    const saved = readSaved();
    if (saved) {
      setItems(saved.items);
      setStrokes(saved.strokes);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) writeSaved({ v: 1, items, strokes });
  }, [items, strokes, loaded]);

  // Board coordinates from a pointer event.
  const toBoard = (event: { clientX: number; clientY: number }): [number, number] => {
    const rect = boardRef.current!.getBoundingClientRect();
    return [((event.clientX - rect.left) / rect.width) * W, ((event.clientY - rect.top) / rect.height) * H];
  };

  const onBoardDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (mode === "pen") {
      boardRef.current?.setPointerCapture(event.pointerId);
      setLive([toBoard(event)]);
    } else if (mode === "tape") {
      boardRef.current?.setPointerCapture(event.pointerId);
      const [x, y] = toBoard(event);
      setLiveTape({ x, y, x2: x, y2: y });
    } else if (mode === "sticker") {
      const [x, y] = toBoard(event);
      const id = `st-${Date.now()}`;
      setItems((prev) => [...prev, { kind: "sticker", id, x: x / 10 - 3, y: y / 8 - 3, rot: tiltFor(id), sticker }]);
    }
  };

  const onBoardMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (mode === "pen" && live) {
      setLive((pts) => (pts ? [...pts, toBoard(event)] : pts));
    } else if (mode === "tape" && liveTape) {
      const [x2, y2] = toBoard(event);
      setLiveTape((t) => (t ? { ...t, x2, y2 } : t));
    }
  };

  const onBoardUp = () => {
    if (mode === "pen" && live && live.length > 1) {
      const id = `k-${Date.now()}`;
      setStrokes((prev) => [...prev, { id, color: ink, size: penSize, points: live }]);
    }
    if (mode === "tape" && liveTape) {
      const dx = liveTape.x2 - liveTape.x;
      const dy = liveTape.y2 - liveTape.y;
      const len = Math.hypot(dx, dy);
      if (len > 40) {
        const id = `t-${Date.now()}`;
        setItems((prev) => [
          ...prev,
          {
            kind: "tape",
            id,
            x: liveTape.x / 10,
            y: liveTape.y / 8,
            rot: 0,
            len,
            angle: (Math.atan2(dy, dx) * 180) / Math.PI,
            pattern: tapePattern,
          },
        ]);
      }
    }
    setLive(null);
    setLiveTape(null);
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((it) => it.id !== id));
  const removeStroke = (id: string) => setStrokes((prev) => prev.filter((s) => s.id !== id));

  // Raise a piece to the top of the stack on grab.
  const raise = (id: string) =>
    setItems((prev) => {
      const at = prev.findIndex((it) => it.id === id);
      if (at < 0 || at === prev.length - 1) return prev;
      const next = [...prev];
      const [it] = next.splice(at, 1);
      next.push(it);
      return next;
    });

  const moveItem = (id: string, dx: number, dy: number) =>
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, x: Math.min(96, Math.max(-2, it.x + dx)), y: Math.min(96, Math.max(-2, it.y + dy)) } : it
      )
    );

  const onItemKey = (event: KeyboardEvent<HTMLDivElement>, id: string) => {
    const step = event.shiftKey ? 6 : 1.5;
    const map: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const d = map[event.key];
    if (d) {
      event.preventDefault();
      moveItem(id, d[0], d[1]);
    }
  };

  const saveImage = async () => {
    if (!boardRef.current) return;
    setMessage("saving…");
    try {
      const { toPng } = await import("html-to-image");
      const url = await toPng(boardRef.current, { pixelRatio: 2, cacheBust: true });
      const a = document.createElement("a");
      a.href = url;
      a.download = "my-scrapbook.png";
      a.click();
      setMessage("saved");
    } catch {
      setMessage("couldn't save the image, try again");
    }
  };

  const reset = () => {
    if (!window.confirm("Clear the board back to the starting layout?")) return;
    setItems(defaults.current);
    setStrokes([]);
  };

  const drawing = mode === "pen" || mode === "tape" || mode === "sticker";
  const itemsInteractive = mode === "select" || mode === "eraser";

  const modeButton = (value: Mode, label: string) => (
    <button
      type="button"
      className="tool"
      aria-pressed={mode === value}
      onClick={() => setMode(value)}
    >
      {label}
    </button>
  );

  return (
    <div className="scrapbook">
      <div
        ref={boardRef}
        className={`scrap-board ${drawing ? "is-drawing" : ""}`}
        data-mode={mode}
        onPointerDown={onBoardDown}
        onPointerMove={onBoardMove}
        onPointerUp={onBoardUp}
        onPointerCancel={onBoardUp}
        role="application"
        aria-label="Scrapbook board. Drag photos and stickers, or use the tools below."
      >
        <svg className="ink-layer" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
          {strokes.map((s) => (
            <path
              key={s.id}
              d={strokePath(s.points, s.size)}
              fill={s.color}
              className={mode === "eraser" ? "erasable" : ""}
              onPointerDown={(e) => {
                if (mode !== "eraser") return;
                e.stopPropagation();
                removeStroke(s.id);
              }}
            />
          ))}
          {live && live.length > 1 && <path d={strokePath(live, penSize)} fill={ink} />}
          {liveTape && (
            <line x1={liveTape.x} y1={liveTape.y} x2={liveTape.x2} y2={liveTape.y2} stroke="#f2b8c6" strokeWidth="26" strokeOpacity="0.8" />
          )}
        </svg>

        {items.map((item) => {
          const style: CSSProperties = { left: `${item.x}%`, top: `${item.y}%` };
          return (
            <div key={item.id} className="piece" style={style} data-kind={item.kind}>
              <motion.div
                className="drag"
                drag={mode === "select"}
                dragMomentum={false}
                dragSnapToOrigin
                onDragStart={() => raise(item.id)}
                onDragEnd={(_, info) => {
                  const rect = boardRef.current!.getBoundingClientRect();
                  moveItem(item.id, (info.offset.x / rect.width) * 100, (info.offset.y / rect.height) * 100);
                }}
                onPointerDown={(e) => {
                  if (mode === "eraser") {
                    e.stopPropagation();
                    removeItem(item.id);
                  }
                }}
                tabIndex={mode === "select" ? 0 : -1}
                onKeyDown={(e) => mode === "select" && onItemKey(e, item.id)}
                aria-label={
                  item.kind === "polaroid"
                    ? `Photo: ${item.name}. Arrow keys move it.`
                    : item.kind === "tape"
                      ? "Washi tape. Arrow keys move it."
                      : `Sticker: ${stickerArt[item.sticker].label}. Arrow keys move it.`
                }
                style={{
                  rotate: item.kind === "tape" ? item.angle : item.rot,
                  width: item.kind === "tape" ? `${item.len / 10}%` : undefined,
                  transformOrigin: item.kind === "tape" ? "0 50%" : undefined,
                  cursor: mode === "select" ? "grab" : undefined,
                  pointerEvents: itemsInteractive ? "auto" : "none",
                }}
              >
                {item.kind === "tape" ? (
                  <div className="tape-strip" style={{ background: tapeBg[item.pattern] }} />
                ) : item.kind === "polaroid" ? (
                  <figure className="polaroid">
                    <img src={item.src} alt="" loading="lazy" decoding="async" draggable={false} />
                    <figcaption className="font-hand">
                      {item.caption && !item.caption.startsWith("TODO") ? item.caption : item.name}
                    </figcaption>
                  </figure>
                ) : (
                  <svg className="sticker" viewBox="0 0 40 40" aria-hidden="true">
                    {stickerArt[item.sticker].svg}
                  </svg>
                )}
              </motion.div>
            </div>
          );
        })}
      </div>

      <div className="toolbar" role="toolbar" aria-label="Scrapbook tools">
        {modeButton("select", "move")}
        <div className="tool-group" aria-label="Washi tape">
          {modeButton("tape", "washi tape")}
          {tapePatterns.map((p) => (
            <button key={p} type="button" className="swatch tape-swatch" aria-label={`${p} tape`} aria-pressed={tapePattern === p} onClick={() => { setTapePattern(p); setMode("tape"); }} style={{ background: tapeBg[p] }} />
          ))}
        </div>
        <div className="tool-group" aria-label="Pen">
          {modeButton("pen", "pen")}
          {inks.map((c) => (
            <button key={c} type="button" className="swatch" aria-label={`ink ${c}`} aria-pressed={ink === c} onClick={() => { setInk(c); setMode("pen"); }} style={{ background: c }} />
          ))}
          <button type="button" className="tool" aria-pressed={penSize === 3} onClick={() => setPenSize(3)}>fine</button>
          <button type="button" className="tool" aria-pressed={penSize === 9} onClick={() => setPenSize(9)}>bold</button>
        </div>
        {modeButton("eraser", "eraser")}
        <div className="tool-group sticker-tray" aria-label="Stickers">
          {stickerKinds.map((k) => (
            <button
              key={k}
              type="button"
              className="sticker-btn"
              aria-label={`place ${stickerArt[k].label}`}
              aria-pressed={mode === "sticker" && sticker === k}
              onClick={() => {
                setSticker(k);
                setMode("sticker");
              }}
            >
              <svg viewBox="0 0 40 40" aria-hidden="true">{stickerArt[k].svg}</svg>
            </button>
          ))}
        </div>
        <button type="button" className="tool" onClick={saveImage}>save my page</button>
        <button type="button" className="tool" onClick={reset}>reset board</button>
        <span className="sr-only" aria-live="polite">{message}</span>
      </div>
      {message && <p className="font-mono text-xs text-ink-soft mt-2" aria-live="polite">{message}</p>}
    </div>
  );
}
