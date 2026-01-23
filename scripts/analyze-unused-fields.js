#!/usr/bin/env node

/**
 * Script para analisar campos não utilizados no JSON
 * 
 * Este script:
 * 1. Extrai todos os caminhos de dados do JSON (recursivamente)
 * 2. Extrai todos os dataPath usados nos componentes de renderização
 * 3. Extrai campos acessados diretamente nos renderers
 * 4. Gera um relatório de campos não utilizados
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cores para output no terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Extrai todos os caminhos de dados de um objeto recursivamente
 * @param {*} obj - Objeto a ser analisado
 * @param {string} prefix - Prefixo do caminho atual
 * @param {Set<string>} paths - Set para armazenar os caminhos
 * @param {Set<string>} excludedPaths - Caminhos a serem excluídos (metadados, etc.)
 */
function extractAllPaths(obj, prefix = '', paths = new Set(), excludedPaths = new Set()) {
  if (obj === null || obj === undefined) {
    return;
  }

  // Excluir alguns caminhos conhecidos que são metadados
  const excludePatterns = [
    'metadata',
    'index',
    'id',
    'name',
    'icon',
    'type',
    'title',
    'text',
    'cardStyleVariant',
    'cardContentVariant',
    'className',
    'wrapperClassName',
    'wrapperProps',
    'layout',
    'gridType',
    'preset',
    'height',
    'margin',
    'yAxisWidth',
    'dataKey',
    'yAxisDataKey',
    'fillColor',
    'showLabels',
    'labelFormatter',
    'tooltipFormatter',
    'sortData',
    'sortDirection',
    'hideXAxis',
    'config',
    'components',
    'renderSchema',
    'subsections',
  ];

  if (typeof obj !== 'object') {
    // É um valor primitivo, adiciona o caminho
    if (prefix && !excludePatterns.some(pattern => prefix.endsWith(`.${pattern}`) || prefix === pattern)) {
      paths.add(prefix);
    }
    return;
  }

  if (Array.isArray(obj)) {
    // Para arrays, adiciona o caminho do array e itera sobre os elementos
    if (prefix && !excludePatterns.some(pattern => prefix.endsWith(`.${pattern}`) || prefix === pattern)) {
      paths.add(prefix);
    }
    obj.forEach((item, index) => {
      extractAllPaths(item, `${prefix}[${index}]`, paths, excludedPaths);
      // Também adiciona caminho sem índice para arrays
      extractAllPaths(item, prefix ? `${prefix}[]` : `[]`, paths, excludedPaths);
    });
  } else {
    // Para objetos, adiciona o caminho e itera sobre as propriedades
    if (prefix && !excludePatterns.some(pattern => prefix.endsWith(`.${pattern}`) || prefix === pattern)) {
      paths.add(prefix);
    }
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Pular propriedades de configuração/metadados
        if (excludePatterns.includes(key)) {
          continue;
        }
        const newPrefix = prefix ? `${prefix}.${key}` : key;
        extractAllPaths(obj[key], newPrefix, paths, excludedPaths);
      }
    }
  }
}

/**
 * Extrai todos os dataPath dos componentes de renderização
 * @param {Object} obj - Objeto JSON
 * @param {Set<string>} usedPaths - Set para armazenar caminhos usados
 * @param {Object} allDataPaths - Todos os caminhos do JSON para identificar estruturas iteradas
 */
