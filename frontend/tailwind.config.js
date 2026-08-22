/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			colors: {
				background: '#020617',
				foreground: '#ffffff',
			},
			fontFamily: {
				sans: ['var(--font-outfit)', 'sans-serif'],
				serif: ['var(--font-playfair)', 'serif'],
				mono: ['var(--font-source-code)', 'monospace'],
			},
		},
	},
	plugins: [],
};
