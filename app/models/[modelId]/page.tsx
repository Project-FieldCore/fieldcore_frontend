'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/store/app-store';
import { ModelStatusBadge } from '@/components/Badges';
import type { ItemType } from '@/types';

const ITEM_TYPES: { value: ItemType; label: string }[] = [
  { value: 'TEXT_SHORT', label: 'Texto curto' },
  { value: 'TEXT_LONG', label: 'Texto longo' },
  { value: 'NUMBER', label: 'Número' },
  { value: 'BOOLEAN', label: 'Verdadeiro/Falso' },
  { value: 'CONFORMITY', label: 'Conforme/Não conforme' },
  { value: 'SINGLE_CHOICE', label: 'Seleção única' },
  { value: 'DATE', label: 'Data' },
];

/**
 * UC-04 — Criar modelo de inspeção / UC-05 — Publicar versão do modelo.
 * RN-015: título, categoria e ao menos uma seção com item válido.
 * RN-016: todo item precisa de tipo de resposta.
 * RN-018: modelo em rascunho pode ser alterado livremente.
 * RN-019/020: versão publicada não é alterada destrutivamente — nova
 * publicação gera nova versão, preservando a anterior (histórico simplificado
 * aqui pelo campo `version`).
 */
export default function ModelBuilderPage() {
  const { modelId } = useParams<{ modelId: string }>();
  const router = useRouter();
  const model = useAppStore((s) => s.models.find((m) => m.id === modelId));
  const updateModelMeta = useAppStore((s) => s.updateModelMeta);
  const addSection = useAppStore((s) => s.addSection);
  const removeSection = useAppStore((s) => s.removeSection);
  const updateSectionTitle = useAppStore((s) => s.updateSectionTitle);
  const addItem = useAppStore((s) => s.addItem);
  const removeItem = useAppStore((s) => s.removeItem);
  const updateItem = useAppStore((s) => s.updateItem);
  const publishModel = useAppStore((s) => s.publishModel);

  const [publishError, setPublishError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  if (!model) return <div className="text-slate-500">Modelo não encontrado.</div>;
  const locked = false; // RN-019: aqui poderíamos bloquear edição estrutural de versões já publicadas.

  function handlePublish() {
    const result = publishModel(model.id);
    if (!result.ok) {
      setPublishError(result.error);
      return;
    }
    setPublishError(null);
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.push('/models')} className="text-sm font-semibold text-slate-500">← Voltar aos modelos</button>
        <ModelStatusBadge status={model.status} />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
        <label className="text-xs font-bold text-navy-700 uppercase block mb-1">Título</label>
        <input
          value={model.title}
          onChange={(e) => updateModelMeta(model.id, { title: e.target.value })}
          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-lg font-bold text-navy-900 mb-4"
        />
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs font-bold text-navy-700 uppercase block mb-1">Categoria</label>
            <input
              value={model.category}
              onChange={(e) => updateModelMeta(model.id, { category: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-navy-700 uppercase block mb-1">Versão atual</label>
            <div className="border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm font-mono text-slate-500">v{model.version}</div>
          </div>
        </div>
        <label className="text-xs font-bold text-navy-700 uppercase block mb-1">Descrição</label>
        <textarea
          value={model.description}
          onChange={(e) => updateModelMeta(model.id, { description: e.target.value })}
          rows={2}
          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm"
        />
      </div>

      {model.sections.map((section) => (
        <div key={section.id} className="bg-white border border-slate-200 rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <input
              value={section.title}
              onChange={(e) => updateSectionTitle(model.id, section.id, e.target.value)}
              className="flex-1 border-b border-slate-200 focus:border-navy-700 outline-none font-bold text-navy-900 py-1"
            />
            <button onClick={() => removeSection(model.id, section.id)} className="text-xs font-semibold text-red-600">
              Remover seção
            </button>
          </div>

          <div className="space-y-3">
            {section.items.map((item) => (
              <div key={item.id} className="border border-slate-200 rounded-xl p-3.5 bg-slate-50">
                <div className="flex items-center gap-2 mb-2.5">
                  <input
                    value={item.title}
                    onChange={(e) => updateItem(model.id, section.id, item.id, { title: e.target.value })}
                    className="flex-1 border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm bg-white"
                  />
                  <button onClick={() => removeItem(model.id, section.id, item.id)} className="text-xs font-semibold text-red-600 px-2">
                    Remover
                  </button>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <select
                    value={item.type}
                    onChange={(e) => updateItem(model.id, section.id, item.id, { type: e.target.value as ItemType })}
                    className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white"
                  >
                    {ITEM_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={item.required}
                      onChange={(e) => updateItem(model.id, section.id, item.id, { required: e.target.checked })}
                    />
                    Obrigatório
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={item.needsEvidenceOnNok}
                      onChange={(e) => updateItem(model.id, section.id, item.id, { needsEvidenceOnNok: e.target.checked })}
                    />
                    Exige evidência se não conforme (RN-039)
                  </label>
                </div>
              </div>
            ))}
            <button onClick={() => addItem(model.id, section.id)} className="text-sm font-semibold text-navy-700">
              + Adicionar item
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={() => addSection(model.id)}
        className="w-full border-2 border-dashed border-slate-300 rounded-2xl py-4 text-sm font-bold text-slate-500 mb-6"
      >
        + Adicionar seção
      </button>

      {publishError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-xl px-4 py-3 mb-4">
          {publishError}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={() => setShowPreview(true)} className="flex-1 bg-white border border-slate-300 rounded-xl py-3 font-bold text-navy-800">
          Ver prévia do checklist
        </button>
        <button onClick={handlePublish} className="flex-1 bg-brandgreen-600 text-white rounded-xl py-3 font-bold">
          Publicar versão
        </button>
      </div>

      {showPreview && (
        <div className="fixed inset-0 bg-navy-900/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto p-6">
            <h3 className="font-extrabold text-navy-900 mb-1">{model.title}</h3>
            <p className="text-sm text-slate-500 mb-4">Prévia de como o técnico verá no aplicativo</p>
            {model.sections.map((sec) => (
              <div key={sec.id} className="mb-4">
                <div className="text-xs font-extrabold text-navy-700 uppercase mb-2">{sec.title}</div>
                {sec.items.map((it) => (
                  <div key={it.id} className="border border-slate-200 rounded-lg p-3 mb-2 text-sm">
                    <div className="font-semibold text-navy-900">{it.title}</div>
                    <div className="text-xs text-slate-400 mt-1">{ITEM_TYPES.find((t) => t.value === it.type)?.label}{it.required ? ' · Obrigatório' : ''}</div>
                  </div>
                ))}
              </div>
            ))}
            <button onClick={() => setShowPreview(false)} className="w-full bg-navy-900 text-white rounded-xl py-2.5 font-bold mt-2">
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
