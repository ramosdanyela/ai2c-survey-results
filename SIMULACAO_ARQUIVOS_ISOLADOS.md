# 📁 Arquivos Isolados da Simulação

Este documento lista todos os arquivos criados para a simulação de API. **Todos podem ser deletados** para voltar aos imports diretos.

---

## 🗂️ Arquivos Criados

### 1. **Dados JSON**

- `src/data/surveyData.json` - Versão JSON dos dados (pode ser deletado)

### 2. **Serviço de Simulação**

- `src/services/surveyDataService.js` - Simula chamada de API

### 3. **Hook**

- `src/hooks/useSurveyData.js` - Hook com React Query

### 4. **Componentes UI**

- `src/components/survey/SurveyLoading.jsx` - Componente de loading
- `src/components/survey/SurveyError.jsx` - Componente de erro

### 5. **Script de Conversão** (temporário)

- `scripts/convert-to-json.mjs` - Script para converter JS → JSON (pode deletar após uso)

---

## 🔄 Como Remover a Simulação

### Passo 1: Reverter Imports nos Componentes

Substituir:

```javascript
// ANTES (com simulação)
import { useSurveyData } from "@/hooks/useSurveyData";
const { surveyInfo, loading } = useSurveyData();
```

Por:

```javascript
// DEPOIS (import direto)
import { surveyInfo } from "@/data/surveyData";
// Remover estados de loading/error
```

### Passo 2: Deletar Arquivos

```bash
# Deletar arquivos da simulação
rm src/data/surveyData.json
rm src/services/surveyDataService.js
rm src/hooks/useSurveyData.js
rm src/components/survey/SurveyLoading.jsx
rm src/components/survey/SurveyError.jsx
rm scripts/convert-to-json.mjs
```

### Passo 3: Remover Estados de Loading/Error

Remover de todos os componentes:

- `if (loading) return <SurveyLoading />`
- `if (error) return <SurveyError />`
- Imports de `SurveyLoading` e `SurveyError`

---

## ✅ Checklist de Remoção

- [ ] Reverter imports em `SurveyLayout`
- [ ] Reverter imports em `SurveyHeader`
- [ ] Reverter imports em `SurveySidebar`
- [ ] Reverter imports em `ContentRenderer`
- [ ] Reverter imports em `ExecutiveReport`
- [ ] Reverter imports em `SupportAnalysis`
- [ ] Reverter imports em `ResponseDetails`
- [ ] Reverter imports em `AttributeDeepDive`
- [ ] Reverter imports em `FilterPanel`
- [ ] Reverter imports em `Export`
- [ ] Deletar `surveyData.json`
- [ ] Deletar `surveyDataService.js`
- [ ] Deletar `useSurveyData.js`
- [ ] Deletar `SurveyLoading.jsx`
- [ ] Deletar `SurveyError.jsx`
- [ ] Deletar `convert-to-json.mjs`
- [ ] Testar que tudo funciona

---

## 📝 Notas

- O arquivo original `src/data/surveyData.js` **NÃO deve ser deletado** - ele é a fonte de verdade
- Todos os arquivos de simulação são isolados e podem ser removidos sem afetar o código original
- A estrutura de dados permanece idêntica, facilitando a migração
