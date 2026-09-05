/**
 * The one place the site's public URL is declared.
 *
 * Everything that emits an absolute URL (metadata, canonical, OpenGraph,
 * sitemap, robots, JSON-LD) reads it from here, so the site can move without
 * a hunt through the app. Override per environment with
 * `NEXT_PUBLIC_SITE_URL`; the fallback is the current deployment.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://dantolu35.vercel.app";

/** The site URL without its scheme, for display. */
export const SITE_DOMAIN = SITE_URL.replace(/^https?:\/\//, "");

/** Absolute URL for a path, e.g. absoluteUrl("/project/x"). */
export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}
