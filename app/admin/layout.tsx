'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Gem, List, PlusCircle, LogOut, Sparkles, ShieldCheck } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname.startsWith('/admin/auth');

  useEffect(() => {
    const key = localStorage.getItem('admin_api_key');
    const authenticated = !!key;

    if (!authenticated && !isAuthPage) {
      router.push('/admin/auth/login');
    }
  }, [router, isAuthPage]);

  const handleLogout = () => {
    localStorage.removeItem('admin_api_key');
    router.push('/admin/auth/login');
  };

  const navItems = [
    {
      href: '/admin/minerals',
      label: 'Минералы',
      description: 'База коллекций',
      icon: Gem,
    },
    {
      href: '/admin/minerals/new',
      label: 'Добавить минерал',
      description: 'Новая запись',
      icon: PlusCircle,
    },
    {
      href: '/admin/posts',
      label: 'Статьи',
      description: 'Контент и статьи',
      icon: List,
    },
    {
      href: '/admin/posts/new',
      label: 'Новая статья',
      description: 'Создать публикацию',
      icon: Sparkles,
    },
  ];

  if (isAuthPage) {
    return <div className="min-h-screen bg-[#091018]">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#091018] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1800px]">
        <aside className="flex w-[280px] shrink-0 flex-col border-r border-white/10 bg-slate-950/80 backdrop-blur-xl">
          <div className="border-b border-white/10 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-400/25">
                <Gem className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-300/80">
                  CMS
                </p>
                <h1 className="text-2xl font-semibold tracking-tight text-white">
                  Samotsvety
                </h1>
              </div>
            </div>
          </div>

          <div className="px-4 py-5">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-300/70">
                    Статус
                  </p>
                  <p className="mt-2 text-sm font-medium text-emerald-100">Система в норме</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                  <ShieldCheck className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 pb-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-2xl border px-3 py-3 transition-all duration-200 ${
                    isActive
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-white shadow-[0_0_0_1px_rgba(16,185,129,0.08)]'
                      : 'border-transparent bg-transparent text-slate-300 hover:border-white/10 hover:bg-white/3 hover:text-white'
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      isActive ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="text-[11px] text-slate-400">{item.description}</div>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 p-4">
            <Button
              variant="ghost"
              className="w-full justify-start rounded-xl border border-red-500/15 bg-red-500/5 text-red-300 hover:bg-red-500/10 hover:text-red-200"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Выйти
            </Button>
          </div>
        </aside>

        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl p-6 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}