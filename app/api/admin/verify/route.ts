import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('X-API-Key')?.trim();
  if (!apiKey) {
    return NextResponse.json({ message: 'Введите API Key' }, { status: 400 });
  }

  const apiUrl = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, '');

  try {
    // The backend protects writes, but has no read-only key verification endpoint.
    // Invalid JSON fails before any write, after the API key middleware runs.
    const response = await fetch(`${apiUrl}/api/v2/gem-entities`, {
      method: 'POST',
      headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' },
      body: '{',
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });

    if (response.status === 400) {
      const result = await response.json().catch(() => null);
      if (result?.error === 'validation_failed' && result?.path === '$' && result?.message?.startsWith('invalid JSON:')) {
        return NextResponse.json({ valid: true });
      }
    }
    if (response.status === 401) {
      return NextResponse.json({ message: 'Неверный API Key' }, { status: 401 });
    }
    return NextResponse.json(
      { message: 'API не смог проверить ключ. Проверьте настройку backend.' },
      { status: 502 },
    );
  } catch {
    return NextResponse.json(
      { message: 'Нет связи с API. Убедитесь, что backend запущен и адрес API указан верно.' },
      { status: 503 },
    );
  }
}
