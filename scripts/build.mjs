import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const client = resolve(dist, 'client');

await rm(dist, { recursive: true, force: true });
await mkdir(resolve(dist, 'server'), { recursive: true });
await mkdir(client, { recursive: true });

for (const item of ['index.html', 'styles.css', 'app.js', 'catalog.json', 'assets']) {
  await cp(resolve(root, item), resolve(client, item), { recursive: true });
}
await cp(resolve(root, 'index.html'), resolve(client, '404.html'));
await writeFile(resolve(client, '.nojekyll'), '');
await writeFile(resolve(dist, 'server/index.js'), `export default {\n  async fetch(request, env) {\n    const response = await env.ASSETS.fetch(request);\n    if (response.status !== 404) return response;\n    const url = new URL(request.url);\n    url.pathname = '/index.html';\n    return env.ASSETS.fetch(new Request(url, request));\n  }\n};\n`);

console.log('Static site built in dist/client');
