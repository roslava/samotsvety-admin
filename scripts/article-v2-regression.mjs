import assert from 'node:assert/strict';
import { api } from '../lib/api.ts';
import { ArticleApiError } from '../lib/article-api.ts';
import { ArticleSlideSchema, PostCreateSchema, PostSchema, PostUpdateSchema } from '../lib/validations/post.ts';
import { articleFormDefaults, articleFormFromPost, articleUpdatePatch } from '../lib/article-form.ts';
import { articleSlideUrl, articleCdnUrl, articleUrlForSave, markdownImageUrls } from '../lib/article-media-url.ts';
import { createUuidV4 } from '../lib/uuid.ts';
import { changeCoverSequence, moveCoverFrame, removeCoverFrame } from '../lib/cover-sequences.ts';

const generated = createUuidV4({ getRandomValues: (bytes) => { bytes.fill(0xff); return bytes; } });
assert.equal(generated, 'ffffffff-ffff-4fff-bfff-ffffffffffff');
assert.match(createUuidV4(), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
assert.throws(() => createUuidV4(null), /криптографическую генерацию UUID/);
const originalMediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
process.env.NEXT_PUBLIC_MEDIA_BASE_URL = 'https://cdn.example/media';
assert.equal(articleSlideUrl('articles/quartz_transparent_while_another_is_milky/quartz_transparent_while_another_is_milky_01.webp'), 'https://cdn.example/media/articles/quartz_transparent_while_another_is_milky/quartz_transparent_while_another_is_milky_01.webp');
if (originalMediaBase === undefined) delete process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
else process.env.NEXT_PUBLIC_MEDIA_BASE_URL = originalMediaBase;
assert.equal(articleSlideUrl('https://cdn.example/articles/example/image.webp'), 'https://cdn.example/articles/example/image.webp');
assert.equal(articleSlideUrl('http://cdn.example/image.webp'), null);
assert.equal(articleSlideUrl('articles/../image.webp'), null);
assert.equal(articleCdnUrl('https://lithoteka-cdn.storage.yandexcloud.net/common_images/quartz.webp'), 'https://lithoteka-cdn.storage.yandexcloud.net/common_images/quartz.webp');
assert.equal(articleCdnUrl('https://storage.yandexcloud.net/lithoteka-cdn/articles/quartz/images/content/01.webp'), 'https://storage.yandexcloud.net/lithoteka-cdn/articles/quartz/images/content/01.webp');
assert.equal(articleCdnUrl('https://lithoteka-cdn.storage.yandexcloud.net/common_images/quartz%20example.webp'), 'https://lithoteka-cdn.storage.yandexcloud.net/common_images/quartz%20example.webp');
assert.equal(articleCdnUrl('https://evil.example/quartz.webp'), null);
const historicalURL = 'https://samotsvety-cdn.storage.yandexcloud.net/articles/quartz/cover.webp';
assert.equal(articleCdnUrl(historicalURL), null, 'old bucket must not accept new media');
assert.equal(articleUrlForSave(historicalURL, historicalURL), historicalURL, 'loaded historical URL must survive save');
assert.equal(articleUrlForSave(` ${historicalURL} `, historicalURL), null, 'edited historical URL must follow new media validation');
assert.equal(articleUrlForSave(historicalURL), null, 'old bucket must not be accepted for newly entered media');
assert.equal(articleUrlForSave(historicalURL, 'https://samotsvety-cdn.storage.yandexcloud.net/articles/other.webp'), null, 'another old URL is a changed value');
assert.equal(articleUrlForSave('https://evil.example/articles/a.webp', 'https://evil.example/articles/a.webp'), null, 'external URL cannot masquerade as a historical CDN link');
process.env.NEXT_PUBLIC_MEDIA_BASE_URL = 'https://lithoteka-cdn.storage.yandexcloud.net';
const objectPath = 'articles/quartz/images/cover/01.webp';
const virtualURL = `https://lithoteka-cdn.storage.yandexcloud.net/${objectPath}`;
const pathURL = `https://storage.yandexcloud.net/lithoteka-cdn/${objectPath}`;
assert.equal(articleCdnUrl(objectPath), virtualURL);
assert.equal(articleCdnUrl(`  ${objectPath}  `), virtualURL);
assert.equal(articleCdnUrl(virtualURL), virtualURL);
assert.equal(articleCdnUrl(pathURL), pathURL);
assert.equal(articleCdnUrl('entities/bruneau_jasper/images/hero.webp'), 'https://lithoteka-cdn.storage.yandexcloud.net/entities/bruneau_jasper/images/hero.webp');
assert.equal(articleCdnUrl('common_images/home/slider/01.webp'), 'https://lithoteka-cdn.storage.yandexcloud.net/common_images/home/slider/01.webp');
assert.equal(articleCdnUrl('articles/quartz/images/content/quartz%20one.webp'), 'https://lithoteka-cdn.storage.yandexcloud.net/articles/quartz/images/content/quartz%20one.webp');
assert.equal(articleCdnUrl(virtualURL).split('lithoteka-cdn.storage.yandexcloud.net').length, 2, 'full URL must not gain a second CDN host');
for (const invalid of ['', '../articles/a.webp', '/articles/a.webp', 'articles//a.webp', 'articles/../a.webp', 'articles/%2e%2e/a.webp', 'articles/%252e%252e/a.webp', 'articles/%2fa.webp', 'articles/a\\b.webp', 'articles/a.webp?x=1', 'https://evil.example/articles/a.webp', 'http://lithoteka-cdn.storage.yandexcloud.net/articles/a.webp', 'https://lithoteka-cdn.storage.yandexcloud.net/articles/../a.webp', 'https://lithoteka-cdn.storage.yandexcloud.net/articles/%2e%2e/a.webp', 'https://storage.yandexcloud.net/another-bucket/articles/a.webp']) {
  assert.equal(articleCdnUrl(invalid), null, invalid);
}
process.env.NEXT_PUBLIC_MEDIA_BASE_URL = 'https://storage.yandexcloud.net/lithoteka-cdn';
assert.equal(articleCdnUrl(objectPath), pathURL);
assert.equal(articleCdnUrl(virtualURL), virtualURL);
if (originalMediaBase === undefined) delete process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
else process.env.NEXT_PUBLIC_MEDIA_BASE_URL = originalMediaBase;
assert.deepEqual(markdownImageUrls('![Кварц](https://lithoteka-cdn.storage.yandexcloud.net/common_images/quartz.webp)'), ['https://lithoteka-cdn.storage.yandexcloud.net/common_images/quartz.webp']);

const slide = {
  id: '64ac5e2c-943d-4b5c-b942-a80deee45a23',
  url: 'https://cdn.example/articles/question/slides/64ac5e2c-943d-4b5c-b942-a80deee45a23/unique.webp',
  caption: { ru: 'Подпись', en: 'Caption' },
  alt: { ru: 'Фото', en: 'Photo' },
};
const post = {
  id: '7fd73b21-8c67-4d0f-a62e-f27afcb7c280', slug: 'question', type: 'guide',
  i18n: {
    ru: { title: 'Вопрос?', excerpt: 'Лид', content: '**Ответ**' },
    en: { title: 'Question?', excerpt: 'Lead', content: '**Answer**' },
    media: { schema_version: 2, slides: [slide], author_avatar_url: '' },
  },
  author: 'Редакция', gem_slugs: [], tags: [], is_published: true,
  published_at: '2026-10-14T10:00:00Z', updated_at: '2026-10-14T10:00:00Z',
};
const create = {
  slug: post.slug, type: post.type,
  i18n: { ru: post.i18n.ru, en: post.i18n.en, media: { slides: [slide], author_avatar_url: '' } },
  author: post.author, is_published: true,
};
const json = (body, status = 200, etag) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json', ...(etag ? { ETag: etag } : {}) },
});
let calls = [];
function mock(handler) {
  calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    return handler(url, options);
  };
}
async function rejectsArticle(action, status, kind) {
  await assert.rejects(action, (error) => error instanceof ArticleApiError && error.status === status && error.kind === kind);
}

