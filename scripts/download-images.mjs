import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@base44/sdk/dist/index.esm.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_ID = '686ced9f85654a8ac847289f'; // your Base44 appId
const OUT_DIR = path.resolve(__dirname, '../public/products');
const MAP_PATH = path.resolve(__dirname, '../src/data/imageMap.json');

const base44 = createClient({ appId: APP_ID });

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function download(url, destFile) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed ${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(destFile, buf);
}

function toSafeName(str) {
  return str.replace(/[^a-z0-9-_]/gi, '_').toLowerCase();
}

async function main() {
  await ensureDir(OUT_DIR);
  await ensureDir(path.dirname(MAP_PATH));

  const products = await base44.entities.Product.list();
  const imageMap = {}; // { [productId]: { main: string, gallery: string[] } }

  for (const p of products) {
    const gallery = Array.isArray(p.image_gallery) && p.image_gallery.length > 0
      ? p.image_gallery
      : (p.image_url ? [p.image_url] : []);

    const localPaths = [];
    for (let i = 0; i < gallery.length; i++) {
      const url = gallery[i];
      const extGuess = path.extname(new URL(url).pathname) || '.jpg';
      const fileName = `${toSafeName(p.id)}_${i}${extGuess}`;
      const outFile = path.join(OUT_DIR, fileName);
      try {
        await download(url, outFile);
        localPaths.push(`/products/${fileName}`);
      } catch (e) {
        console.warn('Skip image:', url, e.message);
      }
    }

    if (localPaths.length > 0) {
      imageMap[p.id] = { main: localPaths[0], gallery: localPaths };
    }
  }

  await fs.writeFile(MAP_PATH, JSON.stringify(imageMap, null, 2));
  console.log('Done. Wrote', Object.keys(imageMap).length, 'products.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
