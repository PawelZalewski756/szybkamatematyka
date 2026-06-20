import { describe, it, expect } from "vitest";
import { formatCompactXp } from "@/lib/format/compact-number";

describe("formatCompactXp", () => {
  it("zawsze dopisuje sufiks ' XP'", () => {
    expect(formatCompactXp(0).endsWith(" XP")).toBe(true);
    expect(formatCompactXp(1234).endsWith(" XP")).toBe(true);
  });

  it("małe liczby wyświetla bez skrótu", () => {
    expect(formatCompactXp(5)).toBe("5 XP");
    expect(formatCompactXp(0)).toBe("0 XP");
  });

  it("duże liczby skraca (notacja compact pl-PL)", () => {
    const formatted = formatCompactXp(1500);
    // notacja compact nie zawiera pełnych czterech cyfr "1500"
    expect(formatted).not.toContain("1500");
    expect(formatted).toContain("XP");
  });
});
