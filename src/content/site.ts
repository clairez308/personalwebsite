// Site-wide copy and links. Plain typed export: edit text here, not in components.

export const site = {
  name: "Claire Zhang",
  title: "Claire Zhang",
  description:
    "Claire Zhang: CS student at UBC building toward product management. Projects, experience, reflections and a postcard.",
  url: "https://clairezhang.vercel.app",

  hero: {
    headline: "Hi, I'm Claire.",
    handwritten: "CS @ UBC → building toward product management",
    lede: "Welcome to my portfolio! I'm a CS student @ UBC interested in product management, tech consulting, and data.",
    tags: ["pm", "data", "consulting"],
    // Hand-drawn margin notes around the photo (§5.2).
    annotations: [
      "chronic sticky-note user",
      "currently: VP Events @ PMC",
      "incoming @ Arc'teryx",
      "will talk about UX for hours",
    ],
  },

  // Divider tabs, in page order. `id` must match the section's id.
  sections: [
    { id: "work", label: "work" },
    { id: "experience", label: "experience" },
    { id: "journal", label: "journal" },
    { id: "play", label: "play" },
    { id: "say-hi", label: "say hi" },
  ],

  resumePath: "/Claire_Zhang_Resume.pdf",
  socials: {
    linkedin: "https://www.linkedin.com/in/claire-zhang-985410301/",
    github: "https://github.com/clairez308",
    email: "clairezhang838@gmail.com",
  },
} as const;
