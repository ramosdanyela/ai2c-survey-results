/**
 * Helpers para manipulação segura de dados
 * 
 * Estes helpers substituem verificações repetitivas e mutações diretas
 * de objetos, tornando o código mais seguro e legível.
 * 
 * @example
 * import { safeSet, safeGet } from "@/utils/dataHelpers";
 * 
 * safeSet(data, "_filterPillsState.questionFilter", "all");
 * const filter = safeGet(data, "_filterPillsState.questionFilter", "all");
 */

import { isObject } from "./typeGuards";

/**
 * Atualiza uma propriedade aninhada de forma segura
 * 
 * @param {Object} obj - Objeto alvo
 * @param {string} path - Caminho da propriedade (ex: "a.b.c")
 * @param {*} value - Valor a ser definido
 * @returns {boolean} - true se a operação foi bem-sucedida
 * 
 * @example
 * const data = { a: { b: {} } };
 * safeSet(data, "a.b.c", "value"); // data.a.b.c = "value"
 */
export const safeSet = (obj, path, value) => {
  if (!isObject(obj) || !path) return false;
  
  const keys = path.split(".");
  let current = obj;
  
  // Cria objetos intermediários se não existirem
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!isObject(current[key])) {
      current[key] = {};
    }
    current = current[key];
  }
  
  // Define o valor final
  current[keys[keys.length - 1]] = value;
  return true;
};

/**
 * Obtém uma propriedade aninhada de forma segura
 * 
 * @param {Object} obj - Objeto fonte
 * @param {string} path - Caminho da propriedade (ex: "a.b.c")
 * @param {*} defaultValue - Valor padrão se a propriedade não existir
 * @returns {*} - Valor da propriedade ou defaultValue
 * 
 * @example
 * const data = { a: { b: { c: "value" } } };
 * safeGet(data, "a.b.c"); // "value"
 * safeGet(data, "a.b.d", "default"); // "default"
 */
export const safeGet = (obj, path, defaultValue = null) => {
  if (!isObject(obj) || !path) return defaultValue;
  
  const keys = path.split(".");
  let current = obj;
  
  for (const key of keys) {
    if (!isObject(current) || !(key in current)) {
      return defaultValue;
    }
    current = current[key];
  }
  
  return current;
};

/**
 * Verifica se um caminho existe no objeto
 * 
 * @param {Object} obj - Objeto a verificar
 * @param {string} path - Caminho da propriedade
 * @returns {boolean} - true se o caminho existe
 * 
 * @example
 * const data = { a: { b: { c: "value" } } };
 * hasPath(data, "a.b.c"); // true
 * hasPath(data, "a.b.d"); // false
 */
export const hasPath = (obj, path) => {
  return safeGet(obj, path, undefined) !== undefined;
};

/**
 * Mescla dois objetos de forma segura (shallow merge)
 * 
 * @param {Object} target - Objeto alvo
 * @param {Object} source - Objeto fonte
 * @returns {Object} - Novo objeto mesclado
 * 
 * @example
 * const merged = safeMerge({ a: 1 }, { b: 2 }); // { a: 1, b: 2 }
 */
export const safeMerge = (target, source) => {
  if (!isObject(target)) return isObject(source) ? { ...source } : {};
  if (!isObject(source)) return { ...target };
  
  return { ...target, ...source };
};

/**
 * Mescla objetos aninhados de forma recursiva (deep merge)
 * 
 * @param {Object} target - Objeto alvo
 * @param {Object} source - Objeto fonte
 * @returns {Object} - Novo objeto mesclado recursivamente
 * 
 * @example
 * const merged = deepMerge(
 *   { a: { b: 1, c: 2 } },
 *   { a: { b: 3 } }
 * ); // { a: { b: 3, c: 2 } }
 */
export const deepMerge = (target, source) => {
  if (!isObject(target)) return isObject(source) ? { ...source } : {};
  if (!isObject(source)) return { ...target };
  
  const result = { ...target };
  
  for (const key in source) {
    if (isObject(source[key]) && isObject(target[key])) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
};

/**
 * Obtém um valor de um objeto com fallback em cadeia
 * 
 * @param {Object} obj - Objeto fonte
 * @param {string[]} paths - Array de caminhos a tentar
 * @param {*} defaultValue - Valor padrão se nenhum caminho existir
 * @returns {*} - Primeiro valor encontrado ou defaultValue
 * 
 * @example
 * const data = { a: { b: "value" } };
 * getFirstAvailable(data, ["a.b", "a.c", "x.y"], "default"); // "value"
 */
export const getFirstAvailable = (obj, paths, defaultValue = null) => {
  if (!isObject(obj) || !Array.isArray(paths)) return defaultValue;
  
  for (const path of paths) {
    const value = safeGet(obj, path, undefined);
    if (value !== undefined) {
      return value;
    }
  }
  
  return defaultValue;
};
