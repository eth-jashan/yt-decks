// Simple script to generate placeholder icons
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Minimal purple (#8B5CF6) colored PNG icons - valid PNG files
// These are simple solid purple squares

// 16x16 purple PNG
const icon16Base64 = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAH0lEQVQ4T2NkYGD4z4APMDIy4lXDgAaGtgGjLhg0LgAAoqEBEZzsdCoAAAAASUVORK5CYII=';

// 48x48 purple PNG
const icon48Base64 = 'iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAKElEQVRoQ+3OMQEAAAgDIPuX1hBs5hUQNNk4cwECBAgQIECAAIH7AgfLADABvjSTAAAAAElFTkSuQmCC';

// 128x128 purple PNG
const icon128Base64 = 'iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAL0lEQVR4Ae3BAQ0AAADCIPun9l8IYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHgaXIAAAXPO1U4AAAAASUVORK5CYII=';

// Create icons directory if needed
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Write icons
fs.writeFileSync(path.join(iconsDir, 'icon16.png'), Buffer.from(icon16Base64, 'base64'));
fs.writeFileSync(path.join(iconsDir, 'icon48.png'), Buffer.from(icon48Base64, 'base64'));
fs.writeFileSync(path.join(iconsDir, 'icon128.png'), Buffer.from(icon128Base64, 'base64'));

console.log('Placeholder icons generated successfully!');
