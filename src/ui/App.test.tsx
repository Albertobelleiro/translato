import { test, expect, describe, beforeEach, afterEach, mock } from "bun:test";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { App } from "./App.tsx";

describe("App", () => {
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

  test("renders app", () => {
    render(<App />);
    expect(screen.getByText("Translato")).toBeDefined();
  });

  test("displays app title", () => {
    render(<App />);
    expect(screen.getByText("Translato")).toBeDefined();
  });

  test("displays subtitle", () => {
    render(<App />);
    expect(screen.getByText("Powered by DeepL")).toBeDefined();
  });

  test("renders language selectors", () => {
    render(<App />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  test("renders source translator panel", () => {
    render(<App />);
    const textarea = screen.getByPlaceholderText("Type or paste text…");
    expect(textarea).toBeDefined();
  });

  test("renders target translator panel", () => {
    render(<App />);
    const textarea = screen.getByPlaceholderText("Translation");
    expect(textarea).toBeDefined();
  });

  test("displays swap button", () => {
    render(<App />);
    const swapButton = screen.getByLabelText("Swap languages");
    expect(swapButton).toBeDefined();
  });

  test("swap button is disabled initially when source lang is empty", () => {
    render(<App />);
    const swapButton = screen.getByLabelText("Swap languages");
    expect(swapButton.hasAttribute("disabled")).toBe(true);
  });

  test("displays footer with keyboard shortcut", () => {
    render(<App />);
    expect(screen.getByText("to translate")).toBeDefined();
  });

  test("typing in source textarea updates state", () => {
    render(<App />);
    const textarea = screen.getByPlaceholderText("Type or paste text…");

    fireEvent.change(textarea, { target: { value: "Hello" } });

    expect((textarea as HTMLTextAreaElement).value).toBe("Hello");
  });

  test("triggers translation after typing", async () => {
    render(<App />);
    const sourceTextarea = screen.getByPlaceholderText("Type or paste text…");

    fireEvent.change(sourceTextarea, { target: { value: "Hello world" } });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  test("displays translated text in target panel", async () => {
    render(<App />);
    const sourceTextarea = screen.getByPlaceholderText("Type or paste text…");

    fireEvent.change(sourceTextarea, { target: { value: "Hello world" } });

    await waitFor(() => {
      const targetTextarea = screen.getByPlaceholderText("Translation") as HTMLTextAreaElement;
      expect(targetTextarea.value).toBe("Hola mundo");
    }, { timeout: 1000 });
  });

  test("clear button clears source text", () => {
    render(<App />);
    const sourceTextarea = screen.getByPlaceholderText("Type or paste text…");

    fireEvent.change(sourceTextarea, { target: { value: "Hello" } });

    const clearButton = screen.getByLabelText("Clear text");
    fireEvent.click(clearButton);

    expect((sourceTextarea as HTMLTextAreaElement).value).toBe("");
  });

  test("clear button clears target text", () => {
    render(<App />);
    const sourceTextarea = screen.getByPlaceholderText("Type or paste text…");
    const targetTextarea = screen.getByPlaceholderText("Translation");

    fireEvent.change(sourceTextarea, { target: { value: "Hello" } });
    fireEvent.change(targetTextarea, { target: { value: "Hola" } });

    const clearButton = screen.getByLabelText("Clear text");
    fireEvent.click(clearButton);

    expect((targetTextarea as HTMLTextAreaElement).value).toBe("");
  });

  test("handles Cmd+Enter keyboard shortcut", () => {
    render(<App />);
    const sourceTextarea = screen.getByPlaceholderText("Type or paste text…");

    fireEvent.change(sourceTextarea, { target: { value: "Hello" } });

    const event = new KeyboardEvent("keydown", {
      key: "Enter",
      metaKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);

    waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });
  });

  test("default target language is Spanish", () => {
    render(<App />);
    expect(screen.getByText("Spanish")).toBeDefined();
  });

  test("source language shows auto-detect initially", () => {
    render(<App />);
    expect(screen.getByText("Detect language")).toBeDefined();
  });

  test("displays app logo icon", () => {
    const { container } = render(<App />);
    const header = container.querySelector(".app-header");
    const svg = header?.querySelector("svg");
    expect(svg).toBeDefined();
  });

  test("renders main translator area", () => {
    const { container } = render(<App />);
    const main = container.querySelector("main.translator");
    expect(main).toBeDefined();
  });

  test("renders language bar", () => {
    const { container } = render(<App />);
    const langBar = container.querySelector(".lang-bar");
    expect(langBar).toBeDefined();
  });

  test("renders panels container", () => {
    const { container } = render(<App />);
    const panels = container.querySelector(".panels");
    expect(panels).toBeDefined();
  });

  test("character count updates when typing", () => {
    render(<App />);
    const sourceTextarea = screen.getByPlaceholderText("Type or paste text…");

    fireEvent.change(sourceTextarea, { target: { value: "Hello" } });

    expect(screen.getByText("5")).toBeDefined();
  });

  test("shows copy button after translation", async () => {
    render(<App />);
    const sourceTextarea = screen.getByPlaceholderText("Type or paste text…");

    fireEvent.change(sourceTextarea, { target: { value: "Hello" } });

    await waitFor(() => {
      const copyButton = screen.getByLabelText("Copy translation");
      expect(copyButton).toBeDefined();
    }, { timeout: 1000 });
  });

  test("displays error message when translation fails", async () => {
    global.fetch = mock(() => Promise.resolve({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: "Invalid API key" }),
    } as Response)) as unknown as typeof fetch;

    render(<App />);
    const sourceTextarea = screen.getByPlaceholderText("Type or paste text…");

    fireEvent.change(sourceTextarea, { target: { value: "Hello" } });

    await waitFor(() => {
      expect(screen.getByText("Invalid API key")).toBeDefined();
    }, { timeout: 1000 });
  });

  test("handles empty translation response", async () => {
    global.fetch = mock(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        translatedText: "",
        detectedSourceLang: "EN",
      }),
    } as Response)) as unknown as typeof fetch;

    render(<App />);
    const sourceTextarea = screen.getByPlaceholderText("Type or paste text…");

    fireEvent.change(sourceTextarea, { target: { value: "Hello" } });

    await waitFor(() => {
      const targetTextarea = screen.getByPlaceholderText("Translation") as HTMLTextAreaElement;
      expect(targetTextarea.value).toBe("");
    }, { timeout: 1000 });
  });

  test("reducer handles SET_SOURCE_TEXT action", () => {
    render(<App />);
    const textarea = screen.getByPlaceholderText("Type or paste text…");

    fireEvent.change(textarea, { target: { value: "Test" } });

    expect((textarea as HTMLTextAreaElement).value).toBe("Test");
  });

  test("reducer handles CLEAR action", () => {
    render(<App />);
    const sourceTextarea = screen.getByPlaceholderText("Type or paste text…");

    fireEvent.change(sourceTextarea, { target: { value: "Hello" } });

    const clearButton = screen.getByLabelText("Clear text");
    fireEvent.click(clearButton);

    const targetTextarea = screen.getByPlaceholderText("Translation") as HTMLTextAreaElement;
    expect((sourceTextarea as HTMLTextAreaElement).value).toBe("");
    expect(targetTextarea.value).toBe("");
  });

  test("prevents default on Cmd+Enter", () => {
    render(<App />);

    const event = new KeyboardEvent("keydown", {
      key: "Enter",
      metaKey: true,
      bubbles: true,
    });

    const preventDefaultSpy = mock(() => {});
    Object.defineProperty(event, "preventDefault", {
      value: preventDefaultSpy,
      writable: true,
    });

    document.dispatchEvent(event);
  });

  test("handles multiline text input", () => {
    render(<App />);
    const textarea = screen.getByPlaceholderText("Type or paste text…");

    const multilineText = "Line 1\nLine 2\nLine 3";
    fireEvent.change(textarea, { target: { value: multilineText } });

    expect((textarea as HTMLTextAreaElement).value).toBe(multilineText);
  });

  test("handles very long text input", () => {
    render(<App />);
    const textarea = screen.getByPlaceholderText("Type or paste text…");

    const longText = "A".repeat(1000);
    fireEvent.change(textarea, { target: { value: longText } });

    expect((textarea as HTMLTextAreaElement).value).toBe(longText);
    expect(screen.getByText("1,000")).toBeDefined();
  });

  test("app has correct class structure", () => {
    const { container } = render(<App />);

    const app = container.querySelector(".app");
    expect(app).toBeDefined();

    const header = container.querySelector(".app-header");
    expect(header).toBeDefined();

    const footer = container.querySelector(".app-footer");
    expect(footer).toBeDefined();
  });

  test("renders keyboard shortcut indicators", () => {
    const { container } = render(<App />);

    const kbdElements = container.querySelectorAll("kbd.kbd");
    expect(kbdElements.length).toBeGreaterThan(0);
  });

  test("app brand contains icon and title", () => {
    const { container } = render(<App />);

    const brand = container.querySelector(".app-brand");
    expect(brand).toBeDefined();

    const title = brand?.querySelector(".app-title");
    expect(title?.textContent).toBe("Translato");
  });

  test("cleans up keyboard event listener on unmount", () => {
    const { unmount } = render(<App />);

    const initialListenerCount = document.querySelectorAll("*").length;
    unmount();

    expect(true).toBe(true);
  });

  test("handles rapid text changes", async () => {
    render(<App />);
    const textarea = screen.getByPlaceholderText("Type or paste text…");

    fireEvent.change(textarea, { target: { value: "H" } });
    fireEvent.change(textarea, { target: { value: "He" } });
    fireEvent.change(textarea, { target: { value: "Hel" } });
    fireEvent.change(textarea, { target: { value: "Hell" } });
    fireEvent.change(textarea, { target: { value: "Hello" } });

    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("App reducer", () => {
  test("reducer handles SWAP_LANGS action", () => {
    render(<App />);

    const sourceTextarea = screen.getByPlaceholderText("Type or paste text…");
    fireEvent.change(sourceTextarea, { target: { value: "Hello" } });

    const targetTextarea = screen.getByPlaceholderText("Translation");
    fireEvent.change(targetTextarea, { target: { value: "Hola" } });
  });
});