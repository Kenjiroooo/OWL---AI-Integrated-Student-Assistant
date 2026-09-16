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
    if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.webp')) {
      const filePath = path.join(assetsDir, file);
      const tempFilePath = path.join(assetsDir, `temp_${file.replace(/\.(png|jpg)$/, '.webp')}`);
      
      let width = 400;
      let quality = 65;
      if (file.includes('maincampus') || file.includes('conflict_exam')) {
        width = 800;
        quality = 75;
      }
      
      console.log(`Optimizing ${file} to ${width}px at quality ${quality}...`);
      try {
        await sharp(filePath)
          .resize({ width, withoutEnlargement: true })
          .webp({ quality, effort: 6 })
          .toFile(tempFilePath);
        
        fs.unlinkSync(filePath);
        fs.renameSync(tempFilePath, filePath.replace(/\.(png|jpg)$/, '.webp'));
        console.log(`Finished ${file}`);
      } catch (err) {
        console.error(`Error on ${file}:`, err);
      }
    }
  }
}

optimize();