function extractUsedPaths(obj, usedPaths = new Set(), allDataPaths = new Set()) {
  if (!obj || typeof obj !== 'object') {
    return;
  }

  // Extrair dataPath de componentes
  if (obj.dataPath) {
    usedPaths.add(obj.dataPath);
    
    // Se o dataPath aponta para um array/objeto, marcar todos os campos como utilizados
    // pois provavelmente são iterados
    const dataPathValue = obj.dataPath;
    markIteratedStructureFields(dataPathValue, allDataPaths, usedPaths);
  }

  // Extrair caminhos de templates ({{path}})
  if (typeof obj === 'string') {
    const templateMatches = obj.match(/\{\{([^}]+)\}\}/g);
    if (templateMatches) {
      templateMatches.forEach(match => {
        const path = match.replace(/\{\{|\}\}/g, '').trim();
        // Remover prefixo uiTexts. pois são textos, não dados
        if (!path.startsWith('uiTexts.')) {
          usedPaths.add(path);
          markIteratedStructureFields(path, allDataPaths, usedPaths);
        }
      });
    }
  }

  // Extrair caminhos de nodesPath e linksPath (Sankey)
  if (obj.nodesPath) {
    usedPaths.add(obj.nodesPath);
    markIteratedStructureFields(obj.nodesPath, allDataPaths, usedPaths);
  }
  if (obj.linksPath) {
    usedPaths.add(obj.linksPath);
    markIteratedStructureFields(obj.linksPath, allDataPaths, usedPaths);
  }

  // Recursivamente processar objetos e arrays
  if (Array.isArray(obj)) {
    obj.forEach(item => extractUsedPaths(item, usedPaths, allDataPaths));
  } else if (typeof obj === 'object') {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        extractUsedPaths(obj[key], usedPaths, allDataPaths);
      }
    }
  }
}

/**
 * Marca todos os campos de uma estrutura como utilizados se ela for iterada
 * @param {string} dataPath - Caminho do dado (ex: "sectionData.recommendationsTable")
 * @param {Set<string>} allDataPaths - Todos os caminhos do JSON
 * @param {Set<string>} usedPaths - Set para marcar caminhos como utilizados
 */
function markIteratedStructureFields(dataPath, allDataPaths, usedPaths) {
  // Converter dataPath para formato do JSON (sectionData.* -> sections[X].data.*)
  const jsonPaths = convertDataPathToJsonPaths(dataPath);
  
  jsonPaths.forEach(jsonPath => {
    // Encontrar todos os caminhos que começam com este caminho
    // Isso indica que a estrutura é iterada e todos os campos são acessados
    for (const path of allDataPaths) {
      // Se o caminho é um filho direto ou indireto do dataPath, marcar como usado
      if (path.startsWith(jsonPath + '.') || path.startsWith(jsonPath + '[')) {
        // Converter de volta para formato usado
        const convertedPath = convertToSectionDataPath(path);
        usedPaths.add(convertedPath);
        usedPaths.add(path);
      }
      
      // Também verificar se é um array que contém objetos com campos
      // Ex: recommendationsTable[0].recommendation -> sectionData.recommendationsTable
      const arrayMatch = path.match(/^(.+)\[\d+\]\.(.+)$/);
      if (arrayMatch) {
        const arrayPath = arrayMatch[1];
        const fieldPath = arrayMatch[2];
        const convertedArrayPath = convertToSectionDataPath(arrayPath);
        
        // Normalizar para comparação (remover índices)
        const normalizedDataPath = normalizePath(dataPath);
        const normalizedConverted = normalizePath(convertedArrayPath);
        
        if (normalizedConverted === normalizedDataPath || jsonPath === arrayPath) {
          // Este campo faz parte de um array que é iterado
          const fullConvertedPath = `${convertedArrayPath}.${fieldPath}`;
          usedPaths.add(fullConvertedPath);
          usedPaths.add(path);
          
          // Também adicionar versão genérica (sem índice específico)
          const genericArrayPath = arrayPath.replace(/\[\d+\]/, '[]');
          const genericConverted = convertToSectionDataPath(genericArrayPath);
          usedPaths.add(`${genericConverted}.${fieldPath}`);
        }
      }
    }
  });
}

/**
 * Converte um dataPath usado (sectionData.*) para possíveis caminhos no JSON
 * @param {string} dataPath - Caminho usado (ex: "sectionData.recommendationsTable")
 * @returns {Array<string>} - Array de caminhos possíveis no JSON
 */
