/**
 * Generate PWA icons in proper sizes from the source logo
 * Run: npx tsx scripts/generate-pwa-icons.ts
 * 
 * Requires: npm install sharp --save-dev
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const sizes = [192, 512];
const sourcePath = path.join(process.cwd(), 'public/assets/images/ptype_logo.png');
const outputDir = path.join(process.cwd(), 'public/icons');

async function generateIcons() {
  console.log('🎨 Generating PWA icons...');
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`✅ Created directory: ${outputDir}`);
  }

  // Check if source exists
  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ Source image not found: ${sourcePath}`);
    process.exit(1);
  }

  // Get source image metadata
  const metadata = await sharp(sourcePath).metadata();
  console.log(`📷 Source image: ${metadata.width}x${metadata.height}`);

  // Generate each size
  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
    
    await sharp(sourcePath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 15, g: 23, b: 42, alpha: 1 } // #0f172a
      })
      .png()
      .toFile(outputPath);
    
    console.log(`✅ Generated: icon-${size}x${size}.png`);
  }

  console.log('🎉 All PWA icons generated successfully!');
}

generateIcons().catch(error => {
  console.error('❌ Error generating icons:', error);
  process.exit(1);
});
