# Estratégia: Verificar cobertura de Charts, Tables e Cards na aba Data Path

**Objetivo:** Garantir que todos os componentes dos tipos Chart, Table e Card disponíveis no código apareçam na aba **Data Path** da página JSON Reference (`src/pages/JsonReference.jsx`), para que a referência fique completa.

---

## 1. Fontes de verdade no código

### 1.1 Registry (fonte canônica)

- **Arquivo:** `src/components/survey/common/ComponentRegistry.jsx`
- **Export:** `componentRegistry` — objeto cuja chave é o tipo do componente (ex.: `barChart`, `recommendationsTable`, `card`).
- **Lista de tipos registrados:** `Object.keys(componentRegistry)` ou a função `getRegisteredComponentTypes()`.

### 1.2 Categorias na JSON Reference (fonte para “quem é Chart/Table/Card”)

- **Arquivo:** `src/pages/JsonReference.jsx`
- **Constante:** `componentCategories` (objeto com `Charts`, `Cards`, `Tables`, `Widgets`, `Containers`).
- **Tipos que nos interessam para esta checagem:**  
  `expectedTypes = componentCategories.Charts ∪ componentCategories.Cards ∪ componentCategories.Tables`

Essa lista deve estar alinhada ao registry: todo tipo em `componentCategories.Charts/Cards/Tables` deve existir em `componentRegistry`.

### 1.3 Quem aparece na aba Data Path

- **Arquivo:** `src/pages/JsonReference.jsx`
- **Variável derivada:** `unifiedList` (useMemo).
- **Conteúdo:**
  - **Used:** um item por tipo que existe em `extractComponentData.pathsByType` (tipos que aparecem no JSON do relatório carregado, com pelo menos um `dataPath`).
  - **Other:** tipos que estão em `otherDataPathTypes` (registry menos os “used”), **exceto** os que caem em `otherFilterExclude` ou já foram vistos em “used”.

Um tipo aparece na aba Data Path se e só se existir pelo menos um item em `unifiedList` com `item.type === esseTipo`.

---

## 2. Por que um Chart/Table/Card pode não aparecer na Data Path

1. **Não está no registry**  
   Se o tipo não estiver em `ComponentRegistry.jsx`, não entra em `otherDataPathTypes` nem em “used”.  
   → Incluir o tipo no registry (e, se for Chart/Table/Card, em `componentCategories` no JsonReference).

2. **Está em `otherFilterExclude`**  
   Em `JsonReference.jsx`, na construção de `unifiedList`, há um `otherFilterExclude` que impede certos tipos de entrarem na lista “other”. Se um tipo de Chart/Table/Card estiver aí e não estiver em “used” (não aparece no JSON carregado), ele **nunca** aparecerá na Data Path.  
   → Para garantir cobertura de todos os Charts, Tables e Cards, **não** incluir esses tipos em `otherFilterExclude`; ou manter um “allow list” só para Widgets/Containers que não devem aparecer na Data Path.

3. **Nem “used” nem “other”**
   - “Used” depende do JSON carregado (`pathsByType`).
   - “Other” = registry − used, menos os excluídos por `otherFilterExclude`.  
     Se o tipo estiver no registry e não estiver em `otherFilterExclude`, ele entra em “other” quando não está em “used”.  
     → O ponto crítico é não excluir Charts/Tables/Cards em `otherFilterExclude`.

4. **`componentCategories` desatualizado**  
   Se um novo Chart/Table/Card for adicionado ao registry mas não for incluído em `componentCategories` no JsonReference, a **checagem** que usa “só Charts, Tables, Cards” pode ignorá-lo (dependendo de como for feita).  
   → Manter `componentCategories` sincronizado com o registry para Charts, Tables e Cards.

5. **Falta de dados de exemplo para “other”**  
   Tipos em “other” usam `otherComponentExampleData[type]` quando existe; senão, usa-se um fallback (componente + `sectionData.${type}` genérico). Ou seja, mesmo sem entrada em `otherComponentExampleData`, o tipo **pode** aparecer na Data Path. Para ter um modelo melhor (JSON e dados realistas), convém ter entrada em `otherComponentExampleData` para cada Chart/Table/Card.

---

## 3. Checklist de verificação (manual ou em revisão)

- [ ] **Registry vs categorias**  
      Todo tipo em `componentCategories.Charts`, `componentCategories.Cards` e `componentCategories.Tables` existe em `componentRegistry`?

