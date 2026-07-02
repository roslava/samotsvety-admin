'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Mineral } from '@/types/mineral';
import MineralForm from '../../components/MineralForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { type MineralFormData } from '@/lib/validations/mineral';

export default function EditMineralPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [mineral, setMineral] = useState<Mineral | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMineral = async () => {
      try {
        const data = await api.getMineral(slug);
        setMineral(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadMineral();
  }, [slug]);

  if (loading) return <div className="p-8 text-center">Загрузка минерала...</div>;
  if (!mineral) return <div className="p-8 text-center">Минерал не найден</div>;

  // Convert Mineral to MineralFormData
  const formData: MineralFormData = {
    slug: mineral.slug,
    type: mineral.type as any,
    scientific: mineral.scientific,
    i18n: mineral.i18n,
    localities: mineral.localities,
    main_image_url: mineral.main_image_url,
    thumbnail_url: mineral.thumbnail_url || '',
    gallery: mineral.gallery || [],
    safety_notes: mineral.safety_notes || '',
    related_minerals: mineral.related_minerals || [],
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Button variant="ghost" onClick={() => router.back()} className="mb-8">
        <ArrowLeft className="mr-2 h-5 w-5" />
        Назад
      </Button>

      <h1 className="text-4xl font-bold mb-8">Редактировать минерал: {mineral.i18n.ru.name}</h1>

      {!loading && mineral && (
        <MineralForm 
          defaultValues={formData} 
          isEdit={true}
          slug={slug}
        />
      )}
    </div>
  );
}
