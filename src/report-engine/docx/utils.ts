/**
 * DOCX report-engine utilities.
 */

const DATA_URL_PREFIX = /^data:image\/png;base64,/;

/**
 * Converts a base64 string or data URL to Uint8Array for docx ImageRun.
 * Strips the "data:image/png;base64," prefix if present.
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  const raw = base64.replace(DATA_URL_PREFIX, "");
  const binary = atob(raw);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
