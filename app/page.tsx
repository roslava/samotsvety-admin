'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const apiKey = localStorage.getItem('admin_api_key');
    if (apiKey) {
      router.push('/admin/minerals');
    } else {
      router.push('/admin/login');
    }
  }, [router]);

  return null;
}
