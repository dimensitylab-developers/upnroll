import fs from "node:fs";
import path from "node:path";

/**
 * Backend files resolve packages by walking up from backend/ to the repo root.
 * Dependencies are installed in frontend/node_modules.
 * When the repo root has no node_modules, link it at the frontend tree.
 * An existing real directory is left in place so a local install is not deleted.
 */
const frontendDir = path.resolve(import.meta.dirname, "..");
const repoRoot = path.resolve(frontendDir, "..");
const source = path.join(frontendDir, "node_modules");
const target = path.join(repoRoot, "node_modules");

if (!fs.existsSync(source)) {
  console.error("frontend/node_modules is missing. Run npm ci in frontend/.");
  process.exit(1);
}

if (fs.existsSync(target)) {
  const stat = fs.lstatSync(target);
  if (!stat.isSymbolicLink()) {
    process.exit(0);
  }
  const current = fs.realpathSync(target);
  const expected = fs.realpathSync(source);
  if (current === expected) {
    process.exit(0);
  }
  console.error("The repo root node_modules link points somewhere other than frontend/node_modules. Refusing to replace it.");
  process.exit(1);
}

if (process.platform === "win32") {
  fs.symlinkSync(source, target, "junction");
} else {
  fs.symlinkSync(source, target);
}
