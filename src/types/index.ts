/**
 * Tipos de domínio do painel administrativo/supervisor do FieldCore.
 * Derivados de 06 - Casos de Uso, 08 - Funcionalidades, 09 - Regras de Negócio.
 */

export type Priority = 'ALTA' | 'MEDIA' | 'BAIXA';

export type InspectionStatus =
  | 'RASCUNHO'
  | 'ATRIBUIDA'
  | 'EM_ANDAMENTO'
  | 'ENVIADA'
  | 'EM_REVISAO'
  | 'APROVADA'
  | 'REPROVADA'
  | 'CANCELADA';

export type ModelStatus = 'RASCUNHO' | 'PUBLICADO';

export type ItemType =
  | 'TEXT_SHORT'
  | 'TEXT_LONG'
  | 'NUMBER'
  | 'BOOLEAN'
  | 'CONFORMITY'
  | 'SINGLE_CHOICE'
  | 'DATE';

export interface ModelItem {
  id: string;
  title: string;
  type: ItemType;
  required: boolean;
  /** RN-039: item crítico — exige evidência quando não conforme. */
  needsEvidenceOnNok: boolean;
  /** Alternativas disponíveis quando type === 'SINGLE_CHOICE'. */
  options?: string[];
}

export interface ModelSection {
  id: string;
  title: string;
  items: ModelItem[];
}

export interface InspectionModel {
  id: string;
  title: string;
  description: string;
  category: string;
  status: ModelStatus;
  /** RN-020: alterações em um modelo publicado geram nova versão. */
  version: number;
  sections: ModelSection[];
  updatedAt: string;
}

export interface Client {
  id: string;
  nome: string;
}

export interface Location {
  id: string;
  clienteId: string;
  nome: string;
  endereco?: string;
  lat?: number;
  lng?: number;
}

export interface Equipment {
  id: string;
  localId: string;
  nome: string;
  qrCode: string;
  ativo: boolean;
}

export interface Technician {
  id: string;
  nome: string;
  ativo: boolean;
}

export type ConformityAnswer = 'CONFORME' | 'NAO_CONFORME' | 'NAO_APLICAVEL';

export interface Answer {
  itemId: string;
  conformity?: ConformityAnswer;
  value?: string;
  observacao?: string;
  evidenceCount: number;
  /** Fotos de evidência (data URLs) anexadas pelo técnico. */
  photos?: string[];
}

export function isAnswerFilled(answer: Answer | undefined): boolean {
  if (!answer) return false;
  return Boolean(answer.conformity || (answer.value && answer.value.trim().length > 0));
}

export type Criticidade = 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export interface NonConformity {
  id: string;
  itemId?: string;
  titulo: string;
  descricao: string;
  criticidade: Criticidade;
  evidenceCount: number;
  /** Fotos de evidência (data URLs) anexadas para a não conformidade. */
  photos?: string[];
}

export interface Geolocalizacao {
  lat: number;
  lng: number;
  capturedAt: string;
}

export interface SyncQueueItem {
  id: string;
  inspectionId: string;
  descricao: string;
  createdAt: string;
}

export interface ReviewInfo {
  supervisorNome: string;
  comentario?: string;
  motivoReprovacao?: string;
  decidedAt?: string;
}

export interface Inspection {
  id: string;
  clienteId: string;
  localId: string;
  equipamentoId?: string;
  modeloId: string;
  modeloVersao: number;
  tecnicoId: string;
  prioridade: Priority;
  dataPrevista: string;
  orientacoes?: string;
  status: InspectionStatus;
  answers: Record<string, Answer>;
  nonConformities: Record<string, NonConformity>;
  review?: ReviewInfo;
  geolocalizacao?: Geolocalizacao;
  /** Data/hora em que o QR Code do equipamento foi escaneado e confirmado. */
  qrConfirmadoEm?: string;
}
