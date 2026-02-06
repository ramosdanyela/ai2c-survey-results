/**
 * Valida todos os JSONs de dados do projeto (ex.: src/data e subpastas).
 * Usa o mesmo schema e regras customizadas que validate-json.js.
 * Saída: exit 0 se todos válidos, exit 1 se algum falhar.
 *
 * Uso: npm run validate:all
 *      node docs/docs_json_tutorial/validation_scripts/scripts/validate-all-jsons.js
 *      node docs/docs_json_tutorial/validation_scripts/scripts/validate-all-jsons.js [dir1] [dir2]
 *
 * Por padrão procura em: src/data (relativo ao cwd do processo).
 * Opcional: passar diretórios como argumentos para validar apenas esses.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadDependencies, validateJSON } from "./validate-json.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Retorna lista de arquivos .json recursivamente em dir (absolutos) */
function findJsonFiles(dir, baseDir = dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      results.push(...findJsonFiles(full, baseDir));
    } else if (ent.isFile() && ent.name.endsWith(".json")) {
      results.push(full);
    }
  }
  return results;
}

/** Diretórios padrão quando nenhum argumento é passado (relativos ao cwd) */
const DEFAULT_DIRS = ["src/data"];

async function main() {
  const cwd = process.cwd();
  const args = process.argv.slice(2);

  const dirsToScan =
    args.length > 0 ? args.map((d) => path.resolve(cwd, d)) : DEFAULT_DIRS.map((d) => path.join(cwd, d));

  const allFiles = [];
  for (const dir of dirsToScan) {
    if (!fs.existsSync(dir)) {
      console.warn(`⚠️  Diretório não encontrado: ${dir}`);
      continue;
    }
    allFiles.push(...findJsonFiles(dir));
  }

  const uniqueFiles = [...new Set(allFiles)].sort();
  if (uniqueFiles.length === 0) {
    console.log("Nenhum arquivo .json encontrado nos diretórios:", dirsToScan.join(", "));
    process.exit(0);
  }

  console.log(`\n📂 Encontrados ${uniqueFiles.length} arquivo(s) .json. Validando todos...\n`);

  const { ajv, schema, validateCustomRules } = await loadDependencies();

  let failed = 0;
  for (const filePath of uniqueFiles) {
    const ok = validateJSON(filePath, ajv, schema, validateCustomRules);
    if (!ok) failed++;
  }

  if (failed > 0) {
    console.error(`\n❌ Resumo: ${failed} de ${uniqueFiles.length} arquivo(s) com erro.\n`);
    process.exit(1);
  }

  console.log(`\n✅ Resumo: todos os ${uniqueFiles.length} arquivo(s) passaram na validação.\n`);
  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Erro inesperado:", error);
  process.exit(1);
});
