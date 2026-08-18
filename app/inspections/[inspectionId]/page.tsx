'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/store/app-store';
import { InspectionStatusBadge, PriorityTag } from '@/components/Badges';

/**
 * UC-16 — Revisar inspeção / UC-17 — Aprovar ou reprovar inspeção.
 * RN-079: somente supervisor autorizado inicia a revisão (aqui, implícito).
 * RN-080: reprovação exige motivo obrigatório.
 * RN-081: aprovação registra supervisor, data e comentário opcional.
 * RN-084: o supervisor não altera silenciosamente a resposta do técnico —
 * por isso as respostas abaixo são somente leitura.
 */
export default function InspectionReviewPage() {
  const { inspectionId } = useParams<{ inspectionId: string }>();
  const router = useRouter();

  const inspection = useAppStore((s) => s.inspections.find((i) => i.id === inspectionId));
  const models = useAppStore((s) => s.models);
  const clients = useAppStore((s) => s.clients);
  const locations = useAppStore((s) => s.locations);
  const equipment = useAppStore((s) => s.equipment);
  const technicians = useAppStore((s) => s.technicians);
  const startReview = useAppStore((s) => s.startReview);
  const approveInspection = useAppStore((s) => s.approveInspection);
  const rejectInspection = useAppStore((s) => s.rejectInspection);

  const [comentario, setComentario] = useState('');
  const [motivo, setMotivo] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectError, setRejectError] = useState<string | null>(null);

  if (!inspection) return <div className="text-slate-500">Inspeção não encontrada.</div>;

  const model = models.find((m) => m.id === inspection.modeloId);
  const client = clients.find((c) => c.id === inspection.clienteId);
  const location = locations.find((l) => l.id === inspection.localId);
  const equip = equipment.find((e) => e.id === inspection.equipamentoId);
  const tech = technicians.find((t) => t.id === inspection.tecnicoId);

  const canReview = inspection.status === 'ENVIADA' || inspection.status === 'EM_REVISAO';

  function handleOpenReview() {
    startReview(inspection!.id);
  }
  function handleApprove() {
    approveInspection(inspection!.id, 'Marina Costa', comentario || undefined);
    router.push('/inspections');
  }
  function handleReject() {
    const result = rejectInspection(inspection!.id, 'Marina Costa', motivo);
    if (!result.ok) { setRejectError(result.error); return; }
    router.push('/inspections');
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => router.push('/inspections')} className="text-sm font-semibold text-slate-500 mb-4">← Voltar às inspeções</button>

      <div className="flex items-start justify-between gap-3 flex-wrap mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900">{client?.nome}</h1>
          <p className="text-sm text-slate-500">{location?.nome}{equip ? ` · ${equip.nome}` : ''}</p>
        </div>
        <InspectionStatusBadge status={inspection.status} />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div><span className="text-slate-400 text-xs uppercase font-bold block mb-1">Técnico</span>{tech?.nome}</div>
        <div><span className="text-slate-400 text-xs uppercase font-bold block mb-1">Prioridade</span><PriorityTag priority={inspection.prioridade} /></div>
        <div><span className="text-slate-400 text-xs uppercase font-bold block mb-1">Modelo</span>{model?.title} · v{inspection.modeloVersao}</div>
        <div><span className="text-slate-400 text-xs uppercase font-bold block mb-1">Data prevista</span>{new Date(inspection.dataPrevista).toLocaleString('pt-BR')}</div>
      </div>

      {inspection.status === 'ENVIADA' && (
        <button onClick={handleOpenReview} className="w-full bg-navy-800 text-white rounded-xl py-3 font-bold mb-5">
          Iniciar revisão formal
        </button>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-5">
        <h2 className="font-bold text-navy-900 mb-4">Respostas do checklist</h2>
        {model?.sections.map((section) => (
          <div key={section.id} className="mb-5">
            <div className="text-xs font-extrabold text-navy-700 uppercase mb-2">{section.title}</div>
            {section.items.map((item) => {
              const answer = inspection.answers[item.id];
              const nc = inspection.nonConformities[item.id];
              const isConforme = answer?.conformity === 'CONFORME';
              const isNaoConforme = answer?.conformity === 'NAO_CONFORME';
              const isNaoAplicavel = answer?.conformity === 'NAO_APLICAVEL';
              const label =
                isConforme ? 'Conforme'
                : isNaoConforme ? 'Não conforme'
                : isNaoAplicavel ? 'Não aplicável'
                : answer?.value || 'Sem resposta';
              const dotColor =
                isConforme ? 'bg-emerald-500'
                : isNaoConforme ? 'bg-red-500'
                : 'bg-slate-300';
              const labelColor =
                isConforme ? 'text-emerald-700'
                : isNaoConforme ? 'text-red-600'
                : 'text-slate-500';
              return (
                <div key={item.id} className="border border-slate-100 rounded-xl p-3.5 mb-2">
                  <div className="text-sm font-semibold text-navy-900">{item.title}</div>
                  <div className={`flex items-center gap-1.5 mt-1.5 text-sm font-semibold ${labelColor}`}>
                    {answer?.conformity && <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />}
                    {label}
                  </div>
                  {answer?.observacao && <div className="text-xs text-slate-500 mt-1.5">{answer.observacao}</div>}
                  {answer?.evidenceCount ? <div className="text-xs text-slate-400 mt-1">{answer.evidenceCount} evidência(s) anexada(s)</div> : null}
                  {nc && (
                    <div className="mt-2.5 bg-red-50 border border-red-200 rounded-lg p-2.5">
                      <div className="text-xs font-semibold text-red-700 uppercase tracking-wide">Não conformidade · {nc.criticidade}</div>
                      <div className="text-xs text-red-600 mt-1">{nc.descricao}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {canReview && !showRejectForm && (
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => setShowRejectForm(true)} className="flex-1 bg-white border border-red-200 text-red-600 rounded-xl py-3 font-bold">
            Reprovar
          </button>
          <button onClick={handleApprove} className="flex-1 bg-brandgreen-600 text-white rounded-xl py-3 font-bold">
            Aprovar
          </button>
        </div>
      )}

      {canReview && (
        <div className="mt-3">
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Comentário de revisão (opcional)"
            rows={2}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      )}

      {showRejectForm && (
        <div className="bg-white border border-red-200 rounded-2xl p-5 mt-3">
          <label className="text-xs font-bold text-red-700 uppercase block mb-1">Motivo da reprovação (obrigatório — RN-080)</label>
          <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={3} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-3" />
          {rejectError && <div className="text-xs text-red-600 font-semibold mb-3">{rejectError}</div>}
          <div className="flex flex-col sm:flex-row gap-2">
            <button onClick={() => setShowRejectForm(false)} className="flex-1 bg-white border border-slate-300 rounded-xl py-2.5 font-bold text-navy-800">Cancelar</button>
            <button onClick={handleReject} className="flex-1 bg-red-600 text-white rounded-xl py-2.5 font-bold">Confirmar reprovação</button>
          </div>
        </div>
      )}

      {inspection.review && (
        <div className="mt-5 text-xs text-slate-400">
          {inspection.status === 'APROVADA' ? 'Aprovada' : 'Reprovada'} por {inspection.review.supervisorNome}
          {inspection.review.decidedAt ? ` em ${new Date(inspection.review.decidedAt).toLocaleString('pt-BR')}` : ''}.
          {inspection.review.motivoReprovacao ? ` Motivo: ${inspection.review.motivoReprovacao}` : ''}
        </div>
      )}
    </div>
  );
}
