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
