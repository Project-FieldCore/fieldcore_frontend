'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/app-store';
import type { Priority } from '@/types';

/**
 * UC-06 — Agendar e atribuir inspeção.
 * RN-024: precisa de versão publicada do modelo.
 * RN-025: cliente, local, técnico e data prevista são obrigatórios.
 * RN-027: somente técnico ativo pode receber nova atribuição.
 */
export default function SchedulePage() {
  const router = useRouter();
  const models = useAppStore((s) => s.models.filter((m) => m.status === 'PUBLICADO'));
  const clients = useAppStore((s) => s.clients);
  const locations = useAppStore((s) => s.locations);
  const equipment = useAppStore((s) => s.equipment);
  const technicians = useAppStore((s) => s.technicians);
  const scheduleInspection = useAppStore((s) => s.scheduleInspection);

  const [modeloId, setModeloId] = useState(models[0]?.id ?? '');
  const [clienteId, setClienteId] = useState('');
  const [localId, setLocalId] = useState('');
  const [equipamentoId, setEquipamentoId] = useState('');
  const [tecnicoId, setTecnicoId] = useState('');
  const [prioridade, setPrioridade] = useState<Priority>('MEDIA');
  const [dataPrevista, setDataPrevista] = useState('');
  const [orientacoes, setOrientacoes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const availableLocations = useMemo(() => locations.filter((l) => l.clienteId === clienteId), [locations, clienteId]);
  const availableEquipment = useMemo(() => equipment.filter((e) => e.localId === localId), [equipment, localId]);

  function handleSubmit() {
    const result = scheduleInspection({
      modeloId,
      clienteId,
      localId,
      equipamentoId: equipamentoId || undefined,
      tecnicoId,
      prioridade,
      dataPrevista: dataPrevista ? new Date(dataPrevista).toISOString() : '',
      orientacoes,
    });
    if (!result.ok) {
      setError(result.error);
      setSuccess(null);
      return;
    }
    setError(null);
    setSuccess(`Inspeção ${result.id} agendada com sucesso.`);
    setTimeout(() => router.push('/inspections'), 900);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-extrabold text-navy-900 mb-1">Agendar inspeção</h1>
      <p className="text-sm text-slate-500 mb-6">Selecione o modelo publicado, o local e o técnico responsável (UC-06)</p>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <Field label="Modelo de inspeção (apenas versões publicadas)">
          <select value={modeloId} onChange={(e) => setModeloId(e.target.value)} className="input">
            <option value="">Selecione...</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>{m.title} · v{m.version}</option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Cliente">
            <select value={clienteId} onChange={(e) => { setClienteId(e.target.value); setLocalId(''); setEquipamentoId(''); }} className="input">
              <option value="">Selecione...</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </Field>
          <Field label="Local">
            <select value={localId} onChange={(e) => { setLocalId(e.target.value); setEquipamentoId(''); }} disabled={!clienteId} className="input">
              <option value="">Selecione...</option>
              {availableLocations.map((l) => <option key={l.id} value={l.id}>{l.nome}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Equipamento (opcional para inspeções de local/ambiente — RN-026)">
          <select value={equipamentoId} onChange={(e) => setEquipamentoId(e.target.value)} disabled={!localId} className="input">
            <option value="">Nenhum equipamento específico</option>
            {availableEquipment.map((eq) => <option key={eq.id} value={eq.id}>{eq.nome}</option>)}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Técnico responsável">
            <select value={tecnicoId} onChange={(e) => setTecnicoId(e.target.value)} className="input">
              <option value="">Selecione...</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id} disabled={!t.ativo}>{t.nome}{!t.ativo ? ' (inativo)' : ''}</option>
              ))}
            </select>
          </Field>
          <Field label="Prioridade">
            <select value={prioridade} onChange={(e) => setPrioridade(e.target.value as Priority)} className="input">
              <option value="ALTA">Alta</option>
              <option value="MEDIA">Média</option>
              <option value="BAIXA">Baixa</option>
            </select>
          </Field>
        </div>

        <Field label="Data e hora previstas">
          <input type="datetime-local" value={dataPrevista} onChange={(e) => setDataPrevista(e.target.value)} className="input" />
        </Field>

        <Field label="Orientações adicionais">
          <textarea value={orientacoes} onChange={(e) => setOrientacoes(e.target.value)} rows={3} className="input" />
        </Field>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-xl px-4 py-3">{error}</div>}
        {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold rounded-xl px-4 py-3">{success}</div>}

        <button onClick={handleSubmit} className="w-full bg-brandgreen-600 text-white rounded-xl py-3 font-bold">
          Confirmar agendamento
        </button>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid #cbd5e1;
          border-radius: 0.5rem;
          padding: 0.55rem 0.75rem;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-bold text-navy-700 uppercase block mb-1">{label}</label>
      {children}
    </div>
  );
}
