'use client';

import { create } from 'zustand';
import type { Inspection, InspectionModel, ModelSection, ModelItem, Priority } from '@/types';
import {
  MOCK_CLIENTS,
  MOCK_EQUIPMENT,
  MOCK_INSPECTIONS,
  MOCK_LOCATIONS,
  MOCK_MODELS,
  MOCK_TECHNICIANS,
} from '@/data/mock-data';

interface AppState {
  clients: typeof MOCK_CLIENTS;
  locations: typeof MOCK_LOCATIONS;
  equipment: typeof MOCK_EQUIPMENT;
  technicians: typeof MOCK_TECHNICIANS;
  models: InspectionModel[];
  inspections: Inspection[];

  // --- modelos (UC-04, UC-05) ---
  createDraftModel: () => string;
  updateModelMeta: (modelId: string, patch: Partial<Pick<InspectionModel, 'title' | 'description' | 'category'>>) => void;
  addSection: (modelId: string) => void;
  removeSection: (modelId: string, sectionId: string) => void;
  updateSectionTitle: (modelId: string, sectionId: string, title: string) => void;
  addItem: (modelId: string, sectionId: string) => void;
  removeItem: (modelId: string, sectionId: string, itemId: string) => void;
  updateItem: (modelId: string, sectionId: string, itemId: string, patch: Partial<ModelItem>) => void;
  publishModel: (modelId: string) => { ok: true } | { ok: false; error: string };

  // --- agendamento (UC-06) ---
  scheduleInspection: (input: {
    modeloId: string;
    clienteId: string;
    localId: string;
    equipamentoId?: string;
    tecnicoId: string;
    prioridade: Priority;
    dataPrevista: string;
    orientacoes?: string;
  }) => { ok: true; id: string } | { ok: false; error: string };

  // --- revisão (UC-16, UC-17) ---
  startReview: (inspectionId: string) => void;
  approveInspection: (inspectionId: string, supervisorNome: string, comentario?: string) => void;
  rejectInspection: (inspectionId: string, supervisorNome: string, motivo: string) => { ok: true } | { ok: false; error: string };
}

