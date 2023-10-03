import fs from 'fs/promises';

const metadata = `
		<title>Wendelin's Homepage</title>
		<meta property="og:type" content="profile" />
		<meta property="og:title" content="Wendelin Muth - Homepage" />
		<meta property="og:description" content="My personal website / blog. You should check it out!" />
		<meta name="description" content="My personal website / blog. You should check it out!" />
`;

export async function fixupSpaFallback() {
	const html = await fs.readFile('./build/200.html', 'utf-8');
	const updatedHtml = html.replace(/<!--\s*SPA_METADATA_PLACEHOLDER\s*-->/g, metadata);
	await fs.writeFile('./build/200.html', updatedHtml);
}
