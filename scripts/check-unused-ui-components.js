#!/usr/bin/env node

/**
 * Script para verificar quais componentes UI não estão sendo usados
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const UI_COMPONENTS_DIR = join(__dirname, '../src/components/ui');
const SRC_DIR = join(__dirname, '../src');

// Lista de componentes UI
const uiComponents = [
  'accordion',
  'alert-dialog',
  'badge',
  'button',
  'calendar',
  'card',
  'carousel',
  'checkbox',
  'collapsible',
  'dialog',
  'form',
  'input',
  'label',
  'pagination',
  'popover',
  'progress',
  'select',
  'separator',
  'sheet',
  'skeleton',
  'sonner',
  'switch',
  'table',
  'toast',
  'toaster',
  'toggle',
  'toggle-group',
  'tooltip',
];

// Componentes que são usados internamente por outros componentes UI
const internalDependencies = {
  'button': ['alert-dialog', 'calendar', 'carousel', 'pagination'],
  'label': ['form'],
  'toast': ['toaster'],
  'toggle': ['toggle-group'],
};

async function checkComponentUsage(componentName) {
  const searchPatterns = [
    // Import direto
    new RegExp(`from ["']@/components/ui/${componentName}["']`, 'g'),
    new RegExp(`from ["'].*components/ui/${componentName}["']`, 'g'),
    // Import com alias
    new RegExp(`from ["']@/components/ui/${componentName.replace('-', '-')}["']`, 'g'),
    // Nome do componente (para casos especiais)
    new RegExp(`\\b${componentName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}\\b`, 'g'),
  ];

  const files = await getAllFiles(SRC_DIR);
  let isUsed = false;
  const usedIn = [];

  for (const file of files) {
    if (file.includes('node_modules') || file.includes('.git')) continue;
    
    try {
      const content = await readFile(file, 'utf-8');
      
      for (const pattern of searchPatterns) {
        if (pattern.test(content)) {
          isUsed = true;
          if (!usedIn.includes(file)) {
            usedIn.push(file);
          }
        }
      }
    } catch (error) {
      // Ignorar erros de leitura
    }
  }

  return { isUsed, usedIn };
}

async function getAllFiles(dir) {
  const files = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          files.push(...await getAllFiles(fullPath));
        }
      } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx') || entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Ignorar erros
  }
  return files;
}

async function main() {
  console.log('🔍 Verificando uso dos componentes UI...\n');

  const results = {
    used: [],
    unused: [],
    internalOnly: [],
  };

  for (const component of uiComponents) {
    const { isUsed, usedIn } = await checkComponentUsage(component);
    
    // Verificar se é usado apenas internamente
    const internalDeps = internalDependencies[component] || [];
    const isInternalOnly = !isUsed && internalDeps.length > 0;

    if (isUsed) {
      results.used.push({ component, usedIn: usedIn.slice(0, 3) }); // Limitar a 3 arquivos
    } else if (isInternalOnly) {
      results.internalOnly.push({ component, internalDeps });
    } else {
      results.unused.push(component);
    }
  }

  console.log('✅ Componentes EM USO:');
  console.log('─'.repeat(50));
  results.used.forEach(({ component, usedIn }) => {
    console.log(`  ✓ ${component}`);
    if (usedIn.length > 0) {
      console.log(`    → ${usedIn[0].replace(process.cwd(), '.')}`);
    }
  });

  console.log('\n⚠️  Componentes usados APENAS internamente:');
  console.log('─'.repeat(50));
  results.internalOnly.forEach(({ component, internalDeps }) => {
    console.log(`  ⚠ ${component} (usado por: ${internalDeps.join(', ')})`);
  });

  console.log('\n❌ Componentes NÃO USADOS:');
  console.log('─'.repeat(50));
  if (results.unused.length === 0) {
    console.log('  Nenhum componente não usado encontrado!');
  } else {
    results.unused.forEach(component => {
      console.log(`  ✗ ${component}.tsx`);
    });
    console.log(`\n💡 Você pode remover ${results.unused.length} componente(s) não usado(s).`);
  }

  console.log('\n' + '='.repeat(50));
  console.log(`Total: ${uiComponents.length} componentes`);
  console.log(`  ✓ Em uso: ${results.used.length}`);
  console.log(`  ⚠ Interno: ${results.internalOnly.length}`);
  console.log(`  ✗ Não usado: ${results.unused.length}`);
}

main().catch(console.error);

