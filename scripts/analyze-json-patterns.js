import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, '../src/data/surveyData.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

console.log('='.repeat(80));
console.log('ANÁLISE DE PADRÕES INCONSISTENTES NO JSON');
console.log('='.repeat(80));
console.log();

const sections = data.sectionsConfig.sections;
const patterns = {
  withRenderSchemaSubsections: [],
  withRenderSchemaComponents: [],
  withoutRenderSchema: [],
  dataStructure: {}
};

sections.forEach(section => {
  const sectionInfo = {
    id: section.id,
    name: section.name,
    hasSubsections: section.subsections ? true : false,
    hasSubsectionsInConfig: section.subsections ? true : false,
    dataKeys: Object.keys(section.data || {}),
    renderSchemaStructure: null,
    dataStructure: {}
  };

  // Analisar estrutura de renderSchema
  if (section.data?.renderSchema) {
    if (section.data.renderSchema.subsections) {
      sectionInfo.renderSchemaStructure = 'subsections';
      patterns.withRenderSchemaSubsections.push(sectionInfo);
    } else if (section.data.renderSchema.components) {
      sectionInfo.renderSchemaStructure = 'components';
      patterns.withRenderSchemaComponents.push(sectionInfo);
    }
  } else {
    sectionInfo.renderSchemaStructure = 'none';
    patterns.withoutRenderSchema.push(sectionInfo);
  }

  // Analisar estrutura de dados
  if (section.data) {
    Object.keys(section.data).forEach(key => {
      if (key !== 'renderSchema') {
        const value = section.data[key];
        const type = Array.isArray(value) ? 'array' : typeof value;
        if (!patterns.dataStructure[key]) {
          patterns.dataStructure[key] = {
            type,
            sections: []
          };
        }
        patterns.dataStructure[key].sections.push({
          sectionId: section.id,
          sectionName: section.name,
          structure: sectionInfo.renderSchemaStructure
        });
      }
    });
  }
});

console.log('📊 RESUMO DE PADRÕES ENCONTRADOS\n');

console.log('1️⃣ SEÇÕES COM renderSchema.subsections:');
patterns.withRenderSchemaSubsections.forEach(s => {
  console.log(`   - ${s.id} (${s.name})`);
  console.log(`     • Tem subsections no config: ${s.hasSubsectionsInConfig}`);
  console.log(`     • Chaves em data: ${s.dataKeys.join(', ')}`);
});
console.log();

console.log('2️⃣ SEÇÕES COM renderSchema.components (sem subsections):');
patterns.withRenderSchemaComponents.forEach(s => {
  console.log(`   - ${s.id} (${s.name})`);
  console.log(`     • Tem subsections no config: ${s.hasSubsectionsInConfig}`);
  console.log(`     • Chaves em data: ${s.dataKeys.join(', ')}`);
});
console.log();

console.log('3️⃣ SEÇÕES SEM renderSchema:');
patterns.withoutRenderSchema.forEach(s => {
  console.log(`   - ${s.id} (${s.name})`);
  console.log(`     • Tem subsections no config: ${s.hasSubsectionsInConfig}`);
  console.log(`     • Chaves em data: ${s.dataKeys.join(', ')}`);
});
console.log();

console.log('4️⃣ ESTRUTURAS DE DADOS (chaves em data além de renderSchema):');
Object.keys(patterns.dataStructure).forEach(key => {
  const info = patterns.dataStructure[key];
  console.log(`   - ${key} (${info.type}):`);
  info.sections.forEach(s => {
    console.log(`     • ${s.sectionId} (${s.sectionName}) - estrutura: ${s.structure}`);
  });
});
console.log();

console.log('='.repeat(80));
console.log('🔍 INCONSISTÊNCIAS IDENTIFICADAS');
console.log('='.repeat(80));
console.log();

const inconsistencies = [];

// Inconsistência 1: Seções com subsections no config mas sem renderSchema.subsections
sections.forEach(section => {
  if (section.subsections && section.subsections.length > 0) {
    if (section.data?.renderSchema?.components && !section.data.renderSchema.subsections) {
      inconsistencies.push({
        type: 'MISMATCH_SUBSECTIONS',
        section: section.id,
        issue: `Tem subsections no config mas usa renderSchema.components diretamente`
      });
    }
  }
});

// Inconsistência 2: Seções sem subsections no config mas com renderSchema.subsections
sections.forEach(section => {
  if ((!section.subsections || section.subsections.length === 0) && 
      section.data?.renderSchema?.subsections) {
    inconsistencies.push({
      type: 'MISMATCH_SUBSECTIONS',
      section: section.id,
      issue: `Não tem subsections no config mas usa renderSchema.subsections`
    });
  }
});

// Inconsistência 3: Seção sem renderSchema (attributes)
sections.forEach(section => {
  if (!section.data?.renderSchema) {
    inconsistencies.push({
      type: 'NO_RENDER_SCHEMA',
      section: section.id,
      issue: `Não tem renderSchema (gerado dinamicamente?)`
    });
  }
});

// Inconsistência 4: Dados diretos em data com padrões diferentes
const dataKeysUsage = {};
sections.forEach(section => {
  if (section.data) {
    Object.keys(section.data).forEach(key => {
      if (key !== 'renderSchema') {
        if (!dataKeysUsage[key]) {
          dataKeysUsage[key] = [];
        }
        dataKeysUsage[key].push({
          section: section.id,
          hasRenderSchema: !!section.data.renderSchema,
          renderSchemaType: section.data.renderSchema?.subsections ? 'subsections' : 
                           section.data.renderSchema?.components ? 'components' : 'none'
        });
      }
    });
  }
});

inconsistencies.forEach(inc => {
  console.log(`⚠️  ${inc.type}: ${inc.section}`);
  console.log(`   ${inc.issue}`);
  console.log();
});

console.log('='.repeat(80));
console.log('📋 COMPARAÇÃO DETALHADA POR SEÇÃO');
console.log('='.repeat(80));
console.log();

sections.forEach(section => {
  console.log(`\n🔹 ${section.id.toUpperCase()} (${section.name})`);
  console.log(`   Config:`);
  console.log(`     - subsections: ${section.subsections ? section.subsections.length : 0}`);
  console.log(`     - hasSubsections: ${section.hasSubsections !== undefined ? section.hasSubsections : 'não definido'}`);
  console.log(`   Data:`);
  if (section.data) {
    console.log(`     - renderSchema: ${section.data.renderSchema ? 'SIM' : 'NÃO'}`);
    if (section.data.renderSchema) {
      if (section.data.renderSchema.subsections) {
        console.log(`       • Tipo: subsections (${section.data.renderSchema.subsections.length} subsections)`);
      } else if (section.data.renderSchema.components) {
        console.log(`       • Tipo: components (${section.data.renderSchema.components.length} components)`);
      }
      if (section.data.renderSchema.questionTypeSchemas) {
        console.log(`       • questionTypeSchemas: SIM`);
      }
    }
    const otherKeys = Object.keys(section.data).filter(k => k !== 'renderSchema');
    if (otherKeys.length > 0) {
      console.log(`     - Outras chaves: ${otherKeys.join(', ')}`);
    }
  } else {
    console.log(`     - data: NÃO EXISTE`);
  }
});

console.log('\n' + '='.repeat(80));
console.log('✅ ANÁLISE CONCLUÍDA');
console.log('='.repeat(80));
