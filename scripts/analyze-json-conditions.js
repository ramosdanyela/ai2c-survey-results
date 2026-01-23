#!/usr/bin/env node

/**
 * Script para identificar condições if que verificam modelos JSON
 * 
 * Este script identifica:
 * 1. Condições if que verificam propriedades de JSON (type, model, pattern, etc.)
 * 2. Switch/case com tipos de componentes JSON
 * 3. Validações de estrutura JSON
 * 4. Código que pode ser simplificado ou removido
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

const SOURCE_DIR = path.join(__dirname, '../src');
const EXCLUDE_PATTERNS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/*.test.js',
  '**/*.test.jsx',
];

/**
 * Padrões de condições if relacionadas a JSON
 */
const JSON_CONDITION_PATTERNS = [
  // Verificações de tipo
  /if\s*\([^)]*\.type\s*===?\s*['"]([^'"]+)['"]/g,
  /if\s*\([^)]*\.type\s*!==?\s*['"]([^'"]+)['"]/g,
  /if\s*\([^)]*type\s*===?\s*['"]([^'"]+)['"]/g,
  
  // Verificações de modelo/pattern
  /if\s*\([^)]*\.(model|pattern|structure|schema)\s*===?\s*['"]([^'"]+)['"]/g,
  /if\s*\([^)]*\.(model|pattern|structure|schema)\s*!==?\s*['"]([^'"]+)['"]/g,
  
  // Verificações de propriedades JSON comuns
  /if\s*\([^)]*\.(componentType|widgetType|chartType|cardType)\s*===?\s*['"]([^'"]+)['"]/g,
  
  // Verificações de estrutura
  /if\s*\([^)]*\.(renderSchema|subsections|components)\s*\)/g,
  /if\s*\([^)]*\[['"](type|model|pattern)['"]\]/g,
];

/**
 * Padrões de switch/case com tipos JSON
 */
const SWITCH_PATTERNS = [
  /switch\s*\([^)]*\.type[^)]*\)\s*\{[\s\S]*?case\s+['"]([^'"]+)['"]/g,
  /switch\s*\([^)]*type[^)]*\)\s*\{[\s\S]*?case\s+['"]([^'"]+)['"]/g,
];

/**
 * Encontra condições if relacionadas a JSON
 */
