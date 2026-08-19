const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function main() {
  const svgLogoPath = path.join(__dirname, '../public/motocart-logo.svg');
  const svgIconPath = path.join(__dirname, '../public/motocart-icon.svg');

  const svgLogoBuffer = fs.readFileSync(svgLogoPath);
  const svgIconBuffer = fs.readFileSync(svgIconPath);

  // Render logo.png (540x120)
  await sharp(svgLogoBuffer)
    .resize(540, 120)
    .png()
    .toFile(path.join(__dirname, '../public/logo.png'));
  console.log('Generated public/logo.png');

  await sharp(svgLogoBuffer)
    .resize(540, 120)
    .png()
    .toFile(path.join(__dirname, '../public/motocart-logo.png'));
  console.log('Generated public/motocart-logo.png');

  // Render icon.png (512x512)
  await sharp(svgIconBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(__dirname, '../public/icon.png'));
  console.log('Generated public/icon.png');

  // Render favicon.ico (64x64)
  await sharp(svgIconBuffer)
    .resize(64, 64)
    .png()
    .toFile(path.join(__dirname, '../public/favicon.ico'));
  console.log('Generated public/favicon.ico');
}

main().catch(err => {
  console.error('Error generating PNG logos:', err);
});
