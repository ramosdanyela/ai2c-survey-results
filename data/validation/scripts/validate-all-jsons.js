import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "../../..");
const dataDir = path.join(projectRoot, "src", "data");
const validateScript = path.join(projectRoot, "data", "validation", "scripts", "validate-json.js");

if (!fs.existsSync(dataDir)) {
  console.log("📁 Pasta src/data não encontrada");
  process.exit(0);
}
if (!fs.existsSync(validateScript)) {
  console.error("❌ Script não encontrado:", validateScript);
  process.exit(1);
}

const files = fs
  .readdirSync(dataDir)
  .filter((f) => f.endsWith(".json") && f.startsWith("surveyData"))
  .map((f) => path.join(dataDir, f));

if (files.length === 0) {
  console.log("📁 Nenhum arquivo surveyData*.json em src/data/");
  process.exit(0);
}

console.log(`📁 Encontrados ${files.length} arquivo(s) JSON para validar\n`);

let allValid = true;
const results = [];

files.forEach((file) => {
  try {
    execSync(`node "${validateScript}" "${file}"`, {
      stdio: "inherit",
      cwd: projectRoot,
    });
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


