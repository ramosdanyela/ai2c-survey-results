// Script temporário para converter surveyData.js para JSON
// Pode ser deletado após a conversão

import * as surveyData from "../src/data/surveyData.js";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const jsonData = {
  surveyInfo: surveyData.surveyInfo,
  executiveReport: surveyData.executiveReport,
  supportAnalysis: surveyData.supportAnalysis,
  responseDetails: surveyData.responseDetails,
  attributeDeepDive: surveyData.attributeDeepDive,
  implementationPlan: surveyData.implementationPlan,
  uiTexts: surveyData.uiTexts,
  sectionsConfig: surveyData.sectionsConfig,
  severityLabels: surveyData.severityLabels,
};

const outputPath = join(__dirname, "../src/data/surveyData.json");
writeFileSync(outputPath, JSON.stringify(jsonData, null, 2), "utf8");

console.log("✅ JSON criado com sucesso em:", outputPath);
console.log(
  "📦 Tamanho do arquivo:",
  (jsonData.toString().length / 1024).toFixed(2),
  "KB"
);
