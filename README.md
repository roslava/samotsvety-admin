# Samotsvety Admin Panel

Админ-панель для управления базой самоцветов и минералов **Samotsvety**.

## О проекте

Современная админка на Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui для управления API `samotsvety-api`.

## Основные возможности
- Авторизация по API Key
- Управление минералами (CRUD)
- Удобные формы для scientific, i18n (ru/en), localities, gallery
- Таблица с фильтрами и поиском
- Предпросмотр в режимах normal/esoteric

## Технологии
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Table
- React Hook Form + Zod
- Axios / TanStack Query

## Быстрый старт

```bash
# Установка зависимостей
npm install

# Дополнительные UI-компоненты (shadcn)
npx shadcn-ui@latest init
npx shadcn-ui@latest add table button form input card tabs dialog toast

# Запуск
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

## Структура проекта

```
app/
├── admin/              # Основные страницы админки
├── api/                # Route handlers (если нужны)
├── components/         # Общие UI-компоненты
├── lib/                # Утилиты, API client
└── types/              # TypeScript типы из backend
```

## Связь с backend
`NEXT_PUBLIC_API_URL=http://localhost:8080`

---

**Готов к разработке!** 🚀