function newId(prefix: string) {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export const useAppStore = create<AppState>((set, get) => ({
  clients: MOCK_CLIENTS,
  locations: MOCK_LOCATIONS,
  equipment: MOCK_EQUIPMENT,
  technicians: MOCK_TECHNICIANS,
  models: MOCK_MODELS,
  inspections: MOCK_INSPECTIONS,

  createDraftModel: () => {
    const id = newId('mod');
    const draft: InspectionModel = {
      id,
      title: 'Novo modelo de inspeção',
      description: '',
      category: 'Geral',
      status: 'RASCUNHO',
      version: 1,
      updatedAt: new Date().toISOString(),
      sections: [],
    };
    set((s) => ({ models: [draft, ...s.models] }));
    return id;
  },

  updateModelMeta: (modelId, patch) => {
    set((s) => ({
      models: s.models.map((m) => (m.id === modelId ? { ...m, ...patch, updatedAt: new Date().toISOString() } : m)),
    }));
  },

  addSection: (modelId) => {
    const section: ModelSection = { id: newId('sec'), title: 'Nova seção', items: [] };
    set((s) => ({
      models: s.models.map((m) => (m.id === modelId ? { ...m, sections: [...m.sections, section] } : m)),
    }));
  },

  removeSection: (modelId, sectionId) => {
    set((s) => ({
      models: s.models.map((m) =>
        m.id === modelId ? { ...m, sections: m.sections.filter((sec) => sec.id !== sectionId) } : m
      ),
    }));
  },

  updateSectionTitle: (modelId, sectionId, title) => {
    set((s) => ({
      models: s.models.map((m) =>
        m.id === modelId
          ? { ...m, sections: m.sections.map((sec) => (sec.id === sectionId ? { ...sec, title } : sec)) }
          : m
      ),
    }));
  },

  addItem: (modelId, sectionId) => {
    const item: ModelItem = {
      id: newId('item'),
      title: 'Novo item',
      type: 'CONFORMITY',
      required: false,
      needsEvidenceOnNok: false,
    };
    set((s) => ({
      models: s.models.map((m) =>
        m.id === modelId
          ? {
              ...m,
              sections: m.sections.map((sec) => (sec.id === sectionId ? { ...sec, items: [...sec.items, item] } : sec)),
            }
          : m
      ),
    }));
  },

  removeItem: (modelId, sectionId, itemId) => {
    set((s) => ({
      models: s.models.map((m) =>
        m.id === modelId
          ? {
              ...m,
              sections: m.sections.map((sec) =>
                sec.id === sectionId ? { ...sec, items: sec.items.filter((it) => it.id !== itemId) } : sec
              ),
            }
          : m
      ),
    }));
  },

  updateItem: (modelId, sectionId, itemId, patch) => {
    set((s) => ({
      models: s.models.map((m) =>
        m.id === modelId
          ? {
              ...m,
              sections: m.sections.map((sec) =>
                sec.id === sectionId
                  ? { ...sec, items: sec.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)) }
                  : sec
              ),
            }
          : m
      ),
    }));
  },

  // RN-015/016: precisa de título, categoria e ao menos uma seção com item válido.
  // RN-020: publicar um modelo já publicado gera uma nova versão, preservando a anterior.
  publishModel: (modelId) => {
    const model = get().models.find((m) => m.id === modelId);
    if (!model) return { ok: false, error: 'Modelo não encontrado.' };
    if (!model.title.trim()) return { ok: false, error: 'Informe um título para o modelo.' };
    if (model.sections.length === 0) return { ok: false, error: 'Adicione ao menos uma seção com itens (RN-015).' };
    const hasItem = model.sections.some((sec) => sec.items.length > 0);
    if (!hasItem) return { ok: false, error: 'Adicione ao menos um item válido antes de publicar (RN-015).' };
    const missingType = model.sections.some((sec) => sec.items.some((it) => !it.type));
    if (missingType) return { ok: false, error: 'Todo item precisa de um tipo de resposta (RN-016).' };

    set((s) => ({
      models: s.models.map((m) =>
        m.id === modelId
          ? { ...m, status: 'PUBLICADO', version: m.status === 'PUBLICADO' ? m.version + 1 : m.version, updatedAt: new Date().toISOString() }
          : m
      ),
    }));
    return { ok: true };
  },

  // RN-024/025/027: inspeção precisa de versão publicada, dados básicos e técnico ativo.
  scheduleInspection: (input) => {
    const model = get().models.find((m) => m.id === input.modeloId);
    if (!model || model.status !== 'PUBLICADO') {
      return { ok: false, error: 'Selecione um modelo com versão publicada (RN-024).' };
    }
    const tech = get().technicians.find((t) => t.id === input.tecnicoId);
    if (!tech || !tech.ativo) {
      return { ok: false, error: 'Somente técnicos ativos podem receber uma nova atribuição (RN-027).' };
    }
    if (!input.clienteId || !input.localId || !input.dataPrevista) {
      return { ok: false, error: 'Cliente, local e data prevista são obrigatórios (RN-025).' };
    }

    const id = newId('INS');
    const inspection: Inspection = {
      id,
      clienteId: input.clienteId,
      localId: input.localId,
      equipamentoId: input.equipamentoId,
      modeloId: input.modeloId,
      modeloVersao: model.version,
      tecnicoId: input.tecnicoId,
      prioridade: input.prioridade,
      dataPrevista: input.dataPrevista,
      orientacoes: input.orientacoes,
      status: 'ATRIBUIDA',
      answers: {},
      nonConformities: {},
    };
    set((s) => ({ inspections: [inspection, ...s.inspections] }));
    return { ok: true, id };
  },

  startReview: (inspectionId) => {
    set((s) => ({
      inspections: s.inspections.map((i) => (i.id === inspectionId && i.status === 'ENVIADA' ? { ...i, status: 'EM_REVISAO' } : i)),
    }));
  },

  approveInspection: (inspectionId, supervisorNome, comentario) => {
    set((s) => ({
      inspections: s.inspections.map((i) =>
        i.id === inspectionId
          ? { ...i, status: 'APROVADA', review: { supervisorNome, comentario, decidedAt: new Date().toISOString() } }
          : i
      ),
    }));
  },

  // RN-080: reprovação deve possuir motivo obrigatório.
  rejectInspection: (inspectionId, supervisorNome, motivo) => {
    if (!motivo.trim()) return { ok: false, error: 'Informe o motivo da reprovação (RN-080).' };
    set((s) => ({
      inspections: s.inspections.map((i) =>
        i.id === inspectionId
          ? {
              ...i,
              status: 'REPROVADA',
              review: { supervisorNome, motivoReprovacao: motivo, decidedAt: new Date().toISOString() },
            }
          : i
      ),
    }));
    return { ok: true };
  },
}));
