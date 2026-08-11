import type { InspectionStatus, ModelStatus, Priority } from '@/types';

const STATUS_MAP: Record<InspectionStatus, { label: string; className: string }> = {
  RASCUNHO: { label: 'Rascunho', className: 'bg-slate-100 text-slate-600' },
  ATRIBUIDA: { label: 'Atribuída', className: 'bg-blue-100 text-blue-800' },
  EM_ANDAMENTO: { label: 'Em andamento', className: 'bg-amber-100 text-amber-700' },
  ENVIADA: { label: 'Aguardando revisão', className: 'bg-slate-200 text-slate-700' },
  EM_REVISAO: { label: 'Em revisão', className: 'bg-blue-100 text-blue-800' },
  APROVADA: { label: 'Aprovada', className: 'bg-emerald-100 text-emerald-700' },
  REPROVADA: { label: 'Reprovada', className: 'bg-red-100 text-red-700' },
  CANCELADA: { label: 'Cancelada', className: 'bg-slate-100 text-slate-500' },
};

export function InspectionStatusBadge({ status }: { status: InspectionStatus }) {
  const s = STATUS_MAP[status];
  return <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${s.className}`}>{s.label}</span>;
}

const MODEL_STATUS_MAP: Record<ModelStatus, { label: string; className: string }> = {
  RASCUNHO: { label: 'Rascunho', className: 'bg-slate-100 text-slate-600' },
  PUBLICADO: { label: 'Publicado', className: 'bg-emerald-100 text-emerald-700' },
};

export function ModelStatusBadge({ status }: { status: ModelStatus }) {
  const s = MODEL_STATUS_MAP[status];
  return <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${s.className}`}>{s.label}</span>;
}

const PRIORITY_MAP: Record<Priority, { label: string; dot: string }> = {
  ALTA: { label: 'Alta', dot: 'bg-red-500' },
  MEDIA: { label: 'Média', dot: 'bg-amber-500' },
  BAIXA: { label: 'Baixa', dot: 'bg-slate-400' },
};

export function PriorityTag({ priority }: { priority: Priority }) {
  const p = PRIORITY_MAP[priority];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
      <span className={`w-2 h-2 rounded-full ${p.dot}`} />
      {p.label}
    </span>
  );
}

export function StatCard({ label, value, tone }: { label: string; value: number | string; tone?: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className={`text-3xl font-extrabold ${tone ?? 'text-navy-900'}`}>{value}</div>
      <div className="text-sm text-slate-500 font-semibold mt-1">{label}</div>
    </div>
  );
}
