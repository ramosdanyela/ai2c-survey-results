import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Buscar JSONs em src/data/
const dataDir = path.join(__dirname, "../../../src/data");
const files = fs
  .readdirSync(dataDir)
  .filter((file) => file.endsWith(".json") && file.startsWith("surveyData"))
  .map((file) => path.join(dataDir, file));

if (files.length === 0) {
  console.log("📁 Nenhum arquivo JSON encontrado em src/data/");
  process.exit(0);
}

console.log(`📁 Encontrados ${files.length} arquivo(s) JSON para validar\n`);

let allValid = true;
const results = [];

files.forEach((file) => {
  try {
    execSync(
      `node data/validation/scripts/validate-json.js "${file}"`,
      {
        stdio: "inherit",
        cwd: path.join(__dirname, "../../../"),
      }
    );
    results.push({ file, valid: true });
  } catch (error) {
    allValid = false;
    results.push({ file, valid: false });
  }
});

console.log("\n" + "=".repeat(60));
console.log("📊 RESUMO DA VALIDAÇÃO");
console.log("=".repeat(60));

results.forEach(({ file, valid }) => {
  const fileName = path.basename(file);
  const status = valid ? "✅" : "❌";
  console.log(`${status} ${fileName}`);
});

if (!allValid) {
  console.error("\n❌ Alguns arquivos JSON são inválidos");
  console.error("   Corrija os erros antes de continuar.\n");
  process.exit(1);
}

console.log("\n✅ Todos os arquivos JSON são válidos!\n");
process.exit(0);

