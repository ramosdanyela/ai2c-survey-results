import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função para carregar dependências com tratamento de erro
async function loadDependencies() {
  try {
    const ajvModule = await import("ajv");
    const Ajv = ajvModule.default;
    const formatsModule = await import("ajv-formats");
    const addFormats = formatsModule.default;
    const customRulesModule = await import("../rules/custom-rules.js");
    const validateCustomRules = customRulesModule.validateCustomRules;

    // Carregar schema (caminho relativo ao script)
    const schemaPath = path.join(__dirname, "..", "schema", "surveyData.schema.json");
    if (!fs.existsSync(schemaPath)) {
      console.error("❌ Schema não encontrado:", schemaPath);
      process.exit(1);
    }
    let schema;
    try {
      schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
    } catch (e) {
      console.error("❌ Erro ao parsear schema:", schemaPath);
      console.error("   ", e.message);
      process.exit(1);
    }

    // Criar validador
    const ajv = new Ajv({
      allErrors: true,
      verbose: true,
      strict: false, // Permite propriedades adicionais por enquanto
    });
    addFormats(ajv);

    return { ajv, schema, validateCustomRules };
  } catch (error) {
    if (
      error.code === "ERR_MODULE_NOT_FOUND" ||
      error.message.includes("Cannot find")
    ) {
      console.error("❌ ERRO: Dependências não encontradas!");
      console.error("\n📦 Por favor, instale as dependências primeiro:");
      console.error("   npm install\n");
      console.error("Se o problema persistir, tente:");
      if (process.platform === "win32") {
        console.error("   rmdir /s /q node_modules");
        console.error("   del package-lock.json");
      } else {
        console.error("   rm -rf node_modules package-lock.json");
      }
      console.error("   npm install\n");
      process.exit(1);
    }
    throw error;
  }
}

// Função para validar arquivo
function validateJSON(filePath, ajv, schema, validateCustomRules) {
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

// Função principal async
async function main() {
  // Carregar dependências
  const { ajv, schema, validateCustomRules } = await loadDependencies();

  // Executar validação
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error(
      "Uso: node data/validation/scripts/validate-json.js <caminho-do-json>"
    );
    console.error(
      "Exemplo: node data/validation/scripts/validate-json.js src/data/surveyData.json"
    );
    process.exit(1);
  }

  const filePath = path.resolve(args[0]);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Arquivo não encontrado: ${filePath}`);
    process.exit(1);
  }

  const isValid = validateJSON(filePath, ajv, schema, validateCustomRules);
  process.exit(isValid ? 0 : 1);
}

// Executar função principal
main().catch((error) => {
  console.error("❌ Erro inesperado:", error);
  process.exit(1);
});
