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

export interface Section {
  id: string;
  collection: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export type SectionMap = Record<string, Section>;

export type NestedSections = {
  [collection: string]: {
    [key: string]: Section;
  };
};

interface PendingImage {
  file: File;
  localUrl: string;
  sectionKey: string;
  fieldKey: string;
  collection: string;
  docId: string;
}
