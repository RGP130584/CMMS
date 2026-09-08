import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '..', 'public');

const CRC_TABLE = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

function encodePNG(size, getPixel) {
  const bpp = 4;
  const stride = size * bpp + 1;
  const raw = Buffer.alloc(size * stride);
  for (let y = 0; y < size; y++) {
    const rowStart = y * stride;
    raw[rowStart] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = getPixel(x, y);
      const o = rowStart + 1 + x * bpp;
      raw[o] = r;
      raw[o + 1] = g;
      raw[o + 2] = b;
      raw[o + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const BG = [0x1b, 0x5e, 0x20];
const WHITE = [255, 255, 255];
const EDGE = 1.5;

function roundedSquareSDF(x, y, cx, cy, hw, hh, cr) {
  const dx = Math.abs(x - cx) - (hw - cr);
  const dy = Math.abs(y - cy) - (hh - cr);
  const d = Math.min(Math.max(dx, dy), 0) + Math.hypot(Math.max(dx, 0), Math.max(dy, 0));
  return d - cr;
}

function gearSDF(x, y, r1, r2, r3, toothCount, toothFrac) {
  const r = Math.hypot(x, y);
  const period = (Math.PI * 2) / toothCount;
  const phase = ((Math.atan2(y, x) % period) + period) % period;
  const halfTooth = (toothFrac * period) / 2;
  const angleDist = Math.min(phase, period - phase);

  let d = Infinity;
  if (r >= r1 && r <= r2) {
    d = Math.min(r - r1, r2 - r);
  }
  if (r > r2 && r <= r3) {
    d = Math.max(r2 - r, halfTooth - angleDist);
  }
  return d;
}

function coverageFromSDF(d) {
  return clamp(0.5 - d / EDGE, 0, 1);
}

function lerp(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function makeIcon(size) {
  const cx = size / 2;
  const cy = size / 2;
  const hw = size / 2;
  const hh = size / 2;
  const corner = size * 0.22;
  const r1 = size * 0.2;
  const r2 = size * 0.33;
  const r3 = size * 0.4;

  return (x, y) => {
    const px = x + 0.5;
    const py = y + 0.5;
    const bgCov = coverageFromSDF(roundedSquareSDF(px, py, cx, cy, hw, hh, corner));
    const gx = px - cx;
    const gy = py - cy;
    const gearCov = coverageFromSDF(gearSDF(gx, gy, r1, r2, r3, 8, 0.42));
    const color = lerp(BG, WHITE, gearCov);
    return [Math.round(color[0]), Math.round(color[1]), Math.round(color[2]), Math.round(bgCov * 255)];
  };
}

mkdirSync(publicDir, { recursive: true });
for (const size of [192, 512]) {
  const file = path.join(publicDir, `pwa-${size}x${size}.png`);
  writeFileSync(file, encodePNG(size, makeIcon(size)));
  console.log(`wrote ${file}`);
}