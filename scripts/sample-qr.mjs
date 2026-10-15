// Writes the two SAMPLE gift QR images. They encode only a note, never account details.
// Replace public/qr/* with the couple's real KHQR / ABA images.
import QRCode from 'qrcode';
for (const who of ['groom', 'bride']) {
  await QRCode.toFile(`public/qr/sample-${who}.png`, `SAMPLE QR (${who}) - replace with the real KHQR image`, {
    width: 600, margin: 2, color: { dark: '#14130d', light: '#ffffff' },
  });
}
console.log('public/qr/sample-*.png written');
