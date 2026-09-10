# Samotsvety Mineral Markdown v1

`Samotsvety Markdown v1` — строгий, удобный для человека interchange/snapshot-формат для заполнения формы минерала в админке. Это **не API contract** и не новая модель данных: документ детерминированно преобразуется в canonical V2 object, после чего проходит `GemEntityV2ImportSchema` (`MineralSchema`). БД и существующее API остаются source of truth.

Импорт заполняет только текущую React-форму. Он не сохраняет запись и не делает silent overwrite: перед сохранением пользователь должен осознанно проверить и отправить форму. Поэтому старый `.md` нельзя бездумно использовать как замену более свежей записи БД.

## Версия и строгий разбор

Первой строкой документа должен быть ровно следующий marker:

```md
<!-- samotsvety-mineral-md:v1 -->
```

За ним идёт единственный заголовок `# <человеческое название>`. Он нужен для чтения и не является отдельным canonical-полем. Допускаются только перечисленные ниже разделы и поля; неизвестный раздел, `###`-ключ или колонка таблицы — ошибка с номером строки. Парсер специально не является Markdown-парсером общего назначения и не пытается угадывать смысл произвольного Markdown.

Пустая ячейка/блок означает, что поле не передаётся. Для optional nullable полей это семантически эквивалентно отсутствию значения при импорте; не используется отдельный текстовый маркер `null`. Пустой `## Связанные сущности` последовательно превращается в `related_entities: []`. В значениях таблиц `\|` означает literal `|`, а `\n` — перенос строки.

## Canonical template

Единственный canonical template находится в `lib/mineral-markdown.ts` как `MINERAL_MARKDOWN_TEMPLATE`. Он строится serializer-ом из полноценного валидного примера Kambaba Jasper, выводится во вкладке импорта и **вставляется в AI prompt тем же значением**. Не поддерживайте вручную вторую копию шаблона в документации.

Template показывает все допустимые `##` sections, `###` fields и таблицы в точном порядке. Четыре раздела обязательны: `Основное`, `Научные данные`, `Русский`, `English`; `Месторождения`, `Изображения`, `Связанные сущности` и `Источники` optional. `## English` использует те же canonical names после `###`: `name`, `synonyms`, `color`, `color_description`, `lore`, `identification_tips`, `safety_notes`, `scientific_notes.hardness`, `scientific_notes.composition`, `esoteric.metaphysical_properties`, `esoteric.chakras`, `esoteric.zodiac`, `esoteric.healing_interpretation`, `esoteric.energy_notes`, `esoteric.ritual_uses`. `name` для RU и EN обязателен на уровне `MineralSchema`.

Запятые разделяют только реально массивные поля: scientific-строки `crystal_habit`, `luster`, `tenacity`, `phenomena` и `###`-поля `synonyms`, `color`, `esoteric.metaphysical_properties`, `esoteric.chakras`, `esoteric.zodiac`. Остальные локализованные значения могут быть многострочными. Пустые optional ячейки и `###` blocks не передаются в результат; текстовый маркер `null` не используется.

### Типы scientific полей

| Тип | Поля |
|---|---|
| scalar string, nullable/optional | `chemical_formula` |
| numeric range, nullable/optional | `hardness` (`hardness_min`/`hardness_max`, 1–10), `specific_gravity` (`specific_gravity_min`/`specific_gravity_max`, положительные числа) |
| scalar enum, nullable/optional | `rarity`, `base_color`, `mineral_class`, `silicate_subclass`, `mineral_family`, `crystal_system`, `streak`, `transparency`, `fracture`, `cleavage_degree`, `cleavage_direction`, `cleavage_type`, `ima_status`, `rock_type` |
| enum array, nullable/optional | `crystal_habit`, `luster`, `tenacity`, `phenomena` |

Для каждого scientific scalar enum действует строгое правило: **ровно одно enum-значение или пусто; несколько значений через запятую запрещены**. Например, `transparency: translucent, opaque` и `fracture: conchoidal, uneven` не являются списками: parser сохраняет эти строки без преобразования, а canonical V2 validation должна явно отклонить документ. Parser не выбирает первое значение и не нормализует невалидный scalar enum.

## Canonical mapping и validation

| Markdown | Canonical V2 |
|---|---|
| `slug`, `type` из «Основное» | `slug`, `type` |
| scientific rows | `scientific.*`; пары `*_min`/`*_max` становятся ranges |
| RU/English blocks | `i18n.ru.*`, `i18n.en.*` |
| «Месторождения» | `localities[]` |
| image blocks/gallery | `images.storage_key`, `images.hero.path`, `images.thumbnail.path`, `images.gallery[]` |
| list of slugs | `related_entities[]` |
| sources table | `sources[]` |

Табличные заголовки должны совпадать точно. `country_code` в locality обязателен; `latitude` и `longitude` — реальные числа либо пустые (включая корректный `0`); `famous` допускает только `true`, `false` или пусто; `coordinate_precision` — `exact`, `approximate`, `region` или пусто. `sources.url` — обычный URL, Markdown-ссылки не преобразуются. Image paths должны быть относительными путями, например `hero.webp` или `gallery/example.webp`, а не URL.

Парсер отвечает только за v1-структуру и преобразование строк, списков, чисел и boolean. Canonical `GemEntityV2ImportSchema` остаётся последним арбитром для enum values, slug, ranges, URL, ISO country code, границ координат и strict V2 schema. Не добавляйте legacy-поля: Markdown никогда не создаёт их автоматически.
