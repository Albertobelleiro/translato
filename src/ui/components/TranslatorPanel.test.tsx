import { test, expect, describe, mock } from "bun:test";
import { render, screen, fireEvent } from "@testing-library/react";
import { TranslatorPanel } from "./TranslatorPanel.tsx";

describe("TranslatorPanel", () => {
  test("renders source panel", () => {
    const onTextChange = mock(() => {});
    render(<TranslatorPanel mode="source" text="" onTextChange={onTextChange} />);

    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeDefined();
  });

  test("renders target panel", () => {
    render(<TranslatorPanel mode="target" text="" />);

    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeDefined();
  });

  test("source panel has editable textarea", () => {
    const onTextChange = mock(() => {});
    render(<TranslatorPanel mode="source" text="" onTextChange={onTextChange} />);

    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.readOnly).toBe(false);
  });

  test("target panel has readonly textarea", () => {
    render(<TranslatorPanel mode="target" text="" />);

    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.readOnly).toBe(true);
  });

  test("source panel shows 'Type or paste text…' placeholder", () => {
    const onTextChange = mock(() => {});
    render(<TranslatorPanel mode="source" text="" onTextChange={onTextChange} />);

    const textarea = screen.getByPlaceholderText("Type or paste text…");
    expect(textarea).toBeDefined();
  });

  test("target panel shows 'Translation' placeholder", () => {
    render(<TranslatorPanel mode="target" text="" />);

    const textarea = screen.getByPlaceholderText("Translation");
    expect(textarea).toBeDefined();
  });

  test("displays provided text in source panel", () => {
    const onTextChange = mock(() => {});
    render(<TranslatorPanel mode="source" text="Hello world" onTextChange={onTextChange} />);

    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.value).toBe("Hello world");
  });

  test("displays provided text in target panel", () => {
    render(<TranslatorPanel mode="target" text="Hola mundo" />);

    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.value).toBe("Hola mundo");
  });

  test("calls onTextChange when source text changes", () => {
    const onTextChange = mock(() => {});
    render(<TranslatorPanel mode="source" text="" onTextChange={onTextChange} />);

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "New text" } });

    expect(onTextChange).toHaveBeenCalledWith("New text");
  });

  test("shows character count in source panel", () => {
    const onTextChange = mock(() => {});
    render(<TranslatorPanel mode="source" text="Hello" onTextChange={onTextChange} />);

    expect(screen.getByText("5")).toBeDefined();
  });

  test("updates character count when text changes", () => {
    const onTextChange = mock(() => {});
    const { rerender } = render(<TranslatorPanel mode="source" text="Hi" onTextChange={onTextChange} />);

    expect(screen.getByText("2")).toBeDefined();

    rerender(<TranslatorPanel mode="source" text="Hello world" onTextChange={onTextChange} />);
    expect(screen.getByText("11")).toBeDefined();
  });

  test("shows clear button in source panel when text is not empty", () => {
    const onTextChange = mock(() => {});
    const onClear = mock(() => {});
    render(<TranslatorPanel mode="source" text="Hello" onTextChange={onTextChange} onClear={onClear} />);

    const clearButton = screen.getByLabelText("Clear text");
    expect(clearButton).toBeDefined();
  });

  test("does not show clear button in source panel when text is empty", () => {
    const onTextChange = mock(() => {});
    const onClear = mock(() => {});
    render(<TranslatorPanel mode="source" text="" onTextChange={onTextChange} onClear={onClear} />);

    const clearButton = screen.queryByLabelText("Clear text");
    expect(clearButton).toBeNull();
  });

  test("calls onClear when clear button is clicked", () => {
    const onTextChange = mock(() => {});
    const onClear = mock(() => {});
    render(<TranslatorPanel mode="source" text="Hello" onTextChange={onTextChange} onClear={onClear} />);

    const clearButton = screen.getByLabelText("Clear text");
    fireEvent.click(clearButton);

    expect(onClear).toHaveBeenCalledTimes(1);
  });

  test("shows copy button in target panel when text is not empty", () => {
    render(<TranslatorPanel mode="target" text="Hola" />);

    const copyButton = screen.getByLabelText("Copy translation");
    expect(copyButton).toBeDefined();
  });

  test("does not show copy button in target panel when text is empty", () => {
    render(<TranslatorPanel mode="target" text="" />);

    const copyButton = screen.queryByLabelText("Copy translation");
    expect(copyButton).toBeNull();
  });

  test("applies loading class when isLoading is true in target panel", () => {
    const { container } = render(<TranslatorPanel mode="target" text="" isLoading={true} />);

    const panel = container.querySelector(".panel");
    expect(panel?.className).toContain("panel-loading");
  });

  test("does not apply loading class when isLoading is false", () => {
    const { container } = render(<TranslatorPanel mode="target" text="" isLoading={false} />);

    const panel = container.querySelector(".panel");
    expect(panel?.className).toBe("panel");
  });

  test("does not apply loading class to source panel", () => {
    const onTextChange = mock(() => {});
    const { container } = render(<TranslatorPanel mode="source" text="" onTextChange={onTextChange} isLoading={true} />);

    const panel = container.querySelector(".panel");
    expect(panel?.className).toBe("panel");
  });

  test("displays error message in target panel", () => {
    render(<TranslatorPanel mode="target" text="" error="API key invalid" />);

    expect(screen.getByText("API key invalid")).toBeDefined();
  });

  test("does not display error message when error is null", () => {
    const { container } = render(<TranslatorPanel mode="target" text="" error={null} />);

    const errorText = container.querySelector(".error-text");
    expect(errorText).toBeNull();
  });

  test("does not display error message in source panel", () => {
    const onTextChange = mock(() => {});
    const { container } = render(<TranslatorPanel mode="source" text="" onTextChange={onTextChange} error="Error" />);

    const errorText = container.querySelector(".error-text");
    expect(errorText).toBeNull();
  });

  test("renders panel footer", () => {
    const onTextChange = mock(() => {});
    const { container } = render(<TranslatorPanel mode="source" text="" onTextChange={onTextChange} />);

    const footer = container.querySelector(".panel-footer");
    expect(footer).toBeDefined();
  });

  test("handles multiline text", () => {
    const onTextChange = mock(() => {});
    const multilineText = "Line 1\nLine 2\nLine 3";
    render(<TranslatorPanel mode="source" text={multilineText} onTextChange={onTextChange} />);

    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.value).toBe(multilineText);
  });

  test("character count includes all characters", () => {
    const onTextChange = mock(() => {});
    render(<TranslatorPanel mode="source" text="Hello\nWorld!" onTextChange={onTextChange} />);

    expect(screen.getByText("12")).toBeDefined();
  });

  test("handles unicode characters in count", () => {
    const onTextChange = mock(() => {});
    render(<TranslatorPanel mode="source" text="Hello 🌍" onTextChange={onTextChange} />);

    const count = screen.getByText(/\d+/);
    expect(count).toBeDefined();
  });

  test("handles very long text", () => {
    const onTextChange = mock(() => {});
    const longText = "A".repeat(10000);
    render(<TranslatorPanel mode="source" text={longText} onTextChange={onTextChange} />);

    expect(screen.getByText("10,000")).toBeDefined();
  });

  test("source panel applies correct CSS class", () => {
    const onTextChange = mock(() => {});
    const { container } = render(<TranslatorPanel mode="source" text="" onTextChange={onTextChange} />);

    const panel = container.querySelector(".panel");
    expect(panel).toBeDefined();
  });

  test("target panel applies correct CSS class", () => {
    const { container } = render(<TranslatorPanel mode="target" text="" />);

    const panel = container.querySelector(".panel");
    expect(panel).toBeDefined();
  });

  test("displays both error and loading state", () => {
    const { container } = render(<TranslatorPanel mode="target" text="" isLoading={true} error="Network error" />);

    expect(screen.getByText("Network error")).toBeDefined();
    const panel = container.querySelector(".panel");
    expect(panel?.className).toContain("panel-loading");
  });

  test("works without onClear prop in source panel", () => {
    const onTextChange = mock(() => {});
    render(<TranslatorPanel mode="source" text="Hello" onTextChange={onTextChange} />);

    const clearButton = screen.queryByLabelText("Clear text");
    expect(clearButton).toBeNull();
  });

  test("target panel footer has empty span", () => {
    const { container } = render(<TranslatorPanel mode="target" text="" />);

    const footer = container.querySelector(".panel-footer");
    const spans = footer?.querySelectorAll("span");
    expect(spans?.length).toBeGreaterThan(0);
  });
});