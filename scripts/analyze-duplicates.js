#!/usr/bin/env node

/**
 * Script para identificar código duplicado
 * 
 * Este script identifica:
 * 1. Componentes duplicados (mesmo nome em locais diferentes)
 * 2. Funções similares/duplicadas
 * 3. Arquivos com conteúdo similar
 * 4. Imports duplicados
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';
import crypto from 'crypto';

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
 * Calcula hash do conteúdo de um arquivo
 * Usa o conteúdo completo para detectar arquivos verdadeiramente idênticos
 */
function getFileHash(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Usar conteúdo completo para detectar arquivos idênticos
  // Apenas normalizar quebras de linha para comparar arquivos com diferentes estilos de linha
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  return crypto.createHash('md5').update(normalized).digest('hex');
}

/**
 * Extrai nome do componente/função de um arquivo
 */
function extractComponentName(filePath, content) {
  // Tentar encontrar export default
  const defaultExportMatch = content.match(/export\s+default\s+(?:function\s+)?(\w+)/);
  if (defaultExportMatch) {
    return defaultExportMatch[1];
  }

  // Tentar encontrar export const ComponentName
  const namedExportMatch = content.match(/export\s+(?:const|function|class)\s+(\w+)/);
  if (namedExportMatch) {
    return namedExportMatch[1];
  }

  // Usar nome do arquivo como fallback
  const fileName = path.basename(filePath, path.extname(filePath));
  return fileName;
}

/**
 * Compara similaridade entre dois arquivos (simplificado)
 */