assert.equal(ArticleSlideSchema.safeParse(slide).success, true);
const cdnSlide = { ...slide, url: 'https://cdn.example/illustrations/existing.webp', source: 'cdn' };
assert.equal(ArticleSlideSchema.safeParse(cdnSlide).success, true);
assert.equal(ArticleSlideSchema.safeParse({ ...cdnSlide, source: 'external' }).success, false);
assert.equal(PostCreateSchema.safeParse(create).success, true);
assert.equal(PostSchema.safeParse({ ...create, type: 'guide', gem_slugs: [], tags: [] }).success, true);
assert.equal(PostCreateSchema.safeParse({ ...create, i18n: { ...create.i18n, en: { ...create.i18n.en, content: '' } } }).success, false);
assert.equal(PostCreateSchema.safeParse({ ...create, i18n: { ...create.i18n, media: { slides: [] } } }).success, false);
assert.equal(PostCreateSchema.safeParse({ ...create, i18n: { ...create.i18n, media: { schema_version: 2, slides: [slide] } } }).success, false);
assert.equal(PostUpdateSchema.safeParse({ i18n: { en: { title: 'New' } } }).success, true);
assert.equal(PostUpdateSchema.safeParse({ i18n: { media: { schema_version: 2 } } }).success, false);
assert.equal(PostUpdateSchema.safeParse({ cover_image: 'legacy' }).success, false);

