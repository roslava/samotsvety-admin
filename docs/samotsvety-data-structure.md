# Samotsvety: canonical V2 schema

Для V2 API canonical contract — `GemEntityV2ImportSchema`, идентичная `MineralSchema` в `lib/validations/mineral.ts`. Это strict Zod schema: любой неописанный ключ делает JSON невалидным. Markdown — единственный пользовательский формат импорта в админке; JSON используется для передачи данных в API.

Запись имеет обязательные `slug`, `type`, `scientific`, `i18n.ru` и `i18n.en`; в каждом языке нужен `name`. Возможные type: `mineral`, `rock`, `gem_variety`, `organic`.

Научные коды, в том числе `base_color` и `crystal_system`, должны точно соответствовать enum в schema. `base_color` включает `red`, `black`, `bi_color`, `blue`, `brown`, `green`, `yellow`, `grey`, `purple`, `white`, `pink`, `multicolor`, `orange`; `crystal_system` включает `trigonal`.

В `scientific` `chemical_formula` — optional nullable string; `hardness` и `specific_gravity` — optional nullable numeric ranges; только `crystal_habit`, `luster`, `tenacity`, `phenomena` — optional nullable enum arrays. `rarity`, `base_color`, `mineral_class`, `silicate_subclass`, `mineral_family`, `crystal_system`, `streak`, `transparency`, `fracture`, `cleavage_degree`, `cleavage_direction`, `cleavage_type`, `ima_status`, `rock_type` — optional nullable scalar enum. Каждый такой scalar содержит ровно один код или отсутствует/null, никогда не строку с несколькими кодами через запятую.

Твёрдость и состав — локализованные заметки: `i18n.{ru,en}.scientific_notes.hardness` и `i18n.{ru,en}.scientific_notes.composition`. Устаревших `scientific.hardness_note` и `scientific.composition` нет. Для `rock` добавляйте только применимые научные свойства, а `rock_type` используйте только для пород.

Locality содержит обязательный uppercase ISO 3166-1 alpha-2 `country_code` и только поля `country_ru`, `country_en`, `region_ru`, `region_en`, `locality_ru`, `locality_en`, `description_ru`, `description_en`, `latitude`, `longitude`, `coordinate_precision`, `famous`. `is_russian` не поддерживается.

Географические поля необязательны: `latitude` и `longitude` можно опустить или задать как `null` независимо друг от друга. Ненулевые и нулевые числовые значения валидны в диапазонах `latitude: -90..90` и `longitude: -180..180` включительно. `coordinate_precision` также необязателен (`null` или один из `exact`, `approximate`, `region`). Координаты добавляют только из надёжного источника; нельзя выдумывать точные координаты или маркировать как `exact` приблизительную, региональную либо неизвестную привязку. При отсутствии подтверждённых координат все три geo-поля следует опустить или указать `null`.

Изображения: `images.storage_key`, `hero.path`, `thumbnail.path`, `gallery[].path`, `gallery[].type`, `gallery[].caption.{ru,en}`. Пути относительные, например `hero.webp` и `gallery/example00.webp`; URL и ключи `main_image_url`, `thumbnail_url`, `gallery[].url` запрещены.

Используйте `related_entities` как массив slug. `sources` состоит из `title`, `url`, `author`, `publisher`; у каждого элемента есть хотя бы `title` или `url`. `related_minerals` не поддерживается.
