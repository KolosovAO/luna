const subtle = globalThis.crypto.subtle;

function toBase64Url(bytes) {
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

const keyPair = await subtle.generateKey(
  {
    name: "ECDSA",
    namedCurve: "P-256"
  },
  true,
  ["sign", "verify"]
);
const publicKey = new Uint8Array(await subtle.exportKey("raw", keyPair.publicKey));
const privateKey = await subtle.exportKey("jwk", keyPair.privateKey);

console.log("VAPID_PUBLIC_KEY=" + toBase64Url(publicKey));
console.log("VAPID_PRIVATE_KEY=" + privateKey.d);
console.log("");
console.log("Put VAPID_PUBLIC_KEY into push-worker/wrangler.toml and public/push-config.json.");
console.log("Put VAPID_PRIVATE_KEY into Cloudflare with: wrangler secret put VAPID_PRIVATE_KEY");
