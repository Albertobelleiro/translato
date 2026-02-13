import { test, expect, describe, mock } from "bun:test";
import { render, screen, fireEvent } from "@testing-library/react";
import { SwapButton } from "./SwapButton.tsx";

describe("SwapButton", () => {
  test("renders swap button", () => {
    const onSwap = mock(() => {});
    render(<SwapButton onSwap={onSwap} />);

    const button = screen.getByRole("button", { name: /swap languages/i });
    expect(button).toBeDefined();
  });

  test("has proper aria-label", () => {
    const onSwap = mock(() => {});
    render(<SwapButton onSwap={onSwap} />);

    const button = screen.getByLabelText("Swap languages");
    expect(button).toBeDefined();
  });

  test("calls onSwap when clicked", () => {
    const onSwap = mock(() => {});
    render(<SwapButton onSwap={onSwap} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(onSwap).toHaveBeenCalledTimes(1);
  });

  test("toggles rotation class on click", () => {
    const onSwap = mock(() => {});
    const { container } = render(<SwapButton onSwap={onSwap} />);

    const button = container.querySelector("button");
    expect(button?.className).toBe("swap-btn");

    fireEvent.click(button!);
    expect(button?.className).toContain("swap-btn-rotated");
  });

  test("toggles rotation class back on second click", () => {
    const onSwap = mock(() => {});
    const { container } = render(<SwapButton onSwap={onSwap} />);

    const button = container.querySelector("button");
    fireEvent.click(button!);
    expect(button?.className).toContain("swap-btn-rotated");

    fireEvent.click(button!);
    expect(button?.className).toBe("swap-btn");
  });

  test("alternates rotation class with multiple clicks", () => {
    const onSwap = mock(() => {});
    const { container } = render(<SwapButton onSwap={onSwap} />);

    const button = container.querySelector("button");

    fireEvent.click(button!);
    expect(button?.className).toContain("swap-btn-rotated");

    fireEvent.click(button!);
    expect(button?.className).toBe("swap-btn");

    fireEvent.click(button!);
    expect(button?.className).toContain("swap-btn-rotated");
  });

  test("is enabled by default", () => {
    const onSwap = mock(() => {});
    render(<SwapButton onSwap={onSwap} />);

    const button = screen.getByRole("button");
    expect(button.hasAttribute("disabled")).toBe(false);
  });

  test("can be disabled", () => {
    const onSwap = mock(() => {});
    render(<SwapButton onSwap={onSwap} disabled={true} />);

    const button = screen.getByRole("button");
    expect(button.getAttribute("disabled")).toBeDefined();
  });

  test("does not call onSwap when disabled", () => {
    const onSwap = mock(() => {});
    render(<SwapButton onSwap={onSwap} disabled={true} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(onSwap).not.toHaveBeenCalled();
  });

  test("does not toggle rotation when disabled", () => {
    const onSwap = mock(() => {});
    const { container } = render(<SwapButton onSwap={onSwap} disabled={true} />);

    const button = container.querySelector("button");
    const initialClass = button?.className;

    fireEvent.click(button!);

    expect(button?.className).toBe(initialClass);
  });

  test("applies correct CSS class", () => {
    const onSwap = mock(() => {});
    const { container } = render(<SwapButton onSwap={onSwap} />);

    const button = container.querySelector("button");
    expect(button?.className).toContain("swap-btn");
  });

  test("renders icon", () => {
    const onSwap = mock(() => {});
    const { container } = render(<SwapButton onSwap={onSwap} />);

    const button = container.querySelector("button");
    const svg = button?.querySelector("svg");
    expect(svg).toBeDefined();
  });

  test("handles rapid clicks", () => {
    const onSwap = mock(() => {});
    render(<SwapButton onSwap={onSwap} />);

    const button = screen.getByRole("button");

    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    expect(onSwap).toHaveBeenCalledTimes(4);
  });

  test("maintains rotation state through rapid clicks", () => {
    const onSwap = mock(() => {});
    const { container } = render(<SwapButton onSwap={onSwap} />);

    const button = container.querySelector("button");

    for (let i = 0; i < 10; i++) {
      fireEvent.click(button!);
      const shouldBeRotated = (i + 1) % 2 === 1;
      const hasRotatedClass = button?.className.includes("swap-btn-rotated");
      expect(hasRotatedClass).toBe(shouldBeRotated);
    }
  });

  test("renders as button element", () => {
    const onSwap = mock(() => {});
    const { container } = render(<SwapButton onSwap={onSwap} />);

    const button = container.querySelector("button");
    expect(button?.tagName).toBe("BUTTON");
  });

  test("disabled prop is optional", () => {
    const onSwap = mock(() => {});
    const { container } = render(<SwapButton onSwap={onSwap} />);

    const button = container.querySelector("button");
    expect(button).toBeDefined();
  });
});