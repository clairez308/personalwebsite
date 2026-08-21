import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    url: z.string().url(),
    // Real, sortable date this shipped (its "release date") — drives both
    // display order and the version number assigned in index.astro.
    date: z.coerce.date(),
    // Free-text display version of the same date ("Jun 2025 – Present").
    period: z.string(),
    result: z.string().optional(),
    image: z.string().optional(),
    bullets: z.array(z.string()),
    stack: z.array(z.string()),
  }),
});

// One shared shape for a "stat block": a big number plus a short label,
// used on the brief, problem, and impact sections of a case study.
const stat = z.object({
  value: z.string(),
  label: z.string(),
});

// Every case study section is a labeled, headed block, but the body shape
// differs by type. Discriminated union keeps that flexible while still
// type-checking each variant, so the next case study just picks the
// section types it needs.
const section = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("text"),
    label: z.string(),
    heading: z.string(),
    paragraphs: z.array(z.string()),
    stats: z.array(stat).optional(),
    image: z
      .object({
        src: z.string(),
        alt: z.string(),
        caption: z.string().optional(),
      })
      .optional(),
  }),
  z.object({
    type: z.literal("personas"),
    label: z.string(),
    heading: z.string(),
    intro: z.string(),
    personas: z.array(
      z.object({
        name: z.string(),
        role: z.string(),
        points: z.array(z.string()),
      })
    ),
  }),
  z.object({
    type: z.literal("signals"),
    label: z.string(),
    heading: z.string(),
    intro: z.string(),
    items: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
        source: z.string(),
      })
    ),
  }),
  z.object({
    type: z.literal("solution"),
    label: z.string(),
    heading: z.string(),
    intro: z.string(),
    systems: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
      })
    ),
    views: z.array(
      z.object({
        heading: z.string(),
        items: z.array(z.string()),
      })
    ),
  }),
  z.object({
    type: z.literal("roadmap"),
    label: z.string(),
    heading: z.string(),
    intro: z.string(),
    core: z.object({ heading: z.string(), items: z.array(z.string()) }),
    later: z.array(
      z.object({ heading: z.string(), items: z.array(z.string()) })
    ),
  }),
  z.object({
    type: z.literal("compare"),
    label: z.string(),
    heading: z.string(),
    intro: z.string(),
    columns: z.tuple([z.string(), z.string()]),
    rows: z.array(
      z.object({
        capability: z.string(),
        left: z.enum(["yes", "partial", "no"]),
        right: z.enum(["yes", "partial", "no"]),
      })
    ),
  }),
  z.object({
    type: z.literal("stats"),
    label: z.string(),
    heading: z.string(),
    intro: z.string().optional(),
    stats: z.array(stat),
    quote: z.string().optional(),
  }),
]);

const caseStudies = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/case-studies" }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    date: z.coerce.date(),
    period: z.string(),
    competition: z.string(),
    hostedBy: z.string(),
    deliverables: z.array(
      z.object({
        label: z.string(),
        url: z.string().url().optional(),
      })
    ),
    result: z.string(),
    description: z.string(),
    featuredStats: z.array(stat),
    sections: z.array(section),
  }),
});

export const collections = { projects, caseStudies };
