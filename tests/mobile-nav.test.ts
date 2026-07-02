import { getMobileActiveTab } from "@/lib/layout/mobile-nav";
import { describe, expect, it } from "vitest";

describe("getMobileActiveTab", () => {
  it("mapuje główne zakładki", () => {
    expect(getMobileActiveTab("/arkusze")).toBe("arkusze");
    expect(getMobileActiveTab("/arkusze/cke-2024")).toBe("arkusze");
    expect(getMobileActiveTab("/trening")).toBe("trening");
    expect(getMobileActiveTab("/trening/matura/algebra")).toBe("trening");
    expect(getMobileActiveTab("/profil")).toBe("profil");
    expect(getMobileActiveTab("/login")).toBe("profil");
  });

  it("mapuje sekcje gier", () => {
    expect(getMobileActiveTab("/minigry")).toBe("graj");
    expect(getMobileActiveTab("/minigry/rownania")).toBe("graj");
    expect(getMobileActiveTab("/pojedynki")).toBe("graj");
    expect(getMobileActiveTab("/wyzwania")).toBe("graj");
  });

  it("mapuje sekcje w Więcej", () => {
    expect(getMobileActiveTab("/")).toBe("wiecej");
    expect(getMobileActiveTab("/baza-zadan")).toBe("wiecej");
    expect(getMobileActiveTab("/powtorki")).toBe("wiecej");
    expect(getMobileActiveTab("/rankingi")).toBe("wiecej");
    expect(getMobileActiveTab("/cennik")).toBe("wiecej");
  });
});
