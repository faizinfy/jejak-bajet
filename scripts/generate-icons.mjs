// Renders the app icons (a 50/30/20 donut) as PNGs with no dependencies.
// Run with: npm run icons
import { mkdirSync, writeFileSync } from 'node:fs'
import { deflateSync } from 'node:zlib'

const OUT = new URL('../public/icons/', import.meta.url)

const BG = [26, 26, 25]
const SEGMENTS = [
  { share: 0.5, color: [57, 135, 229] }, // needs
  { share: 0.3, color: [217, 89, 38] }, // wants
  { share: 0.2, color: [25, 158, 112] }, // savings
]
const GAP_DEG = 4

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(buf) {
  let c = 0xffffffff
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function png(size, pixels) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // RGB
  const raw = Buffer.alloc(size * (size * 3 + 1))
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0
    pixels.copy(raw, y * (size * 3 + 1) + 1, y * size * 3, (y + 1) * size * 3)
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// Colour at a point, in units of the icon size (0..1)
function sample(x, y, outer, inner) {
  const dx = x - 0.5
  const dy = y - 0.5
  const r = Math.hypot(dx, dy)
  if (r > outer || r < inner) return BG
  // Angle clockwise from 12 o'clock, in degrees
  const deg = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360
  let start = 0
  for (const seg of SEGMENTS) {
    const end = start + seg.share * 360
    if (deg >= start + GAP_DEG / 2 && deg < end - GAP_DEG / 2) return seg.color
    start = end
  }
  return BG
}

function render(size, { outer = 0.31, inner = 0.18 } = {}) {
  const SS = 4
  const pixels = Buffer.alloc(size * size * 3)
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const acc = [0, 0, 0]
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const c = sample((px + (sx + 0.5) / SS) / size, (py + (sy + 0.5) / SS) / size, outer, inner)
          acc[0] += c[0]
          acc[1] += c[1]
          acc[2] += c[2]
        }
      }
      const i = (py * size + px) * 3
      for (let k = 0; k < 3; k++) pixels[i + k] = Math.round(acc[k] / (SS * SS))
    }
  }
  return png(size, pixels)
}

mkdirSync(OUT, { recursive: true })
const files = {
  'apple-touch-icon.png': render(180),
  'icon-192.png': render(192),
  'icon-512.png': render(512),
  'icon-maskable-512.png': render(512, { outer: 0.27, inner: 0.155 }),
  'favicon-32.png': render(32, { outer: 0.46, inner: 0.24 }),
}
for (const [name, buf] of Object.entries(files)) {
  writeFileSync(new URL(name, OUT), buf)
  console.log('wrote', name, buf.length, 'bytes')
}
