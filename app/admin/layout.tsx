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
    return <div className="min-h-screen bg-[var(--color-bone)]">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[var(--color-bone)] text-[var(--color-inkwell-teal)]">
      <div className="mx-auto flex min-h-screen max-w-[1800px]">
        {/* Сайдбар — тёмный тиловый якорь, как dark hero в оригинале,
            но здесь это рабочая панель, а не монументальный display-тайп */}
        <aside className="flex w-[280px] shrink-0 flex-col bg-[var(--color-inkwell-teal)]">
          <div className="border-b border-white/10 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-vellum-lavender)]/15 ring-1 ring-[var(--color-vellum-lavender)]/30">
                <Gem className="h-6 w-6 text-[var(--color-vellum-lavender)]" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-vellum-lavender)]/70">
                  CMS
                </p>
                <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-bone)]">
                  Samotsvety
                </h1>
              </div>
            </div>
          </div>

          <div className="px-4 py-5">
            {/* Section-badge стиль из DESIGN_v2: pill, lavender fill, teal text */}
            <div className="flex items-center justify-between rounded-[20px] border border-white/10 bg-white/[0.04] p-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-vellum-lavender)]/70">
                  Статус
                </p>
                <p className="mt-2 text-sm font-medium text-[var(--color-bone)]">
                  Система в норме
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-vellum-lavender)] text-[var(--color-inkwell-teal)]">
                <ShieldCheck className="h-4 w-4" />
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
                  /* Активный пункт — единственное место, где полный pill (9999px)
                     переносится в навигацию буквально, как в Section Badge */
                  className={`group flex items-center gap-3 rounded-[9999px] px-4 py-2.5 transition-all duration-200 ${
                    isActive
                      ? 'bg-[var(--color-vellum-lavender)] text-[var(--color-inkwell-teal)]'
                      : 'text-[var(--color-bone)]/70 hover:bg-white/[0.06] hover:text-[var(--color-bone)]'
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      isActive
                        ? 'bg-[var(--color-inkwell-teal)]/10 text-[var(--color-inkwell-teal)]'
                        : 'bg-white/[0.06] text-[var(--color-bone)]/60 group-hover:text-[var(--color-bone)]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{item.label}</div>
                    <div
                      className={`text-[11px] ${
                        isActive ? 'text-[var(--color-inkwell-teal)]/70' : 'text-[var(--color-bone)]/40'
                      }`}
                    >
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="p-4">
            <Button
              variant="ghost"
              /* Ghost pill button со страницы DESIGN_v2 — прозрачная заливка,
                 обводка Paper White, для CTA на тёмном фоне */
              className="w-full justify-start rounded-[9999px] border border-white/15 text-red-300 hover:bg-red-500/10 hover:text-red-200"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Выйти
            </Button>
          </div>
        </aside>

        <main className="flex-1 overflow-auto bg-[var(--color-bone)]">
          <div className="mx-auto max-w-7xl p-6 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
