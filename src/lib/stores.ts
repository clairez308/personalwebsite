import { atom } from "nanostores";

// Cross-island state. Astro islands don't share React context, so anything
// more than one island needs goes through a nanostore.

// id of the page section currently in view (matches a divider tab).
export const activeSection = atom<string>("");
