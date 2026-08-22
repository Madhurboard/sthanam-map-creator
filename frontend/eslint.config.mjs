import { defineConfig } from 'eslint/config';
import nextPlugin from 'eslint-config-next';

export default defineConfig([
	...nextPlugin.configs['core-web-vitals'],
]);
