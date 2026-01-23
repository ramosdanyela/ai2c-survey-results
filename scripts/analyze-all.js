#!/usr/bin/env node

/**
 * Script master para executar todas as análises de código
 * 
 * Executa:
 * 1. Análise de código não utilizado
 * 2. Análise de código duplicado
 * 3. Análise de condições if com JSON
 * 4. Análise de imports não utilizados
 * 
 * Gera um relatório consolidado
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
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

const SCRIPTS_DIR = path.join(__dirname);
const REPORTS_DIR = path.join(__dirname, '../reports');

/**
 * Executa um script e retorna o resultado
 */
async function runScript(scriptName, description) {
  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}${description}${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);

  try {
    const scriptPath = path.join(SCRIPTS_DIR, scriptName);
    const { stdout, stderr } = await execAsync(`node "${scriptPath}"`, {
      cwd: path.join(__dirname, '..'),
    });
    
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    
    return { success: true, output: stdout };
  } catch (error) {
    console.error(`${colors.red}Erro ao executar ${scriptName}:${colors.reset}`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Consolida todos os relatórios
 */
function consolidateReports() {
  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}Consolidando relatórios...${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);

  const reports = {};
  const reportFiles = [
    'unused-code-report.json',
    'duplicates-report.json',
    'json-conditions-report.json',
    'unused-imports-report.json',
    'unused-fields-report.json',
  ];

  for (const reportFile of reportFiles) {
    const reportPath = path.join(REPORTS_DIR, reportFile);
    if (fs.existsSync(reportPath)) {
      try {
        const content = fs.readFileSync(reportPath, 'utf8');
        reports[reportFile.replace('-report.json', '')] = JSON.parse(content);
        console.log(`${colors.green}✓${colors.reset} Carregado: ${reportFile}`);
      } catch (error) {
        console.warn(`${colors.yellow}⚠${colors.reset} Erro ao carregar ${reportFile}: ${error.message}`);
      }
    }
  }

  // Gerar relatório consolidado
  const consolidated = {
    generatedAt: new Date().toISOString(),
    summary: {
      unusedCode: reports['unused-code']?.summary || {},
      duplicates: reports['duplicates']?.summary || {},
      jsonConditions: reports['json-conditions']?.summary || {},
      unusedImports: reports['unused-imports']?.summary || {},
      unusedFields: reports['unused-fields']?.summary || {},
    },
    reports,
    recommendations: generateRecommendations(reports),
  };

  const consolidatedPath = path.join(REPORTS_DIR, 'consolidated-analysis-report.json');
  fs.writeFileSync(consolidatedPath, JSON.stringify(consolidated, null, 2), 'utf8');
  
  console.log(`\n${colors.green}✓${colors.reset} Relatório consolidado salvo em: ${colors.cyan}${consolidatedPath}${colors.reset}`);

  return consolidated;
}

/**
 * Gera recomendações baseadas nos relatórios
 */
function generateRecommendations(reports) {
  const recommendations = [];

  // Recomendações sobre código não utilizado
  if (reports['unused-code']) {
    const { unusedComponents, unusedFunctions, unusedHooks, unusedFiles } = reports['unused-code'].summary;
    if (unusedComponents > 0) {
      recommendations.push({
        priority: 'high',
        category: 'unused-code',
        issue: `${unusedComponents} componentes não utilizados encontrados`,
        action: 'Revisar e remover componentes não utilizados para reduzir o tamanho do bundle',
        files: reports['unused-code'].unusedComponents?.slice(0, 5) || [],
      });
    }
    if (unusedFiles.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'unused-code',
        issue: `${unusedFiles.length} arquivos não importados`,
        action: 'Verificar se esses arquivos são realmente necessários ou podem ser removidos',
        files: reports['unused-code'].unusedFiles?.slice(0, 5) || [],
      });
    }
  }

  // Recomendações sobre duplicações
  if (reports['duplicates']) {
    const { duplicateComponents, identicalFiles } = reports['duplicates'].summary;
    if (duplicateComponents > 0) {
      recommendations.push({
        priority: 'high',
        category: 'duplicates',
        issue: `${duplicateComponents} grupos de componentes duplicados`,
        action: 'Consolidar componentes duplicados em uma única implementação',
        examples: reports['duplicates'].duplicateComponents?.slice(0, 3) || [],
      });
    }
    if (identicalFiles > 0) {
      recommendations.push({
        priority: 'high',
        category: 'duplicates',
        issue: `${identicalFiles} grupos de arquivos idênticos`,
        action: 'Remover arquivos duplicados e manter apenas uma versão',
        examples: reports['duplicates'].identicalFiles?.slice(0, 3) || [],
      });
    }
  }

  // Recomendações sobre condições JSON
  if (reports['json-conditions']) {
    const { totalFindings } = reports['json-conditions'].summary;
    if (totalFindings > 50) {
      recommendations.push({
        priority: 'medium',
        category: 'json-conditions',
        issue: `${totalFindings} condições if verificando modelos JSON`,
        action: 'Considerar usar um registry pattern ou factory para reduzir condições if',
        suggestion: 'Verificar se ComponentRegistry já está sendo usado adequadamente',
      });
    }
  }

  // Recomendações sobre imports
  if (reports['unused-imports']) {
    const { filesWithUnusedImports } = reports['unused-imports'].summary;
    if (filesWithUnusedImports > 0) {
      recommendations.push({
        priority: 'low',
        category: 'unused-imports',
        issue: `${filesWithUnusedImports} arquivos com imports não utilizados`,
        action: 'Remover imports não utilizados para melhorar a legibilidade',
      });
    }
  }

  return recommendations;
}

