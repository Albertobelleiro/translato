import { test, expect, describe, beforeEach, afterEach, mock } from "bun:test";
import { renderHook, waitFor } from "@testing-library/react";
import { useTranslate } from "./useTranslate.ts";

describe("useTranslate", () => {
  let originalFetch: typeof global.fetch;
  let fetchMock: ReturnType<typeof mock>;

  beforeEach(() => {
    originalFetch = global.fetch;
    fetchMock = mock(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        translatedText: "Hola mundo",
        detectedSourceLang: "EN",
      }),
    } as Response));
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test("returns initial state", () => {
    const { result } = renderHook(() => useTranslate("", "", "ES"));

    expect(result.current.translatedText).toBe("");
    expect(result.current.detectedLang).toBe("");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.forceTranslate).toBe("function");
  });

  test("does not trigger fetch for empty source text", async () => {
    const { result } = renderHook(() => useTranslate("", "EN", "ES"));

    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.translatedText).toBe("");
    expect(result.current.isLoading).toBe(false);
  });

  test("does not trigger fetch for whitespace-only text", async () => {
    const { result } = renderHook(() => useTranslate("   ", "EN", "ES"));

    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.translatedText).toBe("");
  });

  test("does not trigger fetch when target language is empty", async () => {
    const { result } = renderHook(() => useTranslate("Hello", "EN", ""));

    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.translatedText).toBe("");
  });

  test("debounces API calls with 400ms delay", async () => {
    const { rerender } = renderHook(
      ({ text }) => useTranslate(text, "EN", "ES"),
      { initialProps: { text: "Hello" } }
    );

    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(fetchMock).not.toHaveBeenCalled();

    rerender({ text: "Hello world" });
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(fetchMock).not.toHaveBeenCalled();

    await new Promise((resolve) => setTimeout(resolve, 250));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("makes POST request to /api/translate with correct payload", async () => {
    renderHook(() => useTranslate("Hello world", "EN", "ES"));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    }, { timeout: 1000 });

    const call = fetchMock.mock.calls[0];
    expect(call?.[0]).toBe("/api/translate");
    expect(call?.[1]?.method).toBe("POST");
    expect(call?.[1]?.headers).toEqual({ "Content-Type": "application/json" });

    const body = JSON.parse(call?.[1]?.body as string);
    expect(body).toEqual({
      text: "Hello world",
      source_lang: "EN",
      target_lang: "ES",
    });
  });

  test("sends undefined for source_lang when empty", async () => {
    renderHook(() => useTranslate("Hello", "", "ES"));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    }, { timeout: 1000 });

    const call = fetchMock.mock.calls[0];
    const body = JSON.parse(call?.[1]?.body as string);
    expect(body.source_lang).toBeUndefined();
  });

  test("updates state with successful translation response", async () => {
    const { result } = renderHook(() => useTranslate("Hello", "EN", "ES"));

    await waitFor(() => {
      expect(result.current.translatedText).toBe("Hola mundo");
    }, { timeout: 1000 });

    expect(result.current.detectedLang).toBe("EN");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  test("sets isLoading to true during fetch", async () => {
    let resolvePromise: (value: unknown) => void;
    const delayedPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    global.fetch = mock(() => delayedPromise) as unknown as typeof fetch;

    const { result } = renderHook(() => useTranslate("Hello", "EN", "ES"));

    await new Promise((resolve) => setTimeout(resolve, 450));
    expect(result.current.isLoading).toBe(true);

    resolvePromise!({
      ok: true,
      json: () => Promise.resolve({
        translatedText: "Hola",
        detectedSourceLang: "EN",
      }),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  test("handles API error response", async () => {
    global.fetch = mock(() => Promise.resolve({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: "API key invalid" }),
    } as Response)) as unknown as typeof fetch;

    const { result } = renderHook(() => useTranslate("Hello", "EN", "ES"));

    await waitFor(() => {
      expect(result.current.error).toBe("API key invalid");
    }, { timeout: 1000 });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.translatedText).toBe("");
  });

  test("handles API error without error message", async () => {
    global.fetch = mock(() => Promise.resolve({
      ok: false,
      status: 404,
      json: () => Promise.resolve({}),
    } as Response)) as unknown as typeof fetch;

    const { result } = renderHook(() => useTranslate("Hello", "EN", "ES"));

    await waitFor(() => {
      expect(result.current.error).toBe("Error 404");
    }, { timeout: 1000 });
  });

  test("handles network error", async () => {
    global.fetch = mock(() => Promise.reject(new Error("Network error"))) as unknown as typeof fetch;

    const { result } = renderHook(() => useTranslate("Hello", "EN", "ES"));

    await waitFor(() => {
      expect(result.current.error).toBe("Network error");
    }, { timeout: 1000 });

    expect(result.current.isLoading).toBe(false);
  });

  test("aborts previous request when parameters change", async () => {
    let controller1Aborted = false;
    let controller2Aborted = false;

    const createMockFetch = (isFirst: boolean) => {
      return mock((url: string, options?: RequestInit) => {
        const signal = options?.signal as AbortSignal;
        if (signal) {
          signal.addEventListener("abort", () => {
            if (isFirst) controller1Aborted = true;
            else controller2Aborted = true;
          });
        }
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: () => Promise.resolve({
                translatedText: isFirst ? "First" : "Second",
                detectedSourceLang: "EN",
              }),
            } as Response);
          }, 100);
        });
      });
    };

    global.fetch = createMockFetch(true) as unknown as typeof fetch;

    const { rerender } = renderHook(
      ({ text }) => useTranslate(text, "EN", "ES"),
      { initialProps: { text: "First" } }
    );

    await new Promise((resolve) => setTimeout(resolve, 450));

    global.fetch = createMockFetch(false) as unknown as typeof fetch;
    rerender({ text: "Second" });

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(controller1Aborted).toBe(true);
  });

  test("forceTranslate triggers immediate translation", async () => {
    const { result } = renderHook(() => useTranslate("Hello", "EN", "ES"));

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(fetchMock).not.toHaveBeenCalled();

    result.current.forceTranslate();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    }, { timeout: 200 });
  });

  test("forceTranslate cancels pending debounced call", async () => {
    const { result } = renderHook(() => useTranslate("Hello", "EN", "ES"));

    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(fetchMock).not.toHaveBeenCalled();

    result.current.forceTranslate();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    }, { timeout: 200 });

    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("clears state when source text becomes empty", async () => {
    const { result, rerender } = renderHook(
      ({ text }) => useTranslate(text, "EN", "ES"),
      { initialProps: { text: "Hello" } }
    );

    await waitFor(() => {
      expect(result.current.translatedText).toBe("Hola mundo");
    }, { timeout: 1000 });

    rerender({ text: "" });

    await waitFor(() => {
      expect(result.current.translatedText).toBe("");
      expect(result.current.detectedLang).toBe("");
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  test("ignores abort errors", async () => {
    global.fetch = mock(() => {
      const error = new Error("The operation was aborted");
      error.name = "AbortError";
      return Promise.reject(error);
    }) as unknown as typeof fetch;

    const { result } = renderHook(() => useTranslate("Hello", "EN", "ES"));

    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(result.current.error).toBe(null);
    expect(result.current.isLoading).toBe(false);
  });

  test("updates translation when target language changes", async () => {
    const { result, rerender } = renderHook(
      ({ targetLang }) => useTranslate("Hello", "EN", targetLang),
      { initialProps: { targetLang: "ES" } }
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    }, { timeout: 1000 });

    fetchMock.mockClear();

    global.fetch = mock(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        translatedText: "Bonjour",
        detectedSourceLang: "EN",
      }),
    } as Response)) as unknown as typeof fetch;

    rerender({ targetLang: "FR" });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    }, { timeout: 1000 });
  });
});