# 📋 Tipos de Badge para Questões

## Estrutura da Questão

Cada questão em `responseDetails` possui um campo `type` que indica o tipo da questão:

```json
{
  "id": 1,
  "question": "...",
  "icon": "Percent",
  "type": "nps" | "open" | "closed"
}
```

**Nota**: O campo `type` é uma string simples, não um objeto. A estilização do badge é feita no componente usando o mapeamento em `src/lib/questionBadgeTypes.js`.

---

## Tipos Possíveis

Os tipos são definidos em `src/lib/questionBadgeTypes.js`:

### 1. **NPS** (`type: "nps"`)
- **Variant**: `"default"`
- **Label**: `"NPS"`
- **Icon**: `"TrendingUp"`
- **Uso**: Questões de Net Promoter Score (escala 0-10)
- **Exemplo**: Q1 - "Qual é a probabilidade de você recomendar..."

### 2. **Campo Aberto** (`type: "open"`)
- **Variant**: `"secondary"`
- **Label**: `"Campo Aberto"`
- **Icon**: `"FileText"`
- **Uso**: Questões abertas (texto livre)
- **Exemplo**: Q2, Q5, Q6

### 3. **Múltipla Escolha** (`type: "closed"`)
- **Variant**: `"outline"`
- **Label**: `"Múltipla Escolha"`
- **Icon**: `"CheckSquare"`
- **Uso**: Questões fechadas com opções pré-definidas
- **Exemplo**: Q3, Q4

---

## Variantes de Badge

As variantes correspondem aos estilos do componente Badge:

- **`default`**: Badge primário com fundo azul customizado
- **`secondary`**: Badge secundário com fundo muted
- **`outline`**: Badge com apenas borda

---

## Exemplo Completo

```json
{
  "id": 1,
  "index": 1,
  "question": "Qual é a probabilidade...",
  "icon": "Percent",
  "type": "nps",
  "summary": "...",
  "data": [...]
}
```

---

## Configuração de Badges

A configuração dos badges está em `src/lib/questionBadgeTypes.js`:

```javascript
export const questionBadgeTypes = {
  nps: {
    variant: "default",
    label: "NPS",
    icon: "TrendingUp",
  },
  open: {
    variant: "secondary",
    label: "Campo Aberto",
    icon: "FileText",
  },
  closed: {
    variant: "outline",
    label: "Múltipla Escolha",
    icon: "CheckSquare",
  },
};
```

## Uso no Componente

O componente `ResponseDetails.jsx` usa o tipo da questão para buscar a configuração:

```javascript
import { getBadgeConfig } from "@/lib/questionBadgeTypes";

const QuestionTypePill = ({ question }) => {
  const badgeConfig = getBadgeConfig(question.type);
  
  return (
    <Badge variant={badgeConfig.variant}>
      {badgeConfig.label}
    </Badge>
  );
};
```

---

## Notas

- Todos os badges são opcionais (fallback para comportamento padrão se não existir)
- Os tipos são determinados automaticamente baseado no tipo de questão
- As variantes podem ser customizadas por questão se necessário

