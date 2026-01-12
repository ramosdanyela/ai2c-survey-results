# Componentes Genéricos (Common)

Esta pasta contém componentes genéricos e reutilizáveis que podem ser usados por qualquer seção do survey.

## 📦 Componentes Disponíveis

### `GenericCard.jsx`

Componente de card reutilizável com suporte a:

- Título e conteúdo
- Estilos (elevated, default)
- Border left color (incluindo "orange")
- Classes CSS customizadas
- Uso de CardDescription ou div
- Children customizados

**Uso:**

```jsx
import { GenericCard } from "../common/GenericCard";

<GenericCard
  title="Título"
  content="Conteúdo..."
  style="elevated"
  borderLeftColor="orange"
/>;
```

### `GenericSubsection.jsx`

Wrapper para subseções com:

- Título e ícone
- Container de componentes configurável
- Classes CSS customizadas

**Uso:**

```jsx
import { GenericSubsection } from "../common/GenericSubsection";

<GenericSubsection
  title="Título da Subseção"
  icon={BarChart3}
  componentsContainerClassName="grid gap-6"
>
  {/* Seus componentes aqui */}
</GenericSubsection>;
```

### `GenericSectionRenderer.jsx`

Renderizador genérico baseado em schema JSON. Usado pelo sistema de renderização baseado em schema.

**Uso:**

```jsx
import { GenericSectionRenderer } from "../common/GenericSectionRenderer";

<GenericSectionRenderer
  sectionId="minha-secao"
  subSection="minha-secao-overview"
/>;
```

## 📁 Estrutura de Pastas

```
src/components/survey/
├── common/              # Componentes genéricos reutilizáveis
│   ├── GenericCard.jsx
│   ├── GenericSubsection.jsx
│   └── GenericSectionRenderer.jsx
├── sections/            # Seções específicas
│   ├── ExecutiveReport.jsx
│   ├── SupportAnalysis.jsx
│   └── ...
├── components/          # Componentes de UI do survey
│   ├── ContentRenderer.jsx
│   └── ...
└── widgets/            # Widgets reutilizáveis
    ├── Charts.jsx
    ├── Tables.jsx
    └── ...
```

## 🔄 Diferença entre Pastas

- **`common/`**: Componentes genéricos específicos para seções (cards, subsections, renderers)
- **`widgets/`**: Widgets mais específicos (gráficos, tabelas, word clouds)
- **`components/`**: Componentes de UI do survey (layout, navegação, filtros)
- **`sections/`**: Seções específicas que consomem os componentes acima

## 💡 Quando Criar um Novo Componente Genérico

Crie um novo componente em `common/` quando:

- ✅ Será usado por múltiplas seções
- ✅ É específico para renderização de seções
- ✅ Segue padrões comuns de seções (cards, subsections, etc.)

Não coloque em `common/` quando:

- ❌ É específico de uma única seção (vai em `sections/`)
- ❌ É um widget genérico (vai em `widgets/`)
- ❌ É parte da UI geral do survey (vai em `components/`)
