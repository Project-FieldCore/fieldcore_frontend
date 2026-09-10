'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/store/app-store';
import { InspectionStatusBadge, PriorityTag } from '@/components/Badges';
import { QrScanner } from '@/components/QrScanner';
import type { ConformityAnswer, Criticidade, ModelItem } from '@/types';

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const CONFORMITY_OPTIONS: { value: ConformityAnswer; label: string; activeClass: string }[] = [
  { value: 'CONFORME', label: 'Conforme', activeClass: 'bg-emerald-600 border-emerald-600 text-white' },
  { value: 'NAO_CONFORME', label: 'Não conforme', activeClass: 'bg-red-600 border-red-600 text-white' },
  { value: 'NAO_APLICAVEL', label: 'Não aplicável', activeClass: 'bg-slate-500 border-slate-500 text-white' },
];

const CRITICIDADE_OPTIONS: Criticidade[] = ['BAIXA', 'MEDIA', 'ALTA', 'CRITICA'];

function readFilesAsDataUrls(files: FileList): Promise<string[]> {
  return Promise.all(
    Array.from(files).map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    )
  );
}

function PhotoEvidence({
  photos,
  disabled,
  onAdd,
  onRemove,
  label,
}: {
  photos: string[];
  disabled: boolean;
  onAdd: (dataUrls: string[]) => void;
  onRemove: (index: number) => void;
  label: string;
}) {
  const inputId = `photo-${Math.random().toString(36).slice(2)}`;
  return (
    <div className="mt-2">
      <label
        htmlFor={disabled ? undefined : inputId}
        className={`inline-flex items-center gap-1.5 text-xs font-bold ${
          disabled ? 'text-slate-300 cursor-not-allowed' : 'text-navy-700 cursor-pointer hover:underline'
        }`}
      >
        📷 {label} ({photos.length})
      </label>
      {!disabled && (
        <input
          id={inputId}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          disabled={disabled}
          className="hidden"
          onChange={async (e) => {
            if (!e.target.files || e.target.files.length === 0) return;
            const dataUrls = await readFilesAsDataUrls(e.target.files);
            onAdd(dataUrls);
            e.target.value = '';
          }}
        />
      )}
      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {photos.map((src, idx) => (
            <div key={idx} className="relative w-14 h-14 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Evidência ${idx + 1}`} className="w-14 h-14 object-cover rounded-lg border border-slate-200" />
              {!disabled && (
                <button
                  onClick={() => onRemove(idx)}
                  aria-label="Remover foto"
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-navy-900 text-white text-[10px] leading-4 font-bold"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
  const users = useAppStore((s) => s.users);
  const saveAnswer = useAppStore((s) => s.saveAnswer);
  const saveNonConformity = useAppStore((s) => s.saveNonConformity);
  const submitInspection = useAppStore((s) => s.submitInspection);
  const saveGeolocation = useAppStore((s) => s.saveGeolocation);
  const confirmEquipmentQr = useAppStore((s) => s.confirmEquipmentQr);
  const syncQueue = useAppStore((s) => s.syncQueue);
  const lastSyncAt = useAppStore((s) => s.lastSyncAt);
  const syncing = useAppStore((s) => s.syncing);
  const syncNow = useAppStore((s) => s.syncNow);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);

  if (!inspection) return <div className="text-slate-500">Inspeção não encontrada.</div>;

  const model = models.find((m) => m.id === inspection.modeloId);
  const client = clients.find((c) => c.id === inspection.clienteId);
  const location = locations.find((l) => l.id === inspection.localId);
  const equip = equipment.find((e) => e.id === inspection.equipamentoId);
  const tech = users.find((u) => u.id === inspection.tecnicoId);

  const editable = inspection.status === 'ATRIBUIDA' || inspection.status === 'EM_ANDAMENTO' || inspection.status === 'DEVOLVIDA';
  const latestCorrection = inspection.correcoes?.[inspection.correcoes.length - 1];

  function handleSubmit() {
    const result = submitInspection(inspection!.id);
    if (!result.ok) { setSubmitError(result.error); return; }
    setSubmitError(null);
    router.push('/inspections');
  }

  function handleCaptureLocation() {
    if (!navigator.geolocation) {
      setGeoError('Geolocalização não é suportada neste dispositivo/navegador.');
      return;
    }
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        saveGeolocation(inspection!.id, { lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      (err) => {
        setGeoError(err.message || 'Não foi possível obter a localização.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function handleQrScanned(data: string) {
    const result = confirmEquipmentQr(inspection!.id, data);
    setShowScanner(false);
    setQrError(result.ok ? null : result.error);
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

    if (item.type === 'SINGLE_CHOICE') {
      const options = item.options ?? [];
      return (
        <div className="flex flex-wrap gap-2 mt-2">
          {options.length === 0 && <span className="text-xs text-slate-400">Nenhuma alternativa cadastrada para este item.</span>}
          {options.map((opt) => (
            <button
              key={opt}
              disabled={!editable}
              onClick={() => saveAnswer(inspection!.id, item.id, { value: opt })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border disabled:opacity-60 ${
                answer?.value === opt ? 'bg-navy-800 border-navy-800 text-white' : 'bg-white border-slate-300 text-slate-600'
              }`}
            >
              {opt}
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
    const ncPhotos = nc?.photos ?? [];

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
        <select
          disabled={!editable}
          value={nc?.criticidade ?? 'MEDIA'}
          onChange={(e) => saveNonConformity(inspection!.id, item.id, { criticidade: e.target.value as Criticidade })}
          className="border border-red-200 rounded-lg px-2.5 py-1.5 text-xs mb-2"
        >
          {CRITICIDADE_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <PhotoEvidence
          label="Anexar evidência"
          photos={ncPhotos}
          disabled={!editable}
          onAdd={(dataUrls) =>
            saveNonConformity(inspection!.id, item.id, { photos: [...ncPhotos, ...dataUrls], evidenceCount: ncPhotos.length + dataUrls.length })
          }
          onRemove={(idx) => {
            const next = ncPhotos.filter((_, i) => i !== idx);
            saveNonConformity(inspection!.id, item.id, { photos: next, evidenceCount: next.length });
          }}
        />
      </div>
    );
  }

  const pendingForThisInspection = syncQueue.filter((q) => q.inspectionId === inspection.id).length;
  const distanceKm =
    inspection.geolocalizacao && location?.lat != null && location?.lng != null
      ? haversineKm(inspection.geolocalizacao, { lat: location.lat, lng: location.lng })
      : null;
  const mapsHref = location?.lat != null && location?.lng != null
    ? `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`
    : null;

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => router.push('/inspections')} className="text-sm font-semibold text-slate-500 mb-4">← Voltar às inspeções</button>

      <div className={`flex items-center justify-between gap-3 flex-wrap rounded-xl px-4 py-2.5 mb-4 text-xs font-semibold ${
        pendingForThisInspection > 0 ? 'bg-amber-50 border border-amber-200 text-amber-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
      }`}>
        <span>
          {pendingForThisInspection > 0
            ? `${pendingForThisInspection} alteraç${pendingForThisInspection === 1 ? 'ão' : 'ões'} pendente${pendingForThisInspection === 1 ? '' : 's'} de sincronização`
            : lastSyncAt
            ? `Tudo sincronizado · última vez em ${new Date(lastSyncAt).toLocaleTimeString('pt-BR')}`
            : 'Nenhuma alteração pendente'}
        </span>
        {pendingForThisInspection > 0 && (
          <button
            onClick={() => syncNow()}
            disabled={syncing}
            className="bg-white border border-amber-300 rounded-lg px-2.5 py-1 font-bold disabled:opacity-60"
          >
            {syncing ? 'Sincronizando...' : 'Sincronizar agora'}
          </button>
        )}
      </div>

      <div className="flex items-start justify-between gap-3 flex-wrap mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900">{client?.nome}</h1>
          <p className="text-sm text-slate-500">{location?.nome}{equip ? ` · ${equip.nome}` : ''}</p>
        </div>
        <InspectionStatusBadge status={inspection.status} />
      </div>

      {inspection.status === 'DEVOLVIDA' && latestCorrection && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-5">
          <h2 className="text-xs font-bold text-orange-700 uppercase mb-2">Devolvida pelo gestor para correção</h2>
          <p className="text-sm text-orange-800">{latestCorrection.comentario}</p>
          <p className="text-xs text-orange-500 mt-1.5">
            {latestCorrection.supervisorNome} · {new Date(latestCorrection.createdAt).toLocaleString('pt-BR')}
          </p>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div><span className="text-slate-400 text-xs uppercase font-bold block mb-1">Técnico</span>{tech?.nome}</div>
        <div><span className="text-slate-400 text-xs uppercase font-bold block mb-1">Prioridade</span><PriorityTag priority={inspection.prioridade} /></div>
        <div><span className="text-slate-400 text-xs uppercase font-bold block mb-1">Modelo</span>{model?.title} · v{inspection.modeloVersao}</div>
        <div><span className="text-slate-400 text-xs uppercase font-bold block mb-1">Data prevista</span>{new Date(inspection.dataPrevista).toLocaleString('pt-BR')}</div>
        {inspection.orientacoes && (
          <div className="sm:col-span-2"><span className="text-slate-400 text-xs uppercase font-bold block mb-1">Orientações</span>{inspection.orientacoes}</div>
        )}
      </div>

      {equip && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-5">
          <h2 className="font-bold text-navy-900 mb-3">Equipamento</h2>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="text-sm font-semibold text-navy-900">{equip.nome}</div>
              <div className="text-xs text-slate-400 font-mono">{equip.qrCode}</div>
            </div>
            {inspection.qrConfirmadoEm ? (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5">
                ✓ Confirmado em {new Date(inspection.qrConfirmadoEm).toLocaleTimeString('pt-BR')}
              </span>
            ) : (
              editable && (
                <button
                  onClick={() => { setQrError(null); setShowScanner(true); }}
                  className="bg-navy-800 text-white rounded-lg px-3 py-1.5 text-xs font-bold"
                >
                  📷 Escanear QR Code
                </button>
              )
            )}
          </div>
          {qrError && <div className="text-xs text-red-600 font-semibold mt-2.5">{qrError}</div>}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-5">
        <h2 className="font-bold text-navy-900 mb-3">Localização da inspeção</h2>
        {location?.endereco && <p className="text-sm text-slate-600 mb-1">{location.endereco}</p>}
        {location?.lat != null && location?.lng != null && (
          <p className="text-xs text-slate-400 font-mono mb-3">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
        )}
        {mapsHref && (
          <a href={mapsHref} target="_blank" rel="noreferrer" className="inline-block text-xs font-bold text-navy-700 underline mb-3">
            🗺️ Abrir rota no Google Maps
          </a>
        )}

        <div className="border-t border-slate-100 pt-3 mt-1">
          <div className="text-xs font-bold text-navy-700 uppercase mb-1.5">Sua posição atual</div>
          {inspection.geolocalizacao ? (
            <div className="text-sm text-slate-600 mb-1">
              <span className="font-mono">{inspection.geolocalizacao.lat.toFixed(6)}, {inspection.geolocalizacao.lng.toFixed(6)}</span>
              <span className="text-xs text-slate-400 ml-2">capturada em {new Date(inspection.geolocalizacao.capturedAt).toLocaleString('pt-BR')}</span>
            </div>
          ) : (
            <p className="text-sm text-slate-400 mb-1">Nenhuma localização capturada ainda.</p>
          )}
          {distanceKm != null && (
            <p className="text-xs text-slate-500 mb-2">Você está a aproximadamente {distanceKm.toFixed(1)} km do local da inspeção.</p>
          )}
        </div>

        {editable && (
          <button
            onClick={handleCaptureLocation}
            disabled={locating}
            className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-navy-800 disabled:opacity-60"
          >
            📍 {locating ? 'Capturando...' : inspection.geolocalizacao ? 'Capturar novamente' : 'Capturar localização atual'}
          </button>
        )}
        {geoError && <div className="text-xs text-red-600 font-semibold mt-2">{geoError}</div>}
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
              const answerPhotos = answer?.photos ?? [];
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
                  <PhotoEvidence
                    label="Anexar foto"
                    photos={answerPhotos}
                    disabled={!editable}
                    onAdd={(dataUrls) =>
                      saveAnswer(inspection.id, item.id, { photos: [...answerPhotos, ...dataUrls], evidenceCount: answerPhotos.length + dataUrls.length })
                    }
                    onRemove={(idx) => {
                      const next = answerPhotos.filter((_, i) => i !== idx);
                      saveAnswer(inspection.id, item.id, { photos: next, evidenceCount: next.length });
                    }}
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

      {showScanner && <QrScanner onScan={handleQrScanned} onClose={() => setShowScanner(false)} />}
    </div>
  );
}