const emptyForm = articleFormDefaults();
assert.equal(emptyForm.type, 'guide');
assert.equal(emptyForm.i18n.en.content, '');
assert.equal(PostSchema.safeParse({ ...emptyForm, slug: 'draft-question' }).success, true, 'a draft can have incomplete text');
const filledDraft = {
  ...emptyForm,
  slug: 'draft-question', author: 'Редактор', tags: ['оптика'], gem_slugs: ['quartz'],
  i18n: {
    ...emptyForm.i18n,
    ru: { title: 'Вопрос?', excerpt: 'Лид', content: '## Ответ' },
    en: { title: '', excerpt: '', content: '**Draft**' },
  },
};
mock(() => json({ ...post, ...filledDraft, i18n: { ...filledDraft.i18n, media: { ...filledDraft.i18n.media, schema_version: 2 } } }, 201, '"draft"'));
await api.createPost(filledDraft, 'secret-key');
assert.deepEqual(JSON.parse(calls[0].options.body), filledDraft, 'draft POST must preserve filled fields and metadata');
mock(() => json({ error: 'slug_already_exists', message: 'Slug already exists' }, 409));
await assert.rejects(() => api.createPost(filledDraft, 'secret-key'), (error) => {
  assert.equal(error.code, 'slug_already_exists');
  assert.equal(error.kind, 'conflict');
  return true;
});
const editForm = articleFormFromPost({ ...post, i18n: { ...post.i18n, en: { title: '', excerpt: '', content: '' } } });
assert.equal(editForm.i18n.en.title, '', 'RU text must never fill EN');
assert.equal(editForm.i18n.ru.title, post.i18n.ru.title);
assert.deepEqual(editForm.i18n.media.slides[0].caption, slide.caption);
assert.deepEqual(editForm.i18n.media.slides[0].alt, slide.alt);
const cdnPost = { ...post, i18n: { ...post.i18n, media: { ...post.i18n.media, slides: [cdnSlide] } } };
assert.equal(articleFormFromPost(cdnPost).i18n.media.slides[0].source, 'cdn');
assert.equal(PostCreateSchema.safeParse({ ...create, i18n: { ...create.i18n, media: { slides: [cdnSlide] } } }).success, true);
assert.equal(PostSchema.safeParse({ ...emptyForm, is_published: true }).success, false);
const enPatchForm = articleFormFromPost(post);
enPatchForm.i18n.en.title = 'Updated EN';
assert.deepEqual(articleUpdatePatch(post, enPatchForm), { i18n: { en: { title: 'Updated EN' } } });
assert.equal(articleFormFromPost(post).i18n.media.slides[0].url, slide.url, 'historical slide URL must survive reopening');
assert.equal(articleUpdatePatch(post, enPatchForm).i18n?.media, undefined, 'saving other fields must leave historical media untouched');
const historicalPost = { ...post, i18n: { ...post.i18n, media: { ...post.i18n.media, slides: [{ ...slide, url: historicalURL }], author_avatar_url: historicalURL } } };
const historicalForm = articleFormFromPost(historicalPost);
assert.equal(PostSchema.safeParse(historicalForm).success, true, 'historical CDN links must pass form validation');
historicalForm.i18n.ru.title = 'Новый заголовок';
assert.deepEqual(articleUpdatePatch(historicalPost, historicalForm), { i18n: { ru: { title: 'Новый заголовок' } } });
historicalForm.i18n.media.slides[0].caption.ru = 'Другая подпись';
const historicalPatch = articleUpdatePatch(historicalPost, historicalForm);
assert.equal(historicalPatch.i18n.media.slides[0].url, historicalURL, 'editing a caption must preserve the old URL');
assert.equal(PostUpdateSchema.safeParse(historicalPatch).success, true, 'historical URL must pass update payload validation');
mock(() => json({ ...historicalPost, i18n: { ...historicalPost.i18n, ru: { ...historicalPost.i18n.ru, title: historicalForm.i18n.ru.title }, media: { ...historicalPost.i18n.media, slides: historicalPatch.i18n.media.slides } } }, 200, '"historical"'));
await api.updatePost('question', historicalPatch, 'secret-key', '"rev"');
assert.equal(JSON.parse(calls[0].options.body).i18n.media.slides[0].url, historicalURL, 'old URL must reach API without rewriting');
const deletedAvatar = articleFormFromPost(historicalPost);
deletedAvatar.i18n.media.author_avatar_url = '';
assert.deepEqual(articleUpdatePatch(historicalPost, deletedAvatar), { i18n: { media: { author_avatar_url: '' } } }, 'removing old avatar must not depend on its CDN');
process.env.NEXT_PUBLIC_MEDIA_BASE_URL = 'https://lithoteka-cdn.storage.yandexcloud.net';
const imageForm = articleFormFromPost(post);
imageForm.i18n.media.slides[0].url = articleCdnUrl('articles/quartz/images/content/quartz-01.webp');
imageForm.i18n.media.author_avatar_url = articleCdnUrl('common_images/authors/editor.webp');
const imagePatch = articleUpdatePatch(post, imageForm);
assert.equal(imagePatch.i18n.media.slides[0].url, 'https://lithoteka-cdn.storage.yandexcloud.net/articles/quartz/images/content/quartz-01.webp');
assert.equal(imagePatch.i18n.media.author_avatar_url, 'https://lithoteka-cdn.storage.yandexcloud.net/common_images/authors/editor.webp');
mock(() => json({ ...post, i18n: { ...post.i18n, media: { ...post.i18n.media, ...imagePatch.i18n.media } } }, 200, '"images"'));
await api.updatePost('question', imagePatch, 'secret-key', '"rev"');
assert.equal(JSON.parse(calls[0].options.body).i18n.media.slides[0].url, imagePatch.i18n.media.slides[0].url, 'article content image must be sent as absolute URL');
if (originalMediaBase === undefined) delete process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
else process.env.NEXT_PUBLIC_MEDIA_BASE_URL = originalMediaBase;
const renamedForm = articleFormFromPost(post);
renamedForm.slug = 'new-question';
renamedForm.i18n.media.slides = renamedForm.i18n.media.slides.map((item) => ({ ...item, source: 'cdn' }));
assert.deepEqual(articleUpdatePatch(post, renamedForm), { slug: 'new-question', i18n: { media: { slides: renamedForm.i18n.media.slides } } });
const reorderedPost = { ...post, i18n: { ...post.i18n, media: { ...post.i18n.media, slides: [slide, { ...slide, id: '71ac5e2c-943d-4b5c-b942-a80deee45a23', caption: { ru: 'Второй', en: 'Second' } }] } } };
const reorderedForm = articleFormFromPost(reorderedPost);
reorderedForm.i18n.media.slides.reverse();
const reorderPatch = articleUpdatePatch(reorderedPost, reorderedForm);
assert.equal(reorderPatch.i18n.media.slides[0].caption.en, 'Second');
assert.equal(reorderPatch.i18n.media.slides[1].alt.ru, 'Фото');

