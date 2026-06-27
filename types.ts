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

// A unit of editable content in the headless-cms item model: any record with an id.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Item = Record<string, any> & { id: string };

/** Alias kept for the existing type guards (isProject, …). */
export type Section = Item;

export type ItemMap = Record<string, Item[]>;
