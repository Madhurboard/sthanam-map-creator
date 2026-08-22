import {
	Outfit,
	Playfair_Display,
	Bebas_Neue,
	Caveat,
	Cormorant_Garamond,
	Dancing_Script,
	Inter,
	Lora,
	Merriweather,
	Montserrat,
	Raleway,
	Open_Sans,
	Oswald,
	Source_Code_Pro,
	Noto_Sans_Devanagari,
	Noto_Serif_Devanagari,
	Tiro_Devanagari_Hindi,
	Rozha_One,
	Yatra_One,
	Mukta,
	Kalam,
	Baloo_2,
} from 'next/font/google';

/*
 * Every poster font is self-hosted through next/font so the export path never
 * depends on a cross-origin stylesheet — html2canvas struggles to read font
 * faces it cannot reach same-origin, and Devanagari conjuncts are exactly where
 * a missing face shows up as tofu.
 *
 * Only the two defaults are preloaded; the rest are fetched on first use.
 */

/*
 * next/font analyses these calls at build time, so every option has to be an
 * inline literal — no spreads, no shared constants, no computed values.
 */

export const outfit = Outfit({ subsets: ['latin'], display: 'swap', variable: '--font-outfit' });
export const playfair = Playfair_Display({ subsets: ['latin'], display: 'swap', variable: '--font-playfair' });

const bebas = Bebas_Neue({ subsets: ['latin'], display: 'swap', weight: '400', variable: '--font-bebas', preload: false });
const caveat = Caveat({ subsets: ['latin'], display: 'swap', variable: '--font-caveat', preload: false });
const cormorant = Cormorant_Garamond({ subsets: ['latin'], display: 'swap', weight: ['400', '600', '700'], variable: '--font-cormorant', preload: false });
const dancing = Dancing_Script({ subsets: ['latin'], display: 'swap', variable: '--font-dancing', preload: false });
const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter', preload: false });
const lora = Lora({ subsets: ['latin'], display: 'swap', variable: '--font-lora', preload: false });
const merriweather = Merriweather({ subsets: ['latin'], display: 'swap', weight: ['400', '700', '900'], variable: '--font-merriweather', preload: false });
const montserrat = Montserrat({ subsets: ['latin'], display: 'swap', variable: '--font-montserrat', preload: false });
const raleway = Raleway({ subsets: ['latin'], display: 'swap', variable: '--font-raleway', preload: false });
const openSans = Open_Sans({ subsets: ['latin'], display: 'swap', variable: '--font-open-sans', preload: false });
const oswald = Oswald({ subsets: ['latin'], display: 'swap', variable: '--font-oswald', preload: false });
const sourceCode = Source_Code_Pro({ subsets: ['latin'], display: 'swap', variable: '--font-source-code', preload: false });

const notoSansDeva = Noto_Sans_Devanagari({ subsets: ['devanagari', 'latin'], display: 'swap', variable: '--font-noto-sans-deva', preload: false });
const notoSerifDeva = Noto_Serif_Devanagari({ subsets: ['devanagari', 'latin'], display: 'swap', variable: '--font-noto-serif-deva', preload: false });
const tiroDeva = Tiro_Devanagari_Hindi({ subsets: ['devanagari', 'latin'], display: 'swap', weight: '400', variable: '--font-tiro-deva', preload: false });
const rozhaOne = Rozha_One({ subsets: ['devanagari', 'latin'], display: 'swap', weight: '400', variable: '--font-rozha', preload: false });
const yatraOne = Yatra_One({ subsets: ['devanagari', 'latin'], display: 'swap', weight: '400', variable: '--font-yatra', preload: false });
const mukta = Mukta({ subsets: ['devanagari', 'latin'], display: 'swap', weight: ['400', '600', '700'], variable: '--font-mukta', preload: false });
const kalam = Kalam({ subsets: ['devanagari', 'latin'], display: 'swap', weight: ['400', '700'], variable: '--font-kalam', preload: false });
const baloo = Baloo_2({ subsets: ['devanagari', 'latin'], display: 'swap', variable: '--font-baloo', preload: false });

/** Applied to <body> so every CSS variable resolves anywhere in the tree. */
export const fontVariables = [
	outfit, playfair, bebas, caveat, cormorant, dancing, inter, lora,
	merriweather, montserrat, raleway, openSans, oswald, sourceCode,
	notoSansDeva, notoSerifDeva, tiroDeva, rozhaOne, yatraOne, mukta, kalam, baloo,
].map(f => f.variable).join(' ');

export type FontScript = 'latin' | 'devanagari';

export interface FontOption {
	label: string;
	/** CSS font-family value stored in state and applied to poster text. */
	value: string;
	script: FontScript;
	/** Short sample rendered in the picker so the user sees the actual face. */
	sample: string;
}

const LATIN_SAMPLE = 'Mumbai';
const DEVA_SAMPLE = 'मुंबई';

