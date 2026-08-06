'use client';

import { useRef, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

type UploadKind = 'hero' | 'thumbnail' | 'gallery' | 'cover' | 'block_image' | 'block_pair';

interface ImageUploadFieldProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  /**
   * Куда и как сохранить файл в Object Storage — все варианты конвертируют
   * файл в WebP и требуют slug (минерала или статьи):
   *   "hero"        — <slug>/hero.webp
   *   "thumbnail"   — <slug>/thumbnail.webp
   *   "gallery"     — <slug>/gallery/<slug><NN>.webp (номер — автоматически)
   *   "cover"       — articles/<slug>/cover.webp (+ "-<lang>", если задан lang)
   *   "block_image" — articles/<slug>/image-<NN>.webp (требует blockIndex)
   *   "block_pair"  — articles/<slug>/image-<NN>-<P>.webp (требует blockIndex и pairIndex)
   */
  kind: UploadKind;
  slug?: string;
  /** Порядковый номер блока статьи (1-based) — обязателен для block_image/block_pair. */
  blockIndex?: number;
  /** 1 или 2 — какая картинка в паре — обязателен для block_pair. */
  pairIndex?: 1 | 2;
  /** ru | en — если это языковой оверрайд картинки (схема/диаграмма с текстом внутри). */
  lang?: 'ru' | 'en';
}

// Компонент загрузки картинки: можно либо выбрать файл (уходит в Object Storage
// через /api/v1/media и возвращает публичный URL с правильной структурой папок),
// либо, как и раньше, вставить готовый URL вручную — оба пути пишут в одно и то же
// поле формы.
export function ImageUploadField({
  value,
  onChange,
  label,
  kind,
  slug,
  blockIndex,
  pairIndex,
  lang,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const slugMissing = !slug;
  const blockIndexMissing = (kind === 'block_image' || kind === 'block_pair') && !blockIndex;
  const pairIndexMissing = kind === 'block_pair' && !pairIndex;
  const disabledReason = slugMissing
    ? 'Сначала укажите slug'
    : blockIndexMissing
      ? 'Не определён номер блока статьи'
      : pairIndexMissing
        ? 'Не определён номер картинки в паре'
        : null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (disabledReason) {
      toast.error(`${disabledReason} — без этого нельзя сохранить файл в правильную папку бакета`);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    const apiKey = localStorage.getItem('admin_api_key');
    if (!apiKey) {
      toast.error('API Key не найден — войдите заново');
      return;
    }

    setUploading(true);
    try {
      const { url } = await api.uploadMedia(file, apiKey, { kind, slug, blockIndex, pairIndex, lang });
      onChange(url);
      toast.success('Изображение загружено');
    } catch (error: any) {
      toast.error(error.message || 'Не удалось загрузить изображение');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium">{label}</p>}
      {disabledReason && <p className="text-xs text-amber-600">{disabledReason} — загрузка файла временно недоступна</p>}

      <div className="flex gap-2">
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://storage.yandexcloud.net/samotsvety-cdn/..."
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={uploading || Boolean(disabledReason)}
          onClick={() => inputRef.current?.click()}
          title={disabledReason || 'Загрузить файл'}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange('')}
            title="Очистить"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileSelect}
      />

      {value && (
        <img
          src={value}
          alt="Предпросмотр"
          className="max-h-40 rounded-md border object-contain bg-muted"
          onError={(e) => {
            (e.target as HTMLImageElement).style.opacity = '0.3';
          }}
        />
      )}
    </div>
  );
}
