import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Carrega schema, ajv e regras customizadas (para uso por validate-json e validate-all-jsons).
 */
export async function loadDependencies() {
  try {
    const ajvModule = await import("ajv");
    const Ajv = ajvModule.default;
    const formatsModule = await import("ajv-formats");
    const addFormats = formatsModule.default;
    const customRulesModule = await import("../rules/custom-rules.js");
    const validateCustomRules = customRulesModule.validateCustomRules;

    // Carregar schema (caminho relativo ao script)
    const schemaPath = path.join(
      __dirname,
      "..",
      "schema",
      "surveyData.schema.json",
    );
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

/**
 * Valida um arquivo JSON (schema + regras customizadas).
 * @returns {boolean} true se válido, false caso contrário
 */
export function validateJSON(filePath, ajv, schema, validateCustomRules) {
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
    const schemaByMessage = new Map();
    validate.errors.forEach((error) => {
      const errorPath = error.instancePath || "/" || "(raiz)";
      const paramsStr = error.params
        ? Object.entries(error.params)
            .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
            .join(", ")
        : "";
      const key = paramsStr ? `${error.message} | Parâmetros: ${paramsStr}` : error.message;
      if (!schemaByMessage.has(key)) schemaByMessage.set(key, []);
      schemaByMessage.get(key).push(errorPath);
    });
    schemaByMessage.forEach((paths, message) => {
      console.error(message);
      [...new Set(paths)].forEach((p) => console.error(`   - ${p}`));
      console.error("");
    });
    return false;
  }

  // Validações customizadas: separar erros e avisos (warnings)
  const results = validateCustomRules(data);
  const errorsList = results.filter((r) => r.level !== "warning");
  const warningsList = results.filter((r) => r.level === "warning");

  if (warningsList.length > 0) {
    console.error("⚠️  AVISOS (Regras Customizadas):\n");
    const warningsByMessage = new Map();
    warningsList.forEach((w) => {
      const msg = w.message || "(sem mensagem)";
      if (!warningsByMessage.has(msg)) warningsByMessage.set(msg, []);
      warningsByMessage.get(msg).push(w.path || "(raiz)");
    });
    warningsByMessage.forEach((paths, message) => {
      console.error(message);
      [...new Set(paths)].forEach((p) => console.error(`   - ${p}`));
      console.error("");
    });
  }

  if (errorsList.length > 0) {
    console.error("❌ ERROS DE VALIDAÇÃO (Regras Customizadas):\n");
    const errorsByMessage = new Map();
    errorsList.forEach((error) => {
      const msg = error.message || "(sem mensagem)";
      if (!errorsByMessage.has(msg)) errorsByMessage.set(msg, []);
      errorsByMessage.get(msg).push(error.path || "(raiz)");
    });
    errorsByMessage.forEach((paths, message) => {
      console.error(message);
      [...new Set(paths)].forEach((p) => console.error(`   - ${p}`));
      console.error("");
    });
    return false;
  }

  if (warningsList.length > 0) {
    console.log("✅ JSON válido (com avisos).\n");
  } else {
    console.log("✅ JSON válido!\n");
  }
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
      "Uso: node data/validation/scripts/validate-json.js <caminho-do-json>",
    );
    console.error(
      "Exemplo: node data/validation/scripts/validate-json.js src/data/surveyData.json",
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

// Executar função principal apenas quando este script é o entry point
const isMain =
  process.argv[1] &&
  path.resolve(__filename) === path.resolve(process.argv[1]);
if (isMain) {
  main().catch((error) => {
    console.error("❌ Erro inesperado:", error);
    process.exit(1);
  });
}
