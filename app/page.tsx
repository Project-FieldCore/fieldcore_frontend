'use client';

import Link from 'next/link';
import { useAppStore } from '@/store/app-store';
import { InspectionStatusBadge, PriorityTag, StatCard } from '@/components/Badges';
import type { Criticidade, InspectionStatus } from '@/types';

const ACTIVE_STATUSES: InspectionStatus[] = ['ATRIBUIDA', 'EM_ANDAMENTO'];

const CRITICIDADE_ORDER: Criticidade[] = ['CRITICA', 'ALTA', 'MEDIA', 'BAIXA'];
const CRITICIDADE_LABEL: Record<Criticidade, string> = { CRITICA: 'Crítica', ALTA: 'Alta', MEDIA: 'Média', BAIXA: 'Baixa' };
const CRITICIDADE_DOT: Record<Criticidade, string> = {
  CRITICA: 'bg-red-600',
  ALTA: 'bg-red-400',
  MEDIA: 'bg-amber-500',
  BAIXA: 'bg-slate-400',
};

export default function DashboardPage() {
  const inspections = useAppStore((s) => s.inspections);
  const clients = useAppStore((s) => s.clients);
  const technicians = useAppStore((s) => s.technicians);
  const models = useAppStore((s) => s.models);

  const aguardandoRevisao = inspections.filter((i) => i.status === 'ENVIADA' || i.status === 'EM_REVISAO').length;
  const emAndamento = inspections.filter((i) => i.status === 'EM_ANDAMENTO').length;
  const aprovadas = inspections.filter((i) => i.status === 'APROVADA').length;
  const reprovadas = inspections.filter((i) => i.status === 'REPROVADA').length;

  const clientName = (id: string) => clients.find((c) => c.id === id)?.nome ?? '—';
  const techName = (id: string) => technicians.find((t) => t.id === id)?.nome ?? '—';

  const recentes = [...inspections]
    .sort((a, b) => (a.dataPrevista < b.dataPrevista ? 1 : -1))
    .slice(0, 6);

  const techWorkload = [...technicians]
    .map((t) => ({
      ...t,
      count: inspections.filter((i) => i.tecnicoId === t.id && ACTIVE_STATUSES.includes(i.status)).length,
    }))
    .sort((a, b) => b.count - a.count);

  const nonConformities = inspections.flatMap((i) => Object.values(i.nonConformities));
  const ncByCriticidade = CRITICIDADE_ORDER.map((c) => ({
    criticidade: c,
    count: nonConformities.filter((nc) => nc.criticidade === c).length,
  }));

  const publishedModels = models.filter((m) => m.status === 'PUBLICADO').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Visão geral das inspeções em campo</p>
        </div>
        <Link href="/schedule" className="bg-brandgreen-600 text-white font-bold text-sm rounded-xl px-4 py-2.5 whitespace-nowrap">
          + Agendar inspeção
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Aguardando revisão" value={aguardandoRevisao} tone="text-blue-800" icon={<IconInbox />} />
        <StatCard label="Em andamento" value={emAndamento} tone="text-amber-600" icon={<IconClock />} />
        <StatCard label="Aprovadas" value={aprovadas} tone="text-emerald-600" icon={<IconCheck />} />
        <StatCard label="Reprovadas" value={reprovadas} tone="text-red-600" icon={<IconX />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden min-w-0">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-bold text-navy-900">Inspeções recentes</h2>
            <Link href="/inspections" className="text-sm font-semibold text-navy-700">Ver todas →</Link>
          </div>
          {/* Tablet/desktop: tabela ocupa 100% do card, sem largura mínima — nunca gera rolagem lateral */}
          <table className="hidden sm:table w-full text-sm table-fixed">
            <colgroup>
              <col className="w-[28%]" />
              <col className="w-[24%]" />
              <col className="w-[18%]" />
              <col className="w-[18%]" />
              <col className="w-[12%]" />
            </colgroup>
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
                  <td className="px-5 py-3 font-semibold text-navy-900 truncate">
                    <Link href={`/inspections/${i.id}`}>{clientName(i.clienteId)}</Link>
                  </td>
                  <td className="px-5 py-3 text-slate-600 truncate">{techName(i.tecnicoId)}</td>
                  <td className="px-5 py-3"><PriorityTag priority={i.prioridade} /></td>
                  <td className="px-5 py-3"><InspectionStatusBadge status={i.status} /></td>
                  <td className="px-5 py-3 text-slate-500 font-mono text-xs">
                    {new Date(i.dataPrevista).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
              {recentes.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400 text-sm">Nenhuma inspeção agendada ainda.</td></tr>
              )}
            </tbody>
          </table>

          {/* Mobile: lista de cards com as mesmas informações, empilhadas e sem cortar conteúdo */}
          <div className="sm:hidden divide-y divide-slate-100">
            {recentes.map((i) => (
              <Link key={i.id} href={`/inspections/${i.id}`} className="block p-4 hover:bg-slate-50">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="font-semibold text-navy-900 truncate min-w-0">{clientName(i.clienteId)}</span>
                  <InspectionStatusBadge status={i.status} />
                </div>
                <div className="flex items-center justify-between gap-3 text-sm text-slate-600 mb-2">
                  <span className="truncate min-w-0">{techName(i.tecnicoId)}</span>
                  <PriorityTag priority={i.prioridade} />
                </div>
                <div className="text-xs font-mono text-slate-500">
                  {new Date(i.dataPrevista).toLocaleDateString('pt-BR')}
                </div>
              </Link>
            ))}
            {recentes.length === 0 && (
              <div className="px-5 py-10 text-center text-slate-400 text-sm">Nenhuma inspeção agendada ainda.</div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:h-full">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shrink-0">
            <h2 className="text-xs font-bold text-navy-700 uppercase mb-3">Técnicos em campo</h2>
            <ul className="space-y-3">
              {techWorkload.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${t.ativo ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span className="truncate font-semibold text-navy-900">{t.nome}</span>
                  </span>
                  <span className="text-xs font-bold text-slate-500 shrink-0">{t.count} ativa{t.count === 1 ? '' : 's'}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shrink-0">
            <h2 className="text-xs font-bold text-navy-700 uppercase mb-3">Não conformidades abertas</h2>
            {nonConformities.length === 0 ? (
              <p className="text-sm text-slate-400">Nenhuma registrada.</p>
            ) : (
              <ul className="space-y-2.5">
                {ncByCriticidade.filter((c) => c.count > 0).map((c) => (
                  <li key={c.criticidade} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${CRITICIDADE_DOT[c.criticidade]}`} />
                      <span className="font-semibold text-navy-900">{CRITICIDADE_LABEL[c.criticidade]}</span>
                    </span>
                    <span className="text-xs font-bold text-slate-500">{c.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex-1 flex flex-col justify-center min-h-[132px]">
            <h2 className="text-xs font-bold text-navy-700 uppercase mb-3">Modelos de inspeção</h2>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-extrabold text-navy-900">{publishedModels}</span>
              <span className="text-sm text-slate-500">publicado{publishedModels === 1 ? '' : 's'} de {models.length}</span>
            </div>
            <Link href="/models" className="text-xs font-semibold text-brandgreen-600 hover:underline">Gerenciar modelos →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const IconInbox = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h4l2 3h6l2-3h4M5 12l1.5-6.5A2 2 0 018.45 4h7.1a2 2 0 011.95 1.5L19 12v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6z" />
  </svg>
);

const IconClock = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
  </svg>
);

const IconCheck = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 12.5l2.5 2.5 4.5-5" />
  </svg>
);

const IconX = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 9.5l5 5m0-5l-5 5" />
  </svg>
);
