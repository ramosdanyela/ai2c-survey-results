#!/usr/bin/env node

/**
 * Script para análise de código não utilizado
 * Identifica componentes, funções e arquivos não referenciados
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { glob } from "glob";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const srcDir = path.join(projectRoot, "src");

// Extensões de arquivo para análise
const FILE_EXTENSIONS = [".js", ".jsx", ".ts", ".tsx"];

// Padrões para ignorar
const IGNORE_PATTERNS = [
  "node_modules/**",
  "dist/**",
  "build/**",
  "*.config.js",
  "*.config.ts",
  "vite.config.js",
  "eslint.config.js",
];

/**
 * Extrai imports de um arquivo
 */
function extractImports(content) {
  const imports = new Set();

  // Import padrão: import X from '...'
  const defaultImportRegex = /import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g;
  // Import nomeado: import { X, Y } from '...'
  const namedImportRegex = /import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g;
  // Import namespace: import * as X from '...'
  const namespaceImportRegex =
    /import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g;
  // Import default + named: import X, { Y } from '...'
  const mixedImportRegex =
    /import\s+(\w+)\s*,\s*\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g;
  // Dynamic import: import('...')
  const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  // Require: require('...')
  const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

  let match;

  // Default imports
  while ((match = defaultImportRegex.exec(content)) !== null) {
    imports.add({ name: match[1], from: match[2], type: "default" });
  }

  // Named imports
  while ((match = namedImportRegex.exec(content)) !== null) {
    const names = match[1]
      .split(",")
      .map((n) => n.trim().split(" as ")[0].trim());
    names.forEach((name) => {
      if (name) imports.add({ name, from: match[2], type: "named" });
    });
  }

  // Namespace imports
  while ((match = namespaceImportRegex.exec(content)) !== null) {
    imports.add({ name: match[1], from: match[2], type: "namespace" });
  }

  // Mixed imports
  while ((match = mixedImportRegex.exec(content)) !== null) {
    imports.add({ name: match[1], from: match[3], type: "default" });
    const names = match[2]
      .split(",")
      .map((n) => n.trim().split(" as ")[0].trim());
    names.forEach((name) => {
      if (name) imports.add({ name, from: match[3], type: "named" });
    });
  }

  // Dynamic imports
  while ((match = dynamicImportRegex.exec(content)) !== null) {
    imports.add({ name: "*", from: match[1], type: "dynamic" });
  }

  // Require
  while ((match = requireRegex.exec(content)) !== null) {
    imports.add({ name: "*", from: match[1], type: "require" });
  }

  return Array.from(imports);
}

/**
 * Extrai exports de um arquivo
 */
function extractExports(content, filePath) {
  const exports = {
    default: null,
    named: new Set(),
    all: false,
  };

  // Export default
  const defaultExportRegex =
    /export\s+default\s+(?:function\s+)?(\w+)|export\s+default\s+(\w+)/g;
  let match;
  while ((match = defaultExportRegex.exec(content)) !== null) {
    exports.default = match[1] || match[2] || "default";
  }

  // Export default no final do arquivo
  if (content.match(/export\s+default\s*$/m)) {
    const fileName = path.basename(filePath, path.extname(filePath));
    exports.default = fileName;
  }

  // Named exports
  const namedExportRegex =
    /export\s+(?:const|let|var|function|class|async\s+function)\s+(\w+)/g;
  while ((match = namedExportRegex.exec(content)) !== null) {
    exports.named.add(match[1]);
  }

  // Export { ... }
  const exportListRegex = /export\s+\{([^}]+)\}/g;
  while ((match = exportListRegex.exec(content)) !== null) {
    const names = match[1]
      .split(",")
      .map((n) => n.trim().split(" as ")[0].trim());
    names.forEach((name) => {
      if (name && name !== "default") exports.named.add(name);
    });
  }

  // Export * from
  if (content.match(/export\s+\*\s+from/)) {
    exports.all = true;
  }

  return exports;
}

/**
 * Resolve caminho de import relativo para absoluto
 */
function resolveImportPath(importPath, fromFile) {
  // Ignorar imports de node_modules
  if (!importPath.startsWith(".") && !importPath.startsWith("/")) {
    return null;
  }

  const fromDir = path.dirname(fromFile);

  // Resolver alias @
  if (importPath.startsWith("@/")) {
    const relativePath = importPath.replace("@/", "");
    return path.join(srcDir, relativePath);
  }

  // Resolver caminho relativo
  let resolved = path.resolve(fromDir, importPath);

  // Tentar adicionar extensões se não existir
  if (!fs.existsSync(resolved)) {
    for (const ext of [
      "",
      ".js",
      ".jsx",
      ".ts",
      ".tsx",
      "/index.js",
      "/index.jsx",
      "/index.ts",
      "/index.tsx",
    ]) {
      const withExt = resolved + ext;
      if (fs.existsSync(withExt)) {
        return withExt;
      }
    }
  }

  return fs.existsSync(resolved) ? resolved : null;
}

