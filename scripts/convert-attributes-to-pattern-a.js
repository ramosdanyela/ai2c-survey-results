import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Replica a lógica de buildAttributeComponents mas retorna JSON
 * Esta função gera os componentes que serão colocados no renderSchema
 * @param {Object} attr - Objeto do atributo
 * @param {string} attributeId - ID do atributo (ex: "department") para usar em dataPath
 */
function buildAttributeComponentsJSON(attr, attributeId) {
  const out = [];
  let idx = 0;

  // Componente 1: Card de Sumário
  if (attr.summary) {
    out.push({
      type: "card",
      index: idx++,
      title: "Sumário",
      text: `{{sectionData.${attributeId}.summary}}`,
      styleVariant: "default",
    });
  }

  // Componente 2: Cards de Distribuição e Sentimento
  const hasDist = attr.distribution && attr.distribution.length > 0;
  const hasSent = attr.sentiment && attr.sentiment.length > 0;
  if (hasDist || hasSent) {
    const cards = [];
    if (hasDist) {
      cards.push({
        type: "card",
        index: 0,
        title: "Distribuição dos respondentes",
        styleVariant: "flex-column",
        textStyleVariant: "with-charts",
        components: [
          {
            type: "barChart",
            index: 0,
            dataPath: `sectionData.${attributeId}.distribution`,
            config: { dataKey: "percentage", yAxisDataKey: "segment", tooltipFormatter: "respondentes" },
          },
          { 
            type: "distributionTable", 
            index: 1, 
            dataPath: `sectionData.${attributeId}.distribution`, 
            categoryName: `{{sectionData.${attributeId}.name}}` 
          },
        ],
      });
    }
    if (hasSent) {
      cards.push({
        type: "card",
        index: 1,
        title: "Análise de sentimento",
        styleVariant: "flex-column",
        textStyleVariant: "with-charts",
        components: [
          { 
            type: "sentimentStackedChart", 
            index: 0, 
            dataPath: `sectionData.${attributeId}.sentiment`, 
            config: { yAxisDataKey: "segment" } 
          },
          { 
            type: "sentimentTable", 
            index: 1, 
            dataPath: `sectionData.${attributeId}.sentiment` 
          },
        ],
      });
    }
    out.push({
      wrapper: "div",
      wrapperProps: {},
      index: idx++,
      components: cards,
    });
  }

  // Componente 3: Card de NPS
  const hasNps = attr.npsSummary || (attr.npsDistribution && attr.npsDistribution.length > 0) || (attr.nps != null);
  if (hasNps) {
    const npsBlocks = [];
    if (attr.npsSummary) {
      npsBlocks.push({
        wrapper: "div",
        index: 0,
        components: [
          { wrapper: "h3", wrapperProps: {}, index: 0, text: "Sumário" },
          { wrapper: "div", wrapperProps: {}, index: 1, text: `{{sectionData.${attributeId}.npsSummary}}` },
        ],
      });
    }
    const hasNpsTables = (attr.npsDistribution && attr.npsDistribution.length > 0) || (attr.nps != null);
    if (hasNpsTables) {
      npsBlocks.push({
        wrapper: "div",
        index: 1,
        components: [
          { wrapper: "h3", wrapperProps: {}, index: 0, text: "Respostas" },
          {
            wrapper: "div",
            wrapperProps: {},
            index: 1,
            components: [
              {
                wrapper: "div",
                index: 0,
                components: [
                  { wrapper: "h4", index: 0, text: "Promotores, Neutros, Detratores" },
                  { 
                    type: "npsDistributionTable", 
                    index: 1, 
                    dataPath: `sectionData.${attributeId}.npsDistribution`, 
                    categoryName: `{{sectionData.${attributeId}.name}}` 
                  },
                ],
              },
              {
                wrapper: "div",
                index: 1,
                components: [
                  { wrapper: "h4", index: 0, text: "NPS" },
                  { 
                    type: "npsTable", 
                    index: 1, 
                    dataPath: `sectionData.${attributeId}.nps`, 
                    categoryName: `{{sectionData.${attributeId}.name}}` 
                  },
                ],
              },
            ],
          },
        ],
      });
    }
    if (npsBlocks.length > 0) {
      out.push({
        type: "card",
        index: idx++,
        title: "Qual é a probabilidade de você recomendar nossa empresa como um ótimo lugar para trabalhar?",
        styleVariant: "default",
        textStyleVariant: "with-tables",
        components: npsBlocks,
      });
    }
  }

  // Componente 4: Card de Impacto de Satisfação
  if (attr.satisfactionImpactSummary) {
    const satBlocks = [
      {
        wrapper: "div",
        index: 0,
        components: [
          { wrapper: "h3", index: 0, text: "Sumário" },
          { wrapper: "div", index: 1, text: `{{sectionData.${attributeId}.satisfactionImpactSummary}}` },
        ],
      },
    ];
    if (attr.satisfactionImpactSentiment && (Array.isArray(attr.satisfactionImpactSentiment) ? attr.satisfactionImpactSentiment.length > 0 : attr.satisfactionImpactSentiment)) {
      satBlocks.push({
        wrapper: "div",
        index: 1,
        components: [
          { wrapper: "h3", index: 0, text: "Análise de sentimento" },
          { 
            type: "sentimentThreeColorChart", 
            index: 1, 
            dataPath: `sectionData.${attributeId}.satisfactionImpactSentiment`, 
            config: {} 
          },
          { 
            type: "sentimentImpactTable", 
            index: 2, 
            dataPath: `sectionData.${attributeId}.satisfactionImpactSentiment` 
          },
        ],
      });
    }
    if (attr.positiveCategories && (Array.isArray(attr.positiveCategories) ? attr.positiveCategories.length > 0 : attr.positiveCategories)) {
      satBlocks.push({
        wrapper: "div",
        index: satBlocks.length,
        components: [
          { wrapper: "h3", index: 0, content: "Categorias com sentimento positivo - Top 3" },
          { 
            type: "positiveCategoriesTable", 
            index: 1, 
            dataPath: `sectionData.${attributeId}.positiveCategories` 
          },
        ],
      });
    }
    if (attr.negativeCategories && (Array.isArray(attr.negativeCategories) ? attr.negativeCategories.length > 0 : attr.negativeCategories)) {
      satBlocks.push({
        wrapper: "div",
        index: satBlocks.length,
        components: [
          { wrapper: "h3", index: 0, text: "Categorias com sentimento negativo - Top 3" },
          { 
            type: "negativeCategoriesTable", 
            index: 1, 
            dataPath: `sectionData.${attributeId}.negativeCategories` 
          },
        ],
      });
    }
    out.push({
      type: "card",
      index: idx++,
      title: "Quais são os principais fatores que impactam sua satisfação no trabalho?",
      styleVariant: "default",
      textStyleVariant: "with-tables",
      components: satBlocks,
    });
  }

  return out;
}

