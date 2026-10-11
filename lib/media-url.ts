export const mediaUrl = (storageKey: string, path: string) =>
  `${(process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? "https://storage.yandexcloud.net/samotsvety-cdn").replace(/\/$/, "")}/${encodeURIComponent(storageKey)}/${path.split("/").map(encodeURIComponent).join("/")}`;
