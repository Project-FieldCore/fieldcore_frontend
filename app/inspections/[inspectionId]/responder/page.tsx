'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/store/app-store';
import { InspectionStatusBadge, PriorityTag } from '@/components/Badges';
import type { ConformityAnswer, Criticidade, ModelItem } from '@/types';

const CONFORMITY_OPTIONS: { value: ConformityAnswer; label: string; activeClass: string }[] = [
  { value: 'CONFORME', label: 'Conforme', activeClass: 'bg-emerald-600 border-emerald-600 text-white' },
  { value: 'NAO_CONFORME', label: 'Não conforme', activeClass: 'bg-red-600 border-red-600 text-white' },
  { value: 'NAO_APLICAVEL', label: 'Não aplicável', activeClass: 'bg-slate-500 border-slate-500 text-white' },
];

const CRITICIDADE_OPTIONS: Criticidade[] = ['BAIXA', 'MEDIA', 'ALTA', 'CRITICA'];

/**
 * UC-11 — Responder checklist / UC-12 — Registrar não conformidade.
 * RN-039: item crítico não conforme exige evidência anexada antes do envio.
 * RN-040: itens obrigatórios precisam de resposta antes do envio.
 */
export default function InspectionAnswerPage() {
  const { inspectionId } = useParams<{ inspectionId: string }>();
  const router = useRouter();

  const inspection = useAppStore((s) => s.inspections.find((i) => i.id === inspectionId));
  const models = useAppStore((s) => s.models);
  const clients = useAppStore((s) => s.clients);
  const locations = useAppStore((s) => s.locations);
  const equipment = useAppStore((s) => s.equipment);
  const technicians = useAppStore((s) => s.technicians);
  const saveAnswer = useAppStore((s) => s.saveAnswer);
  const saveNonConformity = useAppStore((s) => s.saveNonConformity);
  const submitInspection = useAppStore((s) => s.submitInspection);

  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!inspection) return <div className="text-slate-500">Inspeção não encontrada.</div>;

  const model = models.find((m) => m.id === inspection.modeloId);
  const client = clients.find((c) => c.id === inspection.clienteId);
  const location = locations.find((l) => l.id === inspection.localId);
  const equip = equipment.find((e) => e.id === inspection.equipamentoId);
  const tech = technicians.find((t) => t.id === inspection.tecnicoId);

  const editable = inspection.status === 'ATRIBUIDA' || inspection.status === 'EM_ANDAMENTO';

  function handleSubmit() {
    const result = submitInspection(inspection!.id);
    if (!result.ok) { setSubmitError(result.error); return; }
    setSubmitError(null);
    router.push('/inspections');
  }

  function renderItemInput(item: ModelItem) {
    const answer = inspection!.answers[item.id];

    if (item.type === 'CONFORMITY') {
      return (
        <div className="flex flex-wrap gap-2 mt-2">
          {CONFORMITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              disabled={!editable}
              onClick={() => saveAnswer(inspection!.id, item.id, { conformity: opt.value })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border disabled:opacity-60 ${
                answer?.conformity === opt.value ? opt.activeClass : 'bg-white border-slate-300 text-slate-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      );
    }

    if (item.type === 'BOOLEAN') {
      return (
        <div className="flex gap-2 mt-2">
          {[{ v: 'true', label: 'Sim' }, { v: 'false', label: 'Não' }].map((opt) => (
            <button
              key={opt.v}
              disabled={!editable}
              onClick={() => saveAnswer(inspection!.id, item.id, { value: opt.v })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border disabled:opacity-60 ${
                answer?.value === opt.v ? 'bg-navy-800 border-navy-800 text-white' : 'bg-white border-slate-300 text-slate-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      );
    }

    if (item.type === 'TEXT_LONG') {
      return (
        <textarea
          disabled={!editable}
          value={answer?.value ?? ''}
          onChange={(e) => saveAnswer(inspection!.id, item.id, { value: e.target.value })}
          rows={3}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mt-2 disabled:bg-slate-50"
        />
      );
    }

    const inputType = item.type === 'NUMBER' ? 'number' : item.type === 'DATE' ? 'date' : 'text';
    return (
      <input
        type={inputType}
        disabled={!editable}
        value={answer?.value ?? ''}
        onChange={(e) => saveAnswer(inspection!.id, item.id, { value: e.target.value })}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mt-2 disabled:bg-slate-50"
      />
    );
  }

  function renderNonConformityForm(item: ModelItem) {
    const answer = inspection!.answers[item.id];
    if (answer?.conformity !== 'NAO_CONFORME') return null;
    const nc = inspection!.nonConformities[item.id];

    return (
      <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
        <div className="text-xs font-bold text-red-700 uppercase tracking-wide mb-2">
          Não conformidade{item.needsEvidenceOnNok ? ' · evidência obrigatória (RN-039)' : ''}
        </div>
        <input
          placeholder="Título"
          disabled={!editable}
          value={nc?.titulo ?? ''}
          onChange={(e) => saveNonConformity(inspection!.id, item.id, { titulo: e.target.value })}
          className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm mb-2 disabled:bg-white"
        />
        <textarea
          placeholder="Descrição"
          disabled={!editable}
          value={nc?.descricao ?? ''}
          onChange={(e) => saveNonConformity(inspection!.id, item.id, { descricao: e.target.value })}
          rows={2}
          className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm mb-2 disabled:bg-white"
        />
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <select
            disabled={!editable}
            value={nc?.criticidade ?? 'MEDIA'}
            onChange={(e) => saveNonConformity(inspection!.id, item.id, { criticidade: e.target.value as Criticidade })}
            className="border border-red-200 rounded-lg px-2.5 py-1.5 text-xs"
          >
            {CRITICIDADE_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button
            disabled={!editable}
            onClick={() => saveNonConformity(inspection!.id, item.id, { evidenceCount: (nc?.evidenceCount ?? 0) + 1 })}
            className="text-xs font-bold text-red-700 underline disabled:opacity-60"
          >
            + Anexar evidência ({nc?.evidenceCount ?? 0})
          </button>
        </div>
      </div>
    );
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
        {inspection.orientacoes && (
          <div className="sm:col-span-2"><span className="text-slate-400 text-xs uppercase font-bold block mb-1">Orientações</span>{inspection.orientacoes}</div>
        )}
      </div>

      {!editable && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-500 mb-5">
          Esta inspeção já foi enviada e não pode mais ser editada.
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-5">
        <h2 className="font-bold text-navy-900 mb-4">Checklist</h2>
        {model?.sections.map((section) => (
          <div key={section.id} className="mb-5">
            <div className="text-xs font-extrabold text-navy-700 uppercase mb-2">{section.title}</div>
            {section.items.map((item) => {
              const answer = inspection.answers[item.id];
              return (
                <div key={item.id} className="border border-slate-100 rounded-xl p-3.5 mb-2">
                  <div className="text-sm font-semibold text-navy-900">
                    {item.title}
                    {item.required && <span className="text-red-500"> *</span>}
                  </div>
                  {renderItemInput(item)}
                  <textarea
                    placeholder="Observação (opcional)"
                    disabled={!editable}
                    value={answer?.observacao ?? ''}
                    onChange={(e) => saveAnswer(inspection.id, item.id, { observacao: e.target.value })}
                    rows={2}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs mt-2 disabled:bg-slate-50"
                  />
                  {renderNonConformityForm(item)}
                </div>
              );
            })}
          </div>
        ))}
        {!model && <p className="text-sm text-slate-400">Modelo não encontrado para esta inspeção.</p>}
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm mb-5">{submitError}</div>
      )}

      {editable && (
        <button onClick={handleSubmit} className="w-full bg-brandgreen-600 text-white rounded-xl py-3 font-bold">
          Enviar checklist para revisão
        </button>
      )}
    </div>
  );
}
