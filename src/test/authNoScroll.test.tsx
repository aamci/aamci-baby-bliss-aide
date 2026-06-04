import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";

// We can't truly measure layout in jsdom (no real viewport sizes), but we
// CAN guarantee at the DOM level that the outer container is locked to a
// single visual viewport (`h-[100dvh]` + `overflow-hidden`) so that the
// browser cannot scroll the page on ANY device size. This is the structural
// contract we want to keep — the visual side is covered by manual QA.

const SIZES: Array<[number, number, string]> = [
  [320, 568, "iPhone SE"],
  [375, 667, "iPhone 8"],
  [390, 844, "iPhone 14"],
  [414, 896, "iPhone 11 Pro Max"],
  [768, 1024, "iPad portrait"],
];

const setViewport = (w: number, h: number) => {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: w });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: h });
  window.dispatchEvent(new Event("resize"));
};

const expectNoScrollContainer = (root: HTMLElement) => {
  // The first child of the rendered route MUST be a locked-viewport shell.
  const shell = root.querySelector("div.h-\\[100dvh\\]") as HTMLElement | null;
  expect(shell, "expected outer h-[100dvh] container").not.toBeNull();
  expect(shell!.className).toContain("overflow-hidden");
  expect(shell!.className).toMatch(/flex-col|flex/);
};

describe("Auth pages — no-scroll contract", () => {
  afterEach(() => cleanup());

  for (const [w, h, name] of SIZES) {
    it(`Login locks viewport on ${name} (${w}x${h})`, () => {
      setViewport(w, h);
      const { container } = render(
        <MemoryRouter initialEntries={["/login"]}>
          <Login />
        </MemoryRouter>
      );
      expectNoScrollContainer(container);
    });

    it(`Signup locks viewport on ${name} (${w}x${h})`, () => {
      setViewport(w, h);
      const { container } = render(
        <MemoryRouter initialEntries={["/signup"]}>
          <Signup />
        </MemoryRouter>
      );
      expectNoScrollContainer(container);
    });
  }
});