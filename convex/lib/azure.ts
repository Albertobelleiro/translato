// DeepL uses uppercase codes (EN-GB, ZH-HANS, PT-BR, ES-419…)
// Azure Translator uses lowercase with its own variants
const DEEPL_TO_AZURE: Record<string, string> = {
  "EN":       "en",
  "EN-GB":    "en",
  "EN-US":    "en",
  "ES-419":   "es",
  "PT-BR":    "pt-br",
  "PT-PT":    "pt-pt",
  "ZH-HANS":  "zh-Hans",
  "ZH-HANT":  "zh-Hant",
  "NB":       "nb",
};

const AZURE_TO_DEEPL: Record<string, string> = {
  "en":      "EN",
  "es":      "ES",
  "pt-br":   "PT-BR",
  "pt-pt":   "PT-PT",
  "zh-Hans": "ZH-HANS",
  "zh-Hant": "ZH-HANT",
  "nb":      "NB",
};

export function toAzureLang(deeplCode: string): string {
  return DEEPL_TO_AZURE[deeplCode] ?? deeplCode.toLowerCase();
}

export function fromAzureLang(azureCode: string): string {
  return AZURE_TO_DEEPL[azureCode] ?? azureCode.toUpperCase();
}

export function mapAzureError(status: number): string {
  if (status === 401 || status === 403) return "Invalid Azure Translator key or region";
  if (status === 429) return "Rate limit exceeded. Try again in a moment";
  if (status >= 500) return "Translation service unavailable";
  return "Translation request failed";
}
