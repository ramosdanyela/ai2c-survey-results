import Ajv from "ajv";
import addFormats from "ajv-formats";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { validateCustomRules } from "../rules/custom-rules.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar schema
const schemaPath = path.join(__dirname, "../schema/surveyData.schema.json");
const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));

// Criar validador
const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  strict: false, // Permite propriedades adicionais por enquanto
});
addFormats(ajv);

// Função para validar arquivo
function validateJSON(filePath) {
  console.log(`\n🔍 Validando: ${filePath}\n`);

  // Ler e parsear JSON
  let data;
  let fileContent;
  try {
    fileContent = fs.readFileSync(filePath, "utf8");
    data = JSON.parse(fileContent);
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error("❌ ERRO DE SINTAXE JSON:");
      console.error(`   ${error.message}`);

      // Tentar encontrar a linha aproximada
      const match = error.message.match(/position (\d+)/);
      if (match) {
        const position = parseInt(match[1]);
        const lines = fileContent.substring(0, position).split("\n");
        const lineNumber = lines.length;
        const column = lines[lines.length - 1].length + 1;
        console.error(`   Linha: ${lineNumber}, Coluna: ${column}`);
      }
      return false;
    }
    throw error;
  }

  // Validar contra schema
  const validate = ajv.compile(schema);
  const valid = validate(data);

  if (!valid) {
    console.error("❌ ERROS DE VALIDAÇÃO (JSON Schema):\n");
    validate.errors.forEach((error, index) => {
      const errorPath = error.instancePath || "/";
      console.error(`${index + 1}. ${errorPath || "(raiz)"}`);
      console.error(`   ${error.message}`);
      if (error.params) {
        const paramsStr = Object.entries(error.params)
          .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
          .join(", ");
        if (paramsStr) {
          console.error(`   Parâmetros: ${paramsStr}`);
        }
      }
      console.error("");
    });
    return false;
  }

  // Validações customizadas adicionais
  const customErrors = validateCustomRules(data);
  if (customErrors.length > 0) {
    console.error("❌ ERROS DE VALIDAÇÃO (Regras Customizadas):\n");
    customErrors.forEach((error, index) => {
      console.error(`${index + 1}. ${error.path || "(raiz)"}`);
      console.error(`   ${error.message}\n`);
    });
    return false;
  }

  console.log("✅ JSON válido!\n");
  return true;
}

// Executar validação
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Uso: node data/validation/scripts/validate-json.js <caminho-do-json>");
  console.error("Exemplo: node data/validation/scripts/validate-json.js src/data/surveyData.json");
  process.exit(1);
}

const filePath = path.resolve(args[0]);
if (!fs.existsSync(filePath)) {
  console.error(`❌ Arquivo não encontrado: ${filePath}`);
  process.exit(1);
}

const isValid = validateJSON(filePath);
process.exit(isValid ? 0 : 1);

