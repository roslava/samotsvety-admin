# Samotsvety Admin Panel

Админ-панель для управления базой самоцветов и минералов **Samotsvety**.

## О проекте

Современная админка на **Next.js 15 (App Router)** + TypeScript + Tailwind + shadcn/ui для управления API `samotsvety-api`.

## Основные возможности

- Авторизация по API Key
- Полноценное управление минералами (CRUD)
- **Удобная форма создания/редактирования** с вкладками
- Импорт данных из Markdown (для быстрого заполнения через нейросеть)
- Предпросмотр изображений в реальном времени
- Автогенерация URL для изображений на основе slug и типа
- Полная поддержка двуязычности (ru + en)
- Поддержка научного и эзотерического контента
- Динамические списки (месторождения, галерея)

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
npm install
npm run dev

```


Откройте http://localhost:3000/admin


## Структура проекта

app/admin/
├── minerals/
│   ├── new/page.tsx
│   ├── [slug]/edit/page.tsx
│   └── components/
│       ├── MineralForm.tsx          # Главная форма с вкладками
│       ├── BasicInfoSection.tsx
│       ├── ScientificSection.tsx
│       ├── I18nSection.tsx
│       ├── LocalitiesSection.tsx
│       ├── GallerySection.tsx       # с предпросмотром и автогенерацией
│       ├── EsotericSection.tsx
│       └── ImportMarkdownSection.tsx # импорт Markdown + шаблон
├── login/
└── layout.tsx



## Возможности формы минерала

Вкладки: Основное, Научные, Названия + Lore, Месторождения, Галерея, Эзотерика, Импорт Markdown
Markdown — единственный пользовательский формат импорта: карточка разбирается в canonical V2 object, валидируется `MineralSchema` и отправляется в V2 API как JSON.
Пути изображений относительно storage_key (hero.webp, thumbnail.webp, gallery/specimen-01.webp и т.д.)
Предпросмотр загруженных изображений
Опциональные поля (localities, type в галерее, thumbnail)
Полная валидация через Zod

## Связь с backend

Перед входом запустите `samotsvety-api` и проверьте `http://localhost:8080/health`.
Админка отправляет запросы к API через свой сервер, поэтому адрес backend должен быть доступен из процесса Next.js:

```bash
API_URL=http://localhost:8080
```

Если `API_URL` не задан, используется `NEXT_PUBLIC_API_URL` из `.env.local`, затем `http://localhost:8080`.
После изменения адреса перезапустите Next.js.
