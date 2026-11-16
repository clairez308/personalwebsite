import type { CSSProperties } from "react";
import { useStore } from "@nanostores/react";
import FlipCard from "./FlipCard";
import { activeProject, deckPinned } from "../lib/stores";

export interface DeckItem {
  id: string;
  version: string;
  title: string;
  period: string;
  year: string;
  image: string;
  result?: string;
  description?: string;
  stack: string[];
  links: { label: string; href: string }[];
  flagship: boolean;
  callouts: string[];
  rotate: number;
}

// The Projects deck: one flip card per project. Desktop shows one at a time
// (driven by the pinned scroll in scripts/projects.ts); mobile shows a swipeable row.
export default function ProjectDeck({ items }: { items: DeckItem[] }) {
  const active = useStore(activeProject);
  const pinned = useStore(deckPinned);

  return (
    <div className="deck">
      {items.map((item, i) => {
        const isActive = i === active;
        return (
          <div
            key={item.id}
            id={`work-${item.id}`}
            className="deck-item"
            data-active={isActive}
            data-index={i}
            inert={pinned && !isActive ? true : undefined}
            style={{ "--rot": `${item.rotate}deg` } as CSSProperties}
          >
            <FlipCard
              width={300}
              height={480}
              radius={6}
              background="#fbf7ef"
              color="#2b2420"
              shadowColor="#2b2420"
              shadowOpacity={0.22}
              tilt={false}
              glare={false}
              draggable={false}
              ariaLabel={`${item.title}: flip for details`}
              front={
                <div className="face-front">
                  <img src={item.image} alt="" loading="lazy" decoding="async" />
                  <span className="washi" aria-hidden="true" />
                  <p className="front-title font-display">{item.title}</p>
                  <span className="flip-note font-hand" aria-hidden="true">flip me ↻</span>
                </div>
              }
              back={
                <div className="face-back">
                  <p className="font-mono text-xs text-ink-soft">
                    {item.version} · {item.period}
                  </p>
                  <h3 className="font-display mt-1 text-2xl leading-tight">{item.title}</h3>
                  {item.result && (
                    <p className="mt-3 text-sm">
                      <mark className="highlight">{item.result}</mark>
                    </p>
                  )}
                  {item.description && <p className="mt-3 text-[0.92rem] leading-snug">{item.description}</p>}
                  {item.stack.length > 0 && (
                    <ul className="mt-4 flex flex-wrap gap-1.5 font-mono text-[0.7rem] text-ink-soft">
                      {item.stack.map((s) => (
                        <li key={s} className="rounded-sm bg-paper-deep px-1.5 py-0.5">
                          {s}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              }
            />

            {item.flagship && (
              <ul className="callouts" aria-label="Atlas highlights">
                {item.callouts.map((c) => (
                  <li key={c} className="font-hand text-xl leading-tight">
                    {c}
                  </li>
                ))}
              </ul>
            )}

            <ul className="stamps">
              {item.links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} target={link.href.startsWith("/") ? undefined : "_blank"} rel={link.href.startsWith("/") ? undefined : "noopener"} className="stamp">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