mock(() => json({ data: [post], total: 1 }));
const list = await api.getPosts('secret-key', { page: 1, limit: 10 });
assert.equal(list[0].i18n.media.slides[0].caption.en, 'Caption');
assert.equal(calls[0].options.headers['X-API-Key'], 'secret-key');
assert.equal(calls[0].url.includes('secret-key'), false);

mock(() => json(post, 200, '"rev-1"'));
const detail = await api.getPost('question', 'secret-key');
assert.equal(detail.post.is_published, true);
assert.equal(detail.etag, '"rev-1"');
assert.equal(calls[0].options.headers['X-API-Key'], 'secret-key');

mock(() => json({ ...post, is_published: false, published_at: undefined, i18n: { ...post.i18n, en: {} } }, 200, '"draft-rev"'));
const draft = await api.getPost('question', 'secret-key');
assert.equal(draft.post.is_published, false);
assert.equal(draft.etag, '"draft-rev"');

mock(() => json(post, 201, '"created"'));
const created = await api.createPost(create, 'secret-key');
assert.equal(created.etag, '"created"');
assert.equal(JSON.parse(calls[0].options.body).i18n.media.schema_version, undefined);

mock(() => json({ ...post, i18n: { ...post.i18n, en: { ...post.i18n.en, title: 'Updated' } } }, 200, '"rev-2"'));
const updated = await api.updatePost('question', { i18n: { en: { title: 'Updated' } } }, 'secret-key', detail.etag);
assert.equal(calls[0].options.headers['If-Match'], '"rev-1"');
assert.equal(updated.etag, '"rev-2"');
assert.equal(updated.post.i18n.en.title, 'Updated');

