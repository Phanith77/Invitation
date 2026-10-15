// Writes a QR code that opens the hosted invitation: public/qr/site.png (for sharing / printing)
// and public/qr/site.svg (sharp at any size).
// Usage: npm run qr                         (uses siteUrl from src/data/wedding.js)
//        npm run qr -- https://my-site.app  (or pass the deployed address directly)
import { readFileSync } from 'node:fs';
import QRCode from 'qrcode';

const fromData = readFileSync('src/data/wedding.js', 'utf8').match(/siteUrl:\s*'([^']+)'/)?.[1];
const url = (process.argv[2] || fromData || '').replace(/\/$/, '');

if (!/^https?:\/\//.test(url) || url.includes('example')) {
  console.error(`No real site address yet (got "${url || 'nothing'}").\n` +
    'Deploy first, then set siteUrl in src/data/wedding.js or run: npm run qr -- https://your-site.vercel.app');
  process.exit(1);
}

const opts = { margin: 2, errorCorrectionLevel: 'M', color: { dark: '#14130d', light: '#ffffff' } };
await QRCode.toFile('public/qr/site.png', url, { ...opts, width: 1000 });
await QRCode.toFile('public/qr/site.svg', url, { ...opts, type: 'svg' });
console.log(`public/qr/site.png and site.svg written → ${url}`);