// Ler JSON atual
const jsonPath = path.join(__dirname, '../src/data/surveyData.json');
console.log('📖 Lendo JSON atual...');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Encontrar seção attributes
const attributesSection = data.sectionsConfig.sections.find(s => s.id === 'attributes');
if (!attributesSection) {
  console.error('❌ Seção attributes não encontrada!');
  process.exit(1);
}

console.log('✅ Seção attributes encontrada');

// Verificar se já foi convertida (mas permitir sobrescrever)
if (attributesSection.data?.renderSchema) {
  console.warn('⚠️  Seção attributes já possui renderSchema. Sobrescrevendo...');
}

// Obter atributos
const attributes = attributesSection.data?.attributes || [];
if (attributes.length === 0) {
  console.error('❌ Nenhum atributo encontrado em data.attributes');
  process.exit(1);
}

console.log(`📊 Encontrados ${attributes.length} atributos`);

// PASSO 1: Reorganizar dados - mover cada atributo para uma chave individual
console.log('🔨 Reorganizando dados: movendo atributos para chaves individuais...');
attributes.forEach(attr => {
  attributesSection.data[attr.id] = { ...attr };
  console.log(`   ✅ ${attr.id} movido para data.${attr.id}`);
});

// Gerar subsections no config
console.log('🔨 Gerando subsections no config...');
attributesSection.subsections = attributes
  .filter(attr => attr.icon)
  .sort((a, b) => (a.index ?? 999) - (b.index ?? 999))
  .map(attr => ({
    id: `attributes-${attr.id}`,
    index: attr.index ?? 999,
    name: attr.name,
    icon: attr.icon,
  }));

console.log(`✅ ${attributesSection.subsections.length} subsections criadas no config`);

// Gerar renderSchema.subsections com dataPath usando sectionData.{attributeId}
console.log('🔨 Gerando renderSchema.subsections...');
attributesSection.data.renderSchema = {
  subsections: attributes
    .filter(attr => attr.icon)
    .sort((a, b) => (a.index ?? 999) - (b.index ?? 999))
    .map(attr => {
      const components = buildAttributeComponentsJSON(attr, attr.id);
      console.log(`   - ${attr.id}: ${components.length} componentes gerados (usando sectionData.${attr.id}.*)`);
      return {
        id: `attributes-${attr.id}`,
        index: attr.index ?? 999,
        components: components,
      };
    }),
};

console.log('✅ renderSchema.subsections criado');

// Salvar JSON atualizado
console.log('💾 Salvando JSON atualizado...');
fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');

console.log('\n✅ Conversão concluída!');
console.log('📋 Seção attributes agora usa Padrão A (renderSchema.subsections)');
console.log('   - Dados reorganizados: cada atributo em data.{attributeId}');
console.log('   - Componentes usam dataPath: sectionData.{attributeId}.*');
console.log('   - SEM necessidade de currentAttribute ou lógica especial!');
console.log('\n⚠️  PRÓXIMOS PASSOS:');
console.log('   1. Remover TODAS as verificações if (sectionId === "attributes") do código');
console.log('   2. Remover função buildAttributeComponents');
console.log('   3. Remover injeção de currentAttribute');
console.log('   4. Atualizar canRenderWithoutSchema para remover "attributes"');
console.log('   5. Testar renderização de cada subsection');
console.log('\n📚 Veja ESTRATEGIA_CONVERSAO_PADRAO_C_PARA_A.md para detalhes completos.');