mock(() => new Response(null, { status: 204 }));
await api.deletePost('question', 'secret-key', updated.etag);
assert.equal(calls[0].options.headers['If-Match'], '"rev-2"');

mock(() => json({ error: 'precondition_failed', message: 'ETag is stale', code: 412 }, 412));
await rejectsArticle(() => api.updatePost('question', { author: 'New' }, 'secret-key', '"old"'), 412, 'stale');
assert.equal(calls.length, 1, 'stale PUT must not be retried');

mock(() => json(post));
const noTag = await api.getPost('question', 'secret-key');
assert.equal(noTag.etag, null);
await rejectsArticle(() => api.updatePost('question', { author: 'New' }, 'secret-key', noTag.etag), 428, 'precondition');
await rejectsArticle(() => api.deletePost('question', 'secret-key', noTag.etag), 428, 'precondition');
assert.equal(calls.length, 1, 'missing ETag must prevent both writes');

mock(() => json({ error: 'validation_error', message: 'validation failed', fields: [{ path: 'i18n.en.content', message: 'required' }] }, 400));
await assert.rejects(() => api.updatePost('question', { author: 'New' }, 'secret-key', '"rev"'), (error) => {
  assert.equal(error.kind, 'validation');
  assert.deepEqual(error.fields, [{ path: 'i18n.en.content', message: 'required' }]);
  return true;
});
for (const [status, kind, code] of [[401, 'authorization', 'unauthorized'], [403, 'authorization', 'forbidden'], [409, 'conflict', 'unsupported_article_format'], [503, 'unavailable', 'media_verification_unavailable']]) {
  mock(() => json({ error: code, message: code }, status));
  await rejectsArticle(() => api.getPost('question', 'secret-key'), status, kind);
}

