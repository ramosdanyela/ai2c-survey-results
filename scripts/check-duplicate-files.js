#!/usr/bin/env node

/**
 * Script para identificar arquivos duplicados ou similares
 * Útil para encontrar arquivos como "surveyData copy.js"
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { glob } from "glob";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const srcDir = path.join(projectRoot, "src");

/**
 * Encontra arquivos duplicados ou similares
 */
async function findDuplicateFiles() {
  console.log("🔍 Buscando arquivos duplicados ou similares...\n");

  const allFiles = await glob("**/*.{js,jsx,ts,tsx}", {
    cwd: srcDir,
    absolute: true,
  });

  const fileMap = new Map();
  const duplicates = [];

  for (const file of allFiles) {
    const fileName = path.basename(file);
    const baseName = fileName
      .replace(/\s+copy\s*\d*\./i, ".")
      .replace(/\(\d+\)\./, ".");

    if (!fileMap.has(baseName)) {
      fileMap.set(baseName, []);
    }
    fileMap.get(baseName).push(file);
  }

  for (const [baseName, files] of fileMap) {
    if (files.length > 1) {
      duplicates.push({
        baseName,
        files: files.map((f) => ({
          path: path.relative(srcDir, f),
          absolute: f,
          size: fs.statSync(f).size,
        })),
      });
    }
  }

  // Verificar arquivos com "copy" no nome
  const copyFiles = allFiles.filter((f) =>
    /copy|backup|old|temp|test/i.test(path.basename(f))
  );

  return {
    duplicates,
    copyFiles: copyFiles.map((f) => path.relative(srcDir, f)),
  };
}

/**
 * Função principal
 */
async function main() {
  try {
    const { duplicates, copyFiles } = await findDuplicateFiles();

    console.log("📊 Resultados:\n");

    if (duplicates.length > 0) {
      console.log("⚠️  Arquivos Duplicados Encontrados:");
      duplicates.forEach(({ baseName, files }) => {
        console.log(`\n   Base: ${baseName}`);
        files.forEach((f) => {
          console.log(`     - ${f.path} (${(f.size / 1024).toFixed(2)} KB)`);
        });
      });
      console.log("");
    } else {
      console.log("✅ Nenhum arquivo duplicado encontrado!\n");
    }

    if (copyFiles.length > 0) {
      console.log(
        '⚠️  Arquivos com "copy", "backup", "old", "temp" ou "test" no nome:'
      );
      copyFiles.forEach((f) => {
        console.log(`   - ${f}`);
      });
      console.log("");
    } else {
      console.log("✅ Nenhum arquivo suspeito encontrado!\n");
    }

    // Salvar relatório
    const reportsDir = path.join(projectRoot, "reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportPath = path.join(reportsDir, "duplicate-files.json");
    fs.writeFileSync(
      reportPath,
      JSON.stringify({ duplicates, copyFiles }, null, 2)
    );
    console.log(`✅ Relatório salvo em: ${reportPath}\n`);
  } catch (error) {
    console.error("❌ Erro:", error);
    process.exit(1);
  }
}

main();
