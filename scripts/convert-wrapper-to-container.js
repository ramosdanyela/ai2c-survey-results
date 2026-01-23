/**
 * Script para converter wrapper: "div" para type: "container"
 * 
 * Este script:
 * - Converte todos os componentes com wrapper: "div" para type: "container"
 * - Remove wrapper e wrapperProps quando convertido
 * - Mantém todos os outros atributos (index, components, text, etc.)
 * - Mantém wrappers h3 e h4 como estão (não são convertidos)
 * 
 * Uso: node scripts/convert-wrapper-to-container.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JSON_FILE = path.join(__dirname, '../src/data/surveyData.json');

/**
 * Converte recursivamente componentes com wrapper: "div" para type: "container"
 */
function convertWrapperToContainer(obj) {
  if (Array.isArray(obj)) {
    return obj.map(item => convertWrapperToContainer(item));
  }

  if (obj && typeof obj === 'object') {
    const converted = { ...obj };

    // Se tem wrapper: "div", converte para type: "container"
    // IMPORTANTE: Sempre converte, mesmo se já tiver type (substitui)
    if (converted.wrapper === "div") {
      converted.type = "container";
      delete converted.wrapper;
      
      // Remove wrapperProps se estiver vazio ou se não for necessário
      if (converted.wrapperProps) {
        // Se wrapperProps está vazio ou só tem propriedades vazias, remove
        const props = converted.wrapperProps;
        if (Object.keys(props).length === 0 || 
            (Object.keys(props).length === 1 && props.className === undefined && !props.style)) {
          delete converted.wrapperProps;
        }
      }
    }

    // Processa recursivamente todas as propriedades
    for (const key in converted) {
      if (converted[key] && typeof converted[key] === 'object') {
        converted[key] = convertWrapperToContainer(converted[key]);
      }
    }

    return converted;
  }

  return obj;
}

/**
 * Função principal
 */
function main() {
  console.log('🔄 Convertendo wrapper: "div" para type: "container"...\n');

  try {
    // Lê o JSON
    const jsonContent = fs.readFileSync(JSON_FILE, 'utf8');
    const data = JSON.parse(jsonContent);

    // Conta quantos wrappers div existem antes
    const countBefore = countWrapperDivs(data);
    console.log(`📊 Encontrados ${countBefore} componentes com wrapper: "div"\n`);

    // Converte
    const converted = convertWrapperToContainer(data);

    // Conta quantos containers existem depois
    const countAfter = countContainers(converted);
    console.log(`✅ Convertidos para ${countAfter} componentes com type: "container"\n`);

    // Salva o JSON convertido
    const output = JSON.stringify(converted, null, 2);
    fs.writeFileSync(JSON_FILE, output, 'utf8');

    console.log('✅ Conversão concluída!');
    console.log(`📁 Arquivo atualizado: ${JSON_FILE}\n`);

    // Verifica se ainda há wrappers div
    const remaining = countWrapperDivs(converted);
    if (remaining > 0) {
      console.log(`⚠️  Ainda existem ${remaining} componentes com wrapper: "div" (provavelmente h3/h4)`);
    } else {
      console.log('✨ Todos os wrappers "div" foram convertidos!');
    }

  } catch (error) {
    console.error('❌ Erro durante a conversão:', error);
    process.exit(1);
  }
}

/**
 * Conta quantos componentes têm wrapper: "div"
 */
function countWrapperDivs(obj, count = 0) {
  if (Array.isArray(obj)) {
    return obj.reduce((acc, item) => acc + countWrapperDivs(item, 0), count);
  }

  if (obj && typeof obj === 'object') {
    if (obj.wrapper === "div") {
      count++;
    }

    for (const key in obj) {
      if (obj[key] && typeof obj[key] === 'object') {
        count = countWrapperDivs(obj[key], count);
      }
    }
  }

  return count;
}

/**
 * Conta quantos componentes têm type: "container"
 */
function countContainers(obj, count = 0) {
  if (Array.isArray(obj)) {
    return obj.reduce((acc, item) => acc + countContainers(item, 0), count);
  }

  if (obj && typeof obj === 'object') {
    if (obj.type === "container") {
      count++;
    }

    for (const key in obj) {
      if (obj[key] && typeof obj[key] === 'object') {
        count = countContainers(obj[key], count);
      }
    }
  }

  return count;
}

// Executa
main();
