'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/app-store';
import { ModelStatusBadge } from '@/components/Badges';

export default function ModelsPage() {
  const models = useAppStore((s) => s.models);
  const createDraftModel = useAppStore((s) => s.createDraftModel);
  const router = useRouter();

  function handleNew() {
    const id = createDraftModel();
    router.push(`/models/${id}`);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900">Modelos de inspeção</h1>
          <p className="text-sm text-slate-500">Crie, organize e publique versões de checklist (UC-04, UC-05)</p>
        </div>
        <button onClick={handleNew} className="bg-brandgreen-600 text-white font-bold text-sm rounded-xl px-4 py-2.5">
          + Novo modelo
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {models.map((m) => (
          <Link
            key={m.id}
            href={`/models/${m.id}`}
            className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-navy-700 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <h2 className="font-bold text-navy-900">{m.title}</h2>
              <ModelStatusBadge status={m.status} />
            </div>
            <p className="text-sm text-slate-500 mb-3">{m.description || 'Sem descrição.'}</p>
            <div className="flex items-center gap-4 text-xs text-slate-400 font-semibold">
              <span>{m.category}</span>
              <span>v{m.version}</span>
              <span>{m.sections.length} seção(ões)</span>
              <span>{m.sections.reduce((sum, s) => sum + s.items.length, 0)} itens</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
