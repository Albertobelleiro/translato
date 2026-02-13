import { test, expect, describe, mock } from "bun:test";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LanguageSelector } from "./LanguageSelector.tsx";
import { languages, sourceLangs } from "../../translator/languages.ts";

describe("LanguageSelector", () => {
  test("renders language selector button", () => {
    const onChange = mock(() => {});
    render(<LanguageSelector value="ES" onChange={onChange} languages={languages} />);

    const button = screen.getByRole("button");
    expect(button).toBeDefined();
  });

  test("displays selected language name", () => {
    const onChange = mock(() => {});
    render(<LanguageSelector value="ES" onChange={onChange} languages={languages} />);

    expect(screen.getByText("Spanish")).toBeDefined();
  });

  test("displays different language name when value changes", () => {
    const onChange = mock(() => {});
    const { rerender } = render(<LanguageSelector value="FR" onChange={onChange} languages={languages} />);

    expect(screen.getByText("French")).toBeDefined();

    rerender(<LanguageSelector value="DE" onChange={onChange} languages={languages} />);
    expect(screen.getByText("German")).toBeDefined();
  });

  test("shows 'Detect language' when value is empty and showAutoDetect is true", () => {
    const onChange = mock(() => {});
    render(<LanguageSelector value="" onChange={onChange} languages={sourceLangs} showAutoDetect={true} />);

    expect(screen.getByText("Detect language")).toBeDefined();
  });

  test("opens dropdown when clicked", () => {
    const onChange = mock(() => {});
    render(<LanguageSelector value="ES" onChange={onChange} languages={languages} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    const searchInput = screen.getByPlaceholderText("Search…");
    expect(searchInput).toBeDefined();
  });

  test("displays search input when dropdown is open", () => {
    const onChange = mock(() => {});
    render(<LanguageSelector value="ES" onChange={onChange} languages={languages} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    const searchInput = screen.getByPlaceholderText("Search…");
    expect(searchInput).toBeDefined();
  });

  test("displays all languages in dropdown", () => {
    const onChange = mock(() => {});
    render(<LanguageSelector value="ES" onChange={onChange} languages={languages} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(screen.getByText("French")).toBeDefined();
    expect(screen.getByText("German")).toBeDefined();
    expect(screen.getByText("Japanese")).toBeDefined();
  });

  test("filters languages by name", () => {
    const onChange = mock(() => {});
    render(<LanguageSelector value="ES" onChange={onChange} languages={languages} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    const searchInput = screen.getByPlaceholderText("Search…");
    fireEvent.change(searchInput, { target: { value: "French" } });

    expect(screen.getByText("French")).toBeDefined();
    expect(screen.queryByText("German")).toBeNull();
  });

  test("filters languages by code", () => {
    const onChange = mock(() => {});
    render(<LanguageSelector value="ES" onChange={onChange} languages={languages} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    const searchInput = screen.getByPlaceholderText("Search…");
    fireEvent.change(searchInput, { target: { value: "FR" } });

    expect(screen.getByText("French")).toBeDefined();
  });

  test("search is case insensitive", () => {
    const onChange = mock(() => {});
    render(<LanguageSelector value="ES" onChange={onChange} languages={languages} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    const searchInput = screen.getByPlaceholderText("Search…");
    fireEvent.change(searchInput, { target: { value: "french" } });

    expect(screen.getByText("French")).toBeDefined();
  });

  test("calls onChange when language is selected", () => {
    const onChange = mock(() => {});
    render(<LanguageSelector value="ES" onChange={onChange} languages={languages} />);

    const triggerButton = screen.getByRole("button");
    fireEvent.click(triggerButton);

    const frenchOption = screen.getByText("French").closest("button");
    fireEvent.click(frenchOption!);

    expect(onChange).toHaveBeenCalledWith("FR");
  });

  test("closes dropdown after selection", () => {
    const onChange = mock(() => {});
    render(<LanguageSelector value="ES" onChange={onChange} languages={languages} />);

    const triggerButton = screen.getByRole("button");
    fireEvent.click(triggerButton);

    const frenchOption = screen.getByText("French").closest("button");
    fireEvent.click(frenchOption!);

    expect(screen.queryByPlaceholderText("Search…")).toBeNull();
  });

  test("clears search when dropdown closes", () => {
    const onChange = mock(() => {});
    render(<LanguageSelector value="ES" onChange={onChange} languages={languages} />);

    const triggerButton = screen.getByRole("button");
    fireEvent.click(triggerButton);

    const searchInput = screen.getByPlaceholderText("Search…");
    fireEvent.change(searchInput, { target: { value: "French" } });

    const frenchOption = screen.getByText("French").closest("button");
    fireEvent.click(frenchOption!);

    fireEvent.click(triggerButton);
    const newSearchInput = screen.getByPlaceholderText("Search…") as HTMLInputElement;
    expect(newSearchInput.value).toBe("");
  });

  test("closes dropdown on escape key", () => {
    const onChange = mock(() => {});
    render(<LanguageSelector value="ES" onChange={onChange} languages={languages} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(screen.getByPlaceholderText("Search…")).toBeDefined();

    fireEvent.keyDown(document, { key: "Escape" });

    waitFor(() => {
      expect(screen.queryByPlaceholderText("Search…")).toBeNull();
    });
  });

  test("closes dropdown when clicking outside", () => {
    const onChange = mock(() => {});
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <LanguageSelector value="ES" onChange={onChange} languages={languages} />
      </div>
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(screen.getByPlaceholderText("Search…")).toBeDefined();

    const outside = screen.getByTestId("outside");
    fireEvent.mouseDown(outside);

    waitFor(() => {
      expect(screen.queryByPlaceholderText("Search…")).toBeNull();
    });
  });

  test("focuses search input when dropdown opens", async () => {
    const onChange = mock(() => {});
    render(<LanguageSelector value="ES" onChange={onChange} languages={languages} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText("Search…");
      expect(document.activeElement).toBe(searchInput);
    });
  });

  test("displays auto-detect option when showAutoDetect is true", () => {
    const onChange = mock(() => {});
    render(<LanguageSelector value="EN" onChange={onChange} languages={sourceLangs} showAutoDetect={true} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    const autoDetectOptions = screen.getAllByText("Detect language");
    expect(autoDetectOptions.length).toBeGreaterThan(0);
  });

  test("does not display auto-detect option when showAutoDetect is false", () => {
    const onChange = mock(() => {});
    render(<LanguageSelector value="ES" onChange={onChange} languages={languages} showAutoDetect={false} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    const autoDetectOptions = screen.queryAllByText("Detect language");
    expect(autoDetectOptions.length).toBe(0);
  });

  test("calls onChange with empty string when auto-detect is selected", () => {
    const onChange = mock(() => {});
    render(<LanguageSelector value="EN" onChange={onChange} languages={sourceLangs} showAutoDetect={true} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    const autoDetectOption = screen.getAllByText("Detect language")[1]?.closest("button");
    fireEvent.click(autoDetectOption!);

    expect(onChange).toHaveBeenCalledWith("");
  });

  test("highlights currently selected language", () => {
    const onChange = mock(() => {});
    const { container } = render(<LanguageSelector value="ES" onChange={onChange} languages={languages} />);

    const button = container.querySelector("button");
    fireEvent.click(button!);

    const spanishOption = screen.getByText("Spanish").closest("button");
    expect(spanishOption?.className).toContain("lang-option-active");
  });

  test("displays language code in option", () => {
    const onChange = mock(() => {});
    render(<LanguageSelector value="ES" onChange={onChange} languages={languages} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(screen.getByText("FR")).toBeDefined();
    expect(screen.getByText("DE")).toBeDefined();
  });

  test("handles empty languages array", () => {
    const onChange = mock(() => {});
    render(<LanguageSelector value="" onChange={onChange} languages={[]} />);

    const button = screen.getByRole("button");
    expect(button).toBeDefined();
  });

  test("displays value as fallback when language not found", () => {
    const onChange = mock(() => {});
    render(<LanguageSelector value="INVALID" onChange={onChange} languages={languages} />);

    expect(screen.getByText("INVALID")).toBeDefined();
  });

  test("toggles dropdown open and closed", () => {
    const onChange = mock(() => {});
    render(<LanguageSelector value="ES" onChange={onChange} languages={languages} />);

    const button = screen.getByRole("button");

    fireEvent.click(button);
    expect(screen.getByPlaceholderText("Search…")).toBeDefined();

    fireEvent.click(button);
    expect(screen.queryByPlaceholderText("Search…")).toBeNull();
  });

  test("handles partial search matches", () => {
    const onChange = mock(() => {});
    render(<LanguageSelector value="ES" onChange={onChange} languages={languages} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    const searchInput = screen.getByPlaceholderText("Search…");
    fireEvent.change(searchInput, { target: { value: "Span" } });

    expect(screen.getByText("Spanish")).toBeDefined();
  });
});