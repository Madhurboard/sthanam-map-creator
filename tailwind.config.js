/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./index.html",
		"./main.js",
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			colors: {
				background: '#f8f9fa',
				sidebar: '#ffffff',
			},
			fontFamily: {
				sans: ['Outfit', 'sans-serif'],
				serif: ['"Playfair Display"', 'serif'],
				mono: ['"Fira Code"', 'monospace'],
				poster: ['Outfit', 'sans-serif'],
			}
		},
	},
	plugins: [],
}
