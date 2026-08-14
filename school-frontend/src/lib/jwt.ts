/**
 * Decodes a JWT payload without verifying the signature. This is only
 * ever used for UX-level expiry checks (should we refresh yet? should
 * middleware redirect to /signin?) — the backend independently verifies
 * the real signature on every actual GraphQL request via passport-jwt.
 * Never trust this decode for an authorization decision that matters.
 */
export function decodeJwt<T = any>(token: string): T | null {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json =
      typeof atob !== "undefined"
        ? atob(base64)
        : Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

/**
 * True if the token is already expired, or will expire within
 * `bufferSeconds` — the buffer lets callers refresh slightly ahead of
 * the real expiry instead of racing it.
 */
export function isExpired(token: string, bufferSeconds = 10): boolean {
  const payload = decodeJwt<{ exp?: number }>(token);
  if (!payload?.exp) return true;
  return Date.now() >= (payload.exp - bufferSeconds) * 1000;
}