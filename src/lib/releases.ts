import { getCollection, type CollectionEntry } from "astro:content";

export interface Release {
  version: string;
  anchor: string;
  href: string;
  date: Date;
  period: string;
  title: string;
  isFlagship: boolean;
  isCurrent: boolean;
  kind: "project" | "case-study";
  project?: CollectionEntry<"projects">;
  caseStudy?: CollectionEntry<"caseStudies">;
}

// The whole site's "release history": every project and every case study,
// merged by real date and numbered like a changelog (v1.0 is the oldest
// thing shipped, the highest number is whatever's newest right now). Case
// studies are flagged as the flagship release in that sequence rather than
// numbered separately, since there's usually just one or two of them.
export async function getReleases(): Promise<Release[]> {
  const [projects, caseStudies] = await Promise.all([
    getCollection("projects"),
    getCollection("caseStudies"),
  ]);

  const merged = [
    ...projects.map((entry) => ({
      kind: "project" as const,
      date: entry.data.date,
      period: entry.data.period,
      title: entry.data.title,
      project: entry,
      caseStudy: undefined as CollectionEntry<"caseStudies"> | undefined,
    })),
    ...caseStudies.map((entry) => ({
      kind: "case-study" as const,
      date: entry.data.date,
      period: entry.data.period,
      title: entry.data.title,
      project: undefined as CollectionEntry<"projects"> | undefined,
      caseStudy: entry,
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  return merged.map((item, index) => {
    const anchor = `v1-${index}`;
    return {
      version: `v1.${index}`,
      anchor,
      href:
        item.kind === "case-study"
          ? `/case-studies/${item.caseStudy!.id}`
          : `/#${anchor}`,
      date: item.date,
      period: item.period,
      title: item.title,
      isFlagship: item.kind === "case-study",
      isCurrent: index === merged.length - 1,
      kind: item.kind,
      project: item.project,
      caseStudy: item.caseStudy,
    };
  });
}
