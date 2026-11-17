import katex from "katex";
import { describe, expect, it } from "vitest";
import { KATEX_MACROS } from "@/lib/math/katex-macros";

function render(tex: string): string {
  return katex.renderToString(tex, {
    macros: KATEX_MACROS,
    throwOnError: true,
    strict: "ignore",
  });
}

describe("makra KaTeX", () => {
  it("definiuje warianty skreślenia używane w teorii", () => {
    expect(Object.keys(KATEX_MACROS).sort()).toEqual([
      "\\bcancel",
      "\\cancel",
      "\\sout",
      "\\xcancel",
    ]);
  });

  it("nie rzuca błędu Undefined control sequence dla \\cancel", () => {
    expect(() =>
      render("\\frac{\\cancel{6}}{\\cancel{8}}=\\frac{3}{4}"),
    ).not.toThrow();
  });

  it("zachowuje treść mimo braku skreślenia", () => {
    const html = render("\\cancel{6}");

    expect(html).toContain("6");
    expect(html).not.toContain("Undefined control sequence");
  });

  it("renderuje \\bcancel, \\xcancel i \\sout", () => {
    expect(render("\\bcancel{5}")).toContain("5");
    expect(render("\\xcancel{7}")).toContain("7");
    expect(render("\\sout{9}")).toContain("9");
  });

  it("nie zmienia zwykłych wzorów", () => {
    const html = render("x^2+2x+1=(x+1)^2");

    expect(html).toContain("katex");
  });

  it("nie wywraca się na nieznanej komendzie (throwOnError=false w aplikacji)", () => {
    const html = katex.renderToString("\\nieznana{1}", {
      macros: KATEX_MACROS,
      throwOnError: false,
      strict: "ignore",
    });

    expect(html).toContain("katex");
  });
});
