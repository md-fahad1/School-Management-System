export function getErrorMessage(
  err: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  const raw =
    typeof err === "string" ? err : (err as any)?.message ?? "";
  const msg = String(raw).trim();
  if (!msg) return fallback;
  const lower = msg.toLowerCase();

  if (lower.includes("failed to fetch") || lower.includes("networkerror"))
    return "Can't reach the server. Please check your internet and try again.";
  if (lower.includes("unauthorized") || lower.includes("jwt"))
    return "Your session has expired. Please sign in again.";
  if (lower.includes("forbidden"))
    return "You don't have permission to do this.";
  if (lower.includes("unique constraint")) {
    const field = msg.match(/\(`?([a-zA-Z_]+)`?\)/)?.[1];
    return field ? `That ${field} is already in use.` : "This record already exists.";
  }
  if (lower.includes("foreign key constraint"))
    return "This item is still linked to other records. Remove those links first.";
  if (lower === "bad request exception" || lower.includes("invalid `prisma."))
    return fallback;
  return msg;
}