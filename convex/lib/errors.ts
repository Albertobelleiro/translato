export function mapDeepLError(status: number): { status: number; message: string } {
  if (status === 403) return { status: 401, message: "Invalid API key" };
  if (status === 429) return { status: 429, message: "Rate limit exceeded" };
  if (status === 456) return { status: 429, message: "Monthly translation quota exceeded. Please try again next month or contact the administrator." };
  if (status >= 500) return { status: 502, message: "Translation service unavailable" };
  return { status: 502, message: "Translation request failed" };
}
