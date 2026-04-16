const ts = Date.now();

let content = await Deno.readTextFile('.env');
const key = 'PUBLIC_BUILD_TIMESTAMP';
const line = `${key}=${ts}`;

if (content.match(new RegExp(`^${key}=.*$`, 'm'))) {
  content = content.replace(new RegExp(`^${key}=.*$`, 'm'), line);
} else {
  content += (content.endsWith('\n') || content.length === 0 ? '' : '\n') + line + '\n';
}

await Deno.writeTextFile('.env', content);
