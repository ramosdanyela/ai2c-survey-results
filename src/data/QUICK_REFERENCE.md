# 🚀 Guia de Referência Rápida - surveyData.json

## 📋 Estrutura Mínima de uma Seção

```json
{
  "id": "minha-secao",
  "index": 0,
  "name": "Minha Seção",
  "icon": "FileText",
  "hasSchema": true,
  "subsections": [
    {
      "id": "minha-subsecao",
      "index": 0,
      "name": "Minha Subseção",
      "icon": "ClipboardList"
    }
  ],
  "data": {
    "renderSchema": {
      "subsections": [
        {
          "id": "minha-subsecao",
          "index": 0,
          "name": "Minha Subseção",
          "icon": "ClipboardList",
          "components": [
            {
              "type": "card",
              "index": 0,
              "title": "{{uiTexts.minhaSecao.titulo}}",
              "content": "{{sectionData.descricao}}",
              "styleVariant": "default"
            }
          ]
        }
      ]
    },
    "descricao": "Conteúdo aqui"
  }
}
```

## 🎯 Componentes Mais Usados

### Card

```json
{
  "type": "card",
  "title": "{{uiTexts.titulo}}",
  "content": "{{sectionData.conteudo}}",
  "styleVariant": "default"
}
```

### BarChart

```json
{
  "type": "barChart",
  "dataPath": "sectionData.dados",
  "config": {
    "dataKey": "percentage",
    "yAxisDataKey": "label"
  }
}
```

### Wrapper

```json
{
  "wrapper": "div",
  "wrapperProps": {},
  "components": [ ... ]
}
```

## 🔗 Templates

- `{{uiTexts.secao.campo}}` - Textos da interface
- `{{sectionData.campo}}` - Dados da seção
- `{{currentAttribute.campo}}` - Atributo atual
- `{{question.campo}}` - Questão atual
- `{{surveyInfo.campo}}` - Info da pesquisa

## ⚙️ Condições

```json
{
  "condition": "question.type === 'nps'"
}
```

## 📊 Estruturas de Dados

### Distribuição

```json
[{ "segment": "A", "count": 100, "percentage": 50 }]
```

### Sentimento

```json
[{ "segment": "A", "positive": 50, "neutral": 30, "negative": 20 }]
```

### NPS

```json
[
  { "segment": "A", "nps": 10 },
  { "option": "Promotor", "value": 100, "percentage": 50 }
]
```

## 🎨 StyleVariants

- `default` - Padrão
- `highlight` - Destaque
- `border-left` - Borda esquerda
- `overflow-hidden` - Overflow oculto
- `flex-column` - Coluna
- `with-charts` - Com gráficos
- `with-tables` - Com tabelas

## 🔤 Ícones Comuns

`FileText`, `BarChart3`, `Heart`, `Target`, `Users2`, `Layers`, `Building`, `MapPin`, `GraduationCap`, `MessageSquare`, `Download`, `AlertTriangle`, `ClipboardList`, `TrendingUp`, `Percent`, `HelpCircle`

## ✅ Checklist para Nova Seção

- [ ] Adicionar em `sectionsConfig.sections`
- [ ] Definir `id`, `index`, `name`, `icon`
- [ ] Definir `hasSchema: true`
- [ ] Criar `subsections` (se necessário)
- [ ] Criar `renderSchema` em `data`
- [ ] Adicionar dados em `data`
- [ ] Adicionar textos em `uiTexts`

## 📖 Documentação Completa

Veja `SURVEY_DATA_DOCUMENTATION.md` para documentação detalhada.
