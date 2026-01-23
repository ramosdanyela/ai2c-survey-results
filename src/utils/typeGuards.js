/**
 * Type guards para validação segura de tipos
 * 
 * Estes helpers substituem verificações repetitivas de typeof
 * e tornam o código mais legível e type-safe.
 * 
 * @example
 * import { isObject, isString } from "@/utils/typeGuards";
 * 
 * if (isObject(data)) {
 *   // TypeScript/IDE sabe que data é um objeto aqui
 *   console.log(data.someProperty);
 * }
 */

/**
 * Verifica se o valor é um objeto (não null, não array)
 */
export const isObject = (value) => 
  value !== null && typeof value === "object" && !Array.isArray(value);

/**
 * Verifica se o valor é um array
 */
export const isArray = (value) => 
  Array.isArray(value);

/**
 * Verifica se o valor é uma string não vazia
 */
export const isString = (value) => 
  typeof value === "string" && value.length > 0;

/**
 * Verifica se o valor é uma string (pode ser vazia)
 */
export const isStringOrEmpty = (value) => 
  typeof value === "string";

/**
 * Verifica se o valor é um número válido
 */
export const isNumber = (value) => 
  typeof value === "number" && !isNaN(value) && isFinite(value);

/**
 * Verifica se o valor é uma função
 */
export const isFunction = (value) => 
  typeof value === "function";

/**
 * Verifica se o valor é um objeto simples (plain object)
 */
export const isPlainObject = (value) => 
  isObject(value) && Object.prototype.toString.call(value) === "[object Object]";

/**
 * Verifica se o objeto tem a propriedade especificada
 */
export const hasProperty = (obj, prop) => 
  isObject(obj) && prop in obj;

/**
 * Verifica se o objeto tem todas as propriedades especificadas
 */
export const hasProperties = (obj, props) => 
  isObject(obj) && Array.isArray(props) && props.every(prop => prop in obj);

/**
 * Verifica se o valor é null ou undefined
 */
export const isNullOrUndefined = (value) => 
  value === null || value === undefined;

/**
 * Verifica se o valor não é null nem undefined
 */
export const isNotNullOrUndefined = (value) => 
  value !== null && value !== undefined;

/**
 * Verifica se o valor é truthy
 */
export const isTruthy = (value) => 
  Boolean(value);

/**
 * Verifica se o array não está vazio
 */
export const isNonEmptyArray = (value) => 
  Array.isArray(value) && value.length > 0;

/**
 * Verifica se o objeto não está vazio
 */
export const isNonEmptyObject = (value) => 
  isObject(value) && Object.keys(value).length > 0;
