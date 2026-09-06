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

## Полный формат

```md
<!-- samotsvety-mineral-md:v1 -->

# Камбаба яшма

## Основное
| Поле | Значение |
|---|---|
| slug | kambaba-jasper |
| type | rock |

## Научные данные
| Поле | Значение |
|---|---|
| chemical_formula | |
| hardness_min | 6 |
| hardness_max | 7 |
| specific_gravity_min | 2.6 |
| specific_gravity_max | 2.8 |
| rarity | uncommon |
| base_color | green |
| mineral_class | |
| silicate_subclass | |
| mineral_family | |
| crystal_system | trigonal |
| crystal_habit | massive, granular |
| streak | |
| transparency | opaque |
| luster | vitreous, waxy |
| tenacity | brittle |
| fracture | conchoidal |
| cleavage_degree | none |
| cleavage_direction | 1 |
| cleavage_type | |
| phenomena | iridescence, chatoyancy |
| ima_status | |
| rock_type | igneous |

## Русский
### name
Камбаба яшма

### synonyms
Камбаба, крокодиловая яшма

### color
зелёный, чёрный

### color_description
Текст может занимать
несколько строк.

### scientific_notes.hardness
6–7 по шкале Мооса.

### scientific_notes.composition
Риолитовая вулканическая порода.

### esoteric.metaphysical_properties
спокойствие, заземление

### esoteric.chakras
сердечная

### esoteric.zodiac
Рак

### esoteric.healing_interpretation
Текст интерпретации.

### esoteric.energy_notes
Текст заметки.

### esoteric.ritual_uses
Текст применения.

## English
### name
Kambaba Jasper

### color_description
Multiline text is preserved.

## Месторождения
| country_code | country_ru | country_en | region_ru | region_en | locality_ru | locality_en | description_ru | description_en | latitude | longitude | coordinate_precision | famous |
|---|---|---|---|---|---|---|---|---|---:|---:|---|---|
| MG | Мадагаскар | Madagascar | | | | | | | -16.4 | 46.5 | approximate | true |

## Изображения
### storage_key
kambaba_jasper

### hero
hero.webp

### thumbnail
thumbnail.webp

### gallery
| path | type | caption_ru | caption_en |
|---|---|---|---|
| gallery/kambaba_jasper00.webp | specimen | Образец | Specimen |

## Связанные сущности
- rhyolite
- jasper
- ocean-jasper

## Источники
| title | url | author | publisher |
|---|---|---|---|
| Mindat: Kambaba Jasper | https://www.mindat.org/ | | Mindat |
```

`## English` использует те же canonical names после `###`: `name`, `synonyms`, `color`, `color_description`, `lore`, `identification_tips`, `safety_notes`, `scientific_notes.hardness`, `scientific_notes.composition` и `esoteric.*`. `name` для RU и EN обязателен уже на уровне `MineralSchema`. Списки `synonyms`, `color`, `esoteric.metaphysical_properties`, `esoteric.chakras`, `esoteric.zodiac` разделяются запятыми с trim. Остальные локализованные значения могут быть многострочными.

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
