/**
 * Helper que valida e retorna o elemento para renderização (sem tooltip).
 * Mantém a mesma assinatura que wrapWithTooltip tinha para não quebrar callers.
 */
import React from "react";
import { logger } from "@/utils/logger";

export function wrapWithTooltip(comp, isExport, el) {
  if (isExport || !el) {
    if (el === null || el === undefined) return null;
    if (React.isValidElement(el)) return el;
    if (typeof el !== "object") return el;
    logger.warnCritical(
      "wrapWithTooltip: Tentando renderizar objeto inválido:",
      el,
      "Tipo:",
      typeof el,
    );
    return null;
  }
  if (!el || !React.isValidElement(el)) {
    if (el && typeof el === "object") {
      logger.warnCritical(
        "wrapWithTooltip: Elemento não é válido (objeto):",
        el,
      );
    }
    return null;
  }
  return el;
}
