# E-mail oficial – Documentação disponível para o código

**Assunto:** Documentação do projeto AI2C Results (Survey Dashboard) – guias e referências disponíveis

---

Prezados,

Segue o envio oficial da documentação disponível para o código do **AI2C Results (Survey Dashboard)**. Abaixo estão listados os arquivos, uma breve descrição do conteúdo de cada um e informações sobre as páginas de referência e o recurso de validação de JSON.

---

## 1. Documentos disponíveis (arquivo + descrição)

| Arquivo | Descrição |
|--------|-----------|
| **docs/README.md** | Visão geral do projeto: início rápido, fluxo de dados, estrutura do repositório, rotas, tipos de componentes, scripts npm, validação, integração com API, tecnologias e índice da documentação adicional. |
| **docs/ESTRUTURA_COMPONENTES_JSON.md** | Estrutura de cada tipo de componente no JSON do relatório: campos comuns (`type`, `dataPath`, `config`), onde os componentes ficam no JSON, charts, cards, tabelas, widgets, containers, regras de `dataPath` e `uiTexts`. Inclui exemplos de estrutura e dados. |
| **docs/REFERENCIA_UITEXTS_JSON.md** | Referência completa das chaves de `uiTexts` usadas pelo frontend: árvore de chaves (responseDetails, filterPanel, common, surveySidebar, surveyHeader, tables, widgets), uso de cada chave e fallbacks em português/inglês. |
| **docs/MIGRACAO_MOCKS_PARA_API_REAL.md** | Passo a passo para trocar dados mock por APIs reais: alteração do `surveyDataService.js` e do `filterService.js`, variáveis de ambiente (`VITE_API_URL`, `VITE_SURVEY_DATA_ENDPOINT`, etc.), autenticação e tratamento de erros. |

---

## 2. Páginas de referência na aplicação (JSON Reference e JSON Viewer)

- **`/json-reference` (JsonReference)**  
  Página na aplicação que centraliza a **referência da estrutura do JSON**: tipos de componentes suportados, exemplos de configuração e **dataPaths** utilizados pelo código. Útil para consulta rápida ao montar ou revisar um relatório JSON.

- **`/json-viewer` (JsonViewer)**  
  Página para **visualização e inspeção do JSON** atualmente carregado (o mesmo que a aplicação usa para renderizar o relatório). Facilita debugar a estrutura e os dados em tempo de execução.

*(Com a aplicação rodando, acesse por exemplo: `http://localhost:5173/json-reference` e `http://localhost:5173/json-viewer`.)*

---

## 3. Validação de JSON (validation_scripts)

A pasta **`docs/validation_scripts/`** contém scripts que validam os JSONs de relatório para garantir que estejam alinhados ao que o código espera (evitando erros em runtime).

**Como usar**

- Validar **um único arquivo**:  
  `npm run validate:json <caminho-do-arquivo>`  
  Exemplo: `npm run validate:json src/data/surveyData.json`
- Validar **todos os JSONs** em `src/data/`:  
  `npm run validate` ou `npm run validate:all`

A validação combina **schema AJV** (tipos, propriedades obrigatórias, formatos) e **regras customizadas** (checagens de shape, dados obrigatórios em seções/respostas, coerência entre `type` e `dataPath`, etc.). Os erros são exibidos no terminal.

**Onde está o documento com todas as regras que o script valida**

- **Schema (estrutura e tipos):**  
  `docs/validation_scripts/schema/surveyData.schema.json`
- **Regras customizadas (lógica de negócio e convenções do código):**  
  `docs/validation_scripts/rules/custom-rules.js`  

O arquivo **`custom-rules.js`** é o documento de referência que concentra **todas as regras customizadas**: tipos de componentes e de questões válidos, IDs de seção esperados para questões (`responses` / `questions`), mapeamento entre `dataPath` e tipos de componente, validações de NPS, tabelas, sentiment e demais checagens aplicadas além do schema JSON.

---

## 4. Resumo

- **Documentação geral e índice:** `docs/README.md`
- **Estrutura de componentes no JSON:** `docs/ESTRUTURA_COMPONENTES_JSON.md`
- **Referência de uiTexts:** `docs/REFERENCIA_UITEXTS_JSON.md`
- **Migração mocks → API real:** `docs/MIGRACAO_MOCKS_PARA_API_REAL.md`
- **Referência na aplicação:** rotas `/json-reference` e `/json-viewer`
- **Validação:** scripts em `docs/validation_scripts/`; regras em `custom-rules.js` e schema em `surveyData.schema.json`

Em caso de dúvidas sobre algum documento ou sobre o uso dos scripts de validação, podemos alinhar em seguida.

Atenciosamente,

[Seu nome]