/**
 * Encontra todos os arquivos fonte
 */
async function findAllSourceFiles() {
  const files = [];
  for (const ext of FILE_EXTENSIONS) {
    const pattern = `**/*${ext}`;
    const found = await glob(pattern, {
      cwd: srcDir,
      ignore: IGNORE_PATTERNS,
      absolute: true,
    });
    files.push(...found);
  }
  return files;
}

/**
 * Analisa uso de componentes e funções
 */
function analyzeUsage(files) {
  const fileMap = new Map();
  const exportsMap = new Map();
  const importsMap = new Map();
  const usageMap = new Map();

  // Fase 1: Mapear todos os exports
  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8");
    const exports = extractExports(content, file);
    const imports = extractImports(content);

    fileMap.set(file, { content, exports, imports });
    exportsMap.set(file, exports);
    importsMap.set(file, imports);

    // Inicializar mapa de uso
    if (exports.default) {
      usageMap.set(exports.default, { file, type: "default", used: false });
    }
    exports.named.forEach((name) => {
      usageMap.set(`${file}::${name}`, {
        file,
        name,
        type: "named",
        used: false,
      });
    });
  }

  // Fase 2: Rastrear uso
  for (const [file, imports] of importsMap) {
    if (!Array.isArray(imports)) continue;
    for (const imp of imports) {
      if (imp.from.startsWith("@/") || imp.from.startsWith(".")) {
        const resolvedPath = resolveImportPath(imp.from, file);
        if (resolvedPath && exportsMap.has(resolvedPath)) {
          const targetExports = exportsMap.get(resolvedPath);

          if (imp.type === "default" && targetExports.default) {
            const key = targetExports.default;
            if (usageMap.has(key)) {
              usageMap.get(key).used = true;
            }
          } else if (imp.type === "named") {
            const key = `${resolvedPath}::${imp.name}`;
            if (usageMap.has(key)) {
              usageMap.get(key).used = true;
            }
          } else if (
            imp.type === "namespace" ||
            imp.type === "dynamic" ||
            imp.type === "require"
          ) {
            // Marcar todos os exports como usados
            if (targetExports.default) {
              const key = targetExports.default;
              if (usageMap.has(key)) usageMap.get(key).used = true;
            }
            targetExports.named.forEach((name) => {
              const key = `${resolvedPath}::${name}`;
              if (usageMap.has(key)) usageMap.get(key).used = true;
            });
          }
        }
      }
    }
  }

  // Fase 3: Identificar arquivos não utilizados
  const unusedFiles = [];
  const fileUsageCount = new Map();

  for (const [file] of fileMap) {
    let usageCount = 0;
    const fileImports = importsMap.get(file);
    if (!Array.isArray(fileImports)) continue;

    for (const imp of fileImports) {
      if (imp.from.startsWith("@/") || imp.from.startsWith(".")) {
        const resolvedPath = resolveImportPath(imp.from, file);
        if (resolvedPath) usageCount++;
      }
    }

    fileUsageCount.set(file, usageCount);
  }

  // Arquivos não importados (exceto entry points)
  const entryPoints = [
    path.join(srcDir, "main.jsx"),
    path.join(srcDir, "App.jsx"),
  ];

  for (const [file, count] of fileUsageCount) {
    if (count === 0 && !entryPoints.includes(file)) {
      const relativePath = path.relative(srcDir, file);
      unusedFiles.push({
        file: relativePath,
        absolutePath: file,
        reason: "Nunca importado",
      });
    }
  }

  return {
    unusedExports: Array.from(usageMap.entries())
      .filter(([_, info]) => !info.used)
      .map(([key, info]) => ({
        key,
        ...info,
        relativePath: path.relative(srcDir, info.file),
      })),
    unusedFiles,
    statistics: {
      totalFiles: files.length,
      totalExports: usageMap.size,
      unusedExports: Array.from(usageMap.values()).filter((e) => !e.used)
        .length,
      unusedFiles: unusedFiles.length,
    },
  };
}

/**
 * Gera relatório HTML
 */
