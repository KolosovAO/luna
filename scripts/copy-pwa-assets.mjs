import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const publicDir = join(rootDir, "public");
const distDir = join(rootDir, "dist");
const htmlPath = join(distDir, "index.html");

function copyPublicFiles(fromDir, toDir) {
  if (!existsSync(fromDir)) {
    return;
  }

  mkdirSync(toDir, { recursive: true });

  for (const entry of readdirSync(fromDir)) {
    const source = join(fromDir, entry);
    const target = join(toDir, entry);
    const stat = statSync(source);

    if (stat.isDirectory()) {
      copyPublicFiles(source, target);
    } else {
      copyFileSync(source, target);
    }
  }
}

function injectPwaHead() {
  if (!existsSync(htmlPath)) {
    return;
  }

  const marker = "<!-- luna-pwa -->";
  const tags = `${marker}
    <meta name="theme-color" content="#050a14" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-title" content="Luna" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <link rel="manifest" href="manifest.webmanifest" />
    <link rel="apple-touch-icon" href="icon-192.png" />`;
  const html = readFileSync(htmlPath, "utf8");

  if (html.includes(marker)) {
    return;
  }

  writeFileSync(htmlPath, html.replace("</head>", `${tags}\n  </head>`));
}

copyPublicFiles(publicDir, distDir);
injectPwaHead();
console.log("Copied PWA assets to dist");
