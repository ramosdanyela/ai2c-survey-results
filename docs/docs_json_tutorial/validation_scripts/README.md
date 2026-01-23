# 🔍 Validação de JSON - Estrutura Isolada

Esta pasta contém toda a estrutura de validação de JSONs de pesquisa. A validação é **isolada** e **não altera** o código de renderização.

## 📁 Estrutura

```
data/validation/
├── README.md                    # Este arquivo
├── schema/
│   └── surveyData.schema.json  # JSON Schema completo
├── scripts/
│   ├── validate-json.js        # Script principal de validação
│   └── validate-all-jsons.js   # Script para validar múltiplos arquivos
└── rules/
    └── custom-rules.js         # Regras customizadas de validação
```

## 🎯 Objetivo

Validar JSONs antes de testá-los no browser, garantindo que:

- ✅ A estrutura está correta
- ✅ Todos os `dataPath` apontam para dados válidos
- ✅ Todos os templates `{{path}}` referenciam caminhos existentes
- ✅ Componentes têm tipos válidos
- ✅ Arrays têm a estrutura esperada
- ✅ IDs são únicos
- ✅ Índices são sequenciais
- ✅ Questões têm tipos e dados válidos

## 🚀 Como Usar

### Validar um arquivo específico:

```bash
npm run validate:json src/data/surveyData.json
```

### Validar todos os JSONs:

```bash
npm run validate:all
```

### Validar um arquivo na pasta validation:

```bash
node data/validation/scripts/validate-json.js caminho/do/arquivo.json
```

## 📋 O que é Validado

### 1. Estrutura Básica

- Campos obrigatórios (`metadata`, `sections`, `uiTexts`, `surveyInfo`)
- Tipos de dados corretos
- Formatos válidos (ex: `language` deve ser `pt-BR`, `en-US`, etc.)

### 2. Seções e Subseções

- IDs únicos
- Índices sequenciais (começando em 0)
- **Estrutura atualizada:** `sections` diretamente no nível raiz (não `sectionsConfig.sections`)
- **Componentes diretamente em `subsections[].components`** (não há mais `renderSchema`)
- Subseções devem ter `id`, `index`, `name`, `icon`
- Dados ficam separados em `data` da seção

### 3. Componentes

- Tipos válidos (incluindo `card`, `barChart`, `sentimentStackedChart`, `container`, `grid-container`, `h3`, `h4`, etc.)
- `dataPath` deve apontar para dados que existem (quando necessário)
- Arrays esperados devem ser arrays
- Estrutura de dados correta para cada tipo
- Componentes estão diretamente em `subsections[].components` ou `components` na seção

### 4. Templates

- Templates `{{path}}` devem referenciar caminhos válidos
- Paths de `uiTexts` devem existir
- Paths de dados devem existir

### 5. Questões

- IDs únicos
- **Usar `questionType` (não `type`)** - tipos válidos: `nps`, `open-ended`, `multiple-choice`, `single-choice`
- Questões ficam diretamente em `questions` na seção `responses` (não em `data.questions`)
- Questões `nps` devem ter `data.npsScore`, `data.npsCategory` e `data.npsStackedChart`
- Questões `open-ended` devem ter pelo menos um de: `data.sentimentStackedChart`, `data.wordCloud`, ou `data.topCategoriesCards`
- Questões `multiple-choice`/`single-choice` devem ter `data.barChart` como array

### 6. Dados Específicos

- NPS deve estar entre -100 e 100
- Percentuais devem somar ~100% (com tolerância)
- Arrays não devem estar vazios quando esperados

## 🔧 Adicionar Novas Validações

Para adicionar novas regras de validação:

1. **Validação de estrutura**: Edite `schema/surveyData.schema.json`
2. **Validação customizada**: Edite `rules/custom-rules.js`

## 📝 Notas

- A validação é **não-destrutiva** - não altera o JSON
- A validação é **isolada** - não afeta o código de renderização
- Em produção, o JSON virá via API, mas a validação pode ser aplicada antes de usar os dados
- **Arquitetura do código:** Todos os componentes utilizam o hook `useSurveyData()` para acessar os dados. Não há imports diretos do JSON nos componentes - apenas no serviço `surveyDataService.js` que é usado pelo hook. Isso garante uma única fonte de verdade e facilita a migração para API real.

## ⚠️ Mudanças Importantes na Estrutura

A validação foi atualizada para refletir a estrutura atual do JSON:

1. **`sections` diretamente no nível raiz** (não mais `sectionsConfig.sections`)
2. **Componentes diretamente em `subsections[].components`** (não há mais `renderSchema`)
3. **Questões usam `questionType`** (não `type`) e ficam em `questions` diretamente na seção
4. **Dados separados em `data`** da seção (separados dos componentes)
5. **Novos componentes:** `container`, `grid-container`, `h3`, `h4` estão disponíveis

Consulte `Doc_how-to_json.md` para a documentação completa da estrutura atual.

## 🐛 Solução de Problemas

### Erro: "Cannot find package 'ajv'"

Se você receber um erro como:

```
Error: Cannot find package '...node_modules\ajv\dist\ajv.js'
```

**Solução:**

1. Certifique-se de que as dependências estão instaladas:

   ```bash
   npm install
   ```

2. Se o problema persistir, limpe e reinstale as dependências:

   **Windows:**

   ```bash
   rmdir /s /q node_modules
   del package-lock.json
   npm install
   ```

   **Linux/Mac:**

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Verifique se o `ajv` está listado em `devDependencies` no `package.json`

### Reportar Problemas

Se encontrar um JSON válido que está sendo rejeitado, ou um JSON inválido que está passando:

1. Verifique a mensagem de erro
2. Consulte `schema/surveyData.schema.json` para entender a regra
3. Consulte `rules/custom-rules.js` para validações customizadas
4. Ajuste o schema ou as regras conforme necessário
