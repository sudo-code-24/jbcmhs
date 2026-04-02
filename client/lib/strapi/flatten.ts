/** Normalize Strapi 4 (attributes) or Strapi 5 flat entity shapes. */
export function flattenStrapiEntity(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object") return {};
  const e = raw as Record<string, unknown>;
  const attrs = e.attributes;
  if (attrs && typeof attrs === "object" && attrs !== null && !Array.isArray(attrs)) {
    const a = attrs as Record<string, unknown>;
    return {
      id: e.id,
      documentId: e.documentId,
      ...a,
    };
  }
  return { ...e };
}

export function unwrapStrapiList(raw: unknown): unknown[] {
  if (!raw || typeof raw !== "object") return [];
  const data = (raw as Record<string, unknown>).data;
  return Array.isArray(data) ? data : [];
}

export function unwrapStrapiSingle(raw: unknown): unknown | null {
  if (!raw || typeof raw !== "object") return null;
  const data = (raw as Record<string, unknown>).data;
  if (data === undefined || data === null) return null;
  return data;
}
