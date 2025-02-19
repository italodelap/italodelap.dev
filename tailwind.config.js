/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: ['selector', '[data-theme="dark"]'],
	theme: {
		extend: {
			backgroundImage: {
				"gradient": "url('/gradient.svg')",
			},
			fontFamily: {
				"space-mono": "Space Mono"
			}
		},
	},
	plugins: [require("tailwindcss-animated")],
}
