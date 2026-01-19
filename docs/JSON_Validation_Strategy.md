# 🔍 Estratégia de Validação de JSON

## 📋 Visão Geral

Este documento descreve as melhores formas de validar os arquivos JSON de pesquisa antes de testá-los no browser, garantindo que a estrutura esteja correta e identificando erros de forma clara.

---

## 🎯 Objetivos

1. **Validar estrutura** - Verificar se o JSON segue o formato esperado
2. **Identificar erros** - Mostrar exatamente onde está o problema
3. **Prevenir quebras** - Evitar que o código quebre no browser
4. **Facilitar debugging** - Fornecer mensagens de erro claras e acionáveis

---

## 🛠️ Opções de Validação

### Opção 1: JSON Schema + Script Node.js (Recomendado)

**Vantagens:**

- ✅ Validação completa da estrutura
- ✅ Mensagens de erro detalhadas
- ✅ Pode ser executado localmente e no CI/CD
- ✅ Padrão da indústria (JSON Schema)
- ✅ Validação de tipos, campos obrigatórios, enums, etc.

**Desvantagens:**

- ⚠️ Requer criar e manter o schema
- ⚠️ Pode ser verboso para estruturas complexas

**Implementação:**

1. **Criar o JSON Schema** (`schemas/surveyData.schema.json`)
2. **Criar script de validação** (`scripts/validate-json.js`)
3. **Adicionar ao package.json** como script npm

---

### Opção 2: Validação Customizada com Node.js

**Vantagens:**

- ✅ Controle total sobre as regras
- ✅ Mensagens de erro personalizadas
- ✅ Pode validar lógica de negócio (ex: IDs únicos, índices sequenciais)

**Desvantagens:**

- ⚠️ Mais código para manter
- ⚠️ Pode ser mais lento que JSON Schema

**Implementação:**

Criar um script que percorre o JSON e valida manualmente cada parte.

---

### Opção 3: Validação no Runtime (Código React)

**Vantagens:**

- ✅ Validação automática quando o JSON é carregado
- ✅ Feedback imediato no browser

**Desvantagens:**

- ⚠️ Usuário só descobre o erro no browser
- ⚠️ Pode impactar performance
- ⚠️ Mensagens de erro podem ser menos claras

**Implementação:**

Adicionar validação no hook `useSurveyData` ou no serviço `surveyDataService.js` que carrega o JSON.

**Nota:** O código já utiliza o hook `useSurveyData()` em todos os componentes. A validação pode ser adicionada no serviço antes de retornar os dados, ou no hook após receber os dados da API.

---

### Opção 4: Validação em CI/CD (GitHub Actions, etc.)

**Vantagens:**

- ✅ Validação automática em cada commit/PR
- ✅ Previne código quebrado no repositório
- ✅ Feedback antes do merge

**Desvantagens:**

- ⚠️ Requer configuração do CI/CD
- ⚠️ Não ajuda durante desenvolvimento local

**Implementação:**

Adicionar step no workflow que executa o script de validação.

---

## 🚀 Implementação Recomendada: JSON Schema + Script

### Passo 1: Instalar Dependências

```bash
npm install --save-dev ajv ajv-formats
```

- `ajv`: Validador JSON Schema
- `ajv-formats`: Validação de formatos (email, date, etc.)

### Passo 2: Criar JSON Schema

Criar `data/validation/schema/surveyData.schema.json` com a estrutura esperada:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["metadata", "sectionsConfig", "uiTexts", "surveyInfo"],
  "properties": {
    "metadata": {
      "type": "object",
      "required": ["version", "language", "surveyId"],
      "properties": {
        "version": { "type": "string" },
        "language": { "type": "string", "pattern": "^[a-z]{2}-[A-Z]{2}$" },
        "surveyId": { "type": "string" }
      }
    },
    "sectionsConfig": {
      "type": "object",
      "required": ["sections"],
      "properties": {
        "sections": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["id", "index", "name", "icon", "hasSchema"],
            "properties": {
              "id": { "type": "string" },
              "index": { "type": "number" },
              "name": { "type": "string" },
              "icon": { "type": "string" },
              "hasSchema": { "type": "boolean" },
              "subsections": {
                "type": "array",
                "items": {
                  "type": "object",
                  "required": ["id", "index", "name", "icon"]
                }
              }
            }
          }
        }
      }
    }
  }
}
```

**Nota:** O schema completo será extenso. Considere criar schemas parciais e combiná-los.

### Passo 3: Criar Script de Validação

Criar `data/validation/scripts/validate-json.js`:

```javascript
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const fs = require("fs");
const path = require("path");

// Carregar schema
const schemaPath = path.join(__dirname, "../schemas/surveyData.schema.json");
const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));

