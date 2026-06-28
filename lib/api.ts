const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const getHeaders = (apiKey?: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }

  return headers;
};

export const api = {
  // Public endpoints
  async getMinerals(params: { 
    lang?: 'ru' | 'en'; 
    view?: 'normal' | 'esoteric';
    limit?: number;
    page?: number;
    rarity?: string;
    russian_only?: boolean;
  } = {}) {
    const query = new URLSearchParams();
    if (params.lang) query.append('lang', params.lang);
    if (params.view) query.append('view', params.view);
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.page) query.append('page', params.page.toString());
    if (params.rarity) query.append('rarity', params.rarity);
    if (params.russian_only) query.append('russian_only', 'true');

    const res = await fetch(`${API_BASE}/api/v1/minerals?${query}`);
    if (!res.ok) throw new Error('Failed to fetch minerals');
    
    const result = await res.json();
    return Array.isArray(result) ? result : (result.data || []);
  },

  async getMineral(slug: string, lang: 'ru' | 'en' = 'ru', view: 'normal' | 'esoteric' = 'normal') {
    const res = await fetch(`${API_BASE}/api/v1/minerals/${slug}?lang=${lang}&view=${view}`);
    if (!res.ok) throw new Error('Mineral not found');
    return res.json();
  },

  // Admin endpoints (require API Key)
  async createMineral(data: Record<string, unknown>, apiKey: string) {
    const res = await fetch(`${API_BASE}/api/v1/minerals`, {
      method: 'POST',
      headers: getHeaders(apiKey),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create mineral');
    return res.json();
  },

  async updateMineral(slug: string, data: Record<string, unknown>, apiKey: string) {
    const res = await fetch(`${API_BASE}/api/v1/minerals/${slug}`, {
      method: 'PUT',
      headers: getHeaders(apiKey),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update mineral');
    return res.json();
  },

  async deleteMineral(slug: string, apiKey: string) {
    const res = await fetch(`${API_BASE}/api/v1/minerals/${slug}`, {
      method: 'DELETE',
      headers: getHeaders(apiKey),
    });
    if (!res.ok) throw new Error('Failed to delete mineral');
    return res.ok;
  },

  async searchMinerals(query: string, lang: 'ru' | 'en' = 'ru') {
    const res = await fetch(`${API_BASE}/api/v1/search?q=${encodeURIComponent(query)}&lang=${lang}`);
    if (!res.ok) throw new Error('Search failed');
    return res.json();
  },
};