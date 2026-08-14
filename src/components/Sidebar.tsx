'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const IconDashboard = () => (
  <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconClipboard = () => (
  <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const IconCalendar = () => (
  <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const IconSearch = () => (
  <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const IconMenu = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

const IconClose = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', Icon: IconDashboard },
  { href: '/models', label: 'Modelos de inspeção', Icon: IconClipboard },
  { href: '/schedule', label: 'Agendar inspeção', Icon: IconCalendar },
  { href: '/inspections', label: 'Inspeções', Icon: IconSearch },
];

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10 shrink-0">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-navy-700 to-brandgreen-500 shrink-0" />
      <div className="font-extrabold text-lg tracking-tight">
        Field<span className="text-brandgreen-500">Core</span>
      </div>
    </div>
  );
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              active ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <item.Icon />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function UserFooter() {
  return (
    <div className="px-5 py-4 border-t border-white/10 shrink-0">
      <div className="text-xs text-slate-500 mb-1">Logado como</div>
      <div className="text-sm font-semibold text-white">Marina Costa</div>
      <div className="text-xs text-slate-400">Supervisora</div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Fecha o drawer automaticamente ao navegar (troca de rota).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Topbar mobile/tablet — a sidebar completa vira um drawer abaixo de lg */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-30 h-14 bg-navy-900 text-white flex items-center px-4 shadow-sm">
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          className="p-1.5 -ml-1.5 rounded-lg hover:bg-white/10 transition-colors"
        >
          <IconMenu />
        </button>
        <div className="flex-1 flex justify-center font-extrabold text-base tracking-tight">
          Field<span className="text-brandgreen-500">Core</span>
        </div>
        <div className="w-8" />
      </header>

      {/* Sidebar recuada — flutua com margem em relação às bordas da tela (desktop) */}
      <aside
        className="hidden lg:flex lg:flex-col fixed left-4 top-4 bottom-4 w-64 shrink-0 bg-navy-900 text-white rounded-2xl shadow-sm z-20"
      >
        <Brand />
        <NavLinks pathname={pathname} />
        <UserFooter />
      </aside>

      {/* Drawer mobile/tablet */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition-opacity duration-200 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!open}
      >
        <button
          onClick={() => setOpen(false)}
          aria-label="Fechar menu"
          className="absolute inset-0 bg-navy-900/50"
        />
        <aside
          className={`absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-navy-900 text-white flex flex-col transition-transform duration-200 ease-out ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-5 py-5 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-navy-700 to-brandgreen-500 shrink-0" />
              <div className="font-extrabold text-lg tracking-tight">
                Field<span className="text-brandgreen-500">Core</span>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Fechar menu" className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <IconClose />
            </button>
          </div>
          <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
          <UserFooter />
        </aside>
      </div>
    </>
  );
}
