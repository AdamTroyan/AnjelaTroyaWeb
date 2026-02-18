// Escapes HTML special characters to prevent XSS
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      case "'": return "&#39;";
      default: return c;
    }
  });
}
export function formatPrice(value: string) {
  const normalized = value.replace(/[^0-9.]/g, "");
  const parsed = Number(normalized);

  if (Number.isNaN(parsed)) {
    return value;
  }

  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parsed);

  return `${formatted} ₪`;
}
