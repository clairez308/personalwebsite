import { defineCollection, z } from "astro:content";
import { glob, file } from "astro/loaders";

// A changelog line: tagged like a commit (what kind of change this was),
// with an optional before/after pair for the rare bullet that's a literal
// diff (a metric that got corrected, not just improved).
const bullet = z.object({
  tag: z.enum(["shipped", "fixed", "improved", "skill"]).default("shipped"),
  text: z.string(),
  diff: z
    .object({
      from: z.string(),
      to: z.string(),
    })
    .optional(),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    url: z.url(),
    // Real, sortable date this shipped (its "release date") — drives both
    // display order and the version number assigned in index.astro.
    date: z.coerce.date(),
    // Free-text display version of the same date ("Jun 2025 – Present").
    period: z.string(),
    result: z.string().optional(),
    image: z.string().optional(),
    bullets: z.array(bullet),
    stack: z.array(z.string()),
    // Card-face fields for the Projects section. Optional until they're
    // written: nothing is drafted here yet (see the TODO list).
    oneLiner: z.string().optional(),
    role: z.string().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    links: z
      .object({
        live: z.url().optional(),
        github: z.url().optional(),
        caseStudy: z.string().optional(),
      })
      .optional(),
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
        url: z.url().optional(),
      })
    ),
    result: z.string(),
    description: z.string(),
    featuredStats: z.array(stat),
    sections: z.array(section),
  }),
});

// A personal, dated note about an event, project, or moment — written as a
// short story rather than a bullet, with any number of photos. The
// reflection itself is the markdown body of the file, not a frontmatter
// field, so writing one just means writing a normal note.
const reflections = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/reflections" }),
  schema: z.object({
    date: z.coerce.date(),
    period: z.string(),
    title: z.string(),
    tag: z.string().optional(),
    photos: z.array(z.string()).optional(),
    // Optional. When missing, the Journal parses the "**Key learning:**"
    // paragraph out of the body (see src/lib/reflections.ts).
    keyLearning: z.string().optional(),
  }),
});

// Experience entries (formerly the infraEntries array in index.astro).
// Loaded from one YAML file so the copy can be edited without touching code.
const experiences = defineCollection({
  loader: file("./src/content/experiences.yaml"),
  schema: z.object({
    org: z.string(),
    role: z.string(),
    dates: z.string(),
    category: z.enum(["work", "leadership", "community"]),
    summary: z.string(),
    bullets: z.array(z.string()).max(3).default([]),
    logo: z.string(),
    image: z.string().optional(),
    url: z.url().optional(),
    current: z.boolean().optional(),
    incoming: z.boolean().optional(),
  }),
});

// Beyond-work photos for the scrapbook. One item per photo for now.
const hobbies = defineCollection({
  loader: file("./src/content/hobbies.yaml"),
  schema: z.object({
    name: z.string(),
    photos: z.array(z.string()).min(1),
    caption: z.string(),
  }),
});

export const collections = { projects, caseStudies, reflections, experiences, hobbies };
