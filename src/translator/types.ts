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
