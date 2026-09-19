// Headers for server-side calls to the backend, carrying the real
// visitor's IP and user agent so rate limits and audit logs are correct.
export function forwardedHeaders(incoming: Headers): Record<string, string> {
  const out: Record<string, string> = { "Content-Type": "application/json" };
  const xff = incoming.get("x-forwarded-for") ?? incoming.get("x-real-ip");
  if (xff) out["x-forwarded-for"] = xff;
  const ua = incoming.get("user-agent");
  if (ua) out["user-agent"] = ua;
  return out;
}