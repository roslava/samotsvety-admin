import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Samotsvety Admin',
  description: 'Админ-панель цифрового атласа самоцветов',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="font-sans">
      <body className="font-sans">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
