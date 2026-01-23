#!/usr/bin/env node

/**
 * Script para analisar código não utilizado no repositório
 * 
 * Este script identifica:
 * 1. Funções exportadas mas não importadas
 * 2. Componentes não utilizados
 * 3. Arquivos não importados
 * 4. Hooks não utilizados
 * 5. Utilitários não utilizados
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
  magenta: '\x1b[35m',
};

// Diretórios a serem analisados
const SOURCE_DIR = path.join(__dirname, '../src');
const EXCLUDE_PATTERNS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/*.test.js',
  '**/*.test.jsx',
  '**/*.spec.js',
  '**/*.spec.jsx',
];

/**
 * Extrai exports de um arquivo
 */
function extractExports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const exports = {
    default: false,
    named: [],
    components: [],
    functions: [],
    hooks: [],
  };

  // Detectar export default
  if (/export\s+default/.test(content)) {
    exports.default = true;
  }

  // Detectar named exports
  const namedExportRegex = /export\s+(?:const|function|class|let|var)\s+(\w+)/g;
  let match;
  while ((match = namedExportRegex.exec(content)) !== null) {
    const name = match[1];
    exports.named.push(name);
    
    // Classificar por tipo
    if (name.startsWith('use') || name.startsWith('Use')) {
      exports.hooks.push(name);
    } else if (/^[A-Z]/.test(name)) {
      exports.components.push(name);
    } else {
      exports.functions.push(name);
    }
  }

  // Detectar export { ... }
  const exportListRegex = /export\s*\{([^}]+)\}/g;
  while ((match = exportListRegex.exec(content)) !== null) {
    const items = match[1]
      .split(',')
      .map(item => item.trim().split(/\s+as\s+/)[0].trim())
      .filter(Boolean);
    exports.named.push(...items);
  }

  return exports;
}

/**
 * Extrai imports de um arquivo
 */
function extractImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const imports = new Set();

  // Detectar imports relativos e absolutos
  const importRegex = /import\s+(?:(?:\*\s+as\s+\w+)|(?:\{[^}]+\})|(?:\w+)|(?:\w+\s*,\s*\{[^}]+\}))\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    let importPath = match[1];
    
    // Resolver caminhos relativos
    if (importPath.startsWith('@/')) {
      importPath = importPath.replace('@/', 'src/');
    } else if (importPath.startsWith('./') || importPath.startsWith('../')) {
      const dir = path.dirname(filePath);
      const resolved = path.resolve(dir, importPath);
      importPath = path.relative(path.join(__dirname, '..'), resolved);
    }
    
    // Normalizar caminho
    importPath = importPath.replace(/\\/g, '/');
    if (!importPath.endsWith('.js') && !importPath.endsWith('.jsx') && !importPath.endsWith('.ts') && !importPath.endsWith('.tsx')) {
      // Tentar adicionar extensão
      const possiblePaths = [
        `${importPath}.js`,
        `${importPath}.jsx`,
        `${importPath}/index.js`,
        `${importPath}/index.jsx`,
      ];
      possiblePaths.forEach(p => imports.add(p));
    } else {
      imports.add(importPath);
    }
  }

  return Array.from(imports);
}

/**
 * Encontra todos os arquivos fonte
 */
async function findAllSourceFiles() {
  const files = await glob('**/*.{js,jsx,ts,tsx}', {
    cwd: SOURCE_DIR,
    ignore: EXCLUDE_PATTERNS,
    absolute: false,
  });
  return files.map(f => ({
    relative: f,
    absolute: path.join(SOURCE_DIR, f),
  }));
}

/**
 * Analisa uso de exports
 */
