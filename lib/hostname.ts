/**
 * Hostname normalisation for user input. Pure and dependency-free so it can
 * be unit tested without the server-only detection module.
 */

/** Accepts "https://example.com/path", "example.com:8443", "EXAMPLE.com". */
export function normalizeHostname(value: string): string | null {
  let text = value.trim().toLowerCase();

  text = text.replace(/^[a-z][a-z0-9+.-]*:\/\//, "");
  text = text.split("/")[0];
  text = text.split("?")[0];
  text = text.replace(/^[^@]*@/, "");
  text = text.replace(/:\d+$/, "");
  text = text.replace(/\.$/, "");

  if (text === "" || text.length > 253 || !text.includes(".")) {
    return null;
  }

  const labels = text.split(".");

  if (labels.length < 2) {
    return null;
  }

  const labelPattern = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

  if (!labels.every((label) => labelPattern.test(label))) {
    return null;
  }

  // The last label must look like a TLD, not a number.
  if (!/^[a-z]{2,}$/.test(labels[labels.length - 1])) {
    return null;
  }

  return text;
}
