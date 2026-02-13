/**
 * Referência de campos do JSON para a aba Campos do Json Reference.
 * Valores "encontrados no JSON" são injetados na página a partir dos extract* (extractSectionData, etc.).
 * Atualizar quando backend_api_specification ou ESTRUTURA_COMPONENTES_JSON mudar.
 */

export const metadataFields = [
  { name: "version", required: true, type: "string", desc: "Versão do schema (ex: 1.0)" },
  { name: "language", required: true, type: "string", desc: "Idioma (ex: pt-BR)" },
  { name: "surveyId", required: true, type: "string", desc: "ID único da pesquisa (ex: telmob)" },
];

export const componentFields = [
  { name: "type", required: true, type: "string", desc: "Tipo do componente (obrigatório). Deve ser um dos tipos aceitos pelo registry (aba Inventário ou Tabelas)." },
  { name: "index", required: false, type: "number", desc: "Ordem de renderização" },
  { name: "dataPath", required: false, type: "string", desc: "Caminho para os dados (ex: 'sectionData.data')" },
  { name: "config", required: false, type: "object", desc: "Configurações específicas do componente" },
  { name: "title", required: false, type: "string", desc: "Título do componente" },
  { name: "text", required: false, type: "string", desc: "Texto do componente (suporta \\n para quebras)" },
  { name: "cardStyleVariant", required: false, type: "string", desc: "Variante de estilo do card" },
  { name: "cardContentVariant", required: false, type: "string", desc: "Variante de estilo do conteúdo" },
  { name: "titleStyleVariant", required: false, type: "string", desc: "Variante de estilo do título" },
  { name: "useDescription", required: false, type: "boolean", desc: "Usar CardDescription ao invés de div" },
  { name: "components", required: false, type: "array", desc: "Componentes aninhados" },
];

export const sectionFields = [
  { name: "id", required: true, type: "string", desc: "Identificador único da seção", valuesKey: "ids" },
  { name: "index", required: false, type: "number", desc: "Ordem de exibição", valuesKey: "indexes" },
  { name: "name", required: false, type: "string", desc: "Nome exibido da seção", valuesKey: "names" },
  { name: "icon", required: false, type: "string", desc: "Nome do ícone (lucide-react)", valuesKey: "icons" },
  { name: "subsections", required: false, type: "array", desc: "Array de subseções (quando não há, use components na raiz da seção)" },
  { name: "components", required: false, type: "array", desc: "Array de componentes (quando a seção não tem subsections)" },
  { name: "questions", required: false, type: "array", desc: "Array de questões (seção de respostas); cada item: question_id, questionType, data" },
  { name: "data", required: false, type: "object", desc: "Dados específicos da seção" },
];

export const subsectionFields = [
  { name: "id", required: true, type: "string", desc: "Identificador único da subseção", valuesKey: "ids" },
  { name: "index", required: false, type: "number", desc: "Ordem de exibição", valuesKey: "indexes" },
  { name: "name", required: false, type: "string", desc: "Nome exibido da subseção", valuesKey: "names" },
  { name: "icon", required: false, type: "string", desc: "Nome do ícone (lucide-react)", valuesKey: "icons" },
  { name: "components", required: false, type: "array", desc: "Array de componentes" },
  { name: "data", required: false, type: "object", desc: "Dados específicos da subseção" },
];

export const questionFields = [
  { name: "question_id", required: false, type: "string", desc: "ID da questão (ex: question01)" },
  { name: "id", required: false, type: "string", desc: "Alias de question_id" },
  { name: "questionType", required: true, type: "string", desc: "Tipo: nps | multiple-choice | single-choice | open-ended | rating" },
  { name: "data", required: false, type: "object", desc: "Dados por questão; chaves conforme o template do questionType" },
];

export const surveyInfoFields = [
  { name: "title", required: false, type: "string", desc: "Título do relatório" },
  { name: "company", required: false, type: "string", desc: "Nome da empresa" },
  { name: "period", required: false, type: "string", desc: "Período da pesquisa" },
  { name: "totalRespondents", required: false, type: "number", desc: "Total de respondentes" },
  { name: "responseRate", required: false, type: "number", desc: "Taxa de resposta" },
  { name: "questions", required: false, type: "number", desc: "Quantidade de questões" },
];
