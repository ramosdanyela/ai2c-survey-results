import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Gera CSV com hierarquia do JSON
 */
function generateHierarchyCSV(jsonData, outputPath) {
  const rows = [];
  
  // Header do CSV
  rows.push(['path', 'key', 'type', 'value', 'depth'].join(','));
  
  /**
   * Função recursiva para percorrer o JSON
   */
  function traverse(obj, currentPath = '', depth = 0) {
    if (obj === null || obj === undefined) {
      return;
    }
    
    const type = Array.isArray(obj) ? 'array' : typeof obj;
    
    // Se é um valor primitivo (não objeto/array)
    if (type !== 'object' && type !== 'array') {
      const value = formatValue(obj);
      rows.push([
        currentPath,
        currentPath.split('.').pop() || currentPath,
        type,
        value,
        depth
      ].join(','));
      return;
    }
    
    // Se é um objeto ou array
    if (Array.isArray(obj)) {
      // Adiciona entrada para o array
      rows.push([
        currentPath,
        currentPath.split('.').pop() || currentPath,
        'array',
        '',
        depth
      ].join(','));
      
      // Percorre cada item do array
      obj.forEach((item, index) => {
        const itemPath = `${currentPath}[${index}]`;
        traverse(item, itemPath, depth + 1);
      });
    } else {
      // Adiciona entrada para o objeto
      if (currentPath) {
        rows.push([
          currentPath,
          currentPath.split('.').pop() || currentPath,
          'object',
          '',
          depth
        ].join(','));
      }
      
      // Percorre cada propriedade do objeto
      Object.keys(obj).forEach((key) => {
        const newPath = currentPath ? `${currentPath}.${key}` : key;
        traverse(obj[key], newPath, depth + 1);
      });
    }
  }
  
  /**
   * Formata valores para o CSV (escapando vírgulas e quebras de linha)
   */
  function formatValue(value) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    
    const str = String(value);
    
    // Se contém vírgula, quebra de linha ou aspas, precisa ser envolvido em aspas
    if (str.includes(',') || str.includes('\n') || str.includes('"')) {
      // Escapa aspas duplicando-as
      return `"${str.replace(/"/g, '""')}"`;
    }
    
    // Limita tamanho para valores muito longos
    if (str.length > 200) {
      return `"${str.substring(0, 197)}..."`;
    }
    
    return str;
  }
  
  // Inicia a travessia
  traverse(jsonData);
  
  // Escreve o CSV
  const csvContent = rows.join('\n');
  fs.writeFileSync(outputPath, csvContent, 'utf8');
  
  console.log(`✅ CSV gerado com sucesso: ${outputPath}`);
  console.log(`   Total de linhas: ${rows.length - 1} (excluindo header)`);
}

// Carrega o JSON
const jsonPath = path.join(__dirname, '../src/data/surveyData.json');
const outputPath = path.join(__dirname, '../json_hierarchy.csv');

try {
  console.log(`📖 Lendo JSON: ${jsonPath}`);
  const jsonContent = fs.readFileSync(jsonPath, 'utf8');
  const jsonData = JSON.parse(jsonContent);
  
  console.log(`🔄 Gerando hierarquia...`);
  generateHierarchyCSV(jsonData, outputPath);
  
} catch (error) {
  console.error('❌ Erro ao processar:', error.message);
  process.exit(1);
}

