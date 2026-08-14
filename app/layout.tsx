import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'FieldCore — Painel Administrativo',
  description: 'Inspeções em campo, resultados que conectam.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen text-slate-900">
        <Sidebar />
        <main className="min-h-screen min-w-0 pt-20 pb-8 px-4 sm:px-6 lg:pt-8 lg:pb-8 lg:pl-72 lg:pr-8">{children}</main>
      </body>
    </html>
  );
}
