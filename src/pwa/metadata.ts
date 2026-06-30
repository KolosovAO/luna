import { Platform } from "react-native";

function upsertMeta(name: string, content: string): void {
  const selector = `meta[name="${name}"]`;
  const existing = document.head.querySelector<HTMLMetaElement>(selector);

  if (existing) {
    existing.content = content;
    return;
  }

  const element = document.createElement("meta");
  element.name = name;
  element.content = content;
  document.head.appendChild(element);
}

function upsertLink(rel: string, href: string): void {
  const selector = `link[rel="${rel}"]`;
  const existing = document.head.querySelector<HTMLLinkElement>(selector);

  if (existing) {
    existing.href = href;
    return;
  }

  const element = document.createElement("link");
  element.rel = rel;
  element.href = href;
  document.head.appendChild(element);
}

export function ensurePwaMetadata(): void {
  if (Platform.OS !== "web" || typeof document === "undefined") {
    return;
  }

  upsertMeta("theme-color", "#050a14");
  upsertMeta("apple-mobile-web-app-capable", "yes");
  upsertMeta("apple-mobile-web-app-title", "Luna");
  upsertMeta("apple-mobile-web-app-status-bar-style", "black-translucent");
  upsertLink("manifest", new URL("manifest.webmanifest", document.baseURI).toString());
  upsertLink("apple-touch-icon", new URL("icon-192.png", document.baseURI).toString());
}