- [ ] **Categorias vs registry (inverso)**  
      Todo tipo em `componentRegistry` que é claramente Chart, Table ou Card está em `componentCategories` na categoria correta? (Evitar tipos “órfãos” no registry que não apareçam em nenhuma categoria.)

- [ ] **Nenhum Chart/Table/Card em `otherFilterExclude`**  
      Nenhum tipo que esteja em Charts, Cards ou Tables deve estar em `otherFilterExclude`, para que sempre apareça na Data Path quando não estiver em “used”.

- [ ] **Cobertura na aba**  
      Com a aplicação rodando e a aba Data Path aberta (e, se possível, com um JSON que não use todos os tipos): para cada tipo em `expectedTypes`, existe pelo menos um bloco na lista (filtros vazios)?  
      Opcional: inspecionar `unifiedList` no runtime (React DevTools ou log) e conferir `unifiedList.map(i => i.type)` contém todos os `expectedTypes`.

- [ ] **Dados de exemplo (“other”)**  
      Para cada tipo Chart/Table/Card que pode aparecer só em “other”, existe entrada em `otherComponentExampleData` em `JsonReference.jsx`? (Melhora a qualidade do modelo exibido.)

---

## 4. Verificação automatizada (sugestão)

### 4.1 Script ou teste unitário

- **Entrada:**
  - Lista de tipos esperados: `expectedTypes = [...componentCategories.Charts, ...componentCategories.Cards, ...componentCategories.Tables]` (pode ser lida do código ou de um fixture).
  - Lista de tipos na Data Path: em runtime, seria `unifiedList.map(i => i.type)`; em teste estático, pode-se simular a lógica de `unifiedList` (used + other − otherFilterExclude).

- **Lógica:**
  - Para cada tipo em `expectedTypes`, verificar se existe em `componentRegistry`.
  - Verificar se nenhum tipo em `expectedTypes` está em `otherFilterExclude`.
  - (Opcional) Simular `unifiedList` com `pathsByType` vazio (nenhum “used”) e conferir que, após aplicar a lógica “other”, todos os `expectedTypes` estão presentes.

- **Saída:**  
  Lista de tipos que faltam no registry, que estão indevidamente em `otherFilterExclude`, ou que não aparecem na lista unificada quando deveriam.

### 4.2 Onde rodar

- Teste em Jest/Vitest que importa `componentRegistry` e (se possível) a constante `componentCategories` ou um módulo que a exporte.
- Ou script Node que lê os arquivos e faz o diff (ex.: listar chaves de `componentRegistry` e comparar com `expectedTypes` e com `otherFilterExclude`).

---

## 5. Manutenção contínua

- **Ao adicionar um novo Chart, Table ou Card no código:**
  1. Registrar em `ComponentRegistry.jsx`.
  2. Incluir o tipo na categoria correta em `componentCategories` em `JsonReference.jsx`.
  3. Garantir que o tipo **não** esteja em `otherFilterExclude`.
  4. (Recomendado) Adicionar entrada em `otherComponentExampleData` para esse tipo, para que o modelo na Data Path tenha JSON e dados de exemplo coerentes.

- **Ao alterar `otherFilterExclude`:**  
  Verificar que nenhum tipo de Charts, Tables ou Cards foi incluído na lista de exclusão.

- **Periodicamente:**  
  Rodar o checklist da seção 3 (ou o script da seção 4) para garantir que todos os Charts, Tables e Cards do código seguem presentes na aba Data Path.

---

## 6. Resumo

| O quê                           | Onde                                                                                                                                                                 |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lista canônica de tipos (todos) | `ComponentRegistry.jsx` → `componentRegistry`                                                                                                                        |
| Lista de Charts, Tables, Cards  | `JsonReference.jsx` → `componentCategories`                                                                                                                          |
| Quem aparece na Data Path       | `JsonReference.jsx` → `unifiedList` (used + other, menos otherFilterExclude)                                                                                         |
| Risco de sumir da Data Path     | Tipo em `otherFilterExclude` e não presente no JSON (used)                                                                                                           |
| Ação para cobertura total       | Não colocar Charts/Tables/Cards em `otherFilterExclude`; manter categorias e registry alinhados; opcionalmente preencher `otherComponentExampleData` para cada tipo. |

---

_Documento de estratégia — uso em revisões de código e em automação de checagem._
