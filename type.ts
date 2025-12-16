export type Project = {
	id: number | string;
	thumbnail: string;
	medias: {link: string; type: 'image' | 'video'}[];
	title: string;
	description: string;
	content?: string;
	link: string;
	github: string;
	role: string;
	date: string;
	type: string | 'challenge' | 'contract' | 'freelance';
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
