// Converts the designer's landing page exports into the optimised files the
// app imports from src/assets/landing/. Re-run after a design re-export:
//
//   node scripts/optimise-landing-assets.mjs
//
// Raster exports become WebP (trimmed of empty canvas and capped at a sensible
// width for 2x displays). SVGs are copied under their target names.

import { copyFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(root, "landing-page-assets");
const OUT = path.join(root, "src", "assets", "landing");

const QUALITY = 82;
const ALPHA_QUALITY = 90;

/** @type {Array<{ from: string; to: string; maxWidth?: number; trim?: boolean }>} */
const RASTER = [
  { from: "Top Cloud.png", to: "hero-cloud-front.webp", maxWidth: 2880, trim: true },
  { from: "Back Cloud.png", to: "hero-cloud-back.webp", maxWidth: 2880, trim: true },
  { from: "graphic right.png", to: "hero-card-1.webp", maxWidth: 1600 },
  { from: "graphic right (1).png", to: "hero-card-2.webp", maxWidth: 1600 },
  { from: "graphic right (2).png", to: "hero-card-3.webp", maxWidth: 1600 },
  { from: "Illustration.png", to: "sticker-blue.webp", maxWidth: 800 },
  { from: "Illustration (1).png", to: "sticker-purple.webp", maxWidth: 800 },
  { from: "Illustration (2).png", to: "sticker-yellow.webp", maxWidth: 800 },
  { from: "Illustration (3).png", to: "sticker-pink.webp", maxWidth: 800 },
  { from: "image 37.png", to: "decor-note-corner.webp", maxWidth: 800, trim: true },
  { from: "Group 11.png", to: "decor-notebook.webp", maxWidth: 1200, trim: true },
  { from: "Sticker.png", to: "step-card.webp", maxWidth: 720 },
  { from: "Pin.png", to: "step-clip.webp" },
  { from: "8ab85d82066a84e0362f4dbfc9f5a94612499155.png", to: "cta-keychain.webp", maxWidth: 600, trim: true },
  { from: "HU9hBZdjRywQqBdKxn8A7kQTgg8 1.png", to: "decor-book.webp", maxWidth: 600, trim: true },
  { from: "Frame 2147226733.png", to: "decor-pencils.webp", maxWidth: 600, trim: true },
];

/** @type {Array<{ from: string; to: string }>} */
const VECTOR = [
  { from: "Frame 2147226756.svg", to: "hero-icon-briefcase.svg" },
  { from: "Frame 2147226757.svg", to: "hero-icon-send.svg" },
  { from: "Frame.svg", to: "career-fullstack.svg" },
  { from: "Frame (2).svg", to: "career-data.svg" },
  { from: "Frame (3).svg", to: "career-pm.svg" },
  { from: "Frame (4).svg", to: "career-ux.svg" },
  { from: "Vector 19.svg", to: "folder-tab-1.svg" },
  { from: "Vector 20.svg", to: "folder-tab-2.svg" },
  { from: "Vector 21.svg", to: "folder-tab-3.svg" },
  { from: "Vector 22.svg", to: "folder-tab-4.svg" },
  { from: "Vector 5.svg", to: "cta-wave.svg" },
  { from: "AppleLogo.svg", to: "apple-logo.svg" },
  { from: "GooglePlayLogo.svg", to: "google-play-logo.svg" },
  { from: "Group.svg", to: "logo-mark-green.svg" },
  { from: "Frame 2147226665.svg", to: "logo-nav.svg" },
];

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

async function convert({ from, to, maxWidth, trim }) {
  const input = path.join(SRC, from);
  const output = path.join(OUT, to);
  let image = sharp(input);
  if (trim) image = image.trim();
  if (maxWidth) image = image.resize({ width: maxWidth, withoutEnlargement: true });
  const info = await image
    .webp({ quality: QUALITY, alphaQuality: ALPHA_QUALITY, effort: 6 })
    .toFile(output);
  const before = (await stat(input)).size;
  console.log(`${to.padEnd(26)} ${info.width}x${info.height}  ${kb(before)} -> ${kb(info.size)}`);
}

await mkdir(OUT, { recursive: true });
for (const entry of RASTER) await convert(entry);
for (const { from, to } of VECTOR) {
  await copyFile(path.join(SRC, from), path.join(OUT, to));
  console.log(`${to.padEnd(26)} copied`);
}