function generateHTMLReport(results) {
  const { unusedExports, unusedFiles, statistics } = results;

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório de Código Não Utilizado</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      padding: 20px;
      line-height: 1.6;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
      margin-bottom: 10px;
      border-bottom: 3px solid #4CAF50;
      padding-bottom: 10px;
    }
    h2 {
      color: #555;
      margin-top: 30px;
      margin-bottom: 15px;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 5px;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin: 20px 0;
    }
    .stat-card {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid #4CAF50;
    }
    .stat-card.warning {
      border-left-color: #ff9800;
    }
    .stat-card.danger {
      border-left-color: #f44336;
    }
    .stat-value {
      font-size: 2em;
      font-weight: bold;
      color: #333;
    }
    .stat-label {
      color: #666;
      font-size: 0.9em;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background: #f8f9fa;
      font-weight: 600;
      color: #555;
    }
    tr:hover {
      background: #f8f9fa;
    }
    .file-path {
      font-family: 'Monaco', 'Courier New', monospace;
      color: #2196F3;
      font-size: 0.9em;
    }
    .export-name {
      font-family: 'Monaco', 'Courier New', monospace;
      color: #4CAF50;
      font-weight: 600;
    }
    .empty {
      text-align: center;
      padding: 40px;
      color: #999;
      font-style: italic;
    }
    .timestamp {
      color: #999;
      font-size: 0.9em;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 Relatório de Código Não Utilizado</h1>
    <div class="timestamp">Gerado em: ${new Date().toLocaleString(
      "pt-BR"
    )}</div>
    
    <div class="stats">
      <div class="stat-card">
        <div class="stat-value">${statistics.totalFiles}</div>
        <div class="stat-label">Arquivos Totais</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${statistics.totalExports}</div>
        <div class="stat-label">Exports Totais</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-value">${statistics.unusedExports}</div>
        <div class="stat-label">Exports Não Utilizados</div>
      </div>
      <div class="stat-card danger">
        <div class="stat-value">${statistics.unusedFiles}</div>
        <div class="stat-label">Arquivos Não Utilizados</div>
      </div>
    </div>

    <h2>📁 Arquivos Não Utilizados</h2>
    ${
      unusedFiles.length > 0
        ? `
    <table>
      <thead>
        <tr>
          <th>Arquivo</th>
          <th>Motivo</th>
        </tr>
      </thead>
      <tbody>
        ${unusedFiles
          .map(
            (f) => `
          <tr>
            <td class="file-path">${f.file}</td>
            <td>${f.reason}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
    `
        : '<div class="empty">✅ Nenhum arquivo não utilizado encontrado!</div>'
    }

    <h2>🔧 Exports Não Utilizados</h2>
    ${
      unusedExports.length > 0
        ? `
    <table>
      <thead>
        <tr>
          <th>Arquivo</th>
          <th>Tipo</th>
          <th>Nome</th>
        </tr>
      </thead>
      <tbody>
        ${unusedExports
          .map(
            (e) => `
          <tr>
            <td class="file-path">${e.relativePath}</td>
            <td>${e.type}</td>
            <td class="export-name">${e.name || "default"}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
    `
        : '<div class="empty">✅ Nenhum export não utilizado encontrado!</div>'
    }
  </div>
</body>
</html>
  `;

  return html;
}

/**
 * Função principal
 */
async function main() {
  console.log("🔍 Iniciando análise de código não utilizado...\n");

  try {
    // Encontrar todos os arquivos
    console.log("📂 Buscando arquivos fonte...");
    const files = await findAllSourceFiles();
    console.log(`   Encontrados ${files.length} arquivos\n`);

    // Analisar uso
    console.log("🔎 Analisando imports e exports...");
    const results = analyzeUsage(files);
    console.log("   Análise concluída!\n");

    // Criar diretório de relatórios
    const reportsDir = path.join(projectRoot, "reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Salvar relatório JSON
    const jsonPath = path.join(reportsDir, "unused-code-analysis.json");
    fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
    console.log(`✅ Relatório JSON salvo em: ${jsonPath}`);

    // Salvar relatório HTML
    const htmlPath = path.join(reportsDir, "unused-code-report.html");
    const html = generateHTMLReport(results);
    fs.writeFileSync(htmlPath, html);
    console.log(`✅ Relatório HTML salvo em: ${htmlPath}\n`);

    // Exibir resumo
    console.log("📊 Resumo:");
    console.log(`   Total de arquivos: ${results.statistics.totalFiles}`);
    console.log(`   Total de exports: ${results.statistics.totalExports}`);
    console.log(
      `   Exports não utilizados: ${results.statistics.unusedExports}`
    );
    console.log(
      `   Arquivos não utilizados: ${results.statistics.unusedFiles}\n`
    );

    if (
      results.statistics.unusedExports > 0 ||
      results.statistics.unusedFiles > 0
    ) {
      console.log("⚠️  Código não utilizado encontrado!");
      console.log("   Revise o relatório HTML para detalhes.\n");
    } else {
      console.log("✨ Nenhum código não utilizado encontrado!\n");
    }
  } catch (error) {
    console.error("❌ Erro durante análise:", error);
    process.exit(1);
  }
}

main();
