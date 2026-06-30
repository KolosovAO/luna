import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const publicDir = join(rootDir, "public");

function makeCrcTable() {
  const table = new Uint32Array(256);

  for (let index = 0; index < 256; index += 1) {
    let value = index;

    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }

    table[index] = value >>> 0;
  }

  return table;
}

const crcTable = makeCrcTable();

function crc32(buffer) {
  let value = 0xffffffff;

  for (const byte of buffer) {
    value = crcTable[(value ^ byte) & 0xff] ^ (value >>> 8);
  }

  return (value ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const lengthBuffer = Buffer.alloc(4);
  const crcBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32BE(data.length, 0);
  crcBuffer.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([lengthBuffer, typeBuffer, data, crcBuffer]);
}

function clamp(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function mix(left, right, amount) {
  return left + (right - left) * amount;
}

function drawIcon(size) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  const moonX = size * 0.6;
  const moonY = size * 0.36;
  const moonRadius = size * 0.22;

  for (let y = 0; y < size; y += 1) {
    const rowStart = y * (size * 4 + 1);
    raw[rowStart] = 0;

    for (let x = 0; x < size; x += 1) {
      const offset = rowStart + 1 + x * 4;
      const dx = x / size - 0.5;
      const dy = y / size - 0.48;
      const radius = Math.sqrt(dx * dx + dy * dy);
      const vertical = y / size;
      const glow = Math.max(0, 1 - radius * 2.2);
      const nebula = Math.max(0, 1 - Math.abs(y - (size * 0.68 + Math.sin(x * 0.022) * size * 0.08)) / (size * 0.22));
      let red = mix(3, 18, vertical) + glow * 18 + nebula * 18;
      let green = mix(7, 20, vertical) + glow * 28 + nebula * 34;
      let blue = mix(20, 55, vertical) + glow * 55 + nebula * 74;

      const starSeed = (x * 73856093) ^ (y * 19349663) ^ size;

      if ((starSeed & 511) === 0) {
        const brightness = 130 + (starSeed & 63);
        red += brightness;
        green += brightness;
        blue += brightness + 18;
      }

      const moonDistance = Math.hypot(x - moonX, y - moonY);
      const shadowDistance = Math.hypot(x - (moonX + moonRadius * 0.42), y - (moonY - moonRadius * 0.04));

      if (moonDistance < moonRadius && shadowDistance > moonRadius * 0.92) {
        const edge = Math.max(0, 1 - moonDistance / moonRadius);
        red = 232 + edge * 18;
        green = 226 + edge * 20;
        blue = 202 + edge * 34;
      } else if (moonDistance < moonRadius * 1.08 && shadowDistance > moonRadius * 0.85) {
        red += 68;
        green += 72;
        blue += 88;
      }

      raw[offset] = clamp(red);
      raw[offset + 1] = clamp(green);
      raw[offset + 2] = clamp(blue);
      raw[offset + 3] = 255;
    }
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

mkdirSync(publicDir, { recursive: true });
writeFileSync(join(publicDir, "icon-192.png"), drawIcon(192));
writeFileSync(join(publicDir, "icon-512.png"), drawIcon(512));
console.log("Generated public/icon-192.png and public/icon-512.png");
