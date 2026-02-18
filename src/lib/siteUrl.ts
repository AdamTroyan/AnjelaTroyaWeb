function normalizeSiteUrl(value?: string) {
  if (!value) {
    return "";
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  const withProtocol =
    trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;
  try {
    return new URL(withProtocol).origin;
  } catch {
    return "";
  }
}

export function getSiteUrl() {
  return normalizeSiteUrl(process.env.SITE_URL) || "https://anjelatroya.co.il";
}
