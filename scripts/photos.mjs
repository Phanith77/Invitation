// Converts everything in /photos to WebP at 640/1280/2000 px wide, strips EXIF/GPS
// (sharp drops all metadata unless asked to keep it), and writes src/data/gallery.json.
// Usage: put your photos in /photos, then `npm run photos`.
// A file whose name contains "cover" becomes the cover/envelope photo; "rite-*" files are
// ceremony-guide illustrations and stay out of the gallery.
import sharp from 'sharp';
import { readdirSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { parse } from 'node:path';

const SRC = 'photos', OUT = 'public/photos', WIDTHS = [640, 1280, 2000];
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const files = readdirSync(SRC).filter((f) => /\.(jpe?g|png|webp|tiff?|avif)$/i.test(f)).sort();
const gallery = [];
for (const file of files) {
  const slug = parse(file).name.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
  const img = sharp(`${SRC}/${file}`).rotate(); // apply EXIF orientation, then metadata is dropped
  const { width, height } = await img.clone().toBuffer({ resolveWithObject: true }).then((r) => r.info);
  const sizes = [];
  for (const w of WIDTHS) {
    const tw = Math.min(w, width);
    await img.clone().resize({ width: tw }).webp({ quality: 78 }).toFile(`${OUT}/${slug}-${w}.webp`);
    sizes.push(w);
  }
  gallery.push({ slug, w: width, h: height, cover: slug.includes('cover'), gallery: !/^(rite|party)-/.test(slug) });
  console.log('✓', file);
}
writeFileSync('src/data/gallery.json', JSON.stringify(gallery, null, 2));
console.log(`${gallery.length} photos → ${OUT}, list → src/data/gallery.json`);
