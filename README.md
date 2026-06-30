# Luna Helper

PWA-версия умеет ставиться на экран iPhone и подписываться на web push. Уведомление приходит около 12:00 по локальному времени телефона в день молодого серпа.

## Push setup

1. Сгенерируй VAPID-ключи:

```bash
npm run push:keys
```

2. Создай KV namespace в Cloudflare и вставь его id в `push-worker/wrangler.toml`.

```bash
cd push-worker
npx wrangler kv namespace create SUBSCRIPTIONS
```

3. Заполни в `push-worker/wrangler.toml`:

```toml
VAPID_PUBLIC_KEY = "..."
VAPID_SUBJECT = "mailto:your-email@example.com"
```

4. Сохрани private key как секрет Cloudflare:

```bash
npx wrangler secret put VAPID_PRIVATE_KEY
```

5. Выложи worker:

```bash
npx wrangler deploy
```

6. Вставь URL worker в `public/push-config.json`:

```json
{
  "apiBaseUrl": "https://luna-push.your-subdomain.workers.dev",
  "publicVapidKey": "..."
}
```

После этого собери и выложи GitHub Pages:

```bash
npm run build:pages
```

На iPhone: открыть `https://kolosovao.github.io/luna/` в Safari, добавить на экран Домой, открыть и нажать `Напомнить в 12:00`.
