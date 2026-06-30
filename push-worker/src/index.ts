const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const SYNODIC_MONTH_DAYS = 29.530588853;
const SYNODIC_MONTH_MS = SYNODIC_MONTH_DAYS * DAY_MS;
const KNOWN_NEW_MOON_UTC_MS = Date.parse("2000-01-06T18:14:00.000Z");
const DEFAULT_NOTIFY_HOUR = 12;
const PUSH_TTL_SECONDS = 24 * 60 * 60;

interface KVNamespace {
  delete(key: string): Promise<void>;
  get<T = unknown>(key: string, type: "json"): Promise<T | null>;
  list(options?: { cursor?: string; limit?: number; prefix?: string }): Promise<{
    cursor?: string;
    keys: Array<{ name: string }>;
    list_complete: boolean;
  }>;
  put(key: string, value: string): Promise<void>;
}

interface Env {
  ALLOWED_ORIGIN?: string;
  SUBSCRIPTIONS: KVNamespace;
  VAPID_PRIVATE_KEY: string;
  VAPID_PUBLIC_KEY: string;
  VAPID_SUBJECT: string;
}

interface PushSubscriptionPayload {
  endpoint: string;
  expirationTime?: number | null;
  keys?: {
    auth?: string;
    p256dh?: string;
  };
}

interface SubscribeRequest {
  appUrl?: string;
  notifyHour?: number;
  subscription?: PushSubscriptionPayload;
  timeZone?: string;
}

interface StoredSubscription {
  appUrl: string;
  createdAt: string;
  endpoint: string;
  keys?: {
    auth?: string;
    p256dh?: string;
  };
  lastNotifiedDate?: string;
  notifyHour: number;
  timeZone: string;
  updatedAt: string;
}

interface LocalTimeParts {
  dateKey: string;
  hour: number;
  minute: number;
}

function makeCorsHeaders(env: Env): HeadersInit {
  return {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
    "Access-Control-Max-Age": "86400"
  };
}

function jsonResponse(payload: unknown, env: Env, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    headers: {
      "Content-Type": "application/json",
      ...makeCorsHeaders(env)
    },
    status
  });
}

function normalizeNotifyHour(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return DEFAULT_NOTIFY_HOUR;
  }

  return Math.min(23, Math.max(0, Math.round(value)));
}

function toBase64Url(input: ArrayBuffer | Uint8Array | string): string {
  const bytes =
    typeof input === "string"
      ? new TextEncoder().encode(input)
      : input instanceof Uint8Array
        ? input
        : new Uint8Array(input);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(input: string): Uint8Array {
  const base64 = `${input}${"=".repeat((4 - (input.length % 4)) % 4)}`
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function hashEndpoint(endpoint: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(endpoint));
  return toBase64Url(digest);
}

function getSubscriptionKey(hash: string): string {
  return `subscription:${hash}`;
}

function isValidSubscription(subscription: PushSubscriptionPayload | undefined): subscription is PushSubscriptionPayload {
  return typeof subscription?.endpoint === "string" && subscription.endpoint.startsWith("https://");
}

async function handleSubscribe(request: Request, env: Env): Promise<Response> {
  const payload = (await request.json()) as SubscribeRequest;

  if (!isValidSubscription(payload.subscription)) {
    return jsonResponse({ error: "Invalid push subscription." }, env, 400);
  }

  const hash = await hashEndpoint(payload.subscription.endpoint);
  const now = new Date().toISOString();
  const stored: StoredSubscription = {
    appUrl: payload.appUrl || "https://kolosovao.github.io/luna/",
    createdAt: now,
    endpoint: payload.subscription.endpoint,
    keys: payload.subscription.keys,
    notifyHour: normalizeNotifyHour(payload.notifyHour),
    timeZone: payload.timeZone || "UTC",
    updatedAt: now
  };
  const existing = await env.SUBSCRIPTIONS.get<StoredSubscription>(getSubscriptionKey(hash), "json");

  if (existing?.createdAt) {
    stored.createdAt = existing.createdAt;
    stored.lastNotifiedDate = existing.lastNotifiedDate;
  }

  await env.SUBSCRIPTIONS.put(getSubscriptionKey(hash), JSON.stringify(stored));
  return jsonResponse({ ok: true }, env);
}

async function handleDelete(request: Request, env: Env): Promise<Response> {
  const payload = (await request.json()) as SubscribeRequest;

  if (!isValidSubscription(payload.subscription)) {
    return jsonResponse({ error: "Invalid push subscription." }, env, 400);
  }

  const hash = await hashEndpoint(payload.subscription.endpoint);
  await env.SUBSCRIPTIONS.delete(getSubscriptionKey(hash));
  return jsonResponse({ ok: true }, env);
}

function getLocalTimeParts(date: Date, timeZone: string): LocalTimeParts {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric"
  });
  const values: Record<string, string> = {};

  for (const part of formatter.formatToParts(date)) {
    values[part.type] = part.value;
  }

  return {
    dateKey: `${values.year}-${values.month}-${values.day}`,
    hour: Number(values.hour),
    minute: Number(values.minute)
  };
}

