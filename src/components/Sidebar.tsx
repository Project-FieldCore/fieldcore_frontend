'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/models', label: 'Modelos de inspeção', icon: '📋' },
  { href: '/schedule', label: 'Agendar inspeção', icon: '🗓' },
  { href: '/inspections', label: 'Inspeções', icon: '🔍' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-navy-900 text-white flex flex-col min-h-screen">
      <div className="flex items-center gap-2.5 px-5 py-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-navy-700 to-brandgreen-500" />
        <div className="font-extrabold text-lg">
          Field<span className="text-brandgreen-500">Core</span>
        </div>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                active ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-5 border-t border-white/10">
        <div className="text-xs text-slate-400">Logado como</div>
        <div className="text-sm font-bold">Marina Costa</div>
        <div className="text-xs text-slate-400">Supervisora</div>
      </div>
    </aside>
  );
}
