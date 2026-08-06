'use client';

import { useRef, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadFieldProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  /**
   * "article" (по умолчанию) — прежнее поведение: файл летит в articles/<random>.<ext>.
   * "hero" | "thumbnail" | "gallery" — файл конвертируется в WebP и кладётся в
   * структуру бакета минерала: <slug>/hero.webp, <slug>/thumbnail.webp,
   * <slug>/gallery/<slug><NN>.webp соответственно. Требует переданный slug.
   */
  kind?: 'article' | 'hero' | 'thumbnail' | 'gallery';
  slug?: string;
}

// Компонент загрузки картинки: можно либо выбрать файл (уходит в Object Storage
// через /api/v1/media и возвращает публичный URL), либо, как и раньше, вставить
// готовый URL вручную — оба пути пишут в одно и то же поле формы.
export function ImageUploadField({ value, onChange, label, kind = 'article', slug }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const requiresSlug = kind === 'hero' || kind === 'thumbnail' || kind === 'gallery';
  const slugMissing = requiresSlug && !slug;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (slugMissing) {
      toast.error('Сначала укажите slug минерала — без него нельзя сохранить файл в правильную папку бакета');
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
      const { url } = await api.uploadMedia(file, apiKey, { kind, slug });
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
      {slugMissing && (
        <p className="text-xs text-amber-600">Сначала укажите slug минерала выше — файл сохранится как {'{slug}'}/{kind === 'gallery' ? 'gallery/...' : `${kind}.webp`}</p>
      )}

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
          disabled={uploading || slugMissing}
          onClick={() => inputRef.current?.click()}
          title={slugMissing ? 'Сначала укажите slug минерала' : 'Загрузить файл'}
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
