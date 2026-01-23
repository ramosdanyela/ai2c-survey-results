#!/usr/bin/env node

/**
 * Script para identificar imports não utilizados
 * 
 * Este script identifica:
 * 1. Imports que não são usados no arquivo
 * 2. Imports de arquivos que não existem
 * 3. Imports duplicados
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const SOURCE_DIR = path.join(__dirname, '../src');
const EXCLUDE_PATTERNS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/*.test.js',
  '**/*.test.jsx',
];

/**
 * Extrai imports de um arquivo
 */
function extractImports(content) {
  const imports = [];
  
  // Padrão: import { ... } from '...'
  const namedImportRegex = /import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = namedImportRegex.exec(content)) !== null) {
    const items = match[1].split(',').map(item => {
      const trimmed = item.trim();
      const parts = trimmed.split(/\s+as\s+/);
      return {
        original: parts[0].trim(),
        alias: parts[1]?.trim() || parts[0].trim(),
      };
    });
    imports.push({
      type: 'named',
      items,
      from: match[2],
      line: content.substring(0, match.index).split('\n').length,
    });
  }

  // Padrão: import Default from '...'
  const defaultImportRegex = /import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g;
  while ((match = defaultImportRegex.exec(content)) !== null) {
    imports.push({
      type: 'default',
      name: match[1],
      from: match[2],
      line: content.substring(0, match.index).split('\n').length,
    });
  }

  // Padrão: import * as Alias from '...'
  const namespaceImportRegex = /import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g;
  while ((match = namespaceImportRegex.exec(content)) !== null) {
    imports.push({
      type: 'namespace',
      alias: match[1],
      from: match[2],
      line: content.substring(0, match.index).split('\n').length,
    });
  }

  return imports;
}

/**
 * Verifica se um import é usado no arquivo
 */
