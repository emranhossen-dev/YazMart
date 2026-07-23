const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function run() {
  const logoPath = path.join(__dirname, '../public/logo yazmart.png');
  const metadata = await sharp(logoPath).metadata();
  console.log("Logo size:", metadata.width, metadata.height);

  // Extract the left square icon from the logo image (height x height)
  const iconSize = Math.min(metadata.height, metadata.width);
  const extractedIcon = await sharp(logoPath)
    .extract({ left: 0, top: 0, width: iconSize, height: iconSize })
    .toBuffer();

  const targetSize = 512;
  const radius = 248;

  // Create SVG circle mask and glowing ring overlay
  const circleMask = Buffer.from(
    `<svg width="${targetSize}" height="${targetSize}"><circle cx="${targetSize/2}" cy="${targetSize/2}" r="${radius}" fill="#ffffff" /></svg>`
  );

  const ringOverlay = Buffer.from(
    `<svg width="${targetSize}" height="${targetSize}"><circle cx="${targetSize/2}" cy="${targetSize/2}" r="${radius}" fill="none" stroke="#ff6600" stroke-width="12" /></svg>`
  );

  // Fit the logo icon neatly inside white background
  const resizedIcon = await sharp(extractedIcon)
    .resize(targetSize, targetSize, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .toBuffer();

  // Composite circular mask and ring
  const roundLogoIcon = await sharp(resizedIcon)
    .composite([
      { input: circleMask, blend: 'dest-in' },
      { input: ringOverlay, blend: 'over' }
    ])
    .png()
    .toBuffer();

  // Save circular icon image
  fs.writeFileSync(path.join(__dirname, '../public/logo_icon_round.png'), roundLogoIcon);

  // Generate 32x32 PNG favicons
  const icon32 = await sharp(roundLogoIcon).resize(32, 32).toBuffer();
  fs.writeFileSync(path.join(__dirname, '../src/app/favicon.ico'), icon32);
  fs.writeFileSync(path.join(__dirname, '../public/favicon.ico'), icon32);
  fs.writeFileSync(path.join(__dirname, '../src/app/icon.png'), icon32);
  fs.writeFileSync(path.join(__dirname, '../public/icon.png'), icon32);
  fs.writeFileSync(path.join(__dirname, '../public/apple-touch-icon.png'), await sharp(roundLogoIcon).resize(180, 180).toBuffer());

  console.log("✅ Original YazMart logo icon converted to round favicon successfully!");
}

run().catch(err => {
  console.error("Error generating logo favicons:", err);
  process.exit(1);
});