/**
 * Exibe resumo final
 */
function displaySummary(consolidated) {
  console.log(`\n${colors.yellow}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}RESUMO CONSOLIDADO${colors.reset}`);
  console.log(`${colors.yellow}${'='.repeat(60)}${colors.reset}\n`);

  const { summary, recommendations } = consolidated;

  console.log(`${colors.cyan}📊 Estatísticas:${colors.reset}\n`);

  if (summary.unusedCode) {
    console.log(`  Código não utilizado:`);
    console.log(`    - Componentes: ${colors.red}${summary.unusedCode.unusedComponents || 0}${colors.reset}`);
    console.log(`    - Hooks:       ${colors.red}${summary.unusedCode.unusedHooks || 0}${colors.reset}`);
    console.log(`    - Funções:     ${colors.red}${summary.unusedCode.unusedFunctions || 0}${colors.reset}`);
    console.log(`    - Arquivos:    ${colors.red}${summary.unusedCode.unusedFiles?.length || 0}${colors.reset}`);
  }

  if (summary.duplicates) {
    console.log(`\n  Duplicações:`);
    console.log(`    - Componentes duplicados: ${colors.yellow}${summary.duplicates.duplicateComponents || 0}${colors.reset}`);
    console.log(`    - Arquivos idênticos:     ${colors.yellow}${summary.duplicates.identicalFiles || 0}${colors.reset}`);
    console.log(`    - Arquivos similares:     ${colors.yellow}${summary.duplicates.similarFiles || 0}${colors.reset}`);
  }

  if (summary.jsonConditions) {
    console.log(`\n  Condições JSON:`);
    console.log(`    - Total de condições:     ${colors.cyan}${summary.jsonConditions.totalFindings || 0}${colors.reset}`);
    console.log(`    - Valores únicos:         ${colors.cyan}${summary.jsonConditions.uniqueValues || 0}${colors.reset}`);
  }

  if (summary.unusedImports) {
    console.log(`\n  Imports:`);
    console.log(`    - Arquivos com imports não usados: ${colors.red}${summary.unusedImports.filesWithUnusedImports || 0}${colors.reset}`);
    console.log(`    - Arquivos com imports inexistentes: ${colors.red}${summary.unusedImports.filesWithMissingImports || 0}${colors.reset}`);
  }

  if (recommendations.length > 0) {
    console.log(`\n${colors.cyan}💡 Recomendações (${recommendations.length}):${colors.reset}\n`);
    
    const byPriority = {
      high: recommendations.filter(r => r.priority === 'high'),
      medium: recommendations.filter(r => r.priority === 'medium'),
      low: recommendations.filter(r => r.priority === 'low'),
    };

    if (byPriority.high.length > 0) {
      console.log(`  ${colors.red}🔴 Alta prioridade:${colors.reset}`);
      byPriority.high.forEach(rec => {
        console.log(`    - ${rec.issue}`);
        console.log(`      → ${rec.action}`);
      });
      console.log();
    }

    if (byPriority.medium.length > 0) {
      console.log(`  ${colors.yellow}🟡 Média prioridade:${colors.reset}`);
      byPriority.medium.forEach(rec => {
        console.log(`    - ${rec.issue}`);
        console.log(`      → ${rec.action}`);
      });
      console.log();
    }

    if (byPriority.low.length > 0) {
      console.log(`  ${colors.blue}🔵 Baixa prioridade:${colors.reset}`);
      byPriority.low.forEach(rec => {
        console.log(`    - ${rec.issue}`);
        console.log(`      → ${rec.action}`);
      });
      console.log();
    }
  }

  console.log(`\n${colors.green}✓${colors.reset} Todos os relatórios estão em: ${colors.cyan}${REPORTS_DIR}${colors.reset}\n`);
}

/**
 * Função principal
 */
async function main() {
  console.log(`${colors.bright}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}ANÁLISE COMPLETA DO REPOSITÓRIO${colors.reset}`);
  console.log(`${colors.bright}${'='.repeat(60)}${colors.reset}`);

  // Garantir que o diretório de relatórios existe
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }

  // Executar todas as análises
  const results = {
    unusedCode: await runScript('analyze-unused-code.js', '1/4 - Analisando código não utilizado'),
    duplicates: await runScript('analyze-duplicates.js', '2/4 - Analisando código duplicado'),
    jsonConditions: await runScript('analyze-json-conditions.js', '3/4 - Analisando condições if com JSON'),
    unusedImports: await runScript('analyze-unused-imports.js', '4/4 - Analisando imports não utilizados'),
  };

  // Consolidar relatórios
  const consolidated = consolidateReports();

  // Exibir resumo
  displaySummary(consolidated);

  // Resumo de execução
  const successCount = Object.values(results).filter(r => r.success).length;
  const totalCount = Object.keys(results).length;

  console.log(`${colors.yellow}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}Análise concluída: ${successCount}/${totalCount} scripts executados com sucesso${colors.reset}`);
  console.log(`${colors.yellow}${'='.repeat(60)}${colors.reset}\n`);
}

// Executar
main().catch(console.error);
