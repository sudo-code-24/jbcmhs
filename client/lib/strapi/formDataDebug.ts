/** Log FormData keys and value types (dev only). Never logs full file bytes. */
export function debugLogFormData(fd: FormData, label: string): void {
  if (process.env.NODE_ENV === "production") return;
  // eslint-disable-next-line no-console
  console.log(`[FormData] ${label}`);
  for (const [key, value] of Array.from(fd.entries())) {
    if (typeof File !== "undefined" && value instanceof File) {
      // eslint-disable-next-line no-console
      console.log(`  ${key}: File(name=${value.name}, size=${value.size}, type=${value.type || "n/a"})`);
    } else if (typeof Blob !== "undefined" && value instanceof Blob) {
      // eslint-disable-next-line no-console
      console.log(`  ${key}: Blob(size=${value.size}, type=${value.type || "n/a"})`);
    } else {
      const s = String(value);
      // eslint-disable-next-line no-console
      console.log(`  ${key}:`, s.length > 300 ? `${s.slice(0, 300)}…` : s);
    }
  }
}