function findJsonConditions(content, filePath) {
  const findings = [];

  // Buscar padrões de if
  JSON_CONDITION_PATTERNS.forEach(pattern => {
    const regex = new RegExp(pattern.source, 'g');
    let match;
    while ((match = regex.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const line = content.split('\n')[lineNumber - 1]?.trim();
      
      findings.push({
        type: 'if-condition',
        pattern: pattern.source,
        match: match[0],
        value: match[1] || match[2],
        line: lineNumber,
        lineContent: line,
      });
    }
  });

  // Buscar switch/case
  SWITCH_PATTERNS.forEach(pattern => {
    const regex = new RegExp(pattern.source, 'g');
    let match;
    while ((match = regex.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const line = content.split('\n')[lineNumber - 1]?.trim();
      
      findings.push({
        type: 'switch-case',
        pattern: pattern.source,
        match: match[0],
        value: match[1],
        line: lineNumber,
        lineContent: line,
      });
    }
  });

  // Buscar verificações de estrutura JSON
  const structurePatterns = [
    /if\s*\([^)]*\.(renderSchema|subsections|components|data)\s*\)/g,
    /if\s*\([^)]*\[['"]type['"]\]/g,
    /if\s*\([^)]*\[['"]model['"]\]/g,
  ];

  structurePatterns.forEach(pattern => {
    const regex = new RegExp(pattern.source, 'g');
    let match;
    while ((match = regex.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const line = content.split('\n')[lineNumber - 1]?.trim();
      
      findings.push({
        type: 'structure-check',
        pattern: pattern.source,
        match: match[0],
        line: lineNumber,
        lineContent: line,
      });
    }
  });

  return findings;
}

/**
 * Agrupa condições por tipo de valor verificado
 */
function groupByValue(findings) {
  const grouped = new Map();

  findings.forEach(finding => {
    if (finding.value) {
      if (!grouped.has(finding.value)) {
        grouped.set(finding.value, []);
      }
      grouped.get(finding.value).push(finding);
    }
  });

  return grouped;
}

/**
 * Analisa condições JSON
 */
async function analyzeJsonConditions() {
  console.log(`${colors.cyan}🔍 Analisando condições if com modelos JSON...${colors.reset}\n`);

  const files = await glob('**/*.{js,jsx,ts,tsx}', {
    cwd: SOURCE_DIR,
    ignore: EXCLUDE_PATTERNS,
    absolute: false,
  });

  const allFindings = [];
  const fileFindings = new Map();

  for (const file of files) {
    const filePath = path.join(SOURCE_DIR, file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const findings = findJsonConditions(content, filePath);
      
      if (findings.length > 0) {
        allFindings.push(...findings);
        fileFindings.set(file, findings);
      }
    } catch (error) {
      // Ignorar erros
    }
  }

  console.log(`${colors.green}✓${colors.reset} Analisados ${files.length} arquivos`);
  console.log(`${colors.green}✓${colors.reset} Encontradas ${allFindings.length} condições relacionadas a JSON\n`);

  // Agrupar por tipo
  const byType = {
    'if-condition': allFindings.filter(f => f.type === 'if-condition'),
    'switch-case': allFindings.filter(f => f.type === 'switch-case'),
    'structure-check': allFindings.filter(f => f.type === 'structure-check'),
  };

  // Agrupar por valor
  const byValue = groupByValue(allFindings.filter(f => f.value));

  // Gerar relatório
  console.log(`${colors.yellow}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}RELATÓRIO DE CONDIÇÕES IF COM MODELOS JSON${colors.reset}`);
  console.log(`${colors.yellow}═══════════════════════════════════════════════════════════${colors.reset}\n`);

  console.log(`${colors.cyan}📊 Resumo por tipo:${colors.reset}`);
  console.log(`  Condições if:              ${colors.yellow}${byType['if-condition'].length}${colors.reset}`);
  console.log(`  Switch/case:                ${colors.yellow}${byType['switch-case'].length}${colors.reset}`);
  console.log(`  Verificações de estrutura:  ${colors.yellow}${byType['structure-check'].length}${colors.reset}`);
  console.log();

  if (byValue.size > 0) {
    console.log(`${colors.cyan}📋 Valores mais verificados:${colors.reset}`);
    const sortedValues = Array.from(byValue.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 20);
    
    sortedValues.forEach(([value, findings]) => {
      console.log(`  ${colors.yellow}${value}${colors.reset}: ${findings.length} ocorrências`);
    });
    console.log();
  }

  // Mostrar exemplos por arquivo
  if (fileFindings.size > 0) {
    console.log(`${colors.cyan}📄 Arquivos com mais condições JSON:${colors.reset}`);
    const sortedFiles = Array.from(fileFindings.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 10);
    
    sortedFiles.forEach(([file, findings]) => {
      console.log(`\n  ${colors.yellow}${file}${colors.reset} (${findings.length} condições):`);
      findings.slice(0, 5).forEach(finding => {
        console.log(`    Linha ${finding.line}: ${finding.lineContent?.substring(0, 80)}...`);
      });
      if (findings.length > 5) {
        console.log(`    ... e mais ${findings.length - 5} condições`);
      }
    });
    console.log();
  }

  // Salvar relatório
  const reportPath = path.join(__dirname, '../reports/json-conditions-report.json');
  const reportDir = path.dirname(reportPath);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalFiles: files.length,
      totalFindings: allFindings.length,
      byType: {
        ifCondition: byType['if-condition'].length,
        switchCase: byType['switch-case'].length,
        structureCheck: byType['structure-check'].length,
      },
      uniqueValues: byValue.size,
    },
    findings: allFindings,
    byFile: Object.fromEntries(fileFindings),
    byValue: Object.fromEntries(byValue),
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`${colors.green}✓${colors.reset} Relatório salvo em: ${colors.cyan}${reportPath}${colors.reset}\n`);

  // Estatísticas
  console.log(`${colors.yellow}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}ESTATÍSTICAS${colors.reset}`);
  console.log(`${colors.yellow}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`Total de arquivos analisados:  ${colors.bright}${files.length}${colors.reset}`);
  console.log(`Total de condições encontradas: ${colors.yellow}${allFindings.length}${colors.reset}`);
  console.log(`Valores únicos verificados:     ${colors.cyan}${byValue.size}${colors.reset}`);
  console.log();
}

// Executar
analyzeJsonConditions().catch(console.error);
