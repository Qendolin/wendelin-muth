import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import { fixupSpaFallback } from './scripts/fixup-spa-fallback';

const config: UserConfig = {
	plugins: [
		sveltekit(),
		{
			name: 'fixup-spa-fallback',
			closeBundle: {
				sequential: true,
				order: 'post',
				async handler() {
					console.log('Fixing SPA fallback page');
					return fixupSpaFallback();
				}
			}
		}
	]
};

export default config;
