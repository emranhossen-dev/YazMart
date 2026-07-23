const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function run() {
  const svgPath = path.join(__dirname, '../src/app/icon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  console.log("Generating rounded PNGs...");

  // Generate 32x32 PNG
  const png32 = await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toBuffer();

  // Generate 180x180 Apple Touch Icon
  const png180 = await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toBuffer();

  // Write PNG files
  fs.writeFileSync(path.join(__dirname, '../src/app/icon.png'), png32);
  fs.writeFileSync(path.join(__dirname, '../public/icon.png'), png32);
  fs.writeFileSync(path.join(__dirname, '../public/apple-touch-icon.png'), png180);

  // For favicon.ico, write PNG format into .ico file path (modern browsers support PNG inside favicon.ico or PNG favicon)
  fs.writeFileSync(path.join(__dirname, '../src/app/favicon.ico'), png32);
  fs.writeFileSync(path.join(__dirname, '../public/favicon.ico'), png32);

  console.log("✅ Round Favicons generated successfully!");
}

run().catch(err => {
  console.error("Failed to generate favicons:", err);
  process.exit(1);
});
