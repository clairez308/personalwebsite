import { atom } from "nanostores";

// Cross-island state. Astro islands don't share React context, so anything
// more than one island needs goes through a nanostore.

// id of the page section currently in view (matches a divider tab).
export const activeSection = atom<string>("");

// Index of the project in view on the Projects deck (desktop stepping).
export const activeProject = atom<number>(0);

// True while the Projects section is pinned (desktop). Inactive cards go inert then.
export const deckPinned = atom<boolean>(false);
