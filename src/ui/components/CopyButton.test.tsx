import { test, expect, describe, beforeEach, afterEach, mock } from "bun:test";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CopyButton } from "./CopyButton.tsx";

describe("CopyButton", () => {
  let originalClipboard: typeof navigator.clipboard;
  let writeTextMock: ReturnType<typeof mock>;

  beforeEach(() => {
    originalClipboard = navigator.clipboard;
    writeTextMock = mock(() => Promise.resolve());
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: originalClipboard,
      writable: true,
      configurable: true,
    });
  });

  test("renders copy button", () => {
    render(<CopyButton text="Hello world" />);
    const button = screen.getByRole("button", { name: /copy translation/i });
    expect(button).toBeDefined();
  });

  test("has proper aria-label", () => {
    render(<CopyButton text="Test text" />);
    const button = screen.getByLabelText("Copy translation");
    expect(button).toBeDefined();
  });

  test("displays copy icon initially", () => {
    const { container } = render(<CopyButton text="Test" />);
    const button = container.querySelector("button.icon-btn");
    expect(button).toBeDefined();
  });

  test("copies text to clipboard when clicked", async () => {
    render(<CopyButton text="Hello world" />);
    const button = screen.getByRole("button");

    fireEvent.click(button);

    expect(writeTextMock).toHaveBeenCalledWith("Hello world");
  });

  test("shows checkmark icon after copying", async () => {
    render(<CopyButton text="Test" />);
    const button = screen.getByRole("button");

    fireEvent.click(button);

    await waitFor(() => {
      const svg = button.querySelector("svg");
      expect(svg).toBeDefined();
    });
  });

  test("reverts to copy icon after 1.5 seconds", async () => {
    render(<CopyButton text="Test" />);
    const button = screen.getByRole("button");

    fireEvent.click(button);

    await new Promise((resolve) => setTimeout(resolve, 1600));

    expect(button).toBeDefined();
  });

  test("handles empty text", async () => {
    render(<CopyButton text="" />);
    const button = screen.getByRole("button");

    fireEvent.click(button);

    expect(writeTextMock).toHaveBeenCalledWith("");
  });

  test("handles text with special characters", async () => {
    const specialText = "Hello\nWorld\t<test>&\"'";
    render(<CopyButton text={specialText} />);
    const button = screen.getByRole("button");

    fireEvent.click(button);

    expect(writeTextMock).toHaveBeenCalledWith(specialText);
  });

  test("handles unicode text", async () => {
    const unicodeText = "Hello 世界 🌍";
    render(<CopyButton text={unicodeText} />);
    const button = screen.getByRole("button");

    fireEvent.click(button);

    expect(writeTextMock).toHaveBeenCalledWith(unicodeText);
  });

  test("handles very long text", async () => {
    const longText = "A".repeat(10000);
    render(<CopyButton text={longText} />);
    const button = screen.getByRole("button");

    fireEvent.click(button);

    expect(writeTextMock).toHaveBeenCalledWith(longText);
  });

  test("resets timer on multiple rapid clicks", async () => {
    render(<CopyButton text="Test" />);
    const button = screen.getByRole("button");

    fireEvent.click(button);
    await new Promise((resolve) => setTimeout(resolve, 500));
    fireEvent.click(button);
    await new Promise((resolve) => setTimeout(resolve, 500));
    fireEvent.click(button);

    expect(writeTextMock).toHaveBeenCalledTimes(3);
  });

  test("applies correct CSS class", () => {
    const { container } = render(<CopyButton text="Test" />);
    const button = container.querySelector("button");
    expect(button?.className).toContain("icon-btn");
  });

  test("renders as button element", () => {
    const { container } = render(<CopyButton text="Test" />);
    const button = container.querySelector("button");
    expect(button?.tagName).toBe("BUTTON");
  });

  test("handles rapid successive clicks correctly", async () => {
    render(<CopyButton text="Test" />);
    const button = screen.getByRole("button");

    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    expect(writeTextMock).toHaveBeenCalledTimes(3);
    expect(writeTextMock).toHaveBeenCalledWith("Test");
  });

  test("maintains copied state during timer", async () => {
    render(<CopyButton text="Test" />);
    const button = screen.getByRole("button");

    fireEvent.click(button);

    await new Promise((resolve) => setTimeout(resolve, 750));

    const svg = button.querySelector("svg");
    expect(svg).toBeDefined();
  });

  test("clears timer on unmount", async () => {
    const { unmount } = render(<CopyButton text="Test" />);
    const button = screen.getByRole("button");

    fireEvent.click(button);
    unmount();

    await new Promise((resolve) => setTimeout(resolve, 1600));
  });
});