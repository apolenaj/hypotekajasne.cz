/**
 * Node/tsx CJS resolver cannot load `@react-pdf/hyphenate/en-us` because the
 * package only declares ESM `import` conditions. Add require/default + explicit
 * language entries so PDF generation works under tsx.
 */
import fs from "node:fs";
import path from "node:path";

const pkgPath = path.join(
  process.cwd(),
  "node_modules",
  "@react-pdf",
  "hyphenate",
  "package.json"
);

if (!fs.existsSync(pkgPath)) {
  console.warn("skip hyphenate patch: package missing");
  process.exit(0);
}

const buf = fs.readFileSync(pkgPath);
const raw = buf.toString("utf8").replace(/^\uFEFF/, "");
let pkg;
try {
  pkg = JSON.parse(raw);
} catch {
  // Restore minimal known-good package if previous PowerShell write corrupted it
  pkg = {
    name: "@react-pdf/hyphenate",
    version: "0.1.0",
    type: "module",
    main: "./lib/index.js",
    types: "./lib/index.d.ts",
  };
}

pkg.exports = {
  ".": {
    types: "./lib/index.d.ts",
    import: "./lib/index.js",
    require: "./lib/index.js",
    default: "./lib/index.js",
  },
  "./*": {
    types: "./lib/*.d.ts",
    import: "./lib/*.js",
    require: "./lib/*.js",
    default: "./lib/*.js",
  },
  "./en-us": {
    types: "./lib/en-us.d.ts",
    import: "./lib/en-us.js",
    require: "./lib/en-us.js",
    default: "./lib/en-us.js",
  },
  "./en-gb": {
    types: "./lib/en-gb.d.ts",
    import: "./lib/en-gb.js",
    require: "./lib/en-gb.js",
    default: "./lib/en-gb.js",
  },
  "./cs": {
    types: "./lib/cs.d.ts",
    import: "./lib/cs.js",
    require: "./lib/cs.js",
    default: "./lib/cs.js",
  },
};

fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, { encoding: "utf8" });
console.log("patched @react-pdf/hyphenate exports for tsx/CJS");
