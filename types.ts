export type Project = {
  id: number | string;
  thumbnail: string;
  medias: { link: string; type: "image" | "video" }[];
  title: string;
  description: string;
  content?: string;
  link: string;
  github: string;
  role: string;
  date: string;
  type: string | "challenge" | "contract" | "freelance";
};

export type Skill = {
  id: number | string;
  key: string;
  value: string;
  skillLevel: number;
  description: string;
  img: string;
  color?: string;
};

export type Experience = {
  id: number | string;
  position: {
    title: string;
    role: string;
    duration: string;
  };
  company: {
    name: string;
    location: string;
    link: string;
    logo: string;
  };
  skills: Skill[];
};

// The CMS item model comes from better-content. It used to be redeclared here
// as Record<string, any> to work around field reads typing as unknown; reads
// now take a type argument instead, so the loose copy is gone.
export type { Item, ItemMap } from "better-content/core";

/** Alias kept for the existing type guards (isProject, …). */
export type Section = import("better-content/core").Item;
