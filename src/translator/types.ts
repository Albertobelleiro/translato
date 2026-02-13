export interface DeepLLanguage {
  language: string;
  name: string;
  supports_formality?: boolean;
}
export interface DeepLUsage {
  character_count: number;
  character_limit: number;
}
export class DeepLError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "DeepLError";
  }
}

// --- Translation request/response types ---

export interface TranslateRequest {
  text: string;
  source_lang?: string;
  target_lang: string;
}

export interface TranslateResponse {
  translatedText: string;
  detectedSourceLang: string;
}

export interface DeepLTranslateBody {
  text: string[];
  target_lang: string;
  source_lang?: string;
  model_type?: string;
}

export interface DeepLTranslateResult {
  translations: Array<{
    detected_source_language: string;
    text: string;
  }>;
}

export interface Language {
  code: string;
  name: string;
}
