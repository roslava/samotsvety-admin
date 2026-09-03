'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { GemEntityV2Response } from '@/types/mineral';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const json = (value: unknown) => value == null ? '—' : typeof value === 'string' ? value : JSON.stringify(value);
export default function MineralDetailPage() {
  const { slug } = useParams<{ slug: string }>(); const router = useRouter();
  const [entity, setEntity] = useState<GemEntityV2Response | null>(null); const [error, setError] = useState('');
  useEffect(() => { api.getGemEntity(slug).then(setEntity).catch(e => setError(e instanceof Error ? e.message : 'Не найдено')); }, [slug]);
  if (error) return <div className="p-8">{error}</div>; if (!entity) return <div className="p-8">Загрузка...</div>;
  const s = entity.scientific; const ru = entity.i18n.ru; const en = entity.i18n.en;
  return <main className="p-8 max-w-6xl mx-auto space-y-6"><div className="flex justify-between"><Button variant="ghost" onClick={() => router.back()}>Назад</Button><Link href={`/admin/minerals/${entity.slug}/edit`}><Button>Редактировать</Button></Link></div><h1 className="text-3xl font-bold">{ru.name} / {en.name}</h1><p className="text-muted-foreground">{entity.slug} · {entity.type}</p>
    <Card><CardHeader><CardTitle>Научные свойства</CardTitle></CardHeader><CardContent className="grid md:grid-cols-2 gap-3">{Object.entries(s).map(([key,value]) => <div key={key}><dt className="font-medium">{key}</dt><dd>{json(value)}</dd></div>)}<div><dt>Hardness note RU</dt><dd>{json(ru.scientific_notes?.hardness)}</dd></div><div><dt>Hardness note EN</dt><dd>{json(en.scientific_notes?.hardness)}</dd></div><div><dt>Composition RU</dt><dd>{json(ru.scientific_notes?.composition)}</dd></div><div><dt>Composition EN</dt><dd>{json(en.scientific_notes?.composition)}</dd></div></CardContent></Card>
    <Card><CardHeader><CardTitle>Локализованный контент</CardTitle></CardHeader><CardContent className="grid md:grid-cols-2 gap-6">{[['RU',ru],['EN',en]].map(([label,content]) => <div key={label as string}><h3 className="font-medium">{label as string}</h3><pre className="whitespace-pre-wrap text-sm">{JSON.stringify(content,null,2)}</pre></div>)}</CardContent></Card>
    <Card><CardHeader><CardTitle>Месторождения ({entity.localities?.length ?? 0})</CardTitle></CardHeader><CardContent>{entity.localities?.length ? entity.localities.map((l,i)=><pre key={i} className="mb-3 whitespace-pre-wrap">{JSON.stringify(l,null,2)}</pre>) : <p>localities: []</p>}</CardContent></Card>
    <Card><CardHeader><CardTitle>Изображения</CardTitle></CardHeader><CardContent><pre className="whitespace-pre-wrap">{json(entity.images)}</pre></CardContent></Card>
    <Card><CardHeader><CardTitle>Связи и источники</CardTitle></CardHeader><CardContent><p>related_entities: {json(entity.related_entities ?? [])}</p><pre className="whitespace-pre-wrap">sources: {json(entity.sources ?? [])}</pre></CardContent></Card>
  </main>;
}
