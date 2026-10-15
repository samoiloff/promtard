# Promptard

Персональная доска промптов (Next.js 16, Auth.js, Neon PostgreSQL).

## Getting Started

```bash
cp .env.example .env.local
# заполните DATABASE_URL, AUTH_SECRET, OAuth-ключи
pnpm install
pnpm dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## OAuth: local vs production

Переключение окружений — через `AUTH_URL` в `.env.local` (локально) и в переменных Vercel (продакшен). Callback-пути в коде менять не нужно.

Подробно: [docs/oauth-environments.md](docs/oauth-environments.md).

## Deploy on Vercel

1. Импортируйте репозиторий на [Vercel](https://vercel.com/new).
2. Задайте переменные окружения для **Production** (см. чеклист в [docs/oauth-environments.md](docs/oauth-environments.md)).
3. Добавьте production redirect URI в Google (и Meta, если нужен Facebook).
4. Redeploy и проверьте вход через Google на prod URL.