// Criar validador
const ajv = new Ajv({ allErrors: true, verbose: true });
addFormats(ajv);

// Função para validar arquivo
function validateJSON(filePath) {
  console.log(`\n🔍 Validando: ${filePath}\n`);

  // Ler e parsear JSON
  let data;
  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    data = JSON.parse(fileContent);
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error("❌ ERRO DE SINTAXE JSON:");
      console.error(`   ${error.message}`);
      console.error(
        `   Linha aproximada: ${
          error.message.match(/position (\d+)/)?.[1] || "N/A"
        }`
      );
      return false;
    }
    throw error;
  }

  // Validar contra schema
  const validate = ajv.compile(schema);
  const valid = validate(data);

  if (!valid) {
    console.error("❌ ERROS DE VALIDAÇÃO:\n");
    validate.errors.forEach((error, index) => {
      console.error(`${index + 1}. ${error.instancePath || "/"}`);
      console.error(`   ${error.message}`);
      if (error.params) {
        console.error(`   Parâmetros: ${JSON.stringify(error.params)}`);
      }
      console.error("");
    });
    return false;
  }

  // Validações customizadas adicionais
  const customErrors = validateCustomRules(data);
  if (customErrors.length > 0) {
    console.error("❌ ERROS DE REGRAS CUSTOMIZADAS:\n");
    customErrors.forEach((error, index) => {
      console.error(`${index + 1}. ${error.path}`);
      console.error(`   ${error.message}\n`);
    });
    return false;
  }

  console.log("✅ JSON válido!\n");
  return true;
}

// Validações customizadas (lógica de negócio)
function validateCustomRules(data) {
  const errors = [];

  // Validar IDs únicos de seções
  const sectionIds = data.sectionsConfig?.sections?.map((s) => s.id) || [];
  const duplicateSectionIds = sectionIds.filter(
    (id, index) => sectionIds.indexOf(id) !== index
  );
  if (duplicateSectionIds.length > 0) {
    errors.push({
      path: "/sectionsConfig/sections",
      message: `IDs de seções duplicados: ${duplicateSectionIds.join(", ")}`,
    });
  }

  // Validar índices sequenciais
  const sectionIndices =
    data.sectionsConfig?.sections?.map((s) => s.index) || [];
  const sortedIndices = [...sectionIndices].sort((a, b) => a - b);
  for (let i = 0; i < sortedIndices.length; i++) {
    if (sortedIndices[i] !== i) {
      errors.push({
        path: "/sectionsConfig/sections",
        message: `Índices de seções devem começar em 0 e ser sequenciais. Encontrado: ${sectionIndices.join(
          ", "
        )}`,
      });
      break;
    }
  }

  // Validar que seções com hasSchema: true têm data
  data.sectionsConfig?.sections?.forEach((section, index) => {
    if (section.hasSchema && !section.data) {
      errors.push({
        path: `/sectionsConfig/sections[${index}]`,
        message: `Seção "${section.name}" tem hasSchema: true mas não possui propriedade "data"`,
      });
    }
  });

  // Validar que templates {{}} referenciam caminhos válidos
  // (Esta validação pode ser complexa, implementar conforme necessário)

  return errors;
}

// Executar validação
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Uso: node scripts/validate-json.js <caminho-do-json>");
  process.exit(1);
}

const filePath = path.resolve(args[0]);
if (!fs.existsSync(filePath)) {
  console.error(`❌ Arquivo não encontrado: ${filePath}`);
  process.exit(1);
}

const isValid = validateJSON(filePath);
process.exit(isValid ? 0 : 1);
```

### Passo 4: Adicionar ao package.json

```json
{
  "scripts": {
    "validate:json": "node data/validation/scripts/validate-json.js",
    "validate:all": "node data/validation/scripts/validate-all-jsons.js"
  }
}
```

**Nota:** A estrutura de validação está **isolada** em `data/validation/` para não interferir com o código de renderização.

### Passo 5: Criar Script para Validar Múltiplos Arquivos

Criar `data/validation/scripts/validate-all-jsons.js`:

```javascript
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const dataDir = path.join(__dirname, "../src/data");
const files = fs
  .readdirSync(dataDir)
  .filter((file) => file.endsWith(".json") && file.startsWith("surveyData"));

console.log(`📁 Encontrados ${files.length} arquivo(s) JSON para validar\n`);

let allValid = true;

files.forEach((file) => {
  const filePath = path.join(dataDir, file);
  try {
    execSync(`node scripts/validate-json.js "${filePath}"`, {
      stdio: "inherit",
    });
  } catch (error) {
    allValid = false;
  }
});

