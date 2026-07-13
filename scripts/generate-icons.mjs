/* 以 sharp 將 SVG 光柵化為 PWA icons */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const svg = (pad) => `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0c1322"/>
      <stop offset="1" stop-color="#070b14"/>
    </linearGradient>
    <linearGradient id="drop" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5eead4"/>
      <stop offset="1" stop-color="#00a894"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="${pad ? 0 : 116}" fill="url(#bg)"/>
  <g transform="translate(256 ${268 + (pad ? 8 : 0)}) scale(${pad ? 0.72 : 0.92})">
    <path d="M0 -168 C 62 -84, 118 -22, 118 44 A 118 118 0 1 1 -118 44 C -118 -22, -62 -84, 0 -168 Z"
      fill="url(#drop)"/>
    <path d="M-58 52 a 58 58 0 0 0 46 62" stroke="#eafffb" stroke-width="22"
      stroke-linecap="round" fill="none" opacity="0.85"/>
  </g>
</svg>`;

await mkdir("public/icons", { recursive: true });

const jobs = [
  { file: "public/icons/icon-192.png", size: 192, pad: false },
  { file: "public/icons/icon-512.png", size: 512, pad: false },
  { file: "public/icons/apple-touch-icon.png", size: 180, pad: false },
  { file: "public/icons/maskable-512.png", size: 512, pad: true },
];

for (const { file, size, pad } of jobs) {
  await sharp(Buffer.from(svg(pad))).resize(size, size).png().toFile(file);
  console.log("✓", file);
}
