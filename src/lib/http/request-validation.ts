export type JsonObject = Record<string, unknown>;

export async function readJsonObject(request: Request): Promise<JsonObject | null> {
  try {
    const value: unknown = await request.json();
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    return value as JsonObject;
  } catch {
    return null;
  }
}

export function hasOnlyKeys(value: JsonObject, allowed: readonly string[]): boolean {
  const allowedSet = new Set(allowed);
  return Object.keys(value).every((key) => allowedSet.has(key));
}

export function readBoundedString(
  value: unknown,
  options: { min?: number; max: number },
): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  const minimum = options.min ?? 1;
  if (trimmed.length < minimum || trimmed.length > options.max) return null;
  return trimmed;
}

export function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}
