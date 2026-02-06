# Contrato do payload do relatório (para o backend)

Este diretório contém a **estrutura formal** que o frontend espera do GET do relatório. Os dados que hoje vêm do JSON (`src/data/json_file_app_05-02.json`) virão do banco; o backend deve devolver **um objeto com a mesma estrutura**.

## Arquivos

| Arquivo               | Uso                                                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `ReportResponse.d.ts` | Tipos TypeScript (mínimo obrigatório + opcionais). O backend pode copiar para o repo ou usar como referência para validar/gerar o payload. |

## O que o frontend usa hoje

- **Serviço:** `src/services/surveyDataService.js` — `fetchSurveyData()` retorna o objeto **na raiz** (sem envelope `{ data: ... }`).
- **Hook:** `src/hooks/useSurveyData.js` — expõe `data` (objeto completo), `getSectionById(id)`, `resolvePath(path)`.
- **Convenção:** componentes com `dataPath` (ex.: `sectionData.recommendationsTable`) esperam o dado em `section.data.recommendationsTable`.

## Mínimo obrigatório

- **Raiz:** `metadata` (objeto) e `sections` (array).
- **Resto:** opcional; o frontend renderiza o que existir.

## Uso no backend

1. Copiar `ReportResponse.d.ts` para o repositório do backend (ex.: `types/ReportResponse.d.ts`).
2. Ao montar o payload a partir do banco, garantir que a resposta tenha pelo menos `metadata` e `sections`.
3. Se o backend for em TypeScript, usar `ReportResponse` como tipo de retorno do endpoint do relatório.
4. Se o backend for em outra linguagem, usar o `.d.ts` como referência para documentação (OpenAPI) ou para gerar um JSON Schema relaxado (apenas `metadata` + `sections` obrigatórios).

**Nota:** O schema `docs/docs_json_tutorial/validation_scripts/schema/surveyData.schema.json` existe no frontend mas é **mais rígido** (exige `uiTexts`, `surveyInfo` e campos em seções). O contrato correto para o GET é o definido em `ReportResponse.d.ts` e em `docs/INSTRUCOES_BACKEND_GET_RELATORIO_JSON.md`.
