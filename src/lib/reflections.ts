import type { CollectionEntry } from "astro:content";

// Pulls the "**Key learning:** ..." line out of a reflection. Prefers the
// explicit `keyLearning` frontmatter field when it's set.
export function keyLearningOf(entry: CollectionEntry<"reflections">): string | undefined {
  if (entry.data.keyLearning) return entry.data.keyLearning;
  const match = entry.body?.match(/^\*\*Key learning:\*\*\s*(.+)$/m);
  return match ? match[1].trim() : undefined;
}

// The body with the key-learning paragraph removed, for spreads that show
// the key learning separately. Returns the raw markdown.
export function bodyWithoutKeyLearning(entry: CollectionEntry<"reflections">): string {
  return (entry.body ?? "").replace(/^\*\*Key learning:\*\*.*$/m, "").replace(/\n{3,}/g, "\n\n").trim();
}