mock(() => { throw new Error('old form must not reach API'); });
await rejectsArticle(() => api.createPost({ ...create, cover_image: 'legacy' }, 'secret-key'), 400, 'validation');
assert.equal(calls.length, 0);

const file = new File([new Uint8Array([1, 2, 3])], 'photo.png', { type: 'image/png' });
mock(() => json({ url: slide.url }, 201));
assert.deepEqual(await api.uploadArticleSlide(file, 'secret-key', 'question', slide.id), { url: slide.url });
assert.equal(calls[0].options.body.get('kind'), 'article_slide');
assert.equal(calls[0].options.body.get('slug'), 'question');
assert.equal(calls[0].options.body.get('slide_id'), slide.id);
assert.equal(calls[0].options.headers['X-API-Key'], 'secret-key');
assert.equal(calls[0].options.headers['Content-Type'], undefined);

mock(() => json({ url: 'https://cdn.example/avatar.webp' }, 201));
await api.uploadAuthorAvatar(file, 'secret-key', 'question');
assert.equal(calls[0].options.body.get('kind'), 'author_avatar');
assert.equal(calls[0].options.body.get('slug'), 'question');
assert.equal(calls[0].options.body.has('slide_id'), false);

mock(() => json({ error: 'invalid_image_dimensions', message: 'converted image dimensions differ from input' }, 400));
await assert.rejects(() => api.uploadArticleSlide(file, 'secret-key', 'question', slide.id), (error) => {
  assert.equal(error.code, 'invalid_image_dimensions');
  assert.equal(error.kind, 'validation');
  return true;
});

mock(() => json({ url: 'https://cdn.example/entities/bruneau_jasper/images/gallery/bruneau_jasper01.webp' }, 201));
await api.uploadMedia(file, 'secret-key', { kind: 'gallery', slug: 'bruneau-jasper', storageKey: 'bruneau_jasper' });
assert.equal(calls[0].options.body.get('slug'), 'bruneau-jasper');
assert.equal(calls[0].options.body.get('storage_key'), 'bruneau_jasper');
assert.equal(calls[0].options.body.get('kind'), 'gallery');

mock(() => json({ url: 'https://cdn.example/articles/question/images/cover/01.webp', index: 1 }, 201));
assert.equal((await api.uploadMedia(file, 'secret-key', { kind: 'cover', slug: 'question' })).index, 1);
assert.equal(calls[0].options.body.has('lang'), false);
mock(() => json({ url: 'https://cdn.example/articles/question/images/cover/ru/02.webp', index: 2 }, 201));
await api.uploadMedia(file, 'secret-key', { kind: 'cover', slug: 'question', lang: 'ru' });
assert.equal(calls[0].options.body.get('lang'), 'ru');

mock(() => json({ slug: 'question', lang: '', frames: [
  { index: 100, url: 'https://cdn.example/articles/question/images/cover/100.webp' },
  { index: 2, url: 'https://cdn.example/articles/question/images/cover/02.webp' },
] }));
assert.deepEqual((await api.getCoverFrames('question')).map((frame) => frame.index), [2, 100]);
assert.equal(calls[0].url, '/backend/api/v1/posts/question/cover-frames');
mock(() => json({ slug: 'question', lang: 'ru', frames: [] }));
assert.deepEqual(await api.getCoverFrames('question', 'ru'), []);
assert.equal(calls[0].url, '/backend/api/v1/posts/question/cover-frames?lang=ru');

