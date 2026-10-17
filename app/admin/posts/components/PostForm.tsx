/* eslint-disable @next/next/no-img-element -- Editor previews arbitrary existing article URLs. */
'use client';

import { useEffect, useRef, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { ArticleApiError } from '@/lib/article-api';
import { PostSchema } from '@/lib/validations/post';
import { articleFormDefaults, articleFormFromPost, articleUpdatePatch } from '@/lib/article-form';
import { articleCdnUrl, articleUrlForSave, markdownImageUrls } from '@/lib/article-media-url';
import { createUuidV4 } from '@/lib/uuid';
import type { ArticleV2FormValues, Post } from '@/types/post';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import RelatedGemPicker from './RelatedGemPicker';
import { CoverFrames } from './CoverFrames';
import { MarkdownTextarea } from '@/components/MarkdownTextarea';

type Language = 'ru' | 'en';

export default function PostForm({ post, etag }: { post?: Post; etag?: string | null }) {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>('ru');
  const [savedPost, setSavedPost] = useState(post);
  const [currentETag, setCurrentETag] = useState(etag ?? null);
  const [cdnURL, setCdnURL] = useState('');
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [message, setMessage] = useState('');
  const [stale, setStale] = useState(false);
  const form = useForm<ArticleV2FormValues>({
    resolver: zodResolver(PostSchema),
    defaultValues: post ? articleFormFromPost(post) : articleFormDefaults(),
    shouldUnregister: false,
  });
  const { fields, append, remove, swap } = useFieldArray({ control: form.control, name: 'i18n.media.slides' });
  const slides = useWatch({ control: form.control, name: 'i18n.media.slides' });
  const relatedGems = useWatch({ control: form.control, name: 'gem_slugs' });
  const avatar = useWatch({ control: form.control, name: 'i18n.media.author_avatar_url' });
  const published = useWatch({ control: form.control, name: 'is_published' });
  const content = useWatch({ control: form.control, name: 'i18n' });
  useEffect(() => {
    if (!post || window.location.hash !== '#article-slides') return;
    const frame = requestAnimationFrame(() => document.getElementById('article-slides')?.scrollIntoView({ block: 'start' }));
    return () => cancelAnimationFrame(frame);
  }, [post]);
  const errorFor = (path: string) => {
    let value: unknown = form.formState.errors;
    for (const segment of path.split('.')) {
      value = value && typeof value === 'object' ? (value as Record<string, unknown>)[segment] : undefined;
    }
    return value && typeof value === 'object' && 'message' in value ? String(value.message) : '';
  };
  const errorText = (path: string) => errorFor(path) && <p role="alert" className="text-sm text-destructive">{errorFor(path)}</p>;
  const apiKey = () => localStorage.getItem('admin_api_key') || '';

  const reportError = (error: unknown) => {
    let text: string;
    if (error instanceof ArticleApiError && error.code === 'slug_already_exists') {
      text = 'Этот slug уже занят. Укажите другой и повторите сохранение.';
      form.setError('slug', { type: 'server', message: text });
    } else if (error instanceof ArticleApiError && error.code === 'invalid_image_dimensions') {
      text = 'Не удалось сохранить изображение: после преобразования изменились его размеры.';
    } else if (error instanceof ArticleApiError && error.fields.length) {
      for (const field of error.fields) form.setError(field.path as never, { type: 'server', message: field.message });
      text = error.fields.map((field) => field.path + ': ' + field.message).join('; ');
    } else {
      text = error instanceof Error ? error.message : 'Неизвестная ошибка';
    }
    setMessage(text);
    toast.error(text);
  };

  const addCdnSlide = () => {
    const url = articleCdnUrl(cdnURL);
    if (!url) {
      toast.error('Укажите полный HTTPS URL или путь внутри lithoteka-cdn');
      return;
    }
    append({ id: createUuidV4(), url, source: 'cdn', caption: { ru: '', en: '' }, alt: { ru: '', en: '' } });
    setCdnURL('');
  };

  const save = async (nextPublished: boolean, scrollToSlides = false) => {
    if (savingRef.current) return;
    setMessage('');
    if (nextPublished && !savedPost) {
      setMessage('Сначала создайте черновик, затем загрузите слайд и опубликуйте статью.');
      return;
    }
    savingRef.current = true;
    setSaving(true);
    const previousPublished = form.getValues('is_published');
    let navigating = false;
    try {
      form.setValue('is_published', nextPublished, { shouldValidate: true });
      const current = form.getValues();
      for (let index = 0; index < current.i18n.media.slides.length; index++) {
        const slide = current.i18n.media.slides[index];
        const previous = savedPost?.i18n.media.slides.find((item) => item.id === slide.id);
        const url = articleUrlForSave(slide.url, previous?.url);
        if (!url) {
          form.setError(`i18n.media.slides.${index}.url`, { message: 'Укажите полный HTTPS URL или путь внутри lithoteka-cdn' });
          setMessage('Укажите полный HTTPS URL или путь внутри lithoteka-cdn');
          return;
        }
        if (url !== slide.url) form.setValue(`i18n.media.slides.${index}.url`, url, { shouldDirty: true });
      }
      const previousAvatar = savedPost?.i18n.media.author_avatar_url || '';
      const nextAvatar = current.i18n.media.author_avatar_url;
      if (nextAvatar && nextAvatar !== previousAvatar) {
        const url = articleUrlForSave(nextAvatar, previousAvatar);
        if (!url) {
          form.setError('i18n.media.author_avatar_url', { message: 'Укажите полный HTTPS URL или путь внутри lithoteka-cdn' });
          setMessage('Укажите полный HTTPS URL или путь внутри lithoteka-cdn');
          return;
        }
        form.setValue('i18n.media.author_avatar_url', url, { shouldDirty: true });
      }
      if (!(await form.trigger())) {
        form.setValue('is_published', previousPublished);
        if (form.formState.errors.i18n?.en) setLanguage('en');
        setMessage('Проверьте поля статьи перед сохранением.');
        toast.error('Проверьте поля статьи перед сохранением.');
        return;
      }
      const values = form.getValues();
      for (const lang of ['ru', 'en'] as const) {
        const previous = new Set(markdownImageUrls(savedPost?.i18n[lang].content || ''));
        for (const url of markdownImageUrls(values.i18n[lang].content)) {
          if (!previous.has(url) && !articleCdnUrl(url)) {
            form.setError(`i18n.${lang}.content`, { message: 'Новые изображения Markdown должны указывать на lithoteka-cdn' });
            setMessage('Новый URL иллюстрации должен указывать на lithoteka-cdn');
            return;
          }
        }
      }
      const submitted = savedPost && values.slug !== savedPost.slug
        ? { ...values, i18n: { ...values.i18n, media: { ...values.i18n.media,
            slides: values.i18n.media.slides.map((slide) => ({ ...slide, source: 'cdn' as const })),
          } } }
        : values;
      const result = savedPost
        ? await api.updatePost(savedPost.slug, articleUpdatePatch(savedPost, submitted), apiKey(), currentETag)
        : await api.createPost(submitted, apiKey());
      setSavedPost(result.post);
      setCurrentETag(result.etag);
      form.reset(articleFormFromPost(result.post));
      setStale(false);
      toast.success(nextPublished ? 'Статья опубликована' : 'Черновик сохранён');
      if (!savedPost || result.post.slug !== savedPost.slug) {
        router.replace('/admin/posts/' + encodeURIComponent(result.post.slug) + '/edit' + (scrollToSlides ? '#article-slides' : ''));
        navigating = true;
      }
    } catch (error) {
      form.setValue('is_published', previousPublished);
      if (error instanceof ArticleApiError && error.status === 412) {
        setStale(true);
        setMessage('Статья изменилась после загрузки. Правки остались в форме. Скопируйте их перед загрузкой актуальной версии.');
      } else {
        reportError(error);
      }
    } finally {
      if (!navigating) {
        savingRef.current = false;
        setSaving(false);
      }
    }
  };

  return (
    <form onSubmit={(event) => event.preventDefault()} className="space-y-6">
      <div className="flex flex-wrap items-end gap-4 rounded-xl border p-4">
        <div className="min-w-64 flex-1 space-y-2">
          <Label htmlFor="post-slug">Slug</Label>
          <Input id="post-slug" {...form.register('slug')} disabled={saving} placeholder="why-is-quartz-transparent" />
          {errorText('slug')}
        </div>
        <div className="space-y-2">
          <Label htmlFor="post-type">Тип</Label>
          <select id="post-type" {...form.register('type')} className="h-8 rounded-lg border bg-background px-3 text-sm">
            <option value="guide">Гид</option><option value="blog">Блог</option><option value="history">История</option><option value="esoteric">Эзотерика</option><option value="review">Обзор</option>
          </select>
        </div>
        <p className="pb-1 text-sm text-muted-foreground">Статус: {published ? 'опубликована' : 'черновик'}</p>
      </div>

      <div className="flex gap-2" role="group" aria-label="Язык статьи">
        <Button type="button" variant={language === 'ru' ? 'default' : 'outline'} onClick={() => setLanguage('ru')}>RU</Button>
        <Button type="button" variant={language === 'en' ? 'default' : 'outline'} onClick={() => setLanguage('en')}>EN</Button>
      </div>

      {savedPost && <CoverFrames key={savedPost.slug} slug={savedPost.slug} etag={currentETag} onSaved={(resource) => { setSavedPost(resource.post); setCurrentETag(resource.etag); }} />}
      <Card id="article-slides"><CardHeader><CardTitle>1. Слайды</CardTitle></CardHeader><CardContent className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="space-y-3 rounded-xl border p-4">
            <div className="flex flex-wrap gap-4">
              {slides[index]?.url && (brokenImages[slides[index].url]
                ? <span className="flex h-28 w-48 items-center justify-center bg-muted text-sm">Изображение недоступно</span>
                : <img src={articleCdnUrl(slides[index].url) || slides[index].url} alt={slides[index]?.alt?.[language] || 'Слайд статьи'} className="h-28 w-48 rounded-lg bg-muted object-contain" onError={() => setBrokenImages((current) => ({ ...current, [slides[index].url]: true }))} />)}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Слайд {index + 1}</span>
                <Button type="button" variant="outline" size="sm" disabled={index === 0 || saving} onClick={() => swap(index, index - 1)}><ArrowUp className="size-4" /> Вверх</Button>
                <Button type="button" variant="outline" size="sm" disabled={index === fields.length - 1 || saving} onClick={() => swap(index, index + 1)}><ArrowDown className="size-4" /> Вниз</Button>
                <Button type="button" variant="destructive" size="sm" disabled={saving} onClick={() => remove(index)}><Trash2 className="size-4" /> Удалить</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={'slide-url-' + index}>URL или путь изображения из Lithoteka CDN</Label>
              <Input id={'slide-url-' + index} type="text" placeholder="articles/quartz/images/cover/01.webp" {...form.register('i18n.media.slides.' + index + '.url' as 'i18n.media.slides.0.url', { onChange: () => form.setValue('i18n.media.slides.' + index + '.source' as 'i18n.media.slides.0.source', 'cdn', { shouldDirty: true }) })} disabled={saving} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2"><Label htmlFor={'caption-' + index}>Подпись ({language.toUpperCase()})</Label><Input id={'caption-' + index} key={'caption-' + language + '-' + index} {...form.register('i18n.media.slides.' + index + '.caption.' + language as 'i18n.media.slides.0.caption.ru')} /></div>
              <div className="space-y-2"><Label htmlFor={'alt-' + index}>Alt ({language.toUpperCase()})</Label><Input id={'alt-' + index} key={'alt-' + language + '-' + index} {...form.register('i18n.media.slides.' + index + '.alt.' + language as 'i18n.media.slides.0.alt.ru')} />{errorText('i18n.media.slides.' + index + '.alt.' + language)}</div>
            </div>
            {errorText('i18n.media.slides.' + index + '.url')}
          </div>
        ))}
        {errorText('i18n.media.slides')}
        {!savedPost && <Button type="button" disabled={saving} onClick={() => void save(false, true)}>
              {saving ? 'Создаём черновик...' : 'Создать черновик и перейти к изображениям'}
            </Button>}
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-64 flex-1 space-y-2"><Label htmlFor="new-slide-cdn-url">URL или путь изображения из Lithoteka CDN</Label><Input id="new-slide-cdn-url" type="text" value={cdnURL} onChange={(event) => setCdnURL(event.target.value)} placeholder="articles/quartz/images/cover/01.webp" disabled={saving} /></div>
          <Button type="button" variant="outline" disabled={saving || !cdnURL.trim()} onClick={addCdnSlide}><Plus className="size-4" /> Добавить по ссылке</Button>
        </div>
        <p className="text-sm text-muted-foreground">Укажите HTTPS URL или путь внутри lithoteka-cdn. Файл остаётся на своём месте в CDN.</p>
        {!savedPost && <p className="text-sm text-muted-foreground">Ссылку на изображение в CDN можно добавить уже сейчас.</p>}
      </CardContent></Card>

      <Card><CardHeader><CardTitle>2. Заголовок</CardTitle></CardHeader><CardContent className="space-y-2">
        <Label htmlFor="post-title">Заголовок ({language.toUpperCase()})</Label>
        <Input id="post-title" key={'title-' + language} {...form.register('i18n.' + language + '.title' as 'i18n.ru.title')} placeholder={language === 'ru' ? 'На какой вопрос отвечает статья?' : 'What question does this article answer?'} />
        {errorText('i18n.' + language + '.title')}
      </CardContent></Card>

      <Card><CardHeader><CardTitle>3. Лид</CardTitle></CardHeader><CardContent className="space-y-2">
        <Label htmlFor="post-excerpt">Лид ({language.toUpperCase()})</Label>
        <Textarea id="post-excerpt" key={'excerpt-' + language} rows={3} {...form.register('i18n.' + language + '.excerpt' as 'i18n.ru.excerpt')} />
        {errorText('i18n.' + language + '.excerpt')}
      </CardContent></Card>

      <Card><CardHeader><CardTitle>4. Основной текст</CardTitle></CardHeader><CardContent className="space-y-2">
        <Label>Markdown ({language.toUpperCase()})</Label>
        <MarkdownTextarea value={content[language].content} onChange={(value) => form.setValue('i18n.' + language + '.content' as 'i18n.ru.content', value, { shouldDirty: true, shouldValidate: true })} rows={14} placeholder={'## Заголовок\n\nТекст статьи...'} />
        {markdownImageUrls(content[language].content).map((url, index) => <div key={`${url}-${index}`} className="flex items-center gap-3 rounded border p-2">
          {brokenImages[url] ? <span className="text-sm">Иллюстрация недоступна</span>
            : <img src={articleCdnUrl(url) || url} alt={`Иллюстрация ${index + 1}`} className="h-20 w-28 object-contain" onError={() => setBrokenImages((current) => ({ ...current, [url]: true }))} />}
          <span className="break-all text-xs text-muted-foreground">{url}</span>
        </div>)}
        {errorText('i18n.' + language + '.content')}
      </CardContent></Card>

      <Card><CardHeader><CardTitle>5. Автор</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="space-y-2"><Label htmlFor="post-author">Имя автора</Label><Input id="post-author" {...form.register('author')} />{errorText('author')}</div>
        {avatar && <div className="flex items-center gap-3">
          {brokenImages[avatar] ? <span className="text-sm">Аватар недоступен</span> : <img src={articleCdnUrl(avatar) || avatar} alt="Аватар автора" className="size-16 rounded-full object-contain" onError={() => setBrokenImages((current) => ({ ...current, [avatar]: true }))} />}
          <Button type="button" variant="outline" onClick={() => form.setValue('i18n.media.author_avatar_url', '', { shouldDirty: true })}>Удалить аватар</Button>
        </div>}
        <div className="space-y-2"><Label htmlFor="author-avatar-url">URL или путь изображения из Lithoteka CDN</Label><Input id="author-avatar-url" type="text" placeholder="common_images/author.webp" {...form.register('i18n.media.author_avatar_url')} /></div>
        {errorText('i18n.media.author_avatar_url')}
      </CardContent></Card>

      <Card><CardHeader><CardTitle>6. Связанные камни</CardTitle></CardHeader><CardContent>
        <RelatedGemPicker value={relatedGems || []} onChange={value => form.setValue('gem_slugs', value, { shouldDirty: true, shouldValidate: true })} />
        {errorText('gem_slugs')}
      </CardContent></Card>

      <div className="space-y-3 rounded-xl border p-4">
        <p className="text-sm text-muted-foreground">Для публикации нужны RU и EN заголовок, лид, Markdown, автор и хотя бы один слайд с alt на обоих языках.</p>
        {form.formState.isDirty && <p className="text-sm text-amber-700">Есть несохранённые изменения, включая загруженные изображения.</p>}
        {message && <p role="alert" className="text-sm text-destructive">{message}</p>}
        {stale && <Button type="button" variant="outline" onClick={() => { if (window.confirm('Загрузить актуальную статью? Несохранённые правки будут потеряны.')) window.location.reload(); }}>Загрузить актуальную статью</Button>}
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" disabled={saving || stale} onClick={() => void save(false)}>{saving ? 'Сохраняем...' : !savedPost ? 'Создать черновик' : published ? 'Снять с публикации' : 'Сохранить черновик'}</Button>
          {savedPost && <Button type="button" disabled={saving || stale} onClick={() => void save(true)}>{published ? 'Сохранить опубликованную статью' : 'Опубликовать'}</Button>}
        </div>
      </div>
    </form>
  );
}