async function analyzeUnusedCode() {
  console.log(`${colors.cyan}🔍 Analisando código não utilizado...${colors.reset}\n`);

  const files = await findAllSourceFiles();
  console.log(`${colors.green}✓${colors.reset} Encontrados ${files.length} arquivos fonte\n`);

  // Mapa de arquivos para exports
  const fileExports = new Map();
  // Mapa de arquivos para imports
  const fileImports = new Map();
  // Set de todos os imports encontrados
  const allImports = new Set();

  // Primeira passada: extrair exports e imports
  for (const file of files) {
    try {
      const exports = extractExports(file.relative);
      fileExports.set(file.relative, exports);
      
      const imports = extractImports(file.absolute);
      fileImports.set(file.relative, imports);
      imports.forEach(imp => allImports.add(imp));
    } catch (error) {
      console.warn(`${colors.yellow}⚠${colors.reset} Erro ao processar ${file.relative}: ${error.message}`);
    }
  }

  // Segunda passada: verificar quais exports são usados
  const unusedExports = [];
  const unusedFiles = [];
  const unusedComponents = [];
  const unusedFunctions = [];
  const unusedHooks = [];

  for (const file of files) {
    const exports = fileExports.get(file.relative);
    if (!exports) continue;

    const filePath = file.relative.replace(/\.(js|jsx|ts|tsx)$/, '');
    
    // Verificar se o arquivo é importado
    let isFileImported = false;
    for (const imp of allImports) {
      if (imp.includes(filePath) || imp.replace(/\.(js|jsx|ts|tsx)$/, '') === filePath) {
        isFileImported = true;
        break;
      }
    }

    // Verificar exports não utilizados
    for (const namedExport of exports.named) {
      // Buscar se o export é usado em algum import
      let isUsed = false;
      for (const [importFile, imports] of fileImports.entries()) {
        const importContent = fs.readFileSync(path.join(SOURCE_DIR, importFile), 'utf8');
        // Verificar se o nome do export aparece em imports nomeados
        const namedImportRegex = new RegExp(`import\\s+.*\\{\\s*[^}]*\\b${namedExport}\\b[^}]*\\}`, 'g');
        if (namedImportRegex.test(importContent)) {
          isUsed = true;
          break;
        }
      }

      if (!isUsed && !isFileImported) {
        unusedExports.push({
          file: file.relative,
          export: namedExport,
          type: exports.components.includes(namedExport) ? 'component' :
                exports.hooks.includes(namedExport) ? 'hook' :
                'function',
        });

        if (exports.components.includes(namedExport)) {
          unusedComponents.push({ file: file.relative, component: namedExport });
        } else if (exports.hooks.includes(namedExport)) {
          unusedHooks.push({ file: file.relative, hook: namedExport });
        } else {
          unusedFunctions.push({ file: file.relative, function: namedExport });
        }
      }
    }

    // Verificar arquivos não importados (exceto entry points)
    if (!isFileImported && !file.relative.includes('main.') && !file.relative.includes('App.') && !file.relative.includes('index.')) {
      // Verificar se é um arquivo de entrada
      const isEntryPoint = file.relative.includes('main.jsx') || 
                          file.relative.includes('App.jsx') ||
                          file.relative.includes('index.jsx') ||
                          file.relative.includes('index.js');
      
      if (!isEntryPoint && exports.named.length === 0 && !exports.default) {
        unusedFiles.push(file.relative);
      }
    }
  }

  // Gerar relatório
  console.log(`${colors.yellow}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}RELATÓRIO DE CÓDIGO NÃO UTILIZADO${colors.reset}`);
  console.log(`${colors.yellow}═══════════════════════════════════════════════════════════${colors.reset}\n`);

  if (unusedComponents.length > 0) {
    console.log(`${colors.cyan}📦 Componentes não utilizados (${unusedComponents.length}):${colors.reset}`);
    unusedComponents.slice(0, 20).forEach(({ file, component }) => {
      console.log(`  ${colors.yellow}${file}${colors.reset} → ${component}`);
    });
    if (unusedComponents.length > 20) {
      console.log(`  ... e mais ${unusedComponents.length - 20} componentes`);
    }
    console.log();
  }

  if (unusedHooks.length > 0) {
    console.log(`${colors.cyan}🪝 Hooks não utilizados (${unusedHooks.length}):${colors.reset}`);
    unusedHooks.slice(0, 20).forEach(({ file, hook }) => {
      console.log(`  ${colors.yellow}${file}${colors.reset} → ${hook}`);
    });
    if (unusedHooks.length > 20) {
      console.log(`  ... e mais ${unusedHooks.length - 20} hooks`);
    }
    console.log();
  }

  if (unusedFunctions.length > 0) {
    console.log(`${colors.cyan}⚙️  Funções não utilizadas (${unusedFunctions.length}):${colors.reset}`);
    unusedFunctions.slice(0, 20).forEach(({ file, function: fn }) => {
      console.log(`  ${colors.yellow}${file}${colors.reset} → ${fn}`);
    });
    if (unusedFunctions.length > 20) {
      console.log(`  ... e mais ${unusedFunctions.length - 20} funções`);
    }
    console.log();
  }

  if (unusedFiles.length > 0) {
    console.log(`${colors.cyan}📄 Arquivos não importados (${unusedFiles.length}):${colors.reset}`);
    unusedFiles.slice(0, 20).forEach(file => {
      console.log(`  ${colors.yellow}${file}${colors.reset}`);
    });
    if (unusedFiles.length > 20) {
      console.log(`  ... e mais ${unusedFiles.length - 20} arquivos`);
    }
    console.log();
  }

  // Salvar relatório
  const reportPath = path.join(__dirname, '../reports/unused-code-report.json');
  const reportDir = path.dirname(reportPath);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalFiles: files.length,
      unusedComponents: unusedComponents.length,
      unusedHooks: unusedHooks.length,
      unusedFunctions: unusedFunctions.length,
      unusedFiles: unusedFiles.length,
    },
    unusedComponents,
    unusedHooks,
    unusedFunctions,
    unusedFiles,
    allUnusedExports: unusedExports,
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`${colors.green}✓${colors.reset} Relatório salvo em: ${colors.cyan}${reportPath}${colors.reset}\n`);

  // Estatísticas
  console.log(`${colors.yellow}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}ESTATÍSTICAS${colors.reset}`);
  console.log(`${colors.yellow}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`Total de arquivos analisados:  ${colors.bright}${files.length}${colors.reset}`);
  console.log(`Componentes não utilizados:    ${colors.red}${unusedComponents.length}${colors.reset}`);
  console.log(`Hooks não utilizados:          ${colors.red}${unusedHooks.length}${colors.reset}`);
  console.log(`Funções não utilizadas:        ${colors.red}${unusedFunctions.length}${colors.reset}`);
  console.log(`Arquivos não importados:       ${colors.red}${unusedFiles.length}${colors.reset}`);
  console.log();
}

// Executar
analyzeUnusedCode().catch(console.error);
