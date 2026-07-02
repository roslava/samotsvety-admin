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

  const handleUseDemoKey = () => {
    setApiKey('super-secret-admin-key-change-me');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 to-slate-900 p-4">
      {/* Header with Register Link */}
      <div className="flex justify-end pt-6 px-8">
        <Link href="/admin/register">
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

      {/* Demo Credentials Footer */}
      <div className="flex flex-col items-center justify-center pb-8 pt-4 px-4 border-t border-slate-800 mt-8">
        <p className="text-sm text-slate-400 mb-3">Тестовые учётные данные:</p>
        <div className="bg-slate-900 rounded-lg p-4 mb-4 max-w-md w-full">
          <code className="text-xs text-slate-200 break-all">super-secret-admin-key-change-me</code>
        </div>
        <Button 
          variant="secondary" 
          size="sm"
          onClick={handleUseDemoKey}
          className="text-slate-300"
        >
          Использовать тестовый ключ
        </Button>
      </div>
    </div>
  );
}
