'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/store/app-store';
import { InspectionStatusBadge, PriorityTag } from '@/components/Badges';
import type { InspectionStatus } from '@/types';

const FILTERS: { key: 'TODAS' | InspectionStatus; label: string }[] = [
  { key: 'TODAS', label: 'Todas' },
  { key: 'ATRIBUIDA', label: 'Atribuídas' },
  { key: 'EM_ANDAMENTO', label: 'Em andamento' },
  { key: 'ENVIADA', label: 'Aguardando revisão' },
  { key: 'APROVADA', label: 'Aprovadas' },
  { key: 'REPROVADA', label: 'Reprovadas' },
];

/**
 * UC-15 — Acompanhar inspeções.
 * Filtros por técnico, cliente, estado e período (doc 08.2 / UC-18/19 parcial).
 */
export default function InspectionsListPage() {
  const inspections = useAppStore((s) => s.inspections);
  const clients = useAppStore((s) => s.clients);
  const technicians = useAppStore((s) => s.technicians);

  const [filter, setFilter] = useState<(typeof FILTERS)[number]['key']>('TODAS');
  const [techFilter, setTechFilter] = useState('TODOS');

  const clientName = (id: string) => clients.find((c) => c.id === id)?.nome ?? '—';
  const techName = (id: string) => technicians.find((t) => t.id === id)?.nome ?? '—';

  const filtered = useMemo(() => {
    return inspections.filter((i) => {
      if (filter !== 'TODAS' && i.status !== filter) return false;
      if (techFilter !== 'TODOS' && i.tecnicoId !== techFilter) return false;
      return true;
    });
  }, [inspections, filter, techFilter]);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-navy-900 mb-1">Inspeções</h1>
      <p className="text-sm text-slate-500 mb-6">Acompanhe o andamento e abra a revisão das inspeções enviadas (UC-15, UC-16)</p>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                filter === f.key ? 'bg-navy-900 border-navy-900 text-white' : 'bg-white border-slate-300 text-slate-500'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <select value={techFilter} onChange={(e) => setTechFilter(e.target.value)} className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs ml-auto">
          <option value="TODOS">Todos os técnicos</option>
          {technicians.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 text-xs uppercase border-b border-slate-100">
              <th className="px-5 py-3">ID</th>
              <th className="px-5 py-3">Cliente</th>
              <th className="px-5 py-3">Técnico</th>
              <th className="px-5 py-3">Prioridade</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Previsão</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((i) => (
              <tr key={i.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                <td className="px-5 py-3 font-mono text-xs text-slate-400">{i.id}</td>
                <td className="px-5 py-3 font-semibold text-navy-900">{clientName(i.clienteId)}</td>
                <td className="px-5 py-3 text-slate-600">{techName(i.tecnicoId)}</td>
                <td className="px-5 py-3"><PriorityTag priority={i.prioridade} /></td>
                <td className="px-5 py-3"><InspectionStatusBadge status={i.status} /></td>
                <td className="px-5 py-3 text-slate-500 font-mono text-xs">{new Date(i.dataPrevista).toLocaleDateString('pt-BR')}</td>
                <td className="px-5 py-3 text-right">
                  <Link href={`/inspections/${i.id}`} className="text-xs font-bold text-navy-700">
                    {i.status === 'ENVIADA' || i.status === 'EM_REVISAO' ? 'Revisar →' : 'Ver →'}
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-sm">Nenhuma inspeção encontrada com esses filtros.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
