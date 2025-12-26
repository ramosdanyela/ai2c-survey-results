# Textos Hardcoded Identificados - Pendentes

Este documento lista apenas os textos hardcoded que ainda precisam ser corrigidos.

**Última atualização**: Apenas textos pendentes listados

**Nota**:

- Todos os comentários em português foram traduzidos para inglês.
- ✅ Todos os textos hardcoded em português nos componentes foram traduzidos para inglês.
- Os textos em `surveyData.js` foram mantidos em português conforme solicitado.

---

## 📊 Charts.jsx

### Textos hardcoded em inglês (valores padrão):

1. **Linha 57-58, 60**: Valores padrão para labels de sentimento

   ```javascript
   positive: data[0].positiveLabel || "Positive",
   negative: data[0].negativeLabel || "Negative",
   // ...
   : { positive: "Positive", negative: "Negative" };
   ```

   **Sugestão**: Mover para `uiTexts.charts.defaultLabels`

2. **Linha 118**: Formatação de porcentagem no eixo X

   ```javascript
   if (value === 0) return "0%";
   ```

   **Sugestão**: Usar formatação dinâmica ou constante de formatação

3. **Linha 350**: Valor padrão para nome do gráfico NPS

   ```javascript
   chartName = "NPS",
   ```

   **Sugestão**: Mover para `uiTexts.charts.npsChartName`

4. **Linha 401**: Separador na formatação da legenda
   ```javascript
   return `${label} - ${percentage}%`;
   ```
   **Sugestão**: Usar constante ou formatação configurável

---

## 🔢 pagination.tsx

### Textos hardcoded em inglês:

1. **Linha 10**: Aria-label para navegação de paginação

   ```javascript
   aria-label="pagination"
   ```

   **Sugestão**: Mover para `uiTexts.pagination.ariaLabel`

2. **Linha 50**: Aria-label para botão "Previous"

   ```javascript
   aria-label="Go to previous page"
   ```

   **Sugestão**: Mover para `uiTexts.pagination.previousAriaLabel`

3. **Linha 52**: Texto "Previous"

   ```javascript
   <span>Previous</span>
   ```

   **Sugestão**: Mover para `uiTexts.pagination.previous`

4. **Linha 58**: Aria-label para botão "Next"

   ```javascript
   aria-label="Go to next page"
   ```

   **Sugestão**: Mover para `uiTexts.pagination.nextAriaLabel`

5. **Linha 59**: Texto "Next"

   ```javascript
   <span>Next</span>
   ```

   **Sugestão**: Mover para `uiTexts.pagination.next`

6. **Linha 68**: Texto para screen readers
   ```javascript
   <span className="sr-only">More pages</span>
   ```
   **Sugestão**: Mover para `uiTexts.pagination.morePages`

**Nota**: Este é um componente UI genérico (shadcn/ui), pode ser mantido em inglês ou internacionalizado.

---

## 📝 Resumo por Prioridade

### 🔴 **Alta Prioridade** (Textos visíveis na UI):

1. **Charts.jsx**:

   - "Positive" / "Negative" (valores padrão) - Linhas 57-58, 60
   - "NPS" (nome padrão do gráfico) - Linha 350
   - "0%" (formatação) - Linha 118
   - Separador " - " na legenda - Linha 401

2. **pagination.tsx**:
   - "pagination" (aria-label) - Linha 10
   - "Go to previous page" (aria-label) - Linha 50
   - "Previous" (texto) - Linha 52
   - "Go to next page" (aria-label) - Linha 58
   - "Next" (texto) - Linha 59
   - "More pages" (sr-only) - Linha 68

---

## 💡 Sugestões de Estrutura para uiTexts

```javascript
uiTexts = {
  charts: {
    defaultLabels: {
      positive: "Positive",
      negative: "Negative",
    },
    npsChartName: "NPS",
    formatPercentage: (value) => `${value}%`,
    legendSeparator: " - ",
    zeroPercent: "0%",
  },
  pagination: {
    ariaLabel: "pagination",
    previousAriaLabel: "Go to previous page",
    previous: "Previous",
    nextAriaLabel: "Go to next page",
    next: "Next",
    morePages: "More pages",
  },
};
```