export const LATIN_FONTS: FontOption[] = [
	{ label: 'Playfair Display', value: 'var(--font-playfair), serif', script: 'latin', sample: LATIN_SAMPLE },
	{ label: 'Outfit', value: 'var(--font-outfit), sans-serif', script: 'latin', sample: LATIN_SAMPLE },
	{ label: 'Bebas Neue', value: 'var(--font-bebas), sans-serif', script: 'latin', sample: LATIN_SAMPLE },
	{ label: 'Oswald', value: 'var(--font-oswald), sans-serif', script: 'latin', sample: LATIN_SAMPLE },
	{ label: 'Cormorant Garamond', value: 'var(--font-cormorant), serif', script: 'latin', sample: LATIN_SAMPLE },
	{ label: 'Lora', value: 'var(--font-lora), serif', script: 'latin', sample: LATIN_SAMPLE },
	{ label: 'Merriweather', value: 'var(--font-merriweather), serif', script: 'latin', sample: LATIN_SAMPLE },
	{ label: 'Montserrat', value: 'var(--font-montserrat), sans-serif', script: 'latin', sample: LATIN_SAMPLE },
	{ label: 'Raleway', value: 'var(--font-raleway), sans-serif', script: 'latin', sample: LATIN_SAMPLE },
	{ label: 'Inter', value: 'var(--font-inter), sans-serif', script: 'latin', sample: LATIN_SAMPLE },
	{ label: 'Open Sans', value: 'var(--font-open-sans), sans-serif', script: 'latin', sample: LATIN_SAMPLE },
	{ label: 'Caveat', value: 'var(--font-caveat), cursive', script: 'latin', sample: LATIN_SAMPLE },
	{ label: 'Dancing Script', value: 'var(--font-dancing), cursive', script: 'latin', sample: LATIN_SAMPLE },
	{ label: 'Source Code Pro', value: 'var(--font-source-code), monospace', script: 'latin', sample: LATIN_SAMPLE },
];

export const DEVANAGARI_FONTS: FontOption[] = [
	{ label: 'Noto Serif Devanagari', value: 'var(--font-noto-serif-deva), serif', script: 'devanagari', sample: DEVA_SAMPLE },
	{ label: 'Noto Sans Devanagari', value: 'var(--font-noto-sans-deva), sans-serif', script: 'devanagari', sample: DEVA_SAMPLE },
	{ label: 'Tiro Devanagari', value: 'var(--font-tiro-deva), serif', script: 'devanagari', sample: DEVA_SAMPLE },
	{ label: 'Rozha One', value: 'var(--font-rozha), serif', script: 'devanagari', sample: DEVA_SAMPLE },
	{ label: 'Yatra One', value: 'var(--font-yatra), cursive', script: 'devanagari', sample: DEVA_SAMPLE },
	{ label: 'Mukta', value: 'var(--font-mukta), sans-serif', script: 'devanagari', sample: DEVA_SAMPLE },
	{ label: 'Baloo 2', value: 'var(--font-baloo), sans-serif', script: 'devanagari', sample: DEVA_SAMPLE },
	{ label: 'Kalam', value: 'var(--font-kalam), cursive', script: 'devanagari', sample: DEVA_SAMPLE },
];

export const ALL_FONTS: FontOption[] = [...LATIN_FONTS, ...DEVANAGARI_FONTS];

/**
 * State persisted before self-hosted fonts stored literal family names that no
 * longer resolve. Map the old values onto their CSS-variable equivalents so a
 * returning user's saved poster still renders in the font they chose.
 */
const LEGACY_FONT_MAP: Record<string, string> = {
	"'Playfair Display', serif": 'var(--font-playfair), serif',
	"'Outfit', sans-serif": 'var(--font-outfit), sans-serif',
	"'Bebas Neue', sans-serif": 'var(--font-bebas), sans-serif',
	"'Oswald', sans-serif": 'var(--font-oswald), sans-serif',
	"'Cormorant Garamond', serif": 'var(--font-cormorant), serif',
	"'Lora', serif": 'var(--font-lora), serif',
	"'Merriweather', serif": 'var(--font-merriweather), serif',
	"'Montserrat', sans-serif": 'var(--font-montserrat), sans-serif',
	"'Raleway', sans-serif": 'var(--font-raleway), sans-serif',
	"'Inter', sans-serif": 'var(--font-inter), sans-serif',
	"'Open Sans', sans-serif": 'var(--font-open-sans), sans-serif',
	"'Caveat', cursive": 'var(--font-caveat), cursive',
	"'Dancing Script', cursive": 'var(--font-dancing), cursive',
	"'Source Code Pro', monospace": 'var(--font-source-code), monospace',
	'monospace': 'var(--font-source-code), monospace',
};

export function migrateFontValue(value: string | undefined, fallback: string): string {
	if (!value) return fallback;
	if (value.startsWith('var(')) return value;
	return LEGACY_FONT_MAP[value] || fallback;
}

/** True when the string contains any Devanagari codepoint (U+0900–U+097F). */
export function containsDevanagari(text: string): boolean {
	return /[ऀ-ॿ]/.test(text);
}

export function findFont(value: string): FontOption | undefined {
	return ALL_FONTS.find(f => f.value === value);
}
