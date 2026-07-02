'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';

export default function LoginPage() {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      toast.error('Введите API Key');
      return;
    }

    setIsLoading(true);
    
    localStorage.setItem('admin_api_key', apiKey);
    
    toast.success('Успешный вход!');
    router.push('/admin/minerals');
    setIsLoading(false);
  };

  return (
    <>
      {/* Header with Register Link */}
      <div className="flex justify-end pt-6 px-8">
        <Link href="/admin/auth/register">
          <Button variant="outline" className="border-slate-700 text-slate-300 hover:text-slate-100">
            Регистрация
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Samotsvety</CardTitle>
            <CardDescription className="text-lg">
              Админ-панель
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">ADMIN API KEY</label>
                <Input
                  type="password"
                  placeholder="Введите ваш API Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? 'Вход...' : 'Войти'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="py-6 px-4 text-center border-t border-slate-800">
        <p className="text-sm text-slate-500">© 2026 artnen gems. Все права защищены.</p>
      </div>
    </>
  );
}
