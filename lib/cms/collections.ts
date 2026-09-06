import type { ItemMapLoadConfig } from "better-content/server";

// Portfolio singletons live in the `portfolio` collection, addressed by id.
export const PORTFOLIO_SECTIONS = [
  "navbar",
  "banner",
  "about",
  "stats",
  "images",
  "projects-header",
  "experience-header",
  "skills-header",
  "contact",
] as const;

/**
 * The content the site renders, in one place so the server layout and the
 * public read route cannot drift apart. It is also the allowlist: the route
 * can only ever return these collections.
 */
export const CONTENT_COLLECTIONS: ItemMapLoadConfig = {
  portfolio: {
    defaults: PORTFOLIO_SECTIONS.map((id) => ({ id })),
    merge: "byId",
    fallback: PORTFOLIO_SECTIONS.map((id) => ({ id })),
  },
  projects: { fallback: [] },
  experiences: { fallback: [] },
  skills: { fallback: [] },
};
