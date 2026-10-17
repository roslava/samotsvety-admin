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

## Экспорт каталога в Markdown ZIP

На странице `/admin/minerals` кнопка «Экспортировать каталог» скачивает свежий полный список из V2 API. В архиве `samotsvety-catalog-YYYYMMDD-HHmmss.zip` находятся `samotsvety-catalog/minerals/<slug>.md` для успешно проверенных карточек и `samotsvety-catalog/manifest.json`. Манифест содержит время экспорта, количество карточек, список файлов и ошибки; по нему можно сверить полноту архива.

Если часть карточек не прошла проверку, имя ZIP содержит `PARTIAL`, а статус манифеста — `partial`. Такой архив нельзя считать полной копией каталога. Если каталог пуст или все карточки ошибочны, ZIP не создаётся. Отдельный `.md` можно импортировать обратно через раздел «Импорт Markdown» в форме создания или редактирования карточки.

Архив содержит только относительные пути изображений, без бинарных файлов. Он не заменяет полный backup PostgreSQL.
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

Для изображений задайте `NEXT_PUBLIC_MEDIA_BASE_URL=https://storage.yandexcloud.net/lithoteka-cdn` (тот же адрес, что `YC_S3_PUBLIC_URL` backend). URL сущности строится из сохранённых `images.storage_key` и относительного `path` как `entities/{storage_key}/images/{path}`. При загрузке форма передаёт API оба значения — `slug` и фактический `storage_key`; в карточку сохраняется только относительный путь. После изменения переменной перезапустите Next.js.

Редактор Article V2 получает универсальную, русскую и английскую последовательности через `GET /api/v1/posts/{slug}/cover-frames?all=1` и сохраняет их как `i18n.media.cover_frames` через `PUT /api/v1/posts/{slug}` с ETag. В каждой последовательности можно добавить URL из Lithoteka CDN, удалить ссылку и изменить порядок; первый кадр основной. Удаление ссылки не удаляет файл. При отсутствии языковых кадров публичный API использует универсальные. Слайды, аватары и изображения Markdown задаются URL из CDN; редактор не загружает файлы статей с компьютера. Существующие старые URL сохраняются без автоматической замены.

В полях изображений Article V2 можно вставить полный HTTPS URL или путь внутри бакета, например `articles/quartz/images/cover/01.webp`, `entities/bruneau_jasper/images/hero.webp` либо `common_images/home/slider/01.webp`. При добавлении кадра или сохранении статьи относительный путь превращается в полный URL с базой `NEXT_PUBLIC_MEDIA_BASE_URL`; поддерживаются адреса `https://lithoteka-cdn.storage.yandexcloud.net` и `https://storage.yandexcloud.net/lithoteka-cdn`. В данных API остаётся полный URL. Текст Markdown не преобразуется автоматически: ссылки на изображения внутри Markdown редактор сохраняет в том виде, в котором они введены.
