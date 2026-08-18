'use client';

import Link from 'next/link';
import { useAppStore } from '@/store/app-store';
import { InspectionStatusBadge, PriorityTag } from '@/components/Badges';

const CURRENT_TECHNICIAN_ID = 'tec-1';

/**
 * UC-11 — Responder checklist.
 * Lista as inspeções atribuídas ao técnico logado que ainda aceitam respostas.
 */
export default function InspectionsToAnswerPage() {
  const inspections = useAppStore((s) => s.inspections);
  const clients = useAppStore((s) => s.clients);
  const locations = useAppStore((s) => s.locations);

  const clientName = (id: string) => clients.find((c) => c.id === id)?.nome ?? '—';
  const locationName = (id: string) => locations.find((l) => l.id === id)?.nome ?? '—';

  const pending = inspections.filter(
    (i) => i.tecnicoId === CURRENT_TECHNICIAN_ID && (i.status === 'ATRIBUIDA' || i.status === 'EM_ANDAMENTO')
  );

  return (
    <div className="w-full min-w-0 max-w-3xl mx-auto">
      <h1 className="text-2xl font-extrabold text-navy-900 mb-1">Responder checklist</h1>
      <p className="text-sm text-slate-500 mb-6">Inspeções atribuídas a você aguardando o preenchimento do checklist (UC-11)</p>

      <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
        {pending.map((i) => (
          <Link key={i.id} href={`/inspections/${i.id}/responder`} className="flex items-center justify-between gap-3 p-4 hover:bg-slate-50">
            <div className="min-w-0">
              <div className="font-semibold text-navy-900 truncate">{clientName(i.clienteId)}</div>
              <div className="text-xs text-slate-500 truncate">{locationName(i.localId)}</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <PriorityTag priority={i.prioridade} />
              <InspectionStatusBadge status={i.status} />
            </div>
          </Link>
        ))}
        {pending.length === 0 && (
          <div className="px-5 py-10 text-center text-slate-400 text-sm">Nenhuma inspeção pendente de resposta no momento.</div>
        )}
      </div>
    </div>
  );
}
