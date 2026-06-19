const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

const srcPath = "C:\\Users\\PlusMax\\.gemini\\antigravity-ide\\brain\\5cfb141e-e980-47a5-bb24-101685d2be1a\\media__1781794521028.png";
const destDir = "c:\\Users\\PlusMax\\Downloads\\portfolio\\public\\cursors";
const destPath = path.join(destDir, "cursor_style_4.png");

if (!fs.existsSync(destDir)){
    fs.mkdirSync(destDir, { recursive: true });
}

Jimp.read(srcPath)
  .then(image => {
    // 1. Remove white background (make transparent)
    // Jimp v1 uses image.scan(x, y, w, h, cb) or image.bitmap.data loop
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (width * y + x) << 2;
        const r = image.bitmap.data[idx + 0];
        const g = image.bitmap.data[idx + 1];
        const b = image.bitmap.data[idx + 2];
        
        // If pixel is very close to white, make transparent
        if (r > 240 && g > 240 && b > 240) {
          image.bitmap.data[idx + 3] = 0;
        }
      }
    }

    // 2. Crop bounding box of cursor
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    const scanHeight = height;

    for (let y = 0; y < scanHeight; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (width * y + x) << 2;
        const a = image.bitmap.data[idx + 3];
        if (a > 0) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX >= minX && maxY >= minY) {
      const cropWidth = maxX - minX + 1;
      const cropHeight = maxY - minY + 1;
      image.crop({ x: minX, y: minY, w: cropWidth, h: cropHeight });
    }

    // 3. Resize to standard cursor size (32px width, auto height)
    // Jimp v1 uses image.resize({ w: 32 })
    image.resize({ w: 32 });

    return image.write(destPath);
  })
  .then(() => {
    console.log("Cursor processed and saved successfully at " + destPath);
  })
  .catch(err => {
    console.error("Error processing cursor image: ", err);
  });
