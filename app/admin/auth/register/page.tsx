'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      toast.error('Введите email');
      return;
    }

    if (!formData.password.trim()) {
      toast.error('Введите пароль');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      toast.error('Пароли не совпадают');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Пароль должен быть не менее 6 символов');
      return;
    }

    setIsLoading(true);
    
    try {
      // TODO: Отправить запрос на бэкенд для регистрации
      // const response = await api.register(formData.email, formData.password);
      
      toast.success('Регистрация успешна! Переходим на вход...');
      setTimeout(() => {
        router.push('/admin/auth/login');
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Header with Login Link */}
      <div className="flex justify-end pt-6 px-8">
        <Link href="/admin/auth/login">
          <Button variant="outline" className="border-slate-700 text-slate-300 hover:text-slate-100">
            Вход
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Samotsvety</CardTitle>
            <CardDescription className="text-lg">
              Регистрация администратора
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  name="email"
                  placeholder="admin@samotsvety.ru"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Пароль</label>
                <Input
                  type="password"
                  name="password"
                  placeholder="Минимум 6 символов"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Подтвердите пароль</label>
                <Input
                  type="password"
                  name="passwordConfirm"
                  placeholder="Повторите пароль"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
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
