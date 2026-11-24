import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import convert from 'heic-convert';

const source = path.resolve('reference-photos');
const output = path.resolve('reference-photos-jpg');
await fs.mkdir(output, { recursive: true });
const files = (await fs.readdir(source)).filter((name) => /\.heic$/i.test(name));
for (const name of files) {
  const target = path.join(output, name.replace(/\.heic$/i, '.jpg'));
  try { await fs.access(target); continue; } catch {}
  const input = await fs.readFile(path.join(source, name));
  const decoded = await convert({ buffer: input, format: 'JPEG', quality: 0.9 });
  await sharp(decoded).rotate().resize({ width: 1400, withoutEnlargement: true }).jpeg({ quality: 84 }).toFile(target);
  console.log(path.basename(target));
}
console.log(`Converted ${files.length} photos.`);
