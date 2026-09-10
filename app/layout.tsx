import type { Metadata } from 'next';
import './globals.css';
import { Shell } from '@/components/Shell';

export const metadata: Metadata = {
  title: 'FieldCore — Painel Administrativo',
  description: 'Inspeções em campo, resultados que conectam.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen text-slate-900">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