function calculateSimilarity(content1, content2) {
  // Normalizar conteúdos
  const normalize = (str) => str
    .replace(/\s+/g, ' ')
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .trim()
    .toLowerCase();

  const norm1 = normalize(content1);
  const norm2 = normalize(content2);

  // Calcular similaridade usando Jaccard (simplificado)
  const words1 = new Set(norm1.split(/\s+/));
  const words2 = new Set(norm2.split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

/**
 * Encontra componentes com mesmo nome em locais diferentes
 */
async function findDuplicateComponents() {
  const files = await glob('**/*.{js,jsx,ts,tsx}', {
    cwd: SOURCE_DIR,
    ignore: EXCLUDE_PATTERNS,
    absolute: false,
  });

  const componentMap = new Map();

  for (const file of files) {
    const filePath = path.join(SOURCE_DIR, file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const componentName = extractComponentName(file, content);
      
      if (!componentMap.has(componentName)) {
        componentMap.set(componentName, []);
      }
      componentMap.get(componentName).push({
        file,
        path: filePath,
        content,
      });
    } catch (error) {
      // Ignorar erros de leitura
    }
  }

  const duplicates = [];
  for (const [name, files] of componentMap.entries()) {
    if (files.length > 1) {
      duplicates.push({ name, files });
    }
  }

  return duplicates;
}

/**
 * Encontra arquivos com conteúdo idêntico ou muito similar
 */
async function findSimilarFiles() {
  const files = await glob('**/*.{js,jsx,ts,tsx}', {
    cwd: SOURCE_DIR,
    ignore: EXCLUDE_PATTERNS,
    absolute: false,
  });

  const fileHashes = new Map();
  const hashGroups = new Map();

  // Calcular hashes
  for (const file of files) {
    const filePath = path.join(SOURCE_DIR, file);
    try {
      const hash = getFileHash(filePath);
      if (!hashGroups.has(hash)) {
        hashGroups.set(hash, []);
      }
      hashGroups.get(hash).push(file);
      fileHashes.set(file, hash);
    } catch (error) {
      // Ignorar erros
    }
  }

  // Encontrar grupos de arquivos idênticos
  const identicalFiles = [];
  for (const [hash, fileList] of hashGroups.entries()) {
    if (fileList.length > 1) {
      identicalFiles.push({ hash, files: fileList });
    }
  }

  // Encontrar arquivos similares (não idênticos)
  const similarFiles = [];
  const processed = new Set();

  for (let i = 0; i < files.length; i++) {
    if (processed.has(files[i])) continue;

    const file1 = files[i];
    const path1 = path.join(SOURCE_DIR, file1);
    
    try {
      const content1 = fs.readFileSync(path1, 'utf8');
      const similar = [];

      for (let j = i + 1; j < files.length; j++) {
        const file2 = files[j];
        if (processed.has(file2)) continue;
        if (fileHashes.get(file1) === fileHashes.get(file2)) continue; // Já são idênticos

        const path2 = path.join(SOURCE_DIR, file2);
        try {
          const content2 = fs.readFileSync(path2, 'utf8');
          const similarity = calculateSimilarity(content1, content2);
          
          if (similarity > 0.8) { // 80% de similaridade
            similar.push({ file: file2, similarity: (similarity * 100).toFixed(1) });
            processed.add(file2);
          }
        } catch (error) {
          // Ignorar
        }
      }

      if (similar.length > 0) {
        similarFiles.push({ file: file1, similar });
        processed.add(file1);
      }
    } catch (error) {
      // Ignorar
    }
  }

  return { identicalFiles, similarFiles };
}

/**
 * Analisa duplicações
 */
async function analyzeDuplicates() {
  console.log(`${colors.cyan}🔍 Analisando código duplicado...${colors.reset}\n`);

  // 1. Componentes com mesmo nome
  console.log(`${colors.blue}1. Buscando componentes com mesmo nome...${colors.reset}`);
  const duplicateComponents = await findDuplicateComponents();
  console.log(`${colors.green}✓${colors.reset} Encontrados ${duplicateComponents.length} grupos de componentes duplicados\n`);

  // 2. Arquivos idênticos/similares
  console.log(`${colors.blue}2. Buscando arquivos idênticos ou similares...${colors.reset}`);
  const { identicalFiles, similarFiles } = await findSimilarFiles();
  console.log(`${colors.green}✓${colors.reset} Encontrados ${identicalFiles.length} grupos de arquivos idênticos`);
  console.log(`${colors.green}✓${colors.reset} Encontrados ${similarFiles.length} grupos de arquivos similares\n`);

  // Gerar relatório
  console.log(`${colors.yellow}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}RELATÓRIO DE CÓDIGO DUPLICADO${colors.reset}`);
  console.log(`${colors.yellow}═══════════════════════════════════════════════════════════${colors.reset}\n`);

  if (duplicateComponents.length > 0) {
    console.log(`${colors.cyan}📦 Componentes com mesmo nome (${duplicateComponents.length} grupos):${colors.reset}`);
    duplicateComponents.forEach(({ name, files }) => {
      console.log(`\n  ${colors.yellow}${name}${colors.reset} (${files.length} ocorrências):`);
      files.forEach(({ file }) => {
        console.log(`    - ${file}`);
      });
    });
    console.log();
  }

  if (identicalFiles.length > 0) {
    console.log(`${colors.cyan}📄 Arquivos idênticos (${identicalFiles.length} grupos):${colors.reset}`);
    identicalFiles.forEach(({ files }) => {
      console.log(`\n  ${files.length} arquivos idênticos:`);
      files.forEach(file => {
        console.log(`    - ${file}`);
      });
    });
    console.log();
  }

  if (similarFiles.length > 0) {
    console.log(`${colors.cyan}🔗 Arquivos similares (${similarFiles.length} grupos):${colors.reset}`);
    similarFiles.slice(0, 10).forEach(({ file, similar }) => {
      console.log(`\n  ${colors.yellow}${file}${colors.reset}:`);
      similar.forEach(({ file: similarFile, similarity }) => {
        console.log(`    - ${similarFile} (${similarity}% similar)`);
      });
    });
    if (similarFiles.length > 10) {
      console.log(`\n  ... e mais ${similarFiles.length - 10} grupos`);
    }
    console.log();
  }

  // Salvar relatório
  const reportPath = path.join(__dirname, '../reports/duplicates-report.json');
  const reportDir = path.dirname(reportPath);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      duplicateComponents: duplicateComponents.length,
      identicalFiles: identicalFiles.length,
      similarFiles: similarFiles.length,
    },
    duplicateComponents,
    identicalFiles,
    similarFiles,
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`${colors.green}✓${colors.reset} Relatório salvo em: ${colors.cyan}${reportPath}${colors.reset}\n`);

  // Estatísticas
  console.log(`${colors.yellow}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}ESTATÍSTICAS${colors.reset}`);
  console.log(`${colors.yellow}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`Componentes duplicados:        ${colors.red}${duplicateComponents.length}${colors.reset} grupos`);
  console.log(`Arquivos idênticos:            ${colors.red}${identicalFiles.length}${colors.reset} grupos`);
  console.log(`Arquivos similares (>80%):     ${colors.yellow}${similarFiles.length}${colors.reset} grupos`);
  console.log();
}

// Executar
analyzeDuplicates().catch(console.error);
