'use client';

import { UseFormReturn } from 'react-hook-form';
import { MineralFormData } from '@/lib/validations/mineral';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useState } from 'react';
import { Copy } from 'lucide-react';

interface ImportJsonSectionProps {
  form: UseFormReturn<MineralFormData>;
}

const JSON_TEMPLATE = `{
  "slug": "malachite",
  "scientific": {
    "chemical_formula": "Cu₂CO₃(OH)₂",
    "mineral_group": "карбонаты",
    "crystal_system": "моноклинная",
    "crystal_habit": "призматический, волокнистый, почковидный, радиально-лучистый",
    "hardness": { "min": 3.5, "max": 4.0, "note": "по шкале Мооса" },
    "specific_gravity": { "min": 3.6, "max": 4.05 },
    "streak": "зелёная",
    "luster": "стеклянный, шелковистый, матовый",
    "transparency": "непрозрачный",
    "cleavage": "совершенная по одному направлению",
    "fracture": "неровный, раковистый",
    "rarity": "common",
    "ima_status": "approved",
    "identification_tips": "Отличительные признаки от похожих минералов..."
  },
  "i18n": {
    "ru": {
      "name": "Малахит",
      "synonyms": ["медная зелень", "малахитовая руда"],
      "color": ["ярко-зелёный", "тёмно-зелёный", "изумрудно-зелёный"],
      "color_description": "Характерный насыщенный зелёный цвет с полосчатым и концентрическим рисунком",
      "lore": "История добычи на Урале, использование в камнерезном искусстве, легенды и культурное значение...",
      "esoteric": {
        "metaphysical_properties": ["защита", "эмоциональное исцеление", "гармония"],
        "chakras": ["сердечная чакра (Анахата)"],
        "zodiac": ["Телец", "Весы", "Козерог"],
        "healing_interpretation": "В эзотерической традиции малахит считается мощным камнем эмоционального очищения...",
        "energy_notes": "Многие практики отмечают, что камень помогает трансформировать тяжёлые эмоции...",
        "ritual_uses": "Используется в медитациях на сердечную чакру..."
      }
    },
    "en": {
      "name": "Malachite",
      "synonyms": ["copper green"],
      "color": ["bright green", "dark green", "emerald green"],
      "color_description": "Characteristic rich green color with banded patterns",
      "lore": "History of mining in the Urals...",
      "esoteric": { ... }
    }
  },
  "localities": [
    {
      "country": "Россия",
      "region": "Свердловская область",
      "locality": "Меднорудянское месторождение (Нижний Тагил)",
      "is_russian": true,
      "famous": true,
      "description_ru": "Классическое уральское месторождение...",
      "description_en": "Classic Ural malachite deposit..."
    }
  ],
  "main_image_url": "https://storage.yandexcloud.net/samotsvety-cdn/malachite/hero.webp",
  "thumbnail_url": "https://storage.yandexcloud.net/samotsvety-cdn/malachite/thumbnail.webp",
  "gallery": [],
  "safety_notes": "Содержит медь...",
  "related_minerals": ["azurite", "chrysocolla"]
}`;

const PROMPT_TEMPLATE = `Ты — эксперт-минералог и геммолог высшего уровня.

Собери **полную, точную и детализированную информацию** по минералу «[НАЗВАНИЕ_МИНЕРАЛА]» согласно структуре проекта Samotsvety.

**Обязательные правила:**
- Научные данные — максимально точные и фактологические.
- Особенно подробно опиши российские (уральские и сибирские) месторождения.
- Lore — увлекательный историко-культурный текст.
- Эзотерика — мягкая формулировка («в традиции считается», «многие практики отмечают»).
- Изображения уже загружены в Yandex Cloud (samotsvety-cdn):
  - hero.webp, thumbnail.webp
  - gallery/specimen-01.webp, gallery/polished-01.webp и т.д.

Верни **только валидный JSON** без дополнительного текста.`;

export function ImportJsonSection({ form }: ImportJsonSectionProps) {
  const [jsonInput, setJsonInput] = useState('');
  const [activeTab, setActiveTab] = useState<'import' | 'template'>('import');

  const handleImport = () => {
    try {
      const parsed = JSON.parse(jsonInput.trim());
      form.reset(parsed as MineralFormData);
      toast.success('Форма полностью обновлена из JSON');
      setJsonInput('');
    } catch (error) {
      toast.error('Ошибка парсинга JSON');
    }
  };

  const copyTemplate = () => {
    navigator.clipboard.writeText(JSON_TEMPLATE);
    toast.success('Шаблон JSON скопирован');
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(PROMPT_TEMPLATE);
    toast.success('Промпт скопирован');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Импорт / Шаблон JSON</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="mb-4">
            <TabsTrigger value="import">Импорт JSON</TabsTrigger>
            <TabsTrigger value="template">Шаблон + Промпт</TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-4">
            <Textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='Вставьте сюда полный JSON минерала...'
              className="min-h-[420px] font-mono text-sm"
            />
            <Button onClick={handleImport} className="w-full" size="lg">
              Импортировать в форму
            </Button>
          </TabsContent>

          <TabsContent value="template" className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Шаблон JSON</h4>
                <Button variant="outline" size="sm" onClick={copyTemplate}>
                  <Copy className="h-4 w-4 mr-2" /> Скопировать
                </Button>
              </div>
              <pre className="bg-slate-950 p-4 rounded-md text-xs overflow-auto max-h-[350px]">{JSON_TEMPLATE}</pre>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Промпт для нейросети</h4>
                <Button variant="outline" size="sm" onClick={copyPrompt}>
                  <Copy className="h-4 w-4 mr-2" /> Скопировать промпт
                </Button>
              </div>
              <pre className="bg-slate-950 p-4 rounded-md text-xs overflow-auto whitespace-pre-wrap">
                {PROMPT_TEMPLATE}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}