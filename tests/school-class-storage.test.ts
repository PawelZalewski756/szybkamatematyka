import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  loadLearningPath,
  loadSchoolClass,
  saveLearningPath,
  saveSchoolClass,
} from "@/lib/learning-path";

function createStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
    removeItem: (key: string) => {
      data.delete(key);
    },
    clear: () => data.clear(),
    key: (index: number) => [...data.keys()][index] ?? null,
    get length() {
      return data.size;
    },
  };
}

describe("zapis klasy i poziomu", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {
      dispatchEvent: () => true,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    });
    vi.stubGlobal("localStorage", createStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("saveSchoolClass zapisuje konkretną klasę, a nie tylko poziom", () => {
    saveSchoolClass("klasa-5");

    expect(localStorage.getItem("szybka-matma-school-class")).toBe("klasa-5");
    expect(loadSchoolClass()).toBe("klasa-5");
    expect(loadLearningPath()).toBe("sp");
  });

  it("zmiana poziomu zachowuje klasę z tego samego poziomu", () => {
    saveSchoolClass("klasa-5");
    saveLearningPath("sp");

    expect(loadSchoolClass()).toBe("klasa-5");
  });

  it("zmiana poziomu ustawia domyślną klasę nowego poziomu", () => {
    saveSchoolClass("klasa-5");
    saveLearningPath("srednia");

    expect(loadLearningPath()).toBe("srednia");
    expect(loadSchoolClass()).toBe("liceum-3");
  });
});