function convertDataPathToJsonPaths(dataPath) {
  const paths = [];
  
  // Se começa com sectionData., converter para sections[X].data.*
  if (dataPath.startsWith('sectionData.')) {
    const relativePath = dataPath.replace('sectionData.', '');
    // Tentar todas as seções possíveis
    for (let i = 0; i < 10; i++) {
      paths.push(`sections[${i}].data.${relativePath}`);
    }
    // Também adicionar sem índice
    paths.push(`sections[].data.${relativePath}`);
  }
  
  // Adicionar o caminho original também
  paths.push(dataPath);
  
  return paths;
}

/**
 * Analisa arquivos de renderização para encontrar campos acessados diretamente
 * e indiretamente (através de iterações)
 * @param {string} componentsDir - Diretório dos componentes
 * @param {Set<string>} usedPaths - Set para armazenar caminhos usados
 * @param {Set<string>} allDataPaths - Todos os caminhos do JSON
 */
function extractPathsFromRenderers(componentsDir, usedPaths = new Set(), allDataPaths = new Set()) {
  const rendererFiles = [
    'ChartRenderers.jsx',
    'CardRenderers.jsx',
    'TableRenderers.jsx',
    'WidgetRenderers.jsx',
    'GenericSectionRenderer.jsx',
    'QuestionsList.jsx',
  ];

  rendererFiles.forEach(file => {
    const filePath = path.join(componentsDir, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Padrões comuns de acesso a dados
      const patterns = [
        // question.data, question.sentimentData, etc.
        /question\.(\w+)/g,
        // data.question.data, data.sectionData, etc.
        /data\.(\w+)/g,
        // sectionData.*
        /sectionData\.([\w.]+)/g,
        // resolveDataPath com strings literais
        /resolveDataPath\s*\([^,]+,\s*["']([^"']+)["']/g,
        // Acesso direto a propriedades
        /\.data\?\.(\w+)/g,
        /\.data\.(\w+)/g,
        // Acesso a arrays e objetos aninhados
        /\[['"](\w+)['"]\]/g,
      ];

      patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const field = match[1] || match[0];
          if (field && !field.includes('(') && !field.includes(')')) {
            // Adicionar variações comuns
            usedPaths.add(field);
            usedPaths.add(`question.${field}`);
            usedPaths.add(`sectionData.${field}`);
            usedPaths.add(`data.${field}`);
          }
        }
      });
      
      // Detectar padrões de iteração genérica
      detectIterationPatterns(content, usedPaths, allDataPaths);
    }
  });
}

/**
 * Detecta padrões de iteração que indicam acesso indireto a campos
 * @param {string} content - Conteúdo do arquivo
 * @param {Set<string>} usedPaths - Set para marcar caminhos como utilizados
 * @param {Set<string>} allDataPaths - Todos os caminhos do JSON
 */
