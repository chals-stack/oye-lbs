import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const source = path.resolve('reference-photos-jpg');
const output = path.resolve('reference-sheets');
await fs.mkdir(output, { recursive: true });
const files = (await fs.readdir(source)).filter((name) => /\.jpg$/i.test(name)).sort();
const thumbWidth = 320, thumbHeight = 240, columns = 3, rows = 4;
for (let offset = 0; offset < files.length; offset += columns * rows) {
  const batch = files.slice(offset, offset + columns * rows);
  const items = await Promise.all(batch.map(async (name, index) => {
    const image = await sharp(path.join(source, name)).resize(thumbWidth, thumbHeight, { fit: 'cover' }).jpeg().toBuffer();
    const label = Buffer.from(`<svg width="${thumbWidth}" height="${thumbHeight}"><rect x="0" y="202" width="320" height="38" fill="rgba(0,0,0,.72)"/><text x="14" y="228" font-family="Arial" font-size="22" fill="white">${name.replace('.jpg','')}</text></svg>`);
    const cell = await sharp(image).composite([{ input: label }]).jpeg({ quality: 86 }).toBuffer();
    return { input: cell, left: (index % columns) * thumbWidth, top: Math.floor(index / columns) * thumbHeight };
  }));
  await sharp({ create: { width: columns * thumbWidth, height: rows * thumbHeight, channels: 3, background: '#202428' } })
    .composite(items).jpeg({ quality: 88 }).toFile(path.join(output, `sheet-${Math.floor(offset/(columns*rows))+1}.jpg`));
}