const sequences = { default: ['https://lithoteka-cdn.storage.yandexcloud.net/common_images/quartz.webp'], ru: [], en: [] };
const historicalSequences = { default: [historicalURL, sequences.default[0]], ru: [historicalURL], en: [] };
assert.equal(articleUrlForSave(historicalSequences.default[0], historicalSequences.default[0]), historicalURL, 'old cover frame must remain valid');
assert.deepEqual(removeCoverFrame(historicalSequences, 'default', 0).default, [sequences.default[0]], 'removing an old frame removes only its reference');
assert.deepEqual(moveCoverFrame(historicalSequences, 'default', 0, 1).default, [sequences.default[0], historicalURL], 'old frame can be reordered');
assert.deepEqual(removeCoverFrame(historicalSequences, 'ru', 0).ru, [], 'localized old frame can be removed');
process.env.NEXT_PUBLIC_MEDIA_BASE_URL = 'https://lithoteka-cdn.storage.yandexcloud.net';
const relativeFrame = articleCdnUrl('articles/quartz/images/cover/01.webp');
const localized = changeCoverSequence(sequences, 'ru', [relativeFrame]);
const localizedBoth = changeCoverSequence(localized, 'en', [articleCdnUrl('common_images/cover-en.webp')]);
assert.deepEqual(localizedBoth, {
  default: sequences.default,
  ru: ['https://lithoteka-cdn.storage.yandexcloud.net/articles/quartz/images/cover/01.webp'],
  en: ['https://lithoteka-cdn.storage.yandexcloud.net/common_images/cover-en.webp'],
});
assert.deepEqual(sequences.ru, [], 'adding RU frame must not change the other sequences');
mock(() => json({ ...post, i18n: { ...post.i18n, media: { ...post.i18n.media, cover_frames: localizedBoth } } }, 200, '"localized"'));
await api.updatePost('question', { i18n: { media: { cover_frames: localizedBoth } } }, 'secret-key', '"rev"');
assert.deepEqual(JSON.parse(calls[0].options.body).i18n.media.cover_frames, localizedBoth, 'relative cover frame must be saved as absolute URL');
if (originalMediaBase === undefined) delete process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
else process.env.NEXT_PUBLIC_MEDIA_BASE_URL = originalMediaBase;
const withSecond = changeCoverSequence(sequences, 'default', [...sequences.default, 'https://lithoteka-cdn.storage.yandexcloud.net/articles/quartz/images/cover/02.webp']);
assert.deepEqual(moveCoverFrame(withSecond, 'default', 1, -1).default, [withSecond.default[1], withSecond.default[0]]);
assert.deepEqual(removeCoverFrame(withSecond, 'default', 0).default, [withSecond.default[1]]);
assert.deepEqual(withSecond.ru, []);
mock(() => json({ slug: 'question', lang: '', frames: [{ index: 1, url: sequences.default[0] }], sequences, managed: true }));
assert.deepEqual(await api.getCoverSequences('question', 'secret-key'), { sequences, managed: true });
assert.equal(calls[0].url, '/backend/api/v1/posts/question/cover-frames?all=1');
assert.equal(calls[0].options.headers['X-API-Key'], 'secret-key');
mock(() => json({ ...post, i18n: { ...post.i18n, media: { ...post.i18n.media, cover_frames: sequences } } }, 200, '"next"'));
await api.updatePost('question', { i18n: { media: { cover_frames: sequences } } }, 'secret-key', '"rev"');
assert.deepEqual(JSON.parse(calls[0].options.body).i18n.media.cover_frames, sequences);
assert.equal(calls[0].options.headers['If-Match'], '"rev"');

console.log('Article V2 Admin API regression: OK');
