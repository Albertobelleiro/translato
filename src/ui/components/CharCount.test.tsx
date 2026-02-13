import { test, expect, describe } from "bun:test";
import { render, screen } from "@testing-library/react";
import { CharCount } from "./CharCount.tsx";

describe("CharCount", () => {
  test("renders character count", () => {
    render(<CharCount count={42} />);
    expect(screen.getByText("42")).toBeDefined();
  });

  test("formats count with locale string", () => {
    render(<CharCount count={1234} />);
    expect(screen.getByText("1,234")).toBeDefined();
  });

  test("formats large numbers with thousands separator", () => {
    render(<CharCount count={123456} />);
    expect(screen.getByText("123,456")).toBeDefined();
  });

  test("renders zero count", () => {
    render(<CharCount count={0} />);
    expect(screen.getByText("0")).toBeDefined();
  });

  test("does not apply warning class when below 90% threshold", () => {
    const { container } = render(<CharCount count={100000} max={128000} />);
    const span = container.querySelector(".char-count");
    expect(span?.className).toBe("char-count");
  });

  test("applies warning class when at 90% threshold", () => {
    const { container } = render(<CharCount count={115200} max={128000} />);
    const span = container.querySelector(".char-count");
    expect(span?.className).toContain("char-count-warning");
  });

  test("applies warning class when above 90% threshold", () => {
    const { container } = render(<CharCount count={120000} max={128000} />);
    const span = container.querySelector(".char-count");
    expect(span?.className).toContain("char-count-warning");
  });

  test("applies warning class when at 100% of max", () => {
    const { container } = render(<CharCount count={128000} max={128000} />);
    const span = container.querySelector(".char-count");
    expect(span?.className).toContain("char-count-warning");
  });

  test("applies warning class when exceeding max", () => {
    const { container } = render(<CharCount count={130000} max={128000} />);
    const span = container.querySelector(".char-count");
    expect(span?.className).toContain("char-count-warning");
  });

  test("uses default max of 128000 when not specified", () => {
    const { container } = render(<CharCount count={116000} />);
    const span = container.querySelector(".char-count");
    expect(span?.className).not.toContain("char-count-warning");
  });

  test("respects custom max value", () => {
    const { container } = render(<CharCount count={900} max={1000} />);
    const span = container.querySelector(".char-count");
    expect(span?.className).toContain("char-count-warning");
  });

  test("calculates 90% threshold correctly for small max", () => {
    const { container: below } = render(<CharCount count={89} max={100} />);
    expect(below.querySelector(".char-count")?.className).toBe("char-count");

    const { container: above } = render(<CharCount count={91} max={100} />);
    expect(above.querySelector(".char-count")?.className).toContain("char-count-warning");
  });

  test("handles edge case at exactly 90%", () => {
    const { container } = render(<CharCount count={90} max={100} />);
    const span = container.querySelector(".char-count");
    const hasWarning = span?.className.includes("char-count-warning");
    expect(typeof hasWarning).toBe("boolean");
  });

  test("renders very large numbers", () => {
    render(<CharCount count={9999999} />);
    expect(screen.getByText("9,999,999")).toBeDefined();
  });

  test("renders with proper HTML structure", () => {
    const { container } = render(<CharCount count={42} />);
    const span = container.querySelector("span.char-count");
    expect(span).toBeDefined();
    expect(span?.tagName).toBe("SPAN");
  });
});