function getCycleIndex(date: Date): number {
  return Math.floor((date.getTime() - KNOWN_NEW_MOON_UTC_MS) / SYNODIC_MONTH_MS);
}

function getNewMoonAtCycle(cycleIndex: number): Date {
  return new Date(KNOWN_NEW_MOON_UTC_MS + cycleIndex * SYNODIC_MONTH_MS);
}

function getNewMoonBounds(date: Date): { previousNewMoon: Date; nextNewMoon: Date } {
  const cycleIndex = getCycleIndex(date);
  const previous = getNewMoonAtCycle(cycleIndex);

  if (previous.getTime() > date.getTime()) {
    return {
      nextNewMoon: previous,
      previousNewMoon: getNewMoonAtCycle(cycleIndex - 1)
    };
  }

  return {
    nextNewMoon: getNewMoonAtCycle(cycleIndex + 1),
    previousNewMoon: previous
  };
}

function isYoungCrescentWindow(date: Date): boolean {
  const { previousNewMoon, nextNewMoon } = getNewMoonBounds(date);
  const previousEnd = previousNewMoon.getTime() + 3 * DAY_MS;
  const center = date.getTime() <= previousEnd ? previousNewMoon : nextNewMoon;
  const start = center.getTime() + DAY_MS;
  const end = center.getTime() + 3 * DAY_MS;

  return date.getTime() >= start && date.getTime() <= end;
}

function shouldNotify(subscription: StoredSubscription, now: Date): { dateKey: string; due: boolean } {
  const local = getLocalTimeParts(now, subscription.timeZone);
  const due =
    local.hour === subscription.notifyHour &&
    local.minute < 30 &&
    subscription.lastNotifiedDate !== local.dateKey &&
    isYoungCrescentWindow(now);

  return {
    dateKey: local.dateKey,
    due
  };
}

async function makeVapidAuthorization(endpoint: string, env: Env): Promise<string> {
  const audience = new URL(endpoint).origin;
  const publicBytes = fromBase64Url(env.VAPID_PUBLIC_KEY);
  const x = toBase64Url(publicBytes.slice(1, 33));
  const y = toBase64Url(publicBytes.slice(33, 65));
  const jwtHeader = toBase64Url(JSON.stringify({ alg: "ES256", typ: "JWT" }));
  const jwtPayload = toBase64Url(
    JSON.stringify({
      aud: audience,
      exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
      sub: env.VAPID_SUBJECT
    })
  );
  const jwtInput = `${jwtHeader}.${jwtPayload}`;
  const privateKey = await crypto.subtle.importKey(
    "jwk",
    {
      crv: "P-256",
      d: env.VAPID_PRIVATE_KEY,
      ext: true,
      key_ops: ["sign"],
      kty: "EC",
      x,
      y
    },
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    { hash: "SHA-256", name: "ECDSA" },
    privateKey,
    new TextEncoder().encode(jwtInput)
  );

  return `vapid t=${jwtInput}.${toBase64Url(signature)}, k=${env.VAPID_PUBLIC_KEY}`;
}

async function sendPush(subscription: StoredSubscription, env: Env): Promise<Response> {
  return fetch(subscription.endpoint, {
    headers: {
      Authorization: await makeVapidAuthorization(subscription.endpoint, env),
      TTL: String(PUSH_TTL_SECONDS),
      Urgency: "normal"
    },
    method: "POST"
  });
}

async function sendDueNotifications(env: Env, now = new Date()): Promise<void> {
  let cursor: string | undefined;

  do {
    const page = await env.SUBSCRIPTIONS.list({ cursor, limit: 100, prefix: "subscription:" });
    cursor = page.cursor;

    await Promise.all(
      page.keys.map(async ({ name }) => {
        const subscription = await env.SUBSCRIPTIONS.get<StoredSubscription>(name, "json");

        if (!subscription) {
          return;
        }

        const notification = shouldNotify(subscription, now);

        if (!notification.due) {
          return;
        }

        const response = await sendPush(subscription, env);

        if (response.status === 404 || response.status === 410) {
          await env.SUBSCRIPTIONS.delete(name);
          return;
        }

        if (response.ok) {
          await env.SUBSCRIPTIONS.put(
            name,
            JSON.stringify({
              ...subscription,
              lastNotifiedDate: notification.dateKey,
              updatedAt: now.toISOString()
            })
          );
        }
      })
    );
  } while (cursor);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: makeCorsHeaders(env), status: 204 });
    }

    if (url.pathname === "/config" && request.method === "GET") {
      return jsonResponse({ publicVapidKey: env.VAPID_PUBLIC_KEY }, env);
    }

    if (url.pathname === "/subscribe" && request.method === "POST") {
      return handleSubscribe(request, env);
    }

    if (url.pathname === "/subscribe" && request.method === "DELETE") {
      return handleDelete(request, env);
    }

    return jsonResponse({ error: "Not found." }, env, 404);
  },

  async scheduled(_event: unknown, env: Env, ctx: { waitUntil(promise: Promise<void>): void }): Promise<void> {
    ctx.waitUntil(sendDueNotifications(env));
  }
};
