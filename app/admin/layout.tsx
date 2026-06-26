'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Gem, 
  List, 
  PlusCircle, 
  LogOut, 
  Home 
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const key = localStorage.getItem('admin_api_key');
    if (!key && pathname !== '/admin/login') {
      router.push('/admin/login');
    } else {
      setApiKey(key);
    }
  }, [router, pathname]);

  const handleLogout = () => {
    localStorage.removeItem('admin_api_key');
    router.push('/admin/login');
  };

  const navItems = [
    { href: '/admin/minerals', label: 'Все минералы', icon: List },
    { href: '/admin/minerals/new', label: 'Добавить новый', icon: PlusCircle },
  ];

  if (!apiKey && pathname !== '/admin/login') {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <div className="w-72 border-r border-slate-800 bg-slate-950 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Gem className="h-8 w-8 text-emerald-500" />
            <div>
              <h1 className="text-2xl font-bold">Samotsvety</h1>
              <p className="text-xs text-slate-500">Админ-панель</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                  isActive 
                    ? 'bg-slate-800 text-white' 
                    : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 mt-auto">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-400 hover:text-red-500 hover:bg-red-950/50"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Выйти
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
