import { Platform } from "react-native";

const DEFAULT_NOTIFY_HOUR = 12;
const CONFIG_FILE = "push-config.json";

declare const process:
  | {
      env?: Record<string, string | undefined>;
    }
  | undefined;

type PushStatus =
  | "checking"
  | "unsupported"
  | "not-configured"
  | "idle"
  | "registering"
  | "enabled"
  | "denied"
  | "error";

export interface PushRegistrationState {
  status: PushStatus;
  message: string;
}

interface PushConfig {
  apiBaseUrl: string;
  publicVapidKey: string;
}

interface PushConfigFile {
  apiBaseUrl?: string;
  publicVapidKey?: string;
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function getEnvValue(key: string): string {
  if (typeof process === "undefined") {
    return "";
  }

  return process.env?.[key] ?? "";
}

async function loadConfigFile(): Promise<PushConfigFile> {
  if (typeof document === "undefined") {
    return {};
  }

  try {
    const configUrl = new URL(CONFIG_FILE, document.baseURI).toString();
    const response = await fetch(configUrl, { cache: "no-store" });

    if (!response.ok) {
      return {};
    }

    return (await response.json()) as PushConfigFile;
  } catch {
    return {};
  }
}

async function loadPushConfig(): Promise<PushConfig> {
  const fileConfig = await loadConfigFile();
  const apiBaseUrl = trimTrailingSlash(
    getEnvValue("EXPO_PUBLIC_PUSH_API_URL") || fileConfig.apiBaseUrl || ""
  );
  let publicVapidKey = getEnvValue("EXPO_PUBLIC_VAPID_PUBLIC_KEY") || fileConfig.publicVapidKey || "";

  if (apiBaseUrl && !publicVapidKey) {
    try {
      const response = await fetch(`${apiBaseUrl}/config`, { cache: "no-store" });

      if (response.ok) {
        const remoteConfig = (await response.json()) as Partial<PushConfigFile>;
        publicVapidKey = remoteConfig.publicVapidKey ?? "";
      }
    } catch {
      publicVapidKey = "";
    }
  }

  return { apiBaseUrl, publicVapidKey };
}

function getUnsupportedReason(): PushRegistrationState | null {
  if (Platform.OS !== "web") {
    return {
      status: "unsupported",
      message: "Пуши доступны в версии с экрана Домой."
    };
  }

  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return {
      status: "unsupported",
      message: "Этот режим не похож на браузер."
    };
  }

  if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return {
      status: "unsupported",
      message: "Этот браузер не умеет web push."
    };
  }

  if (!window.isSecureContext) {
    return {
      status: "unsupported",
      message: "Нужен HTTPS-сайт."
    };
  }

  return null;
}

function urlBase64ToArrayBuffer(value: string): ArrayBuffer {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = `${value}${padding}`.replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    output[index] = rawData.charCodeAt(index);
  }

  return output.buffer;
}

function getTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

function getAppUrl(): string {
  if (typeof document === "undefined") {
    return "";
  }

  return new URL(".", document.baseURI).toString();
}

async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
  const workerUrl = new URL("sw.js", document.baseURI).toString();
  const scope = new URL(".", document.baseURI).toString();
  await navigator.serviceWorker.register(workerUrl, { scope });
  return navigator.serviceWorker.ready;
}

async function saveSubscription(
  apiBaseUrl: string,
  subscription: PushSubscription
): Promise<Response> {
  return fetch(`${apiBaseUrl}/subscribe`, {
    body: JSON.stringify({
      appUrl: getAppUrl(),
      notifyHour: DEFAULT_NOTIFY_HOUR,
      subscription: subscription.toJSON(),
      timeZone: getTimeZone()
    }),
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST"
  });
}

export async function getInitialPushState(): Promise<PushRegistrationState> {
  const unsupported = getUnsupportedReason();

  if (unsupported) {
    return unsupported;
  }

  if (Notification.permission === "denied") {
    return {
      status: "denied",
      message: "Разрешение выключено в настройках Safari."
    };
  }

  const config = await loadPushConfig();

  if (!config.apiBaseUrl || !config.publicVapidKey) {
    return {
      status: "not-configured",
      message: "Нужно подключить worker для отправки."
    };
  }

  try {
    const registration = await getServiceWorkerRegistration();
    const subscription = await registration.pushManager.getSubscription();

    if (subscription && Notification.permission === "granted") {
      return {
        status: "enabled",
        message: "Придет около 12:00 в день молодого серпа."
      };
    }
  } catch {
    return {
      status: "idle",
      message: "Нажми, чтобы включить напоминания."
    };
  }

  return {
    status: "idle",
    message: "Нажми, чтобы включить напоминания."
  };
}

export async function registerForLunarPush(): Promise<PushRegistrationState> {
  const unsupported = getUnsupportedReason();

  if (unsupported) {
    return unsupported;
  }

  const config = await loadPushConfig();

  if (!config.apiBaseUrl || !config.publicVapidKey) {
    return {
      status: "not-configured",
      message: "Сначала нужен адрес push-worker."
    };
  }

  const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();

  if (permission !== "granted") {
    return {
      status: "denied",
      message: "Разрешение не выдано."
    };
  }

  try {
    const registration = await getServiceWorkerRegistration();
    const existing = await registration.pushManager.getSubscription();
    const subscription =
      existing ??
      (await registration.pushManager.subscribe({
        applicationServerKey: urlBase64ToArrayBuffer(config.publicVapidKey),
        userVisibleOnly: true
      }));
    const response = await saveSubscription(config.apiBaseUrl, subscription);

    if (!response.ok) {
      return {
        status: "error",
        message: "Worker не принял подписку."
      };
    }

    return {
      status: "enabled",
      message: "Придет около 12:00 в день молодого серпа."
    };
  } catch {
    return {
      status: "error",
      message: "Не получилось включить уведомления."
    };
  }
}