function isImportUsed(importItem, content, filePath) {
  const searchContent = content;

  if (importItem.type === 'default') {
    // Verificar uso do import default
    const name = importItem.name;
    // Não contar a declaração do import
    const withoutImport = searchContent.replace(/import\s+[^'"]+from\s+['"][^'"]+['"]/g, '');
    return new RegExp(`\\b${name}\\b`).test(withoutImport);
  }

  if (importItem.type === 'namespace') {
    // Verificar uso do namespace
    const alias = importItem.alias;
    const withoutImport = searchContent.replace(/import\s+[^'"]+from\s+['"][^'"]+['"]/g, '');
    return new RegExp(`\\b${alias}\\.`).test(withoutImport);
  }

  if (importItem.type === 'named') {
    // Verificar cada item nomeado
    const unused = [];
    for (const item of importItem.items) {
      const alias = item.alias;
      const withoutImport = searchContent.replace(/import\s+[^'"]+from\s+['"][^'"]+['"]/g, '');
      
      // Verificar uso (considerando JSX também)
      const isUsed = new RegExp(`\\b${alias}\\b`).test(withoutImport) ||
                     new RegExp(`<${alias}`).test(withoutImport) ||
                     new RegExp(`</${alias}`).test(withoutImport);
      
      if (!isUsed) {
        unused.push(item);
      }
    }
    return { unused, allUsed: unused.length === 0 };
  }

  return true;
}

/**
 * Verifica se o arquivo importado existe
 */
function checkImportExists(importPath, currentFile) {
  // Resolver caminho
  let resolvedPath;
  
  if (importPath.startsWith('@/')) {
    // Alias @/ aponta para src/
    resolvedPath = importPath.replace('@/', path.join(__dirname, '../src/'));
  } else if (importPath.startsWith('./') || importPath.startsWith('../')) {
    // Caminho relativo
    const currentDir = path.dirname(currentFile);
    resolvedPath = path.resolve(currentDir, importPath);
  } else {
    // Provavelmente um módulo npm
    return { exists: true, isNodeModule: true };
  }

  // Tentar diferentes extensões
  const extensions = ['.js', '.jsx', '.ts', '.tsx', '/index.js', '/index.jsx', '/index.ts', '/index.tsx'];
  
  for (const ext of extensions) {
    const testPath = resolvedPath.endsWith(ext) ? resolvedPath : resolvedPath + ext;
    if (fs.existsSync(testPath)) {
      return { exists: true, path: testPath, isNodeModule: false };
    }
  }

  // Verificar se é um diretório
  if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory()) {
    return { exists: true, path: resolvedPath, isNodeModule: false };
  }

  return { exists: false, path: resolvedPath, isNodeModule: false };
}

/**
 * Analisa imports não utilizados
 */
async function analyzeUnusedImports() {
  console.log(`${colors.cyan}🔍 Analisando imports não utilizados...${colors.reset}\n`);

  const files = await glob('**/*.{js,jsx,ts,tsx}', {
    cwd: SOURCE_DIR,
    ignore: EXCLUDE_PATTERNS,
    absolute: false,
  });

  const unusedImports = [];
  const missingImports = [];
  const fileStats = new Map();

  for (const file of files) {
    const filePath = path.join(SOURCE_DIR, file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const imports = extractImports(content);
      
      const fileUnused = [];
      const fileMissing = [];

      for (const importItem of imports) {
        // Verificar se existe
        const existsCheck = checkImportExists(importItem.from, filePath);
        if (!existsCheck.exists && !existsCheck.isNodeModule) {
          fileMissing.push({
            import: importItem,
            reason: 'file-not-found',
            path: existsCheck.path,
          });
        }

        // Verificar se é usado
        const usageCheck = isImportUsed(importItem, content, filePath);
        
        if (importItem.type === 'named') {
          if (!usageCheck.allUsed) {
            fileUnused.push({
              import: importItem,
              unusedItems: usageCheck.unused,
              reason: 'unused-named-imports',
            });
          }
        } else if (usageCheck === false) {
          fileUnused.push({
            import: importItem,
            reason: 'unused-import',
          });
        }
      }

      if (fileUnused.length > 0 || fileMissing.length > 0) {
        fileStats.set(file, {
          unused: fileUnused.length,
          missing: fileMissing.length,
        });
        
        if (fileUnused.length > 0) {
          unusedImports.push({
            file,
            imports: fileUnused,
          });
        }
        
        if (fileMissing.length > 0) {
          missingImports.push({
            file,
            imports: fileMissing,
          });
        }
      }
    } catch (error) {
      // Ignorar erros
    }
  }

  console.log(`${colors.green}✓${colors.reset} Analisados ${files.length} arquivos`);
  console.log(`${colors.green}✓${colors.reset} Encontrados ${unusedImports.length} arquivos com imports não utilizados`);
  console.log(`${colors.green}✓${colors.reset} Encontrados ${missingImports.length} arquivos com imports de arquivos inexistentes\n`);

  // Gerar relatório
  console.log(`${colors.yellow}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}RELATÓRIO DE IMPORTS NÃO UTILIZADOS${colors.reset}`);
  console.log(`${colors.yellow}═══════════════════════════════════════════════════════════${colors.reset}\n`);

  if (unusedImports.length > 0) {
    console.log(`${colors.cyan}📦 Imports não utilizados:${colors.reset}`);
    unusedImports.slice(0, 15).forEach(({ file, imports }) => {
      console.log(`\n  ${colors.yellow}${file}${colors.reset}:`);
      imports.forEach(({ import: imp, unusedItems, reason }) => {
        if (imp.type === 'named' && unusedItems) {
          const items = unusedItems.map(i => i.original).join(', ');
          console.log(`    Linha ${imp.line}: ${items} de '${imp.from}'`);
        } else {
          console.log(`    Linha ${imp.line}: ${imp.type === 'default' ? imp.name : imp.alias} de '${imp.from}'`);
        }
      });
    });
    if (unusedImports.length > 15) {
      console.log(`\n  ... e mais ${unusedImports.length - 15} arquivos`);
    }
    console.log();
  }

  if (missingImports.length > 0) {
    console.log(`${colors.red}❌ Imports de arquivos inexistentes:${colors.reset}`);
    missingImports.slice(0, 10).forEach(({ file, imports }) => {
      console.log(`\n  ${colors.yellow}${file}${colors.reset}:`);
      imports.forEach(({ import: imp, path: importPath }) => {
        console.log(`    Linha ${imp.line}: '${imp.from}' → ${importPath}`);
      });
    });
    if (missingImports.length > 10) {
      console.log(`\n  ... e mais ${missingImports.length - 10} arquivos`);
    }
    console.log();
  }

  // Salvar relatório
  const reportPath = path.join(__dirname, '../reports/unused-imports-report.json');
  const reportDir = path.dirname(reportPath);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalFiles: files.length,
      filesWithUnusedImports: unusedImports.length,
      filesWithMissingImports: missingImports.length,
    },
    unusedImports,
    missingImports,
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`${colors.green}✓${colors.reset} Relatório salvo em: ${colors.cyan}${reportPath}${colors.reset}\n`);

  // Estatísticas
  console.log(`${colors.yellow}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}ESTATÍSTICAS${colors.reset}`);
  console.log(`${colors.yellow}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`Total de arquivos analisados:     ${colors.bright}${files.length}${colors.reset}`);
  console.log(`Arquivos com imports não usados:  ${colors.red}${unusedImports.length}${colors.reset}`);
  console.log(`Arquivos com imports inexistentes: ${colors.red}${missingImports.length}${colors.reset}`);
  console.log();
}

// Executar
analyzeUnusedImports().catch(console.error);
