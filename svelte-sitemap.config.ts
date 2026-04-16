import type { OptionsSvelteSitemap } from 'svelte-sitemap';

const config: OptionsSvelteSitemap = {
  domain: 'https://www.webindex.page',
  trailingSlashes: false,
  changeFreq: 'monthly',
  ignore: ['404.html', '**/!template.html', 'polls_admin.html']
};

export default config;