function detectIterationPatterns(content, usedPaths, allDataPaths) {
  // Padrões que indicam iteração sobre estruturas completas
  const iterationPatterns = [
    // .map(, .forEach(, .filter( sobre variáveis de dados
    /(?:recommendations|questions|items|tasks|categories|topics|filters|subsections|components|attributes)\s*\.\s*(?:map|forEach|filter|reduce)\s*\(/gi,
    // Object.keys( sobre objetos de dados
    /Object\.keys\s*\(\s*(?:data|sectionData|question|recommendations|questions|items)/gi,
    // Object.entries( sobre objetos de dados
    /Object\.entries\s*\(\s*(?:data|sectionData|question|recommendations|questions|items)/gi,
    // for...in sobre objetos de dados
    /for\s*\(\s*(?:const|let|var)\s+\w+\s+in\s+(?:data|sectionData|question|recommendations|questions|items)/gi,
    // for...of sobre arrays de dados
    /for\s*\(\s*(?:const|let|var)\s+\w+\s+of\s+(?:data|sectionData|question|recommendations|questions|items)/gi,
  ];
  
  iterationPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      // Se encontrou padrão de iteração, marcar estruturas relacionadas como utilizadas
      markStructuresAsIterated(usedPaths, allDataPaths);
    }
  });
}

/**
 * Marca estruturas comuns como iteradas (e portanto, todos os campos são utilizados)
 * @param {Set<string>} usedPaths - Set para marcar caminhos como utilizados
 * @param {Set<string>} allDataPaths - Todos os caminhos do JSON
 */
function markStructuresAsIterated(usedPaths, allDataPaths) {
  // Estruturas comuns que são sempre iteradas quando acessadas
  const commonIteratedStructures = [
    'recommendationsTable',
    'questions',
    'items',
    'tasks',
    'stakeholders',
    'categories',
    'topics',
    'filters',
    'subsections',
    'components',
    'attributes',
    'department',
    'tenure',
    'role',
  ];
  
  commonIteratedStructures.forEach(structure => {
    // Marcar como usado em diferentes formatos
    usedPaths.add(`sectionData.${structure}`);
    usedPaths.add(structure);
    
    // Encontrar todos os caminhos relacionados e marcar como usados
    for (const path of allDataPaths) {
      if (path.includes(structure)) {
        const convertedPath = convertToSectionDataPath(path);
        usedPaths.add(convertedPath);
        usedPaths.add(path);
        
        // Se é um array, marcar todos os campos dos objetos dentro do array
        const arrayMatch = path.match(/^(.+)\[\d+\]\.(.+)$/);
        if (arrayMatch) {
          const arrayBase = arrayMatch[1];
          const field = arrayMatch[2];
          if (arrayBase.includes(structure)) {
            // Marcar o campo genérico (sem índice)
            const genericPath = `${arrayBase.replace(/\[\d+\]/, '[]')}.${field}`;
            usedPaths.add(convertToSectionDataPath(genericPath));
            usedPaths.add(genericPath);
          }
        }
      }
    }
  });
}

/**
 * Normaliza um caminho para comparação
 * Remove índices de array e normaliza notação
 */
function normalizePath(path) {
  if (!path) return '';
  
  // Remove índices de array [0], [1], etc.
  let normalized = path.replace(/\[\d+\]/g, '[]');
  
  // Normaliza sectionData.* para remover o prefixo se necessário
  if (normalized.startsWith('sectionData.')) {
    normalized = normalized.replace('sectionData.', '');
  }
  
  return normalized;
}

/**
 * Converte caminho do JSON (sections[X].data.*) para caminho usado (sectionData.*)
 */
function convertToSectionDataPath(path) {
  // Converter sections[X].data.* para sectionData.*
  const match = path.match(/^sections\[\d+\]\.data\.(.+)$/);
  if (match) {
    return `sectionData.${match[1]}`;
  }
  
  // Converter sections[X].subsections[Y].data.* para sectionData.* (para attributes)
  const subsectionMatch = path.match(/^sections\[\d+\]\.subsections\[\d+\]\.data\.(.+)$/);
  if (subsectionMatch) {
    return `sectionData.${subsectionMatch[1]}`;
  }
  
  return path;
}

/**
 * Verifica se um caminho é usado (considerando variações)
 */
function isPathUsed(path, usedPaths) {
  // Verificação exata
  if (usedPaths.has(path)) {
    return true;
  }

  // Converter caminho do JSON para formato usado (sectionData.*)
  const convertedPath = convertToSectionDataPath(path);
  if (usedPaths.has(convertedPath)) {
    return true;
  }

  // Verificação normalizada
  const normalized = normalizePath(path);
  const normalizedConverted = normalizePath(convertedPath);
  for (const usedPath of usedPaths) {
    const normalizedUsed = normalizePath(usedPath);
    if (normalizedUsed === normalized || normalizedUsed === normalizedConverted) {
      return true;
    }
  }

  // Verificação de prefixo (se o caminho usado é um prefixo do caminho completo)
  for (const usedPath of usedPaths) {
    // Verificação direta
    if (path.startsWith(usedPath + '.') || path === usedPath) {
      return true;
    }
    // Verificação com caminho convertido
    if (convertedPath.startsWith(usedPath + '.') || convertedPath === usedPath) {
      return true;
    }
    // Verificação inversa (se o caminho usado começa com o caminho atual)
    if (usedPath.startsWith(path + '.') || usedPath === path) {
      return true;
    }
    if (usedPath.startsWith(convertedPath + '.') || usedPath === convertedPath) {
      return true;
    }
  }

  // Verificação de caminhos relativos (sectionData.*)
  if (path.includes('.')) {
    const parts = path.split('.');
    // Tentar diferentes combinações de partes
    for (let i = 0; i < parts.length; i++) {
      // Pular índices de array
      if (parts[i].match(/^\d+$/) || parts[i] === '[]') continue;
      
      const partialPath = parts.slice(i).join('.');
      // Remover índices de array do caminho parcial
      const cleanPartial = partialPath.replace(/\[\d+\]/g, '[]');
      
      if (usedPaths.has(partialPath) || 
          usedPaths.has(`sectionData.${partialPath}`) ||
          usedPaths.has(cleanPartial) ||
          usedPaths.has(`sectionData.${cleanPartial}`)) {
        return true;
      }
    }
    
    // Verificar se alguma parte do caminho corresponde a um caminho usado
    const pathParts = path.split('.').filter(p => !p.match(/^\d+$/) && p !== '[]');
    for (const usedPath of usedPaths) {
      const usedParts = usedPath.split('.').filter(p => !p.match(/^\d+$/) && p !== '[]');
      // Verificar se todas as partes do caminho usado estão no caminho atual
      if (usedParts.every(part => pathParts.includes(part) || path.includes(part))) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Identifica estruturas que são iteradas e marca todos os seus campos como utilizados
 * @param {Object} data - Dados do JSON
 * @param {Set<string>} usedPaths - Set para marcar caminhos como utilizados
 * @param {Set<string>} allDataPaths - Todos os caminhos do JSON
 */
function identifyAndMarkIteratedStructures(data, usedPaths, allDataPaths) {
  // Estruturas conhecidas que são sempre iteradas quando acessadas
  const knownIteratedStructures = [
    'recommendationsTable.items',
    'questions',
    'subsections',
    'components',
    'tasks',
    'stakeholders',
    'categories',
    'topics',
    'filters',
    'attributes',
  ];
  
  // Para cada dataPath usado, verificar se aponta para uma estrutura iterada
  const usedPathsArray = Array.from(usedPaths);
  
  usedPathsArray.forEach(dataPath => {
    // Verificar se o dataPath aponta para uma estrutura conhecida como iterada
    knownIteratedStructures.forEach(structure => {
      if (dataPath.includes(structure) || dataPath.endsWith(structure.split('.').pop())) {
        // Encontrar todos os caminhos relacionados e marcar como usados
        markAllFieldsInStructure(dataPath, structure, allDataPaths, usedPaths);
      }
    });
    
    // Verificar se o dataPath aponta para um array no JSON
    const jsonPaths = convertDataPathToJsonPaths(dataPath);
    jsonPaths.forEach(jsonPath => {
      // Tentar encontrar o valor no JSON
      const value = getValueFromPath(data, jsonPath);
      if (Array.isArray(value) && value.length > 0) {
        // É um array - marcar todos os campos dos objetos do array como utilizados
        markArrayFieldsAsUsed(jsonPath, value, allDataPaths, usedPaths);
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        // É um objeto - verificar se tem propriedade 'items' que é array
        if (value.items && Array.isArray(value.items)) {
          markArrayFieldsAsUsed(`${jsonPath}.items`, value.items, allDataPaths, usedPaths);
        }
      }
    });
  });
}

/**
 * Obtém o valor de um caminho no objeto
 * @param {Object} obj - Objeto
 * @param {string} path - Caminho (ex: "sections[0].data.recommendationsTable")
 * @returns {*} - Valor ou undefined
 */
function getValueFromPath(obj, path) {
  if (!path || !obj) return undefined;
  
  // Normalizar caminho (remover índices de array para busca genérica)
  const normalizedPath = path.replace(/\[\d+\]/g, '[]');
  const parts = normalizedPath.split('.').filter(Boolean);
  
  let current = obj;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part === '[]') {
      // Se é array, pegar o primeiro elemento
      if (Array.isArray(current) && current.length > 0) {
        current = current[0];
      } else {
        return undefined;
      }
    } else if (current && typeof current === 'object') {
      if (Array.isArray(current)) {
        // Se current é array, tentar pegar do primeiro elemento
        if (current.length > 0 && current[0] && part in current[0]) {
          current = current[0][part];
        } else {
          return undefined;
        }
      } else if (part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  }
  
  return current;
}

/**
 * Marca todos os campos de um array como utilizados
 * @param {string} arrayPath - Caminho do array
 * @param {Array} arrayValue - Valor do array
 * @param {Set<string>} allDataPaths - Todos os caminhos do JSON
 * @param {Set<string>} usedPaths - Set para marcar caminhos como utilizados
 */
function markArrayFieldsAsUsed(arrayPath, arrayValue, allDataPaths, usedPaths) {
  if (!Array.isArray(arrayValue) || arrayValue.length === 0) return;
  
  // Pegar o primeiro elemento para identificar campos
  const firstElement = arrayValue[0];
  if (firstElement && typeof firstElement === 'object') {
    // Marcar todos os campos do objeto como utilizados
    Object.keys(firstElement).forEach(key => {
      // Marcar campo genérico (sem índice)
      const genericPath = `${arrayPath}[]`;
      const fieldPath = `${genericPath}.${key}`;
      const convertedPath = convertToSectionDataPath(fieldPath);
      usedPaths.add(convertedPath);
      usedPaths.add(fieldPath);
      
      // Se o campo é um array, marcar recursivamente
      if (Array.isArray(firstElement[key])) {
        markArrayFieldsAsUsed(fieldPath, firstElement[key], allDataPaths, usedPaths);
      }
    });
    
    // Marcar todos os caminhos específicos (com índices) também
    for (const path of allDataPaths) {
      if (path.startsWith(arrayPath + '[')) {
        const convertedPath = convertToSectionDataPath(path);
        usedPaths.add(convertedPath);
        usedPaths.add(path);
      }
    }
  }
}

/**
 * Marca todos os campos de uma estrutura conhecida como utilizados
 * @param {string} dataPath - Caminho do dataPath usado
 * @param {string} structure - Nome da estrutura (ex: "recommendationsTable.items")
 * @param {Set<string>} allDataPaths - Todos os caminhos do JSON
 * @param {Set<string>} usedPaths - Set para marcar caminhos como utilizados
 */
function markAllFieldsInStructure(dataPath, structure, allDataPaths, usedPaths) {
  const structureParts = structure.split('.');
  const baseStructure = structureParts[0];
  
  // Encontrar todos os caminhos que contêm esta estrutura
  for (const path of allDataPaths) {
    if (path.includes(baseStructure)) {
      const convertedPath = convertToSectionDataPath(path);
      usedPaths.add(convertedPath);
      usedPaths.add(path);
    }
  }
}

/**
 * Organiza caminhos por seção
 */
function organizePathsBySection(paths) {
  const organized = {
    metadata: [],
    sections: {},
    uiTexts: [],
    surveyInfo: [],
    root: [],
  };

  paths.forEach(path => {
    if (path.startsWith('metadata.')) {
      organized.metadata.push(path);
    } else if (path.startsWith('sections.')) {
      const match = path.match(/^sections\[(\d+)\]\.(.+)$/);
      if (match) {
        const sectionIndex = match[1];
        const rest = match[2];
        if (!organized.sections[sectionIndex]) {
          organized.sections[sectionIndex] = [];
        }
        organized.sections[sectionIndex].push(rest);
      } else {
        organized.sections['unknown'] = organized.sections['unknown'] || [];
        organized.sections['unknown'].push(path);
      }
    } else if (path.startsWith('uiTexts.')) {
      organized.uiTexts.push(path);
    } else if (path.startsWith('surveyInfo.')) {
      organized.surveyInfo.push(path);
    } else {
      organized.root.push(path);
    }
  });

  return organized;
}

/**
 * Função principal
 */
function main() {
  const jsonPath = path.join(__dirname, '../src/data/surveyData.json');
  
  if (!fs.existsSync(jsonPath)) {
    console.error(`${colors.red}Erro: Arquivo não encontrado: ${jsonPath}${colors.reset}`);
    process.exit(1);
  }

  console.log(`${colors.cyan}Analisando campos não utilizados...${colors.reset}\n`);

  // Ler o JSON
  const jsonContent = fs.readFileSync(jsonPath, 'utf8');
  const data = JSON.parse(jsonContent);

  // 1. Extrair todos os caminhos do JSON
  const allPaths = new Set();
  extractAllPaths(data, '', allPaths);
  console.log(`${colors.green}✓${colors.reset} Total de caminhos encontrados no JSON: ${colors.bright}${allPaths.size}${colors.reset}`);

  // 2. Extrair caminhos usados nos componentes
  const usedPaths = new Set();
  extractUsedPaths(data, usedPaths, allPaths);
  console.log(`${colors.green}✓${colors.reset} Caminhos extraídos do JSON: ${colors.bright}${usedPaths.size}${colors.reset}`);

  // 3. Extrair caminhos dos arquivos de renderização
  const componentsDir = path.join(__dirname, '../src/components/survey/common');
  extractPathsFromRenderers(componentsDir, usedPaths, allPaths);
  console.log(`${colors.green}✓${colors.reset} Caminhos extraídos dos renderers: ${colors.bright}${usedPaths.size}${colors.reset}`);

  // 4. Identificar estruturas iteradas no JSON e marcar todos os campos como utilizados
  identifyAndMarkIteratedStructures(data, usedPaths, allPaths);
  console.log(`${colors.green}✓${colors.reset} Campos de estruturas iteradas marcados: ${colors.bright}${usedPaths.size}${colors.reset}`);

  // Adicionar caminhos conhecidos que são acessados diretamente no código
  const knownDirectPaths = [
    'question.data',
    'question.sentimentData',
    'question.id',
    'question.questionType',
    'question.data.barChart',
    'question.data.npsStackedChart',
    'question.data.topCategoriesCards',
    'question.data.wordCloud',
    'sectionData',
    'sectionData.questions',
    'sectionData.recommendationsTable',
    'sectionData.department',
    'sectionData.tenure',
    'sectionData.role',
    'sectionData.department.distributionChart',
    'sectionData.department.segmentationTable',
    'sectionData.tenure.distributionChart',
    'sectionData.role.distributionChart',
    'uiTexts',
    'surveyInfo',
    'surveyInfo.nps',
    'surveyInfo.npsScore',
    'data',
  ];
  knownDirectPaths.forEach(path => usedPaths.add(path));
  console.log(`${colors.green}✓${colors.reset} Total de caminhos usados na renderização: ${colors.bright}${usedPaths.size}${colors.reset}`);

  // 4. Identificar caminhos não utilizados
  const unusedPaths = [];
  allPaths.forEach(path => {
    if (!isPathUsed(path, usedPaths)) {
      unusedPaths.push(path);
    }
  });

  // Organizar caminhos não utilizados
  const organizedUnused = organizePathsBySection(unusedPaths);

  // 5. Gerar relatório
  console.log(`\n${colors.yellow}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}RELATÓRIO DE CAMPOS NÃO UTILIZADOS${colors.reset}`);
  console.log(`${colors.yellow}═══════════════════════════════════════════════════════════${colors.reset}\n`);

  console.log(`${colors.red}Total de campos não utilizados: ${colors.bright}${unusedPaths.length}${colors.reset}\n`);

  // Relatório por seção
  if (organizedUnused.metadata.length > 0) {
    console.log(`${colors.cyan}📋 Metadata (${organizedUnused.metadata.length} campos):${colors.reset}`);
    organizedUnused.metadata.slice(0, 10).forEach(path => {
      console.log(`  - ${path}`);
    });
    if (organizedUnused.metadata.length > 10) {
      console.log(`  ... e mais ${organizedUnused.metadata.length - 10} campos`);
    }
    console.log();
  }

  if (organizedUnused.surveyInfo.length > 0) {
    console.log(`${colors.cyan}📊 Survey Info (${organizedUnused.surveyInfo.length} campos):${colors.reset}`);
    organizedUnused.surveyInfo.forEach(path => {
      console.log(`  - ${path}`);
    });
    console.log();
  }

  if (organizedUnused.uiTexts.length > 0) {
    console.log(`${colors.cyan}🌐 UI Texts (${organizedUnused.uiTexts.length} campos):${colors.reset}`);
    organizedUnused.uiTexts.slice(0, 10).forEach(path => {
      console.log(`  - ${path}`);
    });
    if (organizedUnused.uiTexts.length > 10) {
      console.log(`  ... e mais ${organizedUnused.uiTexts.length - 10} campos`);
    }
    console.log();
  }

  // Seções
  const sectionKeys = Object.keys(organizedUnused.sections).sort();
  if (sectionKeys.length > 0) {
    console.log(`${colors.cyan}📑 Seções:${colors.reset}`);
    sectionKeys.forEach(sectionKey => {
      const sectionPaths = organizedUnused.sections[sectionKey];
      console.log(`\n  ${colors.yellow}Seção ${sectionKey}${colors.reset} (${sectionPaths.length} campos não utilizados):`);
      sectionPaths.slice(0, 15).forEach(path => {
        console.log(`    - ${path}`);
      });
      if (sectionPaths.length > 15) {
        console.log(`    ... e mais ${sectionPaths.length - 15} campos`);
      }
    });
    console.log();
  }

  if (organizedUnused.root.length > 0) {
    console.log(`${colors.cyan}🔗 Root Level (${organizedUnused.root.length} campos):${colors.reset}`);
    organizedUnused.root.slice(0, 10).forEach(path => {
      console.log(`  - ${path}`);
    });
    if (organizedUnused.root.length > 10) {
      console.log(`  ... e mais ${organizedUnused.root.length - 10} campos`);
    }
    console.log();
  }

  // Salvar relatório em arquivo
  const reportPath = path.join(__dirname, '../reports/unused-fields-report.json');
  const reportDir = path.dirname(reportPath);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalPaths: allPaths.size,
      usedPaths: usedPaths.size,
      unusedPaths: unusedPaths.length,
      usageRate: ((usedPaths.size / allPaths.size) * 100).toFixed(2) + '%',
    },
    unusedPaths: {
      all: Array.from(unusedPaths).sort(),
      bySection: organizedUnused,
    },
    usedPaths: Array.from(usedPaths).sort(),
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`${colors.green}✓${colors.reset} Relatório salvo em: ${colors.cyan}${reportPath}${colors.reset}\n`);

  // Estatísticas finais
  console.log(`${colors.yellow}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}ESTATÍSTICAS${colors.reset}`);
  console.log(`${colors.yellow}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`Total de caminhos no JSON:     ${colors.bright}${allPaths.size}${colors.reset}`);
  console.log(`Caminhos utilizados:           ${colors.green}${usedPaths.size}${colors.reset}`);
  console.log(`Caminhos não utilizados:       ${colors.red}${unusedPaths.length}${colors.reset}`);
  console.log(`Taxa de utilização:            ${colors.cyan}${report.summary.usageRate}${colors.reset}`);
  console.log();
}

// Executar
main();
