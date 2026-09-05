// Small random strings. Web Crypto is used so these work on the server and in the browser.

/** A short url-safe token for the public survey link /s/[token]. */
export function createSurveyToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(9));
  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

/** A readable password the admin can hand to a customer. */
export function createPassword(): string {
  // No l, I, O or 0, so that nobody mistypes the password from a screenshot.
  const alphabet = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(14));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}
