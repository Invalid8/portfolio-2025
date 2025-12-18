import type {Experience} from '@/types';

export const experiences: Experience[] = [
	{
		id: 1,
		position: {
			title: 'Frontend Developer',
			role: 'Led the development of responsive and user-friendly websites, ensuring cross-browser compatibility and seamless user experiences.',
			duration: '2019 - 2020'
		},
		company: {
			name: 'Integrity Ventures',
			location: 'Lagos, Nigeria',
			link: '',
			logo: '/path-to-logo/integrity-ventures-logo.png' // Replace with the actual logo URL if available
		},
		skills: []
	},
	{
		id: 2,
		position: {
			title: 'Frontend Developer',
			role: 'Developed high-quality web applications as a freelancer, focusing on e-commerce platforms, SEO optimization, and single-page applications for a diverse range of clients.',
			duration: '2020 - 2023'
		},
		company: {
			name: 'Upwork',
			location: 'Remote',
			link: 'https://www.upwork.com',
			logo: '/path-to-logo/upwork-logo.png' // Replace with the actual logo URL if available
		},
		skills: []
	},
	{
		id: 3,
		position: {
			title: 'Frontend Developer',
			role: 'Created and maintained a scalable component library using React and TypeScript, significantly reducing development time across multiple projects.',
			duration: 'Feb 2024 - Apr 2024'
		},
		company: {
			name: 'Hynitr',
			location: 'Remote',
			link: '',
			logo: '/path-to-logo/hynitr-logo.png' // Replace with the actual logo URL if available
		},
		skills: []
	},
	{
		id: 4,
		position: {
			title: 'Frontend Developer',
			role: 'Architect and maintain scalable frontend systems using modern frameworks, ensuring optimal performance and seamless user experiences for The Gigs platform.',
			duration: 'May 2024 - Jan 2025'
		},
		company: {
			name: 'TheGigs',
			location: 'Remote',
			link: 'https://thegigs.co',
			logo: '/path-to-logo/thegigs-logo.png' // Replace with the actual logo URL if available
		},
		skills: []
	}
];
