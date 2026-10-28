import { describe, expect, it } from "vitest";
import { getTaskById, pickNextRandomTask } from "@/lib/baza-zadan/catalog";
describe("pickNextRandomTask", () => {
  it("zwraca inne zadanie niż bieżące", () => {
    const current = getTaskById("st-001");
    expect(current).toBeTruthy();
    if (!current) return;

    const next = pickNextRandomTask(current, "srednia", () => false);
    expect(next).not.toBeNull();
    expect(next!.id).not.toBe(current.id);
  });

  it("woli nierozwiązane, gdy są dostępne", () => {
    const current = getTaskById("st-001");
    expect(current).toBeTruthy();
    if (!current) return;

    const solvedOnlyCurrent = (id: string) => id === current.id;
    const next = pickNextRandomTask(current, "srednia", solvedOnlyCurrent);
    expect(next).not.toBeNull();
    if (!next) return;
    expect(solvedOnlyCurrent(next.id)).toBe(false);
  });
});
