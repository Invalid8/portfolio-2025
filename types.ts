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

export interface Bio {
  id: string;
  name: string;
  username: string;
  about: {
    summary: string;
    fullDetails: string;
  };
  description: string;
  links: {
    github: string;
    linkedin: string;
    resume: string;
  };
}

type Optional<T> = T | undefined | null;

export type UserType = {
  displayName: Optional<string>;
  photoURL: Optional<string>;
  uid: string;
  email: Optional<string>;
};

// Generic content block
export interface ContentBlock {
  id: string;
  type: string; // e.g., 'text', 'image', 'marquee'
  value: string | string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  style?: Record<string, any>; // optional styles like color, bold
}

// Banner Section
export interface BannerSection {
  heading: ContentBlock[];
  subheading: ContentBlock[];
  marqueeList: string[];
}

// Project Item
export interface ProjectItem {
  id: string;
  title: ContentBlock[];
  description: ContentBlock[];
  link?: string;
  order: number;
}

// Experience Item
export interface ExperienceItem {
  id: string;
  role: ContentBlock[];
  company: ContentBlock[];
  dateRange: string;
  description: ContentBlock[];
}

// Homepage Schema
export interface HomePageContent {
  banner: BannerSection;
  about: ContentBlock[];
  projects: ProjectItem[];
  experience: ExperienceItem[];
  skills: string[];
  contact: ContentBlock[];
}
