/**
 * Contrato do payload do GET do relatório (frontend → backend).
 *
 * O frontend consome este objeto diretamente: o que hoje vem do JSON
 * (json_file_app_05-02.json) amanhã virá do GET (ex.: GET /api/surveys/:surveyId/report).
 * O backend deve retornar um objeto com a MESMA ESTRUTURA na raiz.
 *
 * Mínimo obrigatório: metadata + sections.
 * Todo o resto é opcional; o frontend renderiza o que existir.
 */

export interface ReportResponse {
  /** Obrigatório. */
  metadata: ReportMetadata;
  /** Obrigatório. Array pode ser vazio. */
  sections: ReportSection[];
  /** Opcional. Textos da UI (filtros, export, etc.). */
  uiTexts?: Record<string, unknown>;
  /** Opcional. Título, empresa, período, totais, NPS, etc. */
  surveyInfo?: SurveyInfo;
  /** Qualquer outra chave na raiz é permitida (flexível). */
  [key: string]: unknown;
}

export interface ReportMetadata {
  version?: string;
  language?: string;
  surveyId?: string;
  [key: string]: unknown;
}

export interface ReportSection {
  id?: string;
  index?: number;
  name?: string;
  icon?: string;
  /** Subseções com components; dados podem estar em section.data */
  subsections?: ReportSubsection[];
  /** Seção "por questão": array de questões (id, questionType, question, data, etc.) */
  questions?: ReportQuestion[];
  /** Dados da seção. Chaves devem bater com dataPath dos componentes (ex.: sectionData.recommendationsTable → data.recommendationsTable). */
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ReportSubsection {
  id?: string;
  index?: number;
  name?: string;
  icon?: string;
  components?: ReportComponent[];
  [key: string]: unknown;
}

export interface ReportComponent {
  /** Obrigatório para o frontend renderizar. Ex.: "card", "barChart", "recommendationsTable". */
  type: string;
  /** Quando o componente usa dados dinâmicos, aponta para section.data (ex.: "sectionData.recommendationsTable"). */
  dataPath?: string;
  index?: number;
  title?: string;
  text?: string;
  [key: string]: unknown;
}

export interface ReportQuestion {
  id?: number;
  question_id?: string;
  index?: number;
  question?: string;
  questionType?:
    | "nps"
    | "open-ended"
    | "multiple-choice"
    | "single-choice"
    | string;
  summary?: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface SurveyInfo {
  title?: string;
  company?: string;
  period?: string;
  totalRespondents?: number;
  responseRate?: number;
  questions?: number;
  nps?: number;
  npsCategory?: string;
  [key: string]: unknown;
}
