import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsDir = path.join(__dirname, 'src', 'assets');
const files = fs.readdirSync(assetsDir);

async function optimize() {
  for (const file of files) {
    if (file.endsWith('.png') || file.endsWith('.jpg')) {
      const filePath = path.join(assetsDir, file);
      const newFileName = file.replace(/\.(png|jpg)$/, '.webp');
      const newFilePath = path.join(assetsDir, newFileName);
      
      console.log(`Converting ${file} to WebP...`);
      try {
        await sharp(filePath)
          .resize({ width: 1200, withoutEnlargement: true })
          .webp({ quality: 80, effort: 6 })
          .toFile(newFilePath);
        
        fs.unlinkSync(filePath);
        console.log(`Finished ${file}`);
      } catch (err) {
        console.error(`Error on ${file}:`, err);
      }
    }
  }
}

optimize();
