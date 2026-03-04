import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					'vendor-leaflet': ['leaflet'],
					'vendor-maplibre': ['maplibre-gl'],
					'vendor-html2canvas': ['html2canvas']
				}
			}
		}
	}
});
