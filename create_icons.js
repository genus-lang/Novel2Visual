import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const sourceImage = 'C:\\Users\\rinku\\.gemini\\antigravity-ide\\brain\\5b9e8b33-9091-43cb-83e4-ade54b0a6584\\novel2visual_icon_1786733891879.png';
const publicDir = path.join(process.cwd(), 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

async function resizeIcons() {
  const sizes = [16, 48, 128];
  
  for (const size of sizes) {
    const outputPath = path.join(publicDir, `icon${size}.png`);
    await sharp(sourceImage)
      .resize(size, size)
      .toFile(outputPath);
    console.log(`Created icon${size}.png`);
  }
}

resizeIcons().catch(console.error);
