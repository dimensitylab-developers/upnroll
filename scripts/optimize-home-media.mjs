/**
 * Offline homepage media conversion (not on the request path).
 *
 * Requires: ffmpeg on PATH, and `sharp` resolvable from frontend/node_modules.
 *
 * Usage (from repo root):
 *   node scripts/optimize-home-media.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const publicDir = path.join(root, "frontend", "public");
const require = createRequire(path.join(root, "frontend", "package.json"));

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function findFfmpeg() {
  const which = process.platform === "win32" ? "where" : "which";
  const probe = spawnSync(which, ["ffmpeg"], { encoding: "utf8" });
  if (probe.status === 0) {
    const line = probe.stdout.split(/\r?\n/).find(Boolean);
    if (line) return line.trim();
  }
  const wingetGuess = path.join(
    process.env.LOCALAPPDATA ?? "",
    "Microsoft",
    "WinGet",
    "Packages"
  );
  if (fs.existsSync(wingetGuess)) {
    const matches = [];
    for (const entry of fs.readdirSync(wingetGuess)) {
      if (!/ffmpeg/i.test(entry)) continue;
      const base = path.join(wingetGuess, entry);
      const walk = (dir, depth = 0) => {
        if (depth > 4) return;
        for (const name of fs.readdirSync(dir)) {
          const full = path.join(dir, name);
          const st = fs.statSync(full);
          if (st.isDirectory()) walk(full, depth + 1);
          else if (name.toLowerCase() === "ffmpeg.exe") matches.push(full);
        }
      };
      walk(base);
    }
    if (matches[0]) return matches[0];
  }
  return null;
}

function run(cmd, args) {
  console.log(`> ${cmd} ${args.join(" ")}`);
  const result = spawnSync(cmd, args, { stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`Command failed (${result.status}): ${cmd}`);
  }
}

async function optimizeStills(sharp) {
  const jobs = [
    { srcDir: path.join(publicDir, "Fighting"), outDir: path.join(publicDir, "Fighting", "opt"), width: 1280 },
    { srcDir: path.join(publicDir, "happy"), outDir: path.join(publicDir, "happy", "opt"), width: 720 },
  ];

  for (const job of jobs) {
    ensureDir(job.outDir);
    const files = fs.readdirSync(job.srcDir).filter((f) => /\.jpe?g$/i.test(f));
    for (const file of files) {
      const input = path.join(job.srcDir, file);
      const outName = file.replace(/\.jpe?g$/i, ".webp");
      const output = path.join(job.outDir, outName);
      if (fs.existsSync(output) && fs.statSync(output).mtimeMs >= fs.statSync(input).mtimeMs) {
        console.log(`skip still ${outName}`);
        continue;
      }
      await sharp(input)
        .rotate()
        .resize({ width: job.width, withoutEnlargement: true })
        .webp({ quality: 72, effort: 4 })
        .toFile(output);
      const before = fs.statSync(input).size;
      const after = fs.statSync(output).size;
      console.log(
        `still ${file} -> opt/${outName} (${(before / 1024 / 1024).toFixed(2)} MB -> ${(after / 1024).toFixed(0)} KB)`
      );
    }
  }
}

function optimizeHero(ffmpeg) {
  const master = path.join(publicDir, "Videos", "IMG_7263.MP4_2.mp4");
  const loopOut = path.join(publicDir, "Videos", "hero-loop.mp4");
  const posterOut = path.join(publicDir, "Videos", "hero-poster.webp");
  ensureDir(path.dirname(loopOut));

  if (!fs.existsSync(master)) {
    throw new Error(`Hero master missing: ${master}`);
  }

  // Short display-sized H.264 loop with audio kept for the sound toggle; faststart for progressive play.
  run(ffmpeg, [
    "-y",
    "-i",
    master,
    "-t",
    "8",
    "-vf",
    "scale='min(540,iw)':-2",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-profile:v",
    "main",
    "-crf",
    "28",
    "-preset",
    "medium",
    "-movflags",
    "+faststart",
    "-c:a",
    "aac",
    "-b:a",
    "96k",
    "-ac",
    "1",
    loopOut,
  ]);

  // Poster frame from the optimized loop (or master second 1).
  const tmpPng = path.join(publicDir, "Videos", "hero-poster-tmp.png");
  run(ffmpeg, ["-y", "-ss", "0.4", "-i", loopOut, "-frames:v", "1", tmpPng]);

  return { loopOut, posterOut, tmpPng };
}

async function main() {
  let sharp;
  try {
    sharp = require("sharp");
  } catch {
    console.error("sharp is not installed in frontend/. Run: npm install sharp --prefix frontend --no-save");
    process.exit(1);
  }

  const ffmpeg = findFfmpeg();
  if (!ffmpeg) {
    console.error("ffmpeg not found on PATH (and no WinGet FFmpeg package located).");
    console.error("Install FFmpeg, then re-run this script. Still optimization will still run.");
  }

  await optimizeStills(sharp);

  if (ffmpeg) {
    const { loopOut, posterOut, tmpPng } = optimizeHero(ffmpeg);
    await sharp(tmpPng).resize({ width: 540, withoutEnlargement: true }).webp({ quality: 70 }).toFile(posterOut);
    fs.unlinkSync(tmpPng);
    const loopMb = fs.statSync(loopOut).size / 1024 / 1024;
    const posterKb = fs.statSync(posterOut).size / 1024;
    console.log(`hero-loop.mp4 ${loopMb.toFixed(2)} MB`);
    console.log(`hero-poster.webp ${posterKb.toFixed(0)} KB`);
    if (loopMb > 4.5) {
      console.warn("Hero loop is above the 2–4 MiB target; consider a shorter -t or higher CRF.");
    }
  } else {
    console.warn("Skipped hero video conversion (ffmpeg unavailable).");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