if (!allValid) {
  console.error("\n❌ Alguns arquivos JSON são inválidos");
  process.exit(1);
}

console.log("\n✅ Todos os arquivos JSON são válidos!");
```

---

## 🔧 Validações Customizadas Recomendadas

Além da validação de estrutura, considere validar:

### 1. IDs Únicos

- IDs de seções devem ser únicos
- IDs de subseções devem ser únicos dentro da seção
- IDs de questões devem ser únicos

### 2. Índices Sequenciais

- Índices de seções devem começar em 0 e ser sequenciais
- Índices de subseções devem começar em 0 dentro de cada seção

### 3. Referências Válidas

- `dataPath` deve apontar para caminhos que existem
- Templates `{{path}}` devem referenciar caminhos válidos
- `icon` deve ser um ícone válido do Lucide React

### 4. Tipos de Questão

- Questões do tipo `nps` devem ter `data` com opções "Detrator", "Promotor", "Neutro"
- Questões do tipo `open` devem ter `sentimentData` ou `wordCloud`
- Questões do tipo `closed` devem ter `data` com opções

### 5. Estrutura de Dados

- Arrays não devem estar vazios quando esperados
- Percentuais devem somar ~100% (com tolerância)
- Valores numéricos devem estar em ranges válidos

---

## 📝 Exemplo de Uso

### Validar um arquivo específico:

```bash
npm run validate:json src/data/surveyData.json
```

### Validar todos os JSONs:

```bash
npm run validate:all
```

### Saída de exemplo:

```
🔍 Validando: src/data/surveyData.json

❌ ERROS DE VALIDAÇÃO:

1. /sectionsConfig/sections[0]/subsections[0]
   required property "name" is missing

2. /sectionsConfig/sections[1]/data/renderSchema
   should have required property "subsections"

3. /surveyInfo/nps
   should be <= 100 (current value: 150)
```

---

## 🔄 Integração com CI/CD

### GitHub Actions

Criar `.github/workflows/validate-json.yml`:

```yaml
name: Validate JSON

on:
  pull_request:
    paths:
      - "src/data/**/*.json"
  push:
    paths:
      - "src/data/**/*.json"

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm ci
      - run: npm run validate:all
```

---

## 🎨 Melhorias Futuras

### 1. Validação de Templates

Criar função que valida se todos os templates `{{path}}` referenciam caminhos válidos:

```javascript
function validateTemplates(data, path = "") {
  const errors = [];

  if (typeof data === "string") {
    const templates = data.match(/\{\{([^}]+)\}\}/g);
    if (templates) {
      templates.forEach((template) => {
        const templatePath = template.slice(2, -2);
        if (!isValidPath(data, templatePath)) {
          errors.push({
            path,
            message: `Template inválido: ${template}. Caminho não existe.`,
          });
        }
      });
    }
  } else if (Array.isArray(data)) {
    data.forEach((item, index) => {
      errors.push(...validateTemplates(item, `${path}[${index}]`));
    });
  } else if (typeof data === "object" && data !== null) {
    Object.keys(data).forEach((key) => {
      errors.push(
        ...validateTemplates(data[key], path ? `${path}.${key}` : key)
      );
    });
  }

  return errors;
}
```

### 2. Validação de Ícones

Criar lista de ícones válidos do Lucide React e validar:

```javascript
const validIcons = require("./valid-lucide-icons.json");

function validateIcon(icon) {
  if (!validIcons.includes(icon)) {
    return {
      path: "icon",
      message: `Ícone "${icon}" não é válido. Use um ícone do Lucide React.`,
    };
  }
  return null;
}
```

### 3. Relatório HTML

Gerar relatório HTML com erros destacados e sugestões de correção.

### 4. Validação Interativa

Criar interface web para validar JSONs e ver erros em tempo real.

---

## 📚 Recursos

- [JSON Schema](https://json-schema.org/)
- [AJV Documentation](https://ajv.js.org/)
- [JSON Schema Validator (Online)](https://www.jsonschemavalidator.net/)

---

## ✅ Checklist de Implementação

- [x] Instalar dependências (`ajv`, `ajv-formats`)
- [x] Criar JSON Schema básico em `data/validation/schema/`
- [x] Criar script de validação em `data/validation/scripts/`
- [x] Adicionar validações customizadas em `data/validation/rules/`
- [x] Adicionar scripts ao `package.json`
- [ ] Testar com JSONs existentes
- [x] Documentar uso no README (`data/validation/README.md`)
- [ ] (Opcional) Configurar CI/CD
- [x] Validação de templates implementada
- [ ] (Opcional) Adicionar validação de ícones

**Status:** ✅ Estrutura isolada criada em `data/validation/`

---

**Última atualização:** 2024
