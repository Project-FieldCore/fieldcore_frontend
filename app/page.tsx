'use client';

import Link from 'next/link';
import { useAppStore } from '@/store/app-store';
import { InspectionStatusBadge, PriorityTag, StatCard } from '@/components/Badges';

export default function DashboardPage() {
  const inspections = useAppStore((s) => s.inspections);
  const clients = useAppStore((s) => s.clients);
  const technicians = useAppStore((s) => s.technicians);

  const aguardandoRevisao = inspections.filter((i) => i.status === 'ENVIADA' || i.status === 'EM_REVISAO').length;
  const emAndamento = inspections.filter((i) => i.status === 'EM_ANDAMENTO').length;
  const aprovadas = inspections.filter((i) => i.status === 'APROVADA').length;
  const reprovadas = inspections.filter((i) => i.status === 'REPROVADA').length;

  const clientName = (id: string) => clients.find((c) => c.id === id)?.nome ?? '—';
  const techName = (id: string) => technicians.find((t) => t.id === id)?.nome ?? '—';

  const recentes = [...inspections]
    .sort((a, b) => (a.dataPrevista < b.dataPrevista ? 1 : -1))
    .slice(0, 6);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Visão geral das inspeções em campo</p>
        </div>
        <Link href="/schedule" className="bg-brandgreen-600 text-white font-bold text-sm rounded-xl px-4 py-2.5">
          + Agendar inspeção
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Aguardando revisão" value={aguardandoRevisao} tone="text-blue-800" />
        <StatCard label="Em andamento" value={emAndamento} tone="text-amber-600" />
        <StatCard label="Aprovadas" value={aprovadas} tone="text-emerald-600" />
        <StatCard label="Reprovadas" value={reprovadas} tone="text-red-600" />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-navy-900">Inspeções recentes</h2>
          <Link href="/inspections" className="text-sm font-semibold text-navy-700">Ver todas →</Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 text-xs uppercase border-b border-slate-100">
              <th className="px-5 py-3">Cliente</th>
              <th className="px-5 py-3">Técnico</th>
              <th className="px-5 py-3">Prioridade</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Previsão</th>
            </tr>
          </thead>
          <tbody>
            {recentes.map((i) => (
              <tr key={i.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                <td className="px-5 py-3 font-semibold text-navy-900">
                  <Link href={`/inspections/${i.id}`}>{clientName(i.clienteId)}</Link>
                </td>
                <td className="px-5 py-3 text-slate-600">{techName(i.tecnicoId)}</td>
                <td className="px-5 py-3"><PriorityTag priority={i.prioridade} /></td>
                <td className="px-5 py-3"><InspectionStatusBadge status={i.status} /></td>
                <td className="px-5 py-3 text-slate-500 font-mono text-xs">
                  {new Date(i.dataPrevista).toLocaleDateString('pt-BR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
