import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, '../src/data/surveyData.json');

console.log('🔄 Iniciando migração do JSON para estrutura direta...\n');

// Ler o JSON
const jsonContent = fs.readFileSync(jsonPath, 'utf8');
const data = JSON.parse(jsonContent);

let migratedSections = 0;
let migratedSubsections = 0;
let migratedComponents = 0;

// Processar cada seção
data.sections.forEach((section) => {
  if (!section.data?.renderSchema) return;

  const renderSchema = section.data.renderSchema;
  let sectionMigrated = false;

  // Migrar componentes de subseções
  if (renderSchema.subsections && Array.isArray(renderSchema.subsections)) {
    renderSchema.subsections.forEach((schemaSub) => {
      if (!schemaSub.components) return;

      // Encontrar a subseção correspondente em section.subsections
      const subsection = section.subsections?.find(
        (sub) => sub.id === schemaSub.id
      );

      if (subsection) {
        // Mover componentes para a subseção diretamente
        subsection.components = schemaSub.components;
        
        // Mover componentsContainerClassName se existir
        if (schemaSub.componentsContainerClassName) {
          subsection.componentsContainerClassName =
            schemaSub.componentsContainerClassName;
        }

        migratedSubsections++;
        migratedComponents += schemaSub.components.length;
        sectionMigrated = true;
      } else {
        // Subseção existe apenas em renderSchema - adicionar à section.subsections
        if (!section.subsections) {
          section.subsections = [];
        }
        section.subsections.push({
          id: schemaSub.id,
          index: schemaSub.index ?? section.subsections.length,
          name: schemaSub.name || schemaSub.id,
          icon: schemaSub.icon || null,
          components: schemaSub.components,
          ...(schemaSub.componentsContainerClassName && {
            componentsContainerClassName:
              schemaSub.componentsContainerClassName,
          }),
        });
        migratedSubsections++;
        migratedComponents += schemaSub.components.length;
        sectionMigrated = true;
      }
    });
  }

  // Migrar componentes diretos da seção (quando não há subseções)
  if (renderSchema.components && Array.isArray(renderSchema.components)) {
    section.components = renderSchema.components;
    migratedComponents += renderSchema.components.length;
    sectionMigrated = true;
  }

  // Remover renderSchema após migração
  if (sectionMigrated) {
    delete section.data.renderSchema;
    
    // Se data ficar vazio, remover data também
    if (Object.keys(section.data).length === 0) {
      delete section.data;
    }
    
    migratedSections++;
  }
});

// Salvar o JSON migrado
const output = JSON.stringify(data, null, 2);
fs.writeFileSync(jsonPath, output, 'utf8');

console.log('✅ Migração concluída!\n');
console.log(`📊 Estatísticas:`);
console.log(`   - Seções migradas: ${migratedSections}`);
console.log(`   - Subseções migradas: ${migratedSubsections}`);
console.log(`   - Componentes migrados: ${migratedComponents}`);
console.log(`\n💾 Arquivo salvo em: ${jsonPath}`);
