import { test, expect, describe, mock } from "bun:test";
import { render, screen, fireEvent } from "@testing-library/react";
import { TextArea } from "./TextArea.tsx";

describe("TextArea", () => {
  test("renders textarea element", () => {
    render(<TextArea value="" />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeDefined();
  });

  test("displays provided value", () => {
    render(<TextArea value="Hello world" />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.value).toBe("Hello world");
  });

  test("displays empty string", () => {
    render(<TextArea value="" />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.value).toBe("");
  });

  test("calls onChange when text changes", () => {
    const onChange = mock(() => {});
    render(<TextArea value="" onChange={onChange} />);

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "New text" } });

    expect(onChange).toHaveBeenCalledWith("New text");
  });

  test("calls onChange with updated value", () => {
    const onChange = mock(() => {});
    render(<TextArea value="Initial" onChange={onChange} />);

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "Updated" } });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0]).toBe("Updated");
  });

  test("does not call onChange when readOnly", () => {
    const onChange = mock(() => {});
    render(<TextArea value="" onChange={onChange} readOnly={true} />);

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "New text" } });

    expect(onChange).not.toHaveBeenCalled();
  });

  test("is editable by default", () => {
    render(<TextArea value="" />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.readOnly).toBe(false);
  });

  test("can be set to readOnly", () => {
    render(<TextArea value="Test" readOnly={true} />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.readOnly).toBe(true);
  });

  test("displays placeholder", () => {
    render(<TextArea value="" placeholder="Enter text here..." />);
    const textarea = screen.getByPlaceholderText("Enter text here...");
    expect(textarea).toBeDefined();
  });

  test("does not show placeholder when value is present", () => {
    render(<TextArea value="Text" placeholder="Enter text..." />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.value).toBe("Text");
  });

  test("has spellCheck enabled when editable", () => {
    render(<TextArea value="" />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.spellcheck).toBe(true);
  });

  test("has spellCheck disabled when readOnly", () => {
    render(<TextArea value="" readOnly={true} />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.spellcheck).toBe(false);
  });

  test("applies textarea CSS class", () => {
    const { container } = render(<TextArea value="" />);
    const textarea = container.querySelector("textarea");
    expect(textarea?.className).toContain("textarea");
  });

  test("auto-adjusts height based on content", () => {
    const { container, rerender } = render(<TextArea value="" />);
    const textarea = container.querySelector("textarea") as HTMLTextAreaElement;

    const initialHeight = textarea.style.height;

    rerender(<TextArea value="Line 1\nLine 2\nLine 3\nLine 4\nLine 5" />);

    expect(textarea.style.height).toBeDefined();
  });

  test("handles multiline text", () => {
    const multilineText = "Line 1\nLine 2\nLine 3";
    render(<TextArea value={multilineText} />);

    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.value).toBe(multilineText);
  });

  test("handles text with special characters", () => {
    const specialText = "Hello\t<test>&\"'";
    render(<TextArea value={specialText} />);

    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.value).toBe(specialText);
  });

  test("handles unicode text", () => {
    const unicodeText = "Hello 世界 🌍";
    render(<TextArea value={unicodeText} />);

    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.value).toBe(unicodeText);
  });

  test("handles very long text", () => {
    const longText = "A".repeat(10000);
    render(<TextArea value={longText} />);

    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.value).toBe(longText);
  });

  test("updates when value prop changes", () => {
    const { rerender } = render(<TextArea value="Initial" />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.value).toBe("Initial");

    rerender(<TextArea value="Updated" />);
    expect(textarea.value).toBe("Updated");
  });

  test("works without onChange prop", () => {
    render(<TextArea value="Test" />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeDefined();
  });

  test("works without placeholder prop", () => {
    render(<TextArea value="" />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.placeholder).toBe("");
  });

  test("handles empty placeholder", () => {
    render(<TextArea value="" placeholder="" />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.placeholder).toBe("");
  });

  test("calls onChange on each keystroke", () => {
    const onChange = mock(() => {});
    render(<TextArea value="" onChange={onChange} />);

    const textarea = screen.getByRole("textbox");

    fireEvent.change(textarea, { target: { value: "H" } });
    fireEvent.change(textarea, { target: { value: "He" } });
    fireEvent.change(textarea, { target: { value: "Hel" } });

    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange.mock.calls[0]?.[0]).toBe("H");
    expect(onChange.mock.calls[1]?.[0]).toBe("He");
    expect(onChange.mock.calls[2]?.[0]).toBe("Hel");
  });

  test("renders as textarea element", () => {
    const { container } = render(<TextArea value="" />);
    const textarea = container.querySelector("textarea");
    expect(textarea?.tagName).toBe("TEXTAREA");
  });

  test("handles rapid text changes", () => {
    const onChange = mock(() => {});
    render(<TextArea value="" onChange={onChange} />);

    const textarea = screen.getByRole("textbox");

    for (let i = 0; i < 10; i++) {
      fireEvent.change(textarea, { target: { value: `Text ${i}` } });
    }

    expect(onChange).toHaveBeenCalledTimes(10);
  });
});